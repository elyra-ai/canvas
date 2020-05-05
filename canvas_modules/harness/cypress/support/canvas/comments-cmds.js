/*
 * Copyright 2017-2020 IBM Corporation
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

Cypress.Commands.add("getCommentWithText", (commentText) =>
	cy.get(getCommentGrpSelector())
		.then((grpArray) => findGrpForText(grpArray, commentText)));

Cypress.Commands.add("getCommentWithTextInSubFlow", (commentText) =>
	cy.get(getCommentGrpSelectorInSubFlow())
		.then((grpArray) => findGrpForText(grpArray, commentText)));

Cypress.Commands.add("getCommentWithTextInSubFlowNested", (commentText) =>
	cy.get(getCommentGrpSelectorInSubFlowNested())
		.then((grpArray) => findGrpForText(grpArray, commentText)));

function getCommentGrpSelector() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g[data-id^=comment_grp_${inst}]`;
	return selector;
}

function getCommentGrpSelectorInSubFlow() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > svg > g > g[data-id^=comment_grp_${inst}]`;
	return selector;
}

function getCommentGrpSelectorInSubFlowNested() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > svg > g > g > svg > g > g[data-id^=comment_grp_${inst}]`;
	return selector;
}

function findGrpForText(grpArray, commentText) {
	for (let idx = 0; idx < grpArray.length; idx++) {
		if (grpArray[idx].__data__.content === commentText) {
			return grpArray[idx];
		}
	}
	return null;
}

Cypress.Commands.add("ctrlOrCmdClickComment", (commentText) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey()
		.then((selectedKey) => {
			cy.get("body")
				.type(selectedKey, { release: false })
				.getCommentWithText(commentText)
				.click();
		});
});

Cypress.Commands.add("getNumberOfSelectedComments", () => {
	cy.get(".d3-comment-selection-highlight")
		.then((comments) => {
			const selectedComments = comments.filter((idx) => comments[idx].getAttribute("data-selected") === "yes");
			return selectedComments.length;
		});
});

Cypress.Commands.add("editTextInComment", (originalCommentText, newCommentText) => {
	cy.getCommentWithText(originalCommentText)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);
});

Cypress.Commands.add("editTextInCommentInSubFlow", (originalCommentText, newCommentText) => {
	cy.getCommentWithTextInSubFlow(originalCommentText)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);
});

Cypress.Commands.add("editTextInCommentInSubFlowNested", (originalCommentText, newCommentText) => {
	cy.getCommentWithTextInSubFlowNested(originalCommentText)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);
});

Cypress.Commands.add("linkCommentToNode", (commentText, nodeLabel) => {
	// Click the comment at topLeft corner to display the guide
	// srcSelector is the selector of guide
	cy.getCommentWithText(commentText).click(0, 0)
		.then((comment) => {
			const srcSelector = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "port") + "']";
			cy.getNodeDimensions(nodeLabel).then((nodeDimensions) => {
				// Target canvas position within the center of the target node
				const canvasX = nodeDimensions.x_pos + (nodeDimensions.width / 2);
				const canvasY = nodeDimensions.y_pos + (nodeDimensions.height / 2);

				cy.dragAndDrop(srcSelector, 0, 0, ".svg-area", canvasX, canvasY);
			});
		});
});

Cypress.Commands.add("dragAndDrop", (srcSelector, srcXPos, srcYPos, trgSelector, trgXPos, trgYPos) => {
	cy.get(srcSelector)
		.trigger("mousedown", srcXPos, srcYPos, { force: true });
	cy.get(trgSelector)
		.trigger("mousemove", trgXPos, trgYPos)
		.trigger("mouseup", trgXPos, trgYPos);
});

Cypress.Commands.add("resizeComment", (commentText, corner, newWidth, newHeight) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const srcBodySelector = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "body") + "']";
			const srcSizingSelector = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "sizing") + "']";

			cy.getCommentDimensions(srcBodySelector).then((commentDimensions) => {
				const offsetForSizingArea = 10; // Offset from edge of body to somewhere in sizing area
				let canvasX;
				let canvasY;
				let startPosition;

				if (corner === "north-west") {
					canvasX = commentDimensions.x_pos - (newWidth - commentDimensions.width) - offsetForSizingArea;
					canvasY = commentDimensions.y_pos - (newHeight - commentDimensions.height) - offsetForSizingArea;
					startPosition = "topLeft";

				} else if (corner === "north-east") {
					canvasX = commentDimensions.x_pos + newWidth + offsetForSizingArea;
					canvasY = commentDimensions.y_pos - (newHeight - commentDimensions.height) - offsetForSizingArea;
					startPosition = "topRight";

				} else if (corner === "south-west") {
					canvasX = commentDimensions.x_pos - (newWidth - commentDimensions.width) - offsetForSizingArea;
					canvasY = commentDimensions.y_pos + newHeight + offsetForSizingArea;
					startPosition = "bottomLeft";

				} else { // "south-east"
					canvasX = commentDimensions.x_pos + newWidth + offsetForSizingArea;
					canvasY = commentDimensions.y_pos + newHeight + offsetForSizingArea;
					startPosition = "bottomRight";
				}

				cy.window().then((win) => {
					cy.get(srcSizingSelector)
						.trigger("mouseenter", startPosition, { view: win })
						.trigger("mousedown", startPosition, { view: win });
					cy.get(".svg-area")
						.trigger("mousemove", canvasX, canvasY, { view: win })
						.trigger("mouseup", canvasX, canvasY, { view: win });
				});
			});
		});
});

Cypress.Commands.add("resizeCommentOneDirection", (commentText, corner, newValue) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const srcBodySelector = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "body") + "']";
			const srcSizingSelector = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "sizing") + "']";

			cy.getCommentDimensions(srcBodySelector).then((commentDimensions) => {
				const offsetForSizingArea = 10; // Offset from edge of body to somewhere in sizing area
				let canvasX;
				let canvasY;
				let startPosition;

				if (corner === "north") {
					canvasX = commentDimensions.x_pos + (commentDimensions.width / 2);
					canvasY = commentDimensions.y_pos - (newValue - commentDimensions.height) - offsetForSizingArea;
					startPosition = "top";

				} else if (corner === "east") {
					canvasX = commentDimensions.x_pos + newValue + offsetForSizingArea;
					canvasY = commentDimensions.y_pos - (commentDimensions.height / 2);
					startPosition = "right";

				} else if (corner === "west") {
					canvasX = commentDimensions.x_pos - (newValue - commentDimensions.width) - offsetForSizingArea;
					canvasY = commentDimensions.y_pos + (commentDimensions.height / 2);
					startPosition = "left";

				} else { // "south"
					canvasX = commentDimensions.x_pos + (commentDimensions.width / 2);
					canvasY = commentDimensions.y_pos + newValue + offsetForSizingArea;
					startPosition = "bottom";
				}

				cy.window().then((win) => {
					cy.get(srcSizingSelector)
						.trigger("mouseenter", startPosition, { view: win })
						.trigger("mousedown", startPosition, { view: win });
					cy.get(".svg-area")
						.trigger("mousemove", canvasX, canvasY, { view: win })
						.trigger("mouseup", canvasX, canvasY, { view: win });
				});
			});
		});
});

Cypress.Commands.add("getCommentDimensions", (commentSelector) => {
	cy.get(commentSelector).then((comment) => {
		const commentDimensions = {
			x_pos: Math.round(comment[0].__data__.x_pos),
			y_pos: Math.round(comment[0].__data__.y_pos),
			width: comment[0].__data__.width,
			height: comment[0].__data__.height
		};
		return commentDimensions;
	});
});
