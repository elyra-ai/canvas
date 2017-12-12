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
import CommandStack from "../command-stack/command-stack.js";
import CommonPropertiesAction from "../command-actions/commonPropertiesAction.js";
import PropertiesController from "./properties-controller";
import logger from "../../utils/logger";
import _ from "underscore";

import { TextField } from "ap-components-react/dist/ap-components-react";

import editIcon from "../../assets/images/edit.svg";

export default class CommonProperties extends React.Component {
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
		// TODO should be able to reset based on form data
		this.initialCurrentProperties = "empty";
		// TODO should be able to reset based on form data
		this.settings = { additionalInfo: {} };

		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
		this.showPropertiesButtons = this.showPropertiesButtons.bind(this);
		this.cancelHandler = this.cancelHandler.bind(this);
		this.editTitleClickHandler = this.editTitleClickHandler.bind(this);
	}
	componentWillMount() {
		this.setForm();
		this.propertiesController.setHandlers({
			controllerHandler: this.props.controllerHandler,
			propertyListener: this.props.propertyListener
		});
		if (this.propertiesInfo.messages) {
			this.setErrorMessages(this.propertiesInfo.messages);
		} else {
			this.propertiesController.setErrorMessages([]);
		}
	}

	componentWillReceiveProps(newProps) {
		if (newProps.propertiesInfo) {
			if (newProps.propertiesInfo.messages && !_.isEqual(newProps.propertiesInfo.messages, this.propertiesInfo.messages)) {
				this.propertiesInfo.messages = newProps.propertiesInfo.messages;
				this.setErrorMessages(newProps.propertiesInfo.messages);
			}
			if (!_.isEqual(Object.keys(newProps.propertiesInfo), Object.keys(this.propertiesInfo)) ||
				(newProps.propertiesInfo.formData && !_.isEqual(newProps.propertiesInfo.formData, this.propertiesInfo.formData)) ||
				(newProps.propertiesInfo.parameterDef && !_.isEqual(newProps.propertiesInfo.parameterDef, this.propertiesInfo.parameterDef))) {
				this.propertiesInfo = newProps.propertiesInfo;
				this.setForm();
			}
		}
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
		} catch (error) {
			logger.error("Error generating form in common-properties: " + error);
		}
		this.propertiesController.setForm(formData);
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

	applyPropertiesEditing() {
		this.settings.properties = this.propertiesController.getPropertyValues(true);
		const errorMessages = this.propertiesController.getErrorMessages(true);
		if (typeof errorMessages !== "undefined" && errorMessages !== null) {
			this.settings.additionalInfo.messages = errorMessages;
		}

		if (typeof this.state.title !== "undefined") {
			this.settings.additionalInfo.title = this.state.title;
		}
		// May need to close the dialog inside the callback in
		// case of validation errors
		this.props.propertiesInfo.closePropertiesDialog();
		const command = new CommonPropertiesAction(this.settings, this.initialCurrentProperties,
			this.props.propertiesInfo.appData, this.props.propertiesInfo.applyPropertyChanges);
		CommandStack.do(command);
		this.initialCurrentProperties = "empty";
	}

	cancelHandler() {
		this.initialCurrentProperties = "empty";
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
		const formData = this.propertiesController.getForm();
		if (formData !== null) {
			// console.log("formData " + JSON.stringify(formData));
			let propertiesDialog = [];

			const title = this.state.title || formData.label;
			const size = formData.editorSize;

			let propertiesTitle = <div />;
			let buttonsContainer = <div />;
			if (this.props.rightFlyout) {
				propertiesTitle = (<div id="node-title-container-right-flyout-panel">
					<div id="node-title-right-flyout-panel">
						<TextField
							id="node-title-editor-right-flyout-panel"
							value={title}
							onChange={(e) => this.setState({
								title: e.target.value
							})}
							onBlur={(e) => this.setPropertiesTitleReadOnlyMode(true)}
							onKeyPress={(e) => this._handleKeyPress(e)}
							readOnly={this.state.propertiesTitleReadOnly}
							style={this.state.propertiesTitleEditStyle}
						/>
					</div>
					<a id="title-edit-right-flyout-panel" onClick={this.editTitleClickHandler}>
						<img id="title-edit-icon-right-flyout-panel"
							src={editIcon}
						/>
					</a>
				</div>);
				buttonsContainer = (<PropertiesButtons
					okHandler={this.applyPropertiesEditing}
					cancelHandler={this.cancelHandler}
					applyLabel="Save"
					showPropertiesButtons={this.state.showPropertiesButtons}
				/>);
			}

			if (this.props.showPropertiesDialog) {
				// TODO remove this block of code
				if (this.initialCurrentProperties === "empty") {
					this.initialCurrentProperties = { additionalInfo: { messages: [] } };
					if (typeof formData.data !== "undefined" &&
						typeof formData.data.currentParameters !== "undefined") {
						this.initialCurrentProperties.properties = JSON.parse(JSON.stringify(formData.data.currentParameters));
					}

					if (this.props.propertiesInfo.messages) {
						this.settings.additionalInfo.messages = JSON.parse(JSON.stringify(this.props.propertiesInfo.messages));
						this.initialCurrentProperties.additionalInfo.messages = JSON.parse(JSON.stringify(this.props.propertiesInfo.messages));
					}
					if (title) {
						this.settings.additionalInfo.title = title;
						this.initialCurrentProperties.additionalInfo.title = title;
					}
				}
				const editorForm = (<EditorForm
					ref="editorForm"
					key="editor-form-key"
					controller={this.propertiesController}
					additionalComponents={this.props.propertiesInfo.additionalComponents}
					showPropertiesButtons={this.showPropertiesButtons}
					customPanels={this.props.customPanels}
					customContainer={this.props.containerType === "Custom"}
					rightFlyout={this.props.rightFlyout}
				/>);

				if (this.props.containerType === "Editing") {
					propertiesDialog = (<PropertiesEditing
						applyLabel={this.props.applyLabel}
						rejectLabel={this.props.rejectLabel}
						bsSize={size}
						title={title}
						okHandler={this.applyPropertiesEditing}
						cancelHandler={this.cancelHandler}
						showPropertiesButtons={this.state.showPropertiesButtons}
					>
						{editorForm}
					</PropertiesEditing>);
				} else if (this.props.containerType === "Custom") {
					propertiesDialog = (<div id="custom-container">
						{editorForm}
					</div>);
				} else { // Modal
					propertiesDialog = (<PropertiesDialog
						onHide={this.propertiesInfo.closePropertiesDialog}
						title={title}
						bsSize={size}
						okHandler={this.applyPropertiesEditing}
						cancelHandler={this.cancelHandler}
						showPropertiesButtons={this.state.showPropertiesButtons}
					>
						{editorForm}
					</PropertiesDialog>);
				}
			}

			const propertiesId = this.props.rightFlyout ? "common-properties-right-flyout-panel" : "";
			return (
				<div id={propertiesId}>
					{propertiesTitle}
					{propertiesDialog}
					{buttonsContainer}
				</div>
			);
		}
		return <div />;
	}
}

/*
CommonProperties.defaultProps = {
	useModalDialog: true
};
*/

CommonProperties.propTypes = {
	showPropertiesDialog: PropTypes.bool.isRequired,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	containerType: PropTypes.string,
	propertiesInfo: PropTypes.object.isRequired,
	customPanels: PropTypes.array, // array of custom panels
	rightFlyout: PropTypes.bool,
	controllerHandler: PropTypes.func,
	propertyListener: PropTypes.func
};
