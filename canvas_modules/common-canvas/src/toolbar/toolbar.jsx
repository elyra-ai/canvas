/*
 * Copyright 2017-2023 Elyra Authors
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

const LEFT_ARROW_KEY = 37;
const RIGHT_ARROW_KEY = 39;

class Toolbar extends React.Component {
	constructor(props) {
		super(props);

		// this.state.focusAction keeps track of which item has focus.
		// This is used to ensure the focus goes to the same item that was
		// previously focused when focus was lost (blurred) from the toolbar
		this.state = {
			focusAction: "toolbar"
		};

		// Keeps track of whether the focus is on the toolbar or not. We should
		// not call focus() on any item in the toolbar if this.isFocusInToolbar
		// is false, otherwise focus will be moved incorrectly to the toolbar
		// away from its current location.
		this.isFocusInToolbar = false;

		// Arrays to hold the left and right bar configurations
		this.leftBar = [];
		this.rightBar = [];

		// Arrays to store references to React objects in toolbar for the
		// the left bar, right bar and current set of overflow items.
		this.leftItemRefs = [];
		this.rightItemRefs = [];
		this.overflowItemRefs = [];
		this.toolbarRef = React.createRef();

		this.resizeHandler = null;
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onToolbarResize = this.onToolbarResize.bind(this);
		this.setOverflowIndex = this.setOverflowIndex.bind(this);
		this.generateSubMenuItems = this.generateSubMenuItems.bind(this);
		this.generateToolbarItems = this.generateToolbarItems.bind(this);
		this.setFocusAction = this.setFocusAction.bind(this);
		this.setResizeHandler = this.setResizeHandler.bind(this);
	}

	// If, after updating, we are left in a situation where this.state.focusAction
	// is for an item that is NOT focusable, then set the focus on the first focusable
	// item. This might happen when an item with focus is activated and the action it
	// performs causes itself to become disabled. For example, if the delete item is
	// activated the selected objects are deleted and since no objects are now selected
	// the delete item (which has focus) will become disabled.
	componentDidUpdate() {
		if (this.isFocusInToolbar) {
			const index = this.getFocusableItemRefs().findIndex((item) => this.getRefAction(item) === this.state.focusAction);
			if (index === -1) {
				this.setFocusOnFirstItem();
			}
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
				this.setFocusAction(this.state.focusAction);
			}
		}
	}

	onBlur() {
		this.isFocusInToolbar = false;
	}

	// This is called when the user presses a key with focus on one of the
	// toolbar items. We set the focusAction appropriately based on if
	// the left or right arrow key is pressed.
	onKeyDown(evt) {
		if (evt.keyCode === LEFT_ARROW_KEY) {
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

	// When the toolbar is resized we call any resizeHandler we currently have
	// This will be used to close either the overflow menu or any other
	// 'sub-area' that has been opened as a result of clicking a toolbar item.
	// (We close the menu or sub-area because it is easier than trying to move
	// it based on the new toolbar width). In additon, we move the focusAction
	// to be on the first toolbar item, because reducing the width of the toolbar
	// might make the currently focused toolbar item move into the overflow menu.
	onToolbarResize() {
		if (this.resizeHandler) {
			this.resizeHandler();
		}

		if (this.state.focusAction !== "toolbar") {
			this.setFocusOnFirstItem();
		}
	}

	// Allows the overflow item or action item to set a function that will be
	// called when the toolbar is resized. This function causes the menu that
	// is currently open to be closed.
	setResizeHandler(resizeHandler) {
		this.resizeHandler = resizeHandler;
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

	getPreviousItemRef(focusableItemRefs) {
		const index = focusableItemRefs.findIndex((item) => this.getRefAction(item) === this.state.focusAction);
		if (index > 0) {
			return focusableItemRefs[index - 1];
		}
		return null;
	}

	getNextItemRef(focusableItemRefs) {
		const index = focusableItemRefs.findIndex((item) => this.getRefAction(item) === this.state.focusAction);
		if (index < focusableItemRefs.length - 1) {
			return focusableItemRefs[index + 1];
		}
		return null;
	}

	getRefAction(ref) {
		return ref.current.getAction();
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
			this.leftOverflowIndex = null;
			this.rightOverflowIndex = null;
		} else {
			this.leftOverflowIndex = leftIndex;
			this.rightOverflowIndex = this.getRightOverflowIndex();
		}
	}

	// Returns the index of the first item in the right bar that is
	// not on the top (visible) row of the toolbar.
	getRightOverflowIndex() {
		const ref = this.findFirstRightItemRefNotOnTopRow();

		const index = ref === null
			? this.rightBar.length - 1
			: this.rightBar.findIndex((ri) => ri.action === this.getRefAction(ref));

		return index;
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

	// Generates an array of JSX objects for a sub-menu defined by the menuActions
	// parameter array.
	generateSubMenuItems(menuActions, focusAction, onKeyDown) {
		const newItems = [];

		for (let i = 0; i < menuActions.length; i++) {
			const actionObj = menuActions[i];
			if (actionObj) {
				newItems.push(this.generateToolbarItem(actionObj, i, true, focusAction, onKeyDown));
			}
		}
		return newItems;
	}

	// Generates an array of toolbar items from the toolbarActions array passed in. When
	// withOverflowItem is true, which it is for the left bar, we also add an overflow item,
	// inside an overflow item container, for each left toolbar action. As the canvas is made
	// narrower the regular action items wrap onto a second (hidden) row of the toolbar and
	// the overflow item, associated with the last wrapped action item, is revealed.
	generateToolbarItems(toolbarActions, withOverflowItem, refs) {
		const newItems = [];
		const isInMenu = false;

		for (let i = 0; i < toolbarActions.length; i++) {
			const actionObj = toolbarActions[i];
			if (actionObj) {
				if (!actionObj.divider && withOverflowItem) {
					newItems.push(this.generateOverflowItem(i, actionObj.action, this.state.focusAction));
				}
				newItems.push(this.generateToolbarItem(actionObj, i, isInMenu, this.state.focusAction, this.onKeyDown, refs));
			}
		}
		return newItems;
	}

	generateToolbarItem(actionObj, i, isInMenu, focusAction, onKeyDown, refs) {
		let jsx = null;

		if (actionObj) {
			if (actionObj.divider) {
				jsx = (
					<ToolbarDividerItem
						key={"toolbar-item-key-" + i}
						isInMenu={isInMenu}
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
						generateSubMenuItems={this.generateSubMenuItems}
						isInMenu={isInMenu}
						instanceId={this.props.instanceId}
						setResizeHandler={this.setResizeHandler}
						containingDivId={this.props.containingDivId}
						onKeyDown={onKeyDown}
						toolbarFocusAction={focusAction}
						setFocusAction={this.setFocusAction}
						isFocusInToolbar={this.isFocusInToolbar}
						size={this.props.size}
					/>
				);
			}
		}
		return jsx;
	}

	generateOverflowItem(index, action, focusAction) {
		const label = this.props.additionalText ? this.props.additionalText.overflowMenuLabel : "";
		const overflowAction = this.getOverflowAction(action);
		const ref = React.createRef();
		this.overflowItemRefs.push(ref);

		let subMenuActions = null;
		if (index === this.leftOverflowIndex) {
			const l = this.leftBar.slice(this.leftOverflowIndex);
			const r = this.rightBar.slice(this.rightOverflowIndex).reverse();
			subMenuActions = l.concat(r);
		}

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
				generateSubMenuItems={this.generateSubMenuItems}
				setResizeHandler={this.setResizeHandler}
				containingDivId={this.props.containingDivId}
				onKeyDown={this.onKeyDown}
				toolbarFocusAction={focusAction}
				setFocusAction={this.setFocusAction}
				isFocusInToolbar={this.isFocusInToolbar}
			/>
		);

		return jsx;
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
					tabIndex={tabIndex} onFocus={this.onFocus} onBlur={this.onBlur}
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
