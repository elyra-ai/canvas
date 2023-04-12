/*
 * Copyright 2017-2022 Elyra Authors
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
import { CommonProperties } from "../../../../common-canvas";

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
	PARAMETER_DEFS,
	EDITOR_SIZE
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
		this.closePropertiesDialog = this.closePropertiesDialog.bind(this);

		this.onPropertiesSelect = this.onPropertiesSelect.bind(this);
		this.isReadyToSubmitProperties = this.isReadyToSubmitProperties.bind(this);
		this.isReadyToSubmitPropertiesDropdownData = this.isReadyToSubmitPropertiesDropdownData.bind(this);
		this.openPropertiesEditorDialog = this.openPropertiesEditorDialog.bind(this);
		this.getSelectedFile = this.getSelectedFile.bind(this);

		const propsInfo = {
			parameterDef: propertiesParamDef
		};

		propsInfo.parameterDef.current_parameters = {
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
			"useEditorSize": this.props.propertiesConfig.initialEditorSize,
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

		const propertiesConfig = {
			containerType: "Custom",
			rightFlyout: false,
			applyOnBlur: true
		};

		const callbacks = {
			controllerHandler: this.propertiesControllerHandler,
			propertyListener: this.propertyListener,
			actionHandler: this.propertyActionHandler,
			applyPropertyChanges: this.applyPropertyChanges,
			closePropertiesDialog: this.closePropertiesDialog
		};

		this.commonPropertiesOptions = (<CommonProperties
			propertiesInfo={propsInfo}
			propertiesConfig={propertiesConfig}
			callbacks={callbacks}
		/>);
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

	componentDidMount() {
		// const propsInfo = {
		// 	parameterDef: propertiesParamDef
		// };

		// propsInfo.parameterDef.current_parameters = {
		// 	"propertiesContainerType": this.props.propertiesConfig.propertiesContainerType,
		// 	"propertiesSchemaValidation": this.props.propertiesConfig.propertiesSchemaValidation,
		// 	"applyPropertiesWithoutEdit": this.props.propertiesConfig.applyPropertiesWithoutEdit,
		// 	"applyOnBlur": this.props.propertiesConfig.applyOnBlur,
		// 	"convertValueDataTypes": this.props.propertiesConfig.convertValueDataTypes,
		// 	"disableSaveOnRequiredErrors": this.props.propertiesConfig.disableSaveOnRequiredErrors,
		// 	"expressionBuilder": this.props.propertiesConfig.expressionBuilder,
		// 	"enablePropertiesValidationHandler": this.props.propertiesConfig.propertiesValidationHandler,
		// 	"trimSpaces": this.props.propertiesConfig.trimSpaces,
		// 	"displayAdditionalComponents": this.props.propertiesConfig.displayAdditionalComponents,
		// 	"heading": this.props.propertiesConfig.heading,
		// 	"light": this.props.propertiesConfig.light,
		// 	"showRequiredIndicator": this.props.propertiesConfig.showRequiredIndicator,
		// 	"useEditorSize": this.props.propertiesConfig.initialEditorSize,
		// 	"conditionHiddenPropertyHandling": this.props.propertiesConfig.conditionHiddenPropertyHandling,
		// 	"conditionDisabledPropertyHandling": this.props.propertiesConfig.conditionDisabledPropertyHandling,
		// 	"returnValueFiltering": this.props.propertiesConfig.returnValueFiltering,
		// 	"disableRowMoveButtonsPropertyIds": this.props.propertiesConfig.disableRowMoveButtonsPropertyIds,
		// 	"maxLengthForMultiLineControls": this.props.propertiesConfig.maxLengthForMultiLineControls,
		// 	"maxLengthForSingleLineControls": this.props.propertiesConfig.maxLengthForSingleLineControls,
		// 	"addRemoveRowsPropertyId": this.props.propertiesConfig.addRemoveRowsPropertyId,
		// 	"addRemoveRowsEnabled": this.props.propertiesConfig.addRemoveRowsEnabled,
		// 	"hideEditButtonPropertyId": this.props.propertiesConfig.hideEditButtonPropertyId,
		// 	"hideEditButton": this.props.propertiesConfig.hideEditButtonEnabled,
		// 	"tableButtonEnabledPropertyId": this.props.propertiesConfig.tableButtonEnabledPropertyId,
		// 	"tableButtonEnabledButtonId": this.props.propertiesConfig.tableButtonEnabledButtonId,
		// 	"tableButtonEnabled": this.props.propertiesConfig.tableButtonEnabled,
		// 	"staticRowsPropertyId": this.props.propertiesConfig.staticRowsPropertyId,
		// 	"staticRowsIndexes": this.props.propertiesConfig.staticRowsIndexes,
		// 	"disableWideFlyoutPrimaryButtonForPanelId": this.props.propertiesConfig.disableWideFlyoutPrimaryButtonForPanelId,
		// 	"wideFlyoutPrimaryButtonDisabled": this.props.propertiesConfig.wideFlyoutPrimaryButtonDisabled
		// };

		// const propertiesConfig = {
		// 	containerType: "Custom",
		// 	rightFlyout: true,
		// 	applyOnBlur: true,
		// 	heading: false
		// };

		// const callbacks = {
		// 	controllerHandler: this.propertiesControllerHandler,
		// 	propertyListener: this.propertyListener,
		// 	actionHandler: this.propertyActionHandler,
		// 	applyPropertyChanges: this.applyPropertyChanges,
		// 	closePropertiesDialog: this.closePropertiesDialog
		// };

		// this.commonPropertiesOptions = (<CommonProperties
		// 	propertiesInfo={propsInfo}
		// 	propertiesConfig={propertiesConfig}
		// 	callbacks={callbacks}
		// />);
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
		console.log("!!! propertyListener " + JSON.stringify(data));
		const parameter = get(data, "property.name", null);
		const value = data.value;
		switch (parameter) {
		case "propertiesContainerType": {
			this.props.propertiesConfig.usePropertiesContainerType(value);
			break;
		}
		case "propertiesSchemaValidation": {
			this.props.propertiesConfig.enablePropertiesSchemaValidation(value);
			break;
		}
		case "applyPropertiesWithoutEdit": {
			this.props.propertiesConfig.enableApplyPropertiesWithoutEdit(value);
			break;
		}
		case "applyOnBlur": {
			this.props.propertiesConfig.useApplyOnBlur(value);
			break;
		}
		case "convertValueDataTypes": {
			this.props.propertiesConfig.useConvertValueDataTypes(value);
			break;
		}
		case "disableSaveOnRequiredErrors": {
			this.props.propertiesConfig.useSaveButtonDisable(value);
			break;
		}
		case "expressionBuilder": {
			this.props.propertiesConfig.useExpressionBuilder(value);
			break;
		}
		case "enablePropertiesValidationHandler": {
			this.props.propertiesConfig.enablePropertiesValidationHandler(value);
			break;
		}
		case "trimSpaces": {
			this.props.propertiesConfig.setTrimSpaces(value);
			break;
		}
		case "displayAdditionalComponents": {
			this.props.propertiesConfig.useDisplayAdditionalComponents(value);
			break;
		}
		case "heading": {
			this.props.propertiesConfig.useHeading(value);
			break;
		}
		case "light": {
			this.props.propertiesConfig.useLightOption(value);
			break;
		}
		case "showRequiredIndicator": {
			this.props.propertiesConfig.setShowRequiredIndicator(value);
			break;
		}
		case "useEditorSize": {
			if (value === EDITOR_SIZE.UNSET) {
				this.props.propertiesConfig.useEditorSize(null);
			} else {
				this.props.propertiesConfig.useEditorSize(value);
			}
			break;
		}
		case "conditionHiddenPropertyHandling": {
			this.props.propertiesConfig.setConditionHiddenPropertyHandling(value);
			break;
		}
		case "conditionDisabledPropertyHandling": {
			this.props.propertiesConfig.setConditionDisabledPropertyHandling(value);
			break;
		}
		case "returnValueFiltering": {
			try {
				this.props.propertiesConfig.setReturnValueFiltering(JSON.parse(value));
			} catch (ex) {
				console.error(ex);
			}
			break;
		}
		case "disableRowMoveButtonsPropertyIds": {
			this.props.propertiesConfig.setDisableRowMoveButtonsPropertyIds(value);
			break;
		}
		case "maxLengthForMultiLineControls": {
			this.props.propertiesConfig.setMaxLengthForMultiLineControls(value);
			break;
		}
		case "maxLengthForSingleLineControls": {
			this.props.propertiesConfig.setMaxLengthForSingleLineControls(value);
			break;
		}
		case "addRemoveRowsPropertyId": {
			this.props.propertiesConfig.setAddRemoveRowsPropertyId(value);
			break;
		}
		case "addRemoveRowsEnabled": {
			this.props.propertiesConfig.setAddRemoveRowsEnabled(value);
			break;
		}
		case "hideEditButtonPropertyId": {
			this.props.propertiesConfig.setHideEditButtonPropertyId(value);
			break;
		}
		case "hideEditButton": {
			this.props.propertiesConfig.setHideEditButtonEnabled(value);
			break;
		}
		case "tableButtonEnabledPropertyId": {
			this.props.propertiesConfig.setTableButtonPropertyId(value);
			break;
		}
		case "tableButtonEnabledButtonId": {
			this.props.propertiesConfig.setTableButtonId(value);
			break;
		}
		case "tableButtonEnabled": {
			this.props.propertiesConfig.setTableButtonIdEnabled(value);
			break;
		}
		case "staticRowsPropertyId": {
			this.props.propertiesConfig.setStaticRowsPropertyId(value);
			break;
		}
		case "staticRowsIndexes": {
			this.props.propertiesConfig.setStaticRowsIndexes(value);
			break;
		}
		case "disableWideFlyoutPrimaryButtonForPanelId": {
			this.props.propertiesConfig.setDisableWideFlyoutPrimaryButtonForPanelId(value);
			break;
		}
		case "wideFlyoutPrimaryButtonDisabled": {
			this.props.propertiesConfig.setWideFlyoutPrimaryButtonDisabled(value);
			break;
		}
		default: {
			// no action
		}
		}
	}

	propertyActionHandler(actionId, appData, data) {
		console.log("!!! propertyActionHandler " + actionId);
		console.log("!!! propertyActionHandler " + data.actionCallback);
		const actionCallback = data.actionCallback;
		if (actionCallback) {
			this.props.propertiesConfig[actionCallback]();
		}
	}

	applyPropertyChanges(data, appData, additionalInfo, undoInfo, uiProperties) {
		// console.log("!!! applyPropertyChanges " + JSON.stringify(data));
		// No action required, everything will be handled in propertyListener as changes are made
	}

	closePropertiesDialog() {
		console.log("!!! closePropertiesDialog ");
		// TODO remove
	}

	render() {
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
				{this.commonPropertiesOptions}
			</div>
		);
	}
}

SidePanelProperties.propTypes = {
	log: PropTypes.func,
	propertiesConfig: PropTypes.shape({
		closePropertiesEditorDialog: PropTypes.func,
		openPropertiesEditorDialog: PropTypes.func,
		validateProperties: PropTypes.func,
		setPropertiesJSON: PropTypes.func,
		showPropertiesDialog: PropTypes.bool,
		usePropertiesContainerType: PropTypes.func,
		propertiesContainerType: PropTypes.string,
		closeSidePanelModal: PropTypes.func,
		applyOnBlur: PropTypes.bool,
		useApplyOnBlur: PropTypes.func,
		disableSaveOnRequiredErrors: PropTypes.bool,
		useSaveButtonDisable: PropTypes.func,
		expressionBuilder: PropTypes.bool,
		useExpressionBuilder: PropTypes.func,
		displayAdditionalComponents: PropTypes.bool,
		useDisplayAdditionalComponents: PropTypes.func,
		selectedPropertiesDropdownFile: PropTypes.string,
		selectedPropertiesFileCategory: PropTypes.string,
		fileChooserVisible: PropTypes.bool,
		setPropertiesDropdownSelect: PropTypes.func,
		heading: PropTypes.bool,
		useHeading: PropTypes.func,
		light: PropTypes.bool,
		useLightOption: PropTypes.func,
		showRequiredIndicator: PropTypes.bool,
		setShowRequiredIndicator: PropTypes.func,
		useEditorSize: PropTypes.func,
		initialEditorSize: PropTypes.string,
		trimSpaces: PropTypes.bool,
		setTrimSpaces: PropTypes.func,
		setDisableRowMoveButtonsPropertyIds: PropTypes.func,
		disableRowMoveButtonsPropertyIds: PropTypes.string,
		addRemoveRowsEnabled: PropTypes.bool,
		setAddRemoveRowsPropertyId: PropTypes.func,
		addRemoveRowsPropertyId: PropTypes.string,
		setAddRemoveRowsEnabled: PropTypes.func,
		setAddRemoveRows: PropTypes.func,
		hideEditButtonEnabled: PropTypes.bool,
		setHideEditButtonPropertyId: PropTypes.func,
		hideEditButtonPropertyId: PropTypes.string,
		setHideEditButtonEnabled: PropTypes.func,
		setHideEditButton: PropTypes.func,
		tableButtonEnabled: PropTypes.bool,
		setTableButtonPropertyId: PropTypes.func,
		tableButtonEnabledPropertyId: PropTypes.string,
		setTableButtonId: PropTypes.func,
		setTableButtonIdEnabled: PropTypes.func,
		setTableButtonEnabled: PropTypes.func,
		tableButtonEnabledButtonId: PropTypes.string,
		StaticRowsEnabled: PropTypes.bool,
		setStaticRowsPropertyId: PropTypes.func,
		staticRowsPropertyId: PropTypes.string,
		setStaticRowsIndexes: PropTypes.func,
		staticRowsIndexes: PropTypes.string,
		setStaticRows: PropTypes.func,
		setMaxLengthForMultiLineControls: PropTypes.func,
		maxLengthForMultiLineControls: PropTypes.number,
		setMaxLengthForSingleLineControls: PropTypes.func,
		maxLengthForSingleLineControls: PropTypes.number,
		enablePropertiesSchemaValidation: PropTypes.func,
		propertiesSchemaValidation: PropTypes.bool,
		enableApplyPropertiesWithoutEdit: PropTypes.func,
		applyPropertiesWithoutEdit: PropTypes.bool,
		setConditionHiddenPropertyHandling: PropTypes.func,
		conditionHiddenPropertyHandling: PropTypes.string,
		setConditionDisabledPropertyHandling: PropTypes.func,
		conditionDisabledPropertyHandling: PropTypes.string,
		setReturnValueFiltering: PropTypes.func,
		returnValueFiltering: PropTypes.string,
		enablePropertiesValidationHandler: PropTypes.func,
		propertiesValidationHandler: PropTypes.bool,
		wideFlyoutPrimaryButtonDisabled: PropTypes.bool,
		setDisableWideFlyoutPrimaryButtonForPanelId: PropTypes.func,
		disableWideFlyoutPrimaryButtonForPanelId: PropTypes.string,
		setWideFlyoutPrimaryButtonDisabled: PropTypes.func,
		disableWideFlyoutPrimaryButton: PropTypes.func,
		convertValueDataTypes: PropTypes.bool,
		useConvertValueDataTypes: PropTypes.func
	})
};
