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
