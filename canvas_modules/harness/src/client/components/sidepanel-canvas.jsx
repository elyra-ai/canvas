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
import PropTypes from "prop-types";
import FileUploader from "carbon-components-react/lib/components/FileUploader";
import Button from "carbon-components-react/lib/components/Button";
import Dropdown from "carbon-components-react/lib/components/Dropdown";
import DropdownItem from "carbon-components-react/lib/components/DropdownItem";
import Checkbox from "carbon-components-react/lib/components/Checkbox";
import RadioButtonGroup from "carbon-components-react/lib/components/RadioButtonGroup";
import RadioButton from "carbon-components-react/lib/components/RadioButton";
import Toggle from "carbon-components-react/lib/components/Toggle";


import {
	NONE,
	HORIZONTAL,
	VERTICAL,
	CHOOSE_FROM_LOCATION,
	VERTICAL_FORMAT,
	HORIZONTAL_FORMAT,
	HALO_CONNECTION,
	PORTS_CONNECTION,
	CURVE_LINKS,
	ELBOW_LINKS,
	STRAIGHT_LINKS,
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
		this.useInternalObjectModel = this.useInternalObjectModel.bind(this);
		this.useEnableCreateSupernodeNonContiguous = this.useEnableCreateSupernodeNonContiguous.bind(this);
		this.onEnableMoveNodesOnSupernodeResizeToggle = this.onEnableMoveNodesOnSupernodeResizeToggle.bind(this);
		this.connectionTypeOptionChange = this.connectionTypeOptionChange.bind(this);
		this.nodeFormatTypeOptionChange = this.nodeFormatTypeOptionChange.bind(this);
		this.linkTypeOptionChange = this.linkTypeOptionChange.bind(this);
		this.paletteLayoutOptionChange = this.paletteLayoutOptionChange.bind(this);
		this.tipConfigChange = this.tipConfigChange.bind(this);
		this.extraCanvasChange = this.extraCanvasChange.bind(this);
		this.schemaValidationChange = this.schemaValidationChange.bind(this);
		this.narrowPalette = this.narrowPalette.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.changeValidateFlowOnOpen = this.changeValidateFlowOnOpen.bind(this);

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
		this.props.setDiagramJSON();
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
		this.props.setDiagramJSON2();
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

	onCanvasPaletteSelect2(evt) {
		this.setState({ canvasPalette2: "" });
		this.props.setPaletteJSON2({});
		this.props.enableNavPalette(false);
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
		this.props.setCanvasDropdownFile(evt.value);
	}

	onCanvasDropdownSelect2(evt) {
		this.props.setCanvasDropdownFile2(evt.value);
	}

	onPaletteDropdownSelect(evt) {
		this.props.setPaletteDropdownSelect(evt.value);
	}

	onPaletteDropdownSelect2(evt) {
		this.props.setPaletteDropdownSelect2(evt.value);
	}

	onEnableMoveNodesOnSupernodeResizeToggle(checked) {
		this.props.setEnableMoveNodesOnSupernodeResize(checked);
	}

	onDragStart(ev) {
		ev.dataTransfer.setData("text",
			JSON.stringify({
				operation: "addToCanvas",
				label: "Derive",
				offsetX: 100,
				offsetY: 100,
				data: {
					editType: "createNode",
					operator_id_ref: "derive",
					nodeTypeId: "derive"
				}
			}));
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
		}
	}

	submitCanvas2() {
		if (this.state.canvasDiagram2 !== "") {
			var fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var fileContent = fileReader.result;
				var content = JSON.parse(fileContent);
				this.props.setDiagramJSON2(content);
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
				this.props.setPaletteJSON(content);
			}.bind(this);
			fileReader.readAsText(this.state.canvasPalette);
		}
		// enable palette
		if (this.isReadyToSubmitPaletteData()) {
			this.props.enableNavPalette(true);
		}
	}

	submitPalette2() {
		if (this.state.canvasPalette2 !== "") {
			var fileReader = new FileReader();
			fileReader.onload = function(evt) {
				var fileContent = fileReader.result;
				var content = JSON.parse(fileContent);
				this.props.setPaletteJSON2(content);
			}.bind(this);
			fileReader.readAsText(this.state.canvasPalette2);
		}
		// enable palette
		if (this.isReadyToSubmitPaletteData2()) {
			this.props.enableNavPalette(true);
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

	layoutDirectionOptionChange(value) {
		this.props.setLayoutDirection(value);
	}

	useInternalObjectModel(checked) {
		this.props.useInternalObjectModel(checked);
	}

	useEnableCreateSupernodeNonContiguous(checked) {
		this.props.useEnableCreateSupernodeNonContiguous(checked);
	}

	connectionTypeOptionChange(value) {
		this.props.setConnectionType(value);
	}

	nodeFormatTypeOptionChange(value) {
		this.props.setNodeFormatType(value);
	}

	linkTypeOptionChange(value) {
		this.props.setLinkType(value);
	}

	paletteLayoutOptionChange(value) {
		this.props.setPaletteLayout(value);
	}

	dropdownOptions(stringOptions) {
		const options = [];
		let key = 1;
		for (const option of stringOptions) {
			options.push(<DropdownItem key={"option." + ++key}itemText={option} value={option} />);
		}
		return options;
	}

	tipConfigChange(checked, target) {
		const tipConf = Object.assign({}, this.props.commonCanvasConfig.tipConfig);
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
		this.props.setTipConfig(tipConf);
	}

	extraCanvasChange(checked) {
		this.props.showExtraCanvas(checked);
	}

	changeValidateFlowOnOpen(checked) {
		this.props.changeValidateFlowOnOpen(checked);
	}

	schemaValidationChange(checked) {
		this.props.schemaValidation(checked);
	}

	narrowPalette(checked) {
		this.props.setNarrowPalette(checked);
	}

	render() {
		var divider = (<div className="sidepanel-children sidepanel-divider" />);
		var space = (<div className="sidepanel-spacer" />);

		var canvasFileChooserVisible = <div />;
		if (this.props.canvasFileChooserVisible) {
			canvasFileChooserVisible = (<div className="sidepanel-file-uploader">
				<FileUploader
					small={"true"}
					buttonLabel="Choose file"
					accept={[".json"]}
					onChange={this.onCanvasFileSelect}
				/>
				{space}
				<div className="sidepanel-file-upload-submit">
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
		if (this.props.paletteFileChooserVisible) {
			paletteFileChooserVisible = (<div className="sidepanel-file-uploader">
				<FileUploader
					small={"true"}
					buttonLabel="Choose file"
					accept={[".json"]}
					onChange={this.onCanvasPaletteSelect}
				/>
				{space}
				<div className="sidepanel-file-upload-submit">
					<Button small
						disabled={!this.isReadyToSubmitPaletteData()}
						onClick={this.submitPalette.bind(this)}
						onChange={(evt) => this.props.enableNavPalette(evt.target.checked)}
					>
					Submit
					</Button>
				</div>
			</div>);
		}

		var canvasInput = (<div className="sidepanel-children" id="sidepanel-canvas-input">
			<div className="filePicker">
				<div className="sidepanel-headers">Canvas Diagram</div>
				<Dropdown
					defaultText="Canvas"
					ariaLabel="Canvas"
					onChange={this.onCanvasDropdownSelect.bind(this)}
					value={this.props.selectedCanvasDropdownFile}
				>
					{this.dropdownOptions(this.state.canvasFiles)}
				</Dropdown>
				{canvasFileChooserVisible}
			</div>
		</div>);

		var paletteInput = (<div className="sidepanel-children" id="sidepanel-palette-input">
			<div className="filePicker">
				<div className="sidepanel-headers">Canvas Palette</div>
				<Dropdown
					defaultText="Palette"
					ariaLabel="Palette"
					onChange={this.onPaletteDropdownSelect.bind(this)}
					value={this.props.selectedPaletteDropdownFile}
				>
					{this.dropdownOptions(this.state.paletteFiles)}
				</Dropdown>
				{paletteFileChooserVisible}
			</div>
		</div>);

		var canvasFileChooserVisible2 = <div />;
		if (this.props.canvasFileChooserVisible2) {
			canvasFileChooserVisible2 = (<div className="sidepanel-file-uploader">
				{space}
				<FileUploader
					small={"true"}
					buttonLabel="Chose file"
					accept={[".json"]}
					onChange={this.onCanvasFileSelect2}
				/>
				{space}
				<div className="sidepanel-file-upload-submit">
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
		if (this.props.paletteFileChooserVisible2) {
			paletteFileChooserVisible2 = (<div className="sidepanel-file-uploader">
				{space}
				<FileUploader
					small={"true"}
					buttonLabel="Chose file"
					accept={[".json"]}
					onChange={this.onCanvasPaletteSelect2}
				/>
				{space}
				<div className="sidepanel-file-upload-submit">
					<Button small
						disabled={!this.isReadyToSubmitPaletteData2()}
						onClick={this.submitPalette2.bind(this)}
						onChange={(evt) => this.props.enableNavPalette(evt.target.checked)}
					>
					Submit
					</Button>
				</div>
			</div>);
		}

		var canvasInput2 = (<div className="sidepanel-children" id="sidepanel-canvas-input2">
			<div className="filePicker">
				<div className="sidepanel-headers">Canvas Diagram</div>
				<Dropdown
					disabled={!this.props.extraCanvasDisplayed}
					defaultText="Canvas"
					ariaLabel="Canvas"
					onChange={this.onCanvasDropdownSelect2.bind(this)}
					value={this.props.selectedCanvasDropdownFile2}
				>
					{this.dropdownOptions(this.state.canvasFiles)}
				</Dropdown>
				{canvasFileChooserVisible2}
			</div>
		</div>);

		var paletteInput2 = (<div className="sidepanel-children" id="sidepanel-palette-input2">
			<div className="filePicker">
				<div className="sidepanel-headers">Canvas Palette</div>
				<Dropdown
					disabled={!this.props.extraCanvasDisplayed}
					defaultText="Palette"
					ariaLabel="Palette"
					onChange={this.onPaletteDropdownSelect2.bind(this)}
					value={this.props.selectedPaletteDropdownFile2}
				>
					{this.dropdownOptions(this.state.paletteFiles)}
				</Dropdown>
				{paletteFileChooserVisible2}
			</div>
		</div>);

		var layoutDirection = (<div className="sidepanel-children" id="sidepanel-layout-direction">
			<div className="sidepanel-headers">Fixed Layout</div>
			<RadioButtonGroup
				className="sidepanel-radio-group"
				name="layout_direction_radio"
				onChange={this.layoutDirectionOptionChange}
				defaultSelected={this.props.selectedLayout}
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

		var enableObjectModel = (<div className="sidepanel-children" id="sidepanel-object-model">
			<form>
				<div className="sidepanel-headers">Use Object Model</div>
				<div>
					<Toggle
						id="sidepanel-object-model-toggle"
						toggled={this.props.internalObjectModel}
						onToggle={this.useInternalObjectModel}
					/>
				</div>
			</form>
		</div>);

		var enableCreateSupernodeNonContiguous = (<div className="sidepanel-children" id="sidepanel-create-supernode">
			<form>
				<div className="sidepanel-headers">Enable Create Supernode for Noncontiguous Nodes</div>
				<div>
					<Toggle
						id="sidepanel-enable-create-supernode-toggle"
						toggled={this.props.enableCreateSupernodeNonContiguous}
						onToggle={this.useEnableCreateSupernodeNonContiguous}
					/>
				</div>
			</form>
		</div>);

		var enableMoveNodesOnSupernodeResize = (<div className="sidepanel-children"
			id="sidepanel-move-surrounding-nodes"
		>
			<form>
				<div className="sidepanel-headers">Enable move surrounding nodes when resizing a supernode.</div>
				<div>
					<Toggle
						id="sidepanel-enable-move-surrounding-nodes-toggle"
						toggled={this.props.enableMoveNodesOnSupernodeResize}
						onToggle={this.onEnableMoveNodesOnSupernodeResizeToggle}
					/>
				</div>
			</form>
		</div>);

		var connectionType = (<div className="sidepanel-children" id="sidepanel-connection-type">
			<div className="sidepanel-headers">Connection Type</div>
			<RadioButtonGroup
				className="sidepanel-radio-group"
				name="connection_type_radio"
				onChange={this.connectionTypeOptionChange}
				defaultSelected={this.props.selectedConnectionType}
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

		var nodeFormatType = (<div className="sidepanel-children" id="sidepanel-node-format-type">
			<div className="sidepanel-headers">Node Format Type (for 'Ports')</div>
			<RadioButtonGroup
				className="sidepanel-radio-group"
				name="node_format_type_radio"
				onChange={this.nodeFormatTypeOptionChange}
				defaultSelected={this.props.selectedNodeFormat}
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

		var linkType = (<div className="sidepanel-children" id="sidepanel-link-type">
			<div className="sidepanel-headers">Link Type (for 'Ports')</div>
			<RadioButtonGroup
				className="sidepanel-radio-group"
				name="link_type_radio"
				onChange={this.linkTypeOptionChange}
				defaultSelected={this.props.selectedLinkType}
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

		var paletteLayout = (<div className="sidepanel-children" id="sidepanel-palette-layout">
			<div className="sidepanel-headers">Palette Layout</div>
			<RadioButtonGroup
				name="palette_layout_radio"
				className="sidepanel-radio-group"
				onChange={this.paletteLayoutOptionChange}
				defaultSelected={this.props.selectedPaletteLayout}
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
			<div className="sidepanel-headers">Show Narrow Palette</div>
			<div>
				<Toggle
					id="sidepanel-narrow-flyout"
					toggled={this.props.narrowPalette}
					onToggle={this.narrowPalette}
				/>
			</div>
		</div>);

		var tipConfig = (<div className="sidepanel-children" id="sidepanel-tip-config">
			<div className="sidepanel-headers">Tips</div>
			<Checkbox
				id="tip_palette"
				labelText={TIP_PALETTE}
				onChange={this.tipConfigChange}
				checked={this.props.commonCanvasConfig.tipConfig.palette}
			/>
			<Checkbox
				id="tip_nodes"
				labelText={TIP_NODES}
				onChange={this.tipConfigChange}
				checked={this.props.commonCanvasConfig.tipConfig.nodes}
			/>
			<Checkbox
				id="tip_ports"
				labelText={TIP_PORTS}
				onChange={this.tipConfigChange}
				checked={this.props.commonCanvasConfig.tipConfig.ports}
			/>
			<Checkbox
				id="tip_links"
				labelText={TIP_LINKS}
				onChange={this.tipConfigChange}
				checked={this.props.commonCanvasConfig.tipConfig.links}
			/>
		</div>);

		var extraCanvas = (<div className="sidepanel-children" id="sidepanel-extra-canvas">
			<form>
				<div className="sidepanel-headers">Extra canvas</div>
				<div>
					<Toggle
						id="sidepanel-object-extra-canvas"
						toggled={this.props.extraCanvasDisplayed}
						onToggle={this.extraCanvasChange}
					/>
				</div>
			</form>
		</div>);

		var nodeDraggable = (<div className="sidepanel-children" id="sidepanel-nodeDraggable">
			<form>
				<div className="sidepanel-headers">Draggable Node (Requires modelerPalette.json to be set.)</div>
				<div id="sidePanelNodeDraggable" draggable="true"
					onDragStart={this.onDragStart} onDragOver={this.onDragOver}
				>
					<div className="sidepanel-list-item-icon">
						<img draggable="false" src="/images/nodes/derive.svg" />
					</div>
					<div>
						<span className="sidepanel-list-item-text">Derive</span>
					</div>
				</div>
			</form>
		</div>);

		var schemaValidation = (<div className="sidepanel-children" id="sidepanel-schemaValidation">
			<form>
				<div className="sidepanel-headers">Schema Validation</div>
				<div>
					<Toggle
						id="sidepanel-schema-validation"
						toggled={this.props.schemaValidationEnabled}
						onToggle={this.schemaValidationChange}
					/>
				</div>
			</form>
		</div>);

		const validateFlowOnOpen = (
			<div className="sidepanel-children">
				<div className="sidepanel-headers">Validate flow on open</div>
				<Toggle
					id="sidepanel-validateFlowOnOpen-toggle"
					toggled={this.props.validateFlowOnOpen}
					onToggle={this.changeValidateFlowOnOpen}
				/>
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
				{divider}
				{enableCreateSupernodeNonContiguous}
				{divider}
				{enableMoveNodesOnSupernodeResize}
				{divider}
				{connectionType}
				{divider}
				{nodeFormatType}
				{divider}
				{linkType}
				{divider}
				{paletteLayout}
				{divider}
				{tipConfig}
				{divider}
				{nodeDraggable}
				{divider}
				{schemaValidation}
				{divider}
				{validateFlowOnOpen}
				{divider}
				{extraCanvas}
				{canvasInput2}
				{paletteInput2}
			</div>
		);
	}
}

SidePanelForms.propTypes = {
	commonCanvasConfig: PropTypes.object,
	enableNavPalette: PropTypes.func,
	internalObjectModel: PropTypes.bool,
	enableCreateSupernodeNonContiguous: PropTypes.bool,
	setDiagramJSON: PropTypes.func,
	setPaletteJSON: PropTypes.func,
	setDiagramJSON2: PropTypes.func,
	setPaletteJSON2: PropTypes.func,
	canvasFileChooserVisible: PropTypes.bool,
	canvasFileChooserVisible2: PropTypes.bool,
	paletteFileChooserVisible: PropTypes.bool,
	paletteFileChooserVisible2: PropTypes.bool,
	setCanvasDropdownFile: PropTypes.func,
	setCanvasDropdownFile2: PropTypes.func,
	selectedCanvasDropdownFile: PropTypes.string,
	selectedCanvasDropdownFile2: PropTypes.string,
	setPaletteDropdownSelect: PropTypes.func,
	setPaletteDropdownSelect2: PropTypes.func,
	selectedPaletteDropdownFile: PropTypes.string,
	selectedPaletteDropdownFile2: PropTypes.string,
	setLayoutDirection: PropTypes.func,
	selectedLayout: PropTypes.string,
	useInternalObjectModel: PropTypes.func,
	useEnableCreateSupernodeNonContiguous: PropTypes.func,
	setConnectionType: PropTypes.func,
	selectedConnectionType: PropTypes.string,
	setNodeFormatType: PropTypes.func,
	selectedNodeFormat: PropTypes.string,
	setLinkType: PropTypes.func,
	selectedLinkType: PropTypes.string,
	extraCanvasDisplayed: PropTypes.bool,
	showExtraCanvas: PropTypes.func,
	schemaValidationEnabled: PropTypes.bool,
	schemaValidation: PropTypes.func,
	log: PropTypes.func,
	setPaletteLayout: PropTypes.func,
	selectedPaletteLayout: PropTypes.string,
	setTipConfig: PropTypes.func,
	narrowPalette: PropTypes.bool,
	setNarrowPalette: PropTypes.func,
	validateFlowOnOpen: PropTypes.bool,
	changeValidateFlowOnOpen: PropTypes.func,
	enableMoveNodesOnSupernodeResize: PropTypes.bool,
	setEnableMoveNodesOnSupernodeResize: PropTypes.func
};
