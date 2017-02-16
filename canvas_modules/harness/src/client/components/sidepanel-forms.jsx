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
	}

	onCanvasFileSelect(evt) {
		this.setState({ canvasDiagram: "" });
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

	isReadyToSubmitPaletteData() {
		if (this.state.canvasPalette !== "") {
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

		return (
			<div>
				{formInput}
				{divider}
				{paletteInput}
				{divider}
			</div>
		);
	}
}

SidePanelForms.propTypes = {
	enableNavPalette: React.PropTypes.func,
	setDiagramJSON: React.PropTypes.func,
	setPaletteJSON: React.PropTypes.func,
	log: React.PropTypes.func
};
