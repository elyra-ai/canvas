/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/lib/Modal";
import PropertiesButtons from "./../properties-buttons";

export default class WideFlyout extends Component {
	constructor(props) {
		super(props);
		this.state = {
			flyoutStyle: {}
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
		const propertiesContainer = document.getElementById("common-properties-right-flyout-panel");
		if (propertiesContainer !== null) {
			const canvasRect = propertiesContainer.getBoundingClientRect();
			this.setState({
				flyoutStyle: {
					height: (canvasRect.height + "px"),
					top: (canvasRect.top + "px")
				}
			});
		}
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
			applyLabel={this.props.applyLabel}
			rejectLabel={this.props.rejectLabel}
		/>);
		return (<Modal className="rightside-modal-container" style={this.state.flyoutStyle}
			show={this.props.show}
			keyboard
			backdrop="static"
		>
			{title}
			<div className="rightside-modal-control-contents-container">
				<div className="control-contents">{this.props.children}</div>
			</div>
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
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	title: PropTypes.string
};

WideFlyout.defaultProps = {
	show: false
};
