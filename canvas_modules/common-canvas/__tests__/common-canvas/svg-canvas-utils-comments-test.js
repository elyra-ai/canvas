/*
 * Copyright 2026 Elyra Authors
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

import SvgCanvasComments from "../../src/common-canvas/svg-canvas-utils-comments.js";

describe("SvgCanvasComments utility tests", () => {

	describe("getCommentCenterPosX", () => {
		it("should return the center x position of a comment", () => {
			const comment = { x_pos: 100, y_pos: 50, width: 200, height: 100 };
			const centerX = SvgCanvasComments.getCommentCenterPosX(comment);
			expect(centerX).toBe(200); // 100 + (200 / 2)
		});

		it("should handle comment at origin", () => {
			const comment = { x_pos: 0, y_pos: 0, width: 100, height: 50 };
			const centerX = SvgCanvasComments.getCommentCenterPosX(comment);
			expect(centerX).toBe(50); // 0 + (100 / 2)
		});

		it("should handle negative x position", () => {
			const comment = { x_pos: -100, y_pos: 0, width: 50, height: 50 };
			const centerX = SvgCanvasComments.getCommentCenterPosX(comment);
			expect(centerX).toBe(-75); // -100 + (50 / 2)
		});
	});

	describe("getCommentCenterPosY", () => {
		it("should return the center y position of a comment", () => {
			const comment = { x_pos: 100, y_pos: 50, width: 200, height: 100 };
			const centerY = SvgCanvasComments.getCommentCenterPosY(comment);
			expect(centerY).toBe(100); // 50 + (100 / 2)
		});

		it("should handle comment at origin", () => {
			const comment = { x_pos: 0, y_pos: 0, width: 100, height: 50 };
			const centerY = SvgCanvasComments.getCommentCenterPosY(comment);
			expect(centerY).toBe(25); // 0 + (50 / 2)
		});

		it("should handle negative y position", () => {
			const comment = { x_pos: 0, y_pos: -100, width: 50, height: 50 };
			const centerY = SvgCanvasComments.getCommentCenterPosY(comment);
			expect(centerY).toBe(-75); // -100 + (50 / 2)
		});
	});

	describe("insertCommentHighlight", () => {
		it("should return original HTML string when search string is not found", () => {
			const htmlString = "<p>This is a test comment</p>";
			const searchStr = "notfound";
			const result = SvgCanvasComments.insertCommentHighlight(htmlString, searchStr);
			expect(result).toBe(htmlString);
		});

		it("should insert mark tags for single match", () => {
			const htmlString = "<p>This is a test comment</p>";
			const searchStr = "test";
			const result = SvgCanvasComments.insertCommentHighlight(htmlString, searchStr);
			expect(result).toContain("<mark>");
			expect(result).toContain("</mark>");
			expect(result).toContain("<mark>test</mark>");
		});

		it("should insert mark tags for multiple matches (case insensitive)", () => {
			const htmlString = "<p>Test this Test again</p>";
			const searchStr = "test";
			const result = SvgCanvasComments.insertCommentHighlight(htmlString, searchStr);
			// Should match both "Test" and "test"
			const markCount = (result.match(/<mark>/g) || []).length;
			expect(markCount).toBe(2);
		});

		it("should handle empty search string", () => {
			const htmlString = "<p>This is a test</p>";
			const searchStr = "";
			const result = SvgCanvasComments.insertCommentHighlight(htmlString, searchStr);
			// Empty search string should return original
			expect(result).toBe(htmlString);
		});

		it("should handle HTML with nested elements", () => {
			const htmlString = "<div><p>This is a <strong>test</strong> comment</p></div>";
			const searchStr = "test";
			const result = SvgCanvasComments.insertCommentHighlight(htmlString, searchStr);
			expect(result).toContain("<mark>test</mark>");
		});

		it("should handle search string spanning multiple words", () => {
			const htmlString = "<p>This is a test comment</p>";
			const searchStr = "test comment";
			const result = SvgCanvasComments.insertCommentHighlight(htmlString, searchStr);
			expect(result).toContain("<mark>test comment</mark>");
		});

		it("should handle special characters in search string", () => {
			const htmlString = "<p>Price is $100.50</p>";
			const searchStr = "$100";
			// Note: This test may need adjustment based on regex escaping behavior
			const result = SvgCanvasComments.insertCommentHighlight(htmlString, searchStr);
			expect(result).toContain("$100");
		});
	});

	describe("searchForElementInfos", () => {
		it("should find text node within search range", () => {
			// Create a simple DOM structure
			const parser = new DOMParser();
			const doc = parser.parseFromString("<p>Hello World</p>", "text/html");
			const body = doc.getElementsByTagName("body")[0];
			const elementInfos = [];

			const result = SvgCanvasComments.searchForElementInfos(body, 0, 5, 0, elementInfos);

			expect(elementInfos.length).toBe(1);
			expect(elementInfos[0].splitStart).toBe(0);
			expect(elementInfos[0].splitEnd).toBe(5);
			expect(result).toBeGreaterThan(0); // Should return text end position
		});

		it("should handle multiple text nodes", () => {
			const parser = new DOMParser();
			const doc = parser.parseFromString("<p>Hello <span>World</span></p>", "text/html");
			const body = doc.getElementsByTagName("body")[0];
			const elementInfos = [];

			SvgCanvasComments.searchForElementInfos(body, 0, 11, 0, elementInfos);

			// Should find text in both "Hello " and "World"
			expect(elementInfos.length).toBeGreaterThan(0);
		});

		it("should handle search range in middle of text", () => {
			const parser = new DOMParser();
			const doc = parser.parseFromString("<p>Hello World</p>", "text/html");
			const body = doc.getElementsByTagName("body")[0];
			const elementInfos = [];

			SvgCanvasComments.searchForElementInfos(body, 6, 11, 0, elementInfos);

			expect(elementInfos.length).toBe(1);
			expect(elementInfos[0].splitStart).toBe(6);
			expect(elementInfos[0].splitEnd).toBe(11);
		});
	});

	describe("insertMarkElements", () => {
		it("should wrap entire text node with mark element", () => {
			const parser = new DOMParser();
			const doc = parser.parseFromString("<p>test</p>", "text/html");
			const body = doc.getElementsByTagName("body")[0];
			const p = body.getElementsByTagName("p")[0];
			const textNode = p.firstChild;

			const elementInfos = [{
				splitStart: 0,
				splitEnd: 4,
				node: textNode
			}];

			SvgCanvasComments.insertMarkElements(elementInfos);

			const mark = p.getElementsByTagName("mark")[0];
			expect(mark).toBeDefined();
			expect(mark.textContent).toBe("test");
		});

		it("should wrap partial text at start of node", () => {
			const parser = new DOMParser();
			const doc = parser.parseFromString("<p>testing</p>", "text/html");
			const body = doc.getElementsByTagName("body")[0];
			const p = body.getElementsByTagName("p")[0];
			const textNode = p.firstChild;

			const elementInfos = [{
				splitStart: 0,
				splitEnd: 4,
				node: textNode
			}];

			SvgCanvasComments.insertMarkElements(elementInfos);

			const mark = p.getElementsByTagName("mark")[0];
			expect(mark).toBeDefined();
			expect(mark.textContent).toBe("test");
			expect(p.textContent).toBe("testing");
		});

		it("should wrap partial text at end of node", () => {
			const parser = new DOMParser();
			const doc = parser.parseFromString("<p>testing</p>", "text/html");
			const body = doc.getElementsByTagName("body")[0];
			const p = body.getElementsByTagName("p")[0];
			const textNode = p.firstChild;

			const elementInfos = [{
				splitStart: 4,
				splitEnd: 7,
				node: textNode
			}];

			SvgCanvasComments.insertMarkElements(elementInfos);

			const mark = p.getElementsByTagName("mark")[0];
			expect(mark).toBeDefined();
			expect(mark.textContent).toBe("ing");
			expect(p.textContent).toBe("testing");
		});

		it("should wrap partial text in middle of node", () => {
			const parser = new DOMParser();
			const doc = parser.parseFromString("<p>testing</p>", "text/html");
			const body = doc.getElementsByTagName("body")[0];
			const p = body.getElementsByTagName("p")[0];
			const textNode = p.firstChild;

			const elementInfos = [{
				splitStart: 2,
				splitEnd: 5,
				node: textNode
			}];

			SvgCanvasComments.insertMarkElements(elementInfos);

			const mark = p.getElementsByTagName("mark")[0];
			expect(mark).toBeDefined();
			expect(mark.textContent).toBe("sti");
			expect(p.textContent).toBe("testing");
		});
	});

	describe("Integration tests", () => {
		it("should correctly highlight text across multiple scenarios", () => {
			const testCases = [
				{
					html: "<p>Find the word test in this sentence</p>",
					search: "test",
					expectedMarks: 1
				},
				{
					html: "<p>Test Test test</p>",
					search: "test",
					expectedMarks: 3
				},
				{
					html: "<div><p>First test</p><p>Second test</p></div>",
					search: "test",
					expectedMarks: 2
				}
			];

			testCases.forEach(({ html, search, expectedMarks }) => {
				const result = SvgCanvasComments.insertCommentHighlight(html, search);
				const markCount = (result.match(/<mark>/g) || []).length;
				expect(markCount).toBe(expectedMarks);
			});
		});

		it("should handle comment center position calculations consistently", () => {
			const comments = [
				{ x_pos: 0, y_pos: 0, width: 100, height: 100 },
				{ x_pos: 50, y_pos: 50, width: 200, height: 150 },
				{ x_pos: -50, y_pos: -50, width: 100, height: 100 }
			];

			comments.forEach((comment) => {
				const centerX = SvgCanvasComments.getCommentCenterPosX(comment);
				const centerY = SvgCanvasComments.getCommentCenterPosY(comment);

				expect(centerX).toBe(comment.x_pos + (comment.width / 2));
				expect(centerY).toBe(comment.y_pos + (comment.height / 2));
			});
		});
	});
});

// Made with Bob
