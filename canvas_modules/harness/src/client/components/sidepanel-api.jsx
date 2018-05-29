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
import RadioGroup from "ap-components-react/dist/components/RadioGroup";
import ToggleButton from "ap-components-react/dist/components/ToggleButton";
import {
	API_SET_PIPELINEFLOW,
	API_ADD_PALETTE_ITEM,
	API_SET_NODE_LABEL,
	API_SET_INPUT_PORT_LABEL,
	API_SET_OUTPUT_PORT_LABEL,
	API_ADD_NOTIFICATION_MESSAGE,
	INPUT_PORT,
	OUTPUT_PORT,
	NOTIFICATION_MESSAGE_TYPE
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
			pipelineFlow: "",
			categoryId: "",
			categoryName: "",
			paletteItem: "",
			isValidPipelineFlow: true,
			isValidPaletteItem: true,
			nodeId: "",
			portId: "",
			newLabel: "",
			nodes: [],
			ports: [],
			appendTimestamp: false,
			attachCallback: false,
			appendLink: false,
			notificationTitle: "",
			notificationMessage: "",
			notificationType: NOTIFICATION_MESSAGE_TYPE.INFORMATIONAL
		};

		this.messageCounter = 0;

		this.createNotificationMessage = this.createNotificationMessage.bind(this);
		this.notificationMessageCallback = this.notificationMessageCallback.bind(this);
	}

	componentWillMount() {
		this.setState({
			pipelineFlow: JSON.stringify(this.props.getPipelineFlow()),
			paletteItem: JSON.stringify(defaultNodeType) });
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

		this.props.setApiSelectedOperation(operation);

		this.setState({
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
			if (this.props.selectedOperation === API_SET_NODE_LABEL) {
				// when op to set node name is selected, set the current node name in text field
				newState.newLabel = existingNode.label;
			} else if (this.props.selectedOperation === API_SET_INPUT_PORT_LABEL) {
				// get list of input ports for the selected node and select the first one by default
				newState.ports = this.getNodePortList(existingNode.input_ports);
				if (!isEmpty(newState.ports)) {
					newState.portId = newState.ports[0].value;
					const port = existingNode.input_ports.find(function(port2) {
						return (port2.id === newState.ports[0].value);
					});
					newState.newLabel = port.label;
				}
			} else if (this.props.selectedOperation === API_SET_OUTPUT_PORT_LABEL) {
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
			const ports = (this.props.selectedOperation === API_SET_INPUT_PORT_LABEL
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

	onNotificationMessageTypeChange(evt, obj) {
		this.setState({ notificationType: obj.selected });
	}

	onAppendTimestampToggle(changeEvent) {
		this.setState({ appendTimestamp: changeEvent.target.checked });
	}

	onAttachCallback(changeEvent) {
		this.setState({ attachCallback: changeEvent.target.checked });
	}

	onAppendLinkToggle(changeEvent) {
		this.setState({ appendLink: changeEvent.target.checked });
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
		switch (this.props.selectedOperation) {
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
		case API_ADD_NOTIFICATION_MESSAGE:
			return this.state.notificationMessage.length > 0;
		default:
			return false;
		}
	}

	callAPI() {
		switch (this.props.selectedOperation) {
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
		case API_ADD_NOTIFICATION_MESSAGE: {
			const message = this.createNotificationMessage();
			this.props.appendNotificationMessages(message);
			break;
		}
		default:
		}
	}

	clearNotificationMessages(evt) {
		this.props.clearNotificationMessages();
	}

	createNotificationMessage() {
		let messageLink = <div />;

		if (this.state.appendLink) {
			messageLink = (<div>
				<a href="https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/wiki/2.1-Config-Objects" target="_blank">Visit Canvas Wiki!</a>
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
				content: messageContent,
				timestamp: this.state.appendTimestamp ? new Date().toLocaleString("en-US") : null,
				callback: this.state.attachCallback ? this.notificationMessageCallback : null
			}
		];
	}

	notificationMessageCallback(id) {
		this.props.log("Notification Message Callback", "Message " + id + " was clicked.");
	}

	render() {
		const divider = (<div className="sidepanel-children sidepanel-divider" />);
		const space = (<div className="sidepanel-spacer" />);

		const operationSelection =
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
						API_SET_OUTPUT_PORT_LABEL,
						API_ADD_NOTIFICATION_MESSAGE]}
					onSelect={this.onOperationSelect.bind(this)}
					value={this.props.selectedOperation}
				/>
			</div>);

		const submit =
			(<div className="sidepanel-children" id="sidepanel-api-submit">
				<Button dark
					id="canvasFileSubmit"
					disabled={!this.isReadyToSubmit()}
					onClick={this.callAPI.bind(this)}
				>
					Submit
				</Button>
			</div>);


		let setPipelineFlow = <div />;
		if (this.props.selectedOperation === API_SET_PIPELINEFLOW) {
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

		let addItemToPaletteSection = <div />;
		if (this.props.selectedOperation === API_ADD_PALETTE_ITEM) {
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

		let setNodePortLabelSection = <div />;
		if (this.props.selectedOperation === API_SET_NODE_LABEL ||
				this.props.selectedOperation === API_SET_INPUT_PORT_LABEL ||
				this.props.selectedOperation === API_SET_OUTPUT_PORT_LABEL) {

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
				{(this.props.selectedOperation === API_SET_INPUT_PORT_LABEL ||
					this.props.selectedOperation === API_SET_OUTPUT_PORT_LABEL) &&
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
					disabled={(this.props.selectedOperation === API_SET_NODE_LABEL && !this.state.nodeId) ||
					((this.props.selectedOperation === API_SET_INPUT_PORT_LABEL ||
						this.props.selectedOperation === API_SET_OUTPUT_PORT_LABEL) &&
						!this.state.portId)}
				/>
			</div>);
		}

		let setNotificationMessages = <div />;
		if (this.props.selectedOperation === API_ADD_NOTIFICATION_MESSAGE) {
			setNotificationMessages = (<div className="sidepanel-children" id="sidepanel-api-notificationMessages">
				<div className="sidepanel-headers">Clear Notification Messages</div>
				<div className="sidepanel-api-clear-notification-message-submit">
					<Button dark
						id="clearNotificationMessagesubmit"
						onClick={this.clearNotificationMessages.bind(this)}
					>
						Clear Messages
					</Button>
				</div>
				{divider}
				<div className="sidepanel-headers">Message Type</div>
				<div className="sidepanel-api-notification-message-types">
					<RadioGroup
						name="notification_message_type"
						id="notification_message_type"
						dark
						onChange={this.onNotificationMessageTypeChange.bind(this)}
						choices={[
							NOTIFICATION_MESSAGE_TYPE.INFORMATIONAL,
							NOTIFICATION_MESSAGE_TYPE.SUCCESS,
							NOTIFICATION_MESSAGE_TYPE.WARNING,
							NOTIFICATION_MESSAGE_TYPE.ERROR
						]}
						selected={NOTIFICATION_MESSAGE_TYPE.INFORMATIONAL}
					/>
				</div>
				<TextField dark
					id="messageTitle"
					placeholder="Message Title"
					type="text"
					onChange={this.onFieldChange.bind(this, "notificationTitle")}
					value={this.state.notificationTitle}
				/>
				<div className="sidepanel-headers">Message Content</div>
				<TextField dark
					id="messageContent"
					type="textarea"
					rows={4}
					placeholder="Message"
					onChange={this.onFieldChange.bind(this, "notificationMessage")}
					value={this.state.notificationMessage}
				/>
				<div className="sidepanel-headers">Add Timestamp to Message</div>
				<ToggleButton dark
					id="sidepanel-api-notification-timestamp"
					checked={this.state.appendTimestamp}
					onChange={this.onAppendTimestampToggle.bind(this)}
				/>
				<div className="sidepanel-headers">
					Add Callback to Message for logging the message in the test harness console
				</div>
				<ToggleButton dark
					id="sidepanel-api-notification-callback"
					checked={this.state.attachCallback}
					onChange={this.onAttachCallback.bind(this)}
				/>
				<div className="sidepanel-headers">Add Link to Wiki</div>
				<ToggleButton dark
					id="sidepanel-api-notification-link"
					checked={this.state.appendLink}
					onChange={this.onAppendLinkToggle.bind(this)}
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
				{setNotificationMessages}
				{divider}
				{submit}
			</div>
		);
	}
}

SidePanelAPI.propTypes = {
	log: PropTypes.func,
	getCanvasInfo: PropTypes.func,
	setApiSelectedOperation: PropTypes.func,
	selectedOperation: PropTypes.string,
	getPipelineFlow: PropTypes.func,
	setPipelineFlow: PropTypes.func,
	addNodeTypeToPalette: PropTypes.func,
	setNodeLabel: PropTypes.func,
	setPortLabel: PropTypes.func,
	appendNotificationMessages: PropTypes.func,
	clearNotificationMessages: PropTypes.func
};
