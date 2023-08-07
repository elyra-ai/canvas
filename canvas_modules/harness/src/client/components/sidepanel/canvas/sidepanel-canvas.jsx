/*
 * Copyright 2017-2023 Elyra Authors
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
import { TextInput, FileUploader, Button, Select, SelectItemGroup, SelectItem, Checkbox, RadioButtonGroup, RadioButton, Toggle, FormGroup }
	from "carbon-components-react";
import { get, set } from "lodash";
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
	INTERACTION_MOUSE,
	INTERACTION_TRACKPAD,
	INTERACTION_CARBON,
	CURVE_LINKS,
	ELBOW_LINKS,
	STRAIGHT_LINKS,
	DIRECTION_LEFT_RIGHT,
	DIRECTION_TOP_BOTTOM,
	DIRECTION_BOTTOM_TOP,
	IMAGE_DISPLAY_SVG_INLINE,
	IMAGE_DISPLAY_LOAD_SVG_TO_DEFS,
	LINK_SELECTION_NONE,
	LINK_SELECTION_LINK_ONLY,
	LINK_SELECTION_HANDLES,
	LINK_SELECTION_DETACHABLE,
	ASSOC_RIGHT_SIDE_CURVE,
	ASSOC_STRAIGHT,
	UNDERLAY_NONE,
	UNDERLAY_VARIABLE,
	EXAMPLE_APP_NONE,
	EXAMPLE_APP_FLOWS,
	EXAMPLE_APP_STAGES,
	EXAMPLE_APP_STAGES_CARD_NODE,
	EXAMPLE_APP_EXPLAIN,
	EXAMPLE_APP_EXPLAIN2,
	EXAMPLE_APP_STREAMS,
	EXAMPLE_APP_TABLES,
	EXAMPLE_APP_LOGIC,
	EXAMPLE_APP_READ_ONLY,
	EXAMPLE_APP_PROGRESS,
	EXAMPLE_APP_REACT_NODES,
	PALETTE_FLYOUT,
	PALETTE_MODAL,
	PALETTE_NONE,
	TIP_PALETTE_CATEGORIES,
	TIP_PALETTE_NODE_TEMPLATES,
	TIP_NODES,
	TIP_PORTS,
	TIP_DECORATIONS,
	TIP_LINKS,
	TIP_STATE_TAG,
	TOOLBAR_LAYOUT_NONE,
	TOOLBAR_LAYOUT_TOP,
	TOOLBAR_TYPE_DEFAULT,
	TOOLBAR_TYPE_SUB_AREAS,
	TOOLBAR_TYPE_SINGLE_BAR,
	TOOLBAR_TYPE_BEFORE_AFTER,
	TOOLBAR_TYPE_CUSTOM_RIGHT_SIDE,
	TOOLBAR_TYPE_CARBON_BUTTONS,
	TOOLBAR_TYPE_CUSTOM_ACTIONS,
	TOOLBAR_TYPE_OVERRIDE_AUTO_ENABLE_DISABLE
} from "../../../constants/constants.js";

import { STATE_TAG_NONE, STATE_TAG_LOCKED, STATE_TAG_READ_ONLY }
	from "@elyra/canvas/src/common-canvas/constants/canvas-constants.js";

import FormsService from "../../../services/FormsService";

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
			controlsDisabled: this.props.getStateValue("selectedExampleApp") !== EXAMPLE_APP_NONE
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
		this.exampleAppOptionChange = this.exampleAppOptionChange.bind(this);
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
		let fieldName = "notificationConfig";
		if (id.slice(-1) === "2") {
			id = evt.target.id.slice(0, -1);
			fieldName = "notificationConfig2";
		}
		const notificationConfig = Object.assign({}, this.props.getStateValue(fieldName));
		notificationConfig[id] = evt.target.value;
		this.props.setStateValue(fieldName, notificationConfig);
	}

	notificationConfigToggle(value, control) {
		let id = control;
		let fieldName = "notificationConfig";
		if (id.slice(-1) === "2") {
			id = control.slice(0, -1);
			fieldName = "notificationConfig2";
		}
		const notificationConfig = this.props.getStateValue(fieldName);
		notificationConfig[id] = value;
		this.props.setStateValue(notificationConfig, fieldName);
	}

	exampleAppOptionChange(value) {
		if (value !== EXAMPLE_APP_NONE) {
			this.setState({ controlsDisabled: true });
		} else {
			this.setState({ controlsDisabled: false });
		}
		this.props.setStateValue("selectedExampleApp", value);
	}

	tipConfigChange(checked, target) {
		const tipConf = Object.assign({}, this.props.getStateValue("selectedTipConfig"));
		switch (target) {
		case "tip_palette_categories":
			set(tipConf, "palette.categories", checked);
			break;
		case "tip_palette_node_templates":
			set(tipConf, "palette.nodeTemplates", checked);
			break;
		case "tip_nodes":
			tipConf.nodes = checked;
			break;
		case "tip_ports":
			tipConf.ports = checked;
			break;
		case "tip_decorations":
			tipConf.decorations = checked;
			break;
		case "tip_links":
			tipConf.links = checked;
			break;
		case "tip_state_tag":
			tipConf.stateTag = checked;
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
		options.push(<SelectItem key = "choose-an-option" text = "Choose an option..." />);
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
			<Select
				id="harness-sidepanel-canvas-dropdown"
				labelText="Canvas Diagram"
				aria-label="Canvas Diagram"
				onChange={this.onCanvasDropdownSelect.bind(this)}
				disabled={this.state.disabledControls}
				value={this.props.canvasConfig.selectedCanvasDropdownFile}
			>
				{this.dropdownOptions(this.state.canvasFiles, "Canvas")}
			</Select>
			{canvasFileChooserVisible}
		</div>);

		var paletteInput = (<div className="harness-sidepanel-children" id="harness-sidepanel-palette-input">
			<Select
				id="harness-sidepanel-palette-dropdown"
				labelText="Canvas Palette"
				aria-label="Canvas Palette"
				onChange={this.onPaletteDropdownSelect.bind(this)}
				value={this.props.canvasConfig.selectedPaletteDropdownFile}
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
			<Select
				id="harness-sidepanel-canvas2-dropdown"
				disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
				labelText="Canvas Diagram"
				aria-label="Canvas Diagram"
				onChange={this.onCanvasDropdownSelect2.bind(this)}
				value={this.props.canvasConfig.selectedCanvasDropdownFile2}
			>
				{this.dropdownOptions(this.state.canvasFiles, "Canvas")}
			</Select>
			{canvasFileChooserVisible2}
		</div>);

		var paletteInput2 = (<div className="harness-sidepanel-children" id="harness-sidepanel-palette-input2">
			<Select
				id="harness-sidepanel-palette2-dropdown"
				disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
				labelText="Canvas Palette"
				aria-label="Canvas Palette"
				onChange={this.onPaletteDropdownSelect2.bind(this)}
				value={this.props.canvasConfig.selectedPaletteDropdownFile2}
			>
				{this.dropdownOptions(this.state.paletteFiles, "Palette")}
			</Select>
			{paletteFileChooserVisible2}
		</div>);

		const pad = { "paddingLeft": "8px" };

		var saveZoom = (<div>
			<div className="harness-sidepanel-children" id="harness-sidepanel-save-zoom">
				<FormGroup
					legendText="Save Zoom"
				>
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
				</FormGroup>
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

		var entrySize = { "width": "80px", "minWidth": "80px" };

		var snapToGrid = (<div className="harness-sidepanel-children" id="harness-sidepanel-snap-to-grid-type">
			<div>
				<FormGroup
					legendText="Snap to Grid on Drag/Resize"
				>
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
				</FormGroup>
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

		var enableShowRightFlyout = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedShowRightFlyout" // Set ID to corresponding field in App.js state
				labelText="Open Right Flyout"
				toggled={this.props.getStateValue("selectedShowRightFlyout")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableShowBottomPanel = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedShowBottomPanel" // Set ID to corresponding field in App.js state
				labelText="Open Bottom Panel"
				toggled={this.props.getStateValue("selectedShowBottomPanel")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableShowTopPanel = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedShowTopPanel" // Set ID to corresponding field in App.js state
				labelText="Open Top Panel"
				toggled={this.props.getStateValue("selectedShowTopPanel")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableMarkdownInComments = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedMarkdownInComments" // Set ID to corresponding field in App.js state
				labelText="Enable Markdown Text"
				toggled={this.props.getStateValue("selectedMarkdownInComments")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableContextToolbar = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedContextToolbar" // Set ID to corresponding field in App.js state
				labelText="Enable Context Toolbar"
				toggled={this.props.getStateValue("selectedContextToolbar")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enablePanIntoViewOnOpen = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedPanIntoViewOnOpen" // Set ID to corresponding field in App.js state
				labelText="Enable Pan Into View On Open"
				toggled={this.props.getStateValue("selectedPanIntoViewOnOpen")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableAutoLinkOnlyFromSelNodes = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedAutoLinkOnlyFromSelNodes" // Set ID to corresponding field in App.js state
				labelText="Enable Auto Link Only From Selected Nodes"
				toggled={this.props.getStateValue("selectedAutoLinkOnlyFromSelNodes")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableBrowserEditMenu = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedBrowserEditMenu" // Set ID to corresponding field in App.js state
				labelText="Enable Browser Edit Menu"
				toggled={this.props.getStateValue("selectedBrowserEditMenu")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableRightFlyoutUnderToolbar = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedRightFlyoutUnderToolbar" // Set ID to corresponding field in App.js state
				labelText="Enable Right Flyout Under Toolbar"
				toggled={this.props.getStateValue("selectedRightFlyoutUnderToolbar")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableDragWithoutSelect = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedDragWithoutSelect" // Set ID to corresponding field in App.js state
				labelText="Enable Drag Without Select"
				toggled={this.props.getStateValue("selectedDragWithoutSelect")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enablePositionNodeOnRightFlyoutOpen = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedPositionNodeOnRightFlyoutOpen" // Set ID to corresponding field in App.js state
				labelText="Enable Position Node On Right Flyout Open"
				toggled={this.props.getStateValue("selectedPositionNodeOnRightFlyoutOpen")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableLinkReplaceOnNewConnection = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedLinkReplaceOnNewConnection" // Set ID to corresponding field in App.js state
				labelText="Enable Link Replace On New Connection"
				toggled={this.props.getStateValue("selectedLinkReplaceOnNewConnection")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableAssocLinkCreation = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedAssocLinkCreation" // Set ID to corresponding field in App.js state
				labelText="Enable Association Link Creation"
				toggled={this.props.getStateValue("selectedAssocLinkCreation")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableImageDisplay = (<div className="harness-sidepanel-children" id="harness-sidepanel-link-selection">
			<FormGroup
				legendText="Enable Image Display"
			>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="selectedImageDisplay" // Set name to corresponding field name in App.js
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedImageDisplay")}
				>
					<RadioButton
						value={IMAGE_DISPLAY_SVG_INLINE}
						labelText={IMAGE_DISPLAY_SVG_INLINE}
					/>
					<RadioButton
						value={IMAGE_DISPLAY_LOAD_SVG_TO_DEFS}
						labelText={IMAGE_DISPLAY_LOAD_SVG_TO_DEFS}
					/>
				</RadioButtonGroup>
			</FormGroup>
		</div>);

		var enableLinkSelection = (<div className="harness-sidepanel-children" id="harness-sidepanel-link-selection">
			<FormGroup
				legendText="Enable Link Selection"
			>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="selectedLinkSelection" // Set name to corresponding field name in App.js
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedLinkSelection")}
				>
					<RadioButton
						value={LINK_SELECTION_NONE}
						labelText={LINK_SELECTION_NONE}
					/>
					<RadioButton
						value={LINK_SELECTION_LINK_ONLY}
						labelText={LINK_SELECTION_LINK_ONLY}
					/>
					<RadioButton
						value={LINK_SELECTION_HANDLES}
						labelText={LINK_SELECTION_HANDLES}
					/>
					<RadioButton
						value={LINK_SELECTION_DETACHABLE}
						labelText={LINK_SELECTION_DETACHABLE}
					/>
				</RadioButtonGroup>
			</FormGroup>
		</div>);

		var assocLinkType = (<div className="harness-sidepanel-children" id="harness-sidepanel-assoc-link-type">
			<FormGroup
				legendText="Association Link Type"
			>
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
			</FormGroup>
		</div>);

		var enableCanvasUnderlay = (<div className="harness-sidepanel-children" id="harness-sidepanel-canvas-underlay">
			<FormGroup
				legendText="Enable Canvas Underlay"
			>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="selectedCanvasUnderlay" // Set name to corresponding field name in App.js
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedCanvasUnderlay")}
				>
					<RadioButton
						value={UNDERLAY_NONE}
						labelText={UNDERLAY_NONE}
					/>
					<RadioButton
						value={UNDERLAY_VARIABLE}
						labelText={UNDERLAY_VARIABLE}
					/>
				</RadioButtonGroup>
			</FormGroup>
		</div>);

		var enableObjectModel = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedInternalObjectModel" // Set ID to corresponding field in App.js state
				labelText="Use Object Model"
				toggled={this.props.getStateValue("selectedInternalObjectModel")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableSaveToPalette = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-save-to-palette-toggle">
				<Toggle
					id="selectedSaveToPalette" // Set ID to corresponding field in App.js state
					labelText="Enable Save To Palette"
					toggled={this.props.getStateValue("selectedSaveToPalette")}
					onToggle={this.setStateValue}
				/>
			</div>);

		var enableInsertNodeDroppedOnLink = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-insert-node-dropped-on-link-toggle">
				<Toggle
					id="selectedInsertNodeDroppedOnLink" // Set ID to corresponding field in App.js state
					labelText="Enable Insert Node Dropped On Link"
					toggled={this.props.getStateValue("selectedInsertNodeDroppedOnLink")}
					onToggle={this.setStateValue}
				/>
			</div>);

		var enableHighlightNodeOnNewLinkDrag = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-highlight-node-on-new-link-drag-toggle">
				<Toggle
					id="selectedHighlightNodeOnNewLinkDrag" // Set ID to corresponding field in App.js state
					labelText="Enable Highlight Node On New Link Drag"
					toggled={this.props.getStateValue("selectedHighlightNodeOnNewLinkDrag")}
					onToggle={this.setStateValue}
				/>
			</div>);

		var enableHighlightUnavailableNodes = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-highlight-unavailable-nodes-toggle">
				<Toggle
					id="selectedHighlightUnavailableNodes" // Set ID to corresponding field in App.js state
					labelText="Enable Highlight Unavailable Nodes"
					toggled={this.props.getStateValue("selectedHighlightUnavailableNodes")}
					onToggle={this.setStateValue}
				/>
			</div>);

		var enableZoomIntoSubFlows = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-zoom-into-subflows-toggle">
				<Toggle
					id="selectedZoomIntoSubFlows" // Set ID to corresponding field in App.js state
					labelText="Enable Zoom Into Sub-flows"
					toggled={this.props.getStateValue("selectedZoomIntoSubFlows")}
					onToggle={this.setStateValue}
				/>
			</div>);

		var enableSingleOutputPortDisplay = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-single-output-port-display-toggle">
				<Toggle
					id="selectedSingleOutputPortDisplay" // Set ID to corresponding field in App.js state
					labelText="Enable Single Output Port Display"
					toggled={this.props.getStateValue("selectedSingleOutputPortDisplay")}
					onToggle={this.setStateValue}
				/>
			</div>);


		var enableDropZoneOnExternalDrag = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-drop-zone-on-external-drag-toggle">
				<Toggle
					id="selectedDropZoneOnExternalDrag" // Set ID to corresponding field in App.js state
					labelText="Enable Drop Zone on Drag"
					toggled={this.props.getStateValue("selectedDropZoneOnExternalDrag")}
					onToggle={this.setStateValue}
				/>
			</div>);

		var enableDisplayCustomizedDropZoneContent = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-display-drop-zone-content-toggle">
				<Toggle
					id="selectedDisplayCustomizedDropZoneContent" // Set ID to corresponding field in App.js state
					labelText="Display customized drop zone content"
					toggled={this.props.getStateValue("selectedDisplayCustomizedDropZoneContent")}
					onToggle={this.setStateValue}
				/>
			</div>);

		var enableDisplayCustomizedEmptyCanvasContent = (
			<div className="harness-sidepanel-children" id="harness-sidepanel-display-empty-canvas-content-toggle">
				<Toggle
					id="selectedDisplayCustomizedEmptyCanvasContent" // Set ID to corresponding field in App.js state
					labelText="Display customized empty canvas content"
					toggled={this.props.getStateValue("selectedDisplayCustomizedEmptyCanvasContent")}
					onToggle={this.setStateValue}
				/>
			</div>);

		var enableCreateSupernodeNonContiguous = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedCreateSupernodeNonContiguous" // Set ID to corresponding field in App.js state
				labelText="Enable Create Supernode for Noncontiguous Nodes"
				toggled={this.props.getStateValue("selectedCreateSupernodeNonContiguous")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableMoveNodesOnSupernodeResize = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedMoveNodesOnSupernodeResize" // Set ID to corresponding field in App.js state
				labelText="Enable move surrounding nodes when resizing a supernode."
				toggled={this.props.getStateValue("selectedMoveNodesOnSupernodeResize")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableExternalPipelineFlows = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedExternalPipelineFlows" // Set ID to corresponding field in App.js state
				labelText="Enable External Pipeline Flows"
				toggled={this.props.getStateValue("selectedExternalPipelineFlows")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableEditingActions = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedEditingActions" // Set ID to corresponding field in App.js state
				labelText="Enable Editing Actions"
				toggled={this.props.getStateValue("selectedEditingActions")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var enableResizableNodes = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedResizableNodes" // Set ID to corresponding field in App.js state
				labelText="Enable Resizable Nodes"
				toggled={this.props.getStateValue("selectedResizableNodes")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var interactionType = (<div className="harness-sidepanel-children" id="harness-sidepanel-interaction-type">
			<FormGroup
				legendText="Interaction Type"
			>
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
						value={INTERACTION_CARBON}
						labelText={INTERACTION_CARBON}
					/>
					<RadioButton
						value={INTERACTION_TRACKPAD}
						labelText={INTERACTION_TRACKPAD}
					/>
				</RadioButtonGroup>
			</FormGroup>
		</div>);

		var nodeFormatType = (<div className="harness-sidepanel-children">
			<FormGroup
				legendText="Node Format Type"
			>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="selectedNodeFormatType" // Set name to corresponding field name in App.js
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedNodeFormatType")}
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
			</FormGroup>
		</div>);

		var linkType = (<div className="harness-sidepanel-children" id="harness-sidepanel-link-type">
			<FormGroup
				legendText="Link Type"
			>
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
			</FormGroup>
		</div>);

		var linkDirection = (<div className="harness-sidepanel-children" id="harness-sidepanel-link-direction">
			<FormGroup
				legendText="Link Direction"
			>
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
			</FormGroup>
		</div>);

		const exampleApps = (<div className="harness-sidepanel-children">
			<FormGroup
				legendText="Example canvas apps"
			>
				<RadioButtonGroup
					className="harness-sidepanel-radio-group"
					name="node_layout_radio"
					onChange={this.exampleAppOptionChange}
					defaultSelected={this.props.getStateValue("selectedExampleApp")}
				>
					<RadioButton
						value={EXAMPLE_APP_FLOWS}
						labelText={EXAMPLE_APP_FLOWS}
					/>
					<RadioButton
						value={EXAMPLE_APP_STAGES}
						labelText={EXAMPLE_APP_STAGES}
					/>
					<RadioButton
						value={EXAMPLE_APP_STAGES_CARD_NODE}
						labelText={EXAMPLE_APP_STAGES_CARD_NODE}
					/>
					<RadioButton
						value={EXAMPLE_APP_READ_ONLY}
						labelText={EXAMPLE_APP_READ_ONLY}
					/>
					<RadioButton
						value={EXAMPLE_APP_PROGRESS}
						labelText={EXAMPLE_APP_PROGRESS}
					/>
					<RadioButton
						value={EXAMPLE_APP_LOGIC}
						labelText={EXAMPLE_APP_LOGIC}
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
						value={EXAMPLE_APP_REACT_NODES}
						labelText={EXAMPLE_APP_REACT_NODES}
					/>
					<RadioButton
						value={EXAMPLE_APP_NONE}
						labelText={EXAMPLE_APP_NONE}
					/>
				</RadioButtonGroup>
			</FormGroup>
		</div>);

		var paletteLayout = (<div className="harness-sidepanel-children" id="harness-sidepanel-palette-layout">
			<FormGroup
				legendText="Palette Layout"
			>
				<RadioButtonGroup
					name="selectedPaletteLayout" // Set name to corresponding field name in App.js
					className="harness-sidepanel-radio-group"
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedPaletteLayout")}
				>
					<RadioButton
						value={PALETTE_FLYOUT}
						labelText={PALETTE_FLYOUT}
					/>
					<RadioButton
						value={PALETTE_MODAL}
						labelText={PALETTE_MODAL}
					/>
					<RadioButton
						value={PALETTE_NONE}
						labelText={PALETTE_NONE}
					/>
				</RadioButtonGroup>
			</FormGroup>
			<div>
				<Toggle
					id="selectedNarrowPalette" // Set ID to corresponding field in App.js state
					labelText="Show Narrow Palette"
					toggled={this.props.getStateValue("selectedNarrowPalette")}
					onToggle={this.setStateValue}
				/>
			</div>
		</div>);

		var stateTag = (<div className="harness-sidepanel-children" id="harness-sidepanel-state-tag">
			<FormGroup
				legendText="State Tag"
			>
				<RadioButtonGroup
					name="selectedStateTag" // Set name to corresponding field name in App.js
					className="harness-sidepanel-radio-group"
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedStateTag")}
				>
					<RadioButton
						value={STATE_TAG_NONE}
						labelText={STATE_TAG_NONE}
					/>
					<RadioButton
						value={STATE_TAG_LOCKED}
						labelText={STATE_TAG_LOCKED}
					/>
					<RadioButton
						value={STATE_TAG_READ_ONLY}
						labelText={STATE_TAG_READ_ONLY}
					/>
				</RadioButtonGroup>
			</FormGroup>
			<div className="harness-state-tag-tip-text">
				<TextInput
					id="selectedStateTagTip" // Set ID to corresponding field in App.js state
					labelText="Tip text (will show default if empty)"
					onChange={this.enteredStateValue}
					value={this.props.getStateValue("selectedStateTagTip")}
				/>
			</div>
		</div>);

		var toolbarLayout = (<div className="harness-sidepanel-children" id="harness-sidepanel-toolbar-layout">
			<FormGroup
				legendText="Toolbar Layout"
			>
				<RadioButtonGroup
					name="selectedToolbarLayout" // Set name to corresponding field name in App.js
					className="harness-sidepanel-radio-group"
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedToolbarLayout")}
				>
					<RadioButton
						value={TOOLBAR_LAYOUT_NONE}
						labelText={TOOLBAR_LAYOUT_NONE}
					/>
					<RadioButton
						value={TOOLBAR_LAYOUT_TOP}
						labelText={TOOLBAR_LAYOUT_TOP}
					/>
				</RadioButtonGroup>
			</FormGroup>
		</div>);

		var toolbarType = (<div className="harness-sidepanel-children" id="harness-sidepanel-toolbar-type">
			<FormGroup
				legendText="Toolbar Type"
			>
				<RadioButtonGroup
					name="selectedToolbarType" // Set name to corresponding field name in App.js
					className="harness-sidepanel-radio-group"
					onChange={this.setStateValue}
					defaultSelected={this.props.getStateValue("selectedToolbarType")}
				>
					<RadioButton
						value={TOOLBAR_TYPE_DEFAULT}
						labelText={TOOLBAR_TYPE_DEFAULT}
					/>
					<RadioButton
						value={TOOLBAR_TYPE_SUB_AREAS}
						labelText={TOOLBAR_TYPE_SUB_AREAS}
					/>
					<RadioButton
						value={TOOLBAR_TYPE_SINGLE_BAR}
						labelText={TOOLBAR_TYPE_SINGLE_BAR}
					/>
					<RadioButton
						value={TOOLBAR_TYPE_BEFORE_AFTER}
						labelText={TOOLBAR_TYPE_BEFORE_AFTER}
					/>
					<RadioButton
						value={TOOLBAR_TYPE_CUSTOM_RIGHT_SIDE}
						labelText={TOOLBAR_TYPE_CUSTOM_RIGHT_SIDE}
					/>
					<RadioButton
						value={TOOLBAR_TYPE_CARBON_BUTTONS}
						labelText={TOOLBAR_TYPE_CARBON_BUTTONS}
					/>
					<RadioButton
						value={TOOLBAR_TYPE_CUSTOM_ACTIONS}
						labelText={TOOLBAR_TYPE_CUSTOM_ACTIONS}
					/>
					<RadioButton
						value={TOOLBAR_TYPE_OVERRIDE_AUTO_ENABLE_DISABLE}
						labelText={TOOLBAR_TYPE_OVERRIDE_AUTO_ENABLE_DISABLE}
					/>
				</RadioButtonGroup>
			</FormGroup>
		</div>);

		var tipConfig = (<div className="harness-sidepanel-children" id="harness-sidepanel-tip-config">
			<fieldset className="bx--fieldset">
				<legend className="bx--label">Tips</legend>
				<Checkbox
					id="tip_palette_categories"
					labelText={TIP_PALETTE_CATEGORIES}
					onChange={this.tipConfigChange}
					checked={get(this.props.getStateValue("selectedTipConfig"), "palette.categories", false)}
				/>
				<Checkbox
					id="tip_palette_node_templates"
					labelText={TIP_PALETTE_NODE_TEMPLATES}
					onChange={this.tipConfigChange}
					checked={get(this.props.getStateValue("selectedTipConfig"), "palette.nodeTemplates", false)}
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
					id="tip_decorations"
					labelText={TIP_DECORATIONS}
					onChange={this.tipConfigChange}
					checked={this.props.getStateValue("selectedTipConfig").decorations}
				/>
				<Checkbox
					id="tip_links"
					labelText={TIP_LINKS}
					onChange={this.tipConfigChange}
					checked={this.props.getStateValue("selectedTipConfig").links}
				/>
				<Checkbox
					id="tip_state_tag"
					labelText={TIP_STATE_TAG}
					onChange={this.tipConfigChange}
					checked={this.props.getStateValue("selectedTipConfig").stateTag}
				/>
			</fieldset>
		</div>);

		var extraCanvas = (<div className="harness-sidepanel-children" id="harness-sidepanel-extra-canvas">
			<Toggle
				id="selectedExtraCanvasDisplayed" // Set ID to corresponding field in App.js state
				labelText="Extra canvas"
				toggled={this.props.getStateValue("selectedExtraCanvasDisplayed")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var nodeDraggable = (<div className="harness-sidepanel-children">
			<div className="harness-sidepanel-headers">
				Draggable Node (Requires modelerPalette.json to be set.)
			</div>
			<div id="harness-sidePanelNodeDraggable" draggable="true"
				onDragStart={this.onDragStart} onDragOver={this.onDragOver}
			>
				<div className="harness-sidepanel-list-item-icon">
					<img draggable="false" src="/images/nodes/derive.svg" alt="Derive Node" />
				</div>
				<div>
					<span className="harness-sidepanel-list-item-text">Derive</span>
				</div>
			</div>
		</div>);

		var schemaValidation = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedSchemaValidation" // Set ID to corresponding field in App.js state
				labelText="Schema Validation"
				toggled={this.props.getStateValue("selectedSchemaValidation")}
				onToggle={this.setStateValue}
			/>
		</div>);

		var displayBoudingRectangles = (<div className="harness-sidepanel-children">
			<Toggle
				id="selectedBoundingRectangles" // Set ID to corresponding field in App.js state
				labelText="Display Bounding Rectangles"
				toggled={this.props.getStateValue("selectedBoundingRectangles")}
				onToggle={this.setStateValue}
			/>
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
			<Toggle
				id="keepOpen" // Set ID to corresponding field in App.js state
				labelText="Keep Notification Center Open. When enabled, clicking outside the notification center will not close it"
				toggled={this.props.getStateValue("notificationConfig").keepOpen}
				onToggle={this.notificationConfigToggle}
			/>
			<Toggle
				id="secondaryButtonDisabled" // Set ID to corresponding field in App.js state
				labelText="Disable the notification center secondary button"
				toggled={this.props.getStateValue("notificationConfig").secondaryButtonDisabled}
				onToggle={this.notificationConfigToggle}
			/>
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
			<Toggle
				id="keepOpen2"
				disabled={!this.props.getStateValue("selectedExtraCanvasDisplayed")}
				labelText="Keep Notification Center Open. When enabled, clicking outside the notification center will not close it"
				toggled={this.props.getStateValue("notificationConfig2").keepOpen}
				onToggle={this.notificationConfigToggle}
			/>
		</div>);

		const displayFullLabelOnHover = (
			<div className="harness-sidepanel-children">
				<Toggle
					id="selectedDisplayFullLabelOnHover" // Set ID to corresponding field in App.js state
					labelText="Display full node label on hover"
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
					<div className="harness-side-panel-header">Palette</div>
					{divider}
					{paletteInput}
					{divider}
					{paletteLayout}
					{divider}
					{enableAutoLinkOnlyFromSelNodes}
					{divider}
					<div className="harness-side-panel-header">Nodes</div>
					{divider}
					{nodeFormatType}
					{divider}
					{enableResizableNodes}
					{divider}
					{enableInsertNodeDroppedOnLink}
					{divider}
					{enableHighlightNodeOnNewLinkDrag}
					{divider}
					{enableHighlightUnavailableNodes}
					{divider}
					{enableSingleOutputPortDisplay}
					{divider}
					{displayFullLabelOnHover}
					{divider}
					<div className="harness-side-panel-header">Supernodes</div>
					{divider}
					{enableMoveNodesOnSupernodeResize}
					{divider}
					<div className="harness-side-panel-header">Links</div>
					{divider}
					{linkType}
					{divider}
					{linkDirection}
					{divider}
					{enableLinkSelection}
					{divider}
					{enableLinkReplaceOnNewConnection}
					{divider}
					{enableAssocLinkCreation}
					{divider}
					{assocLinkType}
					{divider}
					<div className="harness-side-panel-header">Comments</div>
					{divider}
					{enableMarkdownInComments}
					{divider}
					<div className="harness-side-panel-header">Drag, Pan, Zoom and Select</div>
					{divider}
					{saveZoom}
					{divider}
					{enablePanIntoViewOnOpen}
					{divider}
					{enableZoomIntoSubFlows}
					{divider}
					{enableDragWithoutSelect}
					{divider}
					<div className="harness-side-panel-header">Toolbar</div>
					{divider}
					{toolbarLayout}
					{divider}
					{toolbarType}
					{divider}
					<div className="harness-side-panel-header">Right Flyout</div>
					{divider}
					{enableShowRightFlyout}
					{divider}
					{enableRightFlyoutUnderToolbar}
					{divider}
					{enablePositionNodeOnRightFlyoutOpen}
					{divider}
					<div className="harness-side-panel-header">Bottom Panel</div>
					{divider}
					{enableShowBottomPanel}
					{divider}
					<div className="harness-side-panel-header">Top Panel</div>
					{divider}
					{enableShowTopPanel}
					{divider}
					<div className="harness-side-panel-header">Context Menu</div>
					{divider}
					{enableSaveToPalette}
					{divider}
					{enableCreateSupernodeNonContiguous}
					{divider}
					<div className="harness-side-panel-header">Canvas Content</div>
					{divider}
					{interactionType}
					{divider}
					{snapToGrid}
					{divider}
					{stateTag}
					{divider}
					{enableDropZoneOnExternalDrag}
					{divider}
					{enableDisplayCustomizedDropZoneContent}
					{divider}
					{enableDisplayCustomizedEmptyCanvasContent}
					{divider}
					{displayBoudingRectangles}
					{divider}
					{enableCanvasUnderlay}
					{divider}
					<div className="harness-side-panel-header">Operational</div>
					{divider}
					{enableImageDisplay}
					{divider}
					{enableContextToolbar}
					{divider}
					{enableEditingActions}
					{divider}
					{enableObjectModel}
					{divider}
					{enableExternalPipelineFlows}
					{divider}
					{schemaValidation}
					{divider}
					{enableBrowserEditMenu}
					{divider}
					<div className="harness-side-panel-header">Tip Config</div>
					{divider}
					{tipConfig}
					{divider}
					<div className="harness-side-panel-header">Draggable node</div>
					{divider}
					{nodeDraggable}
					{divider}
					<div className="harness-side-panel-header">Notifications</div>
					{divider}
					{configureNotificationCenter}
					{divider}
					<div className="harness-side-panel-header">Extra Canvas</div>
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
