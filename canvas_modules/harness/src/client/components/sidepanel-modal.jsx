/*
 * Copyright 2017-2020 IBM Corporation
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
	FileUploader,
	Button,
	Select,
	SelectItem,
	SelectItemGroup,
	RadioButtonGroup,
	RadioButton,
	Toggle
} from "carbon-components-react";

import {
	CHOOSE_FROM_LOCATION,
	FLYOUT,
	MODAL,
	LOCAL_FILE_OPTION,
	FORMS,
	PARAMETER_DEFS
} from "../constants/constants.js";

import FormsService from "../services/FormsService";

export default class SidePanelModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			commonProperties: "",
			commonPropertiesFormsFiles: [],
			commonPropertiesParamDefsFiles: []
		};

		this.onPropertiesSelect = this.onPropertiesSelect.bind(this);
		this.isReadyToSubmitProperties = this.isReadyToSubmitProperties.bind(this);
		this.isReadyToSubmitPropertiesDropdownData = this.isReadyToSubmitPropertiesDropdownData.bind(this);
		this.openPropertiesEditorDialog = this.openPropertiesEditorDialog.bind(this);
		this.usePropertiesContainerType = this.usePropertiesContainerType.bind(this);
		this.useApplyOnBlur = this.useApplyOnBlur.bind(this);
		this.useExpressionBuilder = this.useExpressionBuilder.bind(this);
		this.useExpressionValidate = this.useExpressionValidate.bind(this);
		this.useDisplayAdditionalComponents = this.useDisplayAdditionalComponents.bind(this);
		this.getSelectedFile = this.getSelectedFile.bind(this);
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

	usePropertiesContainerType(value) {
		this.props.propertiesConfig.usePropertiesContainerType(value);
	}

	useApplyOnBlur(checked) {
		this.props.propertiesConfig.useApplyOnBlur(checked);
	}

	useExpressionBuilder(checked) {
		this.props.propertiesConfig.useExpressionBuilder(checked);
	}

	useExpressionValidate(checked) {
		this.props.propertiesConfig.useExpressionValidate(checked);
	}

	dropdownOptions() {
		const options = [];
		let key = 1;
		const formOptions = [];
		const paramDefOptions = [];
		const choosefromlocation = [];
		options.push(<SelectItem key = "choose-an-option" hidden text = "Choose an option..." />);
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
					<span>Common Properties</span>
					<Link to="/properties" target="_blank">documentation</Link>
				</div>
				<Select
					id = "common-properties-select-item"
					className = "common-properties-select-item"
					labelText="Properties"
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
			<div className="harness-sidepanel-headers">Container Type</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="properties-container_type_radio"
				onChange={this.usePropertiesContainerType}
				valueSelected={this.props.propertiesConfig.propertiesContainerType}
			>
				<RadioButton
					value={FLYOUT}
					labelText={FLYOUT}
				/>
				<RadioButton
					value={MODAL}
					labelText={MODAL}
				/>
			</RadioButtonGroup>
		</div>);

		const applyOnBlur = (
			<div className="harness-sidepanel-children">
				<div className="harness-sidepanel-headers">Apply changes on blur</div>
				<Toggle
					id="harness-sidepanel-applyOnBlur-toggle"
					toggled={this.props.propertiesConfig.applyOnBlur}
					onToggle={this.useApplyOnBlur}
				/>
			</div>);

		const expressionBuilder = (
			<div className="harness-sidepanel-children">
				<div className="harness-sidepanel-headers">Show Expression Builder</div>
				<Toggle
					id="harness-sidepanel-expressionBuilder-toggle"
					toggled={this.props.propertiesConfig.expressionBuilder}
					onToggle={this.useExpressionBuilder}
				/>
			</div>);

		const expressionValidate = (
			<div className="harness-sidepanel-children">
				<div className="harness-sidepanel-headers">Show Expression Validate Link</div>
				<Toggle
					id="sidepanel-expressionValidate-toggle"
					toggled={this.props.propertiesConfig.expressionValidate}
					onToggle={this.useExpressionValidate}
				/>
			</div>);

		const addtlCmpts = (
			<div className="harness-sidepanel-children" id="sidepanel-properties-additional-components">
				<div className="harness-sidepanel-headers">Display additional components</div>
				<Toggle
					id="harness-sidepanel-additionalComponents-toggle"
					toggled={ this.props.propertiesConfig.displayAdditionalComponents }
					onToggle={ this.useDisplayAdditionalComponents }
				/>
			</div>
		);

		const divider = (<div className="harness-sidepanel-children harness-sidepanel-divider" />);
		return (
			<div>
				{propertiesInput}
				{divider}
				{containerType}
				{divider}
				{applyOnBlur}
				{divider}
				{expressionBuilder}
				{divider}
				{expressionValidate}
				{divider}
				{addtlCmpts}
			</div>
		);
	}
}

SidePanelModal.propTypes = {
	log: PropTypes.func,
	propertiesConfig: PropTypes.shape({
		closePropertiesEditorDialog: PropTypes.func,
		openPropertiesEditorDialog: PropTypes.func,
		setPropertiesJSON: PropTypes.func,
		showPropertiesDialog: PropTypes.bool,
		usePropertiesContainerType: PropTypes.func,
		propertiesContainerType: PropTypes.string,
		closeSidePanelModal: PropTypes.func,
		applyOnBlur: PropTypes.bool,
		useApplyOnBlur: PropTypes.func,
		expressionBuilder: PropTypes.bool,
		useExpressionBuilder: PropTypes.func,
		expressionValidate: PropTypes.bool,
		useExpressionValidate: PropTypes.func,
		displayAdditionalComponents: PropTypes.bool,
		useDisplayAdditionalComponents: PropTypes.func,
		selectedPropertiesDropdownFile: PropTypes.string,
		selectedPropertiesFileCategory: PropTypes.string,
		fileChooserVisible: PropTypes.bool,
		setPropertiesDropdownSelect: PropTypes.func
	})
};
