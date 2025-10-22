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

import markdownIt from "markdown-it";
import { escape as escapeText } from "lodash";
import { WYSIWYG } from "./constants/canvas-constants";

export default class SvgCanvasUtilsComments {
	// Returns the absolute x coordinate of the center of the comment
	getCommentCenterPosX(com) {
		return com.x_pos + (com.width / 2);
	}

	// Returns the absolute y coordinate of the center of the comment
	getCommentCenterPosY(com) {
		return com.y_pos + (com.height / 2);
	}

	// Returns an HTML string for the comment passed in containing HTML tags for the any
	// formatting required including <mark> tags around any text specified to be highlighted.
	getCommentHTMLStr(d) {
		const htmlString = (d.contentType !== WYSIWYG && this.config.enableMarkdownInComments
			? this.getCommentAsMarkdownHTML(d.content)
			: escapeText(d.content));

		if (d.highlightText) {
			return this.insertCommentHighlight(htmlString, d.highlightText);
		}
		return htmlString;
	}

	// Returns the comment content passed in as an HTML string. We dynamically
	// create this.markdownIt because changing
	// this.config.enableMarkdownHTML during runtime can cause errors.
	getCommentAsMarkdownHTML(content) {
		if (!this.markdownIt) {
			this.markdownIt = markdownIt({
				html: this.config.enableMarkdownHTML
			});
		}

		return this.markdownIt.render(content);
	}

	// Converts the HTML string passed in to a new HTML string containing and
	// necessary <mark> tags for the text to be highlighted specified by the
	// search string passed in.
	insertCommentHighlight(htmlString, searchStr) {
		// Parse the HTML string.
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlString, "text/html");
		const bodies = doc.getElementsByTagName("body");
		const body = bodies[0];

		// Look for the search string in the text only (no HTML tags) version of
		// the text.
		const searchStart = body?.innerText?.indexOf(searchStr);

		// If the search string was found, insert the <mark> tags
		if (searchStart > -1) {
			const elementInfos = [];
			this.searchForElementInfos(body, searchStart, searchStart + searchStr.length, 0, elementInfos);
			this.insertMarkElements(elementInfos);

			return body.outerHTML;
		}

		return htmlString;
	}

	// Searches the element passed in for any child nodes that coincide with the
	// start and end position of the search string. runStart is the starting position
	// within the original string of the element being processed. Results are returned
	// in an array of element infos that have the following form:
	// { splitStart, splitEnd, node }
	// where splitStart and splitEnd are the beginning and ending position of the
	// highlighted text and node is a text node in the DOM.
	searchForElementInfos(element, searchStart, searchEnd, runStart, elementInfos) {
		let textStart = runStart;
		let textEnd = runStart;

		for (let i = 0; i < element.childNodes.length; i++) {
			const node = element.childNodes[i];

			if (node.nodeType === Node.TEXT_NODE) {
				const textLen = node?.textContent?.length;
				textEnd = textStart + textLen;

				if (!(textStart >= searchEnd || textEnd <= searchStart)) {
					let splitStart = 0;
					let splitEnd = textLen;
					if (searchStart > textStart) {
						splitStart = searchStart - textStart;
					}
					if (searchEnd < textEnd) {
						splitEnd = searchEnd - textStart;
					}

					elementInfos.push({ splitStart, splitEnd, node });
				}

			} else if (node.nodeType === Node.ELEMENT_NODE) {
				textStart = this.searchForElementInfos(node, searchStart, searchEnd, textEnd, elementInfos);
			}
		}
		return textEnd;
	}

	// Modifies each text node in the element infos array by adding <mark> and </mark>
	// around the text to be highlighted and modifies the DOM objects appropriately.
	insertMarkElements(elementInfos) {
		for (let i = 0; i < elementInfos.length; i++) {
			const elementInfo = elementInfos[i];
			const node = elementInfo.node;
			const parentElement = node.parentElement;
			const textContent = node.textContent;

			const markElement = document.createElement("mark");

			// Search string and text content the same.
			//  Split:              ▼        ▼
			//  Text content:       tttttttttt
			//  Mark:               xxxxxxxxxx
			if (elementInfo.splitStart === 0 &&
				elementInfo.splitEnd === textContent.length)
			{
				const node1 = document.createTextNode(textContent.slice(0, elementInfo.splitEnd));
				markElement.appendChild(node1);

				parentElement.replaceChild(markElement, node);

			// Search string at end of text content.
			//  Split:                   ▼    ▼
			//  Text content:        tttttttttt
			//  Mark:                    xxxxxx
			} else if (elementInfo.splitStart > 0 &&
				elementInfo.splitEnd === textContent.length)
			{
				const node1 = document.createTextNode(textContent.slice(0, elementInfo.splitStart));
				const node2 = document.createTextNode(textContent.slice(elementInfo.splitStart));
				markElement.appendChild(node2);

				parentElement.insertBefore(node1, node);
				parentElement.replaceChild(markElement, node);

			// Search string at start of text content.
			//  Split:               ▼    ▼
			//  Text content:        tttttttttt
			//  Mark:                xxxxxx
			} else if (elementInfo.splitStart === 0 &&
				elementInfo.splitEnd < textContent.length)
			{
				const node1 = document.createTextNode(textContent.slice(0, elementInfo.splitEnd));
				const node2 = document.createTextNode(textContent.slice(elementInfo.splitEnd));
				markElement.appendChild(node1);

				parentElement.insertBefore(markElement, node);
				parentElement.replaceChild(node2, node);

			// Search string within text content.
			//  Split:                 ▼    ▼
			//  Text content:        tttttttttt
			//  Mark:                  xxxxxx
			} else {
				const node1 = document.createTextNode(textContent.slice(0, elementInfo.splitStart));
				const node2 = document.createTextNode(textContent.slice(elementInfo.splitStart, elementInfo.splitEnd));
				const node3 = document.createTextNode(textContent.slice(elementInfo.splitEnd));
				markElement.appendChild(node2);

				parentElement.insertBefore(node1, node);
				parentElement.insertBefore(markElement, node);
				parentElement.replaceChild(node3, node);
			}
		}
	}
}
