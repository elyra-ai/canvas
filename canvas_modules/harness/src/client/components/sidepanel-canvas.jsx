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
	CHOOSE_FROM_LOCATION,
	LEGACY_ENGINE,
	D3_ENGINE,
	HALO_CONNECTION,
	PORTS_CONNECTION,
	CURVE_LINKS,
	ELBOW_LINKS,
	STRAIGHT_LINKS,
	FLYOUT,
	MODAL
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
			selectedPaletteDropdownFile: "",
			oneTimeLayout: NONE
		};

		this.onCanvasFileSelect = this.onCanvasFileSelect.bind(this);
		this.isReadyToSubmitCanvasData = this.isReadyToSubmitCanvasData.bind(this);

		this.onCanvasPaletteSelect = this.onCanvasPaletteSelect.bind(this);
		this.isReadyToSubmitPaletteData = this.isReadyToSubmitPaletteData.bind(this);

		this.layoutDirectionOptionChange = this.layoutDirectionOptionChange.bind(this);
		this.oneTimeHorizontalLayout = this.oneTimeHorizontalLayout.bind(this);
		this.oneTimeVerticalLayout = this.oneTimeVerticalLayout.bind(this);
		this.disableOneTimeLayoutButtons = this.disableOneTimeLayoutButtons.bind(this);
		this.useInternalObjectModel = this.useInternalObjectModel.bind(this);
		this.renderingEngineOptionChange = this.renderingEngineOptionChange.bind(this);
		this.connectionTypeOptionChange = this.connectionTypeOptionChange.bind(this);
		this.linkTypeOptionChange = this.linkTypeOptionChange.bind(this);
		this.paletteLayoutOptionChange = this.paletteLayoutOptionChange.bind(this);
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
			var that = this;
			this.setState({
				selectedCanvasDropdownFile: obj.selected,
				canvasDiagram: "",
				canvasFileChooserVisible: false
			}, function() {
				that.props.log("Submit canvas diagram", that.state.selectedPropertiesDropdownFile);
				FormsService.getFileContent("diagrams", that.state.selectedCanvasDropdownFile)
				.then(function(res) {
					that.props.setDiagramJSON(res);
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

	oneTimeHorizontalLayout() {
		this.props.setOneTimeLayoutDirection(HORIZONTAL);
	}

	oneTimeVerticalLayout() {
		this.props.setOneTimeLayoutDirection(VERTICAL);
	}

	disableOneTimeLayoutButtons() {
		if (this.state.oneTimeLayout !== NONE) {
			return true;
		}
		return false;
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
		}
		// enable palette
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

	linkTypeOptionChange(evt, obj) {
		this.props.setLinkType(obj.selected);
	}
	paletteLayoutOptionChange(evt, obj) {
		this.props.setPaletteLayout(obj.selected);
	}
	renderingEngineOptionChange(evt, obj) {
		this.props.setRenderingEngine(obj.selected);
	}

	render() {
		var divider = (<div className="sidepanel-children sidepanel-divider" />);
		var space = (<div className="sidepanel-spacer" />);

		var canvasFileChooserVisible = <div></div>;
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
					disabled={!this.isReadyToSubmitCanvasData()}
					onClick={this.submitCanvas.bind(this)}
				>
					Submit
				</Button>
			</div>);
		}

		var paletteFileChooserVisible = <div></div>;
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

		var layoutDirection = (<div className="sidepanel-children" id="sidepanel-layout-direction">
			<div className="sidepanel-headers">Fixed Layout</div>
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

		var layoutOnDemand = (<div className="sidepanel-children" id="sidepanel-oneTime-layout-direction">
		<div className="sidepanel-headers">Layout on Demand</div>
			<Button dark
				id="buttonOneTimeLayoutHorizontal"
				disabled={this.disableOneTimeLayoutButtons()}
				onClick={this.oneTimeHorizontalLayout}
			>
				Horizontal
			</Button>
			<Button dark
				id="buttonOneTimeLayoutVertical"
				disabled={this.disableOneTimeLayoutButtons()}
				onClick={this.oneTimeVerticalLayout}
			>
				Vertical
			</Button>
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
			<RadioGroup name="rendering_radio"
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
			<RadioGroup name="connection_type_radio"
				dark
				onChange={this.connectionTypeOptionChange}
				choices={[
					HALO_CONNECTION,
					PORTS_CONNECTION
				]}
				selected={HALO_CONNECTION}
			/>
		</div>);

		var linkType = (<div className="sidepanel-children" id="sidepanel-link-type">
			<div className="sidepanel-headers">Link Type (for 'Ports')</div>
			<RadioGroup name="link_type_radio"
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
			<RadioGroup name="palette_layout_radio"
				dark
				onChange={this.paletteLayoutOptionChange}
				choices={[
					FLYOUT,
					MODAL
				]}
				selected={FLYOUT}
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
				{layoutOnDemand}
				{divider}
				{enableObjectModel}
				{divider}
				{renderingEngine}
				{divider}
				{connectionType}
				{divider}
				{linkType}
				{divider}
				{paletteLayout}
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
	setOneTimeLayoutDirection: React.PropTypes.func,
	useInternalObjectModel: React.PropTypes.func,
	setRenderingEngine: React.PropTypes.func,
	setConnectionType: React.PropTypes.func,
	setLinkType: React.PropTypes.func,
	log: React.PropTypes.func,
	setPaletteLayout: React.PropTypes.func
};
