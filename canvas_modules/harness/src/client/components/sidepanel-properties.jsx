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

import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
	Toggle,
	FileUploader,
	Button,
	Select,
	SelectItemGroup,
	SelectItem,
	RadioButtonGroup,
	RadioButton,
	FormGroup,
	Dropdown,
	TextInput,
	NumberInput
} from "carbon-components-react";

import {
	CHOOSE_FROM_LOCATION,
	PROPERTIES_FLYOUT,
	PROPERTIES_MODAL,
	PROPERTIES_TEARSHEET,
	LOCAL_FILE_OPTION,
	FORMS,
	PARAMETER_DEFS,
	EDITOR_SIZE
} from "../constants/constants.js";

import FormsService from "../services/FormsService";

export default class SidePanelModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			commonProperties: "",
			commonPropertiesFormsFiles: [],
			commonPropertiesParamDefsFiles: [],
			invalidPropertyId: false,
			invalidSetAddRemoveRowPropertyId: true,
			invalidSetHideEditButtonPropertyId: true,
			invalidTableButtonPropertyId: true,
			invalidSetStaticRowPropertyId: true,
			invalidSetStaticRowIndexes: true,
			invalidDisableWideFlyoutPrimaryButtonPanelId: true
		};

		this.onPropertiesSelect = this.onPropertiesSelect.bind(this);
		this.isReadyToSubmitProperties = this.isReadyToSubmitProperties.bind(this);
		this.isReadyToSubmitPropertiesDropdownData = this.isReadyToSubmitPropertiesDropdownData.bind(this);
		this.openPropertiesEditorDialog = this.openPropertiesEditorDialog.bind(this);
		this.usePropertiesContainerType = this.usePropertiesContainerType.bind(this);
		this.useApplyOnBlur = this.useApplyOnBlur.bind(this);
		this.useSaveButtonDisable = this.useSaveButtonDisable.bind(this);
		this.useExpressionBuilder = this.useExpressionBuilder.bind(this);
		this.useDisplayAdditionalComponents = this.useDisplayAdditionalComponents.bind(this);
		this.useHeading = this.useHeading.bind(this);
		this.setTrimSpaces = this.setTrimSpaces.bind(this);
		this.useLightOption = this.useLightOption.bind(this);
		this.setShowRequiredIndicator = this.setShowRequiredIndicator.bind(this);
		this.useEditorSize = this.useEditorSize.bind(this);
		this.getSelectedFile = this.getSelectedFile.bind(this);
		this.disableRowMoveButtons = this.disableRowMoveButtons.bind(this);
		this.setAddRemoveRowsPropertyId = this.setAddRemoveRowsPropertyId.bind(this);
		this.setAddRemoveRowsEnabled = this.setAddRemoveRowsEnabled.bind(this);
		this.setAddRemoveRows = this.setAddRemoveRows.bind(this);
		this.setHideEditButtonEnabled = this.setHideEditButtonEnabled.bind(this);
		this.setHideEditButton = this.setHideEditButton.bind(this);
		this.setHideEditButtonPropertyId = this.setHideEditButtonPropertyId.bind(this);
		this.setTableButtonPropertyId = this.setTableButtonPropertyId.bind(this);
		this.setTableButtonId = this.setTableButtonId.bind(this);
		this.setTableButtonIdEnabled = this.setTableButtonIdEnabled.bind(this);
		this.setTableButtonEnabled = this.setTableButtonEnabled.bind(this);
		this.setMaxLengthForMultiLineControls = this.setMaxLengthForMultiLineControls.bind(this);
		this.setMaxLengthForSingleLineControls = this.setMaxLengthForSingleLineControls.bind(this);
		this.setStaticRowsPropertyId = this.setStaticRowsPropertyId.bind(this);
		this.setStaticRowsIndexes = this.setStaticRowsIndexes.bind(this);
		this.setStaticRows = this.setStaticRows.bind(this);
		this.disableWideFlyoutPrimaryButtonForPanelId = this.disableWideFlyoutPrimaryButtonForPanelId.bind(this);
		this.setWideFlyoutPrimaryButtonDisabled = this.setWideFlyoutPrimaryButtonDisabled.bind(this);
		this.disableWideFlyoutPrimaryButton = this.disableWideFlyoutPrimaryButton.bind(this);
		this.useConvertValueDataTypes = this.useConvertValueDataTypes.bind(this);
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

	setMaxLengthForMultiLineControls(fieldName, evt) {
		const maxLengthForMultiLineControls = parseInt(evt.imaginaryTarget.value, 10);
		this.props.propertiesConfig.setMaxLengthForMultiLineControls(maxLengthForMultiLineControls);
	}

	setMaxLengthForSingleLineControls(fieldName, evt) {
		const maxLengthForSingleLineControls = parseInt(evt.imaginaryTarget.value, 10);
		this.props.propertiesConfig.setMaxLengthForSingleLineControls(maxLengthForSingleLineControls);
	}

	// Textfield to enter the propertyId for addRemoveRows
	setAddRemoveRowsPropertyId(evt) {
		try {
			const propertyId = JSON.parse(evt.target.value);
			this.props.propertiesConfig.setAddRemoveRowsPropertyId(propertyId);
			this.setState({ invalidSetAddRemoveRowPropertyId: false });
		} catch (ex) {
			this.setState({ invalidSetAddRemoveRowPropertyId: true });
		}
	}

	// Toggle to set addRemoveRows enabled or disabled
	setAddRemoveRowsEnabled(enabled) {
		this.props.propertiesConfig.setAddRemoveRowsEnabled(enabled);
	}

	// Button to submit addRemoveRows data and call propertiesController
	setAddRemoveRows(evt) {
		this.props.propertiesConfig.setAddRemoveRows();
	}

	setTrimSpaces(checked) {
		this.props.propertiesConfig.setTrimSpaces(checked);
	}

	// Textfield to enter the propertyId for hideEditButton
	setHideEditButtonPropertyId(evt) {
		try {
			const propertyId = JSON.parse(evt.target.value);
			this.props.propertiesConfig.setHideEditButtonPropertyId(propertyId);
			this.setState({ invalidSetHideEditButtonPropertyId: false });
		} catch (ex) {
			this.setState({ invalidSetHideEditButtonPropertyId: true });
		}
	}

	// Toggle to set hideEditButton enabled or disabled
	setHideEditButtonEnabled(enabled) {
		this.props.propertiesConfig.setHideEditButtonEnabled(enabled);
	}

	// Button to submit hideEditButton data and call propertiesController
	setHideEditButton(evt) {
		this.props.propertiesConfig.setHideEditButton();
	}

	// Textfield to enter the propertyId for custom table buttons
	setTableButtonPropertyId(evt) {
		try {
			const propertyId = JSON.parse(evt.target.value);
			this.props.propertiesConfig.setTableButtonPropertyId(propertyId);
			this.setState({ invalidTableButtonPropertyId: false });
		} catch (ex) {
			this.setState({ invalidTableButtonPropertyId: true });
		}
	}

	// Textfield to enter the buttonId for custom table buttons
	setTableButtonId(evt) {
		this.props.propertiesConfig.setTableButtonId(evt.target.value);
	}

	// Toggle to set addRemoveRows enabled or disabled
	setTableButtonIdEnabled(enabled) {
		this.props.propertiesConfig.setTableButtonIdEnabled(enabled);
	}

	setTableButtonEnabled() {
		this.props.propertiesConfig.setTableButtonEnabled();
	}

	// Textfield to enter the propertyId for StaticRows
	setStaticRowsPropertyId(evt) {
		try {
			const propertyId = JSON.parse(evt.target.value);
			this.props.propertiesConfig.setStaticRowsPropertyId(propertyId);
			this.setState({ invalidSetStaticRowPropertyId: false });
		} catch (ex) {
			this.setState({ invalidSetStaticRowPropertyId: true });
		}
	}

	// Textfield to set StaticRows indexes
	setStaticRowsIndexes(evt) {
		try {
			const indexes = JSON.parse(evt.target.value);
			this.props.propertiesConfig.setStaticRowsIndexes(indexes);
			this.setState({ invalidSetStaticRowIndexes: false });
		} catch (ex) {
			this.setState({ invalidSetStaticRowIndexes: true });
		}
	}

	// Button to submit StaticRows data and call propertiesController
	setStaticRows(evt) {
		this.props.propertiesConfig.setStaticRows();
	}

	// Toggle to set Ok button enabled or disabled for summary panel
	setWideFlyoutPrimaryButtonDisabled(disabled) {
		this.props.propertiesConfig.setWideFlyoutPrimaryButtonDisabled(disabled);
	}

	// Textfield to enter the summary panelId for disabling OK button in Wide Flyout panel
	disableWideFlyoutPrimaryButtonForPanelId(evt) {
		try {
			const panelId = JSON.parse(evt.target.value);
			this.props.propertiesConfig.disableWideFlyoutPrimaryButtonForPanelId(panelId);
			this.setState({ invalidDisableWideFlyoutPrimaryButtonPanelId: false });
		} catch (ex) {
			this.setState({ invalidDisableWideFlyoutPrimaryButtonPanelId: true });
		}
	}

	// Button to submit disable Ok button data and call propertiesController
	disableWideFlyoutPrimaryButton(evt) {
		this.props.propertiesConfig.disableWideFlyoutPrimaryButton();
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

	usePropertiesContainerType(value) {
		this.props.propertiesConfig.usePropertiesContainerType(value);
	}

	useApplyOnBlur(checked) {
		this.props.propertiesConfig.useApplyOnBlur(checked);
	}

	useSaveButtonDisable(disabled) {
		this.props.propertiesConfig.useSaveButtonDisable(disabled);
	}

	useExpressionBuilder(checked) {
		this.props.propertiesConfig.useExpressionBuilder(checked);
	}

	useHeading(checked) {
		this.props.propertiesConfig.useHeading(checked);
	}

	useConvertValueDataTypes(checked) {
		this.props.propertiesConfig.useConvertValueDataTypes(checked);
	}

	useLightOption(checked) {
		this.props.propertiesConfig.useLightOption(checked);
	}

	setShowRequiredIndicator(checked) {
		this.props.propertiesConfig.setShowRequiredIndicator(checked);
	}

	useEditorSize(evt) {
		// If unset is selected, don't persist editorSize
		const editorSize = evt.selectedItem.label;
		if (editorSize === EDITOR_SIZE.UNSET) {
			this.props.propertiesConfig.useEditorSize(null);
		} else {
			this.props.propertiesConfig.useEditorSize(editorSize);
		}
	}

	disableRowMoveButtons(fieldName, evt) {
		let propertyIds;
		try {
			propertyIds = JSON.parse(evt.target.value);
			this.props.propertiesConfig.disableRowMoveButtons(propertyIds);
			this.setState({ invalidPropertyId: false });
		} catch (ex) {
			this.setState({ invalidPropertyId: true });
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

	useDisplayAdditionalComponents(checked) {
		this.props.propertiesConfig.useDisplayAdditionalComponents(checked);
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

		const containerType = (<div className="harness-sidepanel-children"
			id="harness-sidepanel-properties-container-type"
		>
			<FormGroup
				legendText="Container Type"
			>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="properties-container_type_radio"
					onChange={this.usePropertiesContainerType}
					valueSelected={this.props.propertiesConfig.propertiesContainerType}
				>
					<RadioButton
						value={PROPERTIES_FLYOUT}
						labelText={PROPERTIES_FLYOUT}
					/>
					<RadioButton
						value={PROPERTIES_MODAL}
						labelText={PROPERTIES_MODAL}
					/>
					<RadioButton
						value={PROPERTIES_TEARSHEET}
						labelText={PROPERTIES_TEARSHEET}
					/>
				</RadioButtonGroup>
			</FormGroup>
		</div>);

		const validateProperties = (
			<div className="harness-sidepanel-children">
				<Button size="small"
					onClick={this.props.propertiesConfig.validateProperties}
				>
					Validate Properties
				</Button>
			</div>);

		const validateSchemaEnabled = (
			<div className="harness-sidepanel-children">
				<Toggle
					id="enable-schema-validation"
					labelText="Enable parameterDef schema validation"
					onToggle={this.props.propertiesConfig.enablePropertiesSchemaValidation}
					toggled={this.props.propertiesConfig.propertiesSchemaValidation}
				/>
			</div>);

		const applyPropertiesWithoutEdit = (
			<div className="harness-sidepanel-children">
				<Toggle
					id="enable-apply-props-without-edit"
					labelText="Apply properties without changes"
					onToggle={this.props.propertiesConfig.enableApplyPropertiesWithoutEdit}
					toggled={this.props.propertiesConfig.applyPropertiesWithoutEdit}
				/>
			</div>);

		const validationHandler = (
			<div className="harness-sidepanel-children">
				<Toggle
					id="validation-handler"
					labelText="Enable validation in expression control"
					onToggle={this.props.propertiesConfig.enablePropertiesValidationHandler}
					toggled={this.props.propertiesConfig.propertiesValidationHandler}
				/>
			</div>);

		const applyOnBlur = (
			<div className="harness-sidepanel-children">
				<Toggle
					id="harness-sidepanel-applyOnBlur-toggle"
					labelText="Apply changes on blur"
					toggled={this.props.propertiesConfig.applyOnBlur}
					onToggle={this.useApplyOnBlur}
				/>
			</div>);

		const convertValueDataTypes = (
			<div className="harness-sidepanel-children">
				<Toggle
					id="harness-sidepanel-convertValueDataTypes-toggle"
					labelText="Convert currentParameter values to data type defined in parameterDef, propertiesConfig option: 'convertValueDataTypes'"
					toggled={this.props.propertiesConfig.convertValueDataTypes}
					onToggle={this.useConvertValueDataTypes}
				/>
			</div>);

		const setSaveButtonDisable = (
			<div className="harness-sidepanel-children">
				<Toggle
					id="harness-sidepanel-setSaveButtonDisable-toggle"
					labelText="Set save button disabled if required properties is empty. Should not be enabled if 'applyOnBlur' is set to true"
					toggled={this.props.propertiesConfig.disableSaveOnRequiredErrors}
					onToggle={this.useSaveButtonDisable}
				/>
			</div>);

		const expressionBuilder = (
			<div className="harness-sidepanel-children">
				<Toggle
					id="harness-sidepanel-expressionBuilder-toggle"
					labelText="Show Expression Builder"
					toggled={this.props.propertiesConfig.expressionBuilder}
					onToggle={this.useExpressionBuilder}
				/>
			</div>);

		const addtlCmpts = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-additional-components">
				<Toggle
					id="harness-sidepanel-additionalComponents-toggle"
					labelText="Display additional components"
					toggled={ this.props.propertiesConfig.displayAdditionalComponents }
					onToggle={ this.useDisplayAdditionalComponents }
				/>
			</div>
		);

		const setTrimSpaces = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-trimSpaces">
				<Toggle
					id="sidepanel-properties-trimSpaces-toggle"
					labelText="Enable trimSpaces"
					toggled={ this.props.propertiesConfig.trimSpaces }
					onToggle={ this.setTrimSpaces }
				/>
			</div>
		);

		const useHeading = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-show-heading">
				<Toggle
					id="harness-sidepanel-show-heading-toggle"
					labelText="Show panel heading (icon and label)"
					toggled={ this.props.propertiesConfig.heading }
					onToggle={ this.useHeading }
				/>
			</div>
		);

		const useLightOption = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-light">
				<Toggle
					id="harness-sidepanel-light-toggle"
					labelText="Enable light option"
					toggled={ this.props.propertiesConfig.light }
					onToggle={ this.useLightOption }
				/>
			</div>
		);

		const setShowRequiredIndicator = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-show-required-indicator">
				<Toggle
					id="harness-sidepanel-show-required-indicator-toggle"
					labelText="Show label indicator"
					toggled={ this.props.propertiesConfig.showRequiredIndicator }
					onToggle={ this.setShowRequiredIndicator }
					labelA="(optional)"
					labelB="(required)"
				/>
			</div>
		);

		const editorSizes = [
			{
				id: EDITOR_SIZE.UNSET,
				label: EDITOR_SIZE.UNSET,
			},
			{
				id: EDITOR_SIZE.SMALL,
				label: EDITOR_SIZE.SMALL,
			},
			{
				id: EDITOR_SIZE.MEDIUM,
				label: EDITOR_SIZE.MEDIUM,
			},
			{
				id: EDITOR_SIZE.LARGE,
				label: EDITOR_SIZE.LARGE,
			},
			{
				id: EDITOR_SIZE.MAX,
				label: EDITOR_SIZE.MAX,
			}
		];

		const persistEditorSize = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-persist-editor-size">
				<Dropdown
					id="harness-sidepanel-persist-editor-size-dropdown"
					label="Select editor size"
					titleText="Persist editor size"
					items={ editorSizes }
					onChange={ this.useEditorSize }
				/>
			</div>
		);

		const conditionHiddenPropertyHandling = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-cond-hidden-prop-handling">
				<Dropdown
					id="harness-sidepanel-cond-hidden-prop-handling-dropdown"
					label="Select conditionHiddenPropertyHandling"
					titleText="conditionHiddenPropertyHandling"
					items={ [{ id: "value", label: "value" }, { id: "null", label: "null" }] }
					initialSelectedItem={this.props.propertiesConfig.conditionHiddenPropertyHandling}
					onChange={ (evt) => this.props.propertiesConfig.setConditionHiddenPropertyHandling(evt.selectedItem.label) }
				/>
			</div>
		);

		const conditionDisabledPropertyHandling = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-cond-disabled-prop-handling">
				<Dropdown
					id="harness-sidepanel-cond-disabled-prop-handling-dropdown"
					label="Select conditionDisabledPropertyHandling"
					titleText="conditionDisabledPropertyHandling"
					items={ [{ id: "value", label: "value" }, { id: "null", label: "null" }] }
					initialSelectedItem={this.props.propertiesConfig.conditionDisabledPropertyHandling}
					onChange={ (evt) => this.props.propertiesConfig.setConditionDisabledPropertyHandling(evt.selectedItem.label) }
				/>
			</div>
		);

		const disableRowMoveButtonsInTable = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-disable-row-move-buttons">
				<TextInput
					labelText="Disable row move buttons for propertyId array"
					id="harness-propertyId-array"
					placeholder="Enter array of PropertyIds"
					invalid={this.state.invalidPropertyId}
					invalidText="Please enter valid JSON"
					onChange={ this.disableRowMoveButtons.bind(this, "propertyIdArray") }
					helperText='Array of PropertyIds Format: [{"name": "unique_id_for_control"}]'
				/>
			</div>
		);

		const setMaxLengthForMultiLineControls = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-max-length-for-multiline-controls">
				<NumberInput
					label="Maximum characters allowed for multi-line string controls like textarea"
					id="harness-sidepanel-max-length-for-multiline-controls"
					onChange={ this.setMaxLengthForMultiLineControls.bind(this, "maxLengthForMultiLineControls") }
					min={-1}
					step={10}
					value={1024}
				/>
			</div>
		);

		const setMaxLengthForSingleLineControls = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-max-length-for-singleline-controls">
				<NumberInput
					label="Maximum characters allowed for single-line string controls like textfield"
					id="harness-sidepanel-max-length-for-singleline-controls"
					onChange={ this.setMaxLengthForSingleLineControls.bind(this, "maxLengthForSingleLineControls") }
					min={-1}
					step={10}
					value={128}
				/>
			</div>
		);

		const setAddRemoveRowsPropertyId = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-add-remove-rows-propertyid">
				<TextInput
					labelText="Set the propertyId for enabling/disabling addRemoveRows"
					id="harness-propertyId-addRemoveRows"
					placeholder='{ "name": "parameterName" }'
					invalid={this.state.invalidSetAddRemoveRowPropertyId}
					invalidText="Please enter valid JSON"
					onChange={ this.setAddRemoveRowsPropertyId }
					helperText='PropertyId format: {"name": "unique_id_for_control"}'
				/>
			</div>
		);

		const setAddRemoveRowsEnabled = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-add-remove-rows-enabled">
				<Toggle
					id="harness-sidepanel-setAddRemoveRowsEnabled-toggle"
					labelText="Set addRemoveRows enabled for the propertyId entered above"
					labelA="disable"
					labelB="enable"
					toggled={this.props.propertiesConfig.addRemoveRowsEnabled}
					onToggle={this.setAddRemoveRowsEnabled}
				/>
			</div>);

		const submitAddRemoveRows = (<div className="harness-sidepanel-children" id="sidepanel-properties-set-add-remove-rows-submit">
			<Button size="small"
				disabled={this.state.invalidSetAddRemoveRowPropertyId}
				onClick={this.props.propertiesConfig.setAddRemoveRows}
			>
				Submit
			</Button>
		</div>);

		const setHideEditButtonPropertyId = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-hide-edit-button-propertyid">
				<TextInput
					labelText="Set the propertyId for hide/show hideEditButton"
					id="harness-propertyId-hideEditButton"
					placeholder='{ "name": "parameterName" }'
					invalid={this.state.invalidSetHideEditButtonPropertyId}
					invalidText="Please enter valid JSON"
					onChange={ this.setHideEditButtonPropertyId }
					helperText='PropertyId format: {"name": "unique_id_for_control"}'
				/>
			</div>
		);

		const setHideEditButtonEnabled = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-hide-edit-button-disabled">
				<Toggle
					id="harness-sidepanel-setHideEditButtonEnabled-toggle"
					labelText="Set hideEditButton show for the propertyId entered above"
					labelA="show"
					labelB="hide"
					toggled={this.props.propertiesConfig.hideEditButtonEnabled}
					onToggle={this.setHideEditButtonEnabled}
				/>
			</div>);

		const submitHideEditButton = (<div className="harness-sidepanel-children" id="sidepanel-properties-set-hide-edit-button-submit">
			<Button size="small"
				disabled={this.state.invalidSetHideEditButtonPropertyId}
				onClick={this.props.propertiesConfig.setHideEditButton}
			>
		Submit
			</Button>
		</div>);

		const setTableButtonPropertyId = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-table-button-propertyid">
				<TextInput
					labelText="Set the propertyId for enabling/disabling a custom table button"
					id="harness-propertyId-tableButton"
					placeholder='{ "name": "parameterName" }'
					invalid={this.state.invalidTableButtonPropertyId}
					invalidText="Please enter valid JSON"
					onChange={this.setTableButtonPropertyId}
					helperText='PropertyId format: {"name": "unique_id_for_control"}'
				/>
			</div>
		);

		const setTableButtonId = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-table-buttonid">
				<TextInput
					labelText="Set the buttonId for the custom table button"
					id="harness-buttonId-customTableButton"
					placeholder="custom table button id"
					onChange={this.setTableButtonId}
				/>
			</div>);

		const setTableButtonIdEnabled = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-table-buttonid-enabled">
				<Toggle
					id="harness-sidepanel-setTableButtonEnabled-toggle"
					labelText="Set custom table button enabled for the propertyId and buttonId entered above"
					labelA="disable"
					labelB="enable"
					toggled={this.props.propertiesConfig.tableButtonEnabled}
					onToggle={this.setTableButtonIdEnabled}
				/>
			</div>);

		const submitTableButtonEnabled = (<div className="harness-sidepanel-children" id="sidepanel-properties-set-table-button-submit">
			<Button size="small"
				disabled={this.state.invalidTableButtonPropertyId}
				onClick={this.props.propertiesConfig.setTableButtonEnabled}
			>
				Submit
			</Button>
		</div>);

		const setStaticRowsPropertyId = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-static-rows-propertyid">
				<TextInput
					labelText="Set the propertyId for setting static rows"
					id="harness-propertyId-staticRows"
					placeholder='{ "name": "parameterName" }'
					invalid={this.state.invalidSetStaticRowPropertyId}
					invalidText="Please enter valid JSON"
					onChange={ this.setStaticRowsPropertyId }
					helperText='PropertyId format: {"name": "unique_id_for_control"}'
				/>
			</div>
		);

		const setStaticRowsIndexes = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-static-rows-indexes">
				<TextInput
					labelText="Set the indexes for static rows"
					id="harness-indexes-staticRows"
					placeholder="[0, 1]"
					invalid={this.state.invalidSetStaticRowIndexes}
					invalidText="Please enter valid array of row indexes"
					onChange={ this.setStaticRowsIndexes }
					helperText="Indexes format: [Array of row indexes]"
				/>
			</div>);

		const submitStaticRows = (<div className="harness-sidepanel-children" id="sidepanel-properties-set-static-rows-submit">
			<Button size="small"
				disabled={this.state.invalidSetStaticRowIndexes}
				disabled={this.state.invalidSetStaticRowPropertyId || this.state.invalidSetStaticRowIndexes}
				onClick={this.props.propertiesConfig.setStaticRows}
			>
				Submit
			</Button>
		</div>);

		const disableWideFlyoutPrimaryButtonForPanelId = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-disable-ok-button-panelid">
				<TextInput
					labelText="Set the summary panel id for enabling/disabling OK button in Wide Flyout"
					id="harness-panelId-disableWideFlyoutPrimaryButton"
					placeholder='{ "name": "panelId" }'
					invalid={this.state.invalidDisableWideFlyoutPrimaryButtonPanelId}
					invalidText="Please enter valid JSON"
					onChange={ this.disableWideFlyoutPrimaryButtonForPanelId }
					helperText='PanelId format: {"name": "unique_id_for_panel"}'
				/>
			</div>
		);

		const setWideFlyoutPrimaryButtonDisabled = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-set-ok-button-disabled">
				<Toggle
					id="harness-sidepanel-setWideFlyoutPrimaryButtonDisabled-toggle"
					labelText="Set OK button disabled for the summary panelId entered above"
					labelA="Enable Ok button"
					labelB="Disable OK button"
					toggled={this.props.propertiesConfig.wideFlyoutPrimaryButtonDisabled}
					onToggle={this.setWideFlyoutPrimaryButtonDisabled}
				/>
			</div>);

		const disableWideFlyoutPrimaryButton = (<div className="harness-sidepanel-children" id="sidepanel-properties-disable-ok-button-submit">
			<Button size="small"
				disabled={this.state.invalidDisableWideFlyoutPrimaryButtonPanelId}
				onClick={this.props.propertiesConfig.disableWideFlyoutPrimaryButton}
			>
				Submit
			</Button>
		</div>);

		const divider = (<div className="harness-sidepanel-children harness-sidepanel-divider" />);
		return (
			<div>
				{propertiesInput}
				{divider}
				{validateProperties}
				{divider}
				{containerType}
				{divider}
				{validateSchemaEnabled}
				{divider}
				{applyPropertiesWithoutEdit}
				{divider}
				{applyOnBlur}
				{divider}
				{convertValueDataTypes}
				{divider}
				{setSaveButtonDisable}
				{divider}
				{expressionBuilder}
				{divider}
				{validationHandler}
				{divider}
				{setTrimSpaces}
				{divider}
				{addtlCmpts}
				{divider}
				{useHeading}
				{divider}
				{useLightOption}
				{divider}
				{setShowRequiredIndicator}
				{divider}
				{persistEditorSize}
				{divider}
				{conditionHiddenPropertyHandling}
				{divider}
				{conditionDisabledPropertyHandling}
				{divider}
				{disableRowMoveButtonsInTable}
				{divider}
				{setMaxLengthForMultiLineControls}
				{divider}
				{setMaxLengthForSingleLineControls}
				{divider}
				{setAddRemoveRowsPropertyId}
				{setAddRemoveRowsEnabled}
				{submitAddRemoveRows}
				{divider}
				{setHideEditButtonPropertyId}
				{setHideEditButtonEnabled}
				{submitHideEditButton}
				{divider}
				{setTableButtonPropertyId}
				{setTableButtonId}
				{setTableButtonIdEnabled}
				{submitTableButtonEnabled}
				{divider}
				{setStaticRowsPropertyId}
				{setStaticRowsIndexes}
				{submitStaticRows}
				{divider}
				{disableWideFlyoutPrimaryButtonForPanelId}
				{setWideFlyoutPrimaryButtonDisabled}
				{disableWideFlyoutPrimaryButton}
			</div>
		);
	}
}

SidePanelModal.propTypes = {
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
		trimSpaces: PropTypes.bool,
		setTrimSpaces: PropTypes.func,
		disableRowMoveButtons: PropTypes.func,
		addRemoveRowsEnabled: PropTypes.bool,
		setAddRemoveRowsPropertyId: PropTypes.func,
		setAddRemoveRowsEnabled: PropTypes.func,
		setAddRemoveRows: PropTypes.func,
		hideEditButtonEnabled: PropTypes.bool,
		setHideEditButtonPropertyId: PropTypes.func,
		setHideEditButtonEnabled: PropTypes.func,
		setHideEditButton: PropTypes.func,
		tableButtonEnabled: PropTypes.bool,
		setTableButtonPropertyId: PropTypes.func,
		setTableButtonId: PropTypes.func,
		setTableButtonIdEnabled: PropTypes.func,
		setTableButtonEnabled: PropTypes.func,
		StaticRowsEnabled: PropTypes.bool,
		setStaticRowsPropertyId: PropTypes.func,
		setStaticRowsIndexes: PropTypes.func,
		setStaticRows: PropTypes.func,
		setMaxLengthForMultiLineControls: PropTypes.func,
		setMaxLengthForSingleLineControls: PropTypes.func,
		enablePropertiesSchemaValidation: PropTypes.func,
		propertiesSchemaValidation: PropTypes.bool,
		enableApplyPropertiesWithoutEdit: PropTypes.func,
		applyPropertiesWithoutEdit: PropTypes.bool,
		setConditionHiddenPropertyHandling: PropTypes.func,
		conditionHiddenPropertyHandling: PropTypes.string,
		setConditionDisabledPropertyHandling: PropTypes.func,
		conditionDisabledPropertyHandling: PropTypes.string,
		enablePropertiesValidationHandler: PropTypes.func,
		propertiesValidationHandler: PropTypes.bool,
		wideFlyoutPrimaryButtonDisabled: PropTypes.bool,
		disableWideFlyoutPrimaryButtonForPanelId: PropTypes.func,
		setWideFlyoutPrimaryButtonDisabled: PropTypes.func,
		disableWideFlyoutPrimaryButton: PropTypes.func,
		convertValueDataTypes: PropTypes.bool,
		useConvertValueDataTypes: PropTypes.func
	})
};
