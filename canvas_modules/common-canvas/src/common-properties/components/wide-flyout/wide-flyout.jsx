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

import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import PropertiesButtons from "./../properties-buttons";
import classNames from "classnames";
import { Portal } from "react-portal";

export default class WideFlyout extends Component {
	constructor(props) {
		super(props);
		this.modalRef = React.createRef();
		this.state = {
			style: {
				height: 0
			}
		};
		this.updateDimensions = this.updateDimensions.bind(this);
		this.handleTabKey = this.handleTabKey.bind(this);
	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions);
		document.addEventListener("keydown", this.handleTabKey);
		this.focusOnFirstFocusable(); // Set initial focus inside the modal.
	}
	componentDidUpdate(prevProps) {
		// If modal is still open, and new item added.
		const modal = this.getActiveModal();
		if (!prevProps.show && this.props.show && modal) {
			// If focus is outside modal, move it to first focusable
			this.focusOnFirstFocusable();
			return;
		}
		if (this.props.show && modal) {
			const active = document.activeElement;
			// Restore focus if lost due to modal content changes like typing or adding new fields
			if (active === document.body || !modal.contains(active)) {
				this.focusOnFirstFocusable();
			}
		}
	}
	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
		document.removeEventListener("keydown", this.handleTabKey);
	}
	// Returns an array of focusable elements inside the modal.
	getFocusables() {
		const modal = this.getActiveModal();
		if (!modal) {
			return [];
		}
		return Array.from(
			modal.querySelectorAll(
				"button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
			)).filter((el) => el.offsetParent !== null); // Filter out hidden/disabled elements.
	}
	// Focus on the first focusable element once modal opens.
	getActiveModal() {
		const modals = Array.from(document.querySelectorAll("div[role='dialog'].properties-wf-content.show"));
		// Pick the last one — it's the top-most modal (deepest in DOM)
		return modals.length > 0 ? modals[modals.length - 1] : null;
	}
	focusOnFirstFocusable() {
		const focusables = this.getFocusables();
		if (focusables.length > 0) {
			focusables[0].focus();
		}
	}
	updateDimensions() {
		if (this.wideFlyout) {
			// used to find correct parent
			if (!this.commonPropertiesParent) {
				this.commonPropertiesParent = this.findPropertyWrapper(this.wideFlyout);
			}
			if (this.commonPropertiesParent) {
				const commonProperties = ReactDOM.findDOMNode(this.commonPropertiesParent).getBoundingClientRect();
				this.setState({
					style: {
						height: commonProperties.height + "px",
						top: commonProperties.top + "px",
					}
				});
			}
		}
	}
	findPropertyWrapper(node) {
		if (node && node.parentNode && node.parentNode.className && node.parentNode.className.includes("properties-right-flyout")) {
			return node.parentNode;
		} else if (node && node.parentNode) {
			return this.findPropertyWrapper(node.parentNode);
		}
		return null;
	}
	// Handles focus trap inside the modal when using Tab or Shift+tab key.
	handleTabKey(e) {
		if (e.key !== "Tab") {
			return;
		}
		const modal = this.getActiveModal();
		if (!modal || !this.props.show) {
			return;
		}
		const focusables = this.getFocusables();
		if (focusables.length === 0) {
			return;
		}
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement;
		// If focus is outside modal or on <body>,Then bring back to the first element inside modal.
		if (this.props.show && (!modal.contains(active) || active === document.body)) {
			e.preventDefault();
			// If "Shift+Tab" then focus should be on last element inside the modal else first.
			(e.shiftKey ? last : first).focus();
			return;
		}
		if (e.shiftKey) {
			if (active === first) {
				e.preventDefault();
				last.focus();
			}
		} else if (active === last) {
			e.preventDefault();
			first.focus();
		}
	}

	render() {
		const overlay = (<div className={classNames("properties-wf-overlay", { "show": this.props.show })} />);
		let title;
		let buttons;
		let children;
		if (this.props.show) {
			if (this.props.title) {
				title = (<div className="properties-wf-title">{this.props.title}</div>);
			}
			buttons = (<PropertiesButtons
				okHandler={this.props.okHandler}
				cancelHandler={this.props.cancelHandler}
				showPropertiesButtons={this.props.showPropertiesButtons}
				applyLabel={this.props.applyLabel}
				rejectLabel={this.props.rejectLabel}
				applyButtonEnabled={this.props.okButtonEnabled}
			/>);
			children = (<div className="properties-wf-children"> {this.props.children} </div>);
		}
		return (
			<div className="properties-wf-modal" ref={(ref) => (this.wideFlyout = ref)}>
				<Portal node={this.commonPropertiesParent}>
					{overlay}
					<div
						ref={this.modalRef}
						role="dialog"
						className={classNames("properties-wf-content", { "show": this.props.show, "properties-light-disabled": !this.props.light })}
						style={this.state.style}
					>
						{title}
						{children}
						{buttons}
					</div>
				</Portal>
			</div>
		);
	}
}

WideFlyout.propTypes = {
	children: PropTypes.element,
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	show: PropTypes.bool,
	showPropertiesButtons: PropTypes.bool,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	title: PropTypes.string,
	light: PropTypes.bool,
	okButtonEnabled: PropTypes.bool
};

WideFlyout.defaultProps = {
	show: false,
	okButtonEnabled: true
};
