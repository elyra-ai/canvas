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
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
	}

	componentDidMount() {
		if (this.props.containingDivId) {
			this.adjustSubAreaPosition();
		}
	}

	// If we are given a closeSubArea function then call it. We will only have
	// such a function if the user has specified the closeSubAreaOnClick prop for
	// the parent action AND provided the user has not stopped event propogation.
	onClick() {
		if (this.props.closeSubArea) {
			this.props.closeSubArea();
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
		const outsideRight = thisAreaRect.right - containingDivRect.right;

		if (this.props.expandDirection === "vertical") {
			if (outsideBottom > 0) {
				const newTop = this.props.actionItemRect.top - thisAreaRect.height;
				thisArea.style.top = newTop + "px";
			}

			if (outsideRight > 0) {
				const newLeft = this.props.actionItemRect.left - outsideRight - 2;
				thisArea.style.left = newLeft + "px";
			}

		} else {
			if (outsideBottom > 0) {
				const newTop = thisAreaRect.top - outsideBottom - 2;
				thisArea.style.top = newTop + "px";
			}

			if (outsideRight > 0) {
				const newLeft = this.props.actionItemRect.left - thisAreaRect.width;
				thisArea.style.left = newLeft + "px";
			}
		}
	}

	generateSubAreaStyle() {
		if (this.props.expandDirection === "vertical") {
			return {
				top: this.props.actionItemRect.bottom,
				left: this.props.actionItemRect.left
			};
		}
		return {
			top: this.props.actionItemRect.top - 1,
			left: this.props.actionItemRect.left + this.props.actionItemRect.width
		};
	}

	render() {
		const style = this.generateSubAreaStyle();

		if (this.props.actionObj.subPanel) {
			return (
				<div style={style} className={"toolbar-popover-list subpanel"} onClick={this.onClick}>
					{this.props.actionObj.subPanel}
				</div>
			);
		} else if (this.props.actionObj.subMenu) {
			const subMenuItems = this.props.generateToolbarItems(this.props.actionObj.subMenu, true, false);

			return (
				<div style={style} className={"toolbar-popover-list submenu"} onClick={this.onClick}>
					{subMenuItems}
				</div>
			);
		}
		return null;
	}
}

ToolbarSubArea.propTypes = {
	actionObj: PropTypes.object.isRequired,
	generateToolbarItems: PropTypes.func.isRequired,
	closeSubArea: PropTypes.func,
	actionItemRect: PropTypes.object.isRequired,
	expandDirection: PropTypes.string.isRequired,
	containingDivId: PropTypes.string
};

export default ToolbarSubArea;
