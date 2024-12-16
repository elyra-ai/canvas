/*
 * Copyright 2017-2025 Elyra Authors
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
/* eslint no-invalid-this: "off" */
/* eslint no-lonely-if: "off" */

import * as d3Selection from "d3-selection";
const d3 = Object.assign({}, d3Selection);

import { cloneDeep, isMatch, unescape as unescapeText } from "lodash";

import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";
import KeyboardUtils from "./keyboard-utils.js";
import SvgCanvasMarkdown from "./svg-canvas-utils-markdown.js";
import {
	MARKDOWN, WYSIWYG
} from "./constants/canvas-constants.js";

const BACKSPACE_KEY = 8;
const LEFT_ARROW_KEY = 37;
const UP_ARROW_KEY = 38;
const RIGHT_ARROW_KEY = 39;
const DOWN_ARROW_KEY = 40;
const DELETE_KEY = 46;
const A_KEY = 65;

const SCROLL_PADDING_COMMENT = 2;
const SCROLL_PADDING_LABEL = 12;

const WHITE = "#FFFFFF";
const BLACK = "#000000";

export default class SvgCanvasTextArea {

	constructor(config, dispUtils, nodeUtils, decUtils, canvasController,
		canvasDiv, activePipeline, removeTempCursorOverlay,
		displayCommentsCallback, displayLinksCallback, getCommentToolbarPosCallback,
		addCanvasZoomBehavior, removeCanvasZoomBehavior) {

		this.config = config;
		this.dispUtils = dispUtils;
		this.nodeUtils = nodeUtils;
		this.decUtils = decUtils;
		this.canvasController = canvasController;
		this.canvasDiv = canvasDiv;
		this.activePipeline = activePipeline;
		this.removeTempCursorOverlay = removeTempCursorOverlay;
		this.displayCommentsCallback = displayCommentsCallback;
		this.displayLinksCallback = displayLinksCallback;
		this.getCommentToolbarPosCallback = getCommentToolbarPosCallback;
		this.addCanvasZoomBehavior = addCanvasZoomBehavior;
		this.removeCanvasZoomBehavior = removeCanvasZoomBehavior;

		this.logger = new Logger("SvgCanvasTextArea");

		// Allows us to track the editing of text (either comments or node labels)
		this.editingText = false;
		this.editingTextId = "";

		// Keeps track of when text is in the process of being added.
		this.addingTextToTextArea = false;

		// Keeps track of textarea height.
		this.textAreaHeight = null;
	}

	isEditingText() {
		return this.editingText;
	}

	getEditingTextId() {
		return this.editingTextId;
	}

	displayCommentTextArea(d, parentDomObj) {
		this.editingTextData = {
			id: d.id,
			text: d.content,
			singleLine: false,
			maxCharacters: null,
			allowReturnKey: true,
			textCanBeEmpty: true,
			xPos: 0,
			yPos: 0,
			width: d.width,
			height: d.height,
			autoSize: d.autoSize, // TODO - read from comment layout when canvas layout is refactored.
			contentType: d.contentType,
			formats: d.formats,
			newFormats: cloneDeep(d.formats),
			parentDomObj: parentDomObj,
			keyboardInputCallback: d.contentType !== WYSIWYG && this.config.enableMarkdownInComments
				? this.commentKeyboardHandler.bind(this)
				: null,
			autoSizeCallback: this.autoSizeComment.bind(this),
			saveTextChangesCallback: this.saveCommentChanges.bind(this),
			closeTextAreaCallback: this.closeCommentTextArea.bind(this)
		};

		this.displayEditableComment(this.editingTextData);

		if (this.dispUtils.isDisplayingFullPage()) {
			const pos = this.getCommentToolbarPosCallback(d);
			if (d.contentType === WYSIWYG) {
				this.canvasController.openTextToolbar(
					pos.x, pos.y,
					this.editingTextData.newFormats,
					WYSIWYG,
					this.wysiwygActionHandler.bind(this),
					this.blurInTextToolbar.bind(this)
				);

			} else if (this.config.enableMarkdownInComments) {
				this.canvasController.openTextToolbar(
					pos.x, pos.y,
					null,
					MARKDOWN,
					this.markdownActionHandler.bind(this),
					this.blurInTextToolbar.bind(this)
				);
			}
		}
	}

	// Handles markdown actions initiated through the keyboard.
	commentKeyboardHandler(d3Event) {
		const action = this.getMarkdownAction(d3Event);
		if (action) {
			if (action !== "return") {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
			}
			this.markdownActionHandler(action, d3Event);
		}
	}

	// Called when the blur event occurs for the text toolbar.
	blurInTextToolbar(evt) {
		// When Cypress tests are running a call to focus() in addTextToTextArea()
		// can cause an incorrect blur event to be generated for the text toolbar
		// (where relatedTarget is null). This flag therefore allows us to avoid
		// that blur event that occurs while addTextToTextArea() is executing.
		if (this.addingTextToTextArea) {
			return;
		}

		// If there is a relatedTarget and it is set to one of the elements for the
		// textarea, texttoolbar, etc we ignore the blur event.
		if (evt.relatedTarget &&
				(CanvasUtils.getParentElementWithClass(evt.relatedTarget, "d3-comment-text-entry") ||
				CanvasUtils.getParentElementWithClass(evt.relatedTarget, "text-toolbar") ||
				CanvasUtils.getParentElementWithClass(evt.relatedTarget, "cds--overflow-menu-options__btn"))) {
			return;
		}

		// If the blur event is ocurring for an object outside of the textarea and
		// text toolbar we save the current text and close the textarea.
		this.completeEditing(evt);
	}

	// Returns a markdown action to the comment text being edited, based
	// on keyboard input. Returns the same commands as the toolbar buttons.
	getMarkdownAction(d3Event) {
		if (KeyboardUtils.boldCommand(d3Event)) {
			return "bold";
		} else if (KeyboardUtils.italicsCommand(d3Event)) {
			return "italics";
		} else if (KeyboardUtils.strikethroughCommand(d3Event)) {
			return "strikethrough";
		} else if (KeyboardUtils.numberedListCommand(d3Event)) {
			return "numberedList";
		} else if (KeyboardUtils.bulletedListCommand(d3Event)) {
			return "bulletedList";
		} else if (KeyboardUtils.codeCommand(d3Event)) {
			return "code";
		} else if (KeyboardUtils.linkCommand(d3Event)) {
			return "link";
		} else if (KeyboardUtils.quoteCommand(d3Event)) {
			return "quote";
		} else if (KeyboardUtils.incHashesCommand(d3Event)) {
			return "increaseHashes";
		} else if (KeyboardUtils.decHashesCommand(d3Event)) {
			return "decreaseHashes";
		} else if (KeyboardUtils.returnCommand(d3Event)) {
			return "return";
		}
		return null;
	}

	// Handles any actions requested on the comment text to add markdown
	// characters to the text. evt can be either a d3Event object from D3 when
	// this method is called from keyboard entry in the textarea or it can be
	// a synthetic event object from React when called from the text toolbar.
	markdownActionHandler(action, evt) {
		this.logger.log("markdownActionHandler - action = " + action);

		const textDiv = this.canvasDiv.selectAll(".d3-comment-text-entry")
			.node();

		const pos = CanvasUtils.getSelectionPositions(textDiv);

		const text = textDiv.innerText;

		if (text) { // In Firefox, text can sometimes be null when adding newlines.
			const mdObj = SvgCanvasMarkdown.processMarkdownAction(action, text, pos.start, pos.end);
			if (mdObj) {
				evt.preventDefault();
				this.addTextToTextArea(mdObj, textDiv);
			}
		}
	}

	// Handles any actions requested on the comment text to appy WYSIWYG
	// actions to the <div>. Actions can have an 'extra' parameter which
	// contains additional info. For example, "background-color" action
	// will have an extra paremeter containing the color as a hex value.
	wysiwygActionHandler(action, evt, extra) {
		this.logger.log("wysiwygActionHandler - action = " + action + " extra = " + extra);

		if (!this.editingTextData.newFormats) {
			this.editingTextData.newFormats = [];
		}

		if (action === "align-left" || action === "align-center" || action === "align-right") {
			this.addReplaceFormat("alignHorizontally", action);

		} else if (action === "align-top" || action === "align-middle" || action === "align-bottom") {
			this.addReplaceFormat("alignVertically", action);

		} else if (action === "underline" || action === "strikethrough") {
			this.addAdditionalFormat("textDecoration", action);

		} else if (action === "text-color") {
			this.addReplaceFormat("textColor", extra);

		} else if (action === "background-color") {
			this.addReplaceFormat("backgroundColor", extra);
			this.setTextColorAppropriately(extra);

		} else if (action.startsWith("text-size")) {
			this.addReplaceFormat("textSize", action);

		} else if (action.startsWith("font")) {
			this.addReplaceFormat("fontType", action);

		} else if (action.startsWith("outline")) {
			this.addReplaceFormat("outlineStyle", action);

		} else if (action === "bold" || action === "italics") {
			this.toggleFormat(action);
		}
		this.canvasController.updateTextToolbarFormats(this.editingTextData.newFormats);
	}

	// Sets the text color appropriately for the background color passed in.
	// If a text color has not yet been specified, or a text color has been
	// specified and it is either black or white, sets an appropriate
	// text color (either black or white) based on the darkness of the background.
	setTextColorAppropriately(backgroundColor) {
		const textColorFormat = this.hasFormat("textColor");

		if (!textColorFormat ||
				textColorFormat.value === WHITE ||
				textColorFormat.value === BLACK) {
			const isDark = CanvasUtils.isDarkColor(backgroundColor);
			this.addReplaceFormat("textColor", (isDark ? WHITE : BLACK));
		}
	}

	toggleFormat(type) {
		if (this.hasFormat(type)) {
			this.removeFormat(type);
		} else {
			this.addFormat(type);
		}
	}

	hasFormat(type) {
		return this.editingTextData.newFormats?.find((f) => f.type === type);
	}

	addReplaceFormat(type, action) {
		let format = this.hasFormat(type);
		if (format) {
			format.value = action;
		} else {
			format = { type: type, value: action };
			this.editingTextData.newFormats.push(format);
		}

		const { field, value } = CanvasUtils.convertFormat(format);

		if (field && value) {
			this.setWysiwygStyle(field, value);
		}
	}

	addAdditionalFormat(type, action) {
		let format = this.hasFormat(type);
		if (format) {
			if (format.value.includes(action)) {
				format.value = format.value.replace(action, "").trim();
				if (!format.value) {
					this.removeFormat(type);
					return;
				}
			} else {
				format.value += " " + action;
			}
		} else {
			format = { type: type, value: action };
			this.editingTextData.newFormats.push(format);
		}

		const { field, value } = CanvasUtils.convertFormat(format);

		if (field && value) {
			this.setWysiwygStyle(field, value);
		}
	}

	addFormat(type) {
		const format = { type: type };
		this.editingTextData.newFormats.push(format);

		const { field, value } = CanvasUtils.convertFormat(format);

		if (field && value) {
			this.setWysiwygStyle(field, value);
		}
	}

	removeFormat(type) {
		this.editingTextData.newFormats =
			this.editingTextData.newFormats?.filter((f) => f.type !== type);

		const { field } = CanvasUtils.convertFormat({ type });

		if (field) {
			this.setWysiwygStyle(field, null);
		}
	}

	setWysiwygStyle(field, value) {
		if (field === "background-color" && value === "transparent") {
			d3.select(this.editingTextData.parentDomObj).selectAll(".d3-comment-text")
				.style("background-color", "transparent");
		}
		const commentEntry = this.foreignObjectComment.selectAll(".d3-comment-text-entry");
		commentEntry.style(field, value);
		const commentEntryElement = commentEntry.node();
		commentEntryElement.focus();
	}

	focusOnTextEntryElement(evt) {
		const commentEntry = this.foreignObjectComment.selectAll(".d3-comment-text-entry");
		const commentEntryElement = commentEntry.node();
		commentEntryElement.focus();
	}

	// Replaces the text in the currently displayed <div> with the text
	// passed in. We use execCommand because this adds the inserted text to the
	// textarea's undo/redo stack whereas setting the text directly into the
	// textarea control does not.
	addTextToTextArea(mdObj, commentEntryElement) {
		this.addingTextToTextArea = true;
		const newText = unescapeText(mdObj.newText);

		commentEntryElement.focus();
		CanvasUtils.selectNodeContents(commentEntryElement);

		document.execCommand("insertText", false, newText);
		CanvasUtils.selectNodeRange(commentEntryElement, mdObj.newStart, mdObj.newEnd);

		this.addingTextToTextArea = false;
	}

	autoSizeComment(textArea, data) {
		this.logger.log("autoSizeComment - textAreaHt = " + this.textAreaHeight + " scroll ht = " + textArea.scrollHeight);

		if (data.autoSize) {
			const pad = this.foreignObjectLabel ? SCROLL_PADDING_LABEL : SCROLL_PADDING_COMMENT;
			const scrollHeight = textArea.scrollHeight + pad;

			if (this.textAreaHeight < scrollHeight) {
				this.textAreaHeight = scrollHeight;
				if (this.foreignObjectLabel) {
					this.foreignObjectLabel.style("height", this.textAreaHeight + "px");

				} else if (this.foreignObjectComment) {
					this.foreignObjectComment.style("height", this.textAreaHeight + "px");
				}
				this.activePipeline.getComment(data.id).height = this.textAreaHeight;
				this.displayCommentsCallback();
				this.displayLinksCallback();
			}
		} else {
			if (this.commentHasScrollableText(data.parentDomObj)) {
				this.removeCanvasZoomBehavior();
			} else {
				this.addCanvasZoomBehavior();
			}
		}
	}

	// Returns true if the scroll <div>, in the foreignObject used for text entry,
	// has contents that are bigger than what the scroll <div> can accommodate.
	commentHasScrollableText(element) {
		const scrollDiv = element.getElementsByClassName("d3-comment-text-entry-scroll");

		if (scrollDiv[0].clientHeight < scrollDiv[0].scrollHeight) {
			return true;
		}
		return false;
	}

	saveCommentChanges(taData, newText, newHeight) {
		const comment = this.activePipeline.getComment(taData.id);
		const data = {
			editType: "editComment",
			editSource: "canvas",
			id: comment.id,
			content: newText,
			width: comment.width,
			height: newHeight,
			x_pos: comment.x_pos,
			y_pos: comment.y_pos,
			contentType: taData.contentType,
			formats: taData.newFormats,
			pipelineId: this.activePipeline.id
		};
		this.canvasController.editActionHandler(data);
	}

	closeCommentTextArea() {
		this.canvasController.closeTextToolbar();
	}

	displayNodeLabelTextArea(node, parentDomObj) {
		// Save the current style for the display <div> and set the style so the
		// <div> is hidden while the text area is displayed on top of it. This
		// prevents the <div> from protruding below the text area.
		this.displayDiv = d3.select(parentDomObj).selectAll(".d3-foreign-object-node-label div");
		this.displayDivStyle = this.displayDiv.attr("style");
		this.displayDiv.attr("style", "display:none;");

		this.editingTextData = {
			id: node.id,
			text: node.label,
			singleLine: node.layout.labelSingleLine,
			maxCharacters: node.layout.labelMaxCharacters,
			allowReturnKey: node.layout.labelAllowReturnKey,
			textCanBeEmpty: false,
			xPos: this.nodeUtils.getNodeLabelTextAreaPosX(node),
			yPos: this.nodeUtils.getNodeLabelTextAreaPosY(node),
			width: this.nodeUtils.getNodeLabelTextAreaWidth(node),
			height: this.nodeUtils.getNodeLabelTextAreaHeight(node),
			autoSize: true,
			className: this.nodeUtils.getNodeLabelTextAreaClass(node),
			parentDomObj: parentDomObj,
			autoSizeCallback: this.autoSizeMultiLineLabel.bind(this),
			saveTextChangesCallback: this.saveNodeLabelChanges.bind(this),
			closeTextAreaCallback: this.closeEntryTextArea.bind(this)
		};
		this.displayEditableLabel(this.editingTextData);
	}

	// Increases the size of the editable multi-line text area for a label based
	// on the characters entered, and also ensures the maximum number of
	// characters for the label, if one is provided, is not exceeded.
	// This callback works for editable multi-line node labels and also
	// editable multi-line text decorations for either nodes or links.
	autoSizeMultiLineLabel(textArea, data) {
		this.logger.log("autoSizeNodeLabel - textAreaHt = " + this.textAreaHeight + " scroll ht = " + textArea.scrollHeight);

		// Restrict max characters in case text was pasted in to the text area.
		if (data.maxCharacters &&
				textArea.value.length > data.maxCharacters) {
			textArea.value = textArea.value.substring(0, data.maxCharacters);
		}
		// Temporarily set the height to zero so the scrollHeight will get set to
		// the full height of the text in the textarea. This allows us to close up
		// the text area when the lines of text reduce.
		if (this.foreignObjectLabel) {
			this.foreignObjectLabel.style("height", 0);
			const scrollHeight = textArea.scrollHeight + SCROLL_PADDING_LABEL;
			this.textAreaHeight = scrollHeight;
			this.foreignObjectLabel.style("height", this.textAreaHeight + "px");
		}
	}

	saveNodeLabelChanges(taData, newText) {
		const data = {
			editType: "setNodeLabel",
			editSource: "canvas",
			nodeId: taData.id,
			label: newText,
			pipelineId: this.activePipeline.id
		};
		this.canvasController.editActionHandler(data);
	}

	// Called when the node label or decoration label text area is closing.
	// Resets the inline style of the <div>, that displays the text, back
	// to what is was before it was hidden when the entry text area opened.
	closeEntryTextArea() {
		this.displayDiv.attr("style", this.displayDivStyle);
	}

	// Displays a <textarea> for editable a text decoration on either a node
	// or link.
	displayDecLabelTextArea(dec, obj, objType, parentDomObj) {
		// Save the current style for the display <div> and set the style so the
		// <div> is hidden while the text area is displayed on top of it. This
		// prevents the <div> from protruding below the text area.
		this.displayDiv = d3.select(parentDomObj).selectAll(".d3-foreign-object-dec-label div");
		this.displayDivStyle = this.displayDiv.attr("style");
		this.displayDiv.attr("style", "display:none;");

		this.editingTextData = {
			id: dec.id,
			text: dec.label,
			singleLine: dec.label_single_line || false,
			maxCharacters: dec.label_max_characters || null,
			allowReturnKey: dec.label_allow_return_key || false,
			textCanBeEmpty: false,
			xPos: this.decUtils.getDecLabelTextAreaPosX(),
			yPos: this.decUtils.getDecLabelTextAreaPosY(),
			width: this.decUtils.getDecLabelTextAreaWidth(dec, obj, objType),
			height: this.decUtils.getDecLabelTextAreaHeight(dec, obj, objType),
			autoSize: true,
			className: this.decUtils.getDecLabelTextAreaClass(dec),
			parentDomObj: parentDomObj,
			objId: obj.id,
			objType: objType,
			autoSizeCallback: this.autoSizeMultiLineLabel.bind(this),
			saveTextChangesCallback: this.saveDecLabelChanges.bind(this),
			closeTextAreaCallback: this.closeEntryTextArea.bind(this)
		};
		this.displayEditableLabel(this.editingTextData);
	}

	// Handles saved changes to editable text decorations.
	saveDecLabelChanges(taData, newText) {
		const data = {
			editType: "editDecorationLabel",
			editSource: "canvas",
			decId: taData.id,
			objId: taData.objId,
			objType: taData.objType,
			label: newText,
			pipelineId: this.activePipeline.id
		};
		this.canvasController.editActionHandler(data);
	}

	// Displays a <textarea> to allow text entry and editing for: node labels; or
	// text decorations on either a node or link.
	// Evetually it is possible that we could remove the <textarea> approach
	// and just use the <div> approach used in displayEditableComment.
	displayEditableLabel(data) {
		this.textAreaHeight = data.height; // Save for comparison during auto-resize
		this.editingText = true;
		this.editingTextId = data.id;

		this.foreignObjectLabel = d3.select(data.parentDomObj)
			.append("foreignObject")
			.attr("class", "d3-foreign-object-text-entry")
			.attr("width", data.width)
			.attr("height", data.height)
			.attr("x", data.xPos)
			.attr("y", data.yPos);

		const textArea = this.foreignObjectLabel
			.append("xhtml:textarea")
			.attr("class", data.className)
			.text(unescapeText(data.text))
			.call(this.attachTextEntryListeners.bind(this));

		textArea.node().focus();

		// Set the cusrsor to the end of the text.
		textArea.node().setSelectionRange(data.text.length, data.text.length);
	}

	// Complete the text editing.
	completeEditing(evt) {
		// Close the temp cursor overlay in case it is open, due to a click
		// in the comment sizing area.
		this.removeTempCursorOverlay();

		if (this.foreignObjectLabel) {
			const commentEntry = this.foreignObjectLabel.selectAll("textarea");
			const commentEntryElement = commentEntry.node();
			this.textContentSaved = true;
			this.saveAndCloseTextArea(this.editingTextData, commentEntryElement, evt);

		} else if (this.foreignObjectComment) {
			const commentEntry = this.foreignObjectComment.selectAll(".d3-comment-text-entry");
			const commentEntryElement = commentEntry.node();
			this.textContentSaved = true;
			this.saveAndCloseTextArea(this.editingTextData, commentEntryElement, evt);
		}
	}

	saveAndCloseTextArea(data, element, d3Event) {
		const newValue = this.foreignObjectComment ? element.innerText : element.value;

		// If there is no text for the label and textCanBeEmpty is false
		// just return, so label returns to what it was before editing started.
		if (!newValue && !data.textCanBeEmpty) {
			this.closeTextArea(data);
			CanvasUtils.stopPropagationAndPreventDefault(d3Event);
			return;
		}
		// We close the text area before saving the changes therefore, cache
		// the text value since it will be unavailable after the text area closes.
		const newText = newValue;
		this.closeTextArea(data);
		if (data.text !== newText || this.textAreaHeight !== data.height ||
				!this.areFormatsTheSame(data.formats, data.newFormats)) {
			data.saveTextChangesCallback(data, newText, this.textAreaHeight);
		} else {
			d3.select(data.parentDomObj).selectAll(".d3-comment-text")
				.style("display", "table-cell");
			this.canvasController.restoreFocus();
		}
	}

	// Returns true if the two foramts arrays passed in are the same.
	areFormatsTheSame(f1, f2) {
		if (!f1 && !f2) {
			return true;
		}
		if ((f1 && !f2) || (!f1 && f2)) {
			return false;
		}
		if (f1.length !== f2.length) {
			return false;
		}
		const remainder = f1.filter((f1Obj) => this.formatArrayIncludes(f1Obj, f2));

		if (remainder.length !== f1.length) {
			return false;
		}
		return true;
	}

	// Returns true if object f1Obj is one of the elements of f2Array
	formatArrayIncludes(f1Obj, f2Array) {
		return f2Array.find((f2Obj) =>
			isMatch(f1Obj, f2Obj) && isMatch(f1Obj, f1Obj));
	}

	// Closes the text area and resets the flags.
	closeTextArea(data) {
		if (data.closeTextAreaCallback) {
			data.closeTextAreaCallback(data.id);
		}
		if (this.foreignObjectLabel) {
			this.foreignObjectLabel.remove();
			this.foreignObjectLabel = null;

		} else if (this.foreignObjectComment) {
			// Ensure hidden foreign object used for display is visible again
			d3.select(this.editingTextData.parentDomObj)
				.selectAll(".d3-foreign-object-comment-text")
				.style("display", null);
			// Tidy up
			this.foreignObjectComment.remove();
			this.foreignObjectComment = null;
		}
		this.editingText = false;
		this.editingTextId = "";
	}

	// Returns true if one of the keys that are allowed in the text area, when
	// checking for maximum characters, has been pressed.
	textAreaAllowedKeys(d3Event) {
		return d3Event.keyCode === DELETE_KEY ||
			d3Event.keyCode === BACKSPACE_KEY ||
			d3Event.keyCode === LEFT_ARROW_KEY ||
			d3Event.keyCode === RIGHT_ARROW_KEY ||
			d3Event.keyCode === UP_ARROW_KEY ||
			d3Event.keyCode === DOWN_ARROW_KEY ||
			(d3Event.keyCode === A_KEY && KeyboardUtils.isMetaKey(d3Event));
	}

	// Displays a <div> to allow text entry and editing of (regular or WYSIWYG)
	// comments. This is different to the way other text entry (node labels,
	// text decorations) is handled because the <div>, that is contained within a
	// parent <div>, is styled so the text can be aligned at the top, middle and
	// bottom of the parent.
	displayEditableComment(data) {
		this.textAreaHeight = data.height; // Save for comparison during auto-resize
		this.editingText = true;
		this.editingTextId = data.id;

		// This hides the foreign object used for displaying the comment. This
		// is necessary because, if the user changes the comment's background color
		// to transparent, the underlying display comment would be visible and
		// differences between it and the comment entry control would show as a
		// ugly display.
		// This change will be reserved when the canvas refreshes when text
		// editing is complete or when editing ends with nothing saved.
		d3.select(data.parentDomObj).selectAll(".d3-foreign-object-comment-text")
			.style("display", "none");

		this.foreignObjectComment = d3.select(data.parentDomObj)
			.append("foreignObject")
			.attr("class", "d3-foreign-object-comment-text-entry")
			.attr("width", data.width)
			.attr("height", data.height)
			.attr("x", data.xPos)
			.attr("y", data.yPos);

		this.foreignObjectComment
			.append("xhtml:div") // Provide a namespace when div is inside foreignObject
			.attr("class", "d3-comment-text-entry-scroll")
			.on("mousedown", (d3Event) => {
				// This is triggered when the user 'mousedown's on the scrollbar. In this
				// case, prevent propogation otherwise it causes a 'blur' event and ends
				// the edit mode.
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
			})
			.each((d, i, commentTexts) => {
				const commentElement = d3.select(commentTexts[i]);
				CanvasUtils.applyOutlineStyle(commentElement, d.formats); // Only apply outlineStyle format here
			})

			.append("xhtml:div") // Provide a namespace when div is inside foreignObject
			.attr("class", "d3-comment-text-entry-outer")

			.append("xhtml:div") // Provide a namespace when div is inside foreignObject
			.attr("class", "d3-comment-text-entry")
			.attr("contentEditable", this.getContentEditableValue())
			.each((d, i, commentTexts) => {
				const commentElement = d3.select(commentTexts[i]);
				CanvasUtils.applyNonOutlineStyle(commentElement, d.formats); // Apply all formats except outlineStyle
			})
			.text(unescapeText(data.text))
			.call(this.attachTextEntryListeners.bind(this));

		// Get the text <div> element.
		const textDiv = this.canvasDiv.selectAll(".d3-comment-text-entry")
			.node();

		// We set the focus on the innermost <div> even though the focus
		// highlighting is displayed for the forign object. This allows
		// key strokes to go to the <div>.
		textDiv.focus();

		// Set the cusrsor to the end of the text.
		if (textDiv.childNodes.length > 0) {
			this.setCursor(textDiv.childNodes[0], data.text?.length || 0);
		}
		// Scroll to the bottom of the text
		textDiv.scrollIntoView({ behavior: "instant", block: "end" });
	}

	// Returns a value for the contentEditable field on a <div>. The
	// value "plaintext-only" prevents rich text being pasted into the <div>.
	// Crappy Firefox doesn't accept that value and doesn't even treat
	// the string as truthy, meaning we have to actually return a boolean true!!
	getContentEditableValue() {
		return navigator.userAgent.includes("Firefox") ? true : "plaintext-only";
	}

	// Sets the cursor position in the editable <div>
	setCursor(el, pos, posEnd) {
		var range = document.createRange();
		var sel = window.getSelection();

		range.setStart(el, pos);

		if (posEnd) {
			range.setEnd(el, posEnd);
		} else {
			range.collapse(true);
		}

		sel.removeAllRanges();
		sel.addRange(range);
	}

	// Attaches a common set of event listeners to the <textarea> (used for entry of
	// node label and text decorations) OR to the editable <div> used for entry of
	// regular or WYSIWYG comments. The behavior of the listeners is the same in this
	// code but lower level functions may behave differently depending on what element
	// <textarea> or <div> is used for text entry.
	attachTextEntryListeners(textEntrySel) {
		const data = this.editingTextData;

		textEntrySel
			.on("keydown", (d3Event) => {
				// If user hits return/enter
				if (KeyboardUtils.returnCommand(d3Event)) {
					if (data.allowReturnKey === "save" || KeyboardUtils.completeTextEntry(d3Event)) {
						this.textContentSaved = true;
						this.saveAndCloseTextArea(data, d3Event.target, d3Event);
						return;

					// Don't accept return key press when text is all on one line or
					// if application doesn't want line feeds inserted in the label.
					} else if (data.singleLine || !data.allowReturnKey) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					}
				}
				// If user presses ESC key revert back to original text by just
				// closing the text area.
				if (KeyboardUtils.cancelTextEntry(d3Event)) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					this.textAreaEscKeyPressed = true;
					this.closeTextArea(data);
					this.canvasController.restoreFocus();
				}
				// Prevent user entering more than any allowed maximum for characters.
				if (data.maxCharacters &&
						d3Event.target.value.length >= data.maxCharacters &&
						!this.textAreaAllowedKeys(d3Event)) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				}
				// Call any specific keyboard handler for the type of
				// text being edited.
				if (data.keyboardInputCallback) {
					data.keyboardInputCallback(d3Event);
				}
				// Prevent events propagating to the link which might alter
				// the focus to the link.
				d3Event.stopPropagation();
			})
			.on("keyup", (d3Event) => {
				data.autoSizeCallback(d3Event.target, data);
			})
			.on("paste", (d3Event) => {
				this.logger.log("Text area - Paste - Scroll Ht = " + d3Event.target.scrollHeight);
				// Allow some time for pasted text (from context menu) to be
				// loaded into the text area. Otherwise the text is not there
				// and the auto size does not increase the height correctly.
				setTimeout(data.autoSizeCallback, 500, d3Event.target, data);
			})
			.on("blur", (d3Event, d) => {
				this.logger.log("Text area - blur");

				// If the esc key was pressed to cause the blur event just return
				// so label returns to what it was before editing started.
				if (this.textAreaEscKeyPressed) {
					this.textAreaEscKeyPressed = false;
					return;
				}

				// If the text label has been saved by the user hitting the return key
				// we just return since there's nothing further to do.
				if (this.textContentSaved) {
					this.textContentSaved = false;
					return;
				}

				// If the user clicked on an element in the text toolbar to cause the
				// blur event, just return.
				if (d3Event.relatedTarget && CanvasUtils.getParentElementWithClass(d3Event.relatedTarget, "text-toolbar")) {
					return;
				}

				this.saveAndCloseTextArea(data, d3Event.target, d3Event);
			})
			.on("focus", (d3Event, d) => {
				this.logger.log("Text area - focus");
				data.autoSizeCallback(d3Event.target, data);
			})
			.on("mousedown click dblclick contextmenu", (d3Event, d) => {
				d3Event.stopPropagation(); // Allow default behavior to show system contenxt menu
			});
	}
}
