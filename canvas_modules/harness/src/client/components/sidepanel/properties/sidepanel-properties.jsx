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

/* global FileReader: true */
/* eslint no-undef: "error" */
/* eslint-disable complexity */

import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { get } from "lodash";
import { CommonProperties } from "common-canvas"; // eslint-disable-line import/no-unresolved

import propertiesParamDef from "./sidepanel-properties-param-def.json";

import {
	FileUploader,
	Button,
	Select,
	SelectItemGroup,
	SelectItem,
} from "carbon-components-react";

import {
	CHOOSE_FROM_LOCATION,
	LOCAL_FILE_OPTION,
	FORMS,
	PARAMETER_DEFS
} from "../../../constants/constants.js";

import FormsService from "../../../services/FormsService";

export default class SidePanelProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			commonProperties: "",
			commonPropertiesFormsFiles: [],
			commonPropertiesParamDefsFiles: []
		};

		this.propertiesControllerHandler = this.propertiesControllerHandler.bind(this);
		this.propertyListener = this.propertyListener.bind(this);
		this.propertyActionHandler = this.propertyActionHandler.bind(this);
		this.applyPropertyChanges = this.applyPropertyChanges.bind(this);

		this.onPropertiesSelect = this.onPropertiesSelect.bind(this);
		this.isReadyToSubmitProperties = this.isReadyToSubmitProperties.bind(this);
		this.isReadyToSubmitPropertiesDropdownData = this.isReadyToSubmitPropertiesDropdownData.bind(this);
		this.openPropertiesEditorDialog = this.openPropertiesEditorDialog.bind(this);
		this.getSelectedFile = this.getSelectedFile.bind(this);

		this.propsInfo = {
			parameterDef: propertiesParamDef
		};

		this.propsInfo.parameterDef.current_parameters = {
			"propertiesContainerType": this.props.propertiesConfig.propertiesContainerType,
			"propertiesSchemaValidation": this.props.propertiesConfig.propertiesSchemaValidation,
			"applyPropertiesWithoutEdit": this.props.propertiesConfig.applyPropertiesWithoutEdit,
			"applyOnBlur": this.props.propertiesConfig.applyOnBlur,
			"convertValueDataTypes": this.props.propertiesConfig.convertValueDataTypes,
			"disableSaveOnRequiredErrors": this.props.propertiesConfig.disableSaveOnRequiredErrors,
			"expressionBuilder": this.props.propertiesConfig.expressionBuilder,
			"enablePropertiesValidationHandler": this.props.propertiesConfig.propertiesValidationHandler,
			"trimSpaces": this.props.propertiesConfig.trimSpaces,
			"displayAdditionalComponents": this.props.propertiesConfig.displayAdditionalComponents,
			"heading": this.props.propertiesConfig.heading,
			"light": this.props.propertiesConfig.light,
			"showRequiredIndicator": this.props.propertiesConfig.showRequiredIndicator,
			"initialEditorSize": this.props.propertiesConfig.initialEditorSize,
			"conditionHiddenPropertyHandling": this.props.propertiesConfig.conditionHiddenPropertyHandling,
			"conditionDisabledPropertyHandling": this.props.propertiesConfig.conditionDisabledPropertyHandling,
			"returnValueFiltering": this.props.propertiesConfig.returnValueFiltering,
			"disableRowMoveButtonsPropertyIds": this.props.propertiesConfig.disableRowMoveButtonsPropertyIds,
			"maxLengthForMultiLineControls": this.props.propertiesConfig.maxLengthForMultiLineControls,
			"maxLengthForSingleLineControls": this.props.propertiesConfig.maxLengthForSingleLineControls,
			"addRemoveRowsPropertyId": this.props.propertiesConfig.addRemoveRowsPropertyId,
			"addRemoveRowsEnabled": this.props.propertiesConfig.addRemoveRowsEnabled,
			"hideEditButtonPropertyId": this.props.propertiesConfig.hideEditButtonPropertyId,
			"hideEditButton": this.props.propertiesConfig.hideEditButtonEnabled,
			"tableButtonEnabledPropertyId": this.props.propertiesConfig.tableButtonEnabledPropertyId,
			"tableButtonEnabledButtonId": this.props.propertiesConfig.tableButtonEnabledButtonId,
			"tableButtonEnabled": this.props.propertiesConfig.tableButtonEnabled,
			"staticRowsPropertyId": this.props.propertiesConfig.staticRowsPropertyId,
			"staticRowsIndexes": this.props.propertiesConfig.staticRowsIndexes,
			"disableWideFlyoutPrimaryButtonForPanelId": this.props.propertiesConfig.disableWideFlyoutPrimaryButtonForPanelId,
			"wideFlyoutPrimaryButtonDisabled": this.props.propertiesConfig.wideFlyoutPrimaryButtonDisabled
		};

		this.commonPropertiesConfig = {
			containerType: "Custom",
			rightFlyout: true,
			applyOnBlur: true,
			enableResize: false
		};

		this.callbacks = {
			controllerHandler: this.propertiesControllerHandler,
			propertyListener: this.propertyListener,
			actionHandler: this.propertyActionHandler,
			applyPropertyChanges: this.applyPropertyChanges
		};
	}
	// should be changed to componentDidMount but causes FVT tests to fail
	UNSAFE_componentWillMount() { // eslint-disable-line camelcase, react/sort-comp
		const that = this;
		FormsService.getFiles(FORMS)
			.then(function(res) {
				that.setState({ commonPropertiesFormsFiles: res });
			});
		FormsService.getFiles(PARAMETER_DEFS)
			.then(function(res) {
				that.setState({ commonPropertiesParamDefsFiles: res });
			});
	}

	onDropdownSelect(evt) {
		this.props.propertiesConfig.setPropertiesDropdownSelect(
			evt.target.selectedOptions[0].value, evt.target.selectedOptions[0].parentElement.label);
	}

	onPropertiesSelect(evt) {
		this.setState({ commonProperties: "" });
		if (evt.target.files.length > 0) {
			const filename = evt.target.files[0].name;
			const fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({
					commonProperties: evt.target.files[0],
				});
				this.props.log("Common Properties JSON file selected", filename);
			}
		}
	}

	getSelectedFile() {
		const that = this;
		this.props.log("Submit common properties file", this.props.propertiesConfig.selectedPropertiesDropdownFile);
		if (this.props.propertiesConfig.selectedPropertiesFileCategory === PARAMETER_DEFS) {
			FormsService.getFileContent(PARAMETER_DEFS, this.props.propertiesConfig.selectedPropertiesDropdownFile)
				.then(function(res) {
					that.props.propertiesConfig.setPropertiesJSON(res);
				});
		} else {
			FormsService.getFileContent(FORMS, this.props.propertiesConfig.selectedPropertiesDropdownFile)
				.then(function(res) {
					that.props.propertiesConfig.setPropertiesJSON(res);
				});
		}
	}

	submitProperties() {
		if (this.state.commonProperties.name) {
			this.props.log("Submit common properties file", this.state.commonProperties.name);
			// read file
			const fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var fileContent = fileReader.result;
				var content = JSON.parse(fileContent);
				this.props.propertiesConfig.setPropertiesJSON(content);
			}.bind(this);
			fileReader.readAsText(this.state.commonProperties);
		} else {
			this.getSelectedFile();
		}
		this.props.propertiesConfig.closeSidePanelModal();
	}

	isReadyToSubmitProperties() {
		if (this.state.commonProperties !== "" || this.isReadyToSubmitPropertiesDropdownData()) {
			return true;
		}
		return false;
	}

	isReadyToSubmitPropertiesDropdownData() {
		if (this.props.propertiesConfig.selectedPropertiesDropdownFile !== "" &&
				this.props.propertiesConfig.selectedPropertiesDropdownFile !== CHOOSE_FROM_LOCATION) {
			return true;
		}
		return false;
	}

	openPropertiesEditorDialog(changeEvent) {
		if (changeEvent.target.checked) {
			this.props.propertiesConfig.openPropertiesEditorDialog();
		} else {
			this.props.propertiesConfig.closePropertiesEditorDialog();
		}
	}

	dropdownOptions() {
		const options = [];
		let key = 1;
		const formOptions = [];
		const paramDefOptions = [];
		const choosefromlocation = [];
		options.push(<SelectItem key = "choose-an-option" text = "Choose an option..." />);
		choosefromlocation.push(
			<SelectItem key={"choose-from-location"} text = "Choose From Location" value = {CHOOSE_FROM_LOCATION} />);
		options.push(
			<SelectItemGroup key ={"choose-file-option"} label = {LOCAL_FILE_OPTION}>{choosefromlocation}
			</SelectItemGroup>);
		for (const option of this.state.commonPropertiesParamDefsFiles) {
			paramDefOptions.push(<SelectItem key={"param-def-option-" + key++} text={option} value={option} />);
		}
		options.push(
			<SelectItemGroup key ={"param-def-option"} label = {PARAMETER_DEFS}>{paramDefOptions}
			</SelectItemGroup>);
		for (const option of this.state.commonPropertiesFormsFiles) {
			formOptions.push(<SelectItem key={"form-option-" + key++} text={option} value={option} />);
		}
		options.push(<SelectItemGroup key ={"form-option"} label = {FORMS}>{formOptions}</SelectItemGroup>);
		return options;
	}

	propertiesControllerHandler(propertiesController) {
		this.propertiesController = propertiesController;
	}

	propertyListener(data) {
		const parameter = get(data, "property.name", null);
		const value = data.value;
		this.props.propertiesConfig.setPropertiesConfigOption(parameter, value);

		if (parameter === "applyOnBlur" && value === true) {
			this.propertiesController.updatePropertyValue({ name: "disableSaveOnRequiredErrors" }, false);
		}
	}

	propertyActionHandler(actionId, appData, data) {
		const actionCallback = data.actionCallback;
		if (actionCallback) {
			this.props.propertiesConfig[actionCallback]();
		}
	}

	applyPropertyChanges(data, appData, additionalInfo, undoInfo, uiProperties) {
		// No action required, everything will be handled in propertyListener as changes are made
	}

	render() {
		const commonPropertiesOptions = (<CommonProperties
			propertiesInfo={this.propsInfo}
			propertiesConfig={this.commonPropertiesConfig}
			callbacks={this.callbacks}
		/>);

		const space = (<div className="harness-sidepanel-spacer" />);
		let fileChooser = <br />;
		if (this.props.propertiesConfig.fileChooserVisible) {
			fileChooser = (<div className="harness-sidepanel-file-uploader">
				<FileUploader
					small={"true"}
					buttonLabel="Choose file"
					accept={[".json"]}
					onChange={this.onPropertiesSelect}
				/>
				{space}
			</div>);
		}

		const propertiesInput = (<div className="harness-sidepanel-children" id="harness-sidepanel-input">
			<div className="filePicker">
				<div className="harness-sidepanel-headers">
					<Link to="/properties" target="_blank">Common Properties documentation</Link>
				</div>
				<Select
					id = "common-properties-select-item"
					className = "common-properties-select-item"
					labelText="Properties"
					aria-label="Common Properties"
					onChange={this.onDropdownSelect.bind(this)}
					value={this.props.propertiesConfig.selectedPropertiesDropdownFile}
				>
					{this.dropdownOptions()}
				</Select>
				{fileChooser}
				<Button size="small"
					disabled={!this.isReadyToSubmitProperties()}
					onClick={this.submitProperties.bind(this)}
				>
					Show Properties
				</Button>
			</div>
		</div>);

		const validateProperties = (
			<div className="harness-sidepanel-children">
				<Button size="small"
					onClick={this.props.propertiesConfig.validateProperties}
				>
					Validate Properties
				</Button>
			</div>);

		const divider = (<div className="harness-sidepanel-children harness-sidepanel-divider" />);

		return (
			<div>
				{propertiesInput}
				{divider}
				{validateProperties}
				{divider}
				{commonPropertiesOptions}
			</div>
		);
	}
}

SidePanelProperties.propTypes = {
	log: PropTypes.func,
	propertiesConfig: PropTypes.shape({
		setPropertiesConfigOption: PropTypes.func,
		closePropertiesEditorDialog: PropTypes.func,
		openPropertiesEditorDialog: PropTypes.func,
		validateProperties: PropTypes.func,
		setPropertiesJSON: PropTypes.func,
		closeSidePanelModal: PropTypes.func,
		showPropertiesDialog: PropTypes.bool,
		propertiesContainerType: PropTypes.string,
		applyOnBlur: PropTypes.bool,
		trimSpaces: PropTypes.bool,
		disableSaveOnRequiredErrors: PropTypes.bool,
		expressionBuilder: PropTypes.bool,
		displayAdditionalComponents: PropTypes.bool,
		heading: PropTypes.bool,
		light: PropTypes.bool,
		showRequiredIndicator: PropTypes.bool,
		returnValueFiltering: PropTypes.string,
		initialEditorSize: PropTypes.string,
		setDisableRowMoveButtons: PropTypes.func, // action
		disableRowMoveButtonsPropertyIds: PropTypes.string,
		addRemoveRowsEnabled: PropTypes.bool,
		addRemoveRowsPropertyId: PropTypes.string,
		setAddRemoveRows: PropTypes.func, // action
		hideEditButtonEnabled: PropTypes.bool,
		hideEditButtonPropertyId: PropTypes.string,
		setHideEditButton: PropTypes.func, // action
		tableButtonEnabled: PropTypes.bool,
		tableButtonEnabledPropertyId: PropTypes.string,
		tableButtonEnabledButtonId: PropTypes.string,
		setTableButtonEnabled: PropTypes.func, // action
		staticRowsPropertyId: PropTypes.string,
		staticRowsIndexes: PropTypes.string,
		setStaticRows: PropTypes.func, // action
		maxLengthForMultiLineControls: PropTypes.number,
		maxLengthForSingleLineControls: PropTypes.number,
		selectedPropertiesDropdownFile: PropTypes.string,
		selectedPropertiesFileCategory: PropTypes.string,
		fileChooserVisible: PropTypes.bool,
		setPropertiesDropdownSelect: PropTypes.func,
		propertiesSchemaValidation: PropTypes.bool,
		applyPropertiesWithoutEdit: PropTypes.bool,
		conditionHiddenPropertyHandling: PropTypes.string,
		conditionDisabledPropertyHandling: PropTypes.string,
		propertiesValidationHandler: PropTypes.bool,
		wideFlyoutPrimaryButtonDisabled: PropTypes.bool,
		disableWideFlyoutPrimaryButtonForPanelId: PropTypes.string,
		disableWideFlyoutPrimaryButton: PropTypes.func,
		setWideFlyoutPrimaryButtonDisabled: PropTypes.func, // action
		convertValueDataTypes: PropTypes.bool
	})
};
