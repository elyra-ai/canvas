/*
 * Copyright 2017-2020 Elyra Authors
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
/* eslint max-len: "off" */

Cypress.Commands.add("getCommentWithText", (commentText) => {
	cy.get("body").then(($body) => {
		if ($body.find(".d3-comment-group").length) {
			cy.get(getCommentGrpSelector())
				.then((grpArray) => findGrpForText(grpArray, commentText));
		}
		// No comments found on canvas
		return null;
	});
});

Cypress.Commands.add("getCommentWithTextInSubFlow", (commentText) =>
	cy.get(getCommentGrpSelectorInSubFlow())
		.then((grpArray) => findGrpForText(grpArray, commentText)));

Cypress.Commands.add("getCommentWithTextInSubFlowNested", (commentText) =>
	cy.get(getCommentGrpSelectorInSubFlowNested())
		.then((grpArray) => findGrpForText(grpArray, commentText)));

Cypress.Commands.add("getCommentWithTextInSupernode", (commentText, supernodeName) => {
	cy.getNodeWithLabel(supernodeName)
		.then((supernode) => {
			const supernodeId = supernode[0].getAttribute("data-id").substring(11);
			cy.get(getCommentGrpSelectorInSupernode(supernodeId))
				.then((grpArray) => findGrpForText(grpArray, commentText));
		});
});

function getCommentGrpSelector() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > g[data-id^=comment_grp_${inst}]`;
	return selector;
}

function getCommentGrpSelectorInSubFlow() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > g > svg > g > g > g[data-id^=comment_grp_${inst}]`;
	return selector;
}

function getCommentGrpSelectorInSubFlowNested() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > g > svg > g > g > g > svg > g > g > g[data-id^=comment_grp_${inst}]`;
	return selector;
}

function getCommentGrpSelectorInSupernode(supernodeId) {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector =
	`div > svg > g > g > g[data-id='node_grp_${inst}_${supernodeId}'] > svg > g > g > g[data-id^='comment_grp_${inst}']`;
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
			// Cancel the command/ctrl key press -- the documentation doesn't say
			// this needs to be done but if it isn't the command key stays pressed down
			// causing problems with subsequent selections.
			cy.get("body")
				.type(selectedKey, { release: true });
		});
});

Cypress.Commands.add("ctrlOrCmdClickCommentInSupernode", (commentText, supernodeName) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey()
		.then((selectedKey) => {
			cy.get("body")
				.type(selectedKey, { release: false })
				.getCommentWithTextInSupernode(commentText, supernodeName)
				.click();

			// Cancel the command/ctrl key press
			cy.get("body")
				.type(selectedKey, { release: true });
		});
});

Cypress.Commands.add("getNumberOfSelectedComments", () => {
	cy.getSelectedComments()
		.then((selectedComments) => selectedComments.length);
});

Cypress.Commands.add("getSelectedComments", () => {
	cy.document().then((doc) => {
		const selectedComments = doc.canvasController.getSelectedComments();
		return selectedComments;
	});
});

Cypress.Commands.add("isCommentSelected", (commentText) => {
	cy.getSelectedComments()
		.then((selectedComments) => {
			const idx = selectedComments.findIndex((selComment) => selComment.content === commentText);
			if (idx > -1) {
				return true;
			}
			return false;
		});
});

Cypress.Commands.add("editTextInComment", (originalCommentText, newCommentText) => {
	cy.getCommentWithText(originalCommentText)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);

	// Click somewhere on canvas to save comment
	cy.get(`#canvas-div-${document.instanceId}`).click(2, 2);
});

Cypress.Commands.add("editTextInCommentInSubFlow", (originalCommentText, newCommentText) => {
	cy.getCommentWithTextInSubFlow(originalCommentText)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);

	// Click somewhere on canvas to save comment
	cy.get(`#canvas-div-${document.instanceId}`).click();
});

Cypress.Commands.add("editTextInCommentInSubFlowNested", (originalCommentText, newCommentText) => {
	cy.getCommentWithTextInSubFlowNested(originalCommentText)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);

	// Click somewhere on canvas to save comment
	cy.get("#canvas-div-0").click();
});

Cypress.Commands.add("editTextInCommentInSupernode", (originalCommentText, newCommentText, supernodeName) => {
	cy.getCommentWithTextInSupernode(originalCommentText, supernodeName)
		.dblclick()
		.get("textarea")
		.clear()
		.type(newCommentText);

	// Click somewhere on canvas to save comment
	cy.get("#canvas-div-0").click();
});

Cypress.Commands.add("addCommentToPosition", (commentText, canvasX, canvasY) => {
	cy.rightClickToDisplayContextMenu(canvasX, canvasY);
	cy.clickOptionFromContextMenu("New comment");
	cy.editTextInComment("", commentText);
});

Cypress.Commands.add("moveCommentToPosition", (commentText, canvasX, canvasY) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const srcSelector = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "text") + "'] > div";
			cy.getCanvasTranslateCoords()
				.then((transform) => {
					cy.window().then((win) => {
						cy.get(srcSelector)
							.trigger("mousedown", "topLeft", { which: 1, view: win });
						cy.get("#canvas-div-0")
							.trigger("mousemove", canvasX + transform.x, canvasY + transform.y, { view: win })
							.trigger("mouseup", { which: 1, view: win });
					});
				});
		});
});

Cypress.Commands.add("linkCommentToNode", (commentText, nodeLabel) => {
	// Click the comment at topLeft corner to display the guide
	// srcSelector is the selector of guide
	cy.getCommentWithText(commentText).then((comment) => {
		const sel = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "text") + "'] > div";
		cy.get(sel).click();

		cy.document().then((doc) => {
			// Connection Type - Halo
			let srcSelector;
			if (doc.canvasController.getCanvasConfig().enableConnectionType === "Halo") {
				srcSelector = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "halo") + "']";
			} else {
				// Connection Type - Ports
				srcSelector = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "port") + "']";
			}
			cy.getNodeDimensions(nodeLabel).then((nodeDimensions) => {
				// Target canvas position within the center of the target node
				const canvasX = nodeDimensions.x_pos + (nodeDimensions.width / 2);
				const canvasY = nodeDimensions.y_pos + (nodeDimensions.height / 2);

				cy.dragAndDrop(srcSelector, 0, 0, ".svg-area", canvasX, canvasY);
			});
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
				const addOffsetForSizingArea = 9; // Offset from edge of body to somewhere in sizing area
				const subtractOffsetForSizingArea = 10; // Adding two offset values to adjust the comment dimensions
				let canvasX;
				let canvasY;
				let startPosition;

				if (corner === "north-west") {
					canvasX = commentDimensions.x_pos - (newWidth - commentDimensions.width) - subtractOffsetForSizingArea;
					canvasY = commentDimensions.y_pos - (newHeight - commentDimensions.height) - subtractOffsetForSizingArea;
					startPosition = "topLeft";

				} else if (corner === "north-east") {
					canvasX = commentDimensions.x_pos + newWidth + addOffsetForSizingArea;
					canvasY = commentDimensions.y_pos - (newHeight - commentDimensions.height) - subtractOffsetForSizingArea;
					startPosition = "topRight";

				} else if (corner === "south-west") {
					canvasX = commentDimensions.x_pos - (newWidth - commentDimensions.width) - subtractOffsetForSizingArea;
					canvasY = commentDimensions.y_pos + newHeight + addOffsetForSizingArea;
					startPosition = "bottomLeft";

				} else { // "south-east"
					canvasX = commentDimensions.x_pos + newWidth + addOffsetForSizingArea;
					canvasY = commentDimensions.y_pos + newHeight + addOffsetForSizingArea;
					startPosition = "bottomRight";
				}

				cy.window().then((win) => {
					cy.getCanvasTranslateCoords()
						.then((transform) => {
							cy.get(srcSizingSelector)
								.trigger("mouseenter", startPosition, { view: win })
								.trigger("mousedown", startPosition, { view: win });
							cy.get("#canvas-div-0")
								.trigger("mousemove", canvasX + transform.x, canvasY + transform.y, { view: win })
								.trigger("mouseup", canvasX + transform.x, canvasY + transform.y, { view: win });
						});
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
				const addOffsetForSizingArea = 9; // Offset from edge of body to somewhere in sizing area
				const subtractOffsetForSizingArea = 10; // Adding two offset values to adjust the comment dimensions
				let canvasX;
				let canvasY;
				let startPosition;

				if (corner === "north") {
					canvasX = commentDimensions.x_pos + (commentDimensions.width / 2);
					canvasY = commentDimensions.y_pos - (newValue - commentDimensions.height) - subtractOffsetForSizingArea;
					startPosition = "top";

				} else if (corner === "east") {
					canvasX = commentDimensions.x_pos + newValue + addOffsetForSizingArea;
					canvasY = commentDimensions.y_pos - (commentDimensions.height / 2);
					startPosition = "right";

				} else if (corner === "west") {
					canvasX = commentDimensions.x_pos - (newValue - commentDimensions.width) - subtractOffsetForSizingArea;
					canvasY = commentDimensions.y_pos + (commentDimensions.height / 2);
					startPosition = "left";

				} else { // "south"
					canvasX = commentDimensions.x_pos + (commentDimensions.width / 2);
					canvasY = commentDimensions.y_pos + newValue + addOffsetForSizingArea;
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

Cypress.Commands.add("deleteCommentUsingContextMenu", (commentText) => {
	// Delete comment using context menu
	cy.getCommentWithText(commentText)
		.rightclick();
	cy.clickOptionFromContextMenu("Delete");
});

Cypress.Commands.add("deleteCommentUsingKeyboard", (commentText) => {
	// Delete comment by pressing 'Delete' key on keyboard
	cy.useDeleteKey()
		.then((deleteKey) => {
			cy.getCommentWithText(commentText)
				.click()
				.type(deleteKey);
		});
});

Cypress.Commands.add("deleteCommentUsingToolbar", (commentText) => {
	// Select comment and press delete icon on toolbar
	cy.getCommentWithText(commentText).click();
	cy.clickToolbarDelete();
});

Cypress.Commands.add("selectAllCommentsUsingCtrlOrCmdKey", () => {
	cy.get("#canvas-div-0").find(".d3-comment-group")
		.then((comments) => {
			cy.useCtrlOrCmdKey()
				.then((selectedKey) => {
					// Press and hold the ctrl/cmd key
					cy.get("body")
						.type(selectedKey, { release: false });

					// Click all the comments
					comments.each((idx, node) => {
						cy.wrap(node)
							.click();
					});

					// Cancel the ctrl/cmd key press
					cy.get("body")
						.type(selectedKey, { release: true });
				});
		});
});
