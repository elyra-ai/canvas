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
	RadioGroup,
	ToggleButton
} from "ap-components-react/dist/ap-components-react";

import {
	BLANK_CANVAS,
	NONE,
	HORIZONTAL,
	VERTICAL
} from "../constants/constants.js";

export default class SidePanelForms extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			canvasDiagram: "",
			canvasPalette: ""
		};

		this.onCanvasFileSelect = this.onCanvasFileSelect.bind(this);
		this.isReadyToSubmitCanvasData = this.isReadyToSubmitCanvasData.bind(this);

		this.onCanvasPaletteSelect = this.onCanvasPaletteSelect.bind(this);
		this.isReadyToSubmitPaletteData = this.isReadyToSubmitPaletteData.bind(this);

		this.layoutDirectionOptionChange = this.layoutDirectionOptionChange.bind(this);
		this.useInternalObjectModel = this.useInternalObjectModel.bind(this);
	}

	onCanvasFileSelect(evt) {
		this.setState({ canvasDiagram: "" });
		this.props.setDiagramJSON(BLANK_CANVAS);
		if (evt.target.files.length > 0) {
			var filename = evt.target.files[0].name;
			var fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({ canvasDiagram: evt.target.files[0] });
				this.props.log("Canvas diagram JSON file selected", filename);
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
				this.props.log("Canvas palette JSON file selected", filename);
			}
		}
	}

	submitCanvasDiagram() {
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

	layoutDirectionOptionChange(evt, obj) {
		this.props.setLayoutDirection(obj.selected);
	}

	useInternalObjectModel(changeEvent) {
		this.props.useInternalObjectModel(changeEvent.target.checked);
	}

	render() {
		var divider = (<div className="sidepanel-children sidepanel-divider" />);

		var canvasInput = (<div className="sidepanel-children" id="sidepanel-canvas-input">
			<div className="canvasField">
				<div className="sidepanel-headers">Canvas Diagram</div>
				<FormControl
					required="required"
					id="canvasFileInput"
					type="file"
					accept=".json"
					ref="canvasDiagram" onChange={this.onCanvasFileSelect}
				/>
				<Button dark
					disabled={!this.isReadyToSubmitCanvasData()}
					onClick={this.submitCanvasDiagram.bind(this)}
				>
					Submit
				</Button>
			</div>
		</div>);

		var paletteInput = (<div className="sidepanel-children" id="sidepanel-palette-input">
			<div className="formField">
				<div className="sidepanel-headers">Canvas Palette</div>
				<FormControl
					required="required"
					id="paletteJsonInput"
					type="file"
					accept=".json"
					ref="canvasPalette"
					onChange={this.onCanvasPaletteSelect}
				/>
				<Button dark
					disabled={!this.isReadyToSubmitPaletteData()}
					onClick={this.submitCanvasPalette.bind(this)}
					onChange={(evt) => this.props.enableNavPalette(evt.target.checked)}
				>
					Submit
				</Button>
			</div>
		</div>);

		var layoutDirection = (<div className="sidepanel-children" id="sidepanel-layout-direction">
			<div className="sidepanel-headers">Layout Direction</div>
			<RadioGroup
				dark
				onChange={this.layoutDirectionOptionChange}
				choices={[
					NONE,
					HORIZONTAL,
					VERTICAL
				]}
				selected={NONE}
			/>
		</div>);

		var enableObjectModel = (<div className="sidepanel-children" id="sidepanel-object-model">
			<form>
				<div className="sidepanel-headers">Use Object Model</div>
				<div>
					<ToggleButton dark
						id="sidepanel-object-model-toggle"
						checked={this.props.internalObjectModel}
						onChange={this.useInternalObjectModel}
					/>
				</div>
			</form>
		</div>);

		return (
			<div>
				{canvasInput}
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
	internalObjectModel: React.PropTypes.bool,
	setDiagramJSON: React.PropTypes.func,
	setPaletteJSON: React.PropTypes.func,
	setLayoutDirection: React.PropTypes.func,
	useInternalObjectModel: React.PropTypes.func,
	log: React.PropTypes.func
};
