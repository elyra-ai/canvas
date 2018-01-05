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
import isEmpty from "lodash/isEmpty";
import Button from "ap-components-react/dist/components/Button";
import Dropdown from "ap-components-react/dist/components/Dropdown";
import TextField from "ap-components-react/dist/components/TextField";
import {
	API_SET_PIPELINEFLOW,
	API_ADD_PALETTE_ITEM,
	API_SET_NODE_LABEL,
	API_SET_INPUT_PORT_LABEL,
	API_SET_OUTPUT_PORT_LABEL,
	INPUT_PORT,
	OUTPUT_PORT
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
			isValidPaletteItem: true,
			nodeId: "",
			portId: "",
			newLabel: "",
			nodes: [],
			ports: []
		};
	}

	onOperationSelect(evt, obj) {
		const operation = obj.selected;
		let nodes = [];
		let ports = [];
		let nodeId = "";
		let portId = "";
		let newLabel = "";

		if (operation === API_SET_NODE_LABEL) {
			// when selecting operation to set node name, build list of nodes and select the first one by default
			nodes = this.getNodePortList(this.props.getCanvasInfo().nodes);
			if (!isEmpty(nodes)) {
				nodeId = nodes[0].value;
				newLabel = this.props.getCanvasInfo().nodes[0].label;
			}
		} else if (operation === API_SET_INPUT_PORT_LABEL || operation === API_SET_OUTPUT_PORT_LABEL) {
			// when selecting operation to set input or output port...
			const filteredNodeList = (operation === API_SET_INPUT_PORT_LABEL)
				? this.props.getCanvasInfo().nodes.filter((node) => !isEmpty(node.input_ports))
				: this.props.getCanvasInfo().nodes.filter((node) => !isEmpty(node.output_ports));
			// ... get list if nodes that have input or output ports...
			nodes = this.getNodePortList(filteredNodeList);
			if (!isEmpty(nodes)) {
				// ... select the first node by default
				nodeId = nodes[0].value;
				const filteredPortList = (operation === API_SET_INPUT_PORT_LABEL
					? filteredNodeList[0].input_ports : filteredNodeList[0].output_ports);
				// ... build the list of ports and select the first one by default
				if (!isEmpty(filteredPortList)) {
					ports = this.getNodePortList(filteredPortList);
					portId = ports[0].value;
					newLabel = ports[0].label;
				}
			}
		}

		this.setState({
			selectedOperation: operation,
			nodeId: nodeId,	// id of selected node
			portId: portId, // id of selected port
			nodes: nodes, // list of nodes in format { value: label, id: nodeId }
			ports: ports, // list of input or output ports in format { value: label, id: portId }
			newLabel: newLabel });
		this.props.log("Operation selected", operation);
	}

	onNodeSelect(evt, obj) {
		const nodeId = obj.selected;
		const newState = { nodeId: obj.selected, portId: "", newLabel: "" };
		const existingNode = this.props.getCanvasInfo().nodes.find((node) => (node.id === nodeId));
		if (existingNode) {
			if (this.state.selectedOperation === API_SET_NODE_LABEL) {
				// when op to set node name is selected, set the current node name in text field
				newState.newLabel = existingNode.label;
			} else if (this.state.selectedOperation === API_SET_INPUT_PORT_LABEL) {
				// get list of input ports for the selected node and select the first one by default
				newState.ports = this.getNodePortList(existingNode.input_ports);
				if (!isEmpty(newState.ports)) {
					newState.portId = newState.ports[0].value;
					const port = existingNode.input_ports.find(function(port2) {
						return (port2.id === newState.ports[0].value);
					});
					newState.newLabel = port.label;
				}
			} else if (this.state.selectedOperation === API_SET_OUTPUT_PORT_LABEL) {
				// get list of output ports for the selected node and select the first one by default
				newState.ports = this.getNodePortList(existingNode.output_ports);
				if (!isEmpty(newState.ports)) {
					newState.portId = newState.ports[0].value;
					const port = existingNode.output_ports.find(function(port2) {
						return (port2.id === newState.ports[0].value);
					});
					newState.newLabel = port.label;
				}
			}
		}
		this.setState(newState);
		this.props.log("Node selected", nodeId);
	}

	onPortSelect(evt, obj) {
		const portId = obj.selected;
		const newState = { portId: obj.selected };
		const existingNode = this.props.getCanvasInfo().nodes.find((node) => (node.id === this.state.nodeId));
		if (existingNode) {
			const ports = (this.state.selectedOperation === API_SET_INPUT_PORT_LABEL
				? existingNode.input_ports : existingNode.output_ports);
			const existingPort = ports.find((port) => (port.id === portId));
			if (existingPort) {
				newState.newLabel = existingPort.label;
			}
		}
		this.setState(newState);
		this.props.log("Port selected", portId);
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

	getNodePortList(items) {
		return items.map(function(item) {
			return ({ label: item.label, value: item.id });
		});
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
		case API_SET_NODE_LABEL:
			return (this.state.nodeId && this.state.newLabel.length > 0);
		case API_SET_INPUT_PORT_LABEL:
		case API_SET_OUTPUT_PORT_LABEL:
			return (this.state.nodeId && this.state.portId && this.state.newLabel.length > 0);
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
		case API_SET_NODE_LABEL:
			this.props.setNodeLabel(
				this.state.nodeId,
				this.state.newLabel);
			this.setState({ nodes: this.getNodePortList(this.props.getCanvasInfo().nodes) });
			break;
		case API_SET_INPUT_PORT_LABEL: {
			this.props.setPortLabel(
				this.state.nodeId,
				this.state.portId,
				this.state.newLabel,
				INPUT_PORT
			);
			const existingNode = this.props.getCanvasInfo().nodes.find((node) => (node.id === this.state.nodeId));
			this.setState({ ports: this.getNodePortList(existingNode.input_ports) });
			break;
		}
		case API_SET_OUTPUT_PORT_LABEL: {
			this.props.setPortLabel(
				this.state.nodeId,
				this.state.portId,
				this.state.newLabel,
				OUTPUT_PORT
			);
			const existingNode = this.props.getCanvasInfo().nodes.find((node) => (node.id === this.state.nodeId));
			this.setState({ ports: this.getNodePortList(existingNode.output_ports) });
			break;
		}
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
					maxVisibleItems={7}
					dark
					options={[
						API_SET_PIPELINEFLOW,
						API_ADD_PALETTE_ITEM,
						API_SET_NODE_LABEL,
						API_SET_INPUT_PORT_LABEL,
						API_SET_OUTPUT_PORT_LABEL]}
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

		var setNodePortLabelSection = <div />;
		if (this.state.selectedOperation === API_SET_NODE_LABEL ||
				this.state.selectedOperation === API_SET_INPUT_PORT_LABEL ||
				this.state.selectedOperation === API_SET_OUTPUT_PORT_LABEL) {

			setNodePortLabelSection = (<div className="sidepanel-children" id="sidepanel-api-nodePortLabel">
				<Dropdown
					name="nodeIdDropDown"
					id="sidepanel-nodeId-dropdown"
					maxVisibleItems={6}
					dark
					options={this.state.nodes}
					onSelect={this.onNodeSelect.bind(this)}
					value={this.state.nodeId}
					text="Node Selection"
				/>
				{(this.state.selectedOperation === API_SET_INPUT_PORT_LABEL ||
					this.state.selectedOperation === API_SET_OUTPUT_PORT_LABEL) &&
					<Dropdown
						name="portIdDropDown"
						id="sidepanel-portId-dropdown"
						maxVisibleItems={6}
						dark
						options={this.state.ports}
						onSelect={this.onPortSelect.bind(this)}
						value={this.state.portId}
						text="Port Selection"
					/>
				}
				<TextField dark
					id="newLabel"
					placeholder="Label"
					type="text"
					onChange={this.onFieldChange.bind(this, "newLabel")}
					value={this.state.newLabel}
					disabled={(this.state.selectedOperation === API_SET_NODE_LABEL && !this.state.nodeId) ||
					((this.state.selectedOperation === API_SET_INPUT_PORT_LABEL ||
						this.state.selectedOperation === API_SET_OUTPUT_PORT_LABEL) &&
						!this.state.portId)}
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
				{setNodePortLabelSection}
				{divider}
				{submit}
			</div>
		);
	}
}

SidePanelAPI.propTypes = {
	log: PropTypes.func,
	getCanvasInfo: PropTypes.func,
	getPipelineFlow: PropTypes.func,
	setPipelineFlow: PropTypes.func,
	addNodeTypeToPalette: PropTypes.func,
	setNodeLabel: PropTypes.func,
	setPortLabel: PropTypes.func
};
