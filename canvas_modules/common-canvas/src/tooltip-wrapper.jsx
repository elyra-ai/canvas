/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Tooltip from "./tooltip.jsx";
import CanvasController from "./common-canvas-controller.js";
import ObjectModel from "./object-model/object-model.js";
import { Icon } from "ap-components-react/dist/ap-components-react";
import { TIP_TYPE_PALETTE_ITEM, TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK } from "../constants/common-constants.js";

export default class TooltipWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		document.addEventListener("mousedown", this.handleClick, true);
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this.handleClick, true);
	}

	handleClick(e) {
		CanvasController.hideTip();
	}

	render() {
		let content = null;
		let direction = null;
		switch (this.props.type) {
		case TIP_TYPE_PALETTE_ITEM:
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
					const category = ObjectModel.getCategoryForNode(this.props.paletteItem.operator_id_ref);
					content = (
						<div className="tip-palette-item">
							<hr className="tip-palette-line" />
							<div className="tip-palette-category">{category.label}</div>
							<div className="tip-palette-label">{this.props.paletteItem.label}</div>
							{this.props.paletteItem.description
								? (<div className="tip-palette-desc">{this.props.paletteItem.description}</div>)
								: ("")
							}
						</div>
					);
				}
				break;
			case TIP_TYPE_NODE:
				{
					let icon = null;
					if (ObjectModel.hasErrorMessage(this.props.node.id)) {
						icon = <Icon className="tip-node-status" type="error" />;
					} else if (ObjectModel.hasWarningMessage(this.props.node.id)) {
						icon = <Icon className="tip-node-status" type="warning" />;
					}
					const nodeType = ObjectModel.getPaletteNode(this.props.node.operator_id_ref);
					let nodeLabel = this.props.node.label;
					if (nodeType && nodeLabel !== nodeType.label) {
						nodeLabel += ` (${nodeType.label})`;
					}

					content = (
						<div className="tip-node">
							{icon}
							<hr className="tip-node-line" />
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
				content = (
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
			delay={750}
		/>) : null;
	}
}

TooltipWrapper.propTypes = {
	id: PropTypes.string.isRequired,
	type: PropTypes.oneOf([TIP_TYPE_PALETTE_ITEM, TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK]).isRequired,
	targetObj: PropTypes.object.isRequired,
	mousePos: PropTypes.object,
	customContent: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
	node: PropTypes.object,
	port: PropTypes.object,
	paletteItem: PropTypes.object,
	category: PropTypes.string
};
