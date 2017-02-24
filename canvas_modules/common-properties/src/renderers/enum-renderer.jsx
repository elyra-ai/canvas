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

    let valuesMap = {};
    for (let i=0; i < values.length; ++i) {
      valuesMap[values[i]] = valueLabels[i];
    }

    this.valuesMap = valuesMap;
  }

  render(value) {
    if (this.isMultiple) {
      let parsedValues = JSON.parse(value);
      let rendered = "[";
      for (let i=0; i < parsedValues.length; ++i) {
        let rawval = parsedValues[i];
        if (i > 0) {
          rendered += ","
        }
        let val = this.valuesMap[rawval];
        if (rendered === undefined) {
          rendered += "<" + rawval + ">";
        }
        else {
          rendered += val;
        }
      }
      return rendered + "]";
    }
    else {
      let rendered = this.valuesMap[value];
      if (rendered === undefined) {
        return "<" + value + ">";
      }
      else {
        return rendered;
      }
    }
  }
}
