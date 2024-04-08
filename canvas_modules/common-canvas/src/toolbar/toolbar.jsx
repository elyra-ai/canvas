/*
 * Copyright 2017-2024 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import ReactResizeDetector from "react-resize-detector";

import ToolbarActionItem from "./toolbar-action-item.jsx";
import ToolbarOverflowItem from "./toolbar-overflow-item.jsx";
import ToolbarDividerItem from "./toolbar-divider-item.jsx";

const ESC_KEY = 27;
const LEFT_ARROW_KEY = 37;
const RIGHT_ARROW_KEY = 39;

class Toolbar extends React.Component {
	constructor(props) {
		super(props);

		// this.state.focusAction keeps track of which item has focus.
		// This is used to ensure the focus goes to the same item that was
		// previously focused when focus was lost (blurred) from the toolbar
		// Index values (leftOverflowIndex and rightOverflowIndex) are used
		// to keep track of how the left and right bar arrays
		// should be split to be able to create the overflow menu.
		this.state = {
			focusAction: "toolbar",
			leftOverflowIndex: null,
			rightOverflowIndex: null,
		};

		// Keeps track of whether the focus is on the toolbar or not. We should
		// not call focus() on any item in the toolbar if this.isFocusInToolbar
		// is false, otherwise focus will be moved incorrectly to the toolbar
		// and away from its current location.
		this.isFocusInToolbar = false;

		// Arrays to hold the left and right bar configurations
		this.leftBar = [];
		this.rightBar = [];

		// Arrays to store references to React objects in toolbar for the
		// the left bar, right bar and current set of overflow items.
		this.leftItemRefs = [];
		this.rightItemRefs = [];
		this.overflowItemRefs = [];

		// Reference for the toolbar <div>
		this.toolbarRef = React.createRef();

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onToolbarResize = this.onToolbarResize.bind(this);
		this.setOverflowIndex = this.setOverflowIndex.bind(this);
		this.generateToolbarItems = this.generateToolbarItems.bind(this);
		this.setFocusAction = this.setFocusAction.bind(this);
		this.setFocusOnItem = this.setFocusOnItem.bind(this);
		this.closeAnyOpenSubArea = this.closeAnyOpenSubArea.bind(this);
	}

	// If, after updating, we are left in a situation where this.state.focusAction
	// is for an item that is NOT focusable, then set the focus on the first focusable
	// item. This might happen when an item with focus is activated and the action it
	// performs causes itself to become disabled. For example, if the delete item is
	// activated the selected objects are deleted and since no objects are now selected
	// the delete item (which has focus) will become disabled. It may also happen if the
	// toolbar config is updated and the current focusAction item is removed.
	componentDidUpdate() {
		const index = this.getFocusableItemRefs().findIndex((item) => this.getRefAction(item) === this.state.focusAction);
		if (index === -1) {
			this.setFocusOnFirstItem();
		}
	}

	// When the toolbar is initially focused, this.state.focusAction
	// will be set to the default of "toolbar". In that case we set the
	// focus on the first focusable toolbar item.
	onFocus(evt) {
		this.isFocusInToolbar = true;

		// If focus occurs because of a click on the toolbar body
		// (not on a button) and no button has focus move focus to
		// the first item otherwise just keep focus the same.
		if (evt.target?.classList?.contains("toolbar-div")) {
			if (this.state.focusAction === "toolbar") {
				this.setFocusOnFirstItem();


			} else {
				this.setFocusOnItem(); // Reset focus on current focusAction.
			}
		}
	}

	// When focus leaves the toolbar make sure we record it. This prevents
	// us accidentally setting focus on a toolbar item when the toolbar
	// re-renders with the focus elsewhere.
	onBlur(evt) {
		// If the focus is being moved to an object outside the toolbar div
		// we set isFocusInToolbar to false.
		if (!evt.relatedTarget?.closest(".toolbar-div")) {
			this.isFocusInToolbar = false;
		}
	}

	// This is called when the user presses a key with focus on one of the
	// toolbar items. We set the focusAction appropriately based on which
	// key is pressed.
	onKeyDown(evt) {
		if (evt.keyCode === ESC_KEY) {
			this.setFocusOnItem(); // Reset focus on current focusAction.

		} else if (evt.keyCode === LEFT_ARROW_KEY) {
			this.setFocusOnPreviousItem();

		} else if (evt.keyCode === RIGHT_ARROW_KEY) {
			this.setFocusOnNextItem();
		}
	}

	// Prevents the inline-block elements of the left bar being scrolled to
	// reveal the wrapped elements, when the user tabs through the elements.
	onScroll(evt) {
		evt.currentTarget.scroll(0, 0);
		evt.preventDefault();
	}

	// When the toolbar resizes, check each toolbar item to see if it has
	// an open sub-area and, if that item is not a focusable item, close
	// the sub-area. The item may no longer be focusable it is it was wrapped
	// into the overflow menu. Also, check to see if the current focus action
	// item is focusable and, if not, set focus on the first focusable item.
	onToolbarResize() {
		const focusableItemRefs = this.getFocusableItemRefs();
		// Note: isFocusActionFocusable needs to be calculated here before any
		// update to the toolbar caused by the code in the subsequent if ststement.
		const isFocusActionFocusable = this.isFocusActionFocusable(this.state.focusAction, focusableItemRefs);
		const refWithOpenSubArea = this.getRefWithOpenSubArea();

		if (refWithOpenSubArea) {
			const action = refWithOpenSubArea.current.getAction();
			const isFocusActionWithOpenSubAreaFocusable = this.isFocusActionFocusable(action, focusableItemRefs);

			if (!isFocusActionWithOpenSubAreaFocusable) {
				refWithOpenSubArea.current.closeSubArea();

			} else {
				// This forces a refresh that will cause the position of any
				// open sub-area to be recaulculated based on the new toolbar width.
				this.setFocusAction(this.state.focusAction);
			}
		}

		// If the focus action item is not focusable (maybe because it has been
		// moved into the overflow menu) then set focus on the first focusable item.
		if (!isFocusActionFocusable) {
			this.setFocusOnFirstItem();
		}
	}

	// Returns the ref to any item that currently has an open sub-area or null
	// if no item has an open sub-area.
	getRefWithOpenSubArea() {
		let subAreaOpenRef = this.leftItemRefs.find((ref) => ref.current.isSubAreaDisplayed());
		if (!subAreaOpenRef) {
			subAreaOpenRef = this.rightItemRefs.find((ref) => ref.current.isSubAreaDisplayed());
		}
		if (!subAreaOpenRef) {
			subAreaOpenRef = this.overflowItemRefs.find((ref) => ref.current.isSubAreaDisplayed());
		}
		return subAreaOpenRef;
	}

	// Either sets the focus on the item for the action passed in or, if
	// no action is passed in, set the focus on the current focusAction.
	// Setting the current focusAction is used to return focus back to an
	// item after focus has been moved elsewhere, such as onto a sub-menu
	// or out of the toolbar completely.
	setFocusOnItem(action) {
		const actionToSet = action || this.state.focusAction;
		const focusableItemRefs = this.getFocusableItemRefs();
		if (focusableItemRefs.length > 0) {
			this.setFocusAction(actionToSet);
		}
	}

	setFocusOnFirstItem() {
		const focusableItemRefs = this.getFocusableItemRefs();
		if (focusableItemRefs.length > 0) {
			const firstFocusAction = this.getRefAction(focusableItemRefs[0]);
			this.setFocusAction(firstFocusAction);
		}
	}

	setFocusOnPreviousItem() {
		const focusableItemRefs = this.getFocusableItemRefs();
		const previousRef = this.getPreviousItemRef(focusableItemRefs);
		if (previousRef) {
			const previousFocusAction = this.getRefAction(previousRef);
			this.setFocusAction(previousFocusAction);
		}
	}

	setFocusOnNextItem() {
		const focusableItemRefs = this.getFocusableItemRefs();
		const nextRef = this.getNextItemRef(focusableItemRefs);
		if (nextRef) {
			const nextFocusAction = this.getRefAction(nextRef);
			this.setFocusAction(nextFocusAction);
		}
	}

	setFocusAction(focusAction) {
		this.setState({ focusAction });
	}

	getPreviousItemRef(focusableItemRefs) {
		const index = focusableItemRefs.findIndex((item) => this.getRefAction(item) === this.state.focusAction);
		if (index === 0) {
			return focusableItemRefs[focusableItemRefs.length - 1];
		}
		return focusableItemRefs[index - 1];
	}

	getNextItemRef(focusableItemRefs) {
		const index = focusableItemRefs.findIndex((item) => this.getRefAction(item) === this.state.focusAction);
		if (index === focusableItemRefs.length - 1) {
			return focusableItemRefs[0];
		}
		return focusableItemRefs[index + 1];
	}

	getRefAction(ref) {
		return ref.current.getAction();
	}

	// Returns an array of references to focusable (that is enabled)
	// toolbar items that are on the top (visible) row of the toolbar.
	getFocusableItemRefs() {
		return this.getLeftBarFocusableItemRefs().concat(this.getRightBarFocusableItemRefs());
	}

	// Returns an array of references to left bar items that are
	// on the top (visible) row of the toolbar and are focusable.
	// That is, not disabled. In addition, there may also be a
	// reference to an overflow item if one is visible on the
	// top (visible) row of the toolbar.
	getLeftBarFocusableItemRefs() {
		const focusableItemRefs = [];

		if (this.leftItemRefs.length === 0) {
			return focusableItemRefs;
		}

		const topRowY = this.findToolbarTopYCoordinate();
		let overflowItemRef = null;

		for (let i = 0; i < this.leftItemRefs.length; i++) {
			const itemRect = this.leftItemRefs[i].current.getBoundingRect();

			if (itemRect.top === topRowY) {
				if (this.leftItemRefs[i].current.isEnabled()) {
					focusableItemRefs.push(this.leftItemRefs[i]);
				}

			} else if (!overflowItemRef) {
				const leftRefAction = this.getRefAction(this.leftItemRefs[i]);
				const overflowAction = this.getOverflowAction(leftRefAction);
				overflowItemRef = this.overflowItemRefs.find((oRef) => oRef.current.getAction() === overflowAction);
				if (overflowItemRef) {
					focusableItemRefs.push(overflowItemRef);
				}
			}
		}

		return focusableItemRefs;
	}

	// Returns an array of references to right bar items that are
	// on the top (visible) row of the toolbar and are focusable.
	// That is, not disabled.
	getRightBarFocusableItemRefs() {
		const focusableItemRefs = [];

		if (this.rightItemRefs === 0) {
			return focusableItemRefs;
		}

		const topRowY = this.findToolbarTopYCoordinate();

		for (let i = 0; i < this.rightItemRefs.length; i++) {
			if (this.rightItemRefs[i].current.isEnabled()) {
				const refRect = this.rightItemRefs[i].current.getBoundingRect();

				if (refRect.top === topRowY) {
					focusableItemRefs.push(this.rightItemRefs[i]);
				}
			}
		}
		return focusableItemRefs.reverse();
	}

	// Items that appear in the overflow menu need unique action names because
	// the original action item to which they are related will still exist, but
	// hidden, in the toolbar.
	getOverflowAction(action) {
		return "overflow_" + action;
	}

	// Sets two index values: one for the left bar and one for the right that
	// indicate which elements in each array should be put in the overflow menu.
	// That is, those elements that do not appear on the top (visible) row of the
	// toolbar.
	setOverflowIndex(leftIndex) {
		if (leftIndex === null) {
			this.setState({
				leftOverflowIndex: null,
				rightOverflowIndex: null
			});
		} else {
			this.setState({
				leftOverflowIndex: leftIndex,
				rightOverflowIndex: this.getRightOverflowIndex()
			});
		}
	}

	// Returns the index of the first item in the right bar that is
	// not on the top (visible) row of the toolbar.
	getRightOverflowIndex() {
		const ref = this.findFirstRightItemRefNotOnTopRow();

		const index = ref === null
			? this.rightBar.length
			: this.rightBar.findIndex((ri) => ri.action === this.getRefAction(ref));

		return index;
	}

	// Returns true of the current focus action item is one of the focusable
	// items. (It may not be if it has been placed in the overflow menu).
	isFocusActionFocusable(focusAction, focusableItemRefs) {
		const indexFocusAction = focusableItemRefs.findIndex((ref) =>
			ref.current.props.actionObj?.action === focusAction);
		return indexFocusAction > -1;
	}

	// Returns a reference to the first item that is not on the
	// top (visible) row of the toolbar.
	findFirstRightItemRefNotOnTopRow() {
		const topRowY = this.findToolbarTopYCoordinate();

		let rightItemRef = null;

		for (let i = 0; i < this.rightItemRefs.length; i++) {
			const itemRect = this.rightItemRefs[i].current.getBoundingRect();
			if (itemRect.top !== topRowY && rightItemRef === null) {
				rightItemRef = this.rightItemRefs[i];
			}
		}
		return rightItemRef;
	}

	// Returns the Y coordinate of the top of the toolbar. This is
	// used to detecg which toolbar items are on the top (visible)
	// row and which are wrapped onto other rows.
	findToolbarTopYCoordinate() {
		const rect = this.toolbarRef.current.getBoundingClientRect();
		return rect.top;
	}

	// Generates an array of toolbar items from the toolbarActions array passed in. When
	// withOverflowItem is true, which it is for the left bar, we also add an overflow item,
	// inside an overflow item container, for each left toolbar action. As the canvas is made
	// narrower the regular action items wrap onto a second (hidden) row of the toolbar and
	// the overflow item, associated with the last wrapped action item, is revealed.
	generateToolbarItems(toolbarActions, withOverflowItem, refs) {
		const newItems = [];

		for (let i = 0; i < toolbarActions.length; i++) {
			const actionObj = toolbarActions[i];
			if (actionObj) {
				if (!actionObj.divider && withOverflowItem) {
					newItems.push(this.generateOverflowItem(i, actionObj.action));
				}
				newItems.push(this.generateToolbarItem(actionObj, i, refs));
			}
		}
		return newItems;
	}

	// Returns JSX for a toolbar item based on the actionObj passed in.
	generateToolbarItem(actionObj, i, refs) {
		let jsx = null;

		if (actionObj) {
			if (actionObj.divider) {
				jsx = (
					<ToolbarDividerItem
						key={"toolbar-item-key-" + i}
						isInMenu={false}
					/>
				);
			} else {
				const ref = React.createRef();
				if (refs) {
					refs.push(ref);
				}
				jsx = (
					<ToolbarActionItem
						ref={ref}
						key={"toolbar-item-key-" + i}
						actionObj={actionObj}
						tooltipDirection={this.props.tooltipDirection}
						toolbarActionHandler={this.props.toolbarActionHandler}
						instanceId={this.props.instanceId}
						containingDivId={this.props.containingDivId}
						toolbarFocusAction={this.state.focusAction}
						setToolbarFocusAction={this.setFocusOnItem}
						isFocusInToolbar={this.isFocusInToolbar}
						closeAnyOpenSubArea={this.closeAnyOpenSubArea}
						size={this.props.size}
					/>
				);
			}
		}
		return jsx;
	}

	// Returns JSX for an overflow toolbar item based on the index and action passed in.
	generateOverflowItem(index, action) {
		const label = this.props.additionalText ? this.props.additionalText.overflowMenuLabel : "";
		const overflowAction = this.getOverflowAction(action);
		const subMenuActions = index === this.state.leftOverflowIndex ? this.createSubMenuActions() : [];

		// Create a ref for the overflow item to add to array of references to
		// all overflow items.
		const ref = React.createRef();
		this.overflowItemRefs.push(ref);

		const jsx = (
			<ToolbarOverflowItem
				ref={ref}
				key={"toolbar-overflow-item-key-" + index}
				index={index}
				action={overflowAction}
				label={label}
				size={this.props.size}
				subMenuActions={subMenuActions}
				setOverflowIndex={this.setOverflowIndex}
				toolbarActionHandler={this.props.toolbarActionHandler}
				instanceId={this.props.instanceId}
				containingDivId={this.props.containingDivId}
				toolbarFocusAction={this.state.focusAction}
				setToolbarFocusAction={this.setFocusOnItem}
				isFocusInToolbar={this.isFocusInToolbar}
				closeAnyOpenSubArea={this.closeAnyOpenSubArea}
			/>
		);

		return jsx;
	}

	// Returns an array of overflow menu actions that should be displayed in
	// the overflow menu for the overflow item indicated by the index passed in.
	// This uses this.state.leftOverflowIndex and this.state.rightOverflowIndex which are
	// set when the user clicks on a particular overflow item in the toolbar.
	createSubMenuActions() {
		let subMenuActions = [];
		const l = this.leftBar.slice(this.state.leftOverflowIndex);
		const r = this.rightBar.slice(this.state.rightOverflowIndex).reverse();
		subMenuActions = l.concat(r);

		return subMenuActions;
	}

	closeAnyOpenSubArea() {
		this.leftItemRefs.forEach((ref) => this.closeSubAreaOnRef(ref));
		this.rightItemRefs.forEach((ref) => this.closeSubAreaOnRef(ref));
		this.overflowItemRefs.forEach((ref) => this.closeOverflowMenuOnRef(ref));
	}

	closeSubAreaOnRef(ref) {
		if (ref.current.props.actionObj.setExtIsSubAreaDisplayed) {
			ref.current.props.actionObj.setExtIsSubAreaDisplayed(false);

		} else if (ref.current.state.subAreaDisplayed) {
			ref.current.closeSubArea();
		}
	}

	closeOverflowMenuOnRef(ref) {
		if (ref.current.state.showExtendedMenu) {
			ref.current.closeSubArea();
		}
	}

	render() {
		this.leftBar = this.props.config.leftBar || [];
		this.rightBar = this.props.config.rightBar || [];
		this.rightBar = [...this.rightBar].reverse() || [];

		// Arrays to store references to React objects in toolbar.
		this.leftItemRefs = [];
		this.rightItemRefs = [];
		this.overflowItemRefs = [];

		const leftItems = this.generateToolbarItems(this.leftBar, true, this.leftItemRefs);
		const rightItems = this.generateToolbarItems(this.rightBar, false, this.rightItemRefs);

		const toolbarSizeClass = this.props.size === "sm" ? "toolbar-div toolbar-size-small" : "toolbar-div";
		const tabIndex = this.state.focusAction === "toolbar" ? 0 : -1;

		const canvasToolbar = (
			<ReactResizeDetector handleWidth onResize={this.onToolbarResize}>
				<div ref={this.toolbarRef} className={toolbarSizeClass} instanceid={this.props.instanceId}
					tabIndex={tabIndex} onFocus={this.onFocus} onBlur={this.onBlur} onKeyDown={this.onKeyDown}
				>
					<div className="toolbar-left-bar" onScroll={this.onScroll}>
						{leftItems}
					</div>
					<div className="toolbar-right-bar">
						{rightItems}
					</div>
				</div>
			</ReactResizeDetector>
		);
		return canvasToolbar;
	}
}

Toolbar.propTypes = {
	config: PropTypes.object.isRequired,
	instanceId: PropTypes.number.isRequired,
	containingDivId: PropTypes.string,
	toolbarActionHandler: PropTypes.func,
	tooltipDirection: PropTypes.string,
	additionalText: PropTypes.object,
	size: PropTypes.oneOf(["md", "sm"])
};

export default Toolbar;
