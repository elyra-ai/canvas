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
			this.setState({
				pendingTooltip: setTimeout(function() {
					that.setTooltipVisible(true);
				}, 1000)
			});
		}

	}

	updateTooltipLayout(tooltip, tooltipTrigger) {
		var textWidth = tooltip.querySelector("span").offsetWidth;
		var tooltipStyle = getComputedStyle(tooltip);
		var horizontalPadding = parseFloat(tooltipStyle.paddingLeft) +
				parseFloat(tooltipStyle.paddingRight);
		var tooltipCorrection = 3;
		var tooltipWidth = textWidth + horizontalPadding + tooltipCorrection;
		tooltip.style.width = tooltipWidth + "px";

		var viewportMargin = 5;
		var rightViewportMargin = document.documentElement.clientWidth - viewportMargin;
		var triggerLayout = tooltipTrigger.getBoundingClientRect();
		var tooltipLeft = Math.min(triggerLayout.left, rightViewportMargin - tooltipWidth);
		if (tooltipWidth < triggerLayout.width) {
			tooltipLeft += (triggerLayout.width - tooltipWidth) / 2;
		}
		tooltip.style.left = Math.max(tooltipLeft, viewportMargin) + "px";

		var pointer = tooltip.querySelector("svg");
		var pointerLayout = pointer.getBoundingClientRect();
		tooltip.style.top = (triggerLayout.bottom + pointerLayout.height) + "px";

		var pointerCorrection = 1;
		pointer.style.left = (triggerLayout.left - tooltip.getBoundingClientRect().left +
				tooltipTrigger.offsetWidth / 2 - pointerLayout.width / 2	 + pointerCorrection) + "px";
	}

	render() {
		const mouseover = () => this.showTooltipWithDelay();
		const mouseleave = () => this.setTooltipVisible(false);
		const mousedown = () => this.setTooltipVisible(false);
		const style = {};
		if (this.props.disable) {
			style.display = "none";
		}
		return (
			<div>
				<div id={this.props.id + "-trigger"} onMouseOver={mouseover} onMouseLeave={mouseleave} onMouseDown={mousedown}>
					{this.props.children}
				</div>
				<div id={this.props.id} className="common-canvas_tooltip" style={style} aria-hidden={!this.state.showToolTip}>
					<svg x="0px" y="0px" viewBox="0 0 9.1 16.1">
						<polyline points="9.1,15.7 1.4,8.1 9.1,0.5" />
						<polygon points="8.1,16.1 0,8.1 8.1,0 8.1,1.4 1.4,8.1 8.1,14.7" />
					</svg>
					<span>
						{this.props.tip}
					</span>
				</div>
			</div>
		);
	}
}

ToolTip.propTypes = {
	tip: PropTypes.string.isRequired,
	children: PropTypes.element,
	id: PropTypes.string.isRequired,
	disable: PropTypes.bool
};

export default ToolTip;
