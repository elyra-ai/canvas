/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global FileReader: true */
/* eslint no-undef: "error" */

import React from "react";
import { Link } from "react-router-dom";
import FormControl from "react-bootstrap/lib/FormControl";
import PropTypes from "prop-types";
import Button from "ap-components-react/dist/components/Button";
import Dropdown from "ap-components-react/dist/components/Dropdown";
import RadioGroup from "ap-components-react/dist/components/RadioGroup";

import {
	CHOOSE_FROM_LOCATION,
	FLYOUT,
	MODAL
} from "../constants/constants.js";
import FormsService from "../services/FormsService";

export default class SidePanelModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			commonProperties: "",
			commonPropertiesFiles: [],
			selectedPropertiesDropdownFile: "",
			fileChooserVisible: false
		};

		this.onPropertiesSelect = this.onPropertiesSelect.bind(this);
		this.isReadyToSubmitProperties = this.isReadyToSubmitProperties.bind(this);
		this.openPropertiesEditorDialog = this.openPropertiesEditorDialog.bind(this);
		this.usePropertiesContainerType = this.usePropertiesContainerType.bind(this);
	}

	componentWillMount() {
		var that = this;

		FormsService.getFiles("properties")
			.then(function(res) {
				var list = res;
				list.unshift(CHOOSE_FROM_LOCATION);
				that.setState({ commonPropertiesFiles: res });
			});
	}

	onDropdownSelect(evt, obj) {
		if (obj.selected === CHOOSE_FROM_LOCATION) {
			this.setState({
				fileChooserVisible: true,
				selectedPropertiesDropdownFile: ""
			});
		} else {
			var that = this;
			this.setState({
				selectedPropertiesDropdownFile: obj.selected,
				commonProperties: "",
				fileChooserVisible: false
			}, function() {
				that.getSelectedFile();
				that.props.closeSidePanelModal();
			});
		}
	}

	onPropertiesSelect(evt) {
		this.setState({ commonProperties: "" });
		if (evt.target.files.length > 0) {
			var filename = evt.target.files[0].name;
			var fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({
					commonProperties: evt.target.files[0],
					selectedPropertiesDropdownFile: ""
				});
				this.props.log("Common Properties JSON file selected", filename);
			}
		}
	}

	getSelectedFile() {
		var that = this;
		this.props.log("Submit common properties file", this.state.selectedPropertiesDropdownFile);
		FormsService.getFileContent("properties", this.state.selectedPropertiesDropdownFile)
			.then(function(res) {
				that.props.setPropertiesJSON(res);
			});
	}

	submitProperties() {
		if (this.state.commonProperties.name) {
			this.props.log("Submit common properties file", this.state.commonProperties.name);
			// read file
			var fileReader = new FileReader();
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
		if (this.state.commonProperties !== "" || this.state.selectedPropertiesDropdownFile !== "") {
			return true;
		}
		return false;
	}

	isReadyToSubmitPropertiesDropdownData() {
		if (this.state.selectedPropertiesDropdownFile !== "") {
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

	usePropertiesContainerType(evt, obj) {
		this.props.usePropertiesContainerType(obj.selected);
	}

	render() {
		// var divider = (<div
		// 	className="sidepanel-children sidepanel-divider"
		// />);
		var space = (<div className="sidepanel-spacer" />);

		var fileChooser = <div />;
		if (this.state.fileChooserVisible) {
			fileChooser = (<div>
				<FormControl
					required="required"
					id="formFileInput"
					type="file"
					accept=".json"
					ref="commonProperties"
					onChange={this.onPropertiesSelect}
				/>
				{space}
			</div>);
		}

		var propertiesInput = (<div className="sidepanel-children" id="sidepanel-input">
			<div className="formField">
				<div className="sidepanel-headers">Common Properties</div>
				<div id="properties-documentation-link">
					<Link to="/properties" target="_blank">documentation</Link>
				</div>
				<Dropdown
					name="PropertiesDropdown"
					text="Properties"
					id="sidepanel-properties-dropdown"
					maxVisibleItems={10}
					dark
					options={this.state.commonPropertiesFiles}
					onSelect={this.onDropdownSelect.bind(this)}
					value={this.state.selectedPropertiesDropdownFile}
				/>
				{space}
				{fileChooser}
				<Button data-compact dark
					disabled={!this.isReadyToSubmitProperties()}
					onClick={this.submitProperties.bind(this)}
				>
					Show Properties
				</Button>
			</div>
		</div>);

		var containerType = (<div className="sidepanel-children" id="sidepanel-properties-container-type">
			<div className="sidepanel-headers">Container Type</div>
			<RadioGroup
				name="properties-container_type_radio"
				dark
				onChange={this.usePropertiesContainerType}
				choices={[
					FLYOUT,
					MODAL
				]}
				selected={this.props.propertiesContainerType}
			/>
		</div>);

		return (
			<div>
				{propertiesInput}
				{containerType}
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
	closeSidePanelModal: PropTypes.func
};
