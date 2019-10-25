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
/*
	This code is a modified version from portal-common-api for the common-canvas toolbar
	https://github.ibm.com/dap/portal-common-api/blob/master/src/js/nav/v2/nav.js
*/

import React from "react";
import PropTypes from "prop-types";
import { Portal } from "react-portal";

class ToolTip extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showToolTip: false
		};

		this.pendingTooltip = null;
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
		if (this.pendingTooltip) {
			clearTimeout(this.pendingTooltip);
		}
	}

	setTooltipVisible(visible) {
		// clear the display timer if set
		if (this.props.disable || (!visible && this.pendingTooltip)) {
			clearTimeout(this.pendingTooltip);
			this.pendingTooltip = null;
			this.setState({
				showToolTip: false
			});
		}


		if (!this.props.disable) {
			const tooltip = document.querySelector("[data-id='" + this.props.id + "']");
			this.pendingTooltip = null;
			this.setState({
				showToolTip: visible
			});
			// updates the tooltip display
			if (visible) {
				let tooltipTrigger = null;
				if (this.props.targetObj) {
					tooltipTrigger = this.props.targetObj;
				} else {
					tooltipTrigger = document.querySelector("[data-id='" + this.props.id + "-trigger']");
				}
				if (tooltipTrigger && tooltip) {
					this.updateTooltipLayout(tooltip, tooltipTrigger, tooltip.getAttribute("direction"));
				}
			}
		}
	}

	getStyleValue(value) {
		return value + "px";
	}

	getNewDirection(currentDirection) {
		let newDirection;
		switch (currentDirection) {
		case "top":
			newDirection = "bottom";
			break;
		case "bottom":
			newDirection = "top";
			break;
		case "left":
			newDirection = "right";
			break;
		default:
			newDirection = "left";
		}
		return newDirection;
	}

	showTooltipWithDelay() {
		// set a delay on displaying the tooltip
		if (!this.pendingTooltip && !this.props.disable) {
			const that = this;
			this.pendingTooltip = setTimeout(function() {
				that.setTooltipVisible(true);
			}, this.props.delay);
		}

	}

	updateTooltipLayout(tooltip, tooltipTrigger, direction) {
		const tooltipDirection = direction;
		const viewPortWidth = document.documentElement.clientWidth;
		const viewPortHeight = document.documentElement.clientHeight;
		const triggerLayout = tooltipTrigger.getBoundingClientRect();
		const pointer = tooltip.querySelector("svg");
		const pointerLayout = pointer.getBoundingClientRect();
		const pointerCorrection = 1;

		// always initialize tooltip location so it's all visible to ensure adjustments are done on the right size
		tooltip.style.left = this.getStyleValue(triggerLayout.left);
		tooltip.style.top = this.getStyleValue(triggerLayout.top);

		if (this.props.mousePos) {
			this.updateLocationBasedOnMousePos(tooltip, this.props.mousePos, direction);
		} else { // tooltip relativ to element
			// tooltip - left correction
			if (tooltipDirection === "top" || tooltipDirection === "bottom") {
				let tooltipLeft = triggerLayout.left;
				if (tooltip.offsetWidth > triggerLayout.width) {
					tooltipLeft -= (tooltip.offsetWidth - triggerLayout.width) / 2; // distribute overlap evenly left and right
					if (tooltipLeft < 0) {
						tooltipLeft = 2; // hitting left border
					}
				} else if (tooltip.offsetWidth < triggerLayout.width) {
					tooltipLeft += (triggerLayout.width - tooltip.offsetWidth) / 2; // center tip within triggerLayout
				}
				tooltip.style.left = this.getStyleValue(tooltipLeft);
				if ((tooltipLeft + tooltip.offsetWidth) > viewPortWidth) {
					tooltip.style.left = this.getStyleValue(viewPortWidth - tooltip.offsetWidth); // hitting right border
				}
			} else if (tooltipDirection === "left") {
				tooltip.style.left = this.getStyleValue(triggerLayout.left - tooltip.offsetWidth - pointerLayout.width);
			} else if (tooltipDirection === "right") {
				tooltip.style.left = this.getStyleValue(triggerLayout.right + pointerLayout.width);
			}

			// tooltip - top correction
			if (tooltipDirection === "top") {
				tooltip.style.top = this.getStyleValue(triggerLayout.top - pointerLayout.height - tooltip.offsetHeight);
			} else if (tooltipDirection === "bottom") {
				tooltip.style.top = this.getStyleValue(triggerLayout.bottom + pointerLayout.height);
			} else if (tooltipDirection === "left" || tooltipDirection === "right") {
				let tooltipTop = triggerLayout.top;
				if ((viewPortHeight - tooltip.offsetHeight) < triggerLayout.top) {
					tooltipTop = viewPortHeight - tooltip.offsetHeight; // hitting bottom border
				} else if (tooltip.offsetHeight > triggerLayout.height) {
					tooltipTop -= (tooltip.offsetHeight - triggerLayout.height) / 2; // distribute overlap evenly top and bottom
					if (tooltipTop < 0) {
						tooltipTop = triggerLayout.top; // hitting top border
					}
				} else if (tooltip.offsetHeight < triggerLayout.height) {
					tooltipTop += (triggerLayout.height - tooltip.offsetHeight) / 2; // center tip within triggerLayout
				}
				tooltip.style.top = this.getStyleValue(tooltipTop + pointerCorrection);
			}

			// pointer - left correction
			if (tooltipDirection === "top" || tooltipDirection === "bottom") {
				pointer.style.left = this.getStyleValue(triggerLayout.left - tooltip.getBoundingClientRect().left +
					tooltipTrigger.getBoundingClientRect().width / 2 - pointerLayout.width / 2	 + pointerCorrection);
			} else if (tooltipDirection === "left") {
				pointer.style.left = this.getStyleValue(tooltip.offsetWidth - 3);
			} else if (tooltipDirection === "right") {
				pointer.style.left = this.getStyleValue(-pointerLayout.width + 2);
			}

			// pointer - top correction
			if (tooltipDirection === "top") {
				pointer.style.top = this.getStyleValue(tooltip.offsetHeight - 5);
			} else if (tooltipDirection === "bottom") {
				pointer.style.top = "-11px";
			} else if (tooltipDirection === "left" || tooltipDirection === "right") {
				pointer.style.top = this.getStyleValue(triggerLayout.top - tooltip.getBoundingClientRect().top +
					tooltipTrigger.offsetHeight / 2 - pointerLayout.height / 2);
			}
		}

		// check if out-of-bounds at the end and if so, trigger new layout on opposite site if not already re-rendered already
		if (this.isOutOfBounds(tooltip) && tooltip.getAttribute("direction") === tooltipDirection) {
			const newDirection = this.getNewDirection(tooltipDirection);
			this.updateTooltipLayout(tooltip, tooltipTrigger, newDirection);
			// update class name directly, otherwise setState triggers re-render loop in canvas
			// also call after updateTooltipLayout, otherwise the newDirection and class of trigger are the same
			tooltip.setAttribute("direction", newDirection);
			return;
		}
	}

	updateLocationBasedOnMousePos(tooltip, mousePos, direction) {
		const tooltipDirection = direction;
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
			let tooltipLeft = mouseX - tooltip.offsetWidth / 2;
			if ((viewPortWidth - tooltip.offsetWidth) < tooltipLeft) {
				tooltipLeft = viewPortWidth - tooltip.offsetWidth; // hitting right border
			} else if (tooltipLeft < 0) {
				tooltipLeft = 2; // hitting left border
			}
			tooltip.style.left = this.getStyleValue(tooltipLeft);
		} else if (tooltipDirection === "left") {
			tooltip.style.left = this.getStyleValue(mouseX - tooltip.offsetWidth - pointerLayout.width - 5);
		} else if (tooltipDirection === "right") {
			tooltip.style.left = this.getStyleValue(mouseX + pointerLayout.width + 5);
		}

		// tooltip - top correction
		if (tooltipDirection === "top") {
			tooltip.style.top = this.getStyleValue(mouseY - pointerLayout.height - tooltip.offsetHeight);
		} else if (tooltipDirection === "bottom") {
			tooltip.style.top = this.getStyleValue(mouseY + 2 * pointerLayout.height);
		} else if (tooltipDirection === "left" || tooltipDirection === "right") {
			let tooltipTop = mouseY - tooltip.offsetHeight / 2;
			if ((viewPortHeight - tooltip.offsetHeight) < tooltipTop) {
				tooltipTop = viewPortHeight - tooltip.offsetHeight; // hitting bottom border
			} else if (tooltipTop < 0) {
				tooltipTop = 2; // hitting top border
			}
			tooltip.style.top = this.getStyleValue(tooltipTop + pointerCorrection);
		}

		// pointer - left correction
		if (tooltipDirection === "top" || tooltipDirection === "bottom") {
			pointer.style.left = this.getStyleValue(mouseX - tooltip.getBoundingClientRect().left - pointerLayout.width / 2);
		} else if (tooltipDirection === "left") {
			pointer.style.left = this.getStyleValue(tooltip.offsetWidth - 3);
		} else if (tooltipDirection === "right") {
			pointer.style.left = this.getStyleValue(-pointerLayout.width + 2);
		}

		// pointer - top correction
		if (tooltipDirection === "top") {
			pointer.style.top = this.getStyleValue(tooltip.offsetHeight - 5);
		} else if (tooltipDirection === "bottom") {
			pointer.style.top = "-11px";
		} else if (tooltipDirection === "left" || tooltipDirection === "right") {
			pointer.style.top = this.getStyleValue(mouseY - tooltip.getBoundingClientRect().top - pointerLayout.height / 2);
		}
	}

	isOutOfBounds(tooltip) {
		const tooltipLeft = parseFloat(tooltip.style.left);
		const tooltipTop = parseFloat(tooltip.style.top);
		return (((tooltipLeft + tooltip.offsetWidth) > document.documentElement.clientWidth) || // to the right
				(tooltipLeft < 0) || // to the left
				(tooltipTop < 0) || // to the top
				((tooltipTop + tooltip.offsetHeight) > document.documentElement.clientHeight)); // to the bottom
	}

	render() {
		let tooltipContent = null;
		let triggerContent = null;
		if (this.props.children) {
			// when children are passed in, tooltip will handle show/hide, otherwise consumer has to hide show/hide tooltip
			const mouseover = () => this.showTooltipWithDelay();
			const mouseleave = () => this.setTooltipVisible(false);
			const mousedown = () => this.setTooltipVisible(false);

			triggerContent = (<div data-id={this.props.id + "-trigger"} className="tooltip-trigger" onMouseOver={mouseover} onMouseLeave={mouseleave} onMouseDown={mousedown}>
				{this.props.children}
			</div>);
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

		let tipClass = "common-canvas-tooltip";
		if (this.props.className) {
			tipClass += " " + this.props.className;
		}

		return (
			<div className="tooltip-container">
				{triggerContent}
				<Portal>
					<div data-id={this.props.id} className={tipClass} aria-hidden={!this.state.showToolTip} direction={this.props.direction}>
						<svg id="tipArrow" x="0px" y="0px" viewBox="0 0 9.1 16.1">
							<polyline points="9.1,15.7 1.4,8.1 9.1,0.5" />
							<polygon points="8.1,16.1 0,8.1 8.1,0 8.1,1.4 1.4,8.1 8.1,14.7" />
						</svg>
						{tooltipContent}
					</div>
				</Portal>
			</div>
		);
	}
}

ToolTip.propTypes = {
	tip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
	direction: PropTypes.oneOf(["left", "right", "top", "bottom"]),
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
	targetObj: PropTypes.object,
	id: PropTypes.string.isRequired,
	className: PropTypes.string,
	mousePos: PropTypes.object,
	disable: PropTypes.bool,
	delay: PropTypes.number
};

ToolTip.defaultProps = {
	delay: 1000,
	direction: "bottom"
};

export default ToolTip;
