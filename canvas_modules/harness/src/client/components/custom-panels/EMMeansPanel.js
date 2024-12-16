/*
 * Copyright 2017-2025 Elyra Authors
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

import React from "react";
import { isEqual } from "lodash";

/*
 * This hidden panel exists to service the property requirements for the EMMeans tables in GLMM.
 */
class EMMeansPanel {
	static id() {
		return "emmeans-hidden-panel";
	}

	constructor(parameters, controller, data) {
		this.parameters = parameters;
		this.controller = controller;
		this.data = data;
	}

	/**
	 * Determines if the given field is continuous.
	 *
	 * @param fields Array of field objects
	 * @param fieldName The field name to check
	 * @return True if the given field is continuous
	 */
	isContinuous(fields, fieldName) {
		for (const field of fields) {
			if (field.name === fieldName) {
				return field.metadata.measure === "range";
			}
		}
		return false;
	}

	/**
	 * Extracts categorical terms from the provided fixedEffects list.
	 *
	 * @param fixedEffects Array of EffectStructures
	 * @return array[EffectStructure] An array of categorical terms
	 */
	extractCategoricalTerms(fixedEffects) {
		const terms = [];
		if (fixedEffects) {
			const fields = this.controller.getDatasetMetadataFields();
			for (const effect of fixedEffects) {
				let hasContinuous = false;
				for (let idx = 0; idx < effect[0].length; idx++) {
					const fieldName = effect[0][idx];
					if (this.isContinuous(fields, fieldName)) {
						hasContinuous = true;
						break;
					}
				}
				if (!hasContinuous) {
					terms.push(effect);
				}
			}
		}
		return terms;
	}

	/**
	 * Extracts continuous terms from the provided fixedEffects list.
	 *
	 * @param fixedEffects Array of EffectStructures
	 * @return array[string] An array of continuous field names
	 */
	extractContinuousFields(fixedEffects) {
		const fieldNames = [];
		if (fixedEffects) {
			const fields = this.controller.getDatasetMetadataFields();
			for (const effect of fixedEffects) {
				for (let idx = 0; idx < effect[0].length; idx++) {
					const fieldName = effect[0][idx];
					if (this.isContinuous(fields, fieldName)) {
						fieldNames.push(fieldName);
					}
				}
			}
		}
		return fieldNames;
	}

	/**
	 * Reconciles the continuous fields in the covariance_list property
	 * with the provided continuous fields from Fixed Effects.
	 *
	 * @param continuouses An instance of the covariance_list property
	 * @param continuousFromFixed Array of continuous field names from Fixed Effects
	 */
	reconcileContinuous(continuouses, continuousFromFixed) {
		let continuousItems = continuouses ? continuouses : [];
		let changed = false;
		// Remove existing items no longer in the Fixed Effects list
		for (let idx = continuousItems.length - 1; idx >= 0; idx--) {
			const entry = continuousItems[idx];
			if (continuousFromFixed.indexOf(entry[0]) === -1) {
				continuousItems = continuousItems.splice(idx, 1);
				changed = true;
			}
		}
		// Add new items not already present
		for (const fieldName of continuousFromFixed) {
			let found = false;
			for (const item of continuousItems) {
				if (fieldName === item[0]) {
					found = true;
					break;
				}
			}
			if (!found) {
				continuousItems.push([fieldName, "Mean", 0]);
				changed = true;
			}
		}
		if (changed) {
			const that = this;
			setTimeout(function() {
				const continuousId = that.parameters[1];
				that.controller.updatePropertyValue({ name: continuousId }, continuousItems, true);
			}, 100);
		}
	}

	/**
	 * Makes a string term from an EffectStructure instance.
	 *
	 * @param effectStructure Serialized EffectStructure instance
	 * @return A string term
	 */
	makeStringTerm(effectStructure) {
		let term = "";
		for (let idx = 0; idx < effectStructure[0].length; idx++) {
			const fieldName = effectStructure[0][idx];
			const isNested = idx > 0 && effectStructure[1][idx - 1] < effectStructure[1][idx];
			if (isNested) {
				term = term + "(" + fieldName + ")";
			} else {
				term = term.length ? term + "*" + fieldName : fieldName;
			}
		}
		return term;
	}

	/**
	 * Determines if the given effectStructure is present in the given terms list.
	 *
	 * @param emmeans emMeansStructure Structure instance containing an effectStructure
	 * @param terms array[EffectStructure] Array of terms
	 * @return True if the given EffectStructure representation is present in the terms list
	 */
	effectStructureInTermsList(emmeans, terms) {
		for (const term of terms) {
			if (isEqual(emmeans[0], term)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Determines if the given term is present in the provided serialized array of emMeansStructures.
	 *
	 * @param term string Term to search for
	 * @param newTerms array[emMeansStructure] Array of serialized emMeansStructure instances
	 * @return True if the given term is present
	 */
	termInEffectStructure(term, newTerms) {
		for (const emmeans of newTerms) {
			if (isEqual(term, emmeans[0])) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Reconciles existing categorical terms with new terms extracted from FixedEffects.
	 *
	 * @param categoricals Array[emMeansStructure] The previous (if any) categorical terms
	 * @param terms Array[EffectStructure] of categorical terms extracted from FixedEffects
	 */
	reconcileTerms(categoricals, terms) {
		let changed = false;
		let categoricalsUI = this.controller.getPropertyValue({ name: "emeansUI" });
		if (!categoricalsUI) {
			categoricalsUI = [];
		}
		// First remove existing terms not present in the new terms
		if (Array.isArray(categoricals) && categoricals.length) {
			for (let idx = categoricals.length - 1; idx >= 0; idx--) {
				const emmeans = categoricals[idx];
				if (!this.effectStructureInTermsList(emmeans, terms)) {
					categoricals.splice(idx, 1);
					if (categoricalsUI.length > idx) {
						categoricalsUI.splice(idx, 1);
					}
					changed = true;
				}
			}
		}

		// Next add new terms not previously present in the existing terms
		let newTerms = categoricals;
		if (!newTerms) {
			newTerms = [];
		}
		for (const term of terms) {
			if (!this.termInEffectStructure(term, newTerms)) {
				newTerms.push([
					term,
					false,
					term[0][0],
					"None",
					"Last",
					""
				]);
				categoricalsUI.push([
					this.makeStringTerm(term),
					false,
					"None",
					term[0][0]
				]);
				changed = true;
			}
		}

		// Place back into properties
		if (changed) {
			const that = this;
			setTimeout(function() {
				const categoricalId = that.parameters[0];
				that.controller.updatePropertyValue({ name: categoricalId }, newTerms, true);
				that.controller.updatePropertyValue({ name: "emeansUI" }, categoricalsUI, true);
			}, 100);
		}
	}

	/**
	 * Updates the properties for the categorical and continuous emmeans tables.
	 */
	updateTableProperties() {
		const categoricalId = this.parameters[0];
		const continuousId = this.parameters[1];
		const categoricals = this.controller.getPropertyValue({ name: categoricalId });
		const continuouses = this.controller.getPropertyValue({ name: continuousId });
		const fixedEffects = this.controller.getPropertyValue({ name: "fixed_effects_list" });
		this.reconcileTerms(categoricals, this.extractCategoricalTerms(fixedEffects));
		this.reconcileContinuous(continuouses, this.extractContinuousFields(fixedEffects));
	}

	renderPanel() {
		this.updateTableProperties();
		return (
			<div />
		);
	}
}

export default EMMeansPanel;
