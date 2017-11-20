/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/*
	This code is a modified version from portal-common-api for the common-canvas toolbar
	https://github.ibm.com/dap/portal-common-api/blob/master/src/js/nav/v2/nav.js
*/
/* eslint complexity: ["error", 25] */
import React from "react";
import PropTypes from "prop-types";

class ToolTip extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showToolTip: false,
			pendingTooltip: null
		};
	}

	setTooltipVisible(visible) {
		// clear the display timer if set
		if (!visible && this.state.pendingTooltip) {
			clearTimeout(this.state.pendingTooltip);
		}
		this.setState({
			showToolTip: visible,
			pendingTooltip: null
		});
		// updates the tooltip display
		var tooltip = document.getElementById(this.props.id);
		var tooltipTrigger = document.getElementById(this.props.id + "-trigger");
		if (tooltipTrigger && tooltip && visible) {
			this.updateTooltipLayout(tooltip, tooltipTrigger);
		}
	}

	showTooltipWithDelay() {
		// set a delay on displaying the tooltip
		if (!this.state.pendingTooltip) {
			const that = this;
			const delay = this.props.delay ? this.props.delay : 1000;
			this.setState({
				pendingTooltip: setTimeout(function() {
					that.setTooltipVisible(true);
				}, delay)
			});
		}

	}

	updateTooltipLayout(tooltip, tooltipTrigger) {
		const tooltipDirection = tooltip.getAttribute("direction");
		const tooltipWidth = tooltip.offsetWidth;
		const tooltipHeight = tooltip.offsetHeight;
		const viewPortWidth = document.documentElement.clientWidth;
		const viewPortHeight = document.documentElement.clientHeight;
		const triggerLayout = tooltipTrigger.getBoundingClientRect();
		const pointer = tooltip.querySelector("svg");
		const pointerLayout = pointer.getBoundingClientRect();
		const pointerCorrection = 1;

		// tooltip - left correction
		if (tooltipDirection === "top" || tooltipDirection === "bottom") {
			var tooltipLeft = triggerLayout.left;
			if ((viewPortWidth - tooltipWidth) < triggerLayout.left) {
				tooltipLeft = viewPortWidth - tooltipWidth; // hitting right border
			} else if (tooltipWidth > triggerLayout.width) {
				tooltipLeft -= (tooltipWidth - triggerLayout.width) / 2; // distribute overlap evenly left and right
				if (tooltipLeft < 0) {
					tooltipLeft = triggerLayout.left; // hitting left border
				}
			} else if (tooltipWidth < triggerLayout.width) {
				tooltipLeft += (triggerLayout.width - tooltipWidth) / 2; // center tip within triggerLayout
			}
			tooltip.style.left = tooltipLeft + "px";
		} else if (tooltipDirection === "left") {
			tooltip.style.left = (triggerLayout.left - tooltipWidth - pointerLayout.width) + "px";
		} else if (tooltipDirection === "right") {
			tooltip.style.left = (triggerLayout.right + pointerLayout.width) + "px";
		}

		// tooltip - top correction
		if (tooltipDirection === "top") {
			tooltip.style.top = (triggerLayout.top - pointerLayout.height - tooltipHeight) + "px";
		} else if (tooltipDirection === "bottom") {
			tooltip.style.top = (triggerLayout.bottom + pointerLayout.height) + "px";
		} else if (tooltipDirection === "left" || tooltipDirection === "right") {
			var tooltipTop = triggerLayout.top;
			if ((viewPortHeight - tooltipHeight) < triggerLayout.top) {
				tooltipTop = viewPortHeight - tooltipHeight; // hitting bottom border
			} else if (tooltipHeight > triggerLayout.height) {
				tooltipTop -= (tooltipHeight - triggerLayout.height) / 2; // distribute overlap evenly top and bottom
				if (tooltipTop < 0) {
					tooltipTop = triggerLayout.top; // hitting top border
				}
			} else if (tooltipHeight < triggerLayout.height) {
				tooltipTop += (triggerLayout.height - tooltipHeight) / 2; // center tip within triggerLayout
			}
			tooltip.style.top = tooltipTop + pointerCorrection + "px";
		}

		// pointer - left correction
		if (tooltipDirection === "top" || tooltipDirection === "bottom") {
			pointer.style.left = (triggerLayout.left - tooltip.getBoundingClientRect().left +
				tooltipTrigger.offsetWidth / 2 - pointerLayout.width / 2	 + pointerCorrection) + "px";
		} else if (tooltipDirection === "left") {
			pointer.style.left = (tooltipWidth - 3) + "px";
		} else if (tooltipDirection === "right") {
			pointer.style.left = (-pointerLayout.width + 2) + "px";
		}

		// pointer - top correction
		if (tooltipDirection === "top") {
			pointer.style.top = (tooltipHeight - 5) + "px";
		} else if (tooltipDirection === "bottom") {
			pointer.style.top = "-11px";
		} else if (tooltipDirection === "left" || tooltipDirection === "right") {
			pointer.style.top = (triggerLayout.top - tooltip.getBoundingClientRect().top +
				tooltipTrigger.offsetHeight / 2 - pointerLayout.height / 2) + "px";
		}
	}

	render() {
		const mouseover = () => this.showTooltipWithDelay();
		const mouseleave = () => this.setTooltipVisible(false);
		const mousedown = () => this.setTooltipVisible(false);
		const style = {};
		if (this.props.disable) {
			style.display = "none";
		}
		var tooltipContent = null;
		if ((typeof this.props.tip) === "string") {
			tooltipContent = (
				<span id="tooltipContainer">
					{this.props.tip}
				</span>
			);
		} else if ((typeof this.props.tip) === "object") {
			tooltipContent = (
				<div id="tooltipContainer">
					{this.props.tip}
				</div>
			);
		}
		const direction = this.props.direction ? this.props.direction : "bottom";

		return (
			<div>
				<div id={this.props.id + "-trigger"} onMouseOver={mouseover} onMouseLeave={mouseleave} onMouseDown={mousedown}>
					{this.props.children}
				</div>
				<div id={this.props.id} className="common-canvas_tooltip" style={style} aria-hidden={!this.state.showToolTip} direction={direction}>
					<svg x="0px" y="0px" viewBox="0 0 9.1 16.1">
						<polyline points="9.1,15.7 1.4,8.1 9.1,0.5" />
						<polygon points="8.1,16.1 0,8.1 8.1,0 8.1,1.4 1.4,8.1 8.1,14.7" />
					</svg>
					{tooltipContent}
				</div>
			</div>
		);
	}
}

ToolTip.propTypes = {
	tip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
	direction: PropTypes.oneOf(["left", "right", "top", "bottom"]),
	children: PropTypes.element,
	id: PropTypes.string.isRequired,
	disable: PropTypes.bool,
	delay: PropTypes.number
};

export default ToolTip;
