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
import EditorForm from "./editor-controls/editor-form.jsx";
import Form from "./form/Form";
import CommandStack from "../command-stack/command-stack.js";
import CommonPropertiesAction from "../command-actions/commonPropertiesAction.js";
import logger from "../../utils/logger";

export default class CommonProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPropertiesDialog: false,
			showPropertiesButtons: true
		};
		this.initialCurrentProperties = "empty";
		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
		this.showPropertiesButtons = this.showPropertiesButtons.bind(this);
		this.cancelHandler = this.cancelHandler.bind(this);
	}

	getForm() {
		let formData = {};
		if (this.props.propertiesInfo.formData && Object.keys(this.props.propertiesInfo.formData).length !== 0) {
			formData = this.props.propertiesInfo.formData;
		} else if (this.props.propertiesInfo.parameterDef) {
			formData = Form.makeForm(this.props.propertiesInfo.parameterDef);
		}
		// TODO: This can be removed once the WML Play service generates datasetMetadata instead of inputDataModel
		if (formData && formData.data && formData.data.inputDataModel && !formData.data.datasetMetadata) {
			formData.data.datasetMetadata = this.convertInputDataModel(formData.data.inputDataModel);
		}
		return formData;
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
		const settings = {
			properties: this.refs.editorForm.getControlValues(true),
			messages: this.refs.editorForm.getControlMessages()
		};
		// May need to close the dialog inside the callback in
		// case of validation errors
		this.props.propertiesInfo.closePropertiesDialog();
		const command = new CommonPropertiesAction(settings, this.initialCurrentProperties,
			this.props.propertiesInfo.appData, this.props.propertiesInfo.applyPropertyChanges);
		CommandStack.do(command);
		this.initialCurrentProperties = "empty";
	}

	cancelHandler() {
		this.initialCurrentProperties = "empty";
		this.props.propertiesInfo.closePropertiesDialog();
	}

	showPropertiesButtons(state) {
		this.setState({ showPropertiesButtons: state });
	}

	render() {
		let formData;
		try {
			formData = this.getForm();
		} catch (error) {
			logger.error("Error generating form in common-properties: " + error);
			formData = null;
		}
		if (formData !== null) {
			// console.log("formData " + JSON.stringify(formData));
			let propertiesDialog = [];
			if (this.props.showPropertiesDialog) {
				if (this.initialCurrentProperties === "empty") {
					const setting = {};
					if (typeof formData.data !== "undefined" &&
						typeof formData.data.currentParameters !== "undefined") {
						setting.properties = JSON.parse(JSON.stringify(formData.data.currentParameters));
					}
					if (this.props.propertiesInfo.messages) {
						setting.messages = JSON.parse(JSON.stringify(this.props.propertiesInfo.messages));
					}
					this.initialCurrentProperties = setting;
				}
				const editorForm = (<EditorForm
					ref="editorForm"
					key="editor-form-key"
					form={formData}
					messages={this.props.propertiesInfo.messages}
					additionalComponents={this.props.propertiesInfo.additionalComponents}
					showPropertiesButtons={this.showPropertiesButtons}
					customPanels={this.props.customPanels}
				/>);
				const title = formData.label;
				const size = formData.editorSize;
				if (typeof this.props.useModalDialog === "undefined" || this.props.useModalDialog) {
					propertiesDialog = (<PropertiesDialog
						onHide={this.props.propertiesInfo.closePropertiesDialog}
						title={title}
						bsSize={size}
						okHandler={this.applyPropertiesEditing}
						cancelHandler={this.cancelHandler}
						showPropertiesButtons={this.state.showPropertiesButtons}
					>
						{editorForm}
					</PropertiesDialog>);
				} else if (this.props.useOwnContainer) {
					propertiesDialog = (<div>{editorForm}</div>);
				} else {
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
				}
			}
			return (
				<div>
					{propertiesDialog}
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
	useModalDialog: PropTypes.bool,
	useOwnContainer: PropTypes.bool,
	propertiesInfo: PropTypes.object.isRequired,
	customPanels: PropTypes.array // array of custom panels
};
