/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import PropertiesButtons from "../properties-buttons.jsx";

export default class WideFlyout extends Component {
	constructor(props) {
		super(props);
		this.state = {
			canvasHeight: 0
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
		const commonCanvas = document.getElementById("common-canvas");
		const canvasHeight = window.getComputedStyle(commonCanvas, null).getPropertyValue("height");
		this.setState({
			canvasHeight: canvasHeight
		});
	}

	render() {
		var title = <div />;
		if (this.props.title) {
			title = (<div className="control-title">{this.props.title}</div>);
		}
		const buttons = (<PropertiesButtons
			okHandler={this.props.okHandler}
			cancelHandler={this.props.cancelHandler}
			showPropertiesButtons={this.props.showPropertiesButtons}
		/>);
		return (<Modal className="rightside-modal-container" style={{ "height": this.state.canvasHeight }}
			show={this.props.show}
			keyboard
			backdrop="static"
		>
			{title}
			<div className="control-contents">{this.props.children}</div>
			{buttons}
		</Modal>);
	}
}

WideFlyout.propTypes = {
	children: PropTypes.element,
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	show: PropTypes.bool,
	showPropertiesButtons: PropTypes.bool,
	title: PropTypes.string
};

WideFlyout.defaultProps = {
	show: false
};
