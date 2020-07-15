/*
 * Copyright 2017-2020 IBM Corporation
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
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import { Button } from "carbon-components-react";
import classNames from "classnames";
import defaultMessages from "../../../../locales/common-properties/locales/en.json";


class PropertiesButtons extends Component {

	render() {
		const applyButtonLabel = (typeof this.props.applyLabel === "undefined")
			? this.props.intl.formatMessage({ id: "propertiesEdit.applyButton.label", defaultMessage: defaultMessages["propertiesEdit.applyButton.label"] })
			: this.props.applyLabel;
		const rejectButtonLabel = (typeof this.props.rejectLabel === "undefined")
			? this.props.intl.formatMessage({ id: "propertiesEdit.rejectButton.label", defaultMessage: defaultMessages["propertiesEdit.rejectButton.label"] })
			: this.props.rejectLabel;

		let rejectButton;
		if (this.props.cancelHandler) {
			rejectButton = (
				<Button
					data-id="properties-cancel-button"
					className="properties-cancel-button"
					type="button"
					size="small"
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
				size="small"
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
	intl: PropTypes.object.isRequired,
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	showPropertiesButtons: PropTypes.bool
};

export default injectIntl(PropertiesButtons);
