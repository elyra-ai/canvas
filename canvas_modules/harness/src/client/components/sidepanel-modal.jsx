/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global FileReader: true */
/* eslint no-undef: "error" */

import React from "react";
import { Link } from "react-router-dom";
import FileUploader from "carbon-components-react/lib/components/FileUploader";
import PropTypes from "prop-types";
import Button from "carbon-components-react/lib/components/Button";
import Select from "carbon-components-react/lib/components/Select";
import SelectItemGroup from "carbon-components-react/lib/components/SelectItemGroup";
import SelectItem from "carbon-components-react/lib/components/SelectItem";
import RadioButtonGroup from "carbon-components-react/lib/components/RadioButtonGroup";
import RadioButton from "carbon-components-react/lib/components/RadioButton";
import Toggle from "carbon-components-react/lib/components/Toggle";

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
		this.useDisplayAdditionalComponents = this.useDisplayAdditionalComponents.bind(this);
	}

	componentWillMount() {
		var that = this;
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
		this.props.setPropertiesDropdownSelect(
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
		this.props.log("Submit common properties file", this.props.selectedPropertiesDropdownFile);
		if (this.props.selectedPropertiesFileCategory === PARAMETER_DEFS) {
			FormsService.getFileContent(PARAMETER_DEFS, this.props.selectedPropertiesDropdownFile)
				.then(function(res) {
					that.props.setPropertiesJSON(res);
				});
		} else {
			FormsService.getFileContent(FORMS, this.props.selectedPropertiesDropdownFile)
				.then(function(res) {
					that.props.setPropertiesJSON(res);
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
				this.props.setPropertiesJSON(content);
			}.bind(this);
			fileReader.readAsText(this.state.commonProperties);
		} else {
			this.getSelectedFile();
		}
		this.props.closeSidePanelModal();
	}

	isReadyToSubmitProperties() {
		if (this.state.commonProperties !== "" || this.isReadyToSubmitPropertiesDropdownData()) {
			return true;
		}
		return false;
	}

	isReadyToSubmitPropertiesDropdownData() {
		if (this.props.selectedPropertiesDropdownFile !== "" &&
				this.props.selectedPropertiesDropdownFile !== CHOOSE_FROM_LOCATION) {
			return true;
		}
		return false;
	}

	openPropertiesEditorDialog(changeEvent) {
		if (changeEvent.target.checked) {
			this.props.openPropertiesEditorDialog();
		} else {
			this.props.closePropertiesEditorDialog();
		}
	}

	usePropertiesContainerType(value) {
		this.props.usePropertiesContainerType(value);
	}

	useApplyOnBlur(checked) {
		this.props.useApplyOnBlur(checked);
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
		this.props.useDisplayAdditionalComponents(checked);
	}

	render() {
		const space = (<div className="sidepanel-spacer" />);
		let fileChooser = <div />;
		if (this.props.fileChooserVisible) {
			fileChooser = (<div className="sidepanel-file-uploader">
				<FileUploader
					small={"true"}
					buttonLabel="Choose file"
					accept={[".json"]}
					onChange={this.onPropertiesSelect}
				/>
				{space}
			</div>);
		}

		const propertiesInput = (<div className="sidepanel-children" id="sidepanel-input">
			<div className="filePicker">
				<div className="sidepanel-headers">
					<span>Common Properties</span>
					<Link to="/properties" target="_blank">documentation</Link>
				</div>
				<Select
					id = "common-properties-select-item"
					className = "common-properties-select-item"
					iconDescription = "list of form and paramdef file options"
					labelText="Properties"
					onChange={this.onDropdownSelect.bind(this)}
					value={this.props.selectedPropertiesDropdownFile}
				>
					{this.dropdownOptions()}
				</Select>
				{space}
				{fileChooser}
				<Button small
					disabled={!this.isReadyToSubmitProperties()}
					onClick={this.submitProperties.bind(this)}
				>
					Show Properties
				</Button>
			</div>
		</div>);

		const containerType = (<div className="sidepanel-children" id="sidepanel-properties-container-type">
			<div className="sidepanel-headers">Container Type</div>
			<RadioButtonGroup
				className="sidepanel-radio-group"
				name="properties-container_type_radio"
				onChange={this.usePropertiesContainerType}
				valueSelected={this.props.propertiesContainerType}
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
			<div className="sidepanel-children">
				<div className="sidepanel-headers">Apply changes on blur</div>
				<Toggle
					id="sidepanel-applyOnBlur-toggle"
					toggled={this.props.applyOnBlur}
					onToggle={this.useApplyOnBlur}
				/>
			</div>);

		const addtlCmpts = (
			<div className="sidepanel-children" id="sidepanel-properties-additional-components">
				<div className="sidepanel-headers">Display additional components</div>
				<Toggle
					id="sidepanel-additionalComponents-toggle"
					toggled={ this.props.displayAdditionalComponents }
					onToggle={ this.useDisplayAdditionalComponents }
				/>
			</div>
		);

		const divider = (<div className="sidepanel-children sidepanel-divider" />);
		return (
			<div>
				{propertiesInput}
				{divider}
				{containerType}
				{divider}
				{applyOnBlur}
				{divider}
				{addtlCmpts}
			</div>
		);
	}
}

SidePanelModal.propTypes = {
	log: PropTypes.func,
	closePropertiesEditorDialog: PropTypes.func,
	openPropertiesEditorDialog: PropTypes.func,
	setPropertiesJSON: PropTypes.func,
	usePropertiesContainerType: PropTypes.func,
	propertiesContainerType: PropTypes.string,
	showPropertiesDialog: PropTypes.bool,
	closeSidePanelModal: PropTypes.func,
	applyOnBlur: PropTypes.bool,
	useApplyOnBlur: PropTypes.func,
	displayAdditionalComponents: PropTypes.bool,
	useDisplayAdditionalComponents: PropTypes.func,
	setPropertiesDropdownSelect: PropTypes.func,
	selectedPropertiesDropdownFile: PropTypes.string,
	selectedPropertiesFileCategory: PropTypes.string,
	fileChooserVisible: PropTypes.bool
};
