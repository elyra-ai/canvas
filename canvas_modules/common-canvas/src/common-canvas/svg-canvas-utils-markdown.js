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

export default class SvgCanvasUtilsComments {

	// Returns a string which is the input text passed in with markdown characters
	// added based on the selected part of the text, defined by start and end,
	// and the action.
	static addMarkdownCharacters(text, start, end, action) {
		let newText = text;

		if (typeof start !== "undefined" &&
				typeof end !== "undefined" &&
				start < end) {
			switch (action) {
			case "bold": {
				newText = this.wrapCharacters(newText, start, end, "**");
				break;
			}
			case "italics": {
				newText = this.wrapCharacters(newText, start, end, "*");
				break;
			}
			case "strikethrough": {
				newText = this.wrapCharacters(newText, start, end, "~~");
				break;
			}
			case "code": {
				if ((start === 0 || newText[start] === "\n" || newText[start - 1] === "\n") &&
						(end === newText.length || newText[end] === "\n" || newText[end - 1] === "\n")) {
					newText = this.wrapCharactersInTripleBackTicks(newText, start, end);
				} else {
					newText = this.wrapCharacters(newText, start, end, "`");
				}
				break;
			}
			case "bulletedList": {
				newText = this.addCharactersForList(newText, start, end, false);
				break;
			}
			case "numberedList": {
				newText = this.addCharactersForList(newText, start, end, true);
				break;
			}
			default: {
				break;
			}
			}
		}
		return newText;
	}

	static wrapCharacters(text, start, end, chars) {
		const firstText = this.insertCharacters(text, start, chars);
		return this.insertCharacters(firstText, end + chars.length, chars);
	}

	static insertCharacters(text, pos, chars) {
		return text.slice(0, pos) + chars + text.slice(pos);
	}

	static wrapCharactersInTripleBackTicks(text, start, end) {
		let newText = "";
		if (start === 0) {
			newText = "```\n" + text;
		} else if (text[start] === "\n") {
			newText = text.slice(0, start) + "\n```" + text.slice(start);
		} else if (text[start - 1] === "\n") {
			newText = text.slice(0, start) + "```\n" + text.slice(start);
		}
		// Increament the end point by 4 -- for the three backticks plus one
		//  newline character added at the start point.
		const newEnd = end + 4;

		if (newEnd === newText.length) {
			if (newText[newEnd - 1] !== "\n" && newText[newEnd] !== "\n") {
				newText += "\n";
			}
			newText += "```\n";
		} else if (newText[newEnd] === "\n") {
			newText = newText.slice(0, newEnd) + "\n```" + newText.slice(newEnd);
		} else if (newText[newEnd - 1] === "\n") {
			newText = newText.slice(0, newEnd) + "```\n" + newText.slice(newEnd);
		}

		return newText;
	}

	static addCharactersForList(text, inStart, inEnd, numbered) {
		const idxStart = text.lastIndexOf("\n", inStart);
		const start = idxStart === -1 ? 0 : idxStart;

		const idxEnd = text.indexOf("\n", inEnd - 1);
		const end = idxEnd === -1 ? text.length : idxEnd;

		let startText = text.slice(0, start);
		const selectedText = text.slice(start, end);
		let endText = text.slice(end);
		let beginNumber = 1;

		if (start === 0) {
			startText = numbered ? "1. " : "* ";
			beginNumber = 2;
		}

		const middleText = numbered
			? this.insertNumbers(selectedText, beginNumber)
			: this.insertAsterisks(selectedText);

		if (endText === "") {
			endText = "\n" + endText;
		}

		if (middleText.length > selectedText.length &&
				!this.endsInTwoNewLines(middleText, endText)) {
			endText = "\n" + endText;
		}

		return startText + middleText + endText;
	}

	static endsInTwoNewLines(middleText, endText) {
		return (endText.startsWith("\n\n") ||
			(middleText.endsWith("\n") && endText.startsWith("\n")));
	}

	static insertAsterisks(text) {
		if (text.endsWith("\n")) {
			return this.insertAsterisksAtNewLines(text.slice(0, text.length - 1)) + "\n";
		}
		return this.insertAsterisksAtNewLines(text);
	}

	static insertAsterisksAtNewLines(text) {
		return text.replace(/\n/g, "\n* ");
	}

	static insertNumbers(text, beginNumber) {
		let newText = "";
		let idx = beginNumber;

		for (let i = 0; i < text.length; i++) {
			if (text[i] === "\n") {
				newText += `\n${idx}. `;
				idx++;
			} else {
				newText += text[i];
			}
		}
		return newText;
	}
}
