/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

var stylelint = require("stylelint");
var autoprefixer = require("autoprefixer");

module.exports = {
	plugins: [
		stylelint,
		autoprefixer
	]
};
