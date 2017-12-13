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
import { Icon } from "ap-components-react/dist/ap-components-react";
import { TIP_TYPE_PALETTE_ITEM, TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK } from "../constants/common-constants.js";

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
		this.props.canvasController.hideTip();
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
					const category = this.props.canvasController.getObjectModel().getCategoryForNode(this.props.nodeTemplate.operator_id_ref);
					content = (
						<div className="tip-palette-item">
							<hr className="tip-palette-line" />
							<div className="tip-palette-category">{category.label}</div>
							<div className="tip-palette-label">{this.props.nodeTemplate.label}</div>
							{this.props.nodeTemplate.description
								? (<div className="tip-palette-desc">{this.props.nodeTemplate.description}</div>)
								: ("")
							}
						</div>
					);
				}
				break;
			case TIP_TYPE_NODE:
				{
					let icon = null;
					if (this.props.canvasController.getObjectModel().hasErrorMessage(this.props.node.id)) {
						icon = <Icon className="tip-node-status" type="error" />;
					} else if (this.props.canvasController.getObjectModel().hasWarningMessage(this.props.node.id)) {
						icon = <Icon className="tip-node-status" type="warning" />;
					}
					const nodeType = this.props.canvasController.getObjectModel().getPaletteNode(this.props.node.operator_id_ref);
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
	nodeTemplate: PropTypes.object,
	category: PropTypes.string,
	canvasController: PropTypes.object.isRequired
};
