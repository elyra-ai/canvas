/*
 * Copyright 2017-2019 IBM Corporation
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
