/*
 * Copyright 2017-2022 Elyra Authors
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

import * as d3Selection from "d3-selection";
const d3 = Object.assign({}, d3Selection);

import { unescape as unescapeText } from "lodash";

import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";
import SvgCanvasMarkdown from "./svg-canvas-utils-markdown.js";

const BACKSPACE_KEY = 8;
const RETURN_KEY = 13;
const ESC_KEY = 27;
const LEFT_ARROW_KEY = 37;
const UP_ARROW_KEY = 38;
const RIGHT_ARROW_KEY = 39;
const DOWN_ARROW_KEY = 40;
const DELETE_KEY = 46;
const A_KEY = 65;
const B_KEY = 66;
const E_KEY = 69;
const I_KEY = 73;
const K_KEY = 75;
const X_KEY = 88;
const LAB_KEY = 188; // Left angle bracket <
const RAB_KEY = 190; // Right angle bracket >
const SEVEN_KEY = 55;
const EIGHT_KEY = 56;

const SCROLL_PADDING = 12;

export default class SvgCanvasTextArea {

	constructor(config, dispUtils, nodeUtils, decUtils, canvasController,
		canvasDiv, activePipeline, displayCommentsCallback, displayLinksCallback, getCommentToolbarPosCallback) {

		this.config = config;
		this.dispUtils = dispUtils;
		this.nodeUtils = nodeUtils;
		this.decUtils = decUtils;
		this.canvasController = canvasController;
		this.canvasDiv = canvasDiv;
		this.activePipeline = activePipeline;
		this.displayCommentsCallback = displayCommentsCallback;
		this.displayLinksCallback = displayLinksCallback;
		this.getCommentToolbarPosCallback = getCommentToolbarPosCallback;

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
			className: "d3-comment-entry",
			parentDomObj: parentDomObj,
			keyboardInputCallback: this.config.enableMarkdownInComments ? this.commentKeyboardHandler.bind(this) : null,
			autoSizeCallback: this.autoSizeComment.bind(this),
			saveTextChangesCallback: this.saveCommentChanges.bind(this),
			closeTextAreaCallback: this.closeCommentTextArea.bind(this)
		};
		this.displayTextArea(this.editingTextData);

		if (this.config.enableMarkdownInComments && this.dispUtils.isDisplayingFullPage()) {
			const pos = this.getCommentToolbarPosCallback(d);
			this.canvasController.openTextToolbar(pos.x, pos.y,
				this.markdownActionHandler.bind(this),
				this.blurInTextToolbar.bind(this));
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
				(CanvasUtils.getParentElementWithClass(evt.relatedTarget, "d3-comment-entry") ||
					CanvasUtils.getParentElementWithClass(evt.relatedTarget, "text-toolbar") ||
					CanvasUtils.getParentElementWithClass(evt.relatedTarget, "bx--overflow-menu-options__btn"))) {
			return;
		}

		// If the blur event is ocurring for an object outside of the textarea and
		// text toolbar we save the current text and close the textarea.
		this.completeEditing(evt);
	}

	// Applies a markdown action to the comment text being edited using
	// the same commands as the toolbar.
	getMarkdownAction(d3Event) {
		if (CanvasUtils.isCmndCtrlPressed(d3Event)) {
			switch (d3Event.keyCode) {
			case B_KEY: return "bold";
			case I_KEY: return "italics";
			case X_KEY: return d3Event.shiftKey ? "strikethrough" : null;
			case SEVEN_KEY: return d3Event.shiftKey ? "numberedList" : null;
			case EIGHT_KEY: return d3Event.shiftKey ? "bulletedList" : null;
			case E_KEY: return "code";
			case K_KEY: return "link";
			case LAB_KEY: return "decreaseHashes";
			case RAB_KEY: return d3Event.shiftKey ? "quote" : "increaseHashes";
			default:
			}
		} else if (d3Event.keyCode === RETURN_KEY) {
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

		const commentEntry = this.canvasDiv.selectAll(".d3-comment-entry");
		const commentEntryElement = commentEntry.node();
		const start = commentEntryElement.selectionStart;
		const end = commentEntryElement.selectionEnd;
		const text = commentEntryElement.value;

		const mdObj = SvgCanvasMarkdown.processMarkdownAction(action, text, start, end);
		if (mdObj) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.addTextToTextArea(mdObj, commentEntryElement);
		}
	}

	// Replaces the text in the currently displayed textarea with the text
	// passed in. We use execCommand because this adds the inserted text to the
	// textarea's undo/redo stack whereas setting the text directly into the
	// textarea control does not.
	addTextToTextArea(mdObj, commentEntryElement) {
		this.addingTextToTextArea = true;
		const text = unescapeText(mdObj.newText);
		commentEntryElement.focus();
		commentEntryElement.select();
		document.execCommand("insertText", false, text);
		commentEntryElement.setSelectionRange(mdObj.newStart, mdObj.newEnd);
		this.addingTextToTextArea = false;
	}

	autoSizeComment(textArea, data) {
		this.logger.log("autoSizeComment - textAreaHt = " + this.textAreaHeight + " scroll ht = " + textArea.scrollHeight);

		const scrollHeight = textArea.scrollHeight + SCROLL_PADDING;
		if (this.textAreaHeight < scrollHeight) {
			this.textAreaHeight = scrollHeight;
			this.foreignObject.style("height", this.textAreaHeight + "px");
			this.activePipeline.getComment(data.id).height = this.textAreaHeight;
			this.displayCommentsCallback();
			this.displayLinksCallback();
		}
	}

	saveCommentChanges(id, newText, newHeight) {
		const comment = this.activePipeline.getComment(id);
		const data = {
			editType: "editComment",
			editSource: "canvas",
			id: comment.id,
			content: newText,
			width: comment.width,
			height: newHeight,
			x_pos: comment.x_pos,
			y_pos: comment.y_pos,
			pipelineId: this.activePipeline.id
		};
		this.canvasController.editActionHandler(data);
	}

	closeCommentTextArea() {
		this.canvasController.closeTextToolbar();
	}

	displayNodeLabelTextArea(node, parentDomObj) {
		d3.select(parentDomObj)
			.selectAll("div")
			.attr("style", "display:none;");

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
			className: this.nodeUtils.getNodeLabelTextAreaClass(node),
			parentDomObj: parentDomObj,
			autoSizeCallback: this.autoSizeMultiLineLabel.bind(this),
			saveTextChangesCallback: this.saveNodeLabelChanges.bind(this),
			closeTextAreaCallback: this.closeEntryTextArea.bind(this)
		};
		this.displayTextArea(this.editingTextData);
	}

	// Increases the size of the editable multi-line text area for a label based
	//  on the characters entered, and also ensures the maximum number of
	//  characters for the label, if one is provided, is not exceeded.
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
		this.foreignObject.style("height", 0);
		const scrollHeight = textArea.scrollHeight + SCROLL_PADDING;
		this.textAreaHeight = scrollHeight;
		this.foreignObject.style("height", this.textAreaHeight + "px");
	}

	saveNodeLabelChanges(id, newText, newHeight, taData) {
		const data = {
			editType: "setNodeLabel",
			editSource: "canvas",
			nodeId: id,
			label: newText,
			pipelineId: this.activePipeline.id
		};
		this.canvasController.editActionHandler(data);
	}

	// Called when the node label or decoration label text area is closing.
	// Sets the style of the div that should display the text, so it is displayed
	// by removing its inline style (because it was hidden when the entry text
	// area opened).
	closeEntryTextArea() {
		d3.select(this.editingTextData.parentDomObj)
			.selectAll("div")
			.attr("style", null);
	}

	// Displays a text area for an editable text decoration on either a node
	// or link.
	displayDecLabelTextArea(dec, obj, objType, parentDomObj) {
		d3.select(parentDomObj)
			.selectAll("div")
			.attr("style", "display:none;");

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
			className: this.decUtils.getDecLabelTextAreaClass(dec),
			parentDomObj: parentDomObj,
			objId: obj.id,
			objType: objType,
			autoSizeCallback: this.autoSizeMultiLineLabel.bind(this),
			saveTextChangesCallback: this.saveDecLabelChanges.bind(this),
			closeTextAreaCallback: this.closeEntryTextArea.bind(this)
		};
		this.displayTextArea(this.editingTextData);
	}

	// Handles saved changes to editable text decorations.
	saveDecLabelChanges(id, newText, newHeight, taData) {
		const data = {
			editType: "editDecorationLabel",
			editSource: "canvas",
			decId: id,
			objId: taData.objId,
			objType: taData.objType,
			label: newText,
			pipelineId: this.activePipeline.id
		};
		this.canvasController.editActionHandler(data);
	}

	// Displays a text area to allow text entry and editing for: comments;
	// node labels; or text decorations on either a node or link.
	displayTextArea(data) {
		this.textAreaHeight = data.height; // Save for comparison during auto-resize
		this.editingText = true;
		this.editingTextId = data.id;

		this.foreignObject = d3.select(data.parentDomObj)
			.append("foreignObject")
			.attr("class", "d3-foreign-object-text-entry")
			.attr("width", data.width)
			.attr("height", data.height)
			.attr("x", data.xPos)
			.attr("y", data.yPos);

		const textArea = this.foreignObject
			.append("xhtml:textarea")
			.attr("class", data.className)
			.text(unescapeText(data.text))
			.on("keydown", (d3Event) => {
				// If user hits return/enter
				if (d3Event.keyCode === RETURN_KEY) {
					if (data.allowReturnKey === "save") {
						this.textContentSaved = true;
						this.saveAndCloseTextArea(data, d3Event.target.value, d3Event);
						return;

					// Don't accept return key press when text is all on one line or
					// if application doesn't want line feeds inserted in the label.
					} else if (data.singleLine || !data.allowReturnKey) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					}
				}
				// If user presses ESC key revert back to original text by just
				// closing the text area.
				if (d3Event.keyCode === ESC_KEY) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					this.textAreaEscKeyPressed = true;
					this.closeTextArea(data);
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

				this.saveAndCloseTextArea(data, d3Event.target.value, d3Event);
			})
			.on("focus", (d3Event, d) => {
				this.logger.log("Text area - focus");
				data.autoSizeCallback(d3Event.target, data);
			})
			.on("mousedown click dblclick contextmenu", (d3Event, d) => {
				d3Event.stopPropagation(); // Allow default behavior to show system contenxt menu
			});

		textArea.node().focus();

		// Set the cusrsor to the end of the text.
		textArea.node().setSelectionRange(data.text.length, data.text.length);
	}

	// Complete the text editing. evt may be undefined when called from the
	// canvas renderer.
	completeEditing(evt) {
		// const commentEntry = this.canvasDiv.selectAll(".d3-comment-entry");
		const commentEntry = this.foreignObject.selectAll("textarea");
		const commentEntryElement = commentEntry.node();
		this.textContentSaved = true;
		this.saveAndCloseTextArea(this.editingTextData, commentEntryElement.value, evt);
	}

	saveAndCloseTextArea(data, newValue, d3Event) {
		// If there is no text for the label and textCanBeEmpty is false
		// just return, so label returns to what it was before editing started.
		if (!newValue && !data.textCanBeEmpty) {
			CanvasUtils.stopPropagationAndPreventDefault(d3Event);
			this.closeTextArea(data);
			return;
		}
		const newText = newValue; // Save the text before closing the foreign object
		this.closeTextArea(data);
		if (data.text !== newText || this.textAreaHeight !== data.height) {
			data.saveTextChangesCallback(data.id, newText, this.textAreaHeight, data);
		}
	}

	// Closes the text area and resets the flags.
	closeTextArea(data) {
		if (data.closeTextAreaCallback) {
			data.closeTextAreaCallback(data.id);
		}
		this.foreignObject.remove();
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
			(d3Event.keyCode === A_KEY && CanvasUtils.isCmndCtrlPressed(d3Event));
	}
}
