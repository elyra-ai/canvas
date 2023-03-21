/*
 * Copyright 2017-2022 Elyra Authors
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
import { v4 as uuid4 } from "uuid";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { has } from "lodash";

// Reusable component to show tooltip if the content is truncated
export default class TruncatedContentTooltip extends React.Component {
	// Return true if the string can be displayed in the available space
	// Return false if the string is truncated and ellipsis is shown on the UI
	// (offsetWidth) is a measurement in pixels of the element's CSS width, including any borders, padding, and vertical scrollbars
	// (scrollWidth) value is equal to the minimum width the element would require
	//  in order to fit all the content in the viewport without using a horizontal scrollbar
	canDisplayFullText(elem) {
		if (elem) {
			const firstChildWidth = elem.firstChild && elem.firstChild.scrollWidth ? elem.firstChild.scrollWidth : 0;
			const displayWidth = elem.offsetWidth;
			let fullWidth = firstChildWidth;
			if (firstChildWidth === 0) {
				fullWidth = elem.scrollWidth;
			}
			const canDisplayFullText = fullWidth <= displayWidth;
			return canDisplayFullText;
		}
		return false; // Show tooltip if we cannot read the width (Canvas objects)
	}

	render() {
		const canDisplayFullText = this.canDisplayFullText(this.props.truncatElem);
		let tooltipText = this.props.tooltipText;
		if (typeof this.props.tooltipText !== "object") {
			tooltipText = String(this.props.tooltipText);
		}
		const tooltip = (
			<div className="properties-tooltips">
				{tooltipText}
			</div>
		);
		return (
			<div className="properties-truncated-tooltip">
				{(!canDisplayFullText)
					?	<Tooltip
						id={`${uuid4()}-properties`}
						tip={tooltip}
						direction="bottom"
						className="properties-tooltips"
						disable={has(this.props, "disabled") ? this.props.disabled : true}
						showToolTipIfTruncated
						truncatElem={this.props.truncatElem}
					>
						{this.props.content}
					</Tooltip>
					: <>
						{this.props.content}
					</>}
			</div>
		);
	}
}

TruncatedContentTooltip.propTypes = {
	content: PropTypes.element.isRequired,
	truncatElem: PropTypes.truncatElem,
	tooltipText: PropTypes.oneOfType([
		PropTypes.string.isRequired,
		PropTypes.object.isRequired,
		PropTypes.number.isRequired,
		PropTypes.bool.isRequired,
		PropTypes.array.isRequired
	]),
	disabled: PropTypes.bool
};
