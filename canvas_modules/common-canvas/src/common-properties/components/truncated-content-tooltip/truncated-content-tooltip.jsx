/*
 * Copyright 2017-2021 Elyra Authors
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

	render() {
		const tooltip = (
			<div className="properties-tooltips">
				{String(this.props.tooltipText)}
			</div>
		);
		return (<Tooltip
			id={`${uuid4()}-${this.props.uniqueIdentifier}`}
			tip={tooltip}
			direction="bottom"
			className="properties-tooltips"
			disable={has(this.props, "disabled") ? this.props.disabled : true}
			showToolTipIfTruncated
		>
			{this.props.content}
		</Tooltip>);
	}
}

TruncatedContentTooltip.propTypes = {
	uniqueIdentifier: PropTypes.string.isRequired,
	content: PropTypes.element.isRequired,
	tooltipText: PropTypes.oneOfType([
		PropTypes.string.isRequired,
		PropTypes.number.isRequired,
		PropTypes.bool.isRequired,
		PropTypes.array.isRequired
	]),
	// tooltipText: PropTypes.string.isRequired,
	disabled: PropTypes.bool
};
