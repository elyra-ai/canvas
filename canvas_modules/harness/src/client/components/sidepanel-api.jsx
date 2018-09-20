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
import Button from "carbon-components-react/lib/components/Button";
import Dropdown from "carbon-components-react/lib/components/Dropdown";
import DropdownItem from "carbon-components-react/lib/components/DropdownItem";
import TextArea from "carbon-components-react/lib/components/TextArea";
import TextInput from "carbon-components-react/lib/components/TextInput";
import RadioButtonGroup from "carbon-components-react/lib/components/RadioButtonGroup";
import RadioButton from "carbon-components-react/lib/components/RadioButton";
import Toggle from "carbon-components-react/lib/components/Toggle";
import {
	API_SET_PIPELINEFLOW,
	API_ADD_PALETTE_ITEM,
	API_SET_NODE_LABEL,
	API_SET_INPUT_PORT_LABEL,
	API_SET_OUTPUT_PORT_LABEL,
	API_SET_NODE_DECORATIONS,
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
			newDecorations: "",
			nodes: [],
			ports: [],
			appendTimestamp: false,
			attachCallback: false,
			appendLink: false,
			notificationTitle: "",
			notificationMessage: "",
			notificationType: NOTIFICATION_MESSAGE_TYPE.INFO
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

	onOperationSelect(evt) {
		const operation = evt.value;
		let nodes = [];
		let ports = [];
		let nodeId = "";
		let portId = "";
		let newLabel = "";
		let newDecorations = "";

		if (operation === API_SET_NODE_LABEL) {
			// when selecting operation to set a node label, build list of nodes and select the first one by default
			nodes = this.getNodePortList(this.props.getCanvasInfo().nodes);
			if (!isEmpty(nodes)) {
				nodeId = nodes[0].value;
				newLabel = this.props.getCanvasInfo().nodes[0].label;
			}
		} else if (operation === API_SET_NODE_DECORATIONS) {
			// when selecting operation to set node decorations, build list of nodes and select the first one by default
			nodes = this.getNodePortList(this.props.getCanvasInfo().nodes);
			if (!isEmpty(nodes)) {
				nodeId = nodes[0].value;
				const decorations = this.props.getCanvasInfo().nodes[0].decorations;
				if (decorations) {
					newDecorations = JSON.stringify(decorations, null, 2);
				}
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
			selectedOperation: operation,
			nodeId: nodeId,	// id of selected node
			portId: portId, // id of selected port
			nodes: nodes, // list of nodes in format { value: label, id: nodeId }
			ports: ports, // list of input or output ports in format { value: label, id: portId }
			newLabel: newLabel,
			newDecorations: newDecorations });
		this.props.log("Operation selected", operation);
	}

	onNodeSelect(evt) {
		const nodeItem = this.state.nodes.find((node) => node.label === evt.value);
		const nodeId = nodeItem.value;
		const newState = { nodeId: nodeId, portId: "", newLabel: "" };
		const existingNode = this.props.getCanvasInfo().nodes.find((node) => (node.id === nodeId));
		if (existingNode) {
			if (this.props.selectedOperation === API_SET_NODE_LABEL) {
				// when op to set node name is selected, set the current node name in text field
				newState.newLabel = existingNode.label;
			} else if (this.props.selectedOperation === API_SET_NODE_DECORATIONS) {
				// when op to set node decorations is selected, set the current node name in text field
				if (existingNode.decorations) {
					newState.newDecorations = JSON.stringify(existingNode.decorations, null, 2);
				} else {
					newState.newDecorations = "";
				}
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

	onPortSelect(evt) {
		const portItem = this.state.ports.find((port) => port.label === evt.value);
		const portId = portItem.value;
		const newState = { portId: portId };
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
		case API_SET_NODE_DECORATIONS:
			return (this.state.nodeId && this.state.newDecorations.length > 0);
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
		case API_SET_NODE_DECORATIONS:
			this.props.setNodeDecorations(
				this.state.nodeId,
				this.state.newDecorations);
			this.setState({ nodes: this.getNodePortList(this.props.getCanvasInfo().nodes) });
			break;
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

	dropdownOptions(inOptions) {
		const options = [];
		let key = 1;
		for (const option of inOptions) {
			if (typeof option === "string") {
				options.push(<DropdownItem key={"option." + ++key}itemText={option} value={option} />);
			} else {
				options.push(<DropdownItem key={"option." + ++key}itemText={option.label} value={option.label} />);
			}

		}
		return options;
	}

	render() {
		const divider = (<div className="sidepanel-children sidepanel-divider" />);
		const space = (<div className="sidepanel-spacer" />);
		const dropdownOptions = this.dropdownOptions([
			API_SET_PIPELINEFLOW,
			API_ADD_PALETTE_ITEM,
			API_SET_NODE_LABEL,
			API_SET_INPUT_PORT_LABEL,
			API_SET_OUTPUT_PORT_LABEL,
			API_SET_NODE_DECORATIONS,
			API_ADD_NOTIFICATION_MESSAGE]);
		const operationSelection =
			(<div className="sidepanel-children" id="sidepanel-api-list">
				<Dropdown
					defaultText="Operations"
					ariaLabel="Operations"
					onChange={this.onOperationSelect.bind(this)}
					value={this.props.selectedOperation}
				>
					{dropdownOptions}
				</Dropdown>
			</div>);

		const submit =
			(<div className="sidepanel-children" id="sidepanel-api-submit">
				<Button
					disabled={!this.isReadyToSubmit()}
					onClick={this.callAPI.bind(this)}
				>
					Submit
				</Button>
			</div>);


		let setPipelineFlow = <div />;
		if (this.props.selectedOperation === API_SET_PIPELINEFLOW) {
			setPipelineFlow = (<div className="sidepanel-children" id="sidepanel-api-pipelineFlow">
				<TextArea
					labelText="Pipeline Flow"
					rows={20}
					onChange={this.onFieldChange.bind(this, "pipelineFlow")}
					value={this.state.pipelineFlow}
				/>
				<Button small
					onClick={this.refreshPipeline.bind(this)}
				>
					Refresh
				</Button>
			</div>);
		}

		let addItemToPaletteSection = <div />;
		if (this.props.selectedOperation === API_ADD_PALETTE_ITEM) {
			addItemToPaletteSection = (<div className="sidepanel-children">
				<TextInput
					labelText="Category id"
					hideLabel
					id="categoryId"
					placeholder="Category id"
					onChange={this.onFieldChange.bind(this, "categoryId")}
					value={this.state.categoryId}
				/>
				<TextInput
					id="categoryName"
					placeholder="Category name"
					labelText="Category name"
					hideLabel
					onChange={this.onFieldChange.bind(this, "categoryName")}
					value={this.state.categoryName}
				/>
				<TextArea
					labelText="Palette Node Item"
					placeholder="Palette node item"
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

			setNodePortLabelSection = (<div className="sidepanel-children" id="sidepanel-api-portlabel">
				<div id="sidepanel-api-nodeSelection">
					<Dropdown
						disabled={isEmpty(this.state.nodes)}
						onChange={this.onNodeSelect.bind(this)}
						value={this.state.nodeId}
						defaultText="Node Selection"
						ariaLabel="Node Selection"
					>
						{this.dropdownOptions(this.state.nodes)}
					</Dropdown>
				</div>
				<div className="sidepanel-spacer" />
				<div id="sidepanel-api-portSelection">
					<Dropdown
						disabled={isEmpty(this.state.ports)}
						onChange={this.onPortSelect.bind(this)}
						value={this.state.portId}
						ariaLabel="Port Selection"
						defaultText="Port Selection"
					>
						{this.dropdownOptions(this.state.ports)}
					</Dropdown>
				</div>
				<div className="sidepanel-spacer" />
				<TextInput
					id="newLabel"
					labelText="Label"
					hideLabel
					placeholder="Label"
					onChange={this.onFieldChange.bind(this, "newLabel")}
					value={this.state.newLabel}
					disabled={(this.props.selectedOperation === API_SET_NODE_LABEL && !this.state.nodeId) ||
					((this.props.selectedOperation === API_SET_INPUT_PORT_LABEL ||
						this.props.selectedOperation === API_SET_OUTPUT_PORT_LABEL) &&
						!this.state.portId)}
				/>
			</div>);
		}

		let setNodeDecorationsSection = <div />;
		if (this.props.selectedOperation === API_SET_NODE_DECORATIONS) {

			setNodeDecorationsSection = (<div className="sidepanel-children" id="sidepanel-api-decorations">
				<div id="sidepanel-api-nodeSelection">
					<Dropdown
						disabled={isEmpty(this.state.nodes)}
						onChange={this.onNodeSelect.bind(this)}
						value={this.state.nodeId}
						defaultText="Node Selection"
						ariaLabel="Node Selection"
					>
						{this.dropdownOptions(this.state.nodes)}
					</Dropdown>
				</div>
				<div className="sidepanel-spacer" />
				<TextArea
					labelText="Decorations JSON"
					rows={10}
					onChange={this.onFieldChange.bind(this, "newDecorations")}
					value={this.state.newDecorations}
				/>
			</div>);
		}

		let setNotificationMessages = <div />;
		if (this.props.selectedOperation === API_ADD_NOTIFICATION_MESSAGE) {
			setNotificationMessages = (<div className="sidepanel-children" id="sidepanel-api-notificationMessages">
				<div className="sidepanel-headers">Clear Notification Messages</div>
				<div className="sidepanel-api-clear-notification-message-submit">
					<Button small
						id="clearNotificationMessagesubmit"
						onClick={this.clearNotificationMessages.bind(this)}
					>
						Clear Messages
					</Button>
				</div>
				{divider}
				<div className="sidepanel-headers">Message Type</div>
				<div id="sidepanel-api-nm-types">
					<RadioButtonGroup
						className="sidepanel-radio-group"
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
				</div>
				<div id="sidepanel-api-nm-title">
					<TextInput
						id="messageTitle"
						labelText="Message Title"
						hideLabel
						placeholder="Message Title"
						onChange={this.onFieldChange.bind(this, "notificationTitle")}
						value={this.state.notificationTitle}
					/>
				</div>
				<div id="sidepanel-api-nm-content">
					<TextArea
						labelText="Message Content"
						rows={4}
						placeholder="Message"
						onChange={this.onFieldChange.bind(this, "notificationMessage")}
						value={this.state.notificationMessage}
					/>
				</div>
				<div id="sidepanel-api-nm-timestamp">
					<div className="sidepanel-headers">Add Timestamp to Message</div>
					<Toggle
						id="sidepanel-api-notification-timestamp"
						toggled={this.state.appendTimestamp}
						onToggle={this.onAppendTimestampToggle.bind(this)}
					/></div>
				<div id="sidepanel-api-nm-callback">
					<div className="sidepanel-headers">
					Add Callback to Message for logging the message in the test harness console
					</div>
					<Toggle
						id="sidepanel-api-notification-callback"
						toggled={this.state.attachCallback}
						onToggle={this.onAttachCallback.bind(this)}
					/>
				</div>
				<div id="sidepanel-api-nm-link">
					<div className="sidepanel-headers">Add Link to Wiki</div>
					<Toggle
						id="sidepanel-api-notification-link"
						toggled={this.state.appendLink}
						onToggle={this.onAppendLinkToggle.bind(this)}
					/>
				</div>
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
				{setNotificationMessages}
				{space}
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
	setNodeDecorations: PropTypes.func,
	appendNotificationMessages: PropTypes.func,
	clearNotificationMessages: PropTypes.func
};
