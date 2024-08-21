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

import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Tooltip from "../tooltip/tooltip.jsx";
import Icon from "../icons/icon.jsx";
import { isEmpty } from "lodash";
import { TIP_TYPE_PALETTE_ITEM, TIP_TYPE_PALETTE_CATEGORY, TIP_TYPE_DEC,
	TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK, TIP_TYPE_STATE_TAG,
	ERROR, WARNING } from "../common-canvas/constants/canvas-constants.js";

class CommonCanvasTooltip extends React.Component {
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
		case TIP_TYPE_DEC:
		case TIP_TYPE_LINK:
		case TIP_TYPE_STATE_TAG:
		default:
			direction = "bottom";
		}

		if (this.props.customContent) {
			content = this.props.customContent;
		} else {
			switch (this.props.type) {
			case TIP_TYPE_PALETTE_ITEM:
				content = (
					<div className="tip-palette-item">
						<div className="tip-palette-category">{this.props.category.label}</div>
						<div className="tip-palette-label">{this.props.nodeTemplate.app_data.ui_data.label}</div>
						{this.props.nodeTemplate.app_data.ui_data.description
							? (<div className="tip-palette-desc">{this.props.nodeTemplate.app_data.ui_data.description}</div>)
							: ("")
						}
					</div>
				);
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
					if (this.props.canvasController.getObjectModel().hasErrorMessage(this.props.node)) {
						icon = (<Icon type={ERROR} className="tip-node-status error" />);
					} else if (this.props.canvasController.getObjectModel().hasWarningMessage(this.props.node)) {
						icon = (<Icon type={WARNING} className="tip-node-status warning" />);
					}
					const nodeType = this.props.canvasController.getObjectModel().getPaletteNode(this.props.node.op);
					let nodeLabel = this.props.node.label;
					const nodeTypeLabel = nodeType && nodeType.app_data && nodeType.app_data.ui_data ? nodeType.app_data.ui_data.label : nodeLabel;
					if (nodeLabel !== nodeTypeLabel) {
						nodeLabel += ` (${nodeTypeLabel})`;
					}

					// If there's nothing to display just give up. This will prevent us
					// displaying an empty tooltip.
					if (!icon && !nodeLabel && !nodeTypeLabel && !this.props.node.description) {
						return null;
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
			case TIP_TYPE_DEC:
				content = isEmpty(this.props.decoration.tooltip) ? null : (
					<div className="tip-decoration">{this.props.decoration.tooltip}</div>
				);
				break;

			case TIP_TYPE_LINK:
				break;

			case TIP_TYPE_STATE_TAG:
				content = isEmpty(this.props.stateTagText) ? null : (
					<div className="tip-state-tag">{this.props.stateTagText}</div>
				);
				break;

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
			className={[TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_DEC, TIP_TYPE_LINK].includes(this.props.type) ? "definition-tooltip" : null}
		/>) : null;
	}
}

CommonCanvasTooltip.propTypes = {
	// canvasController provided by common-canvas.jsx
	canvasController: PropTypes.object.isRequired,
	// The rest provided by redux
	id: PropTypes.string,
	type: PropTypes.oneOf([TIP_TYPE_PALETTE_CATEGORY, TIP_TYPE_PALETTE_ITEM, TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_DEC, TIP_TYPE_LINK, TIP_TYPE_STATE_TAG]),
	targetObj: PropTypes.object,
	mousePos: PropTypes.object,
	customContent: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
	node: PropTypes.object,
	port: PropTypes.object,
	decoration: PropTypes.object,
	nodeTemplate: PropTypes.object,
	category: PropTypes.object,
	stateTagText: PropTypes.string
};

const mapStateToProps = (state, ownProps) => ({
	id: state.tooltip.id,
	type: state.tooltip.type,
	targetObj: state.tooltip.targetObj,
	mousePos: state.tooltip.mousePos,
	customContent: state.tooltip.customContent,
	node: state.tooltip.node,
	port: state.tooltip.port,
	decoration: state.tooltip.decoration,
	nodeTemplate: state.tooltip.nodeTemplate,
	category: state.tooltip.category,
	stateTagText: state.tooltip.stateTagText
});

export default connect(mapStateToProps)(CommonCanvasTooltip);
