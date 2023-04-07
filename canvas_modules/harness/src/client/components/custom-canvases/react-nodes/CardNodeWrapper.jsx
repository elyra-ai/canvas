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

import CardNode, { CardNodeColumn,
	CardNodeSubtitle,
	CardNodeTitle
} from "@carbon/charts-react/diagrams/CardNode";

import "@carbon/charts/styles-g10.css";

class CardNodeWrapper extends React.Component {
	constructor() {
		super();
		this.onClick = this.onClick.bind(this);
	}

	componentDidMount() {
		window.console.log("CardNodeWrapper - componentDidMount");
	}

	componentDidUpdate() {
		window.console.log("CardNodeWrapper - componentDidUpdate");
	}

	componentWillUnmount() {
		window.console.log("CardNodeWrapper - componentWillUnmount");
	}

	onClick() {
		this.props.onClick();
	}

	render() {
		const styleImage = { height: "24px", width: "24px", y: 0 };

		if (this.props.nodeData.type === "super_node" &&
				this.props.nodeData.is_expanded) {
			return (
				<CardNode onClick={this.props.onClick}>
					<CardNodeColumn>
						<SVG src={this.props.nodeData.image} style={styleImage} />
					</CardNodeColumn>
					<CardNodeColumn>
						<CardNodeTitle>{this.props.nodeData.label}</CardNodeTitle>
					</CardNodeColumn>
				</CardNode>
			);
		}

		return (
			<CardNode onClick={this.onClick}>
				<CardNodeColumn>
					<SVG src={this.props.nodeData.image} style={styleImage} />
				</CardNodeColumn>
				<CardNodeColumn>
					<CardNodeTitle>{this.props.nodeData.label}</CardNodeTitle>
					<CardNodeSubtitle>{this.props.nodeData.description}</CardNodeSubtitle>
				</CardNodeColumn>
			</CardNode>
		);
	}
}

CardNodeWrapper.propTypes = {
	nodeData: PropTypes.object,
	onClick: PropTypes.func,
	canvasController: PropTypes.object
};

export default CardNodeWrapper;
