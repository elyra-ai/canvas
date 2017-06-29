/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from "react";
import PropertiesDialog from "./properties-dialog.jsx";
import PropertiesEditing from "./properties-editing.jsx";
import EditorForm from "./editor-controls/editor-form.jsx";
import Form from "./form/Form";

export default class CommonProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPropertiesDialog: false
		};
		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
	}

	getForm() {
		let formData = {};
		if (this.props.propertiesInfo.formData && Object.keys(this.props.propertiesInfo.formData).length !== 0) {
			formData = this.props.propertiesInfo.formData;
		} else if (this.props.propertiesInfo.propertyDef) {
			formData = Form.makeForm(this.props.propertiesInfo.propertyDef);
		}
		// TODO: Temporary conversion to older property set as arrays of string values
		if (formData.data && !formData.data.currentProperties && formData.data.currentParameters) {
			formData.data.currentProperties = this.parametersToProperties(formData.data.currentParameters);
		}
		// TODO: This can be removed once the WML Play service generates dtasetMetadata instead of inputDataModel
		if (formData.data && formData.data.inputDataModel && !formData.data.datasetMetadata) {
			formData.data.datasetMetadata = this.convertInputDataModel(formData.data.inputDataModel);
		}
		return formData;
	}

	/**
	 * Converts the newer style parameters definition to
	 * the older properties definition.
	 */
	parametersToProperties(currentParameters) {
		if (!currentParameters || this.toType(currentParameters) !== "object") {
			return {};
		}
		const retVal = {};
		for (const propertyName in currentParameters) {
			if (currentParameters.hasOwnProperty(propertyName)) {
				const prop = currentParameters[propertyName];
				const type = this.toType(prop);
				if (type === "string") {
					retVal[propertyName] = [prop];
				} else if (type === "array") {
					retVal[propertyName] = prop;
				} else {
					retVal[propertyName] = [prop.toString()];
				}
			}
		}
		return retVal;
	}

	/**
	 * A better type identifier than a simple 'typeOf' call:
	 * 	toType({a: 4}); //"object"
	 *	toType([1, 2, 3]); //"array"
	 *	(function() {console.log(toType(arguments))})(); //arguments
	 *	toType(new ReferenceError); //"error"
	 *	toType(new Date); //"date"
	 *	toType(/a-z/); //"regexp"
	 *	toType(Math); //"math"
	 *	toType(JSON); //"json"
	 *	toType(new Number(4)); //"number"
	 *	toType(new String("abc")); //"string"
	 *	toType(new Boolean(true)); //"boolean"
	 */
	toType(obj) {
		return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
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
					field.metadata.role = column.modelingRole.toLowerCase();
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
		const settings = this.refs.editorForm.getControlValues();
		// May need to close the dialog inside the callback in
		// case of validation errors
		this.props.propertiesInfo.closePropertiesDialog();
		this.props.propertiesInfo.applyPropertyChanges(settings, this.props.propertiesInfo.appData);
	}


	render() {
		const formData = this.getForm();
		if (formData !== null) {
			let propertiesDialog = [];
			if (this.props.showPropertiesDialog) {
				const editorForm = (<EditorForm
					ref="editorForm"
					key={Date()}
					form={formData}
					additionalComponents={this.props.propertiesInfo.additionalComponents}
				/>);
				const title = <div>{formData.label}</div>;
				const size = formData.editorSize;
				if (this.props.useModalDialog) {
					propertiesDialog = (<PropertiesDialog
						onHide={this.props.propertiesInfo.closePropertiesDialog}
						title={title}
						bsSize={size}
						okHandler={this.applyPropertiesEditing}
						cancelHandler={this.props.propertiesInfo.closePropertiesDialog}
					>
						{editorForm}
					</PropertiesDialog>);
				} else {
					propertiesDialog = (<PropertiesEditing
						applyLabel={this.props.applyLabel}
						rejectLabel={this.props.rejectLabel}
						bsSize={size}
						title={title}
						okHandler={this.applyPropertiesEditing}
						cancelHandler={this.props.propertiesInfo.closePropertiesDialog}
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

CommonProperties.defaultProps = {
	useModalDialog: true
};

CommonProperties.propTypes = {
	showPropertiesDialog: React.PropTypes.bool.isRequired,
	applyLabel: React.PropTypes.string,
	rejectLabel: React.PropTypes.string,
	useModalDialog: React.PropTypes.bool,
	propertiesInfo: React.PropTypes.object.isRequired
};
