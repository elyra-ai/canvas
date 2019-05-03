/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global FileReader: true */
/* eslint no-undef: "error" */

import React from "react";
import PropTypes from "prop-types";
import FileUploader from "carbon-components-react/lib/components/FileUploader";
import Button from "carbon-components-react/lib/components/Button";
import Dropdown from "carbon-components-react/lib/components/DropdownV2";
import Checkbox from "carbon-components-react/lib/components/Checkbox";
import RadioButtonGroup from "carbon-components-react/lib/components/RadioButtonGroup";
import RadioButton from "carbon-components-react/lib/components/RadioButton";
import Toggle from "carbon-components-react/lib/components/Toggle";
import TextInput from "carbon-components-react/lib/components/TextInput";


import {
	NONE,
	HORIZONTAL,
	VERTICAL,
	NONE_SAVE_ZOOM,
	LOCAL_STORAGE,
	PIPELINE_FLOW,
	NONE_DRAG,
	DURING_DRAG,
	AFTER_DRAG,
	CHOOSE_FROM_LOCATION,
	VERTICAL_FORMAT,
	HORIZONTAL_FORMAT,
	HALO_CONNECTION,
	PORTS_CONNECTION,
	MOUSE_INTERACTION,
	TRACKPAD_INTERACTION,
	CURVE_LINKS,
	ELBOW_LINKS,
	STRAIGHT_LINKS,
	NO_LAYOUT,
	BLUE_ELLIPSES_LAYOUT,
	DB2_EXPLAIN_LAYOUT,
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
			paletteFiles: []
		};

		this.onCanvasFileSelect = this.onCanvasFileSelect.bind(this);
		this.onCanvasFileSelect2 = this.onCanvasFileSelect2.bind(this);
		this.isReadyToSubmitCanvasData = this.isReadyToSubmitCanvasData.bind(this);
		this.isReadyToSubmitCanvasData2 = this.isReadyToSubmitCanvasData2.bind(this);

		this.onCanvasPaletteSelect = this.onCanvasPaletteSelect.bind(this);
		this.onCanvasPaletteSelect2 = this.onCanvasPaletteSelect2.bind(this);
		this.isReadyToSubmitPaletteData = this.isReadyToSubmitPaletteData.bind(this);
		this.isReadyToSubmitPaletteData2 = this.isReadyToSubmitPaletteData2.bind(this);

		this.layoutDirectionOptionChange = this.layoutDirectionOptionChange.bind(this);
		this.saveZoomOptionChange = this.saveZoomOptionChange.bind(this);
		this.snapToGridOptionChange = this.snapToGridOptionChange.bind(this);
		this.useInternalObjectModel = this.useInternalObjectModel.bind(this);
		this.useEnableSaveToPalette = this.useEnableSaveToPalette.bind(this);
		this.useEnableDropZoneOnExternalDrag = this.useEnableDropZoneOnExternalDrag.bind(this);
		this.useEnableCreateSupernodeNonContiguous = this.useEnableCreateSupernodeNonContiguous.bind(this);
		this.onEnableMoveNodesOnSupernodeResizeToggle = this.onEnableMoveNodesOnSupernodeResizeToggle.bind(this);
		this.connectionTypeOptionChange = this.connectionTypeOptionChange.bind(this);
		this.interactionTypeOptionChange = this.interactionTypeOptionChange.bind(this);
		this.nodeFormatTypeOptionChange = this.nodeFormatTypeOptionChange.bind(this);
		this.linkTypeOptionChange = this.linkTypeOptionChange.bind(this);
		this.nodeLayoutOptionChange = this.nodeLayoutOptionChange.bind(this);
		this.paletteLayoutOptionChange = this.paletteLayoutOptionChange.bind(this);
		this.tipConfigChange = this.tipConfigChange.bind(this);
		this.extraCanvasChange = this.extraCanvasChange.bind(this);
		this.schemaValidationChange = this.schemaValidationChange.bind(this);
		this.narrowPalette = this.narrowPalette.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.changeValidateFlowOnOpen = this.changeValidateFlowOnOpen.bind(this);
		this.changeDisplayFullLabelOnHover = this.changeDisplayFullLabelOnHover.bind(this);
	}

	componentWillMount() {
		var that = this;

		FormsService.getFiles("diagrams")
			.then(function(res) {
				var list = res;
				list.push(CHOOSE_FROM_LOCATION);
				that.setState({ canvasFiles: res });
			});

		FormsService.getFiles("palettes")
			.then(function(res) {
				var list = res;
				list.push(CHOOSE_FROM_LOCATION);
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
		this.props.canvasConfig.setCanvasDropdownFile(evt.selectedItem.value);
	}

	onCanvasDropdownSelect2(evt) {
		this.props.canvasConfig.setCanvasDropdownFile2(evt.selectedItem.value);
	}

	onPaletteDropdownSelect(evt) {
		this.props.canvasConfig.setPaletteDropdownSelect(evt.selectedItem.value);
	}

	onPaletteDropdownSelect2(evt) {
		this.props.canvasConfig.setPaletteDropdownSelect2(evt.selectedItem.value);
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

	layoutDirectionOptionChange(value) {
		this.props.canvasConfig.setLayoutDirection(value);
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

	useInternalObjectModel(checked) {
		this.props.canvasConfig.useInternalObjectModel(checked);
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

	nodeLayoutOptionChange(value) {
		this.props.canvasConfig.setNodeLayout(value);
	}

	paletteLayoutOptionChange(value) {
		this.props.canvasConfig.setPaletteLayout(value);
	}

	dropdownOptions(stringOptions) {
		const options = [];
		let key = 1;
		for (const option of stringOptions) {
			options.push({ key: "option." + ++key, label: option, value: option });
		}
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

	changeValidateFlowOnOpen(checked) {
		this.props.canvasConfig.changeValidateFlowOnOpen(checked);
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
					<Button small
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
					<Button small
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
			<Dropdown
				label="Canvas"
				ariaLabel="Canvas"
				onChange={this.onCanvasDropdownSelect.bind(this)}
				items={this.dropdownOptions(this.state.canvasFiles)}
			/>
			{canvasFileChooserVisible}
		</div>);

		var paletteInput = (<div className="harness-sidepanel-children" id="harness-sidepanel-palette-input">
			<div className="harness-sidepanel-headers">Canvas Palette</div>
			<Dropdown
				label="Palette"
				ariaLabel="Palette"
				onChange={this.onPaletteDropdownSelect.bind(this)}
				items={this.dropdownOptions(this.state.paletteFiles)}
			/>
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
					<Button small
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
					<Button small
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
			<Dropdown
				disabled={!this.props.canvasConfig.extraCanvasDisplayed}
				label="Canvas"
				ariaLabel="Canvas"
				onChange={this.onCanvasDropdownSelect2.bind(this)}
				items={this.dropdownOptions(this.state.canvasFiles)}
			/>
			{canvasFileChooserVisible2}
		</div>);

		var paletteInput2 = (<div className="harness-sidepanel-children" id="harness-sidepanel-palette-input2">
			<div className="harness-sidepanel-headers">Canvas Palette</div>
			<Dropdown
				disabled={!this.props.canvasConfig.extraCanvasDisplayed}
				label="Palette"
				ariaLabel="Palette"
				onChange={this.onPaletteDropdownSelect2.bind(this)}
				items={this.dropdownOptions(this.state.paletteFiles)}
			/>
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
				<Button small
					onClick={this.props.canvasConfig.clearSavedZoomValues}
				>
				Clear local storage zoom values
				</Button>
			</div>
		</div>
		);

		var layoutDirection = (<div className="harness-sidepanel-children" id="harness-sidepanel-layout-direction">
			<div className="harness-sidepanel-headers">Fixed Layout</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="layout_direction_radio"
				onChange={this.layoutDirectionOptionChange}
				defaultSelected={this.props.canvasConfig.selectedLayout}
			>
				<RadioButton
					value={NONE}
					labelText={NONE}
				/>
				<RadioButton
					value={HORIZONTAL}
					labelText={HORIZONTAL}
				/>
				<RadioButton
					value={VERTICAL}
					labelText={VERTICAL}
				/>
			</RadioButtonGroup>
		</div>);

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

		var linkType = (<div className="harness-sidepanel-children">
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

		const nodeLayoutType = (<div className="harness-sidepanel-children">
			<div className="harness-sidepanel-headers">Node Layout Override</div>
			<RadioButtonGroup
				className="harness-sidepanel-radio-group"
				name="node_layout_radio"
				onChange={this.nodeLayoutOptionChange}
				defaultSelected={this.props.canvasConfig.selectedNodeLayout}
			>
				<RadioButton
					value={NO_LAYOUT}
					labelText={NO_LAYOUT}
				/>
				<RadioButton
					value={BLUE_ELLIPSES_LAYOUT}
					labelText={BLUE_ELLIPSES_LAYOUT}
				/>
				<RadioButton
					value={DB2_EXPLAIN_LAYOUT}
					labelText={DB2_EXPLAIN_LAYOUT}
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
						id="harness-sidepanel-schema-validation"
						toggled={this.props.canvasConfig.displayBoundingRectanglesEnabled}
						onToggle={this.props.canvasConfig.displayBoundingRectangles}
					/>
				</div>
			</form>
		</div>);

		const validateFlowOnOpen = (
			<div className="harness-sidepanel-children">
				<div className="harness-sidepanel-headers">Validate flow on open</div>
				<Toggle
					id="harness-sidepanel-validateFlowOnOpen-toggle"
					toggled={this.props.canvasConfig.validateFlowOnOpen}
					onToggle={this.changeValidateFlowOnOpen}
				/>
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

		return (
			<div>
				{canvasInput}
				{divider}
				{paletteInput}
				{divider}
				{interactionType}
				{divider}
				{connectionType}
				{divider}
				{nodeFormatType}
				{divider}
				{linkType}
				{divider}
				{nodeLayoutType}
				{divider}
				{snapToGrid}
				{divider}
				{saveZoom}
				{divider}
				{layoutDirection}
				{divider}
				{paletteLayout}
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
				{validateFlowOnOpen}
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
		);
	}
}

SidePanelForms.propTypes = {
	log: PropTypes.func,
	canvasConfig: PropTypes.shape({
		commonCanvasConfig: PropTypes.object,
		enableNavPalette: PropTypes.func,
		internalObjectModel: PropTypes.bool,
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
		setLayoutDirection: PropTypes.func,
		setSnapToGridType: PropTypes.func,
		setSnapToGridX: PropTypes.func,
		setSnapToGridY: PropTypes.func,
		snapToGridX: PropTypes.string,
		snapToGridY: PropTypes.string,
		selectedLayout: PropTypes.string,
		useInternalObjectModel: PropTypes.func,
		setConnectionType: PropTypes.func,
		selectedSnapToGrid: PropTypes.string,
		selectedConnectionType: PropTypes.string,
		setInteractionType: PropTypes.func,
		selectedInteractionType: PropTypes.string,
		setNodeFormatType: PropTypes.func,
		selectedNodeFormat: PropTypes.string,
		setLinkType: PropTypes.func,
		setNodeLayout: PropTypes.func,
		selectedLinkType: PropTypes.string,
		selectedNodeLayout: PropTypes.string,
		selectedSaveZoom: PropTypes.string,
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
		validateFlowOnOpen: PropTypes.bool,
		changeValidateFlowOnOpen: PropTypes.func,
		displayFullLabelOnHover: PropTypes.bool,
		changeDisplayFullLabelOnHover: PropTypes.func,
		enableMoveNodesOnSupernodeResize: PropTypes.bool,
		setEnableMoveNodesOnSupernodeResize: PropTypes.func,
		clearSavedZoomValues: PropTypes.func
	})
};
