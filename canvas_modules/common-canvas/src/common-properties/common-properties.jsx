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

import React from "react";
import PropTypes from "prop-types";
import PropertiesButtons from "./components/properties-buttons";
import PropertiesMain from "./properties-main";
import PropertiesModal from "./components/properties-modal";
import ValidationMessage from "./components/validation-message";
import { formatMessage } from "./util/property-utils";
import { MESSAGE_KEYS, DEFAULT_LOCALE, CATEGORY_VIEW } from "./constants/constants";

import { injectIntl } from "react-intl";


class CommonProperties extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			info: null,
		};
		this.createPropertiesMainComponent = this.createPropertiesMainComponent.bind(this);
		this.revertState = this.revertState.bind(this);
		this.propertiesMainHasMounted = false;
		this.setPropertiesHasMounted = this.setPropertiesHasMounted.bind(this);
		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
	}

	componentDidCatch(error, info) {
		console.error(error);
		this.setState({
			hasError: true,
			error: error,
			info: info
		});
	}

	setPropertiesHasMounted() {
		this.propertiesMainHasMounted = true;
	}

	applyPropertiesEditing(closeEditor) {
		this.PropertiesMain.applyPropertiesEditing(closeEditor);
	}

	createPropertiesMainComponent() {
		Object.assign(this.props.callbacks, { "setPropertiesHasMounted": this.setPropertiesHasMounted });
		const propertiesMain = (
			<PropertiesMain
				ref={
					(instance) => {
						this.PropertiesMain = instance;
					}
				}
				propertiesInfo={this.props.propertiesInfo}
				propertiesConfig={this.props.propertiesConfig}
				customPanels={this.props.customPanels}
				callbacks= {this.props.callbacks}
				customControls={this.props.customControls}
				customActions={this.props.customActions}
				customConditionOps={this.props.customConditionOps}
				light={this.props.light}
			/>);
		return propertiesMain;
	}

	revertState() {
		this.setState({
			hasError: false,
			error: null,
			info: null
		});
	}

	displayAppropriateUIFallback() {
		const errorInfo = {
			text: formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_UNEXPECTED_MESSAGE),
			type: "error"
		};
		const errorHeading = (
			<div className="properties-error-heading">
				<ValidationMessage messageInfo={errorInfo} />
			</div>
		);
		let errorMessage;
		const supportMessage = formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_SUPPORT_MESSAGE);
		const closeText = formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_CLOSEBUTTON_LABEL);
		const closeFunction = this.props.callbacks.closePropertiesDialog;
		const revertText = formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_REVERTBUTTON_LABEL);
		const revertFunction = this.revertState;
		const propertiesLandmarkRoleLabel = formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_ERROR_LABEL);
		let closeAndRevertContainer;
		if (this.props.propertiesConfig.containerType === "Custom") { // Right flyout view or Custom
			if (this.propertiesMainHasMounted === true) {
				errorMessage = formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_REVERT_MESSAGE);
				closeAndRevertContainer = ( // Close and Revert Button
					<div className="properties-modal-buttons">
						<PropertiesButtons
							className="properties-error-display-close-button"
							okHandler={closeFunction}
							cancelHandler={revertFunction}
							showPropertiesButtons
							applyLabel={closeText}
							rejectLabel={revertText}
						/>
					</div>
				);
			} else {
				errorMessage = formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_CLOSE_MESSAGE);
				closeAndRevertContainer = ( // Close Button only
					<div className="properties-modal-buttons">
						<PropertiesButtons
							className="properties-error-display-close-button"
							okHandler={closeFunction}
							showPropertiesButtons
							applyLabel={closeText}
						/>
					</div>
				);
			}
			if (this.props.propertiesConfig.rightFlyout) { // Right Flyout View
				return (
					<aside
						aria-label={propertiesLandmarkRoleLabel}
						role="complementary"
						className="properties-wrapper properties-right-flyout properties-small"
					>
						<div className="properties-flyout-error-container">
							{errorHeading}
							<br />
							<br />
							<div className="properties-error-content" >
								{errorMessage}
								<br />
								{supportMessage}
							</div >
						</div>
						{closeAndRevertContainer}
					</aside>
				);
			}
			return ( // Non Right Flyout Custom
				<aside
					aria-label={propertiesLandmarkRoleLabel}
					role="complementary"
					className="properties-wrapper properties-custom-container"
				>
					<div className= "properties-flyout-error-container">
						{ errorHeading }
						<br />
						<br />
						<div className="properties-error-content" >
							{errorMessage}
							<br />
							{supportMessage}
						</div >
					</div>
					{closeAndRevertContainer}
				</aside>
			);
		}
		// Modal View
		if (this.propertiesMainHasMounted === true) { // Revert and Close Button
			errorMessage = formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_REVERT_MESSAGE);
			closeAndRevertContainer = (
				<PropertiesModal
					bsSize="large"
					showPropertiesButtons
					applyLabel={closeText}
					rejectLabel={revertText}
					okHandler={closeFunction}
					cancelHandler={revertFunction}
					title ={errorHeading}
				>
					<div className="properties-modal-container properties-error-content">
						{errorMessage}
						<br />
						{supportMessage}
					</div>
				</PropertiesModal>
			);
		} else {	// Close Button Only
			errorMessage = formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_CLOSE_MESSAGE);
			closeAndRevertContainer = (
				<div className = "properties-modal-error">
					<PropertiesModal
						okHandler={closeFunction}
						bsSize="large"
						showPropertiesButtons
						applyLabel={closeText}
						rejectLabel="null"
						title ={errorHeading}
					>
						<div className="properties-modal-container properties-error-content">
							{errorMessage}
							<br />
							{supportMessage}
						</div>
					</PropertiesModal>
				</div>);
		}
		return ( // Modal flyout vew
			closeAndRevertContainer
		);
	}

	render() {
		if (this.state.hasError) {
			return this.displayAppropriateUIFallback();
		}
		return this.createPropertiesMainComponent();
	}

}

CommonProperties.propTypes = {
	propertiesInfo: PropTypes.object.isRequired,
	propertiesConfig: PropTypes.shape({
		applyOnBlur: PropTypes.bool,
		trimSpaces: PropTypes.bool,
		disableSaveOnRequiredErrors: PropTypes.bool,
		rightFlyout: PropTypes.bool,
		categoryView: PropTypes.oneOf([CATEGORY_VIEW.ACCORDIONS, CATEGORY_VIEW.TABS]),
		containerType: PropTypes.string,
		enableResize: PropTypes.bool,
		conditionReturnValueHandling: PropTypes.oneOf(["null", "value"]),
		returnValueFiltering: PropTypes.array,
		buttonLabels: PropTypes.shape({
			primary: PropTypes.string,
			secondary: PropTypes.string
		}),
		schemaValidation: PropTypes.bool,
		applyPropertiesWithoutEdit: PropTypes.bool,
		conditionHiddenPropertyHandling: PropTypes.oneOf(["null", "undefined", "value"]),
		conditionDisabledPropertyHandling: PropTypes.oneOf(["null", "undefined", "value"]),
		maxLengthForMultiLineControls: PropTypes.number,
		maxLengthForSingleLineControls: PropTypes.number,
		convertValueDataTypes: PropTypes.bool,
		showRequiredIndicator: PropTypes.bool,
		showAlertsTab: PropTypes.bool,
		locale: PropTypes.string,
		enableTanstackTable: PropTypes.bool
	}),
	callbacks: PropTypes.shape({
		controllerHandler: PropTypes.func,
		propertyListener: PropTypes.func,
		actionHandler: PropTypes.func,
		closePropertiesDialog: PropTypes.func,
		applyPropertyChanges: PropTypes.func,
		helpClickHandler: PropTypes.func,
		customHeaderHandler: PropTypes.func,
		buttonHandler: PropTypes.func,
		buttonIconHandler: PropTypes.func,
		validationHandler: PropTypes.func,
		titleChangeHandler: PropTypes.func,
		propertiesActionLabelHandler: PropTypes.func,
		tooltipLinkHandler: PropTypes.func,
		propertyIconHandler: PropTypes.func,
		filterItemsHandler: PropTypes.func
	}),
	customPanels: PropTypes.array,
	customControls: PropTypes.array,
	customActions: PropTypes.array,
	customConditionOps: PropTypes.array,
	light: PropTypes.bool,
	intl: PropTypes.object.isRequired
};

CommonProperties.defaultProps = {
	propertiesConfig: {
		containerType: "Custom",
		rightFlyout: true,
		categoryView: CATEGORY_VIEW.ACCORDIONS,
		applyOnBlur: false,
		trimSpaces: true,
		disableSaveOnRequiredErrors: false,
		enableResize: true,
		conditionReturnValueHandling: "value",
		schemaValidation: false,
		applyPropertiesWithoutEdit: false,
		maxLengthForMultiLineControls: 1024,
		maxLengthForSingleLineControls: 128,
		convertValueDataTypes: false,
		showRequiredIndicator: true,
		showAlertsTab: true,
		locale: DEFAULT_LOCALE,
		enableTanstackTable: false
	},
	callbacks: {
	},
	light: true // Enable light option by default
};

export default injectIntl(CommonProperties, { forwardRef: true });
