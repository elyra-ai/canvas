/*
 * Copyright 2017-2019 IBM Corporation
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
import Tooltip from "./tooltip.jsx";
import Icon from "carbon-components-react/lib/components/Icon";
import isEmpty from "lodash/isEmpty";
import { TIP_TYPE_PALETTE_ITEM, TIP_TYPE_PALETTE_CATEGORY, TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK } from "../common-canvas/constants/canvas-constants.js";

export default class TooltipWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.handleClick = this.handleClick.bind(this);
	}

	componentDidMount() {
		document.addEventListener("mousedown", this.handleClick, true);
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this.handleClick, true);
	}

	handleClick(e) {
		this.props.canvasController.closeTip();
	}

	render() {
		let content = null;
		let direction = null;
		switch (this.props.type) {
		case TIP_TYPE_PALETTE_ITEM:
		case TIP_TYPE_PALETTE_CATEGORY:
			direction = "right";
			break;
		case TIP_TYPE_NODE:
		case TIP_TYPE_PORT:
		case TIP_TYPE_LINK:
		default:
			direction = "bottom";
		}

		if (this.props.customContent) {
			content = this.props.customContent;
		} else {
			switch (this.props.type) {
			case TIP_TYPE_PALETTE_ITEM:
				{
					const category = this.props.canvasController.getObjectModel().getCategoryForNode(this.props.nodeTemplate.op);
					content = (
						<div className="tip-palette-item">
							<div className="tip-palette-category">{category.label}</div>
							<div className="tip-palette-label">{this.props.nodeTemplate.app_data.ui_data.label}</div>
							{this.props.nodeTemplate.app_data.ui_data.description
								? (<div className="tip-palette-desc">{this.props.nodeTemplate.app_data.ui_data.description}</div>)
								: ("")
							}
						</div>
					);
				}
				break;
			case TIP_TYPE_PALETTE_CATEGORY:
				content = (
					<div className="tip-palette-item">
						<div className="tip-palette-label">{this.props.category.label}</div>
						{this.props.category.description
							? (<div className="tip-palette-desc">{this.props.category.description}</div>)
							: ("")
						}
					</div>
				);
				break;
			case TIP_TYPE_NODE:
				{
					let icon = null;
					if (this.props.canvasController.getObjectModel().hasErrorMessage(this.props.node.id)) {
						icon = (<Icon className="tip-node-status error" name="error--glyph" />);
					} else if (this.props.canvasController.getObjectModel().hasWarningMessage(this.props.node.id)) {
						icon = (<Icon className="tip-node-status warning" name="warning--glyph" />);
					}
					const nodeType = this.props.canvasController.getObjectModel().getPaletteNode(this.props.node.op);
					let nodeLabel = this.props.node.label;
					const nodeTypeLabel = nodeType && nodeType.app_data && nodeType.app_data.ui_data ? nodeType.app_data.ui_data.label : nodeLabel;
					if (nodeLabel !== nodeTypeLabel) {
						nodeLabel += ` (${nodeTypeLabel})`;
					}

					content = (
						<div className="tip-node">
							{icon}
							<div className="tip-node-label">{nodeLabel}</div>
							{this.props.node.description
								? (<div className="tip-node-desc">{this.props.node.description}</div>)
								: ("")
							}
						</div>
					);
				}
				break;
			case TIP_TYPE_PORT:
				content = isEmpty(this.props.port.label) ? null : (
					<div className="tip-port">{this.props.port.label}</div>
				);
				break;
			case TIP_TYPE_LINK:
			default:
				content = null;
			}
		}

		return (content !== null) ? (<Tooltip
			tip={content}
			direction={direction}
			id={this.props.id}
			targetObj={this.props.targetObj}
			mousePos={this.props.mousePos}
			delay={0}
		/>) : null;
	}
}

TooltipWrapper.propTypes = {
	id: PropTypes.string.isRequired,
	type: PropTypes.oneOf([TIP_TYPE_PALETTE_CATEGORY, TIP_TYPE_PALETTE_ITEM, TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK]).isRequired,
	targetObj: PropTypes.object.isRequired,
	mousePos: PropTypes.object,
	customContent: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
	node: PropTypes.object,
	port: PropTypes.object,
	nodeTemplate: PropTypes.object,
	category: PropTypes.object,
	canvasController: PropTypes.object.isRequired
};
