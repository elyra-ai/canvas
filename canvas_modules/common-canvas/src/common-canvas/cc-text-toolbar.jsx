/*
 * Copyright 2022 Elyra Authors
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
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import defaultMessages from "../../locales/common-canvas/locales/en.json";
import defaultToolbarMessages from "../../locales/toolbar/locales/en.json";
import Toolbar from "../toolbar/toolbar.jsx";
import Logger from "../logging/canvas-logger.js";
import { Code32, ListBulleted32, ListNumbered32, TextBold32, TextItalic32, TextStrikethrough32 } from "@carbon/icons-react";

class CommonCanvasTextToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.getLabel = this.getLabel.bind(this);
		this.logger = new Logger("CC-Toolbar");
	}

	getLabel(labelId, substituteObj) {
		const defaultMessage = defaultMessages[labelId] ? defaultMessages[labelId] : defaultToolbarMessages[labelId];
		return this.props.intl.formatMessage({ id: labelId, defaultMessage: defaultMessage }, substituteObj);
	}

	getTextToolbar() {
		return {
			leftBar: [
				{ action: "bold", label: "Bold", enable: true, iconEnabled: (<TextBold32 />) },
				{ action: "italics", label: "Italics", enable: true, iconEnabled: (<TextItalic32 />) },
				{ action: "strikethrough", label: "Strikethrough", enable: true, iconEnabled: (<TextStrikethrough32 />) },
				{ divider: true },
				{ action: "code", label: "Code", enable: true, iconEnabled: (<Code32 />) },
				{ divider: true },
				{ action: "bulletedList", label: "Bulleted List", enable: true, iconEnabled: (<ListBulleted32 />) },
				{ action: "numberedList", label: "Numbered List", enable: true, iconEnabled: (<ListNumbered32 />) }
			]
		};
	}

	render() {
		this.logger.log("render");

		let textToolbar = null;

		if (this.props.isOpen) {
			textToolbar = (
				<div className={"text-toolbar"} style={{ left: this.props.pos_x, top: this.props.pos_y }}>
					<Toolbar
						config={this.getTextToolbar()}
						instanceId={this.props.canvasController.getInstanceId()}
						toolbarActionHandler={this.props.actionHandler}
						tooltipDirection={"top"}
					/>
				</div>
			);
		}

		return textToolbar;
	}
}

CommonCanvasTextToolbar.propTypes = {
	// Provided by CommonCanvas
	intl: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,

	// Provided by redux
	isOpen: PropTypes.bool.isRequired,
	pos_x: PropTypes.number,
	pos_y: PropTypes.number,
	actionHandler: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
	isOpen: state.texttoolbar.isOpen,
	pos_x: state.texttoolbar.pos_x,
	pos_y: state.texttoolbar.pos_y,
	actionHandler: state.texttoolbar.actionHandler
});

// const mapStateToProps = (state, ownProps) => {
// 	console.log(state);
// 	return {
// 		isOpen: state.texttoolbar.isOpen,
// 		pos_x: state.texttoolbar.pos_x,
// 		pos_y: state.texttoolbar.pos_y,
// 		actionHandler: state.texttoolbar.actionHandler
// 	};
// };

export default connect(mapStateToProps)(injectIntl(CommonCanvasTextToolbar));
