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

Cypress.Commands.add("getCommentWithText", (commentText) => {
	cy.get("#common-canvas-items-container-0").find(".d3-comment-group")
		.then((comments) => {
			let commentId;
			let commentSelector;
			for (let idx = 0; idx < comments.length; idx++) {
				if (comments[idx].textContent === commentText) {
					commentId = comments[idx].getAttribute("data-id");
					commentSelector = "[data-id='" + commentId + "']";
					break;
				}
			}
			cy.get(commentSelector);
		});
});

Cypress.Commands.add("ctrlOrCmdClickComment", (commentText) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey()
		.then((selectedKey) => cy.getCommentWithText(commentText).type(selectedKey, { release: false }));
});
