/********************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import pipelineFlowV1Schema from "../schemas/v1/pipeline-flow-v1-schema.json";
import pipelineFlowUIV1Schema from "../schemas/v1/pipeline-flow-ui-v1-schema.json";
import pipelineConnectionV1Schema from "../schemas/v1/pipeline-connection-v1-schema.json";
import dataRecordMetadataV1Schema from "../schemas/v1/datarecord-metadata-v1-schema.json";
import paletteV1Schema from "../schemas/v1/palette-v1-schema.json";

import pipelineFlowV2Schema from "../schemas/v2/pipeline-flow-v2-schema.json";
import pipelineFlowUIV2Schema from "../schemas/v2/pipeline-flow-ui-v2-schema.json";
import pipelineConnectionV2Schema from "../schemas/v2/pipeline-connection-v2-schema.json";
import dataRecordMetadataV2Schema from "../schemas/v2/datarecord-metadata-v2-schema.json";
import paletteV2Schema from "../schemas/v2/palette-v2-schema.json";

var SchemaValidator = require("jsonschema").Validator;
var validator1 = new SchemaValidator();
validator1.addSchema(pipelineFlowUIV1Schema, "http://www.ibm.com/ibm/wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/pipeline_overview");
validator1.addSchema(pipelineFlowUIV1Schema, "http://www.ibm.com/ibm/wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/pipeline_def");
validator1.addSchema(pipelineFlowUIV1Schema, "http://www.ibm.com/ibm/wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/port_info_def");
validator1.addSchema(pipelineFlowUIV1Schema, "http://www.ibm.com/ibm/wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/node_info_def");
validator1.addSchema(pipelineConnectionV1Schema, "http://www.ibm.com/ibm/wdp/flow-v1.0/pipeline-connection-v1-schema.json#/definitions/common_pipeline_connection_def");
validator1.addSchema(pipelineConnectionV1Schema, "http://www.ibm.com/ibm/wdp/flow-v1.0/pipeline-connection-v1-schema.json#/definitions/common_pipeline_data_asset_def");
validator1.addSchema(dataRecordMetadataV1Schema, "http://www.ibm.com/ibm/wml/datarecord-metadata/v1.0/datarecord-metadata-v1-schema.json#/definitions/record_schema");

var validator2 = new SchemaValidator();
const prefix = "http://api.dataplatform.ibm.com/schemas/common-pipeline/";
validator2.addSchema(pipelineFlowUIV2Schema, prefix + "pipeline-flow/pipeline-flow-ui-v2-schema.json#/definitions/pipeline_overview");
validator2.addSchema(pipelineFlowUIV2Schema, prefix + "pipeline-flow/pipeline-flow-ui-v2-schema.json#/definitions/pipeline_def");
validator2.addSchema(pipelineFlowUIV2Schema, prefix + "pipeline-flow/pipeline-flow-ui-v2-schema.json#/definitions/port_info_def");
validator2.addSchema(pipelineFlowUIV2Schema, prefix + "pipeline-flow/pipeline-flow-ui-v2-schema.json#/definitions/node_info_def");
validator2.addSchema(pipelineFlowUIV2Schema, prefix + "pipeline-flow/pipeline-flow-ui-v2-schema.json#/definitions/runtime_info_def");
validator2.addSchema(pipelineConnectionV2Schema, prefix + "pipeline-connection/pipeline-connection-v2-schema.json#/definitions/common_pipeline_connection_def");
validator2.addSchema(pipelineConnectionV2Schema, prefix + "pipeline-connection/pipeline-connection-v2-schema.json#/definitions/common_pipeline_data_asset_def");
validator2.addSchema(dataRecordMetadataV2Schema, prefix + "datarecord-metadata/datarecord-metadata-v2-schema.json#/definitions/record_schema");

function validatePipelineFlowAgainstSchema(pipelineFlow, version) {
	switch (version) {
	case 1:
		validateAgainstSchema(pipelineFlow, pipelineFlowV1Schema, "pipelineFlow", validator1);
		break;
	case 2:
	default:
		validateAgainstSchema(pipelineFlow, pipelineFlowV2Schema, "pipelineFlow", validator2);
	}
}

function validatePaletteAgainstSchema(paletteData, version) {
	switch (version) {
	case 1:
		validateAgainstSchema(paletteData, paletteV1Schema, "palette", new SchemaValidator());
		break;
	case 2:
	default:
		validateAgainstSchema(paletteData, paletteV2Schema, "palette", new SchemaValidator());
	}

}

// Validates the data provided, against the schema provided, using the validator
// provided and throws an error if any schema validation errors are found.
function validateAgainstSchema(data, schema, type, validator) {
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
