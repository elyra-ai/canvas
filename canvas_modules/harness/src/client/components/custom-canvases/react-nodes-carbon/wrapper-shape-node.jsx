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
import SVG from "react-inlinesvg";
import { get } from "lodash";

import ShapeNode from "@carbon/charts-react/diagrams/ShapeNode";
import "@carbon/charts/styles-g10.css";

class ShapeNodeWrapper extends React.Component {
	componentDidMount() {
		window.console.log("ShapeNodeWrapper - componentDidMount");
	}

	componentDidUpdate() {
		window.console.log("ShapeNodeWrapper - componentDidUpdate");
	}

	componentWillUnmount() {
		window.console.log("ShapeNodeWrapper - componentWillUnmount");
	}

	render() {
		const shape = get(this, "props.nodeData.app_data.react_nodes_data.shape");

		const styleImage = { height: "24px", width: "24px", y: 0 };
		const icon = (<SVG src={this.props.nodeData.image} style={styleImage} />);
		return (
			<ShapeNode
				className={"shape-node-div"}
				title={this.props.nodeData.label}
				shape={shape}
				size="28px"
				renderIcon={icon}
			/>
		);
	}
}

ShapeNodeWrapper.propTypes = {
	nodeData: PropTypes.object
};

export default ShapeNodeWrapper;
