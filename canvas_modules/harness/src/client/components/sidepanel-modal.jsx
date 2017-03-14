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
import { FormControl } from "react-bootstrap";
import {
	Button,
	ToggleButton
} from "ap-components-react/dist/ap-components-react";

export default class SidePanelModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			commonProperties: ""
		};

		this.onPropertiesSelect = this.onPropertiesSelect.bind(this);
		this.isReadyToSubmitPropertiesData = this.isReadyToSubmitPropertiesData.bind(this);
		this.openPropertiesEditorDialog = this.openPropertiesEditorDialog.bind(this);
	}

	onPropertiesSelect(evt) {
		this.setState({ commonProperties: "" });
		if (evt.target.files.length > 0) {
			var filename = evt.target.files[0].name;
			var fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({ commonProperties: evt.target.files[0] });
				this.props.log("Common Properties JSON file selected: " + filename);
			}
		}
	}

	submitPropertiesData() {
		this.props.log("Submit file: " + this.state.commonProperties.name);
		// read file
		var fileReader = new FileReader();
		fileReader.onload = function(evt) {
			var fileContent = fileReader.result;
			var content = JSON.parse(fileContent);
			this.props.setPropertiesJSON(content);
		}.bind(this);
		fileReader.readAsText(this.state.commonProperties);
	}

	isReadyToSubmitPropertiesData() {
		if (this.state.commonProperties !== "") {
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

	render() {
		var divider = (<div
			className="sidepanel-children sidepanel-divider"
		/>);

		var propertiesInput = (<div className="sidepanel-children" id="sidepanel-input">
			<div className="formField">
				<div className="sidepanel-headers">Common Properties</div>
				<FormControl
					required="required"
					id="formFileInput"
					type="file"
					accept=".json"
					ref="commonProperties" onChange={this.onPropertiesSelect}
				/>
				<Button dark
					disabled={!this.isReadyToSubmitPropertiesData()}
					onClick={this.submitPropertiesData.bind(this)}
				>
					Submit
				</Button>
			</div>
		</div>);

		var enablePropertiesDialog = (<div className="sidepanel-children" id="sidepanel-properties-dialog">
			<form>
				<div className="sidepanel-headers">Properties Dialog</div>
				<div>
					<ToggleButton dark
						id="sidepanel-properties-dialog-toggle"
						checked={this.props.showPropertiesDialog}
						onChange={this.openPropertiesEditorDialog}
					/>
				</div>
			</form>
		</div>);

		return (
			<div>
				{propertiesInput}
				{divider}
				{enablePropertiesDialog}
				{divider}
			</div>
		);
	}
}

SidePanelModal.propTypes = {
	log: React.PropTypes.func,
	closePropertiesEditorDialog: React.PropTypes.func,
	openPropertiesEditorDialog: React.PropTypes.func,
	setPropertiesJSON: React.PropTypes.func,
	showPropertiesDialog: React.PropTypes.bool
};
