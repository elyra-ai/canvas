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
import { FormControl, Button } from "react-bootstrap";

import {
	NONE,
	HORIZONTAL,
	VERTICAL
} from "../constants/constants.js";

export default class SidePanelForms extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			canvasDiagram: "",
			canvasPalette: "",
			palettejson: {}
		};

		this.onCanvasFileSelect = this.onCanvasFileSelect.bind(this);
		this.isReadyToSubmitCanvasData = this.isReadyToSubmitCanvasData.bind(this);

		this.onCanvasPaletteSelect = this.onCanvasPaletteSelect.bind(this);
		this.isReadyToSubmitPaletteData = this.isReadyToSubmitPaletteData.bind(this);

		this.layoutDirectionOptionChange = this.layoutDirectionOptionChange.bind(this);
		this.useObjectModel = this.useObjectModel.bind(this);
	}

	onCanvasFileSelect(evt) {
		this.setState({ canvasDiagram: "" });
		this.props.setDiagramJSON(null);
		if (evt.target.files.length > 0) {
			var filename = evt.target.files[0].name;
			var fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({ canvasDiagram: evt.target.files[0] });
				this.props.log("Canvas diagram JSON file selected: " + filename);
			}
		}
	}

	onCanvasPaletteSelect(evt) {
		this.setState({ canvasPalette: "" });
		this.props.setPaletteJSON({});
		this.props.enableNavPalette(false);
		if (evt.target.files.length > 0) {
			var filename = evt.target.files[0].name;
			var fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({ canvasPalette: evt.target.files[0] });
				this.props.log("Canvas palette JSON file selected: " + filename);
			}
		}
	}

	submitCanvasDiagram() {
		this.props.log("Submit file: " + this.state.canvasDiagram.name);
		// read file
		var fileReader = new FileReader();
		fileReader.onload = function(evt) {
			var fileContent = fileReader.result;
			var content = JSON.parse(fileContent);
			this.props.setDiagramJSON(content);
		}.bind(this);
		fileReader.readAsText(this.state.canvasDiagram);
	}

	isReadyToSubmitCanvasData() {
		if (this.state.canvasDiagram !== "") {
			return true;
		}
		return false;
	}

	submitCanvasPalette() {
		this.props.log("Submit file: " + this.state.canvasPalette.name);
		// enable palette in nav
		if (this.isReadyToSubmitPaletteData()) {
			this.props.enableNavPalette(true);
		}

		// read file
		var fileReader = new FileReader();
		fileReader.onload = function(evt) {
			var fileContent = fileReader.result;
			var content = JSON.parse(fileContent);
			this.props.setPaletteJSON(content);
		}.bind(this);
		fileReader.readAsText(this.state.canvasPalette);
	}

	isReadyToSubmitPaletteData() {
		if (this.state.canvasPalette !== "") {
			return true;
		}
		return false;
	}

	layoutDirectionOptionChange(changeEvent) {
		this.props.setLayoutDirection(changeEvent.target.value);
	}

	useObjectModel(changeEvent) {
		this.props.useObjectModel(changeEvent.target.checked);
	}

	render() {
		var divider = (<div className="sidepanel-children sidepanel-divider" />);

		var formInput = (<div className="sidepanel-children" id="sidepanel-input">
			<div className="formField">
				<label className="formLabel">Canvas Diagram</label>
				<FormControl
					required="required"
					id="formFileInput"
					type="file"
					accept=".json"
					ref="canvasDiagram" onChange={this.onCanvasFileSelect}
				/>
				<Button light semantic
					disabled={!this.isReadyToSubmitCanvasData()}
					onClick={this.submitCanvasDiagram.bind(this)}
				>
					Submit
				</Button>
			</div>
		</div>);

		var paletteInput = (<div className="sidepanel-children" id="sidepanel-palette">
			<div className="formField">
				<label className="formLabel">Canvas Palette</label>
				<FormControl
					required="required"
					id="paletteJsonInput"
					type="file"
					accept=".json"
					ref="canvasPalette"
					onChange={this.onCanvasPaletteSelect}
				/>
				<Button dark semantic
					disabled={!this.isReadyToSubmitPaletteData()}
					onClick={this.submitCanvasPalette.bind(this)}
					onChange={(evt) => this.props.enableNavPalette(evt.target.checked)}
				>
					Submit
				</Button>
			</div>
		</div>);

		var selectedLayoutDirection = this.props.selectedLayoutDirection;
		var layoutDirection = (<div className="sidepanel-children" id="sidepanel-layout-direction">
			<form>
				<div className="sidepanel-headers">Layout Direction</div>
				<div className="sidepanel-radio">
					<input className="sidepanel-radio-button" type="radio"
						value={NONE}
						checked={ selectedLayoutDirection === NONE }
						onChange={this.layoutDirectionOptionChange}
					/>
					None
				</div>
				<div className="sidepanel-radio">
					<input className="sidepanel-radio-button" type="radio" value={HORIZONTAL}
						checked={ selectedLayoutDirection === HORIZONTAL }
						onChange={this.layoutDirectionOptionChange}
					/>
					Horizontal
				</div>
				<div className="sidepanel-radio">
					<input className="sidepanel-radio-button" type="radio" value={VERTICAL}
						checked={ selectedLayoutDirection === VERTICAL }
						onChange={ this.layoutDirectionOptionChange }
					/>
					Vertical
				</div>
			</form>
		</div>);

		var enableObjectModel = (<div className="sidepanel-children" id="sidepanel-object-model">
			<form>
				<div className="sidepanel-headers">Options</div>
				<div className="sidepanel-checbox">
					<input className="sidepanel-checkbox" type="checkbox"
						value="useObjectModel"
						onChange={this.useObjectModel}
					/>
					Use Object Model
				</div>
			</form>
		</div>);

		return (
			<div>
				{formInput}
				{divider}
				{paletteInput}
				{divider}
				{layoutDirection}
				{divider}
				{enableObjectModel}
			</div>
		);
	}
}

SidePanelForms.propTypes = {
	enableNavPalette: React.PropTypes.func,
	setDiagramJSON: React.PropTypes.func,
	setPaletteJSON: React.PropTypes.func,
	setLayoutDirection: React.PropTypes.func,
	selectedLayoutDirection: React.PropTypes.string,
	useObjectModel: React.PropTypes.func,
	log: React.PropTypes.func
};
