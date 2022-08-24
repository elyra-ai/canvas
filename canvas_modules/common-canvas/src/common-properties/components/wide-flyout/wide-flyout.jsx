/*
 * Copyright 2017-2022 Elyra Authors
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
		this.state = {
			style: {
				height: 0
			}
		};
		this.updateDimensions = this.updateDimensions.bind(this);
	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
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
			<div className="properties-wf-modal" ref={ (ref) => (this.wideFlyout = ref) }>
				<Portal node={this.commonPropertiesParent}>
					{ overlay }
					<div className={classNames("properties-wf-content", { "show": this.props.show, "properties-light-disabled": !this.props.light })} style={this.state.style}>
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
