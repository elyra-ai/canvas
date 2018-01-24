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
/* eslint complexity: ["error", 26] */
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

	componentDidMount() {
		if (this.props.targetObj) {
			if (this.props.delay === 0) {
				this.setTooltipVisible(true);
			} else {
				this.showTooltipWithDelay();
			}
		}
	}

	componentWillUnmount() {
		if (this.state.pendingTooltip) {
			clearTimeout(this.state.pendingTooltip);
		}
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
		const tooltip = document.getElementById(this.props.id);
		let tooltipTrigger = null;
		if (this.props.targetObj) {
			tooltipTrigger = this.props.targetObj;
		} else {
			tooltipTrigger = document.getElementById(this.props.id + "-trigger");
		}
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
				}, this.props.delay)
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

		if (this.props.mousePos) {
			this.updateLocationBasedOnMousePos(tooltip, this.props.mousePos);
		} else { // tooltip relativ to element
			// tooltip - left correction
			if (tooltipDirection === "top" || tooltipDirection === "bottom") {
				let tooltipLeft = triggerLayout.left;
				if ((viewPortWidth - tooltipWidth) < triggerLayout.left) {
					tooltipLeft = viewPortWidth - tooltipWidth; // hitting right border
				} else if (tooltipWidth > triggerLayout.width) {
					tooltipLeft -= (tooltipWidth - triggerLayout.width) / 2; // distribute overlap evenly left and right
					if (tooltipLeft < 0) {
						tooltipLeft = 2; // hitting left border
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
				let tooltipTop = triggerLayout.top;
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
					tooltipTrigger.getBoundingClientRect().width / 2 - pointerLayout.width / 2	 + pointerCorrection) + "px";
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
	}

	updateLocationBasedOnMousePos(tooltip, mousePos) {
		const tooltipDirection = tooltip.getAttribute("direction");
		const tooltipWidth = tooltip.offsetWidth;
		const tooltipHeight = tooltip.offsetHeight;
		const viewPortWidth = document.documentElement.clientWidth;
		const viewPortHeight = document.documentElement.clientHeight;
		const pointer = tooltip.querySelector("svg");
		const pointerLayout = pointer.getBoundingClientRect();
		const pointerCorrection = 1;

		const mouseX = this.props.mousePos.x;
		const mouseY = this.props.mousePos.y;
		// if mouse position is passed in, use the cursor as reference point

		// tooltip - left correction
		if (tooltipDirection === "top" || tooltipDirection === "bottom") {
			let tooltipLeft = mouseX - tooltipWidth / 2;
			if ((viewPortWidth - tooltipWidth) < tooltipLeft) {
				tooltipLeft = viewPortWidth - tooltipWidth; // hitting right border
			} else if (tooltipLeft < 0) {
				tooltipLeft = 2; // hitting left border
			}
			tooltip.style.left = tooltipLeft + "px";
		} else if (tooltipDirection === "left") {
			tooltip.style.left = (mouseX - tooltipWidth - pointerLayout.width - 5) + "px";
		} else if (tooltipDirection === "right") {
			tooltip.style.left = (mouseX + pointerLayout.width + 5) + "px";
		}

		// tooltip - top correction
		if (tooltipDirection === "top") {
			tooltip.style.top = (mouseY - pointerLayout.height - tooltipHeight) + "px";
		} else if (tooltipDirection === "bottom") {
			tooltip.style.top = (mouseY + 2 * pointerLayout.height) + "px";
		} else if (tooltipDirection === "left" || tooltipDirection === "right") {
			let tooltipTop = mouseY - tooltipHeight / 2;
			if ((viewPortHeight - tooltipHeight) < tooltipTop) {
				tooltipTop = viewPortHeight - tooltipHeight; // hitting bottom border
			} else if (tooltipTop < 0) {
				tooltipTop = 2; // hitting top border
			}
			tooltip.style.top = tooltipTop + pointerCorrection + "px";
		}

		// pointer - left correction
		if (tooltipDirection === "top" || tooltipDirection === "bottom") {
			pointer.style.left = (mouseX - tooltip.getBoundingClientRect().left - pointerLayout.width / 2) + "px";
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
			pointer.style.top = (mouseY - tooltip.getBoundingClientRect().top - pointerLayout.height / 2) + "px";
		}
	}

	render() {
		let tooltipContent = null;
		let triggerContent = null;
		if (this.props.children) {
			// when children are passed in, tooltip will handle show/hide, otherwise consumer has to hide show/hide tooltip
			const mouseover = () => this.showTooltipWithDelay();
			const mouseleave = () => this.setTooltipVisible(false);
			const mousedown = () => this.setTooltipVisible(false);

			triggerContent = (<div id={this.props.id + "-trigger"} onMouseOver={mouseover} onMouseLeave={mouseleave} onMouseDown={mousedown}>
				{this.props.children}
			</div>);
		}

		const style = {};
		if (this.props.disable) {
			style.display = "none";
		}

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

		return (
			<div>
				{triggerContent}
				<div id={this.props.id} className="common-canvas_tooltip" style={style} aria-hidden={!this.state.showToolTip} direction={this.props.direction}>
					<svg id="tipArrow" x="0px" y="0px" viewBox="0 0 9.1 16.1">
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
	targetObj: PropTypes.object,
	id: PropTypes.string.isRequired,
	mousePos: PropTypes.object,
	disable: PropTypes.bool,
	delay: PropTypes.number
};

ToolTip.defaultProps = {
	delay: 1000,
	direction: "bottom"
};

export default ToolTip;
