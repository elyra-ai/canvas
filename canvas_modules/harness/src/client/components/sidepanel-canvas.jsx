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
import PropTypes from "prop-types";
import FileUploader from "carbon-components-react/lib/components/FileUploader";
import Button from "carbon-components-react/lib/components/Button";
import Select from "carbon-components-react/lib/components/Select";
import SelectItemGroup from "carbon-components-react/lib/components/SelectItemGroup";
import SelectItem from "carbon-components-react/lib/components/SelectItem";
import Checkbox from "carbon-components-react/lib/components/Checkbox";
import RadioButtonGroup from "carbon-components-react/lib/components/RadioButtonGroup";
import RadioButton from "carbon-components-react/lib/components/RadioButton";
import Toggle from "carbon-components-react/lib/components/Toggle";
import TextInput from "carbon-components-react/lib/components/TextInput";


import {
	NONE_SAVE_ZOOM,
	LOCAL_STORAGE,
	PIPELINE_FLOW,
	NONE_DRAG,
	DURING_DRAG,
	AFTER_DRAG,
	CHOOSE_FROM_LOCATION,
	LOCAL_FILE_OPTION,
	VERTICAL_FORMAT,
	HORIZONTAL_FORMAT,
	HALO_CONNECTION,
	PORTS_CONNECTION,
	INTERACTION_MOUSE,
	INTERACTION_TRACKPAD,
	CURVE_LINKS,
	ELBOW_LINKS,
	STRAIGHT_LINKS,
	DIRECTION_LEFT_RIGHT,
	DIRECTION_TOP_BOTTOM,
	DIRECTION_BOTTOM_TOP,
	ASSOC_RIGHT_SIDE_CURVE,
	ASSOC_STRAIGHT,
	EXAMPLE_APP_NONE,
	EXAMPLE_APP_FLOWS,
	EXAMPLE_APP_BLUE_ELLIPSES,
	EXAMPLE_APP_EXPLAIN,
	EXAMPLE_APP_EXPLAIN2,
	EXAMPLE_APP_STREAMS,
	EXAMPLE_APP_TABLES,
	FLYOUT,
	ZOOM_TYPE_REGULAR,
	ZOOM_TYPE_HIDE_NEGATIVE_SPACE1,
	ZOOM_TYPE_HIDE_NEGATIVE_SPACE2,
	MODAL,
	TIP_PALETTE,
	TIP_NODES,
	TIP_PORTS,
	TIP_LINKS
} from "../constants/constants.js";
import FormsService from "../services/FormsService";

export default class SidePanelForms extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			canvasDiagram: "",
			canvasDiagram2: "",
			canvasPalette: "",
			canvasPalette2: "",
			canvasFiles: [],
			paletteFiles: [],
			controlsDisabled: this.props.getStateValue("selectedNodeLayout") !== EXAMPLE_APP_NONE
		};

		this.onCanvasFileSelect = this.onCanvasFileSelect.bind(this);
		this.onCanvasFileSelect2 = this.onCanvasFileSelect2.bind(this);
		this.isReadyToSubmitCanvasData = this.isReadyToSubmitCanvasData.bind(this);
		this.isReadyToSubmitCanvasData2 = this.isReadyToSubmitCanvasData2.bind(this);

		this.onCanvasPaletteSelect = this.onCanvasPaletteSelect.bind(this);
		this.onCanvasPaletteSelect2 = this.onCanvasPaletteSelect2.bind(this);
		this.isReadyToSubmitPaletteData = this.isReadyToSubmitPaletteData.bind(this);
		this.isReadyToSubmitPaletteData2 = this.isReadyToSubmitPaletteData2.bind(this);

		this.setStateValue = this.setStateValue.bind(this);
		this.enteredStateValue = this.enteredStateValue.bind(this);

		this.notificationConfigChange = this.notificationConfigChange.bind(this);
		this.notificationConfigToggle = this.notificationConfigToggle.bind(this);
		this.nodeLayoutOptionChange = this.nodeLayoutOptionChange.bind(this);
		this.tipConfigChange = this.tipConfigChange.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
	}
	// should be changed to componentDidMount but causes FVT tests to fail
	UNSAFE_componentWillMount() { // eslint-disable-line camelcase, react/sort-comp
		const that = this;

		FormsService.getFiles("diagrams")
			.then(function(res) {
				that.setState({ canvasFiles: res });
			});

		FormsService.getFiles("palettes")
			.then(function(res) {
				that.setState({ paletteFiles: res });
			});
	}

	onCanvasFileSelect(evt) {
		this.setState({ canvasDiagram: "" });
		this.props.canvasConfig.setDiagramJSON();
		if (evt.target.files.length > 0) {
			var filename = evt.target.files[0].name;
			var fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({ canvasDiagram: evt.target.files[0] });
				this.props.log("Canvas diagram JSON file selected", filename);
			}
		}
	}

	onCanvasFileSelect2(evt) {
		this.setState({ canvasDiagram2: "" });
		this.props.canvasConfig.setDiagramJSON2();
		if (evt.target.files.length > 0) {
			var filename = evt.target.files[0].name;
			var fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({ canvasDiagram2: evt.target.files[0] });
				this.props.log("Canvas diagram JSON file selected", filename);
			}
		}
	}

	onCanvasPaletteSelect(evt) {
		this.setState({ canvasPalette: "" });
		this.props.canvasConfig.setPaletteJSON({});
		if (evt.target.files.length > 0) {
			var filename = evt.target.files[0].name;
			var fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({ canvasPalette: evt.target.files[0] });
				this.props.log("Canvas palette JSON file selected", filename);
			}
		}
	}

	onCanvasPaletteSelect2(evt) {
		this.setState({ canvasPalette2: "" });
		this.props.canvasConfig.setPaletteJSON2({});
		if (evt.target.files.length > 0) {
			var filename = evt.target.files[0].name;
			var fileExt = filename.substring(filename.lastIndexOf(".") + 1);
			if (fileExt === "json") {
				this.setState({ canvasPalette2: evt.target.files[0] });
				this.props.log("Canvas palette JSON file selected", filename);
			}
		}
	}

	onCanvasDropdownSelect(evt) {
		this.props.canvasConfig.setCanvasDropdownFile(evt.target.selectedOptions[0].value);
	}

	onCanvasDropdownSelect2(evt) {
		this.props.canvasConfig.setCanvasDropdownFile2(evt.target.selectedOptions[0].value);
	}

	onPaletteDropdownSelect(evt) {
		this.props.canvasConfig.setPaletteDropdownSelect(evt.target.selectedOptions[0].value);
	}

	onPaletteDropdownSelect2(evt) {
		this.props.canvasConfig.setPaletteDropdownSelect2(evt.target.selectedOptions[0].value);
	}

	onDragStart(ev) {
		ev.dataTransfer.setData("text",
			JSON.stringify({
				operation: "addToCanvas",
				data: {
					editType: "createTestHarnessNode",
					op: "derive",
				}
			}));
	}

	// Set the state for the control in App.js. control will be set to the
	// corresponding field name in App.js state.
	setStateValue(value, control) {
		this.props.setStateValue(control, value);
	}

	enteredStateValue(evt) {
		this.props.setStateValue(evt.target.id, evt.target.value);
	}

	notificationConfigChange(evt) {
		let id = evt.target.id;
		let config = "notificationConfig";
		if (id.slice(-1) === "2") {
			id = evt.target.id.slice(0, -1);
			config = "notificationConfig2";
		}
		const notificationConfig = this.props.getStateValue(config);
		notificationConfig[id] = evt.target.value;
		this.props.setStateValue(notificationConfig, config);
	}

	notificationConfigToggle(value, control) {
		let id = control;
		let config = "notificationConfig";
		if (id.slice(-1) === "2") {
			id = control.slice(0, -1);
			config = "notificationConfig2";
		}
		const notificationConfig = this.props.getStateValue(config);
		notificationConfig[id] = value;
		this.props.setStateValue(notificationConfig, config);
	}

	nodeLayoutOptionChange(value) {
		if (value !== EXAMPLE_APP_NONE) {
			this.setState({ controlsDisabled: true });
		} else {
			this.setState({ controlsDisabled: false });
		}
		this.props.setStateValue("selectedNodeLayout", value);
	}

	tipConfigChange(checked, target) {
		const tipConf = Object.assign({}, this.props.getStateValue("selectedTipConfig"));
		switch (target) {
		case "tip_palette":
			tipConf.palette = checked;
			break;
		case "tip_nodes":
			tipConf.nodes = checked;
			break;
		case "tip_ports":
			tipConf.ports = checked;
			break;
		case "tip_links":
			tipConf.links = checked;
			break;
		default:
			return;
		}
		this.props.setStateValue("selectedTipConfig", tipConf);
	}

	submitCanvas() {
		if (this.state.canvasDiagram !== "") {
			var fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var fileContent = fileReader.result;
				var content = JSON.parse(fileContent);
				this.props.canvasConfig.setDiagramJSON(content);
			}.bind(this);
			fileReader.readAsText(this.state.canvasDiagram);
		}
	}

	submitCanvas2() {
		if (this.state.canvasDiagram2 !== "") {
			var fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var fileContent = fileReader.result;
				var content = JSON.parse(fileContent);
				this.props.canvasConfig.setDiagramJSON2(content);
			}.bind(this);
			fileReader.readAsText(this.state.canvasDiagram2);
		}
	}

	isReadyToSubmitCanvasData() {
		if (this.state.canvasDiagram !== "") {
			return true;
		}
		return false;
	}

	isReadyToSubmitCanvasData2() {
		if (this.state.canvasDiagram2 !== "") {
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
				this.props.canvasConfig.setPaletteJSON(content);
			}.bind(this);
			fileReader.readAsText(this.state.canvasPalette);
		}
	}

	submitPalette2() {
		if (this.state.canvasPalette2 !== "") {
			var fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var fileContent = fileReader.result;
				var content = JSON.parse(fileContent);
				this.props.canvasConfig.setPaletteJSON2(content);
			}.bind(this);
			fileReader.readAsText(this.state.canvasPalette2);
		}
	}

	isReadyToSubmitPaletteData() {
		if (this.state.canvasPalette !== "") {
			return true;
		}
		return false;
	}

	isReadyToSubmitPaletteData2() {
		if (this.state.canvasPalette2 !== "") {
			return true;
		}
		return false;
	}

	dropdownOptions(optionsInput, typeLabel) {
		const options = [];
		let key = 1;
		const groupOptions = [];
		const choosefromlocation = [];
		options.push(<SelectItem key = "choose-an-option" hidden text = "Choose an option..." />);
		choosefromlocation.push(
			<SelectItem key={"choose-from-location"} text = "Choose From Location" value = {CHOOSE_FROM_LOCATION} />);
		options.push(
			<SelectItemGroup key ={"choose-file-option"} label = {LOCAL_FILE_OPTION}>{choosefromlocation}
			</SelectItemGroup>);
		for (const option of optionsInput) {
			groupOptions.push(<SelectItem key={"param-def-option-" + key++} text={option} value={option} />);
		}
		options.push(<SelectItemGroup key ={"form-option"} label = {typeLabel}>{groupOptions}</SelectItemGroup>);
		return options;
	}

	render() {
		var divider = (<div className="harness-sidepanel-children harness-sidepanel-divider" />);
		var space = (<div className="harness-sidepanel-spacer" />);

		var canvasFileChooserVisible = <div />;
		if (this.props.canvasConfig.canvasFileChooserVisible) {
			canvasFileChooserVisible = (<div className="harness-sidepanel-file-uploader">
				<FileUploader
					small={"true"}
					buttonLabel="Choose file"
					accept={[".json"]}
					onChange={this.onCanvasFileSelect}
				/>
				{space}
				<div className="harness-sidepanel-file-upload-submit">
					<Button size="small"
						disabled={!this.isReadyToSubmitCanvasData()}
						onClick={this.submitCanvas.bind(this)}
					>
					Submit
					</Button>
				</div>
			</div>);
		}

		var paletteFileChooserVisible = <div />;
		if (this.props.canvasConfig.paletteFileChooserVisible) {
			paletteFileChooserVisible = (<div className="harness-sidepanel-file-uploader">
				<FileUploader
					small={"true"}
					buttonLabel="Choose file"
					accept={[".json"]}
					onChange={this.onCanvasPaletteSelect}
				/>
				{space}
				<div className="harness-sidepanel-file-upload-submit">
					<Button size="small"
						disabled={!this.isReadyToSubmitPaletteData()}
						onClick={this.submitPalette.bind(this)}
					>
					Submit
					</Button>
				</div>
			</div>);
		}

		var canvasInput = (<div className="harness-sidepanel-children" id="harness-sidepanel-canvas-input">
			<div className="harness-sidepanel-headers">Canvas Diagram</div>
			<Select
				id="harness-sidepanel-canvas-dropdown"
				label="Canvas"
				aria-label="Canvas"
				onChange={this.onCanvasDropdownSelect.bind(this)}
				disabled={this.state.disabledControls}
			>
				{this.dropdownOptions(this.state.canvasFiles, "Canvas")}
			</Select>
			{canvasFileChooserVisible}
		</div>);

		var paletteInput = (<div className="harness-sidepanel-children" id="harness-sidepanel-palette-input">
			<div className="harness-sidepanel-headers">Canvas Palette</div>
			<Select
				id="harness-sidepanel-palette-dropdown"
				label="Palette"
				aria-label="Palette"
				onChange={this.onPaletteDropdownSelect.bind(this)}
			>
				{this.dropdownOptions(this.state.paletteFiles, "Palette")}
			</Select>
			{paletteFileChooserVisible}
		</div>);

		var canvasFileChooserVisible2 = <div />;
		if (this.props.canvasConfig.canvasFileChooserVisible2) {
			canvasFileChooserVisible2 = (<div className="harness-sidepanel-file-uploader">
				{space}
				<FileUploader
					small={"true"}
					buttonLabel="Chose file"
					accept={[".json"]}
					onChange={this.onCanvasFileSelect2}
				/>
				{space}
				<div className="harness-sidepanel-file-upload-submit">
					<Button size="small"
						disabled={!this.isReadyToSubmitCanvasData2()}
						onClick={this.submitCanvas2.bind(this)}
					>
					Submit
					</Button>
				</div>
			</div>);
		}

		var paletteFileChooserVisible2 = <div />;
		if (this.props.canvasConfig.paletteFileChooserVisible2) {
			paletteFileChooserVisible2 = (<div className="harness-sidepanel-file-uploader">
				{space}
				<FileUploader
					small={"true"}
					buttonLabel="Chose file"
					accept={[".json"]}
					onChange={this.onCanvasPaletteSelect2}
				/>
				{space}
				<div className="harness-sidepanel-file-upload-submit">
					<Button size="small"
						disabled={!this.isReadyToSubmitPaletteData2()}
						onClick={this.submitPalette2.bind(this)}
					>
					Submit
					</Button>
				</div>
			</div>);
		}

		var canvasInput2 = (<div className="harness-sidepanel-children" id="harness-sidepanel-canvas-input2">
			<div className="harness-sidepanel-headers">Canvas Diagram</div>
			<Select
				id="harness-sidepanel-canvas2-dropdown"
				disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
				label="Canvas"
				aria-label="Canvas"
				onChange={this.onCanvasDropdownSelect2.bind(this)}
			>
				{this.dropdownOptions(this.state.canvasFiles, "Canvas")}
			</Select>
			{canvasFileChooserVisible2}
		</div>);

		var paletteInput2 = (<div className="harness-sidepanel-children" id="harness-sidepanel-palette-input2">
			<div className="harness-sidepanel-headers">Canvas Palette</div>
			<Select
				id="harness-sidepanel-palette2-dropdown"
				disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
				label="Palette"
				aria-label="Palette"
				onChange={this.onPaletteDropdownSelect2.bind(this)}
			>
				{this.dropdownOptions(this.state.paletteFiles, "Palette")}
			</Select>
			{paletteFileChooserVisible2}
		</div>);

		const pad = { "paddingLeft": "8px" };

		var saveZoom = (<div>
			<div className="harness-sidepanel-children" id="harness-sidepanel-save-zoom">
				<div className="harness-sidepanel-headers">Save Zoom</div>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="selectedSaveZoom" // Set name to corresponding field name in App.js
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedSaveZoom")}
				>
					<RadioButton
						value={NONE_SAVE_ZOOM}
						labelText={NONE_SAVE_ZOOM}
					/>
					<RadioButton
						value={LOCAL_STORAGE}
						labelText={LOCAL_STORAGE}
					/>
					<RadioButton
						value={PIPELINE_FLOW}
						labelText={PIPELINE_FLOW}
					/>
				</RadioButtonGroup>
			</div>
			<div className="harness-sidepanel-spacer" />
			<div style={pad}className="harness-sidepanel-clear-saved-storage">
				<Button size="small"
					onClick={this.props.canvasConfig.clearSavedZoomValues}
				>
				Clear local storage zoom values
				</Button>
			</div>
		</div>
		);

		var zoomType = (<div>
			<div className="harness-sidepanel-children" id="harness-sidepanel-zoom-type">
				<div className="harness-sidepanel-headers">Zoom Type</div>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="selectedZoomType" // Set name to corresponding field name in App.js
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedZoomType")}
				>
					<RadioButton
						value={ZOOM_TYPE_REGULAR}
						labelText={ZOOM_TYPE_REGULAR}
					/>
					<RadioButton
						value={ZOOM_TYPE_HIDE_NEGATIVE_SPACE1}
						labelText={ZOOM_TYPE_HIDE_NEGATIVE_SPACE1}
					/>
					<RadioButton
						value={ZOOM_TYPE_HIDE_NEGATIVE_SPACE2}
						labelText={ZOOM_TYPE_HIDE_NEGATIVE_SPACE2}
					/>
				</RadioButtonGroup>
			</div>
		</div>
		);

		var rbSize = { "height": "80px" };
		var entrySize = { "width": "80px", "minWidth": "80px" };

		var snapToGrid = (<div className="harness-sidepanel-children" id="harness-sidepanel-snap-to-grid-type">
			<div className="harness-sidepanel-headers">Snap to Grid on Drag/Resize</div>
			<div style={rbSize}>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="selectedSnapToGridType" // Set name to corresponding field name in App.js
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedSnapToGridType")}
				>
					<RadioButton
						value={NONE_DRAG}
						labelText={NONE_DRAG}
					/>
					<RadioButton
						value={DURING_DRAG}
						labelText={DURING_DRAG}
					/>
					<RadioButton
						value={AFTER_DRAG}
						labelText={AFTER_DRAG}
					/>
				</RadioButtonGroup>
			</div>
			<div className="harness-sidepanel-headers">
				Enter a pixel size or percentage of node width/height ("25%").
			</div>
			<div className="harness-snap-to-grid">
				<TextInput
					style={entrySize}
					id="enteredSnapToGridX" // Set ID to corresponding field in App.js state
					labelText="X Grid Size"
					placeholder="X Size"
					onChange={this.enteredStateValue}
					value={this.props.getStateValue("enteredSnapToGridX")}
				/>
				<TextInput style={entrySize}
					id="enteredSnapToGridY" // Set ID to corresponding field in App.js state
					labelText="Y Grid Size"
					placeholder="Y Size"
					onChange={this.enteredStateValue}
					value={this.props.getStateValue("enteredSnapToGridY")}
				/>
			</div>
		</div>);

		var enableDragWithoutSelect = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Enable Drag Without Select</div>
				<div>
					<Toggle
						id="selectedDragWithoutSelect" // Set ID to corresponding field in App.js state
						toggled={this.props.getStateValue("selectedDragWithoutSelect")}
						onToggle={this.setStateValue}
					/>
				</div>
			</form>
		</div>);

		var enableAssocLinkCreation = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Enable Association Link Creation</div>
				<div>
					<Toggle
						id="selectedAssocLinkCreation" // Set ID to corresponding field in App.js state
						toggled={this.props.getStateValue("selectedAssocLinkCreation")}
						onToggle={this.setStateValue}
					/>
				</div>
			</form>
		</div>);

		var assocLinkType = (<div className="harness-sidepanel-children" id="harness-sidepanel-assoc-link-type">
			<div className="harness-sidepanel-headers">Association Link Type</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="selectedAssocLinkType" // Set name to corresponding field name in App.js
				onChange={this.setStateValue}
				defaultSelected={this.props.getStateValue("selectedAssocLinkType")}
			>
				<RadioButton
					value={ASSOC_STRAIGHT}
					labelText={ASSOC_STRAIGHT}
				/>
				<RadioButton
					value={ASSOC_RIGHT_SIDE_CURVE}
					labelText={ASSOC_RIGHT_SIDE_CURVE}
				/>
			</RadioButtonGroup>
		</div>);

		var enableObjectModel = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Use Object Model</div>
				<div>
					<Toggle
						id="selectedInternalObjectModel" // Set ID to corresponding field in App.js state
						toggled={this.props.getStateValue("selectedInternalObjectModel")}
						onToggle={this.setStateValue}
					/>
				</div>
			</form>
		</div>);

		var enableSaveToPalette = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-save-to-palette-toggle">
				<form>
					<div className="harness-sidepanel-headers">Enable Save To Palette</div>
					<div>
						<Toggle
							id="selectedSaveToPalette" // Set ID to corresponding field in App.js state
							toggled={this.props.getStateValue("selectedSaveToPalette")}
							onToggle={this.setStateValue}
						/>
					</div>
				</form>
			</div>);

		var enableInsertNodeDroppedOnLink = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-insert-node-dropped-on-link-toggle">
				<form>
					<div className="harness-sidepanel-headers">Enable Insert Node Droped On Link</div>
					<div>
						<Toggle
							id="selectedInsertNodeDroppedOnLink" // Set ID to corresponding field in App.js state
							toggled={this.props.getStateValue("selectedInsertNodeDroppedOnLink")}
							onToggle={this.setStateValue}
						/>
					</div>
				</form>
			</div>);

		var enableZoomIntoSubFlows = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-zoom-into-subflows-toggle">
				<form>
					<div className="harness-sidepanel-headers">Enable Zoom Into Sub-flows</div>
					<div>
						<Toggle
							id="selectedZoomIntoSubFlows" // Set ID to corresponding field in App.js state
							toggled={this.props.getStateValue("selectedZoomIntoSubFlows")}
							onToggle={this.setStateValue}
						/>
					</div>
				</form>
			</div>);

		var enableDropZoneOnExternalDrag = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-drop-zone-on-external-drag-toggle">
				<form>
					<div className="harness-sidepanel-headers">Enable Drop Zone on Drag</div>
					<div>
						<Toggle
							id="selectedDropZoneOnExternalDrag" // Set ID to corresponding field in App.js state
							toggled={this.props.getStateValue("selectedDropZoneOnExternalDrag")}
							onToggle={this.setStateValue}
						/>
					</div>
				</form>
			</div>);

		var enableCreateSupernodeNonContiguous = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Enable Create Supernode for Noncontiguous Nodes</div>
				<div>
					<Toggle
						id="selectedCreateSupernodeNonContiguous" // Set ID to corresponding field in App.js state
						toggled={this.props.getStateValue("selectedCreateSupernodeNonContiguous")}
						onToggle={this.setStateValue}
					/>
				</div>
			</form>
		</div>);

		var enableMoveNodesOnSupernodeResize = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">
					Enable move surrounding nodes when resizing a supernode.</div>
				<div>
					<Toggle
						id="selectedMoveNodesOnSupernodeResize" // Set ID to corresponding field in App.js state
						toggled={this.props.getStateValue("selectedMoveNodesOnSupernodeResize")}
						onToggle={this.setStateValue}
					/>
				</div>
			</form>
		</div>);

		var interactionType = (<div className="harness-sidepanel-children" id="harness-sidepanel-interaction-type">
			<div className="harness-sidepanel-headers">Interaction Type</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="selectedInteractionType" // Set name to corresponding field name in App.js
				onChange={this.setStateValue}
				defaultSelected={this.props.getStateValue("selectedInteractionType")}
			>
				<RadioButton
					value={INTERACTION_MOUSE}
					labelText={INTERACTION_MOUSE}
				/>
				<RadioButton
					value={INTERACTION_TRACKPAD}
					labelText={INTERACTION_TRACKPAD}
				/>
			</RadioButtonGroup>
		</div>);

		var connectionType = (<div className="harness-sidepanel-children" id="harness-sidepanel-connection-type">
			<div className="harness-sidepanel-headers">Connection Type</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="selectedConnectionType" // Set name to corresponding field name in App.js
				onChange={this.setStateValue}
				defaultSelected={this.props.getStateValue("selectedConnectionType")}
			>
				<RadioButton
					value={PORTS_CONNECTION}
					labelText={PORTS_CONNECTION}
				/>
				<RadioButton
					value={HALO_CONNECTION}
					labelText={HALO_CONNECTION}
				/>
			</RadioButtonGroup>
		</div>);

		var nodeFormatType = (<div className="harness-sidepanel-children">
			<div className="harness-sidepanel-headers">Node Format Type (for 'Ports')</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="selectedNodeFormat" // Set name to corresponding field name in App.js
				onChange={this.setStateValue}
				defaultSelected={this.props.getStateValue("selectedNodeFormat")}
			>
				<RadioButton
					value={VERTICAL_FORMAT}
					labelText={VERTICAL_FORMAT}
				/>
				<RadioButton
					value={HORIZONTAL_FORMAT}
					labelText={HORIZONTAL_FORMAT}
				/>
			</RadioButtonGroup>
		</div>);

		var linkType = (<div className="harness-sidepanel-children" id="harness-sidepanel-link-type">
			<div className="harness-sidepanel-headers">Link Type (for 'Ports')</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="selectedLinkType" // Set name to corresponding field name in App.js
				onChange={this.setStateValue}
				defaultSelected={this.props.getStateValue("selectedLinkType")}
			>
				<RadioButton
					value={CURVE_LINKS}
					labelText={CURVE_LINKS}
				/>
				<RadioButton
					value={ELBOW_LINKS}
					labelText={ELBOW_LINKS}
				/>
				<RadioButton
					value={STRAIGHT_LINKS}
					labelText={STRAIGHT_LINKS}
				/>
			</RadioButtonGroup>
		</div>);

		var linkDirection = (<div className="harness-sidepanel-children" id="harness-sidepanel-link-direction">
			<div className="harness-sidepanel-headers">Link Direction (for 'Ports')</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="selectedLinkDirection" // Set name to corresponding field name in App.js
				onChange={this.setStateValue}
				defaultSelected={this.props.getStateValue("selectedLinkDirection")}
			>
				<RadioButton
					value={DIRECTION_LEFT_RIGHT}
					labelText={DIRECTION_LEFT_RIGHT}
				/>
				<RadioButton
					value={DIRECTION_TOP_BOTTOM}
					labelText={DIRECTION_TOP_BOTTOM}
				/>
				<RadioButton
					value={DIRECTION_BOTTOM_TOP}
					labelText={DIRECTION_BOTTOM_TOP}
				/>
			</RadioButtonGroup>
		</div>);

		const exampleApps = (<div className="harness-sidepanel-children">
			<div className="harness-sidepanel-headers">Example canvas apps</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="node_layout_radio"
				onChange={this.nodeLayoutOptionChange}
				defaultSelected={this.props.getStateValue("selectedNodeLayout")}
			>
				<RadioButton
					value={EXAMPLE_APP_FLOWS}
					labelText={EXAMPLE_APP_FLOWS}
				/>
				<RadioButton
					value={EXAMPLE_APP_EXPLAIN}
					labelText={EXAMPLE_APP_EXPLAIN}
				/>
				<RadioButton
					value={EXAMPLE_APP_EXPLAIN2}
					labelText={EXAMPLE_APP_EXPLAIN2}
				/>
				<RadioButton
					value={EXAMPLE_APP_STREAMS}
					labelText={EXAMPLE_APP_STREAMS}
				/>
				<RadioButton
					value={EXAMPLE_APP_TABLES}
					labelText={EXAMPLE_APP_TABLES}
				/>
				<RadioButton
					value={EXAMPLE_APP_BLUE_ELLIPSES}
					labelText={EXAMPLE_APP_BLUE_ELLIPSES}
				/>
				<RadioButton
					value={EXAMPLE_APP_NONE}
					labelText={EXAMPLE_APP_NONE}
				/>
			</RadioButtonGroup>
		</div>);

		var paletteLayout = (<div className="harness-sidepanel-children" id="harness-sidepanel-palette-layout">
			<div className="harness-sidepanel-headers">Palette Layout</div>
			<RadioButtonGroup
				name="selectedPaletteLayout" // Set name to corresponding field name in App.js
				className="harness-sidepanel-radio-group"
				onChange={this.setStateValue}
				defaultSelected={this.props.getStateValue("selectedPaletteLayout")}
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
			<div className="harness-sidepanel-headers">Show Narrow Palette</div>
			<div>
				<Toggle
					id="selectedNarrowPalette" // Set ID to corresponding field in App.js state
					toggled={this.props.getStateValue("selectedNarrowPalette")}
					onToggle={this.setStateValue}
				/>
			</div>
		</div>);

		var tipConfig = (<div className="harness-sidepanel-children" id="harness-sidepanel-tip-config">
			<div className="harness-sidepanel-headers">Tips</div>
			<Checkbox
				id="tip_palette"
				labelText={TIP_PALETTE}
				onChange={this.tipConfigChange}
				checked={this.props.getStateValue("selectedTipConfig").palette}
			/>
			<Checkbox
				id="tip_nodes"
				labelText={TIP_NODES}
				onChange={this.tipConfigChange}
				checked={this.props.getStateValue("selectedTipConfig").nodes}
			/>
			<Checkbox
				id="tip_ports"
				labelText={TIP_PORTS}
				onChange={this.tipConfigChange}
				checked={this.props.getStateValue("selectedTipConfig").ports}
			/>
			<Checkbox
				id="tip_links"
				labelText={TIP_LINKS}
				onChange={this.tipConfigChange}
				checked={this.props.getStateValue("selectedTipConfig").links}
			/>
		</div>);

		var extraCanvas = (<div className="harness-sidepanel-children" id="harness-sidepanel-extra-canvas">
			<form>
				<div className="harness-sidepanel-headers">Extra canvas</div>
				<div>
					<Toggle
						id="selectedExtraCanvasDisplayed" // Set ID to corresponding field in App.js state
						toggled={this.props.getStateValue("selectedExtraCanvasDisplayed")}
						onToggle={this.setStateValue}
					/>
				</div>
			</form>
		</div>);

		var nodeDraggable = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">
					Draggable Node (Requires modelerPalette.json to be set.)
				</div>
				<div id="harness-sidePanelNodeDraggable" draggable="true"
					onDragStart={this.onDragStart} onDragOver={this.onDragOver}
				>
					<div className="harness-sidepanel-list-item-icon">
						<img draggable="false" src="/images/nodes/derive.svg" />
					</div>
					<div>
						<span className="harness-sidepanel-list-item-text">Derive</span>
					</div>
				</div>
			</form>
		</div>);

		var schemaValidation = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Schema Validation</div>
				<div>
					<Toggle
						id="selectedSchemaValidation" // Set ID to corresponding field in App.js state
						toggled={this.props.getStateValue("selectedSchemaValidation")}
						onToggle={this.setStateValue}
					/>
				</div>
			</form>
		</div>);

		var displayBoudingRectangles = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Display Bounding Rectangles</div>
				<div>
					<Toggle
						id="selectedBoundingRectangles" // Set ID to corresponding field in App.js state
						toggled={this.props.getStateValue("selectedBoundingRectangles")}
						onToggle={this.setStateValue}
					/>
				</div>
			</form>
		</div>);

		var configureNotificationCenter = (<div className="harness-sidepanel-children" id="harness-sidepanel-configure-notification-center">
			<div className="harness-sidepanel-headers">Configure Notification Center</div>
			<div className="harness-notification-title">
				<TextInput
					id="notificationHeader" // Set ID to corresponding field in App.js state
					labelText="Title (will show default if empty)"
					onChange={this.notificationConfigChange}
					value={this.props.getStateValue("notificationConfig").notificationHeader}
				/>
			</div>
			<div className="harness-notification-subtitle">
				<TextInput
					id="notificationSubtitle" // Set ID to corresponding field in App.js state
					labelText="Subtitle (will hide if empty)"
					onChange={this.notificationConfigChange}
					value={this.props.getStateValue("notificationConfig").notificationSubtitle}
				/>
			</div>
			<div className="harness-notification-empty-message">
				<TextInput
					id="emptyMessage" // Set ID to corresponding field in App.js state
					labelText="Empty Message"
					onChange={this.notificationConfigChange}
					value={this.props.getStateValue("notificationConfig").emptyMessage}
				/>
			</div>
			<div className="harness-notification-clear-all">
				<TextInput
					id="clearAllMessage" // Set ID to corresponding field in App.js state
					labelText="Clear All button (will hide if empty)"
					onChange={this.notificationConfigChange}
					value={this.props.getStateValue("notificationConfig").clearAllMessage}
				/>
			</div>
			<form>
				<div className="harness-sidepanel-headers">Keep Notification Center Open</div>
				<div>
					<Toggle
						id="keepOpen" // Set ID to corresponding field in App.js state
						labelText="When enabled, clicking outside the notification center will not close it"
						toggled={this.props.getStateValue("notificationConfig").keepOpen}
						onToggle={this.notificationConfigToggle}
					/>
				</div>
			</form>
		</div>);

		var configureNotificationCenter2 = (<div className="harness-sidepanel-children" id="harness-sidepanel-configure-notification-center2">
			<div className="harness-sidepanel-headers">Configure Notification Center 2</div>
			<div className="harness-notification-title">
				<TextInput
					id="notificationHeader2" // Set ID to corresponding field in App.js state
					disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
					labelText="Title (will show default if empty)"
					onChange={this.notificationConfigChange}
					value={this.props.getStateValue("notificationConfig2").notificationHeader}
				/>
			</div>
			<div className="harness-notification-subtitle">
				<TextInput
					id="notificationSubtitle2"
					disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
					labelText="Subtitle (will hide if empty)"
					onChange={this.notificationConfigChange}
					value={this.props.getStateValue("notificationConfig2").notificationSubtitle}
				/>
			</div>
			<div className="harness-notification-empty-message">
				<TextInput
					id="emptyMessage2"
					disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
					labelText="Empty Message"
					onChange={this.notificationConfigChange}
					value={this.props.getStateValue("notificationConfig2").emptyMessage}
				/>
			</div>
			<div className="harness-notification-clear-all">
				<TextInput
					id="clearAllMessage2"
					disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
					labelText="Clear All button (will hide if empty)"
					onChange={this.notificationConfigChange}
					value={this.props.getStateValue("notificationConfig2").clearAllMessage}
				/>
			</div>
			<form>
				<div className="harness-sidepanel-headers">Keep Notification Center Open</div>
				<div>
					<Toggle
						id="keepOpen2"
						disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
						labelText="When enabled, clicking outside the notification center will not close it"
						toggled={this.props.getStateValue("notificationConfig2").keepOpen}
						onToggle={this.notificationConfigToggle}
					/>
				</div>
			</form>
		</div>);

		const displayFullLabelOnHover = (
			<div className="harness-sidepanel-children">
				<div className="harness-sidepanel-headers">Display full node label on hover</div>
				<Toggle
					id="selectedDisplayFullLabelOnHover" // Set ID to corresponding field in App.js state
					toggled={this.props.getStateValue("selectedDisplayFullLabelOnHover")}
					onToggle={this.setStateValue}
				/>
			</div>);

		const disabledStyle = this.state.controlsDisabled ? { pointerEvents: "none", opacity: "0.4" } : {};

		return (
			<div>
				{exampleApps}
				{divider}
				<div style={disabledStyle}>
					{canvasInput}
					{divider}
					{paletteInput}
					{divider}
					{connectionType}
					{divider}
					{nodeFormatType}
					{divider}
					{linkType}
					{divider}
					{linkDirection}
					{divider}
					{interactionType}
					{divider}
					{snapToGrid}
					{divider}
					{zoomType}
					{divider}
					{saveZoom}
					{divider}
					{enableZoomIntoSubFlows}
					{divider}
					{paletteLayout}
					{divider}
					{enableDragWithoutSelect}
					{divider}
					{enableInsertNodeDroppedOnLink}
					{divider}
					{enableAssocLinkCreation}
					{divider}
					{assocLinkType}
					{divider}
					{enableObjectModel}
					{divider}
					{enableSaveToPalette}
					{divider}
					{enableDropZoneOnExternalDrag}
					{divider}
					{enableCreateSupernodeNonContiguous}
					{divider}
					{enableMoveNodesOnSupernodeResize}
					{divider}
					{displayBoudingRectangles}
					{divider}
					{schemaValidation}
					{divider}
					{displayFullLabelOnHover}
					{divider}
					{tipConfig}
					{divider}
					{nodeDraggable}
					{divider}
					{configureNotificationCenter}
					{divider}
					{extraCanvas}
					{canvasInput2}
					{paletteInput2}
					{divider}
					{configureNotificationCenter2}
				</div>
			</div>
		);
	}
}

SidePanelForms.propTypes = {
	log: PropTypes.func,
	setStateValue: PropTypes.func,
	getStateValue: PropTypes.func,
	canvasConfig: PropTypes.shape({
		setDiagramJSON: PropTypes.func,
		setPaletteJSON: PropTypes.func,
		setDiagramJSON2: PropTypes.func,
		setPaletteJSON2: PropTypes.func,
		canvasFileChooserVisible: PropTypes.bool,
		canvasFileChooserVisible2: PropTypes.bool,
		paletteFileChooserVisible: PropTypes.bool,
		paletteFileChooserVisible2: PropTypes.bool,
		selectedSaveToPalette: PropTypes.bool,
		selectedDropZoneOnExternalDrag: PropTypes.bool,
		selectedInsertNodeDroppedOnLink: PropTypes.bool,
		selectedCreateSupernodeNonContiguous: PropTypes.bool,
		selectedCanvasDropdownFile: PropTypes.string,
		selectedCanvasDropdownFile2: PropTypes.string,
		setCanvasDropdownFile: PropTypes.func,
		setCanvasDropdownFile2: PropTypes.func,
		selectedPaletteDropdownFile: PropTypes.string,
		selectedPaletteDropdownFile2: PropTypes.string,
		setPaletteDropdownSelect: PropTypes.func,
		setPaletteDropdownSelect2: PropTypes.func,
		clearSavedZoomValues: PropTypes.func
	})
};
