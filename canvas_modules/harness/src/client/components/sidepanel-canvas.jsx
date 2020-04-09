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
import {
	FileUploader,
	Button,
	Select,
	SelectItem,
	SelectItemGroup,
	Checkbox,
	RadioButtonGroup,
	RadioButton,
	Toggle,
	TextInput
} from "carbon-components-react";


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
	MOUSE_INTERACTION,
	TRACKPAD_INTERACTION,
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
			controlsDisabled: this.props.canvasConfig.selectedNodeLayout !== EXAMPLE_APP_NONE
		};

		this.onCanvasFileSelect = this.onCanvasFileSelect.bind(this);
		this.onCanvasFileSelect2 = this.onCanvasFileSelect2.bind(this);
		this.isReadyToSubmitCanvasData = this.isReadyToSubmitCanvasData.bind(this);
		this.isReadyToSubmitCanvasData2 = this.isReadyToSubmitCanvasData2.bind(this);

		this.onCanvasPaletteSelect = this.onCanvasPaletteSelect.bind(this);
		this.onCanvasPaletteSelect2 = this.onCanvasPaletteSelect2.bind(this);
		this.isReadyToSubmitPaletteData = this.isReadyToSubmitPaletteData.bind(this);
		this.isReadyToSubmitPaletteData2 = this.isReadyToSubmitPaletteData2.bind(this);

		this.saveZoomOptionChange = this.saveZoomOptionChange.bind(this);
		this.snapToGridOptionChange = this.snapToGridOptionChange.bind(this);
		this.useInternalObjectModel = this.useInternalObjectModel.bind(this);
		this.useEnableDragWithoutSelect = this.useEnableDragWithoutSelect.bind(this);
		this.useEnableInsertNodeDroppedOnLink = this.useEnableInsertNodeDroppedOnLink.bind(this);
		this.useEnableAssocLinkCreation = this.useEnableAssocLinkCreation.bind(this);
		this.useEnableSaveToPalette = this.useEnableSaveToPalette.bind(this);
		this.useEnableDropZoneOnExternalDrag = this.useEnableDropZoneOnExternalDrag.bind(this);
		this.useEnableCreateSupernodeNonContiguous = this.useEnableCreateSupernodeNonContiguous.bind(this);
		this.onEnableMoveNodesOnSupernodeResizeToggle = this.onEnableMoveNodesOnSupernodeResizeToggle.bind(this);
		this.connectionTypeOptionChange = this.connectionTypeOptionChange.bind(this);
		this.interactionTypeOptionChange = this.interactionTypeOptionChange.bind(this);
		this.nodeFormatTypeOptionChange = this.nodeFormatTypeOptionChange.bind(this);
		this.linkTypeOptionChange = this.linkTypeOptionChange.bind(this);
		this.linkDirectionOptionChange = this.linkDirectionOptionChange.bind(this);
		this.assocLinkTypeOptionChange = this.assocLinkTypeOptionChange.bind(this);
		this.nodeLayoutOptionChange = this.nodeLayoutOptionChange.bind(this);
		this.paletteLayoutOptionChange = this.paletteLayoutOptionChange.bind(this);
		this.tipConfigChange = this.tipConfigChange.bind(this);
		this.extraCanvasChange = this.extraCanvasChange.bind(this);
		this.schemaValidationChange = this.schemaValidationChange.bind(this);
		this.narrowPalette = this.narrowPalette.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.changeDisplayFullLabelOnHover = this.changeDisplayFullLabelOnHover.bind(this);
		this.useZoomIntoSubFlows = this.useZoomIntoSubFlows.bind(this);
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
		this.props.canvasConfig.enableNavPalette(false);
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
		this.props.canvasConfig.enableNavPalette(false);
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

	onEnableMoveNodesOnSupernodeResizeToggle(checked) {
		this.props.canvasConfig.setEnableMoveNodesOnSupernodeResize(checked);
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
		// enable palette
		if (this.isReadyToSubmitPaletteData()) {
			this.props.canvasConfig.enableNavPalette(true);
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
		// enable palette
		if (this.isReadyToSubmitPaletteData2()) {
			this.props.canvasConfig.enableNavPalette(true);
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

	saveZoomOptionChange(value) {
		this.props.canvasConfig.setSaveZoom(value);
	}

	snapToGridOptionChange(value) {
		this.props.canvasConfig.setSnapToGridType(value);
	}

	snapToGridFieldChange(fieldName, evt) {
		if (fieldName === "newSnapToGridX") {
			this.props.canvasConfig.setSnapToGridX(evt.target.value);
		} else {
			this.props.canvasConfig.setSnapToGridY(evt.target.value);
		}
	}

	useZoomIntoSubFlows(checked) {
		this.props.canvasConfig.setZoomIntoSubFlows(checked);
	}

	useInternalObjectModel(checked) {
		this.props.canvasConfig.useInternalObjectModel(checked);
	}

	useEnableDragWithoutSelect(checked) {
		this.props.canvasConfig.useEnableDragWithoutSelect(checked);
	}

	useEnableInsertNodeDroppedOnLink(checked) {
		this.props.canvasConfig.useEnableInsertNodeDroppedOnLink(checked);
	}

	useEnableAssocLinkCreation(checked) {
		this.props.canvasConfig.useEnableAssocLinkCreation(checked);
	}

	useEnableSaveToPalette(checked) {
		this.props.canvasConfig.useEnableSaveToPalette(checked);
	}

	useEnableDropZoneOnExternalDrag(checked) {
		this.props.canvasConfig.useEnableDropZoneOnExternalDrag(checked);
	}

	useEnableCreateSupernodeNonContiguous(checked) {
		this.props.canvasConfig.useEnableCreateSupernodeNonContiguous(checked);
	}

	connectionTypeOptionChange(value) {
		this.props.canvasConfig.setConnectionType(value);
	}

	interactionTypeOptionChange(value) {
		this.props.canvasConfig.setInteractionType(value);
	}

	nodeFormatTypeOptionChange(value) {
		this.props.canvasConfig.setNodeFormatType(value);
	}

	linkTypeOptionChange(value) {
		this.props.canvasConfig.setLinkType(value);
	}

	linkDirectionOptionChange(value) {
		this.props.canvasConfig.setLinkDirection(value);
	}

	assocLinkTypeOptionChange(value) {
		this.props.canvasConfig.setAssocLinkType(value);
	}

	nodeLayoutOptionChange(value) {
		if (value !== EXAMPLE_APP_NONE) {
			this.setState({ controlsDisabled: true });
		} else {
			this.setState({ controlsDisabled: false });
		}
		this.props.canvasConfig.setNodeLayout(value);
	}

	paletteLayoutOptionChange(value) {
		this.props.canvasConfig.setPaletteLayout(value);
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

	tipConfigChange(checked, target) {
		const tipConf = Object.assign({}, this.props.canvasConfig.commonCanvasConfig.tipConfig);
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
		this.props.canvasConfig.setTipConfig(tipConf);
	}

	extraCanvasChange(checked) {
		this.props.canvasConfig.showExtraCanvas(checked);
	}

	changeDisplayFullLabelOnHover(checked) {
		this.props.canvasConfig.changeDisplayFullLabelOnHover(checked);
	}

	schemaValidationChange(checked) {
		this.props.canvasConfig.schemaValidation(checked);
	}

	narrowPalette(checked) {
		this.props.canvasConfig.setNarrowPalette(checked);
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
						onChange={(evt) => this.props.canvasConfig.enableNavPalette(evt.target.checked)}
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
						onChange={(evt) => this.props.canvasConfig.enableNavPalette(evt.target.checked)}
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
				disabled={!this.props.canvasConfig.extraCanvasDisplayed}
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
				disabled={!this.props.canvasConfig.extraCanvasDisplayed}
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
					name="save_zoom_radio"
					onChange={this.saveZoomOptionChange}
					defaultSelected={this.props.canvasConfig.selectedSaveZoom}
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

		var rbSize = { "height": "80px" };
		var entrySize = { "width": "80px", "minWidth": "80px" };

		var snapToGrid = (<div className="harness-sidepanel-children" id="harness-sidepanel-snap-to-grid-type">
			<div className="harness-sidepanel-headers">Snap to Grid on Drag/Resize</div>
			<div style={rbSize}>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="snap_to_grid_radio"
					onChange={this.snapToGridOptionChange}
					defaultSelected={this.props.canvasConfig.selectedSnapToGrid}
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
					id="harness-snap-to-grid-x"
					labelText="X Grid Size"
					placeholder="X Size"
					onChange={this.snapToGridFieldChange.bind(this, "newSnapToGridX")}
					value={this.props.canvasConfig.snapToGridX}
				/>
				<TextInput style={entrySize}
					id="harness-snap-to-grid-y"
					labelText="Y Grid Size"
					placeholder="Y Size"
					onChange={this.snapToGridFieldChange.bind(this, "newSnapToGridY")}
					value={this.props.canvasConfig.snapToGridY}
				/>
			</div>
		</div>);

		var enableDragWithoutSelect = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Enable Drag Without Select</div>
				<div>
					<Toggle
						id="harness-sidepanel-drag-without-select"
						toggled={this.props.canvasConfig.dragWithoutSelect}
						onToggle={this.useEnableDragWithoutSelect}
					/>
				</div>
			</form>
		</div>);


		var enableAssocLinkCreation = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Enable Association Link Creation</div>
				<div>
					<Toggle
						id="harness-sidepanel-assoc-link-creation-toggle"
						toggled={this.props.canvasConfig.assocLinkCreation}
						onToggle={this.useEnableAssocLinkCreation}
					/>
				</div>
			</form>
		</div>);

		var assocLinkType = (<div className="harness-sidepanel-children" id="harness-sidepanel-assoc-link-type">
			<div className="harness-sidepanel-headers">Association Link Type</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="assoc_link_type_radio"
				onChange={this.assocLinkTypeOptionChange}
				defaultSelected={this.props.canvasConfig.selectedAssocLinkType}
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
						id="harness-sidepanel-object-model-toggle"
						toggled={this.props.canvasConfig.internalObjectModel}
						onToggle={this.useInternalObjectModel}
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
							id="harness-sidepanel-enable-save-to-palette-toggle"
							toggled={this.props.canvasConfig.enableSaveToPalette}
							onToggle={this.useEnableSaveToPalette}
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
							id="harness-sidepanel-enable-insert-node-dropped-on-link-toggle"
							toggled={this.props.canvasConfig.enableInsertNodeDroppedOnLink}
							onToggle={this.useEnableInsertNodeDroppedOnLink}
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
							id="harness-sidepanel-enable-zoom-into-subflows-toggle"
							toggled={this.props.canvasConfig.selectedZoomIntoSubFlows}
							onToggle={this.useZoomIntoSubFlows}
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
							id="harness-sidepanel-enable-drop-zone-on-external-drag-toggle"
							toggled={this.props.canvasConfig.enableDropZoneOnExternalDrag}
							onToggle={this.useEnableDropZoneOnExternalDrag}
						/>
					</div>
				</form>
			</div>);

		var enableCreateSupernodeNonContiguous = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Enable Create Supernode for Noncontiguous Nodes</div>
				<div>
					<Toggle
						id="harness-sidepanel-enable-create-supernode-toggle"
						toggled={this.props.canvasConfig.enableCreateSupernodeNonContiguous}
						onToggle={this.useEnableCreateSupernodeNonContiguous}
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
						id="harness-sidepanel-enable-move-surrounding-nodes-toggle"
						toggled={this.props.canvasConfig.enableMoveNodesOnSupernodeResize}
						onToggle={this.onEnableMoveNodesOnSupernodeResizeToggle}
					/>
				</div>
			</form>
		</div>);

		var interactionType = (<div className="harness-sidepanel-children" id="harness-sidepanel-interaction-type">
			<div className="harness-sidepanel-headers">Interaction Type</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="interaction_type_radio"
				onChange={this.interactionTypeOptionChange}
				defaultSelected={this.props.canvasConfig.selectedInteractionType}
			>
				<RadioButton
					value={MOUSE_INTERACTION}
					labelText={MOUSE_INTERACTION}
				/>
				<RadioButton
					value={TRACKPAD_INTERACTION}
					labelText={TRACKPAD_INTERACTION}
				/>
			</RadioButtonGroup>
		</div>);


		var connectionType = (<div className="harness-sidepanel-children" id="harness-sidepanel-connection-type">
			<div className="harness-sidepanel-headers">Connection Type</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="connection_type_radio"
				onChange={this.connectionTypeOptionChange}
				defaultSelected={this.props.canvasConfig.selectedConnectionType}
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
				name="node_format_type_radio"
				onChange={this.nodeFormatTypeOptionChange}
				defaultSelected={this.props.canvasConfig.selectedNodeFormat}
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
				name="link_type_radio"
				onChange={this.linkTypeOptionChange}
				defaultSelected={this.props.canvasConfig.selectedLinkType}
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
				name="link_type_direction"
				onChange={this.linkDirectionOptionChange}
				defaultSelected={this.props.canvasConfig.selectedLinkDirection}
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
				defaultSelected={this.props.canvasConfig.selectedNodeLayout}
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
				name="palette_layout_radio"
				className="harness-sidepanel-radio-group"
				onChange={this.paletteLayoutOptionChange}
				defaultSelected={this.props.canvasConfig.selectedPaletteLayout}
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
					id="harness-sidepanel-narrow-flyout"
					toggled={this.props.canvasConfig.narrowPalette}
					onToggle={this.narrowPalette}
				/>
			</div>
		</div>);

		var tipConfig = (<div className="harness-sidepanel-children" id="harness-sidepanel-tip-config">
			<div className="harness-sidepanel-headers">Tips</div>
			<Checkbox
				id="tip_palette"
				labelText={TIP_PALETTE}
				onChange={this.tipConfigChange}
				checked={this.props.canvasConfig.commonCanvasConfig.tipConfig.palette}
			/>
			<Checkbox
				id="tip_nodes"
				labelText={TIP_NODES}
				onChange={this.tipConfigChange}
				checked={this.props.canvasConfig.commonCanvasConfig.tipConfig.nodes}
			/>
			<Checkbox
				id="tip_ports"
				labelText={TIP_PORTS}
				onChange={this.tipConfigChange}
				checked={this.props.canvasConfig.commonCanvasConfig.tipConfig.ports}
			/>
			<Checkbox
				id="tip_links"
				labelText={TIP_LINKS}
				onChange={this.tipConfigChange}
				checked={this.props.canvasConfig.commonCanvasConfig.tipConfig.links}
			/>
		</div>);

		var extraCanvas = (<div className="harness-sidepanel-children" id="harness-sidepanel-extra-canvas">
			<form>
				<div className="harness-sidepanel-headers">Extra canvas</div>
				<div>
					<Toggle
						id="harness-sidepanel-object-extra-canvas"
						toggled={this.props.canvasConfig.extraCanvasDisplayed}
						onToggle={this.extraCanvasChange}
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
						id="harness-sidepanel-schema-validation"
						toggled={this.props.canvasConfig.schemaValidationEnabled}
						onToggle={this.schemaValidationChange}
					/>
				</div>
			</form>
		</div>);

		var displayBoudingRectangles = (<div className="harness-sidepanel-children">
			<form>
				<div className="harness-sidepanel-headers">Display Bounding Rectangles</div>
				<div>
					<Toggle
						id="harness-sidepanel-bounding-rectangles"
						toggled={this.props.canvasConfig.displayBoundingRectanglesEnabled}
						onToggle={this.props.canvasConfig.displayBoundingRectangles}
					/>
				</div>
			</form>
		</div>);

		const displayFullLabelOnHover = (
			<div className="harness-sidepanel-children">
				<div className="harness-sidepanel-headers">Display full node label on hover</div>
				<Toggle
					id="harness-sidepanel-displayFullLabelOnHover-toggle"
					toggled={this.props.canvasConfig.displayFullLabelOnHover}
					onToggle={this.changeDisplayFullLabelOnHover}
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
					{enableZoomIntoSubFlows}
					{divider}
					{saveZoom}
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
					{extraCanvas}
					{canvasInput2}
					{paletteInput2}
				</div>
			</div>
		);
	}
}

SidePanelForms.propTypes = {
	log: PropTypes.func,
	canvasConfig: PropTypes.shape({
		commonCanvasConfig: PropTypes.object,
		enableNavPalette: PropTypes.func,
		internalObjectModel: PropTypes.bool,
		dragWithoutSelect: PropTypes.bool,
		assocLinkCreation: PropTypes.bool,
		setDiagramJSON: PropTypes.func,
		setPaletteJSON: PropTypes.func,
		setDiagramJSON2: PropTypes.func,
		setPaletteJSON2: PropTypes.func,
		canvasFileChooserVisible: PropTypes.bool,
		canvasFileChooserVisible2: PropTypes.bool,
		paletteFileChooserVisible: PropTypes.bool,
		paletteFileChooserVisible2: PropTypes.bool,
		enableSaveToPalette: PropTypes.bool,
		useEnableSaveToPalette: PropTypes.func,
		enableDropZoneOnExternalDrag: PropTypes.bool,
		enableInsertNodeDroppedOnLink: PropTypes.bool,
		useEnableInsertNodeDroppedOnLink: PropTypes.func,
		useEnableDropZoneOnExternalDrag: PropTypes.func,
		enableCreateSupernodeNonContiguous: PropTypes.bool,
		useEnableCreateSupernodeNonContiguous: PropTypes.func,
		selectedCanvasDropdownFile: PropTypes.string,
		selectedCanvasDropdownFile2: PropTypes.string,
		setCanvasDropdownFile: PropTypes.func,
		setCanvasDropdownFile2: PropTypes.func,
		selectedPaletteDropdownFile: PropTypes.string,
		selectedPaletteDropdownFile2: PropTypes.string,
		setPaletteDropdownSelect: PropTypes.func,
		setPaletteDropdownSelect2: PropTypes.func,
		setSaveZoom: PropTypes.func,
		setZoomIntoSubFlows: PropTypes.func,
		setSnapToGridType: PropTypes.func,
		setSnapToGridX: PropTypes.func,
		setSnapToGridY: PropTypes.func,
		snapToGridX: PropTypes.string,
		snapToGridY: PropTypes.string,
		useInternalObjectModel: PropTypes.func,
		useEnableDragWithoutSelect: PropTypes.func,
		useEnableAssocLinkCreation: PropTypes.func,
		setConnectionType: PropTypes.func,
		selectedSnapToGrid: PropTypes.string,
		selectedConnectionType: PropTypes.string,
		setInteractionType: PropTypes.func,
		selectedInteractionType: PropTypes.string,
		setNodeFormatType: PropTypes.func,
		selectedNodeFormat: PropTypes.string,
		setLinkType: PropTypes.func,
		setLinkDirection: PropTypes.func,
		setAssocLinkType: PropTypes.func,
		setNodeLayout: PropTypes.func,
		selectedLinkType: PropTypes.string,
		selectedLinkDirection: PropTypes.string,
		selectedAssocLinkType: PropTypes.string,
		selectedNodeLayout: PropTypes.string,
		selectedSaveZoom: PropTypes.string,
		selectedZoomIntoSubFlows: PropTypes.bool,
		setPaletteLayout: PropTypes.func,
		selectedPaletteLayout: PropTypes.string,
		setTipConfig: PropTypes.func,
		extraCanvasDisplayed: PropTypes.bool,
		showExtraCanvas: PropTypes.func,
		narrowPalette: PropTypes.bool,
		setNarrowPalette: PropTypes.func,
		schemaValidation: PropTypes.func,
		schemaValidationEnabled: PropTypes.bool,
		displayBoundingRectangles: PropTypes.func,
		displayBoundingRectanglesEnabled: PropTypes.bool,
		displayFullLabelOnHover: PropTypes.bool,
		changeDisplayFullLabelOnHover: PropTypes.func,
		enableMoveNodesOnSupernodeResize: PropTypes.bool,
		setEnableMoveNodesOnSupernodeResize: PropTypes.func,
		clearSavedZoomValues: PropTypes.func
	})
};
