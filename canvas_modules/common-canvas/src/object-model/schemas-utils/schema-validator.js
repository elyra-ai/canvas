/********************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import pipelineFlowV1Schema from "../schemas/v1/pipeline-flow-v1-schema.json";
import pipelineFlowUIV1Schema from "@wdp/pipeline-schemas/common-pipeline/pipeline-flow/pipeline-flow-ui-v1-schema.json";
import pipelineConnectionV1Schema from "@wdp/pipeline-schemas/common-pipeline/pipeline-connection/pipeline-connection-v1-schema.json";
import dataRecordMetadataV1Schema from "@wdp/pipeline-schemas/common-pipeline/datarecord-metadata/datarecord-metadata-v1-schema.json";
import paletteV1Schema from "../schemas/v1/palette-v1-schema.json";

import pipelineFlowV2Schema from "../schemas/v2/pipeline-flow-v2-schema.json";
import pipelineFlowUIV2Schema from "@wdp/pipeline-schemas/common-pipeline/pipeline-flow/pipeline-flow-ui-v2-schema.json";
import pipelineConnectionV2Schema from "@wdp/pipeline-schemas/common-pipeline/pipeline-connection/pipeline-connection-v2-schema.json";
import dataRecordMetadataV2Schema from "@wdp/pipeline-schemas/common-pipeline/datarecord-metadata/datarecord-metadata-v2-schema.json";
import paletteV2Schema from "../schemas/v2/palette-v2-schema.json";

import pipelineFlowV3Schema from "@wdp/pipeline-schemas/common-pipeline/pipeline-flow/pipeline-flow-v3-schema.json";
import pipelineFlowUIV3Schema from "@wdp/pipeline-schemas/common-pipeline/pipeline-flow/pipeline-flow-ui-v3-schema.json";
import pipelineConnectionV3Schema from "@wdp/pipeline-schemas/common-pipeline/pipeline-connection/pipeline-connection-v3-schema.json";
import dataRecordMetadataV3Schema from "@wdp/pipeline-schemas/common-pipeline/datarecord-metadata/datarecord-metadata-v3-schema.json";
import paletteV3Schema from "@wdp/pipeline-schemas/common-canvas/palette/palette-v3-schema.json";

import Logger from "../../logging/canvas-logger.js";

const logger = new Logger("SchemaValidator");

var SchemaValidator = require("jsonschema").Validator;

function validatePipelineFlowAgainstSchema(pipelineFlow, version) {
	switch (version) {
	case 1: {
		const validator1 = getV1Validator();
		validateAgainstSchema(pipelineFlow, pipelineFlowV1Schema, "pipelineFlow", validator1);
		break;
	}
	case 2: {
		const validator2 = getV2Validator();
		validateAgainstSchema(pipelineFlow, pipelineFlowV2Schema, "pipelineFlow", validator2);
		break;
	}

	case 3:
	default: {
		const validator3 = getV3Validator();
		validateAgainstSchema(pipelineFlow, pipelineFlowV3Schema, "pipelineFlow", validator3);
	}
	}
}

function validatePaletteAgainstSchema(paletteData, version) {
	switch (version) {
	case 1:
		validateAgainstSchema(paletteData, paletteV1Schema, "palette", new SchemaValidator());
		break;
	case 2:
		validateAgainstSchema(paletteData, paletteV2Schema, "palette", new SchemaValidator());
		break;
	case 3:
	default: {
		const validator3 = getV3Validator();
		validateAgainstSchema(paletteData, paletteV3Schema, "palette", validator3);
	}
	}
}

// Validates the data provided, against the schema provided, using the validator
// provided and throws an error if any schema validation errors are found.
function validateAgainstSchema(data, schema, type, validator) {
	logger.logStartTimer("Schema validation");
	const valResult = validator.validate(data, schema, { "nestedErrors": true });
	logger.logEndTimer("Schema validation");

	logger.log("Schema " + type + " - validation result:");
	logger.log(valResult);
	if (valResult && valResult.errors && valResult.errors.length > 0) {
		logger.error(valResult);
		throw valResult;
	}
}

function getV1Validator() {
	const validator1 = new SchemaValidator();
	const prefix = "http://www.ibm.com/ibm/";
	validator1.addSchema(pipelineFlowUIV1Schema, prefix + "wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/pipeline_overview_def");
	validator1.addSchema(pipelineFlowUIV1Schema, prefix + "wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/pipeline_def");
	validator1.addSchema(pipelineFlowUIV1Schema, prefix + "wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/port_info_def");
	validator1.addSchema(pipelineFlowUIV1Schema, prefix + "wdp/canvas/v1.0/pipeline-flow-ui-schema.json#/definitions/node_info_def");
	validator1.addSchema(pipelineConnectionV1Schema, prefix + "wdp/flow-v1.0/pipeline-connection-v1-schema.json#/definitions/common_pipeline_connection_def");
	validator1.addSchema(pipelineConnectionV1Schema, prefix + "wdp/flow-v1.0/pipeline-connection-v1-schema.json#/definitions/common_pipeline_data_asset_def");
	validator1.addSchema(dataRecordMetadataV1Schema, prefix + "wml/datarecord-metadata/v1.0/datarecord-metadata-v1-schema.json#/definitions/record_schema");
	return validator1;
}

function getV2Validator() {
	const validator2 = new SchemaValidator();
	const prefix = "http://api.dataplatform.ibm.com/schemas/common-pipeline/";
	validator2.addSchema(pipelineFlowV2Schema, prefix + "pipeline-flow/pipeline-flow-v2-schema.json");
	validator2.addSchema(pipelineFlowUIV2Schema, prefix + "pipeline-flow/pipeline-flow-ui-v2-schema.json");
	validator2.addSchema(pipelineConnectionV2Schema, prefix + "pipeline-connection/pipeline-connection-v2-schema.json");
	validator2.addSchema(dataRecordMetadataV2Schema, prefix + "datarecord-metadata/datarecord-metadata-v2-schema.json");
	return validator2;
}

function getV3Validator() {
	const validator3 = new SchemaValidator();
	const prefix = "http://api.dataplatform.ibm.com/schemas/common-pipeline/";
	validator3.addSchema(pipelineFlowV3Schema, prefix + "pipeline-flow/pipeline-flow-v3-schema.json");
	validator3.addSchema(pipelineFlowUIV3Schema, prefix + "pipeline-flow/pipeline-flow-ui-v3-schema.json");
	validator3.addSchema(pipelineConnectionV3Schema, prefix + "pipeline-connection/pipeline-connection-v3-schema.json");
	validator3.addSchema(dataRecordMetadataV3Schema, prefix + "datarecord-metadata/datarecord-metadata-v3-schema.json");
	return validator3;
}

module.exports = {
	validatePipelineFlowAgainstSchema: validatePipelineFlowAgainstSchema,
	validatePaletteAgainstSchema: validatePaletteAgainstSchema
};
