/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import PropertiesButtons from "./components/properties-buttons";
import PropertiesMain from "./properties-main";
import PropertiesModal from "./components/properties-modal";
import ValidationMessage from "./components/validation-message";
import PropertyUtils from "./util/property-utils";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, CONDITION_RETURN_VALUE_HANDLING } from "./constants/constants";

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
				customConditionOps={this.props.customConditionOps}
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
			text: PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_UNEXPECTED_MESSAGE, MESSAGE_KEYS_DEFAULTS.PROPERTIES_UNEXPECTED_MESSAGE),
			type: "error"
		};
		const errorHeading = (
			<div className="properties-error-heading">
				<ValidationMessage messageInfo={errorInfo} />
			</div>
		);
		let errorMessage;
		const supportMessage = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_SUPPORT_MESSAGE, MESSAGE_KEYS_DEFAULTS.PROPERTIES_SUPPORT_MESSAGE);
		const closeText = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_CLOSEBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.PROPERTIESEDIT_CLOSEBUTTON_LABEL);
		const closeFunction = this.props.callbacks.closePropertiesDialog;
		const revertText = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_REVERTBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.PROPERTIESEDIT_REVERTBUTTON_LABEL);
		const revertFunction = this.revertState;
		let closeAndRevertContainer;
		if (this.props.propertiesConfig.containerType === "Custom") { // Right flyout view or Custom
			if (this.propertiesMainHasMounted === true) {
				errorMessage = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_REVERT_MESSAGE, MESSAGE_KEYS_DEFAULTS.PROPERTIES_REVERT_MESSAGE);
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
				errorMessage = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_CLOSE_MESSAGE, MESSAGE_KEYS_DEFAULTS.PROPERTIES_CLOSE_MESSAGE);
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
					<div className="properties-wrapper properties-right-flyout properties-small">
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
					</div>
				);
			}
			return ( // Non Right Flyout Custom
				<div className="properties-wrapper properties-custom-container">
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
				</div>
			);
		}
		// Modal View
		if (this.propertiesMainHasMounted === true) { // Revert and Close Button
			errorMessage = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_REVERT_MESSAGE, MESSAGE_KEYS_DEFAULTS.PROPERTIES_REVERT_MESSAGE);
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
			errorMessage = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_CLOSE_MESSAGE, MESSAGE_KEYS_DEFAULTS.PROPERTIES_CLOSE_MESSAGE);
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
		rightFlyout: PropTypes.bool,
		containerType: PropTypes.string,
		enableResize: PropTypes.bool,
		conditionReturnValueHandling: PropTypes.string
	}),
	callbacks: PropTypes.shape({
		controllerHandler: PropTypes.func,
		propertyListener: PropTypes.func,
		actionHandler: PropTypes.func,
		closePropertiesDialog: PropTypes.func,
		applyPropertyChanges: PropTypes.func,
		helpClickHandler: PropTypes.func,
	}),
	customPanels: PropTypes.array,
	customControls: PropTypes.array,
	customConditionOps: PropTypes.array,
	intl: PropTypes.object.isRequired
};

CommonProperties.defaultProps = {
	propertiesConfig: {
		containerType: "Custom",
		rightFlyout: true,
		applyOnBlur: false,
		enableResize: true,
		conditionReturnValueHandling: CONDITION_RETURN_VALUE_HANDLING.VALUE
	},
	callbacks: {
	},
};

export default injectIntl(CommonProperties, { forwardRef: true });
