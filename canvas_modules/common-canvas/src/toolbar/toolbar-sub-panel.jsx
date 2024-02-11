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

import { adjustSubAreaPosition, generateSubAreaStyle } from "./toolbar-sub-utils.js";

const ESC_KEY = 27;

class ToolbarSubPanel extends React.Component {
	constructor(props) {
		super(props);

		this.areaRef = React.createRef();

		this.onClick = this.onClick.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	componentDidMount() {
		if (this.props.containingDivId) {
			adjustSubAreaPosition(this.areaRef,
				this.props.containingDivId, this.props.expandDirection, this.props.actionItemRect);
		}
	}

	onClick() {
		this.props.closeSubArea();
	}

	onKeyDown(evt) {
		if (evt.keyCode === ESC_KEY) {
			this.props.closeSubArea();
			evt.stopPropagation();
		}
	}

	render() {
		const style = generateSubAreaStyle(this.props.expandDirection, this.props.actionItemRect);

		if (this.props.subPanel) {
			const subPanel = typeof this.props.subPanel === "object"
				? this.props.subPanel
				: (<this.props.subPanel closeSubPanel={this.props.closeSubArea} subPanelData={this.props.subPanelData} />);

			return (
				<div ref={this.areaRef} style={style} className={"toolbar-popover-list subpanel"} onClick={this.onClick} onKeyDown={this.onKeyDown}>
					{subPanel}
				</div>
			);
		}

		return null;
	}
}

ToolbarSubPanel.propTypes = {
	subPanel: PropTypes.any,
	subPanelData: PropTypes.object,
	closeSubArea: PropTypes.func,
	setToolbarFocus: PropTypes.func,
	actionItemRect: PropTypes.object.isRequired,
	expandDirection: PropTypes.string.isRequired,
	containingDivId: PropTypes.string
};

export default ToolbarSubPanel;
