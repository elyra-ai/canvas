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
	Dropdown,
	RadioGroup,
	ToggleButton
} from "ap-components-react/dist/ap-components-react";
import {
	BLANK_CANVAS,
	NONE,
	HORIZONTAL,
	VERTICAL,
	CHOOSE_FROM_LOCATION
} from "../constants/constants.js";
import FormsService from "../services/FormsService";

export default class SidePanelForms extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			canvasDiagram: "",
			canvasPalette: "",
			canvasFileChooserVisible: false,
			paletteFileChooserVisible: false,
			canvasFiles: [],
			paletteFiles: [],
			selectedCanvasDropdownFile: "",
			selectedPaletteDropdownFile: ""
		};

		this.onCanvasFileSelect = this.onCanvasFileSelect.bind(this);
		this.isReadyToSubmitCanvasData = this.isReadyToSubmitCanvasData.bind(this);

		this.onCanvasPaletteSelect = this.onCanvasPaletteSelect.bind(this);
		this.isReadyToSubmitPaletteData = this.isReadyToSubmitPaletteData.bind(this);

		this.layoutDirectionOptionChange = this.layoutDirectionOptionChange.bind(this);
		this.useInternalObjectModel = this.useInternalObjectModel.bind(this);
	}

	componentWillMount() {
		var that = this;

		FormsService.getFiles("diagrams")
		.then(function(res) {
			var list = res;
			list.unshift(CHOOSE_FROM_LOCATION);
			that.setState({ canvasFiles: res });
		});

		FormsService.getFiles("palettes")
		.then(function(res) {
			var list = res;
			list.unshift(CHOOSE_FROM_LOCATION);
			that.setState({ paletteFiles: res });
		});
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

	onCanvasDropdownSelect(evt, obj) {
		if (obj.selected === CHOOSE_FROM_LOCATION) {
			this.setState({
				canvasFileChooserVisible: true,
				selectedCanvasDropdownFile: ""
			});
		} else {
			this.setState({
				selectedCanvasDropdownFile: obj.selected,
				canvasDiagram: "",
				canvasFileChooserVisible: false
			});
		}
	}

	onPaletteDropdownSelect(evt, obj) {
		if (obj.selected === CHOOSE_FROM_LOCATION) {
			this.setState({
				paletteFileChooserVisible: true,
				selectedPaletteDropdownFile: ""
			});
		} else {
			this.setState({
				selectedPaletteDropdownFile: obj.selected,
				canvasPalette: "",
				paletteFileChooserVisible: false
			});
		}
	}

	submitCanvas() {
		if (this.state.canvasDiagram !== "") {
			var fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var fileContent = fileReader.result;
				var content = JSON.parse(fileContent);
				this.props.setDiagramJSON(content);
			}.bind(this);
			fileReader.readAsText(this.state.canvasDiagram);
		} else {
			this.props.log("Submit canvas diagram", this.state.selectedPropertiesDropdownFile);
			var that = this;
			FormsService.getFileContent("diagrams", this.state.selectedCanvasDropdownFile)
			.then(function(res) {
				that.props.setDiagramJSON(res);
			});
		}
	}

	isReadyToSubmitCanvasData() {
		if (this.state.canvasDiagram !== "" || this.state.selectedCanvasDropdownFile !== "") {
			return true;
		}
		return false;
	}

	submitPalette() {
		if (this.state.canvasPalette !== "") {
			var fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var fileContent = fileReader.result;
				var content = JSON.parse(fileContent);
				this.props.setPaletteJSON(content);
			}.bind(this);
			fileReader.readAsText(this.state.canvasPalette);
		} else {
			this.props.log("Submit canvas palette", this.state.selectedPaletteDropdownFile);
			var that = this;
			FormsService.getFileContent("palettes", this.state.selectedPaletteDropdownFile)
			.then(function(res) {
				that.props.setPaletteJSON(res);
			});
		}
		// enable palette in nav
		if (this.isReadyToSubmitPaletteData()) {
			this.props.enableNavPalette(true);
		}
	}

	isReadyToSubmitPaletteData() {
		if (this.state.canvasPalette !== "" || this.state.selectedPaletteDropdownFile !== "") {
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
		var space = (<div className="sidepanel-spacer" />);

		var canvasFileChooserVisible = <div></div>;
		if (this.state.canvasFileChooserVisible) {
			canvasFileChooserVisible = (<div>
				<FormControl
					required="required"
					id="canvasFileInput"
					type="file"
					accept=".json"
					ref="canvasDiagram"
					onChange={this.onCanvasFileSelect}
				/>
				{space}
			</div>);
		}

		var paletteFileChooserVisible = <div></div>;
		if (this.state.paletteFileChooserVisible) {
			paletteFileChooserVisible = (<div>
				<FormControl
					required="required"
					id="paletteJsonInput"
					type="file"
					accept=".json"
					ref="canvasPalette"
					onChange={this.onCanvasPaletteSelect}
				/>
			{space}
			</div>);
		}

		var canvasInput = (<div className="sidepanel-children" id="sidepanel-canvas-input">
			<div className="canvasField">
				<div className="sidepanel-headers">Canvas Diagram</div>
				<Dropdown
					name="CanvasDropdown"
					text="Canvas"
					id="sidepanel-canvas-dropdown"
					maxVisibleItems={10}
					dark
					options={this.state.canvasFiles}
					onSelect={this.onCanvasDropdownSelect.bind(this)}
					value={this.state.selectedCanvasDropdownFile}
				/>
				{space}
				{canvasFileChooserVisible}
				<Button dark
					disabled={!this.isReadyToSubmitCanvasData()}
					onClick={this.submitCanvas.bind(this)}
				>
					Submit
				</Button>
			</div>
		</div>);

		var paletteInput = (<div className="sidepanel-children" id="sidepanel-palette-input">
			<div className="formField">
				<div className="sidepanel-headers">Canvas Palette</div>
				<Dropdown
					name="PaletteDropdown"
					text="Palette"
					id="sidepanel-palette-dropdown"
					maxVisibleItems={10}
					dark
					options={this.state.paletteFiles}
					onSelect={this.onPaletteDropdownSelect.bind(this)}
					value={this.state.selectedPaletteDropdownFile}
				/>
				{space}
				{paletteFileChooserVisible}
				<Button dark
					disabled={!this.isReadyToSubmitPaletteData()}
					onClick={this.submitPalette.bind(this)}
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
