/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint no-undef: "error" */

import React from "react";
import PropTypes from "prop-types";
import {
	Button,
	Dropdown,
	TextField
} from "ap-components-react/dist/ap-components-react";
import {
	API_SET_PIPELINEFLOW,
	API_ADD_PALETTE_ITEM
} from "../constants/constants.js";

const defaultNodeType = {
	"label": "Custom Node Type",
	"description": "Custom node type",
	"operator_id_ref": "customOp",
	"type": "binding",
	"image": "/images/common_node_icons/models/model_cart_build.svg",
	"input_ports": [
		{
			"id": "inPort",
			"label": "Input Port",
			"cardinality": {
				"min": 0,
				"max": -1
			}
		}
	],
	"output_ports": [
		{
			"id": "outPort",
			"label": "Output Port",
			"cardinality": {
				"min": 0,
				"max": -1
			}
		}
	],
};

export default class SidePanelAPI extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedOperation: "",
			pipelineFlow: JSON.stringify(this.props.getPipelineFlow()),
			categoryId: "",
			categoryName: "",
			paletteItem: JSON.stringify(defaultNodeType),
			isValidPipelineFlow: true,
			isValidPaletteItem: true
		};
	}

	onOperationSelect(evt, obj) {
		var operation = obj.selected;
		this.setState({ selectedOperation: obj.selected });
		this.props.log("Operation selected", operation);
	}

	onFieldChange(fieldName, evt) {
		const stateObj = {};
		stateObj[fieldName] = evt.target.value;
		switch (fieldName) {
		case "pipelineFlow":
			try {
				JSON.parse(evt.target.value);
				stateObj.isValidPipelineFlow = true;
			} catch (ex) {
				stateObj.isValidPipelineFlow = false;
			}
			break;
		case "paletteItem":
			try {
				JSON.parse(evt.target.value);
				stateObj.isValidPaletteItem = true;
			} catch (ex) {
				stateObj.isValidPaletteItem = false;
			}
			break;
		default: {
			break;
		}
		}
		this.setState(stateObj);
	}

	refreshPipeline() {
		this.setState({ pipelineFlow: JSON.stringify(this.props.getPipelineFlow()),
			isValidPipelineFlow: true });
	}

	isReadyToSubmit() {
		switch (this.state.selectedOperation) {
		case API_SET_PIPELINEFLOW: {
			return this.state.isValidPipelineFlow;
		}
		case API_ADD_PALETTE_ITEM:
			return (this.state.isValidPaletteItem && this.state.categoryId && this.state.categoryId.length > 0);
		default:
			return false;
		}
	}

	callAPI() {
		switch (this.state.selectedOperation) {
		case API_SET_PIPELINEFLOW:
			this.props.setPipelineFlow(JSON.parse(this.state.pipelineFlow));
			break;
		case API_ADD_PALETTE_ITEM:
			this.props.addNodeTypeToPalette(
				JSON.parse(this.state.paletteItem),
				this.state.categoryId,
				this.state.categoryName);
			break;
		default:
		}
	}

	render() {
		var divider = (<div className="sidepanel-children sidepanel-divider" />);
		var space = (<div className="sidepanel-spacer" />);

		var operationSelection =
			(<div className="sidepanel-children" id="sidepanel-api-list">
				<Dropdown
					name="operationDropdown"
					text="Operations"
					id="sidepanel-operation-dropdown"
					maxVisibleItems={4}
					dark
					options={[API_SET_PIPELINEFLOW, API_ADD_PALETTE_ITEM]}
					onSelect={this.onOperationSelect.bind(this)}
					value={this.state.selectedOperation}
				/>
			</div>);

		var submit =
			(<div className="sidepanel-children" id="sidepanel-api-submit">
				<Button dark
					id="canvasFileSubmit"
					disabled={!this.isReadyToSubmit()}
					onClick={this.callAPI.bind(this)}
				>
					Submit
				</Button>
			</div>);


		var setPipelineFlow = <div />;
		if (this.state.selectedOperation === API_SET_PIPELINEFLOW) {
			setPipelineFlow = (<div className="sidepanel-children" id="sidepanel-api-pipelineFlow">
				<TextField dark
					id="pipelineFlow"
					type="textarea"
					rows={20}
					onChange={this.onFieldChange.bind(this, "pipelineFlow")}
					value={this.state.pipelineFlow}
				/>
				<Button dark
					id="refreshPipeline"
					onClick={this.refreshPipeline.bind(this)}
				>
					Refresh
				</Button>
			</div>);
		}

		var addItemToPaletteSection = <div />;
		if (this.state.selectedOperation === API_ADD_PALETTE_ITEM) {
			addItemToPaletteSection = (<div className="sidepanel-children" id="sidepanel-api-paletteItem">
				<TextField dark
					id="categoryId"
					placeholder="Category id"
					type="text"
					onChange={this.onFieldChange.bind(this, "categoryId")}
					value={this.state.categoryId}
				/>
				<TextField dark
					id="categoryName"
					placeholder="Category name"
					type="text"
					onChange={this.onFieldChange.bind(this, "categoryName")}
					value={this.state.categoryName}
				/>
				<TextField dark
					id="paletteItem"
					placeholder="Palette node item"
					type="textarea"
					rows={10}
					onChange={this.onFieldChange.bind(this, "paletteItem")}
					value={this.state.paletteItem}
				/>
			</div>);
		}

		return (
			<div>
				{space}
				{operationSelection}
				{divider}
				{setPipelineFlow}
				{addItemToPaletteSection}
				{divider}
				{submit}
			</div>
		);
	}
}

SidePanelAPI.propTypes = {
	log: PropTypes.func,
	getPipelineFlow: PropTypes.func,
	setPipelineFlow: PropTypes.func,
	addNodeTypeToPalette: PropTypes.func
};
