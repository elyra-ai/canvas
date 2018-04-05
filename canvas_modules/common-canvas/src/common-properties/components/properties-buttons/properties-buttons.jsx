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
import Button from "ap-components-react/dist/components/Button";

import { MESSAGE_KEYS_DEFAULTS } from "./../../constants/constants";


export default class PropertiesButtons extends Component {

	render() {
		const applyButtonLabel = (typeof this.props.applyLabel === "undefined") ? MESSAGE_KEYS_DEFAULTS.APPLYBUTTON_LABEL : this.props.applyLabel;
		const rejectButtonLabel = (typeof this.props.rejectLabel === "undefined") ? MESSAGE_KEYS_DEFAULTS.REJECTBUTTON_LABEL : this.props.rejectLabel;

		let rejectButton;
		let applyButton;
		if (this.props.showPropertiesButtons !== false) {
			if (this.props.cancelHandler) {
				rejectButton = (
					<Button
						id="properties-cancel-button"
						semantic href=""
						hyperlink
						onClick={this.props.cancelHandler}
					>
						{rejectButtonLabel}
					</Button>
				);
			}
			applyButton = (
				<Button
					id="properties-apply-button"
					semantic href=""
					onClick={this.props.okHandler}
					style={{ "marginRight": "10px" }}
				>
					{applyButtonLabel}
				</Button>
			);
		}
		return (
			<div className="modal__buttons">
				{rejectButton}
				{applyButton}
			</div>
		);
	}
}

PropertiesButtons.propTypes = {
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	showPropertiesButtons: PropTypes.bool
};
