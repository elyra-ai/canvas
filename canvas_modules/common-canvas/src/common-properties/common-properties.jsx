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
import EditorForm from "./editor-controls/editor-form.jsx";
import Form from "./form/Form";
import CommonPropertiesAction from "./../command-actions/commonPropertiesAction";
import PropertiesController from "./properties-controller";
import logger from "../../utils/logger";
import PropertyUtils from "./util/property-utils";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "./constants/constants";
import { FLYOUT_WIDTH } from "./../constants/constants";
import { Size } from "./constants/form-constants";
import isEqual from "lodash/isEqual";
import TitleEditor from "./components/title-editor";

import { injectIntl, intlShape } from "react-intl";

class CommonProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPropertiesButtons: true
		};
		this.propertiesInfo = this.props.propertiesInfo;
		this.propertiesController = new PropertiesController();

		this.propertiesController.subscribe(() => {
			this.forceUpdate();
		});

		this.currentParameters = null;
		// values used for undo/redo

		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
		this.showPropertiesButtons = this.showPropertiesButtons.bind(this);
		this.cancelHandler = this.cancelHandler.bind(this);
		this.getEditorWidth = this.getEditorWidth.bind(this);
		this.onBlur = this.onBlur.bind(this);
	}
	componentWillMount() {
		this.setForm();
		this.propertiesController.setHandlers({
			controllerHandler: this.props.callbacks.controllerHandler,
			propertyListener: this.props.callbacks.propertyListener,
			actionHandler: this.props.callbacks.actionHandler
		});
		this.propertiesController.setPipelineErrorMessages(this.propertiesInfo.messages);
		this.propertiesController.setCustomControls(this.props.customControls);
	}

	componentDidMount() {
		this.currentParameters = this.propertiesController.getPropertyValues();
	}

	componentWillReceiveProps(newProps) {
		if (newProps.propertiesInfo) {
			if (!isEqual(Object.keys(newProps.propertiesInfo), Object.keys(this.propertiesInfo)) ||
				(newProps.propertiesInfo.formData && !isEqual(newProps.propertiesInfo.formData, this.propertiesInfo.formData)) ||
				(newProps.propertiesInfo.parameterDef && !isEqual(newProps.propertiesInfo.parameterDef, this.propertiesInfo.parameterDef))) {
				this.propertiesInfo = newProps.propertiesInfo;
				this.setForm();
				this.currentParameters = null;
				this.propertiesController.setPipelineErrorMessages(this.propertiesInfo.messages);
				this.propertiesController.setAppData(this.propertiesInfo.appData);
				this.propertiesController.setCustomControls(this.props.customControls);
			}
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (!this.currentParameters) {
			this.currentParameters = this.propertiesController.getPropertyValues();
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

	getEditorWidth() {
		const editorSize = this.propertiesController.getForm().editorSize;
		let width = FLYOUT_WIDTH.SMALL;
		if (editorSize === Size.MEDIUM) {
			width = FLYOUT_WIDTH.MEDIUM;
		} else if (editorSize === Size.LARGE) {
			width = FLYOUT_WIDTH.LARGE;
		}
		return width;
	}

	setForm() {
		let formData = null;
		try {
			if (this.propertiesInfo.formData && Object.keys(this.propertiesInfo.formData).length !== 0) {
				formData = this.propertiesInfo.formData;
			} else if (this.propertiesInfo.parameterDef) {
				formData = Form.makeForm(this.propertiesInfo.parameterDef, !this.props.propertiesConfig.rightFlyout);
			}
			// TODO: This can be removed once the WML Play service generates datasetMetadata instead of inputDataModel
			if (formData && formData.data && formData.data.inputDataModel && !formData.data.datasetMetadata) {
				formData.data.datasetMetadata = PropertyUtils.convertInputDataModel(formData.data.inputDataModel);
			}
		} catch (error) {
			logger.error("Error generating form in common-properties: " + error);
		}
		this.propertiesController.setForm(formData);
		if (formData) {
			this.originalTitle = formData.label;
			this.propertiesController.setTitle(formData.label);
		}
		// set initial values for undo
		this.initialValueInfo = { additionalInfo: { messages: [] }, undoInfo: {} };
		if (formData && formData.data && formData.data.currentParameters) {
			this.initialValueInfo.properties = JSON.parse(JSON.stringify(formData.data.currentParameters));
		}
		if (this.propertiesInfo.messages) {
			this.initialValueInfo.additionalInfo.messages = JSON.parse(JSON.stringify(this.propertiesInfo.messages));
		}
		this.initialValueInfo.undoInfo.properties = this.propertiesController.getPropertyValues(); // used for undoing when node editor open
		this.initialValueInfo.undoInfo.messages = this.propertiesController.getErrorMessages(); // used for undoing when node editor open
		this.initialValueInfo.additionalInfo.title = this.propertiesController.getTitle();
	}

	applyPropertiesEditing(closeProperties) {
		// only save if title or parameters have changed
		if (this.originalTitle !== this.propertiesController.getTitle() ||
				(this.currentParameters && JSON.stringify(this.currentParameters) !==
				JSON.stringify(this.propertiesController.getPropertyValues(false)))) {

			// set current values
			const valueInfo = { additionalInfo: {}, undoInfo: {} };
			valueInfo.properties = this.propertiesController.getPropertyValues(true);
			valueInfo.undoInfo.properties = this.propertiesController.getPropertyValues();
			const errorMessages = this.propertiesController.getErrorMessages(true);
			if (errorMessages) {
				valueInfo.additionalInfo.messages = errorMessages;
			}
			valueInfo.undoInfo.messages = this.propertiesController.getErrorMessages();
			if (this.propertiesController.getTitle()) {
				valueInfo.additionalInfo.title = this.propertiesController.getTitle();
			}
			const command = new CommonPropertiesAction(valueInfo, this.initialValueInfo,
				this.propertiesInfo.appData, this.props.callbacks.applyPropertyChanges);
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

			const size = formData.editorSize;

			let propertiesTitle = <div />;
			let buttonsContainer = <div />;

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
			}

			const editorForm = (<EditorForm
				ref="editorForm"
				key="editor-form-key"
				controller={this.propertiesController}
				additionalComponents={this.propertiesInfo.additionalComponents}
				showPropertiesButtons={this.showPropertiesButtons}
				customPanels={this.props.customPanels}
				rightFlyout={this.props.propertiesConfig.rightFlyout}
			/>);

			if (this.props.propertiesConfig.containerType === "Editing") {
				propertiesDialog = (<PropertiesEditor
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					bsSize={size}
					title={this.propertiesController.getTitle()}
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					showPropertiesButtons={this.state.showPropertiesButtons}
				>
					{editorForm}
				</PropertiesEditor>);
			} else if (this.props.propertiesConfig.containerType === "Custom") {
				propertiesDialog = (<div className="custom-container">
					{editorForm}
				</div>);
			} else { // Modal
				propertiesDialog = (<PropertiesModal
					onHide={this.props.callbacks.closePropertiesDialog}
					title={this.propertiesController.getTitle()}
					bsSize={size}
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					showPropertiesButtons={this.state.showPropertiesButtons}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
				>
					{editorForm}
				</PropertiesModal>);
			}
			const propertiesId = this.props.propertiesConfig.rightFlyout ? "common-properties-right-flyout-panel" : "";
			const editorWidth = this.getEditorWidth();
			return (
				<div
					ref={ (ref) => (this.commonProperties = ref) }
					id={propertiesId}
					style={{ width: editorWidth + "px" }}
					tabIndex="0"
					onBlur={this.onBlur}
				>
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
		containerType: PropTypes.string
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
	intl: intlShape,
};

CommonProperties.defaultProps = {
	propertiesConfig: {
		containerType: "Custom",
		rightFlyout: true,
		applyOnBlur: false
	},
	callbacks: {
	}
};

export default injectIntl(CommonProperties, { withRef: true });
