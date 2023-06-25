/*
 * Copyright 2023 Elyra Authors
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
import { genElementByClass, genRectByClass } from "./toolbar-utils.js";

class ToolbarSubArea extends React.Component {
	componentDidMount() {
		if (this.props.containingDivId) {
			this.adjustSubAreaPosition();
		}
	}

	// Adjust the position of the sub-area to make sure it doesn't extend
	// outside the containing divs boundary. We need to do this after the subarea
	// has been mounted so we can query its size and position.
	adjustSubAreaPosition() {
		const containingDiv = document.getElementById(this.props.containingDivId);
		const containingDivRect = containingDiv.getBoundingClientRect();

		const classToGet = this.props.actionObj.subPanel ? "subpanel" : "submenu";

		const thisArea = genElementByClass(classToGet, containingDiv);
		const thisAreaRect = genRectByClass(classToGet, containingDiv);

		const outsideBottom = thisAreaRect.bottom - containingDivRect.bottom;
		if (outsideBottom > 0) {
			const newTop = thisAreaRect.top - outsideBottom - 2;
			thisArea.style.top = newTop + "px";
		}

		const outsideRight = thisAreaRect.right - containingDivRect.right;
		if (outsideRight > 0) {
			const newLeft = this.props.parentItemRect.left - thisAreaRect.width;
			thisArea.style.left = newLeft + "px";
		}
	}

	generateSubAreaStyle() {
		const style = {
			top: this.props.parentItemRect.top - 1,
			left: this.props.parentItemRect.left + this.props.parentItemRect.width
		};
		return style;
	}

	render() {
		const style = this.generateSubAreaStyle();

		if (this.props.actionObj.subPanel) {
			return (
				<div style={style} className={"toolbar-popover-list subpanel"}>
					{this.props.actionObj.subPanel}
				</div>
			);
		}
		const subMenuItems = this.props.generateToolbarItems(this.props.actionObj.subMenu, true, false);

		return (
			<div style={style} className={"toolbar-popover-list submenu"}>
				{subMenuItems}
			</div>
		);
	}
}

ToolbarSubArea.propTypes = {
	actionObj: PropTypes.object.isRequired,
	generateToolbarItems: PropTypes.func.isRequired,
	parentItemRect: PropTypes.object.isRequired,
	containingDivId: PropTypes.string
};

export default ToolbarSubArea;
