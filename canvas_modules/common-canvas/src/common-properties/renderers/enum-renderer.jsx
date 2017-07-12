/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

export default class EnumRenderer {
	constructor(values, valueLabels, isMultiple) {
		this.values = values;
		this.valueLabels = valueLabels;
		this.isMultiple = isMultiple;

		const valuesMap = {};
		for (let i = 0; i < values.length; ++i) {
			valuesMap[values[i]] = valueLabels[i];
		}

		this.valuesMap = valuesMap;
	}

	render(value) {
		if (this.isMultiple) {
			const parsedValues = JSON.parse(value);
			let multiRendered = "[";
			for (let i = 0; i < parsedValues.length; ++i) {
				const rawval = parsedValues[i];
				if (i > 0) {
					multiRendered += ",";
				}
				const val = this.valuesMap[rawval];
				if (typeof multiRendered === "undefined") {
					multiRendered += "<" + rawval + ">";
				} else {
					multiRendered += val;
				}
			}
			return multiRendered + "]";
		}
		const rendered = this.valuesMap[value];
		if (typeof rendered === "undefined") {
			return "<" + value + ">";
		}
		return rendered;
	}
}
