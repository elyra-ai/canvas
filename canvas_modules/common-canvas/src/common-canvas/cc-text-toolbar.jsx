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
import ColorPicker from "../color-picker";
import {
	AlignBoxTopCenter, AlignBoxMiddleCenter, AlignBoxBottomCenter,
	Code, ColorPalette, Link, ListBulleted, ListNumbered, SquareOutline,
	TextAlignCenter, TextAlignLeft, TextAlignRight, TextColor, TextFont, TextIndentMore,
	TextBold, TextItalic, TextUnderline, TextScale, TextStrikethrough
} from "@carbon/react/icons";
import {
	MARKDOWN, WYSIWYG
} from "./constants/canvas-constants.js";

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
		const boldLabel = this.getJsxLabel("texttoolbar.boldAction", "b");
		const italicsLabel = this.getJsxLabel("texttoolbar.italicsAction", "i");
		const strikethroughLabel = this.getJsxLabel("texttoolbar.strikethroughAction", "shift + x");


		if (this.props.contentType === MARKDOWN) {
			const headerLabel = this.getJsxLabel("texttoolbar.headerAction", ">", "<");
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
		} else if (this.props.contentType === WYSIWYG) {
			const subMenuAlignHorizontal = [
				{ action: "align-left", label: "Left", enable: true, iconEnabled: (<TextAlignLeft size={32} />) },
				{ action: "align-center", label: "Center", enable: true, iconEnabled: (<TextAlignCenter size={32} />) },
				{ action: "align-right", label: "Right", enable: true, iconEnabled: (<TextAlignRight size={32} />) }
			];

			const subMenuAlignVertical = [
				{ action: "align-top", label: "Top", enable: true, iconEnabled: (<AlignBoxTopCenter size={32} />) },
				{ action: "align-middle", label: "Middle", enable: true, iconEnabled: (<AlignBoxMiddleCenter size={32} />) },
				{ action: "align-bottom", label: "Bottom", enable: true, iconEnabled: (<AlignBoxBottomCenter size={32} />) }
			];

			const subMenuTextSize = [
				{ action: "text-size-10", label: "10", enable: true },
				{ action: "text-size-11", label: "11", enable: true },
				{ action: "text-size-12", label: "12", enable: true },
				{ action: "text-size-14", label: "14", enable: true },
				{ action: "text-size-18", label: "18", enable: true },
				{ action: "text-size-24", label: "24", enable: true },
				{ action: "text-size-30", label: "30", enable: true },
				{ action: "text-size-36", label: "36", enable: true },
				{ action: "text-size-48", label: "48", enable: true },
				{ action: "text-size-60", label: "60", enable: true },
				{ action: "text-size-72", label: "72", enable: true },
				{ action: "text-size-96", label: "96", enable: true }
			];

			const subMenuOutline = [
				{ action: "outline-none", label: "No outline", enable: true },
				{ action: "outline-visible", label: "Solid outline", enable: true }
			];


			const subMenuFont = [
				{ action: "font-ibm-plex-sans", label: "IBM Plex Sans", enable: true },
				{ action: "font-ibm-plex-serif", label: "IBM Plex Serif", enable: true },
				{ action: "font-ibm-plex-condensed", label: "IBM Plex Condensed", enable: true },
				{ action: "font-ibm-plex-mono", label: "IBM Plex Mono", enable: true },
				{ action: "font-arial", label: "Arial", enable: true },
				{ action: "font-comic-sans-ms", label: "Comic Sans MS", enable: true },
				{ action: "font-gill-sans", label: "Gill Sans", enable: true },
				{ action: "font-helvetica-neue", label: "Helvetica Neue", enable: true },
				{ action: "font-times-new-roman", label: "Times New Roman", enable: true },
				{ action: "font-verdana", label: "Verdana", enable: true }
			];

			return {
				leftBar: [
					{ action: "submenu-font",
						label: "Font",
						iconEnabled: (<TextFont size={32} />),
						enable: true,
						subMenu: subMenuFont,
						closeSubAreaOnClick: true
					},
					{ action: "submenu-text-size",
						label: "Text size",
						iconEnabled: (<TextScale size={32} />),
						enable: true,
						subMenu: subMenuTextSize,
						closeSubAreaOnClick: true
					},
					{ action: "bold", label: boldLabel, enable: true, iconEnabled: (<TextBold size={32} />) },
					{ action: "italics", label: italicsLabel, enable: true, iconEnabled: (<TextItalic size={32} />) },
					{ action: "underline", label: "Underline", enable: true, iconEnabled: (<TextUnderline size={32} />) },
					{ action: "strikethrough", label: strikethroughLabel, enable: true, iconEnabled: (<TextStrikethrough size={32} />) },
					{ divider: true },
					{ action: "submenu-text-color",
						label: "Color text",
						iconEnabled: (<TextColor size={32} />),
						enable: true,
						subPanel: ColorPicker,
						subPanelData: {
							type: WYSIWYG,
							clickActionHandler: (color) => this.props.actionHandler("text-color", color)
						},
						closeSubAreaOnClick: true
					},
					{ action: "submenu-align-horiz",
						label: "Align horizontally",
						iconEnabled: (<TextAlignCenter size={32} />),
						enable: true,
						subMenu: subMenuAlignHorizontal,
						closeSubAreaOnClick: true
					},
					{ action: "submenu-align-vert",
						label: "Align vertically",
						iconEnabled: (<AlignBoxMiddleCenter size={32} />),
						enable: true,
						subMenu: subMenuAlignVertical,
						closeSubAreaOnClick: true
					},
					{ action: "submenu-background-color",
						label: "Color background",
						iconEnabled: (<ColorPalette size={32} />),
						enable: true,
						subPanel: ColorPicker,
						subPanelData: {
							type: WYSIWYG,
							clickActionHandler: (color) => this.props.actionHandler("background-color", color)
						},
						closeSubAreaOnClick: true
					},
					{ action: "sub-menu-outline",
						label: "Outline",
						iconEnabled: (<SquareOutline size={32} />),
						enable: true,
						subMenu: subMenuOutline,
						closeSubAreaOnClick: true
					}
				]
			};
		}
		return { leftBar: [] };
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
	contentType: PropTypes.oneOf([MARKDOWN, WYSIWYG]),
	actionHandler: PropTypes.func,
	blurHandler: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
	isOpen: state.texttoolbar.isOpen,
	pos_x: state.texttoolbar.pos_x,
	pos_y: state.texttoolbar.pos_y,
	contentType: state.texttoolbar.contentType,
	actionHandler: state.texttoolbar.actionHandler,
	blurHandler: state.texttoolbar.blurHandler
});

export default connect(mapStateToProps)(injectIntl(CommonCanvasTextToolbar));
