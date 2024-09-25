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
/*
	This code is a modified version from portal-common-api for the Elyra canvas tooltips
*/

import React from "react";
import PropTypes from "prop-types";
import { Portal } from "react-portal";
import { Link } from "@carbon/react";
import { v4 as uuid4 } from "uuid";

class ToolTip extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isTooltipVisible: false
		};
		this.uuid = uuid4();
		this.pendingTooltip = null;
		this.hideTooltipOnScrollAndResize = this.hideTooltipOnScrollAndResize.bind(this);
		this.tabKeyPressed = false;
		// Tooltip should not close if link inside tooltip is clicked.
		this.linkClicked = false;
		this.inTooltip = false; // A boolean variable that determines if the cursor is over the tooltip
	}

	componentDidMount() {
		window.addEventListener("scroll", this.hideTooltipOnScrollAndResize, true);
		window.addEventListener("resize", this.hideTooltipOnScrollAndResize, true);
		if (this.props.targetObj) {
			this.setTooltipVisible(true);
		}
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", this.hideTooltipOnScrollAndResize, true);
		window.removeEventListener("resize", this.hideTooltipOnScrollAndResize, true);
		if (this.pendingTooltip) {
			clearTimeout(this.pendingTooltip);
		}
	}

	setTooltipVisible(visible) {
		// clear the display timer if set
		if (!this.showTooltip() || (!visible && this.pendingTooltip)) {
			clearTimeout(this.pendingTooltip);
			this.pendingTooltip = null;
			this.setState({
				isTooltipVisible: false
			});
		}


		if (this.showTooltip()) {
			const tooltip = document.querySelector(`[data-id='${this.uuid}-${this.props.id}']`);
			this.pendingTooltip = null;
			this.setState({
				isTooltipVisible: visible
			});
			// updates the tooltip display
			if (visible) {
				let tooltipTrigger = null;
				if (this.props.targetObj) {
					tooltipTrigger = this.props.targetObj;
				} else {
					tooltipTrigger = document.querySelector(`[data-id='${this.uuid}-${this.props.id}-trigger']`);
				}
				if (tooltipTrigger && tooltip) {
					this.updateTooltipLayout(tooltip, tooltipTrigger, tooltip.getAttribute("direction"));
				}

				const linkElement = this.targetRef?.querySelector("a");

				// Focus on link when tooltip with link is opened
				if (linkElement) {
					linkElement.focus();
				}
			}
		}
	}

	setKeyPressed(evt) {
		if (evt.key === "Tab") {
			this.tabKeyPressed = true;
		}
		if (evt.key === "Escape") {
			this.triggerRef.focus();
			this.setTooltipVisible(false);
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

	showTooltip() {
		const canDisplayFullText = this.canDisplayFullText(this.triggerRef);
		const showToolTip = (
			// show tooltip if not disabled and showToolTipIfTruncated is false
			(!this.props.disable && !this.props.showToolTipIfTruncated) ||
			// show tooltip if not disabled and showToolTipIfTruncated is true and string is truncated
			(!this.props.disable && this.props.showToolTipIfTruncated && !canDisplayFullText));
		return showToolTip;
	}

	// Return true if the string can be displayed in the available space
	// Return false if the string is truncated and ellipsis is shown on the UI
	// (offsetWidth) is a measurement in pixels of the element's CSS width, including any borders, padding, and vertical scrollbars
	// (scrollWidth) value is equal to the minimum width the element would require
	//  in order to fit all the content in the viewport without using a horizontal scrollbar
	canDisplayFullText(elem) {
		const triggerElem = this.props.truncatedRef ? this.props.truncatedRef : elem;
		if (triggerElem) {
			const fullWidth = triggerElem.firstChild && triggerElem.firstChild.scrollWidth && triggerElem.firstChild.scrollWidth !== 0 ? triggerElem.firstChild.scrollWidth
				: triggerElem.scrollWidth;
			const childWidth = triggerElem.firstChild && triggerElem.firstChild.offsetWidth && triggerElem.firstChild.offsetWidth || 0;
			// need different handling when content is within a span vs div
			const displayWidth = childWidth !== 0 && childWidth < triggerElem.offsetWidth ? childWidth : triggerElem.offsetWidth;
			const canDisplayFullText = fullWidth <= displayWidth;
			return canDisplayFullText;
		}
		return false; // Show tooltip if we cannot read the width (Canvas objects)
	}

	showTooltipWithDelay() {

		// set a delay on displaying the tooltip
		if (!this.pendingTooltip && this.showTooltip()) {
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
				// For long tooltips, tooltip.offsetWidth is updated after setting tooltip.style.left. Ensure tooltip doesn't overlap tooltipTrigger element.
				while ((tooltip.offsetLeft + tooltip.offsetWidth + pointerLayout.width) > Math.round(triggerLayout.left)) {
					tooltip.style.left = this.getStyleValue(triggerLayout.left - tooltip.offsetWidth - pointerLayout.width);
				}
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
				if (tooltip.offsetHeight > triggerLayout.height) {
					tooltipTop -= (tooltip.offsetHeight - triggerLayout.height) / 2; // distribute overlap evenly top and bottom
					if (tooltipTop < 0) {
						tooltipTop = triggerLayout.top; // hitting top border
					}
				} else if (tooltip.offsetHeight < triggerLayout.height) {
					tooltipTop += (triggerLayout.height - tooltip.offsetHeight) / 2; // center tip within triggerLayout
				}
				tooltip.style.top = this.getStyleValue(tooltipTop + pointerCorrection);
				if ((viewPortHeight - tooltip.offsetHeight) < triggerLayout.top) {
					tooltip.style.top = this.getStyleValue(viewPortHeight - tooltip.offsetHeight); // hitting bottom border
				}
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

	toggleTooltipOnClick(evt) {
		// 'blur' event occurs before 'click' event. Because of this, onBlur function is called which hides the tooltip.
		// To prevent this default behavior, stopPropagation and preventDefault is used.
		evt.stopPropagation();
		evt.preventDefault();

		// When tooltip with link is closed and another tooltip is opened newly opened tooltip should have focus.
		this.triggerRef.focus();
		if (this.state.isTooltipVisible) {
			// Tooltip is visible and user clicks on trigger element again, hide tooltip
			this.setTooltipVisible(false);
		} else {
			this.setTooltipVisible(true);
		}
	}

	hideTooltipOnScrollAndResize(evt) {
		if (this.state.isTooltipVisible && !this.linkClicked) {
			this.setTooltipVisible(false);
		}
	}

	render() {
		let tooltipContent = null;
		let triggerContent = null;
		if (this.props.children) {
			// when children are passed in, tooltip will handle show/hide, otherwise consumer has to hide show/hide tooltip
			const mouseover = () => this.setTooltipVisible(true);
			let mouseleave;
			if (this.props.hoverable) {
				mouseleave = () => {
					setTimeout(() => {
						if (!this.inTooltip) {
							this.setTooltipVisible(false);
						}
					}, 100);
				};
			} else {
				mouseleave = () => this.setTooltipVisible(false);
			}
			const mousedown = () => this.setTooltipVisible(false);
			// `focus` event occurs before `click`. Adding timeout in onFocus function to ensure click is executed first.
			// Ref - https://stackoverflow.com/a/49512400
			const onKeyDown = (evt) => this.setKeyPressed(evt);
			const onFocus = () => this.showTooltipWithDelay();
			const onBlur = (evt) => {
				// Close the tooltip if tab is click
				if (this.tabKeyPressed) {
					this.setTooltipVisible(false);
					this.tabKeyPressed = false;
				} else {
					// Check if evt.relatedTarget is a child of .common-canvas-tooltip to set tooltip visible when clicked on link
					const el = evt?.relatedTarget?.closest(".common-canvas-tooltip");
					if (el?.tagName?.toLowerCase() === "div") {
						this.setTooltipVisible(true);
					} else {
						// Close the tooltip if evt.relatedTarget is not a child of .common-canvas-tooltip
						this.setTooltipVisible(false);
					}
				}
			};
			const click = (evt) => this.toggleTooltipOnClick(evt);

			triggerContent = (<div
				data-id={`${this.uuid}-${this.props.id}-trigger`}
				className="tooltip-trigger"
				onMouseOver={!this.props.showToolTipOnClick ? mouseover : null}
				onMouseLeave={!this.props.showToolTipOnClick ? mouseleave : null}
				onMouseDown={!this.props.showToolTipOnClick ? mousedown : null}
				onClick={this.props.showToolTipOnClick ? click : null}
				onFocus={this.props.showToolTipOnClick ? onFocus : null} // When focused using keyboard
				onBlur={this.props.showToolTipOnClick ? onBlur : null}
				onKeyDown={this.props.showToolTipOnClick ? onKeyDown : null}
				tabIndex={this.props.showToolTipOnClick ? 0 : null}
				role={this.props.showToolTipOnClick ? "button" : null}
				aria-labelledby={this.props.showToolTipOnClick ? `${this.uuid}-${this.props.id}` : null}
				aria-expanded={this.props.showToolTipOnClick ? this.state.isTooltipVisible : null}
				aria-controls={this.props.showToolTipOnClick ? `${this.uuid}-${this.props.id}` : null}
				ref={(ref) => (this.triggerRef = ref)}
			>
				{this.props.children}
			</div>);
		}

		if ((typeof this.props.tip) === "string") {
			tooltipContent = (
				<span className="tooltipContainer">
					{this.props.tip}
				</span>
			);
		} else if ((typeof this.props.tip) === "object") {
			tooltipContent = (
				<div className="tooltipContainer">
					{this.props.tip}
				</div>
			);
		} else if ((typeof this.props.tip) === "function") {
			tooltipContent = this.props.tip();
		}

		let tipClass = "common-canvas-tooltip";
		if (this.props.className) {
			tipClass += " " + this.props.className;
		}
		this.linkClicked = false;
		let link = null;
		if (this.state.isTooltipVisible && this.props.tooltipLinkHandler && this.props.link) {
			const linkInformation = this.props.tooltipLinkHandler(this.props.link);
			// Verify tooltipLinkHandler returns object in correct format
			if (typeof linkInformation === "object" && linkInformation.label && linkInformation.url) {
				link = (<div
					ref={(ref) => (this.linkRef = ref)}
					onKeyDown={(evt) => {
						evt.stopPropagation();
						evt.preventDefault();

						// When 'Esc' is pressed shift the focus to tooltip icon so that user can navigate following elements.
						if (evt.key === "Escape") {
							this.triggerRef.focus();
							this.setTooltipVisible(false);
						} else if (evt.key === "Enter") { // Open active/highlighted link when Enter or Return is clicked.
							const focusedElement = this.linkRef.children[0];
							if (focusedElement) {
								window.open(focusedElement, "_blank");
							}
						}
					}}
					onBlur={() => {
						if (this.linkClicked) { // Keep tooltip open when link is clicked
							this.setTooltipVisible(true);
						} else { // Close the tooltip and shift focus to tooltip icon
							this.triggerRef.focus();
							this.linkClicked = false;
							this.setTooltipVisible(false);
						}
					}
					}
					onClick={() => {
						this.linkClicked = true;
					}}
				>
					<Link
						className="tooltip-link"
						id={this.props.link.id}
						href={linkInformation.url}
						target="_blank"
						rel="noopener"
						visited={false}
						onMouseDown={(evt) => {
							evt.preventDefault();
						}}
					>
						{linkInformation.label}
					</Link>
				</div>);
			}
		}

		let tooltip = null;
		if (tooltipContent || link) {
			tooltip = (
				<Portal>
					<div
						role="tooltip"
						id={`${this.uuid}-${this.props.id}`}
						data-id={`${this.uuid}-${this.props.id}`}
						className={tipClass}
						aria-hidden={!this.state.isTooltipVisible}
						direction={this.props.direction}
						ref={(ref) => (this.targetRef = ref)}
						onMouseEnter={() => {
							this.inTooltip = true;
						}}
						onMouseLeave={() => {
							this.inTooltip = false;
							this.setTooltipVisible(false);
						}}
					>
						<svg className="tipArrow" x="0px" y="0px" viewBox="0 0 9.1 16.1">
							<polyline points="9.1,15.7 1.4,8.1 9.1,0.5" />
							<polygon points="8.1,16.1 0,8.1 8.1,0 8.1,1.4 1.4,8.1 8.1,14.7" />
						</svg>
						{tooltipContent}
						{link}
					</div>
				</Portal>
			);
		}

		return (
			<div className="tooltip-container">
				{triggerContent}
				{tooltip}
			</div>
		);
	}
}

ToolTip.propTypes = {
	tip: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.func]).isRequired,
	link: PropTypes.object,
	tooltipLinkHandler: PropTypes.func,
	direction: PropTypes.oneOf(["left", "right", "top", "bottom"]),
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
	targetObj: PropTypes.object,
	id: PropTypes.string.isRequired,
	className: PropTypes.string,
	mousePos: PropTypes.object,
	disable: PropTypes.bool, // Tooltip will not show if disabled
	showToolTipIfTruncated: PropTypes.bool, // Set to true to only display tooltip if full text does not fit in displayable width
	truncatedRef: PropTypes.object,
	delay: PropTypes.number,
	showToolTipOnClick: PropTypes.bool,
	hoverable: PropTypes.bool, // If true, mouse cursor can be hovered over to the tooltip, instead of immediately disappearing.
};

ToolTip.defaultProps = {
	delay: 200,
	direction: "bottom",
	showToolTipIfTruncated: false, // False will always show Tooltip even when whole word can be displayed
	showToolTipOnClick: false,
	hoverable: false
};

export default ToolTip;
