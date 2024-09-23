/*
* Copyright 2023 Elyra Authors
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

import React from "react";
import PropTypes from "prop-types";

import { get } from "lodash";
import { ChevronUp, ChevronDown, Draggable, DragVertical } from "@carbon/react/icons";

import LinkInputToOutputAction from "./linkInputToOutputAction.js";

// The top-most y coordinate for the containers
const TOP_Y = 180;

// The gap between the containers
const CONTAINER_GAP = 48;

// Defaut node height and width - must be the same as values in enableNodeLayout
const DEFAUT_NODE_WIDTH = 400;
const DEFAUT_NODE_HEIGHT = 30;

// Amount in pixels to move the ports over the nodes
const PORT_POS_INDENT = 8;


class MappingContainerNode extends React.Component {
	constructor(props) {
		super(props);

		this.onScroll = this.onScroll.bind(this);
		this.onMouseEnterOnContainer = this.onMouseEnterOnContainer.bind(this);
		this.onMouseDownOnContainer = this.onMouseDownOnContainer.bind(this);
		this.onMouseDownOnHeaderChevron = this.onMouseDownOnHeaderChevron.bind(this);
		this.onMouseDownOnResizeIcon = this.onMouseDownOnResizeIcon.bind(this);
		this.onMouseDownOnDragContainerIcon = this.onMouseDownOnDragContainerIcon.bind(this);
		this.onMouseMoveOnDragContainerIcon = this.onMouseMoveOnDragContainerIcon.bind(this);
		this.onMouseUpOnDragContainerIcon = this.onMouseUpOnDragContainerIcon.bind(this);
		this.adjustContainerPositions = this.adjustContainerPositions.bind(this);
		this.onMouseDownOnFieldIcon = this.onMouseDownOnFieldIcon.bind(this);
		this.onDragStartOnFieldIcon = this.onDragStartOnFieldIcon.bind(this);
		this.onFieldMoveDragStart = this.onFieldMoveDragStart.bind(this);
		this.onFieldDrop = this.onFieldDrop.bind(this);
		this.onMouseDownOnContainerDataIcon = this.onMouseDownOnContainerDataIcon.bind(this);
		this.onDragStartOnContainerDataIcon = this.onDragStartOnContainerDataIcon.bind(this);
		this.setContainerPortPositions = this.setContainerPortPositions.bind(this);
		this.getFieldElementId = this.getFieldElementId.bind(this);
		this.resizeNode = this.resizeNode.bind(this);
		this.resizeNodeEnd = this.resizeNodeEnd.bind(this);
	}

	componentDidMount() {
		window.console.log("TableNode - componentDidMount");
		setTimeout(this.setContainerPortPositions, 500);
	}

	componentDidUpdate() {
		window.console.log("TableNode - componentDidUpdate");
		this.setContainerPortPositions();
	}

	onMouseDownOnHeaderChevron(evt) {
		window.console.log("TableNode - onMouseDownOnHeaderChevron");

		let newNodesProps = null;

		if (this.isContainerResized()) {
			const xInc = DEFAUT_NODE_WIDTH - this.props.nodeData.width;
			const yInc = DEFAUT_NODE_HEIGHT - this.props.nodeData.height;
			newNodesProps = this.adjustContainerPositions(xInc, yInc);

		} else {
			const xInc = this.savedResizeWidth - DEFAUT_NODE_WIDTH;
			const yInc = this.savedResizeHeight - DEFAUT_NODE_HEIGHT;
			newNodesProps = this.adjustContainerPositions(xInc, yInc);
		}

		const nodeSizingObjectsInfo = {};

		this.props.externalUtils.getActiveNodes().forEach((n) => {
			const newNodeProp = newNodesProps.find((np) => np.id === n.id);
			if (newNodeProp) {
				const nodeSizingObj = {
					id: n.id,
					height: newNodeProp.height ? newNodeProp.height : n.height,
					width: newNodeProp.width ? newNodeProp.width : n.width,
					x_pos: newNodeProp.x_pos ? newNodeProp.x_pos : n.x_pos,
					y_pos: newNodeProp.y_pos ? newNodeProp.y_pos : n.y_pos
				};

				if (n.id === this.props.nodeData.id) {
					if (this.isContainerResized()) {
						nodeSizingObj.isResized = false;
						this.savedResizeWidth = n.width;
						this.savedResizeHeight = n.height;
					} else {
						nodeSizingObj.isResized = true;
						nodeSizingObj.resizeWidth = this.savedResizeWidth;
						nodeSizingObj.resizeHeight = this.savedResizeHeight;
					}
				} else {
					nodeSizingObj.isResized = n.isResized;
					nodeSizingObj.resizeWidth = n.resizeWidth;
					nodeSizingObj.resizeHeight = n.resizeHeight;
				}

				nodeSizingObjectsInfo[n.id] = nodeSizingObj;
			}
		});


		this.saveNodePositions(nodeSizingObjectsInfo);
	}

	onScroll(evt) {
		window.console.log("onScroll");
		// Must stop propogation of scroll gesture to the zoom behavior of
		// common-canvas otherwise scroll doesn't work.
		evt.stopPropagation();

		this.setContainerPortPositions();
	}

	onMouseDownOnContainerDataIcon(evt) {
		window.console.log("onMouseDownOnContainerDataIcon");
		evt.stopPropagation();

		// Create the image here in mouse down, before onDrag occurs to give
		// a chance for it to be created.
		this.dragImgage = document.createElement("img");
		this.dragImgage.src = "/images/custom-canvases/react-nodes-mapping/stacked-move.svg";
	}


	onDragStartOnContainerDataIcon(evt) {
		window.console.log("onDragStartOnContainerDataIcon");
		evt.stopPropagation();

		evt.dataTransfer.clearData();
		const data = JSON.stringify({
			srcNodeId: this.props.nodeData.id,
			srcFields: this.props.nodeData.app_data.table_data.fields
		});
		evt.dataTransfer.setData("text/plain", data);
		// TODO Setting drag image this way only seems to work on Chrome - fix for FF and Safari.
		if (navigator.userAgent.includes("Chrome")) {
			evt.dataTransfer.setDragImage(this.dragImgage, 15, 15);
		}
	}

	// Called when the field is moved up and down in an output link.
	onFieldMoveDragStart(evt, col) {
		//
	}

	onMouseDownOnFieldIcon(evt) {
		window.console.log("onMouseDownOnFieldIcon");
		evt.stopPropagation();

		// Create the image here in mouse down, before onDrag occurs to give
		// a chance for it to be created.
		this.dragImgage = document.createElement("img");
		this.dragImgage.src = "/images/custom-canvases/react-nodes-mapping/link.svg";
	}

	onDragStartOnFieldIcon(evt, field) {
		evt.dataTransfer.clearData();
		const data = JSON.stringify({
			srcNodeId: this.props.nodeData.id,
			srcFields: [field]
		});
		evt.dataTransfer.setData("text/plain", data);
		// TODO Setting drag image this way only seems to work on Chrome - fix for FF and Safari.
		if (navigator.userAgent.includes("Chrome")) {
			evt.dataTransfer.setDragImage(this.dragImgage, 15, 15);
		}
	}

	onFieldDrop(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		if (this.props.nodeData.op !== "input_link") {
			const data = evt.dataTransfer.getData("text/plain");
			if (data) {
				const srcInfo = JSON.parse(data);

				// Convert incoming field so it references the appropriate port
				// ID from the input container.
				const fields = this.getFieldsWithToPortIds(srcInfo.srcFields);

				// Add fields, create ports and add links
				const command = new LinkInputToOutputAction(
					srcInfo.srcNodeId, fields,
					this.props.nodeData.id, this.props.canvasController);
				if (command.isDoable()) {
					const commandStack = this.props.canvasController.getCommandStack();
					commandStack.do(command);
				}
			}
		}
	}

	onMouseEnterOnContainer() {
		// console.log("onMouseEnterOnContainer");

		this.props.canvasController.closeContextMenu();
	}

	// Stop propagation will prevent the node/container from being dragged to a
	// new position.
	onMouseDownOnContainer(evt) {
		evt.stopPropagation();
	}

	// We need to stop propagation so the mouse down event does not go through
	// to the canvas node.
	onMouseDownOnDragContainerIcon(evt) {
		window.console.log("onMouseDownOnDragContainerIcon");
		evt.stopPropagation();

		this.props.canvasController.closeContextMenu();

		this.rightNodes = this.onSortRightNodes();
		this.targetAreas = this.onCreateTargetAreas();

		document.addEventListener("mousemove", this.onMouseMoveOnDragContainerIcon, true);
		document.addEventListener("mouseup", this.onMouseUpOnDragContainerIcon, true);
	}

	onMouseMoveOnDragContainerIcon(evt) {
		window.console.log("onMouseMoveOnDragContainerIcon");
		evt.stopPropagation();

		if (evt.movementY === 0) {
			return;
		}

		const newYPos = Math.max(this.props.nodeData.y_pos + evt.movementY, TOP_Y);

		let newNodesProps = [];
		newNodesProps.push({ id: this.props.nodeData.id, y_pos: newYPos });

		// Mouse pointer is moving down
		if (evt.movementY > 0) {
			const targetAreaUnderYPos = this.targetAreas.find(
				(sp) => sp.node.id !== this.props.nodeData.id && newYPos + this.props.nodeData.height > sp.top && newYPos < sp.top);
			if (targetAreaUnderYPos) {
				this.props.nodeData.y_pos = targetAreaUnderYPos.top;
				targetAreaUnderYPos.node.y_pos = this.targetAreas[targetAreaUnderYPos.pos - 1].top;

				this.rightNodes = this.onSortRightNodes();
				newNodesProps = this.onSetNodePositions(newYPos);
				this.targetAreas = this.onCreateTargetAreas();
			}

		// Mouse pointer is moving up
		} else if (evt.movementY < 0) {
			const targetAreaUnderYPos = this.targetAreas.find(
				(sp) => sp.node.id !== this.props.nodeData.id && newYPos < sp.bottom && newYPos + this.props.nodeData.height > sp.bottom);
			if (targetAreaUnderYPos) {
				this.props.nodeData.y_pos = targetAreaUnderYPos.top;
				targetAreaUnderYPos.node.y_pos = this.targetAreas[targetAreaUnderYPos.pos + 1].top;

				this.rightNodes = this.onSortRightNodes();
				newNodesProps = this.onSetNodePositions(newYPos);
				this.targetAreas = this.onCreateTargetAreas();
			}
		}

		this.props.externalUtils.setNodesProperties(newNodesProps);
		this.props.externalUtils.raiseNodeToTopById(this.props.nodeData.id);
	}

	onSortRightNodes() {
		return this.getRightNodes().sort((a, b) => a.y_pos - b.y_pos);
	}

	onCreateTargetAreas() {
		return this.rightNodes.map((rn, i) => ({
			pos: i,
			node: rn,
			top: rn.y_pos + (rn.height * 0.2),
			bottom: rn.y_pos + (rn.height * 0.8)
		}));
	}

	onSetNodePositions(ourPos) {
		let yPos = TOP_Y; // Start postion

		const newNodesProps = [];
		this.rightNodes.forEach((rn) => {
			if (rn.id !== this.props.nodeData.id) {
				newNodesProps.push({ id: rn.id, y_pos: yPos });
			} else {
				newNodesProps.push({ id: rn.id, y_pos: ourPos });
			}
			yPos += rn.height + CONTAINER_GAP; // Height plus gap
		});
		return newNodesProps;
	}

	onMouseUpOnDragContainerIcon(evt) {
		evt.stopPropagation();

		if (this.rightNodes) {
			const nodeSizingObjectsInfo = {};

			let yPos = TOP_Y;
			this.rightNodes.forEach((n) => {
				const nodeSizingObj = {
					id: n.id,
					height: n.height,
					width: n.width,
					x_pos: n.x_pos,
					y_pos: yPos
				};
				if (n.isResized) {
					nodeSizingObj.isResized = true;
					nodeSizingObj.resizeWidth = n.resizeWidth;
					nodeSizingObj.resizeHeight = n.resizeHeight;
				}
				yPos += n.height + CONTAINER_GAP;

				nodeSizingObjectsInfo[n.id] = nodeSizingObj;
			});

			this.saveNodePositions(nodeSizingObjectsInfo);
		}

		document.removeEventListener("mousemove", this.onMouseMoveOnDragContainerIcon, true);
		document.removeEventListener("mouseup", this.onMouseUpOnDragContainerIcon, true);
	}

	onMouseDownOnResizeIcon(evt) {
		window.console.log("onMouseDownOnResizeIcon");
		evt.stopPropagation();

		this.props.canvasController.closeContextMenu();

		document.addEventListener("mousemove", this.resizeNode, true);
		document.addEventListener("mouseup", this.resizeNodeEnd, true);
	}

	setContainerPortPositions() {
		const nodeDivRect = this.getNodeDivRect();
		const headerDivRect = this.getHeaderDivRect();
		const scrollDivRect = this.isContainerResized() ? this.getScrollDivRect() : {};

		const inputPositions = !this.props.nodeData.inputs || this.props.nodeData.inputs.length === 0
			? []
			: this.props.nodeData.inputs.map((port) =>
				({
					id: port.id,
					cx: PORT_POS_INDENT,
					cy: this.isContainerResized() ? this.getFieldElementPortPosY(port.id, nodeDivRect, scrollDivRect) : (headerDivRect.height / 2)
				}));

		const outputPositions = !this.props.nodeData.outputs || this.props.nodeData.outputs.length === 0
			? []
			: this.props.nodeData.outputs.map((port) =>
				({
					id: port.id,
					cx: port.id.startsWith("right")
						? nodeDivRect.width - PORT_POS_INDENT
						: PORT_POS_INDENT,
					cy: this.isContainerResized()
						? this.getFieldElementPortPosY(this.getStripPortId(port.id), nodeDivRect, scrollDivRect)
						: (headerDivRect.height / 2)
				}));

		this.props.externalUtils.setPortPositions({
			nodeId: this.props.nodeData.id,
			inputPositions,
			outputPositions
		});
	}

	getStripPortId(id) {
		return id.startsWith("right") ? id.substring(6) : id.substring(5);
	}

	getNodeDivRect() {
		const nodeDivId = this.getNodeDivId();
		const nodeDiv = document.getElementById(nodeDivId);
		const nodeDivRect = nodeDiv.getBoundingClientRect();
		return nodeDivRect;
	}

	getHeaderDivRect() {
		const headerDivId = this.getHeaderDivId();
		const headerDiv = document.getElementById(headerDivId);
		const headerDivRect = headerDiv.getBoundingClientRect();
		return headerDivRect;
	}

	getScrollDivRect() {
		const scrollDivId = this.getScrollDivId();
		const scrollDiv = document.getElementById(scrollDivId);
		const scrollDivRect = scrollDiv.getBoundingClientRect();
		return scrollDivRect;
	}

	getFieldElementPortPosY(portId, nodeDivRect, scrollDivRect) {
		const colElementId = this.getFieldElementId(portId);
		const colElement = document.getElementById(colElementId);
		const colElementRect = colElement.getBoundingClientRect();
		let colElemetCenterY = colElementRect.top - nodeDivRect.top + (colElementRect.height / 2);
		const headerBottom = scrollDivRect.top - nodeDivRect.top;
		const footerTop = scrollDivRect.bottom - nodeDivRect.top;
		const footerHeight = nodeDivRect.height - footerTop;

		if (colElemetCenterY < headerBottom) {
			colElemetCenterY = headerBottom / 2;

		} else if (colElemetCenterY > footerTop) {
			colElemetCenterY = footerTop + (footerHeight / 2);
		}
		return colElemetCenterY;
	}

	getNodeDivId() {
		return "node_div_" + this.props.nodeData.id;
	}

	getHeaderDivId() {
		return "header_div_" + this.props.nodeData.id;
	}

	getScrollDivId() {
		return "scroll_div_" + this.props.nodeData.id;
	}

	getFieldElementId(colId) {
		return this.props.nodeData.id + "--" + colId;
	}

	getLeftNodes() {
		return this.props.externalUtils.getActiveNodes().filter((n) => n.op !== "output_link");
	}

	getRightNodes() {
		return this.props.externalUtils.getActiveNodes().filter((n) => n.op === "output_link");
	}

	getContainerLabel() {
		let containerType = "";
		if (this.props.nodeData.op === "input_link") {
			containerType = "Input:";
		} else if (this.props.nodeData.op === "output_link") {
			containerType = "Output:";
		}
		return <div>{containerType + " " + this.props.nodeData.label}</div>;
	}

	getChevronIcon() {
		const icon = this.isContainerResized() ? (<ChevronUp />) : (<ChevronDown />);
		return (
			<div className="node-header-chevron" onMouseDown={this.onMouseDownOnHeaderChevron}>
				{icon}
			</div>
		);
	}

	getFieldCount() {
		return this.props.nodeData.app_data.table_data.fields.length + " columns";
	}

	getMapping(field) {
		const links = this.props.canvasController.getLinks();
		const mappingLink = links
			.find((l) => l.trgNodeId === this.props.nodeData.id && l.trgNodePortId === field.id);
		if (mappingLink) {
			const sourceNode = this.props.externalUtils.getActiveNode(mappingLink.srcNodeId);
			const sourceField = sourceNode.app_data.table_data.fields
				.find((f) => f.id === this.getStripPortId(mappingLink.srcNodePortId));
			return sourceNode.label + "." + sourceField.label;
		}
		return "";
	}

	getFieldsWithToPortIds(fields) {
		const prefix = this.props.nodeData.op === "output_link" ? "right-" : "left-";
		return fields.map((f) => {
			const fieldCopy = { ...f };
			fieldCopy.id = prefix + fieldCopy.id;
			return fieldCopy;
		});
	}

	isContainerResized() {
		return this.props.nodeData.isResized;
	}

	resizeNode(evt) {
		window.console.log("Resize node");
		evt.stopPropagation();
		evt.preventDefault();

		const newNodesProps = this.adjustContainerPositions(evt.movementX, evt.movementY);
		this.props.externalUtils.setNodesProperties(newNodesProps);
		this.setContainerPortPositions();
	}

	resizeNodeEnd() {
		window.console.log("Resize node end");

		document.removeEventListener("mousemove", this.resizeNode, true);
		document.removeEventListener("mouseup", this.resizeNodeEnd, true);

		const nodeSizingObjectsInfo = {};

		this.props.externalUtils.getActiveNodes().forEach((n) => {
			const nodeSizingObj = {
				id: n.id,
				height: n.height,
				width: n.width,
				x_pos: n.x_pos,
				y_pos: n.y_pos
			};
			if (n.isResized) {
				nodeSizingObj.isResized = true;
				nodeSizingObj.resizeWidth = n.resizeWidth;
				nodeSizingObj.resizeHeight = n.resizeHeight;
			}

			nodeSizingObjectsInfo[n.id] = nodeSizingObj;
		});


		this.saveNodePositions(nodeSizingObjectsInfo);
	}

	saveNodePositions(nodeSizingObjectsInfo) {
		this.props.canvasController.editActionHandler({
			editType: "resizeObjects",
			editSource: "app",
			objectsInfo: nodeSizingObjectsInfo,
			detachedLinksInfo: [],
			pipelineId: this.props.canvasController.getCurrentPipelineId()
		});
	}

	adjustContainerPositions(xInc, yInc) {
		const newNodesProps = [];

		const leftNodes = this.getLeftNodes();
		const rightNodes = this.getRightNodes();
		const nodeOnLeft = leftNodes.find((n) => n.id === this.props.nodeData.id);

		if (nodeOnLeft) {
			newNodesProps.push({
				id: this.props.nodeData.id,
				height: this.props.nodeData.height + yInc,
				width: this.props.nodeData.width + xInc
			});

			rightNodes.forEach((n) => {
				newNodesProps.push({
					id: n.id,
					x_pos: n.x_pos + xInc
				});
			});

			leftNodes.forEach((n) => {
				if (n.id !== this.props.nodeData.id) {
					const yPosInc = n.y_pos > this.props.nodeData.y_pos ? yInc : 0;

					newNodesProps.push({
						id: n.id,
						x_pos: n.x_pos + xInc,
						y_pos: n.y_pos + yPosInc
					});
				}
			});

		} else {
			newNodesProps.push({
				id: this.props.nodeData.id,
				height: this.props.nodeData.height + yInc,
				width: this.props.nodeData.width + xInc
			});

			const nodesUnderOnRight = rightNodes.filter((n) => n.y_pos > this.props.nodeData.y_pos);

			nodesUnderOnRight.forEach((n) => {
				newNodesProps.push({
					id: n.id,
					y_pos: n.y_pos + yInc
				});
			});
		}

		return newNodesProps;
	}

	generateTopLeftIcon() {
		if (this.props.nodeData.op === "output_link") {
			return (
				<div className="node-header-drag-icon" onMouseDown={this.onMouseDownOnDragContainerIcon}>
					<DragVertical />
				</div>
			);

		} else if (this.props.nodeData.op === "input_link") {
			return (
				<div className="node-header-drag-icon"
					draggable
					onDragStart={this.onDragStartOnContainerDataIcon}
					onMouseDown={this.onMouseDownOnContainerDataIcon}
				>
					<Draggable />
				</div>
			);
		}
		// Returning an empty <div> for 'stage variables' and 'loop condition' allows
		// the grid-template-columns setting for for the header to work correctly.
		return (<div />);
	}

	generateHeader() {
		const topLeftIcon = this.generateTopLeftIcon();
		const chevronIcon = this.getChevronIcon();
		const containerLabel = this.getContainerLabel();
		const fieldCount = this.getFieldCount();
		return (
			<div id={this.getHeaderDivId()} className="node-header">
				{topLeftIcon}
				{containerLabel}
				{fieldCount}
				{chevronIcon}
			</div>
		);
	}

	generateScrollDiv() {
		const fields = get(this.props.nodeData, "app_data.table_data.fields", []);
		const content = fields.length > 0
			? this.generateFields()
			: (<div className="node-no-columns">No columns</div>);

		return (
			<div id={this.getScrollDivId()} className="scroll-div" onScroll={this.onScroll} onWheel={this.onScroll} >
				{content}
			</div>
		);
	}

	generateFields() {
		const cols = this.props.nodeData.app_data.table_data.fields.map((field, index) => {
			let beforeLabel = null;
			let mapping = null;
			let className = "scrollable-row";

			if (this.props.nodeData.op === "output_link") {
				beforeLabel = (
					<div>
						<Draggable />
					</div>
				);
				mapping = (
					<div>{this.getMapping(field)}</div>
				);
				className += " with-mapping";

			// Input link
			} else {
				beforeLabel = (
					<div
						draggable
						onMouseDown={this.onMouseDownOnFieldIcon}
						onDragStart={(evt) => this.onDragStartOnFieldIcon(evt, field)}
					>
						<Draggable />
					</div>
				);
			}

			return (
				<div key={field.id}
					id={this.getFieldElementId(field.id)}
					className={className}
					draggable
					onDragStart={(evt) => this.onFieldMoveDragStart(evt, field)}
				>
					{beforeLabel}
					<div>{index + 1}</div>
					<div>{field.label}</div>
					{mapping}
					<div>{field.type}</div>
					<div>{" "}</div>
				</div>
			);
		});
		return cols;
	}

	generateFooter() {
		return (
			<div className="node-footer" >
				<div className="footer-label">{"View 60 more"}</div>
				<div className="node-footer-chevron" draggable="false" onMouseDown={this.onMouseDownOnResizeIcon} >
					<img src={"./images/vector.svg"} />
				</div>
			</div>
		);
	}

	render() {
		// window.console.log("render " + this.props.nodeData.label);

		const header = this.generateHeader();
		const scrollDiv = this.isContainerResized() ? this.generateScrollDiv() : null;
		const footer = this.isContainerResized() ? this.generateFooter() : null;

		return (
			<div id={this.getNodeDivId()}
				onMouseEnter={this.onMouseEnterOnContainer}
				onMouseDown={this.onMouseDownOnContainer}
				onDrop={this.onFieldDrop}
				className="node-container"
			>
				{header}
				{scrollDiv}
				{footer}
			</div>
		);
	}
}

MappingContainerNode.propTypes = {
	nodeData: PropTypes.object,
	canvasController: PropTypes.object,
	externalUtils: PropTypes.object
};

export default MappingContainerNode;
