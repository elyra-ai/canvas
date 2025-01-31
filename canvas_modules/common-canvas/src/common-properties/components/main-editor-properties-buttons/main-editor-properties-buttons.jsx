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
import PropTypes from "prop-types";
import { connect } from "react-redux";
import PropertiesButtons from "../properties-buttons";


class MainEditorPropertiesButtons extends Component {

	shouldEnabledSaveButton() {
		if (this.props.saveButtonEnabled) {
			if (this.props.disableSaveOnRequiredErrors) {
				// Return false if any required fields are not filled in
				return Object.keys(this.props.requiredErrorMessages).length === 0;
			}
			return true;
		}
		return false;
	}

	render() {
		const saveButtonEnabled = this.shouldEnabledSaveButton();
		return (<PropertiesButtons
			okHandler={this.props.okHandler}
			cancelHandler={this.props.cancelHandler}
			applyLabel={this.props.applyLabel}
			rejectLabel={this.props.rejectLabel}
			showPropertiesButtons={this.props.showPropertiesButtons}
			applyButtonEnabled={saveButtonEnabled}
		/>);
	}
}

MainEditorPropertiesButtons.propTypes = {
	controller: PropTypes.object.isRequired,
	okHandler: PropTypes.func,
	cancelHandler: PropTypes.func,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	showPropertiesButtons: PropTypes.bool,
	disableSaveOnRequiredErrors: PropTypes.bool,
	saveButtonEnabled: PropTypes.bool, // pass in by redux
	requiredErrorMessages: PropTypes.object // pass in by redux
};

MainEditorPropertiesButtons.defaultProps = {
	saveButtonEnabled: true
};

const mapStateToProps = (state, ownProps) => ({
	saveButtonEnabled: !ownProps.controller?.getSaveButtonDisable(),
	requiredErrorMessages: ownProps.controller?.getRequiredErrorMessages()
});

export default connect(mapStateToProps, null)(MainEditorPropertiesButtons);
