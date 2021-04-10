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

// The entry point to this utils file.
// Returns a filtered, ranked array of nodeTypeInfo objects for the nodeTypes
// in the categories passed in and the searchString passed in.
export function getFilteredNodeTypeInfos(categories, searchString) {
	const filteredNodeTypeInfos = [];
	const lowercaseFilteredKeyword = searchString.toLowerCase();
	const filterStrings = lowercaseFilteredKeyword.split(" ").filter((kw) => kw !== "");
	for (let idx = 0; idx < categories.length; idx++) {
		filteredNodeTypeInfos.push(...getFilteredNodeTypeInfosByCategory(categories[idx], filterStrings));
	}
	const rankedFilteredNodeTypeInfos =
		filteredNodeTypeInfos.sort((e1, e2) => ((e1.occurenceInfo.ranking <= e2.occurenceInfo.ranking) ? 1 : -1));

	return rankedFilteredNodeTypeInfos;
}

// Returns a filtered, ranked array of nodeTypeInfo objects for the nodeTypes
// in the category passed in and the searchString passed in.
function getFilteredNodeTypeInfosByCategory(category, filterStrings) {
	var filteredNodeTypeInfos = [];
	if (category.node_types) {
		for (const nodeType of category.node_types) {
			const occurenceInfo = getOccurences(nodeType, category, filterStrings);
			if (occurenceInfo) {
				filteredNodeTypeInfos.push({ nodeType, category, occurenceInfo });
			}
		}
	}
	return filteredNodeTypeInfos;
}

// Returns an object containing the label and description occurences of the
// stings in the filterString array passed based on the nodeType passed in.
// The object also contains a ranking which can be used to rand the object
// returned against other objects returned from this method.
function getOccurences(nodeType, category, filterStrings) {
	if (filterStrings.length > 0) {
		let catLabelOccurences = [];
		let labelOccurences = [];
		let descOccurences = [];

		let catLabelHitCounts = [];
		let labelHitCounts = [];
		let descHitCounts = [];

		if (has(category, "label")) {
			const catLabel = category.label.toLowerCase();
			const { occurences, hitCounts } = wordOccurences(catLabel, filterStrings);
			catLabelOccurences = occurences;
			catLabelHitCounts = hitCounts;
		}
		if (has(nodeType, "app_data.ui_data.label")) {
			const label = nodeType.app_data.ui_data.label.toLowerCase();
			const { occurences, hitCounts } = wordOccurences(label, filterStrings);
			labelOccurences = occurences;
			labelHitCounts = hitCounts;
		}
		if (has(nodeType, "app_data.ui_data.description")) {
			const label = nodeType.app_data.ui_data.description.toLowerCase();
			const { occurences, hitCounts } = wordOccurences(label, filterStrings);
			descOccurences = occurences;
			descHitCounts = hitCounts;
		}

		if (catLabelOccurences.length > 0 || labelOccurences.length > 0 || descOccurences.length > 0) {
			const ranking = calcRanking(catLabelHitCounts, labelHitCounts, descHitCounts, filterStrings.length);
			return { catLabelOccurences, labelOccurences, descOccurences, ranking };
		}
	}
	return null;
}

// Calcuates a ranking value for the node type info object being processed based
// on the valrious hit count arrays passed in.
function calcRanking(catLabelHitCounts, labelHitCounts, descHitCounts, filterStringsLength) {
	let ranking = 0;

	const totalHitCount = [filterStringsLength];
	for (let i = 0; i < filterStringsLength; i++) {
		totalHitCount[i] = catLabelHitCounts[i] + labelHitCounts[i] + descHitCounts[i];
	}

	let multiStringHits = 0;
	for (let i = 0; i < totalHitCount.length; i++) {
		ranking += totalHitCount[i];
		if (totalHitCount[i] > 0) {
			multiStringHits++;
		}
	}

	return ranking + (multiStringHits * 50);
}

// Returns an object containing an array of occurences and hit counts for the
// main string passed in after being searched by the strings in the
// filterStrings array passed in.
function wordOccurences(mainString, filterStrings) {
	let occurences = [];
	const hitCounts = [];
	filterStrings.forEach((s) => {
		if (s) {
			const newOccurences = wordOccurencesByString(mainString, s);
			occurences = normalize(occurences, newOccurences);
			hitCounts.push(newOccurences.length > 0 ? 1 : 0);
		}
	});
	return { occurences, hitCounts };
}

// Returns an array of occurences where the occurences from the two arrays
// passed in are joined together where they overlap so that the returned
// array has no overlapping occurences.
function normalize(occurences, newOccurences) {
	if (occurences.length === 0) {
		return newOccurences;
	}
	if (newOccurences.length === 0) {
		return occurences;
	}

	const addOccurences = [];
	newOccurences.forEach((newOcc) => {
		let handled = false;
		occurences.forEach((occ) => {
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
			addOccurences.push(newOcc);
		}
	});

	let outOccurences = occurences.concat(addOccurences);
	outOccurences = outOccurences.sort((occ1, occ2) => ((occ1.start < occ2.start) ? -1 : 1));
	return outOccurences;
}

// Returns up to a maximum of 20 occurences of the searchString in the mainString.
// 20 is an arbitrary number chosen to improve search performance since it is
// considerd unlikely a user will care about anythig more than 20 hits on a
// string (which would most likely be in a description string).
function wordOccurencesByString(mainString, searchString) {
	const occurences = [];
	let start = 0;
	let index = 0;
	let count = 0;

	while (index > -1 && count < 20) {
		index = mainString.indexOf(searchString, start);
		if (index > -1) {
			occurences.push({ start: index, end: index + searchString.length });
			start = index + searchString.length;
			count++;
		}
	}
	return occurences;
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
