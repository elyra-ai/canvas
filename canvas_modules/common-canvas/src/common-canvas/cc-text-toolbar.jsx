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

	getMarkdownToolbar() {
		const boldLabel = this.getJsxLabel("texttoolbar.boldAction", "b");
		const italicsLabel = this.getJsxLabel("texttoolbar.italicsAction", "i");
		const strikethroughLabel = this.getJsxLabel("texttoolbar.strikethroughAction", "shift + x");
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
	}

	getWysiwygToolbar() {
		const boldLabel = this.getLabel("texttoolbar.boldAction");
		const italicsLabel = this.getLabel("texttoolbar.italicsAction");
		const underlineLabel = this.getLabel("texttoolbar.underline");
		const strikethroughLabel = this.getLabel("texttoolbar.strikethroughAction");

		const subMenuFont = [
			{ action: "font-ibm-plex-sans", label: this.getLabel("texttoolbar.fontIBMPlexSans"), enable: true },
			{ action: "font-ibm-plex-serif", label: this.getLabel("texttoolbar.fontIBMPlexSerif"), enable: true },
			{ action: "font-ibm-plex-sans-condensed", label: this.getLabel("texttoolbar.fontIBMPlexSansCon"), enable: true },
			{ action: "font-ibm-plex-mono", label: this.getLabel("texttoolbar.fontIBMPlexMono"), enable: true },
			{ action: "font-arial", label: this.getLabel("texttoolbar.fontArial"), enable: true },
			{ action: "font-comic-sans-ms", label: this.getLabel("texttoolbar.fontComicSansMS"), enable: true },
			{ action: "font-gill-sans", label: this.getLabel("texttoolbar.fontGillSans"), enable: true },
			{ action: "font-helvetica-neue", label: this.getLabel("texttoolbar.fontHelveticaNeue"), enable: true },
			{ action: "font-times-new-roman", label: this.getLabel("texttoolbar.fontTimesNewRoman"), enable: true },
			{ action: "font-verdana", label: this.getLabel("texttoolbar.fontVerdana"), enable: true }
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

		const subMenuAlignHorizontal = [
			{ action: "align-left", label: this.getLabel("texttoolbar.alignHorizLeft"), enable: true, iconEnabled: (<TextAlignLeft size={32} />) },
			{ action: "align-center", label: this.getLabel("texttoolbar.alignHorizCenter"), enable: true, iconEnabled: (<TextAlignCenter size={32} />) },
			{ action: "align-right", label: this.getLabel("texttoolbar.alignHorizRight"), enable: true, iconEnabled: (<TextAlignRight size={32} />) }
		];

		const subMenuAlignVertical = [
			{ action: "align-top", label: this.getLabel("texttoolbar.alignVertTop"), enable: true, iconEnabled: (<AlignBoxTopCenter size={32} />) },
			{ action: "align-middle", label: this.getLabel("texttoolbar.alignVertMiddle"), enable: true, iconEnabled: (<AlignBoxMiddleCenter size={32} />) },
			{ action: "align-bottom", label: this.getLabel("texttoolbar.alignVertBottom"), enable: true, iconEnabled: (<AlignBoxBottomCenter size={32} />) }
		];

		const subMenuOutline = [
			{ action: "outline-none", label: this.getLabel("texttoolbar.outlineNone"), enable: true },
			{ action: "outline-solid", label: this.getLabel("texttoolbar.outlineSolid"), enable: true }
		];

		return {
			leftBar: [
				{ action: "submenu-font",
					label: this.getLabel("texttoolbar.fontAction"),
					iconEnabled: (<TextFont size={32} />),
					enable: true,
					subMenu: subMenuFont,
					closeSubAreaOnClick: true
				},
				{ action: "submenu-text-size",
					label: this.getLabel("texttoolbar.textSize"),
					iconEnabled: (<TextScale size={32} />),
					enable: true,
					subMenu: subMenuTextSize,
					closeSubAreaOnClick: true
				},
				{ action: "bold", label: boldLabel, enable: true, iconEnabled: (<TextBold size={32} />) },
				{ action: "italics", label: italicsLabel, enable: true, iconEnabled: (<TextItalic size={32} />) },
				{ action: "underline", label: underlineLabel, enable: true, iconEnabled: (<TextUnderline size={32} />) },
				{ action: "strikethrough", label: strikethroughLabel, enable: true, iconEnabled: (<TextStrikethrough size={32} />) },
				{ divider: true },
				{ action: "submenu-text-color",
					label: this.getLabel("texttoolbar.colorText"),
					iconEnabled: (<TextColor size={32} />),
					enable: true,
					subPanel: ColorPicker,
					subPanelData: {
						type: WYSIWYG,
						clickActionHandler: (color, evt) => this.props.actionHandler("text-color", evt, color)
					},
					closeSubAreaOnClick: true
				},
				{ action: "submenu-align-horiz",
					label: this.getLabel("texttoolbar.alignHoriz"),
					iconEnabled: (<TextAlignCenter size={32} />),
					enable: true,
					subMenu: subMenuAlignHorizontal,
					closeSubAreaOnClick: true
				},
				{ action: "submenu-align-vert",
					label: this.getLabel("texttoolbar.alignVert"),
					iconEnabled: (<AlignBoxMiddleCenter size={32} />),
					enable: true,
					subMenu: subMenuAlignVertical,
					closeSubAreaOnClick: true
				},
				{ action: "submenu-background-color",
					label: this.getLabel("texttoolbar.colorBackground"),
					iconEnabled: (<ColorPalette size={32} />),
					enable: true,
					subPanel: ColorPicker,
					subPanelData: {
						type: WYSIWYG,
						clickActionHandler: (color, evt) => this.props.actionHandler("background-color", evt, color)
					},
					closeSubAreaOnClick: true
				},
				{ action: "sub-menu-outline",
					label: this.getLabel("texttoolbar.outline"),
					iconEnabled: (<SquareOutline size={32} />),
					enable: true,
					subMenu: subMenuOutline,
					closeSubAreaOnClick: true
				}
			]
		};
	}

	getTextToolbar() {
		if (this.props.contentType === MARKDOWN) {
			return this.getMarkdownToolbar();

		} else if (this.props.contentType === WYSIWYG) {
			return this.getWysiwygToolbar();
		}

		return { leftBar: [] };
	}

	render() {
		this.logger.log("render");

		let textToolbar = null;

		if (this.props.isOpen) {
			textToolbar = (
				<div className={"text-toolbar floating-toolbar"} style={{ left: this.props.pos_x, top: this.props.pos_y }} onBlur={this.props.blurHandler}>
					<Toolbar
						config={this.getTextToolbar()}
						instanceId={this.props.canvasController.getInstanceId()}
						containingDivId={this.props.containingDivId}
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
	containingDivId: PropTypes.string.isRequired,

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
