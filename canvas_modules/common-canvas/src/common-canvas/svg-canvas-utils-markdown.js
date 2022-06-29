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

	// Processes the action passed in and returns an object containing:
	// newText - new text based on the input text passed in with markdown
	//           characters added based on the selected part of the text
	// newStart - a new starting point for selection highlighting
	// newEnd - a new ending point for selection highlighting
	static processMarkdownAction(action, text, inStart, inEnd) {
		let start = inStart;
		let end = inEnd;
		let mdObj = null;

		if (start === end) {
			start = this.findFirstSpace(text, start);
			end = this.findLastSpace(text, end);

		} else if (this.allWhiteSpace(text, start, end)) {
			start = end;

		} else {
			start = this.findFirstNonSpace(text, start, end);
			end = this.findLastNonSpace(text, start, end);
		}

		switch (action) {
		case "header": {
			mdObj = this.processHeaderCommand(text, start, end);
			break;
		}
		case "bold": {
			mdObj = this.processWrapCommand(text, start, end, "**");
			break;
		}
		case "italics": {
			mdObj = this.processWrapCommand(text, start, end, "_");
			break;
		}
		case "strikethrough": {
			mdObj = this.processWrapCommand(text, start, end, "~~");
			break;
		}
		case "code": {
			mdObj = this.processCodeCommand(text, start, end);
			break;
		}
		case "link": {
			mdObj = this.processLinkCommand(text, start, end);
			break;
		}
		case "quote":
		case "numberedList":
		case "bulletedList": {
			mdObj = this.processMultiLineCommand(text, start, end, action);
			break;
		}
		default: {
			break;
		}
		}
		return mdObj;
	}

	static findFirstSpace(text, start) {
		const spacePos = text.lastIndexOf(" ", start - 1) + 1;
		const newLinePos = text.lastIndexOf("\n", start - 1) + 1;
		return Math.max(spacePos, newLinePos, 0);
	}

	static findLastSpace(text, end) {
		let spacePos = text.indexOf(" ", end);
		let newLinePos = text.indexOf("\n", end);
		spacePos = spacePos === -1 ? text.length : spacePos;
		newLinePos = newLinePos === -1 ? text.length : newLinePos;
		return Math.min(spacePos, newLinePos, text.length);
	}

	static allWhiteSpace(text, start, end) {
		return text.slice(start, end).trim().length === 0;
	}

	static findFirstNonSpace(text, start, end) {
		let newStart = start;
		while ((text[newStart] === " " || text[newStart] === "\n") && newStart <= end) {
			newStart++;
		}
		return newStart;
	}

	static findLastNonSpace(text, start, end) {
		let newEnd = end;
		while ((text[newEnd - 1] === " " || text[newEnd - 1] === "\n") && newEnd >= start) {
			newEnd--;
		}
		return newEnd;
	}

	static processHeaderCommand(text, inStart, inEnd, chars) {
		const start = this.findPrecedingNewLine(text, inStart);
		const end = this.findSuceedingNewLine(text, inEnd);

		const startText = text.slice(0, start);
		const selectedText = text.slice(start, end);
		const endText = text.slice(end);

		let newStart = start;
		let newEnd = end;
		let newText = "";

		if (selectedText.startsWith("### ")) {
			newText = startText + selectedText.slice(4) + endText;
			newEnd -= 4;

		} else {
			newText = startText + "### " + selectedText + endText;
			newStart += 4;
			newEnd += 4;
		}

		return { newText, newStart, newEnd };
	}

	static processWrapCommand(text, start, end, chars) {
		let newText = "";
		let newStart = start;
		let newEnd = end;

		const startText = text.slice(0, start);
		const selectedText = text.slice(start, end);
		const endText = text.slice(end);
		const charsCount = chars.length;

		if (startText.endsWith(chars) && endText.startsWith(chars)) {
			newText = startText.slice(0, startText.length - charsCount) +
				selectedText +
				endText.slice(charsCount);
			newStart = start - charsCount;
			newEnd = end - charsCount;

		} else if (selectedText.startsWith(chars) && selectedText.endsWith(chars)) {
			newText = startText +
				selectedText
					.slice(0, selectedText.length - charsCount) // Remove ending chars
					.slice(charsCount) + // Remove beginning chars
				endText;
			newStart = start;
			newEnd = end - (2 * charsCount);

		} else {
			newText = startText + chars + selectedText + chars + endText;
			newStart = start + charsCount;
			newEnd = end + charsCount;
		}

		return { newText, newStart, newEnd };
	}

	static processCodeCommand(text, start, end) {
		const selText = text.slice(start, end);
		if (selText.indexOf("\n") > -1) {
			return this.processTripleBackTicks(text, start, end);
		}

		return this.processWrapCommand(text, start, end, "`");
	}

	static processTripleBackTicks(text, inStart, inEnd) {
		const start = this.findPrecedingNewLine(text, inStart);
		const end = this.findSuceedingNewLine(text, inEnd);

		const startText = text.slice(0, start);
		const selectedText = text.slice(start, end);
		const endText = text.slice(end);

		let newStart = start;
		let newEnd = end;
		let newText = "";

		if (startText.endsWith("```\n") && endText.startsWith("\n```")) {
			newText = startText.slice(0, start - 4) + selectedText + endText.slice(4);
			newStart -= 4;
			newEnd -= 4;

		} else {
			newText = startText + "```\n" + selectedText + "\n```" + endText;
			newStart += 4;
			newEnd += 4;
		}

		return { newText, newStart, newEnd };
	}

	static processLinkCommand(text, start, end) {
		let newText = "";
		let newStart = start;
		let newEnd = end;

		const startText = text.slice(0, start);
		const selectedText = text.slice(start, end);
		const endText = text.slice(end);

		if (this.isTexAlreadyinLink(startText, endText)) {
			newText = startText.slice(0, startText.length - 1) +
				selectedText +
				endText.slice(6);
			newStart = start - 1;
			newEnd = end - 1;

		} else if (start === end) {
			newText = startText + "[](url)" + endText;
			newStart = start + 1;
			newEnd = start + 1;

		} else {
			newText = startText + "[" + selectedText + "](url)" + endText;
			newStart = start + 1;
			newEnd = end + 1;
		}

		return { newText, newStart, newEnd };
	}

	static isTexAlreadyinLink(startText, endText) {
		return startText.endsWith("[") && endText.startsWith("](url)");
	}

	static processMultiLineCommand(text, start, end, action) {
		if (this.isMultiLineMarkdown(text, start, end, action)) {
			return this.removeMultiLineMarkdown(text, start, end, action);
		}
		return this.addMultiLineMarkdown(text, start, end, action);
	}

	static isMultiLineMarkdown(text, inStart, inEnd, action) {
		const start = this.findPrecedingNewLine(text, inStart);
		const end = this.findSuceedingNewLine(text, inEnd);
		const selectedText = text.slice(start, end);

		const lines = selectedText.split("\n");
		let isMultiLineItem = true;
		for (let i = 0; i < lines.length; i++) {
			if (!this.isMultiLineItem(lines[i], action)) {
				isMultiLineItem = false;
			}
		}
		return isMultiLineItem;
	}

	static isMultiLineItem(text, action) {
		switch (action) {
		case "quote":
			return text.startsWith("> ");
		case "bulletedList":
			return text.startsWith("* ");
		case "numberedList": {
			const firstSpace = text.indexOf(". ");
			const firstText = text.slice(0, firstSpace);
			const number = Number(firstText);
			return (!isNaN(number) && number > 0);
		}
		default:
		}
		return false;
	}

	static removeMultiLineMarkdown(text, inStart, inEnd, action) {
		const start = this.findPrecedingNewLine(text, inStart);
		const end = this.findSuceedingNewLine(text, inEnd);

		const startText = text.slice(0, start);
		const selectedText = text.slice(start, end);
		const endText = text.slice(end);

		const newStart = start;
		let newEnd = end;
		let newText = startText;

		const lines = selectedText.split("\n");
		for (let i = 0; i < lines.length; i++) {
			const newLine = this.removeListPrefix(lines[i], action);
			newEnd -= (lines[i].length - newLine.length);
			newText += newLine;
			if (i < lines.length - 1) {
				newText += "\n";
			}
		}
		newText += endText;

		return { newText, newStart, newEnd };
	}

	static removeListPrefix(text, action) {
		switch (action) {
		case "quote":
			return text.slice(2); // Remove 2 characters: "> "
		case "bulletedList":
			return text.slice(2); // Remove 2 characters: "* "
		case "numberedList": {
			const firstSpace = text.indexOf(". "); // Remove characters: "5. " or "10. "
			return text.slice(firstSpace + 2);
		}
		default:
		}
		return "";
	}

	static addMultiLineMarkdown(text, inStart, inEnd, action) {
		const start = this.findPrecedingNewLine(text, inStart);
		const end = this.findSuceedingNewLine(text, inEnd);

		const startText = text.slice(0, start);
		const selectedText = text.slice(start, end);
		const endText = text.slice(end);

		let newStart = start;
		let newEnd = end;
		let newText = startText;

		if (selectedText === "") {
			const itemText = this.getListPrefix(action, 1);
			newText = startText + itemText + endText;
			newStart = start + itemText.length;
			newEnd = newStart;

		} else {
			const lines = selectedText.split("\n");
			lines.forEach((line, i) => {
				const newLine = this.getListPrefix(action, i + 1, lines[i]);
				newEnd += (newLine.length - lines[i].length);
				newText += newLine;

				if (i === lines.length - 1) {
					if (text[end] !== "\n" || text[end + 1] !== "\n") {
						newText += "\n";
					}
				} else {
					newText += "\n";
				}
			});
			newText += endText;
		}

		return { newText, newStart, newEnd };
	}

	static getListPrefix(action, i, suffixText = "") {
		switch (action) {
		case "quote":
			return "> " + suffixText;
		case "bulletedList":
			return "* " + suffixText;
		case "numberedList":
			return i + ". " + suffixText;
		default:
		}
		return null;
	}

	static findPrecedingNewLine(text, start) {
		let preStart = start;
		while (preStart > 0 && text[preStart - 1] !== "\n") {
			preStart--;
		}
		return preStart;
	}

	static findSuceedingNewLine(text, end) {
		let sucEnd = end;
		while (sucEnd < text.length && text[sucEnd] !== "\n") {
			sucEnd++;
		}
		return sucEnd;
	}
}
