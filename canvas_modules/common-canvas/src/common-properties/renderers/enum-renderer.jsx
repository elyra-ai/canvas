/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

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
