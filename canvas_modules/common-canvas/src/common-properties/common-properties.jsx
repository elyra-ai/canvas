/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import PropertiesModal from "./components/properties-modal";
import PropertiesEditor from "./components/properties-editor";
import PropertiesButtons from "./components/properties-buttons";
import EditorForm from "./components/editor-form";
import Form from "./form/Form";
import CommonPropertiesAction from "./../command-actions/commonPropertiesAction";
import PropertiesController from "./properties-controller";
import logger from "../../utils/logger";
import PropertyUtils from "./util/property-utils";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "./constants/constants";
import { Size } from "./constants/form-constants";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import pick from "lodash/pick";
import Icon from "carbon-components-react/lib/components/Icon";

import TitleEditor from "./components/title-editor";
import classNames from "classnames";

import { injectIntl, intlShape } from "react-intl";

class CommonProperties extends React.Component {
	constructor(props) {
		super(props);
		this.propertiesController = new PropertiesController();
		this.propertiesController.setCustomControls(props.customControls);
		this.propertiesController.setConditionOps(props.customConditionOps);
		this.propertiesController.setAppData(props.propertiesInfo.appData);
		this.propertiesController.setExpressionInfo(props.propertiesInfo.expressionInfo);
		this.propertiesController.setHandlers({
			controllerHandler: props.callbacks.controllerHandler,
			propertyListener: props.callbacks.propertyListener,
			actionHandler: props.callbacks.actionHandler
		});
		this.setForm(props.propertiesInfo);
		// this has to be after setForm because setForm clears all error messages.
		if (props.propertiesInfo.messages) {
			this.propertiesController.validatePropertiesValues();
		}
		this.currentParameters = this.propertiesController.getPropertyValues();
		this.propertiesController.subscribe(() => {
			this.forceUpdate();
		});
		this.state = {
			showPropertiesButtons: true,
			editorSize: this.propertiesController.getForm().editorSize
		};

		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
		this.showPropertiesButtons = this.showPropertiesButtons.bind(this);
		this.cancelHandler = this.cancelHandler.bind(this);
		this.onBlur = this.onBlur.bind(this);
	}

	componentWillReceiveProps(newProps) {
		if (newProps.propertiesInfo) {
			if (!isEqual(Object.keys(newProps.propertiesInfo), Object.keys(this.props.propertiesInfo)) ||
				(newProps.propertiesInfo.formData && !isEqual(newProps.propertiesInfo.formData, this.props.propertiesInfo.formData)) ||
				(newProps.propertiesInfo.parameterDef && !isEqual(newProps.propertiesInfo.parameterDef, this.props.propertiesInfo.parameterDef)) ||
				(newProps.propertiesInfo.appData && !isEqual(newProps.propertiesInfo.appData, this.props.propertiesInfo.appData))) {
				this.setForm(newProps.propertiesInfo);
				this.state = {
					editorSize: this.propertiesController.getForm().editorSize
				};
				this.currentParameters = this.propertiesController.getPropertyValues();
				this.propertiesController.setAppData(newProps.propertiesInfo.appData);
				this.propertiesController.setCustomControls(newProps.customControls);
				this.propertiesController.setConditionOps(newProps.customConditionOps);
				if (newProps.propertiesInfo.messages) {
					this.propertiesController.validatePropertiesValues();
				}

			}
		}
	}

	onBlur(e) {
		// apply properties when focus leave common properties.
		// subdialogs and summary panel causes focus to leave but shouldn't apply settings
		if (this.props.propertiesConfig.applyOnBlur &&
			this.commonProperties && !this.commonProperties.contains(e.relatedTarget) &&
			!this.propertiesController.isSummaryPanelShowing() && !this.propertiesController.isSubPanelsShowing()) {
			this.applyPropertiesEditing(false);
		}
	}

	setForm(propertiesInfo) {
		let formData = null;
		try {
			if (propertiesInfo.formData && Object.keys(propertiesInfo.formData).length !== 0) {
				formData = propertiesInfo.formData;
			} else if (propertiesInfo.parameterDef) {
				formData = Form.makeForm(propertiesInfo.parameterDef, !this.props.propertiesConfig.rightFlyout);
			}
			// TODO: This can be removed once the WML Play service generates datasetMetadata instead of inputDataModel
			if (formData && formData.data && formData.data.inputDataModel && !formData.data.datasetMetadata) {
				formData.data.datasetMetadata = PropertyUtils.convertInputDataModel(formData.data.inputDataModel);
			}
		} catch (error) {
			logger.error("Error generating form in common-properties: " + error);
		}
		this.propertiesController.setForm(formData, this.props.intl);
		if (formData) {
			this.originalTitle = formData.label;
			this.propertiesController.setTitle(formData.label);
		}
		// set initial values for undo
		this.initialValueInfo = { additionalInfo: { messages: [] }, undoInfo: {} };
		this.uiParameterKeys = this._getUiOnlyKeys();
		this.initialValueInfo = this._setValueInforProperties(this.initialValueInfo);
		if (propertiesInfo.messages) {
			this.initialValueInfo.additionalInfo.messages = JSON.parse(JSON.stringify(propertiesInfo.messages));
		}
		this.initialValueInfo.undoInfo.properties = this.propertiesController.getPropertyValues(); // used for undoing when node editor open
		this.initialValueInfo.undoInfo.messages = this.propertiesController.getErrorMessages(); // used for undoing when node editor open
		this.initialValueInfo.additionalInfo.title = this.propertiesController.getTitle();
	}

	_setValueInforProperties(valueInfo, filterHiddenDisabled) {
		const properties = this.propertiesController.getPropertyValues(filterHiddenDisabled);
		if (this.uiParameterKeys.length > 0) {
			valueInfo.properties = omit(properties, this.uiParameterKeys);
			valueInfo.uiProperties = pick(properties, this.uiParameterKeys);
		} else {
			valueInfo.properties = properties;
		}
		return valueInfo;
	}

	// this will return an array of control names that are ui only controls.
	_getUiOnlyKeys() {
		const uiOnlyKeys = [];
		const controls = this.propertiesController.getControls();
		if (Object.keys(controls).length > 0) {
			for (const controlKey in controls) {
				if (!controls.hasOwnProperty(controlKey)) {
					continue;
				}
				const control = controls[controlKey];
				if (control.uionly) {
					uiOnlyKeys.push(controlKey);
				}
			}
		}
		return uiOnlyKeys;
	}

	applyPropertiesEditing(closeProperties) {
		// validate all the input values.
		const previousErrorMessages = this.propertiesController.getErrorMessages();
		this.propertiesController.validatePropertiesValues();
		const newErrorMessages = this.propertiesController.getErrorMessages();

		// only save if title or parameters have changed or new error messages
		if (this.originalTitle !== this.propertiesController.getTitle() ||
				(this.currentParameters && JSON.stringify(this.currentParameters) !==
				JSON.stringify(this.propertiesController.getPropertyValues(false))) ||
				(JSON.stringify(previousErrorMessages) !== JSON.stringify(newErrorMessages))) {

			// set current values
			let valueInfo = { additionalInfo: {}, undoInfo: {} };
			valueInfo = this._setValueInforProperties(valueInfo, true);
			valueInfo.undoInfo.properties = this.propertiesController.getPropertyValues();
			const errorMessages = this.propertiesController.getErrorMessages(true, true, true);
			if (errorMessages) {
				valueInfo.additionalInfo.messages = errorMessages;
			}
			valueInfo.undoInfo.messages = this.propertiesController.getErrorMessages();
			if (this.propertiesController.getTitle()) {
				valueInfo.additionalInfo.title = this.propertiesController.getTitle();
			}
			const command = new CommonPropertiesAction(valueInfo, this.initialValueInfo,
				this.props.propertiesInfo.appData, this.props.callbacks.applyPropertyChanges);
			this.propertiesController.getCommandStack().do(command);

			// if we don't close the dialog, set the currentParameters to the new parameters
			// so we don't save again unnecessarily when clicking save but no additional changes happened
			this.currentParameters = this.propertiesController.getPropertyValues();
			// reset undo values
			this.initialValueInfo = JSON.parse(JSON.stringify(valueInfo));
		}
		if (closeProperties) {
			this.cancelHandler(); // close property editor
		}
	}

	cancelHandler() {
		if (this.props.callbacks.closePropertiesDialog) {
			this.props.callbacks.closePropertiesDialog();
		}
	}

	showPropertiesButtons(state) {
		this.setState({ showPropertiesButtons: state });
	}

	resize() {
		if (this.state.editorSize === Size.SMALL) {
			this.setState({
				editorSize: Size.MEDIUM
			});
		} else {
			this.setState({
				editorSize: Size.SMALL
			});
		}
	}

	render() {
		let cancelHandler = this.cancelHandler;
		let applyLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_APPLYBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.PROPERTIESEDIT_APPLYBUTTON_LABEL);
		// when onBlur cancel shouldn't be rendered.  Update apply button text to `Close`
		if (this.props.propertiesConfig.applyOnBlur && this.props.propertiesConfig.rightFlyout) {
			applyLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_CLOSEBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.PROPERTIESEDIT_CLOSEBUTTON_LABEL);
			cancelHandler = null;
		}
		const rejectLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_REJECTBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.PROPERTIESEDIT_REJECTBUTTON_LABEL);

		const formData = this.propertiesController.getForm();
		if (formData !== null) {
			let propertiesDialog = [];
			let propertiesTitle = <div />;
			let buttonsContainer = <div />;
			let resizeBtn = null;

			if (this.props.propertiesConfig.rightFlyout) {
				propertiesTitle = (<TitleEditor
					labelEditable={formData.labelEditable}
					help={formData.help}
					controller={this.propertiesController}
					helpClickHandler={this.props.callbacks.helpClickHandler}
				/>);
				buttonsContainer = (<PropertiesButtons
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons={this.state.showPropertiesButtons}
				/>);
				if (this.props.propertiesConfig.enableResize !== false) {
					resizeBtn = (
						<button className="properties-btn-resize" onClick={this.resize.bind(this)} >
							<div>
								<Icon name={`icon--chevron--${this.state.editorSize === Size.SMALL ? "left" : "right"}`} />
							</div>
						</button>
					);
				}
			}

			const editorForm = (<EditorForm
				ref="editorForm"
				key="editor-form-key"
				controller={this.propertiesController}
				additionalComponents={this.props.propertiesInfo.additionalComponents}
				showPropertiesButtons={this.showPropertiesButtons}
				customPanels={this.props.customPanels}
				rightFlyout={this.props.propertiesConfig.rightFlyout}
			/>);

			if (this.props.propertiesConfig.containerType === "Editing") {
				propertiesDialog = (<PropertiesEditor
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					bsSize={this.state.editorSize}
					title={this.propertiesController.getTitle()}
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					showPropertiesButtons={this.state.showPropertiesButtons}
				>
					{editorForm}
				</PropertiesEditor>);
			} else if (this.props.propertiesConfig.containerType === "Custom") {
				propertiesDialog = (<div className="properties-custom-container">
					{editorForm}
				</div>);
			} else { // Modal
				propertiesDialog = (<PropertiesModal
					onHide={this.props.callbacks.closePropertiesDialog}
					title={this.propertiesController.getTitle()}
					bsSize={this.state.editorSize}
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					showPropertiesButtons={this.state.showPropertiesButtons}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
				>
					{editorForm}
				</PropertiesModal>);
			}
			const className = classNames("properties-wrapper", { "properties-right-flyout": this.props.propertiesConfig.rightFlyout }, `properties-${this.state.editorSize}`);
			return (
				<div
					ref={ (ref) => (this.commonProperties = ref) }
					className={className}
					tabIndex="0"
					onBlur={this.onBlur}
				>
					{resizeBtn}
					{propertiesTitle}
					{propertiesDialog}
					{buttonsContainer}
				</div>
			);
		}
		return <div />;
	}
}

CommonProperties.propTypes = {
	propertiesInfo: PropTypes.object.isRequired,
	propertiesConfig: PropTypes.shape({
		applyOnBlur: PropTypes.bool,
		rightFlyout: PropTypes.bool,
		containerType: PropTypes.string,
		enableResize: PropTypes.bool
	}),
	callbacks: PropTypes.shape({
		controllerHandler: PropTypes.func,
		propertyListener: PropTypes.func,
		actionHandler: PropTypes.func,
		closePropertiesDialog: PropTypes.func,
		applyPropertyChanges: PropTypes.func,
		helpClickHandler: PropTypes.func
	}),
	customPanels: PropTypes.array, // array of custom panels
	customControls: PropTypes.array, // array of custom controls
	customConditionOps: PropTypes.array, // array of custom condition ops
	intl: intlShape,
};

CommonProperties.defaultProps = {
	propertiesConfig: {
		containerType: "Custom",
		rightFlyout: true,
		applyOnBlur: false,
		enableResize: true
	},
	callbacks: {
	}
};

export default injectIntl(CommonProperties, { withRef: true });
