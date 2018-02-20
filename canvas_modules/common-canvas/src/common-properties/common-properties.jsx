/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import PropertiesDialog from "./properties-dialog.jsx";
import PropertiesEditing from "./properties-editing.jsx";
import PropertiesButtons from "./properties-buttons.jsx";
import EditorForm from "./editor-controls/editor-form.jsx";
import Form from "./form/Form";
import CommonPropertiesAction from "../command-actions/commonPropertiesAction";
import PropertiesController from "./properties-controller";
import logger from "../../utils/logger";
import PropertyUtils from "./util/property-utils";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "./constants/constants";
import { FLYOUT_WIDTH } from "../constants/constants";
import { Size } from "./constants/form-constants";
import isEqual from "lodash/isEqual";
import { injectIntl, intlShape } from "react-intl";


import TextField from "ap-components-react/dist/components/TextField";

import editIcon from "../../assets/images/edit.svg";

class CommonProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPropertiesDialog: false,
			showPropertiesButtons: true,
			propertiesTitleReadOnly: true
		};
		this.propertiesInfo = this.props.propertiesInfo;
		this.propertiesController = new PropertiesController();

		this.propertiesController.subscribe(() => {
			this.forceUpdate();
		});

		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
		this.showPropertiesButtons = this.showPropertiesButtons.bind(this);
		this.cancelHandler = this.cancelHandler.bind(this);
		this.editTitleClickHandler = this.editTitleClickHandler.bind(this);
		this.getEditorWidth = this.getEditorWidth.bind(this);
	}
	componentWillMount() {
		this.setForm();
		this.propertiesController.setHandlers({
			controllerHandler: this.props.controllerHandler,
			propertyListener: this.props.propertyListener,
			actionHandler: this.props.actionHandler
		});
		if (this.propertiesInfo.messages) {
			this.setErrorMessages(this.propertiesInfo.messages);
		} else {
			this.propertiesController.setErrorMessages({});
		}
		this.propertiesController.setCustomControls(this.props.customControls);
	}

	componentWillReceiveProps(newProps) {
		if (newProps.propertiesInfo) {
			if (newProps.propertiesInfo.messages && !isEqual(newProps.propertiesInfo.messages, this.propertiesInfo.messages)) {
				this.propertiesInfo.messages = newProps.propertiesInfo.messages;
				this.setErrorMessages(newProps.propertiesInfo.messages);
			}
			if (!isEqual(Object.keys(newProps.propertiesInfo), Object.keys(this.propertiesInfo)) ||
				(newProps.propertiesInfo.formData && !isEqual(newProps.propertiesInfo.formData, this.propertiesInfo.formData)) ||
				(newProps.propertiesInfo.parameterDef && !isEqual(newProps.propertiesInfo.parameterDef, this.propertiesInfo.parameterDef))) {
				this.propertiesInfo = newProps.propertiesInfo;
				this.setForm();
			}
		}
		if (newProps.forceApplyProperties) {
			this.applyPropertiesEditing(false);
		}
		this.propertiesController.setCustomControls(newProps.customControls);
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
				formData = Form.makeForm(this.propertiesInfo.parameterDef);
			}
			// TODO: This can be removed once the WML Play service generates datasetMetadata instead of inputDataModel
			if (formData && formData.data && formData.data.inputDataModel && !formData.data.datasetMetadata) {
				formData.data.datasetMetadata = this.convertInputDataModel(formData.data.inputDataModel);
			}

			// TODO: This can be removed once we no longer support a single datarecord object
			if (!Array.isArray(formData.data.datasetMetadata)) {
				formData.data.datasetMetadata = [formData.data.datasetMetadata];
			}
		} catch (error) {
			logger.error("Error generating form in common-properties: " + error);
		}
		this.propertiesController.setForm(formData);
		this.propertiesController.setAppData(this.props.propertiesInfo.appData);
		if (formData) {
			this.setState({
				title: formData.label
			});
		}
	}

	setErrorMessages(messages) {
		messages.forEach((message) => {
			this.propertiesController.updateErrorMessage({ name: message.id_ref },
				{ type: message.type, text: message.text });
		});
	}

	setPropertiesTitleReadOnlyMode(mode) {
		let bottomBorderStyle = "2px solid #777677";
		if (mode) {
			bottomBorderStyle = "none";
		}
		this.setState({
			propertiesTitleReadOnly: mode,
			propertiesTitleEditStyle: { borderBottom: bottomBorderStyle }
		});
	}

	/**
	 * Converts old style Modeler inputDataModel into newer datasetMetadata
	 */
	convertInputDataModel(dataModel) {
		const datasetMetadata = {};
		datasetMetadata.fields = [];
		if (dataModel && dataModel.columns) {
			for (const column of dataModel.columns) {
				const field = {};
				field.name = column.name;
				field.type = this.convertType(column.storage);
				field.metadata = {};
				field.metadata.description = "";
				if (column.measure) {
					field.metadata.measure = column.measure.toLowerCase();
				}
				if (column.modelingRole) {
					field.metadata.modeling_role = column.modelingRole.toLowerCase();
				}
				datasetMetadata.fields.push(field);
			}
		}
		return datasetMetadata;
	}

	/**
	 * Converts from Modeler storage to WML type.
	 */
	convertType(storage) {
		let retVal = storage.toLowerCase();
		if (storage === "Real") {
			retVal = "double";
		}
		return retVal;
	}

	applyPropertiesEditing(closeProperties) {
		const settings = { additionalInfo: {} };
		settings.properties = this.propertiesController.getPropertyValues(true);
		const errorMessages = this.propertiesController.getErrorMessages(true);
		if (errorMessages) {
			settings.additionalInfo.messages = errorMessages;
		}
		if (this.state.title) {
			settings.additionalInfo.title = this.state.title;
		}
		// set initial values for undo
		const formData = this.propertiesController.getForm();
		const initialCurrentProperties = { additionalInfo: { messages: [] } };
		if (formData && formData.data && formData.data.currentParameters) {
			initialCurrentProperties.properties = JSON.parse(JSON.stringify(formData.data.currentParameters));
		}
		if (this.props.propertiesInfo.messages) {
			initialCurrentProperties.additionalInfo.messages = JSON.parse(JSON.stringify(this.props.propertiesInfo.messages));
		}
		if (formData && formData.label) {
			initialCurrentProperties.additionalInfo.title = formData.label;
		}
		// don't closed if forceApplyProperties is set by user
		if (closeProperties) {
			// May need to close the dialog inside the callback in
			// case of validation errors.
			this.props.propertiesInfo.closePropertiesDialog();
		}
		const command = new CommonPropertiesAction(settings, initialCurrentProperties,
			this.props.propertiesInfo.appData, this.props.propertiesInfo.applyPropertyChanges);
		this.propertiesController.getCommandStack().do(command);
	}

	cancelHandler() {
		this.propertiesInfo.closePropertiesDialog();
	}

	showPropertiesButtons(state) {
		this.setState({ showPropertiesButtons: state });
	}

	editTitleClickHandler() {
		this.setPropertiesTitleReadOnlyMode(false);
	}

	_handleKeyPress(e) {
		if (e.key === "Enter") {
			this.setPropertiesTitleReadOnlyMode(true);
		}
	}

	render() {
		const applyLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_APPLYBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.PROPERTIESEDIT_APPLYBUTTON_LABEL);
		const rejectLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_REJECTBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.PROPERTIESEDIT_REJECTBUTTON_LABEL);

		const formData = this.propertiesController.getForm();
		if (formData !== null) {
			// console.log("formData " + JSON.stringify(formData));
			let propertiesDialog = [];

			const size = formData.editorSize;

			let propertiesTitle = <div />;
			let buttonsContainer = <div />;
			const propertiesTitleEdit = formData.labelEditable === false ? <div />
				: (<a id="title-edit-right-flyout-panel" onClick={this.editTitleClickHandler}>
					<img id="title-edit-icon-right-flyout-panel"
						src={editIcon}
					/>
				</a>);

			if (this.props.rightFlyout) {
				propertiesTitle = (<div id="node-title-container-right-flyout-panel">
					<div id="node-title-right-flyout-panel">
						<TextField
							id="node-title-editor-right-flyout-panel"
							value={this.state.title}
							onChange={(e) => this.setState({
								title: e.target.value
							})}
							onBlur={(e) => this.setPropertiesTitleReadOnlyMode(true)}
							onKeyPress={(e) => this._handleKeyPress(e)}
							readOnly={this.state.propertiesTitleReadOnly}
							style={this.state.propertiesTitleEditStyle}
						/>
					</div>
					{propertiesTitleEdit}
				</div>);
				buttonsContainer = (<PropertiesButtons
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={this.cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons={this.state.showPropertiesButtons}
				/>);
			}

			if (this.props.showPropertiesDialog) {
				const editorForm = (<EditorForm
					ref="editorForm"
					key="editor-form-key"
					controller={this.propertiesController}
					additionalComponents={this.props.propertiesInfo.additionalComponents}
					showPropertiesButtons={this.showPropertiesButtons}
					customPanels={this.props.customPanels}
					rightFlyout={this.props.rightFlyout}
					actionHandler={this.props.actionHandler}
				/>);

				if (this.props.containerType === "Editing") {
					propertiesDialog = (<PropertiesEditing
						applyLabel={applyLabel}
						rejectLabel={rejectLabel}
						bsSize={size}
						title={this.state.title}
						okHandler={this.applyPropertiesEditing.bind(this, true)}
						cancelHandler={this.cancelHandler}
						showPropertiesButtons={this.state.showPropertiesButtons}
					>
						{editorForm}
					</PropertiesEditing>);
				} else if (this.props.containerType === "Custom") {
					propertiesDialog = (<div className="custom-container">
						{editorForm}
					</div>);
				} else { // Modal
					propertiesDialog = (<PropertiesDialog
						onHide={this.propertiesInfo.closePropertiesDialog}
						title={this.state.title}
						bsSize={size}
						okHandler={this.applyPropertiesEditing.bind(this, true)}
						cancelHandler={this.cancelHandler}
						showPropertiesButtons={this.state.showPropertiesButtons}
						applyLabel={applyLabel}
						rejectLabel={rejectLabel}
					>
						{editorForm}
					</PropertiesDialog>);
				}
			}

			const propertiesId = this.props.rightFlyout ? "common-properties-right-flyout-panel" : "";
			const editorWidth = this.getEditorWidth();
			return (
				<div id={propertiesId} style={{ width: editorWidth + "px" }}>
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
	showPropertiesDialog: PropTypes.bool.isRequired,
	forceApplyProperties: PropTypes.bool, // used to force call to applyPropertyChanges
	containerType: PropTypes.string,
	propertiesInfo: PropTypes.object.isRequired,
	customPanels: PropTypes.array, // array of custom panels
	rightFlyout: PropTypes.bool,
	controllerHandler: PropTypes.func,
	intl: intlShape,
	propertyListener: PropTypes.func,
	actionHandler: PropTypes.func,
	customControls: PropTypes.array // array of custom controls
};

export default injectIntl(CommonProperties, { withRef: true });
