/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import PropertiesButtons from "./properties-buttons.jsx";

export default class PropertiesDialog extends Component {

	render() {
		const modalClassName = "modal__container";

		const buttons = (<PropertiesButtons
			okHandler={this.props.okHandler}
			cancelHandler={this.props.cancelHandler}
			showPropertiesButtons={this.props.showPropertiesButtons}
		/>);

		return (
			<Modal className="ap-container"
				show
				keyboard
				backdrop="static"
				onHide={this.props.cancelHandler}
				bsSize={this.props.bsSize}
				children={this.props.children}
			>
				<div className={modalClassName}>
					<div className="modal-title"
						style={{ "paddingBottom": "10px" }}
					>
						<h2>
							<div>{this.props.title}</div>
						</h2>
					</div>
					<div className="modal-children">
						{this.props.children}
					</div>
					{buttons}
				</div>
			</Modal>
		);
	}
}

PropertiesDialog.propTypes = {
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	bsSize: PropTypes.string,
	title: PropTypes.string,
	children: PropTypes.element,
	showPropertiesButtons: PropTypes.bool
};
