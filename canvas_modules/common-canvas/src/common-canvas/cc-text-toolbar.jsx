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

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import defaultMessages from "../../locales/common-canvas/locales/en.json";
import defaultToolbarMessages from "../../locales/toolbar/locales/en.json";
import Toolbar from "../toolbar/toolbar.jsx";
import CanvasUtils from "../common-canvas/common-canvas-utils.js";
import Logger from "../logging/canvas-logger.js";
import { Code, Link, ListBulleted, ListNumbered, TextIndentMore,
	TextBold, TextItalic, TextScale, TextStrikethrough } from "@carbon/react/icons";

class CommonCanvasTextToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.getLabel = this.getLabel.bind(this);
		this.logger = new Logger("CC-Text-Toolbar");
	}

	getLabel(labelId, substituteObj) {
		const defaultMessage = defaultMessages[labelId] ? defaultMessages[labelId] : defaultToolbarMessages[labelId];
		return this.props.intl.formatMessage({ id: labelId, defaultMessage: defaultMessage }, substituteObj);
	}

	getJsxLabel(key, shortcutSuffix, shortcutSuffix2) {
		const osKey = CanvasUtils.isMacintosh() ? "⌘" : "Ctrl";
		const shortCut = shortcutSuffix ? (osKey + " + " + shortcutSuffix) : null;
		const shortCut2 = shortcutSuffix2 ? (osKey + " + " + shortcutSuffix2) : null;
		return (
			<div>
				{this.getLabel(key)}<br />{shortCut}<br />{shortCut2}
			</div>
		);
	}

	getTextToolbar() {
		const headerLabel = this.getJsxLabel("texttoolbar.headerAction", ">", "<");
		const boldLabel = this.getJsxLabel("texttoolbar.boldAction", "b");
		const italicsLabel = this.getJsxLabel("texttoolbar.italicsAction", "i");
		const strikethroughLabel = this.getJsxLabel("texttoolbar.strikethroughAction", "shift + x");
		const codeLabel = this.getJsxLabel("texttoolbar.codeAction", "e");
		const linkLabel = this.getJsxLabel("texttoolbar.linkAction", "k");
		const quoteLabel = this.getJsxLabel("texttoolbar.quoteAction", "shift + >");
		const numberedListLabel = this.getJsxLabel("texttoolbar.numberedListAction", "shift + 7");
		const bulletedListLabel = this.getJsxLabel("texttoolbar.bulletedListAction", "shift + 8");

		const headerOptions = [
			{ action: "title", label: this.getLabel("texttoolbar.titleAction"), enable: true },
			{ action: "header", label: this.getLabel("texttoolbar.headerAction"), enable: true },
			{ action: "subheader", label: this.getLabel("texttoolbar.subheaderAction"), enable: true },
			{ action: "body", label: this.getLabel("texttoolbar.bodyAction"), enable: true }
		];

		return {
			leftBar: [
				{ action: "headerStyle", tooltip: headerLabel, enable: true, subMenu: headerOptions, closeSubAreaOnClick: true, iconEnabled: (<TextScale size={32} />) },
				{ divider: true },
				{ action: "bold", label: boldLabel, enable: true, iconEnabled: (<TextBold size={32} />) },
				{ action: "italics", label: italicsLabel, enable: true, iconEnabled: (<TextItalic size={32} />) },
				{ action: "strikethrough", label: strikethroughLabel, enable: true, iconEnabled: (<TextStrikethrough size={32} />) },
				{ divider: true },
				{ action: "code", label: codeLabel, enable: true, iconEnabled: (<Code size={32} />) },
				{ divider: true },
				{ action: "link", label: linkLabel, enable: true, iconEnabled: (<Link size={32} />) },
				{ divider: true },
				{ action: "quote", label: quoteLabel, enable: true, iconEnabled: (<TextIndentMore size={32} />) },
				{ divider: true },
				{ action: "numberedList", label: numberedListLabel, enable: true, iconEnabled: (<ListNumbered size={32} />) },
				{ action: "bulletedList", label: bulletedListLabel, enable: true, iconEnabled: (<ListBulleted size={32} />) }
			]
		};
	}

	render() {
		this.logger.log("render");

		let textToolbar = null;

		if (this.props.isOpen) {
			textToolbar = (
				<div className={"text-toolbar"} style={{ left: this.props.pos_x, top: this.props.pos_y }} onBlur={this.props.blurHandler}>
					<Toolbar
						config={this.getTextToolbar()}
						instanceId={this.props.canvasController.getInstanceId()}
						toolbarActionHandler={this.props.actionHandler}
						tooltipDirection={"top"}
						size={"sm"}
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
	actionHandler: PropTypes.func,
	blurHandler: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
	isOpen: state.texttoolbar.isOpen,
	pos_x: state.texttoolbar.pos_x,
	pos_y: state.texttoolbar.pos_y,
	actionHandler: state.texttoolbar.actionHandler,
	blurHandler: state.texttoolbar.blurHandler
});

export default connect(mapStateToProps)(injectIntl(CommonCanvasTextToolbar));
