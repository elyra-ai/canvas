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
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "ap-components-react/dist/components/Button";
import Dropdown from "ap-components-react/dist/components/Dropdown";
import Checkbox from "ap-components-react/dist/components/Checkbox";
import RadioGroup from "ap-components-react/dist/components/RadioGroup";
import ToggleButton from "ap-components-react/dist/components/ToggleButton";


import {
	NONE,
	HORIZONTAL,
	VERTICAL,
	CHOOSE_FROM_LOCATION,
	LEGACY_ENGINE,
	D3_ENGINE,
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
			canvasFileChooserVisible: false,
			paletteFileChooserVisible: false,
			canvasFileChooserVisible2: false,
			paletteFileChooserVisible2: false,
			canvasFiles: [],
			paletteFiles: [],
			selectedCanvasDropdownFile: "",
			selectedPaletteDropdownFile: "",
			selectedCanvasDropdownFile2: "",
			selectedPaletteDropdownFile2: "",
			extraCanvasOptions: false,
			oneTimeLayout: NONE
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
		this.renderingEngineOptionChange = this.renderingEngineOptionChange.bind(this);
		this.connectionTypeOptionChange = this.connectionTypeOptionChange.bind(this);
		this.nodeFormatTypeOptionChange = this.nodeFormatTypeOptionChange.bind(this);
		this.linkTypeOptionChange = this.linkTypeOptionChange.bind(this);
		this.paletteLayoutOptionChange = this.paletteLayoutOptionChange.bind(this);
		this.tipConfigChange = this.tipConfigChange.bind(this);
		this.extraCanvasChange = this.extraCanvasChange.bind(this);
		this.schemaValidationChange = this.schemaValidationChange.bind(this);
		this.narrowPalette = this.narrowPalette.bind(this);
		this.onDragStart = this.onDragStart.bind(this);

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


	onCanvasDropdownSelect(evt, obj) {
		if (obj.selected === CHOOSE_FROM_LOCATION) {
			this.setState({
				canvasFileChooserVisible: true,
				selectedCanvasDropdownFile: ""
			});
		} else {
			var that = this;
			this.setState({
				selectedCanvasDropdownFile: obj.selected,
				canvasDiagram: "",
				canvasFileChooserVisible: false
			}, function() {
				that.props.log("Submit canvas diagram", that.state.selectedCanvasDropdownFile);
				FormsService.getFileContent("diagrams", that.state.selectedCanvasDropdownFile)
					.then(function(res) {
						that.props.setDiagramJSON(res);
					});
			});
		}
	}

	onCanvasDropdownSelect2(evt, obj) {
		if (obj.selected === CHOOSE_FROM_LOCATION) {
			this.setState({
				canvasFileChooserVisible2: true,
				selectedCanvasDropdownFile2: ""
			});
		} else {
			var that = this;
			this.setState({
				selectedCanvasDropdownFile2: obj.selected,
				canvasDiagram2: "",
				canvasFileChooserVisible2: false
			}, function() {
				that.props.log("Submit canvas diagram", that.state.selectedCanvasDropdownFile2);
				FormsService.getFileContent("diagrams", that.state.selectedCanvasDropdownFile2)
					.then(function(res) {
						that.props.setDiagramJSON2(res);
					});
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
			var that = this;
			this.setState({
				selectedPaletteDropdownFile: obj.selected,
				canvasPalette: "",
				paletteFileChooserVisible: false
			}, function() {
				that.props.log("Submit canvas palette", that.state.selectedPaletteDropdownFile);
				FormsService.getFileContent("palettes", that.state.selectedPaletteDropdownFile)
					.then(function(res) {
						that.props.setPaletteJSON(res);
						// enable palette
						if (that.isReadyToSubmitPaletteData()) {
							that.props.enableNavPalette(true);
						}
					});
			});
		}
	}

	onPaletteDropdownSelect2(evt, obj) {
		if (obj.selected === CHOOSE_FROM_LOCATION) {
			this.setState({
				paletteFileChooserVisible2: true,
				selectedPaletteDropdownFile2: ""
			});
		} else {
			var that = this;
			this.setState({
				selectedPaletteDropdownFile2: obj.selected,
				canvasPalette2: "",
				paletteFileChooserVisible2: false
			}, function() {
				that.props.log("Submit canvas palette", that.state.selectedPaletteDropdownFile2);
				FormsService.getFileContent("palettes", that.state.selectedPaletteDropdownFile2)
					.then(function(res) {
						that.props.setPaletteJSON2(res);
						// enable palette
						if (that.isReadyToSubmitPaletteData2()) {
							that.props.enableNavPalette(true);
						}
					});
			});
		}
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
		if (this.state.canvasDiagram !== "" || this.state.selectedCanvasDropdownFile !== "") {
			return true;
		}
		return false;
	}

	isReadyToSubmitCanvasData2() {
		if (this.state.canvasDiagram2 !== "" || this.state.selectedCanvasDropdownFile2 !== "") {
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
		if (this.state.canvasPalette !== "" || this.state.selectedPaletteDropdownFile !== "") {
			return true;
		}
		return false;
	}

	isReadyToSubmitPaletteData2() {
		if (this.state.canvasPalette2 !== "" || this.state.selectedPaletteDropdownFile2 !== "") {
			return true;
		}
		return false;
	}

	layoutDirectionOptionChange(evt, obj) {
		this.props.setLayoutDirection(obj.selected);
		this.setState({
			oneTimeLayout: obj.selected
		});
	}

	useInternalObjectModel(changeEvent) {
		this.props.useInternalObjectModel(changeEvent.target.checked);
	}

	connectionTypeOptionChange(evt, obj) {
		this.props.setConnectionType(obj.selected);
	}

	nodeFormatTypeOptionChange(evt, obj) {
		this.props.setNodeFormatType(obj.selected);
	}

	linkTypeOptionChange(evt, obj) {
		this.props.setLinkType(obj.selected);
	}

	paletteLayoutOptionChange(evt, obj) {
		this.props.setPaletteLayout(obj.selected);
	}

	tipConfigChange(evt) {
		const tipConf = Object.assign({}, this.props.canvasConfig.tipConfig);
		switch (evt.currentTarget.id) {
		case "tip_palette":
			tipConf.palette = evt.currentTarget.checked;
			break;
		case "tip_nodes":
			tipConf.nodes = evt.currentTarget.checked;
			break;
		case "tip_ports":
			tipConf.ports = evt.currentTarget.checked;
			break;
		case "tip_links":
			tipConf.links = evt.currentTarget.checked;
			break;
		default:
			return;
		}
		this.props.setTipConfig(tipConf);
	}

	extraCanvasChange(changeEvent) {
		this.props.showExtraCanvas(changeEvent.target.checked);
		this.setState({ extraCanvasOptions: changeEvent.target.checked });
	}

	schemaValidationChange(changeEvent) {
		this.props.schemaValidation(changeEvent.target.checked);
	}

	narrowPalette(changeEvent) {
		this.props.setNarrowPalette(changeEvent.target.checked);
	}

	renderingEngineOptionChange(evt, obj) {
		this.props.setRenderingEngine(obj.selected);
	}

	render() {
		var divider = (<div className="sidepanel-children sidepanel-divider" />);
		var space = (<div className="sidepanel-spacer" />);

		var canvasFileChooserVisible = <div />;
		if (this.state.canvasFileChooserVisible) {
			canvasFileChooserVisible = (<div>
				{space}
				<FormControl
					required="required"
					id="canvasFileInput"
					type="file"
					accept=".json"
					ref="canvasDiagram"
					onChange={this.onCanvasFileSelect}
				/>
				{space}
				<Button dark
					id="canvasFileSubmit"
					disabled={!this.isReadyToSubmitCanvasData()}
					onClick={this.submitCanvas.bind(this)}

				>
					Submit
				</Button>
			</div>);
		}

		var paletteFileChooserVisible = <div />;
		if (this.state.paletteFileChooserVisible) {
			paletteFileChooserVisible = (<div>
				{space}
				<FormControl
					required="required"
					id="paletteJsonInput"
					type="file"
					accept=".json"
					ref="canvasPalette"
					onChange={this.onCanvasPaletteSelect}
				/>
				{space}
				<Button dark
					id="paletteFileSubmit"
					disabled={!this.isReadyToSubmitPaletteData()}
					onClick={this.submitPalette.bind(this)}
					onChange={(evt) => this.props.enableNavPalette(evt.target.checked)}
				>
					Submit
				</Button>
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
				{canvasFileChooserVisible}
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
				{paletteFileChooserVisible}
			</div>
		</div>);

		var canvasFileChooserVisible2 = <div />;
		if (this.state.canvasFileChooserVisible2) {
			canvasFileChooserVisible2 = (<div>
				{space}
				<FormControl
					required="required"
					id="canvasFileInput2"
					type="file"
					accept=".json"
					ref="canvasDiagram2"
					onChange={this.onCanvasFileSelect2}
				/>
				{space}
				<Button dark
					id="canvasFileSubmit2"
					disabled={!this.isReadyToSubmitCanvasData2()}
					onClick={this.submitCanvas2.bind(this)}

				>
					Submit
				</Button>
			</div>);
		}

		var paletteFileChooserVisible2 = <div />;
		if (this.state.paletteFileChooserVisible2) {
			paletteFileChooserVisible2 = (<div>
				{space}
				<FormControl
					required="required"
					id="paletteJsonInput2"
					type="file"
					accept=".json"
					ref="canvasPalette2"
					onChange={this.onCanvasPaletteSelect2}
				/>
				{space}
				<Button dark
					id="paletteFileSubmit"
					disabled={!this.isReadyToSubmitPaletteData2()}
					onClick={this.submitPalette2.bind(this)}
					onChange={(evt) => this.props.enableNavPalette(evt.target.checked)}
				>
					Submit
				</Button>
			</div>);
		}

		var canvasInput2 = (<div className="sidepanel-children" id="sidepanel-canvas-input2">
			<div className="canvasField">
				<div className="sidepanel-headers">Canvas Diagram</div>
				<Dropdown
					disabled={!this.state.extraCanvasOptions}
					name="CanvasDropdown"
					text="Canvas"
					id="sidepanel-canvas-dropdown2"
					maxVisibleItems={10}
					dark
					options={this.state.canvasFiles}
					onSelect={this.onCanvasDropdownSelect2.bind(this)}
					value={this.state.selectedCanvasDropdownFile2}
				/>
				{canvasFileChooserVisible2}
			</div>
		</div>);

		var paletteInput2 = (<div className="sidepanel-children" id="sidepanel-palette-input2">
			<div className="formField">
				<div className="sidepanel-headers">Canvas Palette</div>
				<Dropdown
					disabled={!this.state.extraCanvasOptions}
					name="PaletteDropdown"
					text="Palette"
					id="sidepanel-palette-dropdown2"
					maxVisibleItems={10}
					dark
					options={this.state.paletteFiles}
					onSelect={this.onPaletteDropdownSelect2.bind(this)}
					value={this.state.selectedPaletteDropdownFile2}
				/>
				{paletteFileChooserVisible2}
			</div>
		</div>);

		var layoutDirection = (<div className="sidepanel-children" id="sidepanel-layout-direction">
			<div className="sidepanel-headers">Fixed Layout</div>
			<RadioGroup
				name="layout_direction_radio"
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

		var renderingEngine = (<div className="sidepanel-children" id="sidepanel-rendering-engine">
			<div className="sidepanel-headers">Rendering Engine</div>
			<RadioGroup
				name="rendering_radio"
				dark
				onChange={this.renderingEngineOptionChange}
				choices={[
					D3_ENGINE,
					LEGACY_ENGINE
				]}
				selected={D3_ENGINE}
			/>
		</div>);

		var connectionType = (<div className="sidepanel-children" id="sidepanel-connection-type">
			<div className="sidepanel-headers">Connection Type (for 'D3')</div>
			<RadioGroup
				name="connection_type_radio"
				dark
				onChange={this.connectionTypeOptionChange}
				choices={[
					PORTS_CONNECTION,
					HALO_CONNECTION
				]}
				selected={PORTS_CONNECTION}
			/>
		</div>);

		var nodeFormatType = (<div className="sidepanel-children" id="sidepanel-node-format-type">
			<div className="sidepanel-headers">Node Format Type (for 'Ports')</div>
			<RadioGroup
				name="node_format_type_radio"
				dark
				onChange={this.nodeFormatTypeOptionChange}
				choices={[
					VERTICAL_FORMAT,
					HORIZONTAL_FORMAT
				]}
				selected={VERTICAL_FORMAT}
			/>
		</div>);

		var linkType = (<div className="sidepanel-children" id="sidepanel-link-type">
			<div className="sidepanel-headers">Link Type (for 'Ports')</div>
			<RadioGroup
				name="link_type_radio"
				dark
				onChange={this.linkTypeOptionChange}
				choices={[
					CURVE_LINKS,
					ELBOW_LINKS,
					STRAIGHT_LINKS
				]}
				selected={CURVE_LINKS}
			/>
		</div>);

		var paletteLayout = (<div className="sidepanel-children" id="sidepanel-palette-layout">
			<div className="sidepanel-headers">Palette Layout</div>
			<RadioGroup
				name="palette_layout_radio"
				dark
				onChange={this.paletteLayoutOptionChange}
				choices={[
					FLYOUT,
					MODAL
				]}
				selected={FLYOUT}
			/>
			<div className="sidepanel-headers">Show Narrow Palette</div>
			<div>
				<ToggleButton dark
					id="sidepanel-narrow-flyout"
					checked={this.props.narrowPalette}
					onChange={this.narrowPalette}
				/>
			</div>
		</div>);

		var tipConfig = (<div className="sidepanel-children" id="sidepanel-tip-config">
			<div className="sidepanel-headers">Tips</div>
			<Checkbox
				id="tip_palette"
				name={TIP_PALETTE}
				dark
				onChange={this.tipConfigChange}
				checked={this.props.canvasConfig.tipConfig.palette}
			/>
			<Checkbox
				id="tip_nodes"
				name={TIP_NODES}
				dark
				onChange={this.tipConfigChange}
				checked={this.props.canvasConfig.tipConfig.nodes}
			/>
			<Checkbox
				id="tip_ports"
				name={TIP_PORTS}
				dark
				onChange={this.tipConfigChange}
				checked={this.props.canvasConfig.tipConfig.ports}
			/>
			<Checkbox
				id="tip_links"
				name={TIP_LINKS}
				dark
				onChange={this.tipConfigChange}
				checked={this.props.canvasConfig.tipConfig.links}
			/>
		</div>);

		var extraCanvas = (<div className="sidepanel-children" id="sidepanel-extra-canvas">
			<form>
				<div className="sidepanel-headers">Extra canvas</div>
				<div>
					<ToggleButton dark
						id="sidepanel-object-extra-canvas"
						checked={this.props.extraCanvasDisplayed}
						onChange={this.extraCanvasChange}
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
					<ToggleButton dark
						id="sidepanel-schema-validation"
						checked={this.props.schemaValidationEnabled}
						onChange={this.schemaValidationChange}
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
				{divider}
				{renderingEngine}
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
				{extraCanvas}
				{canvasInput2}
				{paletteInput2}
			</div>
		);
	}
}

SidePanelForms.propTypes = {
	canvasConfig: PropTypes.object,
	enableNavPalette: PropTypes.func,
	internalObjectModel: PropTypes.bool,
	setDiagramJSON: PropTypes.func,
	setPaletteJSON: PropTypes.func,
	setDiagramJSON2: PropTypes.func,
	setPaletteJSON2: PropTypes.func,
	setLayoutDirection: PropTypes.func,
	useInternalObjectModel: PropTypes.func,
	setRenderingEngine: PropTypes.func,
	setConnectionType: PropTypes.func,
	setNodeFormatType: PropTypes.func,
	setLinkType: PropTypes.func,
	extraCanvasDisplayed: PropTypes.bool,
	showExtraCanvas: PropTypes.func,
	schemaValidationEnabled: PropTypes.bool,
	schemaValidation: PropTypes.func,
	log: PropTypes.func,
	setPaletteLayout: PropTypes.func,
	setTipConfig: PropTypes.func,
	narrowPalette: PropTypes.bool,
	setNarrowPalette: PropTypes.func,
};
