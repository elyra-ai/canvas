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
import logger from "../../utils/logger";
import _ from "underscore";

import { TextField } from "ap-components-react/dist/ap-components-react";

import editIcon from "../../assets/images/edit.svg";

export default class CommonProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			propertiesInfo: this.props.propertiesInfo,
			showPropertiesDialog: false,
			showPropertiesButtons: true,
			nodeTitleReadOnly: true
		};
		this.settings = { additionalInfo: {} };
		this.initialCurrentProperties = "empty";
		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
		this.showPropertiesButtons = this.showPropertiesButtons.bind(this);
		this.cancelHandler = this.cancelHandler.bind(this);
		this.editTitleClickHandler = this.editTitleClickHandler.bind(this);
	}

	componentWillReceiveProps(newProps) {
		if (newProps.propertiesInfo) {
			if (newProps.propertiesInfo.formData && !_.isEqual(newProps.propertiesInfo.formData, this.state.propertiesInfo.formData)) {
				this.setState({ propertiesInfo: newProps.propertiesInfo });
			}
			if (newProps.propertiesInfo.parameterDef && !_.isEqual(newProps.propertiesInfo.parameterDef, this.state.propertiesInfo.parameterDef)) {
				this.setState({ propertiesInfo: newProps.propertiesInfo });
			}
		}
	}

	getForm() {
		let formData = {};
		if (this.state.propertiesInfo.formData && Object.keys(this.props.propertiesInfo.formData).length !== 0) {
			formData = this.state.propertiesInfo.formData;
		} else if (this.state.propertiesInfo.parameterDef) {
			formData = Form.makeForm(this.state.propertiesInfo.parameterDef);
		}
		// TODO: This can be removed once the WML Play service generates datasetMetadata instead of inputDataModel
		if (formData && formData.data && formData.data.inputDataModel && !formData.data.datasetMetadata) {
			formData.data.datasetMetadata = this.convertInputDataModel(formData.data.inputDataModel);
		}
		return formData;
	}

	setNodeTitleReadOnlyMode(mode) {
		let bottomBorderStyle = "2px solid #777677";
		if (mode) {
			bottomBorderStyle = "none";
		}
		this.setState({
			nodeTitleReadOnly: mode,
			nodeTitleEditStyle: { borderBottom: bottomBorderStyle }
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
		this.settings.properties = this.refs.editorForm.getControlValues(true);
		this.settings.additionalInfo.messages = this.refs.editorForm.getControlMessages();

		if (typeof this.state.nodeTitle !== "undefined") {
			this.settings.additionalInfo.nodeTitle = this.state.nodeTitle;
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
		this.state.propertiesInfo.closePropertiesDialog();
	}

	showPropertiesButtons(state) {
		this.setState({ showPropertiesButtons: state });
	}

	editTitleClickHandler() {
		this.setNodeTitleReadOnlyMode(false);
	}

	_handleKeyPress(e) {
		if (e.key === "Enter") {
			this.setNodeTitleReadOnlyMode(true);
		}
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

			const title = this.state.nodeTitle || formData.label;
			const size = formData.editorSize;

			let nodeTitle = <div />;
			let buttonsContainer = <div />;
			let propertiesClassname = "";
			if (this.props.rightFlyout) {
				propertiesClassname = "right-flyout-panel";
				nodeTitle = (<div id={"node-title-container-" + propertiesClassname}>
					<div id={"node-title-" + propertiesClassname}>
						<TextField
							id={"node-title-editor-" + propertiesClassname}
							value={title}
							onChange={(e) => this.setState({
								nodeTitle: e.target.value
							})}
							onBlur={(e) => this.setNodeTitleReadOnlyMode(true)}
							onKeyPress={(e) => this._handleKeyPress(e)}
							readOnly={this.state.nodeTitleReadOnly}
							style={this.state.nodeTitleEditStyle}
						/>
					</div>
					<a onClick={this.editTitleClickHandler}>
						<img id={"title-edit-icon-" + propertiesClassname}
							src={editIcon}
						/>
					</a>
				</div>);
				buttonsContainer = (<PropertiesButtons
					okHandler={this.applyPropertiesEditing}
					cancelHandler={this.cancelHandler}
					applyLabel="Save"
					showPropertiesButtons={this.state.showPropertiesButtons}
					propertiesClassname={propertiesClassname}
				/>);
			}

			if (this.props.showPropertiesDialog) {
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
						this.settings.additionalInfo.nodeTitle = title;
						this.initialCurrentProperties.additionalInfo.nodeTitle = title;
					}
				}
				const editorForm = (<EditorForm
					ref="editorForm"
					key="editor-form-key"
					form={formData}
					messages={this.props.propertiesInfo.messages}
					additionalComponents={this.props.propertiesInfo.additionalComponents}
					showPropertiesButtons={this.showPropertiesButtons}
					customPanels={this.props.customPanels}
					propertiesClassname={propertiesClassname}
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
					const customContainerId = this.props.rightFlyout ? "custom-container-" + propertiesClassname : "custom-container";
					propertiesDialog = (<div id={customContainerId}>
						{editorForm}
					</div>);
				} else { // Modal
					propertiesDialog = (<PropertiesDialog
						onHide={this.state.propertiesInfo.closePropertiesDialog}
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

			const propertiesId = this.props.rightFlyout ? "common-properties-" + propertiesClassname : "";
			return (
				<div id={propertiesId}>
					{nodeTitle}
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
	rightFlyout: PropTypes.bool
};
