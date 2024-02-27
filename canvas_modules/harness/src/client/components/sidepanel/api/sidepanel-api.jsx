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

/* eslint no-undef: "error" */
/* eslint complexity: ["error", 22] */

import React from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { Toggle, Button, Dropdown, TextArea, TextInput, RadioButtonGroup, RadioButton, FormGroup } from "@carbon/react";
import {
	API_SET_PIPELINEFLOW,
	API_ADD_PALETTE_ITEM,
	API_SET_NODE_LABEL,
	API_SET_INPUT_PORT_LABEL,
	API_SET_OUTPUT_PORT_LABEL,
	API_SET_NODE_DECORATIONS,
	API_SET_LINK_DECORATIONS,
	API_ADD_NOTIFICATION_MESSAGE,
	API_ZOOM_TO_REVEAL_NODE,
	API_ZOOM_TO_REVEAL_LINK,
	INPUT_PORT,
	OUTPUT_PORT,
	NOTIFICATION_MESSAGE_TYPE
} from "../../../constants/constants.js";

const defaultNodeType = {
	"id": "custop",
	"op": "customOp",
	"type": "binding",
	"app_data": {
		"ui_data": {
			"label": "Custom Node Type",
			"description": "Custom node type",
			"image": "/images/common_node_icons/models/model_cart_build.svg"
		}
	},
	"inputs": [
		{
			"id": "inPort",
			"app_data": {
				"ui_data": {
					"label": "Input Port",
					"cardinality": {
						"min": 0,
						"max": -1
					}
				}
			}
		}
	]
};

export default class SidePanelAPI extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			categoryId: "",
			categoryName: "",
			isValidPipelineFlow: true,
			isValidPaletteItem: true,
			nodeId: "",
			portId: "",
			linkId: "",
			newLabel: "",
			newDecorations: "",
			nodes: [],
			ports: [],
			links: [],
			appendTimestamp: false,
			attachCallback: false,
			appendLink: false,
			closeMessage: false,
			notificationTitle: "",
			notificationSubtitle: "",
			notificationMessage: "",
			notificationType: NOTIFICATION_MESSAGE_TYPE.INFO,
			zoomObject: JSON.stringify({ x: 0, y: 0, k: 1 }),
			pipelineFlow: JSON.stringify(this.props.apiConfig.getPipelineFlow()),
			paletteItem: JSON.stringify(defaultNodeType)
		};

		this.messageCounter = 0;

		this.createNotificationMessage = this.createNotificationMessage.bind(this);
		this.notificationMessageCallback = this.notificationMessageCallback.bind(this);
	}

	onOperationSelect(evt) {
		const operation = evt.selectedItem.value;
		let nodes = [];
		let ports = [];
		let links = [];
		let nodeId = "";
		let portId = "";
		let linkId = "";
		let newLabel = "";
		let newDecorations = "";
		let newZoomObj = "";

		if (operation === API_SET_NODE_LABEL) {
			// when selecting operation to set a node label, build list of nodes and select the first one by default
			nodes = this.getNodePortList(this.props.apiConfig.getCanvasInfo().nodes);
			if (!isEmpty(nodes)) {
				nodeId = nodes[0].value;
				newLabel = this.props.apiConfig.getCanvasInfo().nodes[0].label;
			}
		} else if (operation === API_SET_NODE_DECORATIONS) {
			// when selecting operation to set node decorations, build list of nodes and select the first one by default
			nodes = this.getNodePortList(this.props.apiConfig.getCanvasInfo().nodes);
			if (!isEmpty(nodes)) {
				nodeId = nodes[0].value;
				const decorations = this.props.apiConfig.getCanvasInfo().nodes[0].decorations;
				if (decorations) {
					newDecorations = JSON.stringify(decorations, null, 2);
				}
			}
		} else if (operation === API_SET_LINK_DECORATIONS) {
			// when selecting operation to set link decorations, build list of links and select the first one by default
			links = this.getLinkList(this.props.apiConfig.getCanvasInfo().links);
			if (!isEmpty(links)) {
				linkId = links[0].value;
				const decorations = this.props.apiConfig.getCanvasInfo().links[0].decorations || [];
				if (decorations) {
					newDecorations = JSON.stringify(decorations, null, 2);
				}
			}
		} else if (operation === API_SET_INPUT_PORT_LABEL || operation === API_SET_OUTPUT_PORT_LABEL) {
			// when selecting operation to set input or output port...
			const filteredNodeList = (operation === API_SET_INPUT_PORT_LABEL)
				? this.props.apiConfig.getCanvasInfo().nodes.filter((node) => !isEmpty(node.inputs))
				: this.props.apiConfig.getCanvasInfo().nodes.filter((node) => !isEmpty(node.outputs));
			// ... get list if nodes that have input or output ports...
			nodes = this.getNodePortList(filteredNodeList);
			if (!isEmpty(nodes)) {
				// ... select the first node by default
				nodeId = nodes[0].value;
				const filteredPortList = (operation === API_SET_INPUT_PORT_LABEL
					? filteredNodeList[0].inputs : filteredNodeList[0].outputs);
				// ... build the list of ports and select the first one by default
				if (!isEmpty(filteredPortList)) {
					ports = this.getNodePortList(filteredPortList);
					portId = ports[0].value;
					newLabel = ports[0].label;
				}
			}
		} else if (operation === API_ZOOM_TO_REVEAL_NODE) {
			nodes = this.getNodePortList(this.props.apiConfig.getCanvasInfo().nodes);
			if (!isEmpty(nodes)) {
				const zoomObj = this.props.apiConfig.getZoomToReveal(nodes[0].value, this.state.zoomXPos, this.state.zoomYPos);
				newZoomObj = zoomObj ? JSON.stringify(newZoomObj) : "";
			}
		} else if (operation === API_ZOOM_TO_REVEAL_LINK) {
			links = this.getLinkList(this.props.apiConfig.getCanvasInfo().links);
			if (!isEmpty(links)) {
				const zoomObj = this.props.apiConfig.getZoomToReveal(links[0].value, this.state.zoomXPos, this.state.zoomYPos);
				newZoomObj = zoomObj ? JSON.stringify(newZoomObj) : "";
			}
		}

		this.props.apiConfig.setApiSelectedOperation(operation);
		this.setState({
			selectedOperation: operation,
			nodeId: nodeId,	// id of selected node
			portId: portId, // id of selected port
			linkId: linkId, // id of selected link
			nodes: nodes, // list of nodes in format { value: label, id: nodeId }
			ports: ports, // list of input or output ports in format { value: label, id: portId }
			links: links, // list links in format { value: label, id: linkId }
			newLabel: newLabel,
			newDecorations: newDecorations,
			zoomObject: newZoomObj
		});
		this.props.log("Operation selected", operation);
	}

	onNodeSelect(evt) {
		const nodeItem = this.state.nodes.find((node) => node.label === evt.selectedItem.value);
		const nodeId = nodeItem.value;
		const newState = { nodeId: nodeId, portId: "", newLabel: "" };
		const existingNode = this.props.apiConfig.getCanvasInfo().nodes.find((node) => (node.id === nodeId));
		if (existingNode) {
			if (this.props.apiConfig.selectedOperation === API_SET_NODE_LABEL) {
				// when op to set node name is selected, set the current node name in text field
				newState.newLabel = existingNode.label;
			} else if (this.props.apiConfig.selectedOperation === API_SET_NODE_DECORATIONS) {
				// when op to set node decorations is selected, set the current node decorations in text field
				if (existingNode.decorations) {
					newState.newDecorations = JSON.stringify(existingNode.decorations, null, 2);
				} else {
					newState.newDecorations = "";
				}
			} else if (this.props.apiConfig.selectedOperation === API_SET_INPUT_PORT_LABEL) {
				// get list of input ports for the selected node and select the first one by default
				newState.ports = this.getNodePortList(existingNode.inputs);
				if (!isEmpty(newState.ports)) {
					newState.portId = newState.ports[0].value;
					const port = existingNode.inputs.find(function(port2) {
						return (port2.id === newState.ports[0].value);
					});
					newState.newLabel = port.label;
				}
			} else if (this.props.apiConfig.selectedOperation === API_SET_OUTPUT_PORT_LABEL) {
				// get list of output ports for the selected node and select the first one by default
				newState.ports = this.getNodePortList(existingNode.outputs);
				if (!isEmpty(newState.ports)) {
					newState.portId = newState.ports[0].value;
					const port = existingNode.outputs.find(function(port2) {
						return (port2.id === newState.ports[0].value);
					});
					newState.newLabel = port.label;
				}
			} else if (this.props.apiConfig.selectedOperation === API_ZOOM_TO_REVEAL_NODE) {
				// get list of output ports for the selected node and select the first one by default
				const zoomObj = this.props.apiConfig.getZoomToReveal(existingNode.id, this.state.zoomXPos, this.state.zoomYPos);
				newState.zoomObject = zoomObj ? JSON.stringify(zoomObj) : "";
			}
		}
		this.setState(newState);
		this.props.log("Node selected", nodeId);
	}

	onPortSelect(evt) {
		const portItem = this.state.ports.find((port) => port.label === evt.selectedItem.value);
		const portId = portItem.value;
		const newState = { portId: portId };
		const existingNode = this.props.apiConfig.getCanvasInfo().nodes.find((node) => (node.id === this.state.nodeId));
		if (existingNode) {
			const ports = (this.props.apiConfig.selectedOperation === API_SET_INPUT_PORT_LABEL
				? existingNode.inputs : existingNode.outputs);
			const existingPort = ports.find((port) => (port.id === portId));
			if (existingPort) {
				newState.newLabel = existingPort.label;
			}
		}
		this.setState(newState);
		this.props.log("Port selected", portId);
	}

	onLinkSelect(evt) {
		const linkItem = this.state.links.find((link) => link.label === evt.selectedItem.value);
		const linkId = linkItem.value;
		const newState = { linkId: linkId, portId: "", newLabel: "" };
		const existingLink = this.props.apiConfig.getCanvasInfo().links.find((link) => (link.id === linkId));
		if (existingLink) {
			if (this.props.apiConfig.selectedOperation === API_SET_LINK_DECORATIONS) {
				// when op to set link decorations is selected, set the current link decorations in text field
				if (existingLink.decorations) {
					newState.newDecorations = JSON.stringify(existingLink.decorations, null, 2);
				} else {
					newState.newDecorations = "[]";
				}

			} else if (this.props.apiConfig.selectedOperation === API_ZOOM_TO_REVEAL_LINK) {
				const zoomObj = this.props.apiConfig.getZoomToReveal(existingLink.id, this.state.zoomXPos, this.state.zoomYPos);
				newState.zoomObject = zoomObj ? JSON.stringify(zoomObj) : "";
			}
		}
		this.setState(newState);
		this.props.log("Link selected", linkId);
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
		case "zoomXPos": {
			stateObj.zoomXPos = evt.target.value;
			const objId = this.props.apiConfig.selectedOperation === API_ZOOM_TO_REVEAL_NODE
				? this.state.nodeId
				: this.state.linkId;
			const zoomObj = this.props.apiConfig.getZoomToReveal(objId, stateObj.zoomXPos, this.state.zoomYPos);
			stateObj.zoomObject = zoomObj ? JSON.stringify(zoomObj) : "";
			break;
		}
		case "zoomYPos": {
			stateObj.zoomYPos = evt.target.value;
			const objId = this.props.apiConfig.selectedOperation === API_ZOOM_TO_REVEAL_NODE
				? this.state.nodeId
				: this.state.linkId;
			const zoomObj = this.props.apiConfig.getZoomToReveal(objId, this.state.zoomXPos, stateObj.zoomYPos);
			stateObj.zoomObject = zoomObj ? JSON.stringify(zoomObj) : "";
			break;
		}
		default: {
			break;
		}
		}
		this.setState(stateObj);
	}

	onNotificationMessageTypeChange(value) {
		this.setState({ notificationType: value });
	}

	onAppendTimestampToggle(checked) {
		this.setState({ appendTimestamp: checked });
	}

	onAttachCallback(checked) {
		this.setState({ attachCallback: checked });
	}

	onAppendLinkToggle(checked) {
		this.setState({ appendLink: checked });
	}

	onCloseToggle(checked) {
		this.setState({ closeMessage: checked });
	}

	getNodePortList(items) {
		return items.map(function(item) {
			return ({ label: item.label, value: item.id });
		});
	}

	getLinkList(items) {
		const out = [];
		items.forEach((item) => {
			const srcNode = this.getNode(item.srcNodeId);
			const trgNode = this.getNode(item.trgNodeId);
			if (srcNode && trgNode) { // srcNode may be null for a comment link
				const srcLabel = this.getNode(item.srcNodeId).label;
				const trgLabel = this.getNode(item.trgNodeId).label;
				out.push({ label: srcLabel + "-" + trgLabel, value: item.id });
			}
		});
		return out;
	}

	getNode(nodeId) {
		return this.props.apiConfig.getCanvasInfo().nodes.find((n) => n.id === nodeId);
	}


	refreshPipeline() {
		this.setState({ pipelineFlow: JSON.stringify(this.props.apiConfig.getPipelineFlow()),
			isValidPipelineFlow: true });
	}

	isReadyToSubmit() {
		switch (this.props.apiConfig.selectedOperation) {
		case API_SET_PIPELINEFLOW: {
			return this.state.isValidPipelineFlow;
		}
		case API_ADD_PALETTE_ITEM:
			return (this.state.isValidPaletteItem && this.state.categoryId && this.state.categoryId.length > 0);
		case API_SET_NODE_LABEL:
			return (this.state.nodeId && this.state.newLabel.length > 0);
		case API_SET_NODE_DECORATIONS:
			return (this.state.nodeId && this.state.newDecorations.length > 0);
		case API_SET_INPUT_PORT_LABEL:
		case API_SET_OUTPUT_PORT_LABEL:
			return (this.state.nodeId && this.state.portId && this.state.newLabel.length > 0);
		case API_SET_LINK_DECORATIONS:
			return (this.state.linkId && this.state.newDecorations.length > 0);
		case API_ADD_NOTIFICATION_MESSAGE:
			return this.state.notificationMessage.length > 0;
		case API_ZOOM_TO_REVEAL_NODE:
		case API_ZOOM_TO_REVEAL_LINK:
			return this.state.zoomObject && this.state.zoomObject.length > 0;

		default:
			return false;
		}
	}

	callAPI() {
		switch (this.props.apiConfig.selectedOperation) {
		case API_SET_PIPELINEFLOW:
			this.props.apiConfig.setPipelineFlow(JSON.parse(this.state.pipelineFlow));
			break;
		case API_ADD_PALETTE_ITEM:
			this.props.apiConfig.addNodeTypeToPalette(
				JSON.parse(this.state.paletteItem),
				this.state.categoryId,
				this.state.categoryName);
			break;
		case API_SET_NODE_LABEL:
			this.props.apiConfig.setNodeLabel(
				this.state.nodeId,
				this.state.newLabel);
			this.setState({ nodes: this.getNodePortList(this.props.apiConfig.getCanvasInfo().nodes) });
			break;
		case API_SET_INPUT_PORT_LABEL: {
			this.props.apiConfig.setPortLabel(
				this.state.nodeId,
				this.state.portId,
				this.state.newLabel,
				INPUT_PORT
			);
			const existingNode =
				this.props.apiConfig.getCanvasInfo().nodes.find((node) => (node.id === this.state.nodeId));
			this.setState({ ports: this.getNodePortList(existingNode.inputs) });
			break;
		}
		case API_SET_OUTPUT_PORT_LABEL: {
			this.props.apiConfig.setPortLabel(
				this.state.nodeId,
				this.state.portId,
				this.state.newLabel,
				OUTPUT_PORT
			);
			const existingNode =
				this.props.apiConfig.getCanvasInfo().nodes.find((node) => (node.id === this.state.nodeId));
			this.setState({ ports: this.getNodePortList(existingNode.outputs) });
			break;
		}
		case API_SET_NODE_DECORATIONS: {
			this.props.apiConfig.setNodeDecorations(
				this.state.nodeId,
				this.state.newDecorations);
			this.setState({ nodes: this.getNodePortList(this.props.apiConfig.getCanvasInfo().nodes) });
			break;
		}
		case API_SET_LINK_DECORATIONS: {
			this.props.apiConfig.setLinkDecorations(
				this.state.linkId,
				this.state.newDecorations);
			this.setState({ links: this.getLinkList(this.props.apiConfig.getCanvasInfo().links) });
			break;
		}
		case API_ADD_NOTIFICATION_MESSAGE: {
			const message = this.createNotificationMessage();
			this.props.apiConfig.appendNotificationMessages(message);
			break;
		}
		case API_ZOOM_TO_REVEAL_NODE:
			this.props.apiConfig.zoomCanvasForObj(JSON.parse(this.state.zoomObject), this.state.nodeId);
			break;

		case API_ZOOM_TO_REVEAL_LINK:
			this.props.apiConfig.zoomCanvasForLink(JSON.parse(this.state.zoomObject), this.state.linkId);
			break;

		default:
		}
	}

	clearNotificationMessages(evt) {
		this.props.apiConfig.clearNotificationMessages();
	}

	createNotificationMessage() {
		let messageLink = <div />;

		if (this.state.appendLink) {
			messageLink = (<div>
				<a href="https://github.com/elyra-ai/canvas/wiki/2.0-Common-Canvas-Documentation" target="_blank">Visit Common Canvas Wiki!</a>
			</div>);
		}

		const messageContent = (<div>
			{this.state.notificationMessage}
			{messageLink}
		</div>);


		return [
			{
				id: "harness-message-" + this.messageCounter++,
				type: this.state.notificationType,
				title: this.state.notificationTitle ? this.state.notificationTitle : null,
				subtitle: this.state.notificationSubtitle ? this.state.notificationSubtitle : null,
				content: messageContent,
				timestamp: this.state.appendTimestamp ? new Date().toLocaleString("en-US") : null,
				callback: this.state.attachCallback ? this.notificationMessageCallback : null,
				closeMessage: this.state.closeMessage ? "Dismiss" : null
			}
		];
	}

	notificationMessageCallback(id) {
		this.props.log("Notification Message Callback", "Message " + id + " was clicked.");
	}

	dropdownOptions(inOptions) {
		const options = [];
		let key = 1;
		for (const option of inOptions) {
			if (typeof option === "string") {
				options.push({ key: "option." + ++key, label: option, value: option });
			} else {
				options.push({ key: "option." + ++key, label: option.label, value: option.label });
			}
		}
		return options;
	}

	render() {
		const divider = (<div className="harness-sidepanel-children harness-sidepanel-divider" />);
		const space = (<div className="harness-sidepanel-spacer" />);
		const dropdownOptions = this.dropdownOptions([
			API_SET_PIPELINEFLOW,
			API_ADD_PALETTE_ITEM,
			API_SET_NODE_LABEL,
			API_SET_INPUT_PORT_LABEL,
			API_SET_OUTPUT_PORT_LABEL,
			API_SET_NODE_DECORATIONS,
			API_SET_LINK_DECORATIONS,
			API_ADD_NOTIFICATION_MESSAGE,
			API_ZOOM_TO_REVEAL_NODE,
			API_ZOOM_TO_REVEAL_LINK
		]);
		const operationSelection =
			(<div className="harness-sidepanel-children" id="harness-sidepanel-api-list">
				<Dropdown
					id="harness-sidepanel-api-ops-dropdown"
					aria-label="Operations. Before selecting an operation, make sure you have selected Canvas Diagram from Common Canvas configuration options."
					label="Choose an operation..."
					onChange={this.onOperationSelect.bind(this)}
					items={dropdownOptions}
					titleText="Operations"
				/>
			</div>);

		const submit =
			(<div className="harness-sidepanel-children" id="harness-sidepanel-api-submit">
				<Button size="sm"
					disabled={!this.isReadyToSubmit()}
					onClick={this.callAPI.bind(this)}
				>
					Submit
				</Button>
			</div>);


		let setPipelineFlow = <div />;
		if (this.props.apiConfig.selectedOperation === API_SET_PIPELINEFLOW) {
			setPipelineFlow = (<div className="harness-sidepanel-children" id="harness-sidepanel-api-pipelineFlow">
				<TextArea
					id="harness-pipelineFlow"
					labelText="Pipeline Flow"
					rows={20}
					onChange={this.onFieldChange.bind(this, "pipelineFlow")}
					value={this.state.pipelineFlow}
				/>
				<Button size="sm"
					onClick={this.refreshPipeline.bind(this)}
				>
					Refresh
				</Button>
			</div>);
		}

		let addItemToPaletteSection = <div />;
		if (this.props.apiConfig.selectedOperation === API_ADD_PALETTE_ITEM) {
			addItemToPaletteSection = (<div className="harness-sidepanel-children">
				<div className="harness-sidepanel-spacer">
					<TextInput
						labelText="Category id"
						hideLabel
						id="harness-categoryId"
						placeholder="Category id"
						onChange={this.onFieldChange.bind(this, "categoryId")}
						value={this.state.categoryId}
					/>
				</div>
				<div className="harness-sidepanel-spacer">
					<TextInput
						id="harness-categoryName"
						placeholder="Category name"
						labelText="Category name"
						hideLabel
						onChange={this.onFieldChange.bind(this, "categoryName")}
						value={this.state.categoryName}
					/>
				</div>
				<div className="harness-sidepanel-spacer">
					<TextArea
						id="harness-paletteNodeItem"
						labelText="Palette Node Item"
						placeholder="Palette node item"
						rows={10}
						onChange={this.onFieldChange.bind(this, "paletteItem")}
						value={this.state.paletteItem}
					/>
				</div>
			</div>);
		}

		let setNodePortLabelSection = <div />;
		if (this.props.apiConfig.selectedOperation === API_SET_NODE_LABEL ||
				this.props.apiConfig.selectedOperation === API_SET_INPUT_PORT_LABEL ||
				this.props.apiConfig.selectedOperation === API_SET_OUTPUT_PORT_LABEL) {

			setNodePortLabelSection = (<div className="harness-sidepanel-children">
				<div id="harness-sidepanel-api-nodePortSelection">
					<Dropdown
						id="harness-sidepanel-api-npls-dropdown"
						disabled={isEmpty(this.state.nodes)}
						onChange={this.onNodeSelect.bind(this)}
						label="Node Selection"
						aria-label="Node Selection"
						titleText="Node Selection"
						items={this.dropdownOptions(this.state.nodes)}
					/>
				</div>
				<div className="harness-sidepanel-spacer" />
				<div id="harness-sidepanel-api-portSelection">
					<Dropdown
						id="harness-sidepanel-api-nps-dropdown"
						disabled={isEmpty(this.state.ports)}
						onChange={this.onPortSelect.bind(this)}
						aria-label="Port Selection"
						label="Port Selection"
						titleText="Port Selection"
						items={this.dropdownOptions(this.state.ports)}
					/>
				</div>
				<div className="harness-sidepanel-spacer" />
				<TextInput
					id="harness-newLabel"
					labelText={this.props.apiConfig.selectedOperation}
					hideLabel
					placeholder={this.props.apiConfig.selectedOperation}
					onChange={this.onFieldChange.bind(this, "newLabel")}
					value={this.state.newLabel}
					disabled={(this.props.apiConfig.selectedOperation === API_SET_NODE_LABEL && !this.state.nodeId) ||
					((this.props.apiConfig.selectedOperation === API_SET_INPUT_PORT_LABEL ||
						this.props.apiConfig.selectedOperation === API_SET_OUTPUT_PORT_LABEL) &&
						!this.state.portId)}
				/>
			</div>);
		}

		let setNodeDecorationsSection = <div />;
		if (this.props.apiConfig.selectedOperation === API_SET_NODE_DECORATIONS) {
			setNodeDecorationsSection = (<div className="harness-sidepanel-children"
				id="harness-sidepanel-api-decorations"
			>
				<div id="harness-sidepanel-api-nodeSelection">
					<Dropdown
						id="harness-sidepanel-api-ns-dropdown"
						disabled={isEmpty(this.state.nodes)}
						onChange={this.onNodeSelect.bind(this)}
						label="Node Selection"
						aria-label="Node Selection"
						titleText="Node Selection"
						items={this.dropdownOptions(this.state.nodes)}
					/>
				</div>
				<div className="harness-sidepanel-spacer" />
				<TextArea
					id="harness-decorations"
					labelText="Decorations JSON"
					rows={10}
					onChange={this.onFieldChange.bind(this, "newDecorations")}
					value={this.state.newDecorations}
				/>
			</div>);
		}

		let setLinkDecorationsSection = <div />;
		if (this.props.apiConfig.selectedOperation === API_SET_LINK_DECORATIONS) {
			setLinkDecorationsSection = (<div className="harness-sidepanel-children"
				id="harness-sidepanel-api-decorations"
			>
				<div id="harness-sidepanel-api-linkSelection">
					<Dropdown
						id="harness-sidepanel-api-ls-dropdown"
						disabled={isEmpty(this.state.links)}
						onChange={this.onLinkSelect.bind(this)}
						label="Link Selection"
						aria-label="Link Selection"
						titleText="Link Selection"
						items={this.dropdownOptions(this.state.links)}
					/>
				</div>
				<div className="harness-sidepanel-spacer" />
				<TextArea
					id="harness-link-decorations"
					labelText="Decorations JSON"
					rows={10}
					onChange={this.onFieldChange.bind(this, "newDecorations")}
					value={this.state.newDecorations}
				/>
			</div>);
		}

		let setNotificationMessages = <div />;
		if (this.props.apiConfig.selectedOperation === API_ADD_NOTIFICATION_MESSAGE) {
			setNotificationMessages = (<div className="harness-sidepanel-children"
				id="harness-sidepanel-api-notificationMessages"
			>
				<div className="harness-sidepanel-headers">Clear Notification Messages</div>
				<Button size="sm"
					id="harness-clearNotificationMessagesubmit"
					onClick={this.clearNotificationMessages.bind(this)}
				>
					Clear Messages
				</Button>
				{divider}
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-nm-types">
					<FormGroup
						legendText="Message Type"
					>
						<RadioButtonGroup
							className="harness-sidepanel-radio-group"
							name="notification_message_type"
							onChange={this.onNotificationMessageTypeChange.bind(this)}
							defaultSelected={NOTIFICATION_MESSAGE_TYPE.INFO}
						>
							<RadioButton
								value={NOTIFICATION_MESSAGE_TYPE.INFO}
								labelText={NOTIFICATION_MESSAGE_TYPE.INFO}
							/>
							<RadioButton
								value={NOTIFICATION_MESSAGE_TYPE.SUCCESS}
								labelText={NOTIFICATION_MESSAGE_TYPE.SUCCESS}
							/>
							<RadioButton
								value={NOTIFICATION_MESSAGE_TYPE.WARNING}
								labelText={NOTIFICATION_MESSAGE_TYPE.WARNING}
							/>
							<RadioButton
								value={NOTIFICATION_MESSAGE_TYPE.ERROR}
								labelText={NOTIFICATION_MESSAGE_TYPE.ERROR}
							/>
						</RadioButtonGroup>
					</FormGroup>
				</div>
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-nm-title">
					<TextInput
						id="harness-messageTitle"
						labelText="Message Title"
						hideLabel
						placeholder="Message Title"
						onChange={this.onFieldChange.bind(this, "notificationTitle")}
						value={this.state.notificationTitle}
					/>
				</div>
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-nm-subtitle">
					<TextInput
						id="harness-messageSubtitle"
						labelText="Message Subtitle (Optional)"
						hideLabel
						placeholder="Message Subtitle (Optional)"
						onChange={this.onFieldChange.bind(this, "notificationSubtitle")}
						value={this.state.notificationSubtitle}
					/>
				</div>
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-nm-content">
					<TextArea
						id="harness-notification-message-content"
						labelText="Message Content"
						rows={4}
						placeholder="Message"
						onChange={this.onFieldChange.bind(this, "notificationMessage")}
						value={this.state.notificationMessage}
					/>
				</div>
				<div>
					<Toggle
						id="harness-sidepanel-api-notification-timestamp"
						className="harness-sidepanel-spacer harness-sidepanel-headers"
						labelText="Add Timestamp to Message"
						toggled={this.state.appendTimestamp}
						onToggle={this.onAppendTimestampToggle.bind(this)}
					/>
				</div>
				<div>
					<Toggle
						id="harness-sidepanel-api-notification-callback"
						className="harness-sidepanel-headers"
						labelText="Add Callback to Message for logging the message in the test harness console"
						toggled={this.state.attachCallback}
						onToggle={this.onAttachCallback.bind(this)}
					/>
				</div>
				<div>
					<Toggle
						id="harness-sidepanel-api-notification-link"
						className="harness-sidepanel-spacer harness-sidepanel-headers"
						labelText="Add Link to Wiki"
						toggled={this.state.appendLink}
						onToggle={this.onAppendLinkToggle.bind(this)}
					/>
				</div>
				<div>
					<Toggle
						id="harness-sidepanel-api-notification-dismiss"
						className="harness-sidepanel-headers"
						labelText="Add dismiss link to message"
						toggled={this.state.closeMessage}
						onToggle={this.onCloseToggle.bind(this)}
					/>
				</div>
			</div>);
		}

		let zoomCanvas = <div />;
		if (this.props.apiConfig.selectedOperation === API_ZOOM_TO_REVEAL_NODE ||
				this.props.apiConfig.selectedOperation === API_ZOOM_TO_REVEAL_LINK) {

			let objects = this.state.nodes;
			let onChange = this.onNodeSelect.bind(this);
			let label = "Node Selection";

			if (this.props.apiConfig.selectedOperation === API_ZOOM_TO_REVEAL_LINK) {
				objects = this.state.links;
				onChange = this.onLinkSelect.bind(this);
				label = "Link Selection";
			}

			zoomCanvas = (<div className="harness-sidepanel-children"
				id="harness-sidepanel-api-zoomCanvas"
			>
				<div id="harness-sidepanel-api-selection">
					<Dropdown
						id="harness-sidepanel-api-zoom-dropdown"
						disabled={isEmpty(objects)}
						onChange={onChange}
						label={label}
						aria-label={label}
						titleText={label}
						items={this.dropdownOptions(objects)}
					/>
				</div>
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-zoom-spacer1" />
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-zoom-spacer2" />
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-zoom-x-content">
					<TextArea
						id="harness-zoom-canvas-x-position"
						labelText="X position"
						rows={1}
						placeholder="X percent offset"
						onChange={this.onFieldChange.bind(this, "zoomXPos")}
						value={this.state.zoomXPos}
					/>
				</div>
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-zoom-spacer3" />
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-zoom-spacer4" />
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-zoom-y-content">
					<TextArea
						id="harness-zoom-canvas-y-position"
						labelText="Y position"
						rows={1}
						placeholder="Y percent offset"
						onChange={this.onFieldChange.bind(this, "zoomYPos")}
						value={this.state.zoomYPos}
					/>
				</div>
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-zoom-spacer5" />
				<div className="harness-sidepanel-spacer" id="harness-sidepanel-api-zoom-spacer6" />
				<TextArea
					id="harness-zoom-canvas-object"
					labelText="Zoom Object"
					rows={4}
					onChange={this.onFieldChange.bind(this, "zoomObject")}
					value={this.state.zoomObject}
				/>
			</div>);
		}

		return (
			<div>
				{space}
				{operationSelection}
				{space}
				{setPipelineFlow}
				{addItemToPaletteSection}
				{setNodePortLabelSection}
				{setNodeDecorationsSection}
				{setLinkDecorationsSection}
				{setNotificationMessages}
				{zoomCanvas}
				{space}
				{submit}
			</div>
		);
	}
}

SidePanelAPI.propTypes = {
	log: PropTypes.func,
	apiConfig: PropTypes.shape({
		getCanvasInfo: PropTypes.func,
		selectedOperation: PropTypes.string,
		setApiSelectedOperation: PropTypes.func,
		getPipelineFlow: PropTypes.func,
		setPipelineFlow: PropTypes.func,
		addNodeTypeToPalette: PropTypes.func,
		setNodeLabel: PropTypes.func,
		setPortLabel: PropTypes.func,
		setNodeDecorations: PropTypes.func,
		setLinkDecorations: PropTypes.func,
		appendNotificationMessages: PropTypes.func,
		clearNotificationMessages: PropTypes.func,
		getZoomToReveal: PropTypes.func,
		zoomCanvasForObj: PropTypes.func,
		zoomCanvasForLink: PropTypes.func
	})
};
