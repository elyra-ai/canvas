/*
 * Copyright 2017-2021 Elyra Authors
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
import has from "lodash/has";

// Returns an object containing the label and description occurances of the
// stings in the filterString array passed based on the nodeType passed in.
// The object also contains a ranking which can be used to rand the object
// returned against other objects returned from this method.
export function getOccurances(nodeType, filterStrings) {
	if (filterStrings.length > 0) {
		let labelOccurances = [];
		let descOccurances = [];
		let ranking = 0;
		if (has(nodeType, "app_data.ui_data.label")) {
			const label = nodeType.app_data.ui_data.label.toLowerCase();
			const { occurances, rank } = wordOccurances(label, filterStrings);
			labelOccurances = occurances;
			ranking += rank;
		}
		if (has(nodeType, "app_data.ui_data.description")) {
			const label = nodeType.app_data.ui_data.description.toLowerCase();
			const { occurances, rank } = wordOccurances(label, filterStrings);
			descOccurances = occurances;
			ranking += rank;
		}
		if (labelOccurances.length > 0 || descOccurances.length > 0) {
			return { labelOccurances, descOccurances, ranking };
		}
	}
	return null;
}

function wordOccurances(mainString, filterStrings) {
	let occurances = [];
	let rank = 0;
	filterStrings.forEach((s) => {
		if (s) {
			const newOccurances = wordOccurancesByString(mainString, s);
			occurances = normalize(occurances, newOccurances);
			rank += newOccurances.length > 0 ? 20 + newOccurances.length : 0;
		}
	});
	return { occurances, rank };
}

function normalize(occurances, newOccurances) {
	if (occurances.length === 0) {
		return newOccurances;
	}
	if (newOccurances.length === 0) {
		return occurances;
	}

	const addOccurances = [];
	newOccurances.forEach((newOcc) => {
		let handled = false;
		occurances.forEach((occ) => {
			if (newOcc.start >= occ.start && newOcc.start <= occ.end) {
				if (newOcc.end > occ.end) {
					occ.end = newOcc.end;
				}
				handled = true;

			} else if (newOcc.end >= occ.start && newOcc.end <= occ.end) {
				if (newOcc.start < occ.start) {
					occ.start = newOcc.start;
				}
				handled = true;
			}
		});
		if (!handled) {
			addOccurances.push(newOcc);
		}
	});

	let outOccurances = occurances.concat(addOccurances);
	outOccurances = outOccurances.sort((occ1, occ2) => ((occ1.start < occ2.start) ? -1 : 1));
	return outOccurances;
}

function wordOccurancesByString(mainString, searchString) {
	const occurances = [];
	let start = 0;
	let index = 0;

	while (index > -1) {
		index = mainString.indexOf(searchString, start);
		if (index > -1) {
			occurances.push({ start: index, end: index + searchString.length });
			start = index + searchString.length;
		}
	}
	return occurances;
}

// If we need to support a local specific search we can uncomment the code
// below and use localeIndexOf inplace of <string>.indexOf() in the code above.

// function localeIndexOf(mainString, searchString, fromIndex) {
// 	let index = -1;
// 	if (searchString.length <= mainString.length - fromIndex) {
// 		for (let i = fromIndex; i < mainString.length; i++) {
// 			if (localStartsWith(mainString.substring(i), searchString)) {
// 				index = i;
// 				break;
// 			}
// 		}
// 	}
// 	return index;
// }
//
// function localStartsWith(mainString, compString) {
// 	if (compString.length > mainString.length) {
// 		return false;
// 	}
//
// 	let state = true;
// 	for (let i = 0; i < compString.length && state === true; i++) {
// 		if (!localeEquals(mainString[i], compString[i])) {
// 			state = false;
// 		}
// 	}
// 	return state;
// }
//
// function localeEquals(c1, c2) {
// 	return c1.localeCompare(c2) === 0;
// }
