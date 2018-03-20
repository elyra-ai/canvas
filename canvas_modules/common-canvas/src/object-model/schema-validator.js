/********************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import pipelineFlowV1Schema from "./schemas/v1/pipeline-flow-v1-schema.json";
import pipelineFlowUIV1Schema from "./schemas/v1/pipeline-flow-ui-v1-schema.json";
import pipelineConnectionV1Schema from "./schemas/v1/pipeline-connection-v1-schema.json";
import dataRecordMetadataV1Schema from "./schemas/v1/datarecord-metadata-v1-schema.json";
import paletteV1Schema from "./schemas/v1/palette-v1-schema.json";

var SchemaValidator = require("jsonschema").Validator;
var validator = new SchemaValidator();
validator.addSchema(pipelineFlowUIV1Schema, "http://www.ibm.com/ibm/wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/pipeline_overview");
validator.addSchema(pipelineFlowUIV1Schema, "http://www.ibm.com/ibm/wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/pipeline_def");
validator.addSchema(pipelineFlowUIV1Schema, "http://www.ibm.com/ibm/wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/port_info_def");
validator.addSchema(pipelineFlowUIV1Schema, "http://www.ibm.com/ibm/wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/node_info_def");
validator.addSchema(pipelineConnectionV1Schema, "http://www.ibm.com/ibm/wdp/flow-v1.0/pipeline-connection-v1-schema.json#/definitions/common_pipeline_connection_def");
validator.addSchema(pipelineConnectionV1Schema, "http://www.ibm.com/ibm/wdp/flow-v1.0/pipeline-connection-v1-schema.json#/definitions/common_pipeline_data_asset_def");
validator.addSchema(dataRecordMetadataV1Schema, "http://www.ibm.com/ibm/wml/datarecord-metadata/v1.0/datarecord-metadata-v1-schema.json#/definitions/record_schema");

function validatePipelineFlowAgainstSchema(pipelineFlow) {
	validateAgainstSchema(pipelineFlow, pipelineFlowV1Schema, "pipelineFlow");
}

function validatePaletteAgainstSchema(paletteData) {
	validateAgainstSchema(paletteData, paletteV1Schema, "palette");
}

// Validates the data provided, against the schema provided, and throws an
// error if any schema validation errors are found.
function validateAgainstSchema(data, schema, type) {
	var startTime = Date.now();
	const valResult = validator.validate(data, schema, { "nestedErrors": true });
	console.log("Schema " + type + " validation time = " + (Date.now() - startTime));
	console.log("Schema " + type + " validation result:");
	console.log(valResult);
	if (valResult && valResult.errors && valResult.errors.length > 0) {
		throw valResult;
	}
}

module.exports = {
	validatePipelineFlowAgainstSchema: validatePipelineFlowAgainstSchema,
	validatePaletteAgainstSchema: validatePaletteAgainstSchema
};
