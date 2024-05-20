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


Cypress.Commands.add("resizeObjectToDimensions", (srcBodySelector, srcSizingSelector, corner, newWidth, newHeight) => {
	cy.getObjectDimensions(srcBodySelector).then((dimensions) => {
		const addOffsetForSizingArea = 9; // Offset from edge of body to somewhere in sizing area
		const subtractOffsetForSizingArea = 10; // Adding two offset values to adjust the comment dimensions
		let canvasX;
		let canvasY;
		let startPosition;

		if (corner === "north-west") {
			canvasX = dimensions.x_pos - (newWidth - dimensions.width) - subtractOffsetForSizingArea;
			canvasY = dimensions.y_pos - (newHeight - dimensions.height) - subtractOffsetForSizingArea;
			startPosition = "topLeft";

		} else if (corner === "north-east") {
			canvasX = dimensions.x_pos + newWidth + addOffsetForSizingArea;
			canvasY = dimensions.y_pos - (newHeight - dimensions.height) - subtractOffsetForSizingArea;
			startPosition = "topRight";

		} else if (corner === "south-west") {
			canvasX = dimensions.x_pos - (newWidth - dimensions.width) - subtractOffsetForSizingArea;
			canvasY = dimensions.y_pos + newHeight + addOffsetForSizingArea;
			startPosition = "bottomLeft";

		} else { // "south-east"
			canvasX = dimensions.x_pos + newWidth + addOffsetForSizingArea;
			canvasY = dimensions.y_pos + newHeight + addOffsetForSizingArea;
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

Cypress.Commands.add("getObjectDimensions", (objSelector) => {
	cy.get(objSelector).then((obj) => {
		const dimensions = {
			x_pos: Math.round(obj[0].__data__.x_pos),
			y_pos: Math.round(obj[0].__data__.y_pos),
			width: obj[0].__data__.width,
			height: obj[0].__data__.height
		};
		return dimensions;
	});
});

Cypress.Commands.add("getCanvasTranslateCoords", () => {
	cy.get(`div#canvas-div-${document.instanceId} > div > .svg-area > g`)
		.then((g) => {
			const transform = g[0].getAttribute("transform");
			return extractTransformValues(transform);
		});
});

export function extractTransformValues(transform) {
	if (transform) {
		const coordArray = transform.substring(10, transform.indexOf(")")).split(",");
		const transformX = Number(coordArray[0]);
		const transformY = Number(coordArray[1]);

		const scaleArray = transform.split("(");
		const scale = scaleArray && scaleArray.length > 2 ? scaleArray[2].split(")")[0] : 1;

		return { x: transformX, y: transformY, k: scale };
	}

	return { x: 0, y: 0, k: 1 };
}

Cypress.Commands.add("findOverflowItem", (bar) => {
	bar
		.find(".toolbar-overflow-item")
		.then((items) => {
			let overflowItem = null;
			let topRow = 0;
			for (let i = 0; i < items.length; i++) {
				const rect = items[i].getBoundingClientRect();
				if (i === 0) {
					topRow = rect.top;
				}
				if (rect.top === topRow) {
					overflowItem = items[i];
				}
			}
			return overflowItem;
		});
});


// Returns an array of items frm the array passed in that are
// on thw top row of the toolbar.
export function getToolbarTopRowItems(items) {
	const topRowItems = [];
	let topRow = 0;
	for (let i = 0; i < items.length; i++) {
		const rect = items[i].getBoundingClientRect();
		if (i === 0) {
			topRow = rect.top;
		}
		if (rect.top === topRow) {
			topRowItems.push(items[i]);
		}
	}
	return topRowItems;
}

