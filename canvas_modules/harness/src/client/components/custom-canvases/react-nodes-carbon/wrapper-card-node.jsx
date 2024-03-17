/*
* Copyright 2023-2024 Elyra Authors
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
import SVG from "react-inlinesvg";
import { get } from "lodash";

import { CardNode, CardNodeColumn,
	CardNodeSubtitle,
	CardNodeTitle
} from "@carbon/charts-react";

class CardNodeWrapper extends React.Component {
	componentDidMount() {
		window.console.log("CardNodeWrapper - componentDidMount");
	}

	componentDidUpdate() {
		window.console.log("CardNodeWrapper - componentDidUpdate");
	}

	componentWillUnmount() {
		window.console.log("CardNodeWrapper - componentWillUnmount");
	}

	render() {
		const styleImage = { height: "24px", width: "24px", y: 0 };

		const image = this.props.nodeData.image === "useDefaultIcon"
			? "images/custom-canvases/flows/palette/icons/supernode.svg"
			: this.props.nodeData.image;

		if (this.props.nodeData.type === "super_node" &&
				this.props.nodeData.is_expanded) {
			// The SVG area that shows the sub-flow will overlay this Card Node that
			// forms the background for the supernode.
			return (
				<div className={"card-node"}>
					<CardNode>
						<CardNodeColumn>
							<SVG src={image} style={styleImage} />
						</CardNodeColumn>
						<CardNodeColumn>
							<CardNodeTitle>{this.props.nodeData.label}</CardNodeTitle>
						</CardNodeColumn>
					</CardNode>
				</div>
			);
		}

		// Read attributes from the nodeData, in the pipeline flow JSON file,
		// for the node we are displaying.
		const type = get(this, "props.nodeData.op"); // Derive the type from the operator
		const color = get(this, "props.nodeData.app_data.react_nodes_data.color");
		const shape = get(this, "props.nodeData.app_data.react_nodes_data.shape");

		// Set the classes based on the node attributes.
		let className = "card-node";
		className += type === "card-node-with-outline" ? " card-node-outline-div" : "";
		className += shape === "curved-corners" ? " card-node-curved-corners" : "";

		return (
			<div className={className}>
				<CardNode color={color}>
					<CardNodeColumn>
						<SVG src={image} style={styleImage} />
					</CardNodeColumn>
					<CardNodeColumn>
						<CardNodeTitle>{this.props.nodeData.label}</CardNodeTitle>
						<CardNodeSubtitle>{this.props.nodeData.description}</CardNodeSubtitle>
					</CardNodeColumn>
				</CardNode>
			</div>
		);
	}
}

CardNodeWrapper.propTypes = {
	nodeData: PropTypes.object
};

export default CardNodeWrapper;
