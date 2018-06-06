/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import PropertiesButtons from "./../properties-buttons";
import classNames from "classnames";

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
				title = (<h2>{this.props.title}</h2>);
			}
			buttons = (<PropertiesButtons
				okHandler={this.props.okHandler}
				cancelHandler={this.props.cancelHandler}
				showPropertiesButtons={this.props.showPropertiesButtons}
				applyLabel={this.props.applyLabel}
				rejectLabel={this.props.rejectLabel}
			/>);
			children = (<div className="properties-wf-children"> {this.props.children} </div>);
		}
		return (
			<div className="properties-wf-modal" ref={ (ref) => (this.wideFlyout = ref) }>
				{ overlay }
				<div className={classNames("properties-wf-content", { "show": this.props.show })} style={this.state.style}>
					{title}
					{children}
					{buttons}
				</div>
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
	title: PropTypes.string
};

WideFlyout.defaultProps = {
	show: false
};
