/*
 * Copyright 2024 Elyra Authors
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

		this.onKeyDown = this.onKeyDown.bind(this);
		this.closeSubPanel = this.closeSubPanel.bind(this);
	}

	componentDidMount() {
		if (this.props.containingDivId) {
			adjustSubAreaPosition(this.areaRef,
				this.props.containingDivId, this.props.expandDirection, this.props.actionItemRect);
		}
	}

	onKeyDown(evt) {
		if (evt.keyCode === ESC_KEY) {
			this.props.closeSubArea();
			evt.stopPropagation();
		}
	}

	// If the user clicks the panel background, by default focus would go
	// through to the toolbar and focus would be lost from this sub-panel.
	// This method prevents any focus event going through to the toolbar.
	onFocus(evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}

	closeSubPanel(evt) {
		this.props.closeSubArea(); // Don't pass a paremeter otherwise it will check closeSubAreaOnClick.
	}

	render() {
		const style = generateSubAreaStyle(this.props.expandDirection, this.props.actionItemRect);

		if (this.props.subPanel) {
			return (
				<div ref={(ref) => (this.areaRef = ref)} style={style} className={"toolbar-popover-list subpanel"} tabIndex={-1}
					onKeyDown={this.onKeyDown} onFocus={this.onFocus}
				>
					<this.props.subPanel closeSubPanel={this.closeSubPanel} subPanelData={this.props.subPanelData} />
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
	setToolbarFocusAction: PropTypes.func,
	actionItemRect: PropTypes.object.isRequired,
	expandDirection: PropTypes.string.isRequired,
	containingDivId: PropTypes.string
};

export default ToolbarSubPanel;
