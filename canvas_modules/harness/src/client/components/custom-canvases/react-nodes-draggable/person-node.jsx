/*
* Copyright 2025 Elyra Authors
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

/* eslint no-alert: "off" */

import React from "react";
import PropTypes from "prop-types";
import SVG from "react-inlinesvg";

class PersonNode extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			draggedOver: false
		};
	}

	onDragStart(evt) {
		const transferData = {
			operation: "addToCanvas",
			data: {
				editType: "createExternalNode",
				label: this.props.nodeData.label
			}
		};
		evt.dataTransfer.setData("text", JSON.stringify(transferData));

		// Store label in document object so it can be accessesd in
		// onDragEnter because in onDragEnter the event object will
		// not contain the transferData.
		document.objBeingDragged = this.props.nodeData.label;
	}

	onDragEnter(evt) {
		const label = document.objBeingDragged;

		if (label !== this.props.nodeData.label) {
			this.setState({ draggedOver: true });
		}
	}

	onDragLeave(evt) {
		this.setState({ draggedOver: false });
	}

	onDrop(evt) {
		evt.stopPropagation();

		this.setState({ draggedOver: false });

		// const label = evt.dataTransfer.getData("text");
		const label = document.objBeingDragged;

		if (label !== this.props.nodeData.label) {
			window.alert(`${label} dropped on ${this.props.nodeData.label}`);
		}
	}

	render() {
		const className = "person-node" + (this.state.draggedOver ? " dragged-over" : "");

		return (
			<div className={className} draggable={"true"} tabIndex={-1}
				onDragStart={this.onDragStart.bind(this)}
				onDragEnter={this.onDragEnter.bind(this)}
				onDragLeave={this.onDragLeave.bind(this)}
				onDrop={this.onDrop.bind(this)}
			>
				<SVG src={this.props.nodeData.image} />
				<span>{this.props.nodeData.label}</span>
			</div>
		);
	}
}

PersonNode.propTypes = {
	nodeData: PropTypes.object
};

export default PersonNode;
