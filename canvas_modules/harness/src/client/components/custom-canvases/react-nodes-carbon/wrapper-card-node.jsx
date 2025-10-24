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

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import SVG from "react-inlinesvg";

import { CardNode, CardNodeColumn, CardNodeTitle, CardNodeSubtitle } from "@carbon/charts-react";
import { IMAGE_STYLES } from "./react-nodes-carbon-constants";

const CardNodeWrapper = ({ nodeData, pipelineData, canvasController }) => {

	const divRef = React.createRef();

	const { label, description, op, type, image } = nodeData;
	const { color, shape } = nodeData?.app_data?.react_nodes_data || {};

	const imageOverride = image === "useDefaultIcon" ? "images/custom-canvases/flows/palette/icons/supernode.svg" : image;

	const isSuperNodeAndExpanded = type === "super_node" && nodeData.is_expanded;

	let className = "card-node";
	if (!isSuperNodeAndExpanded) {
		className += op === "card-node-with-outline" ? " card-node-outline-div" : "";
		className += shape === "curved-corners" ? " card-node-curved-corners" : "";
	}


	useEffect(() => {
		const setNodeSize = () => {
			setTimeout(() => {
				const node = canvasController.getNode(nodeData.id, pipelineData.id);

				if (!node.isResized && divRef.current &&
					(divRef.current.scrollHeight > divRef.current.clientHeight ||
						divRef.current.scrollWidth > divRef.current.clientWidth)) {
					node.isResized = true;
					node.resizeHeight = divRef.current.scrollHeight + 10;
					node.resizeWidth = divRef.current.scrollWidth;
					canvasController.setNodeProperties(nodeData.id, node, pipelineData.id);
				}
			}, 100);
		};

		setNodeSize();

	}, [nodeData, pipelineData, canvasController]);

	return (
		<div className={className} ref={divRef}>
			<CardNode color={color}>
				<CardNodeColumn>
					<SVG src={imageOverride} style={IMAGE_STYLES} />
				</CardNodeColumn>
				<CardNodeColumn>
					<CardNodeTitle>{label}</CardNodeTitle>
					{!isSuperNodeAndExpanded && <CardNodeSubtitle>{description}</CardNodeSubtitle>}
				</CardNodeColumn>
			</CardNode>
		</div>
	);
};

CardNodeWrapper.propTypes = {
	nodeData: PropTypes.object,
	pipelineData: PropTypes.object,
	canvasController: PropTypes.object
};

export default CardNodeWrapper;
