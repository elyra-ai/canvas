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
import Button from "carbon-components-react/lib/components/Button";
import classNames from "classnames";

import { MESSAGE_KEYS_DEFAULTS } from "./../../constants/constants";


export default class PropertiesButtons extends Component {

	render() {
		const applyButtonLabel = (typeof this.props.applyLabel === "undefined") ? MESSAGE_KEYS_DEFAULTS.APPLYBUTTON_LABEL : this.props.applyLabel;
		const rejectButtonLabel = (typeof this.props.rejectLabel === "undefined") ? MESSAGE_KEYS_DEFAULTS.REJECTBUTTON_LABEL : this.props.rejectLabel;

		let rejectButton;
		if (this.props.cancelHandler) {
			rejectButton = (
				<Button
					data-id="properties-cancel-button"
					className="properties-cancel-button"
					type="button"
					small
					kind="secondary"
					onClick={this.props.cancelHandler}
				>
					{rejectButtonLabel}
				</Button>
			);
		}
		const applyButton = (
			<Button
				data-id="properties-apply-button"
				className="properties-apply-button"
				type="button"
				small
				onClick={this.props.okHandler}
			>
				{applyButtonLabel}
			</Button>
		);

		return (
			<div
				className={classNames("properties-modal-buttons", { "hide": (typeof (this.props.showPropertiesButtons) !== "undefined" &&
					!this.props.showPropertiesButtons) })}
			>
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
