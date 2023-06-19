/*
 * Copyright 2017-2023 Elyra Authors
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

import parameterDefsV3Schema from "@elyra/pipeline-schemas/common-canvas/parameter-defs/parameter-defs-v3-schema.json";

import uihintsV3Schema from "@elyra/pipeline-schemas/common-pipeline/operators/uihints-v3-schema.json";
import conditionsV3Schema from "@elyra/pipeline-schemas/common-pipeline/operators/conditions-v3-schema.json";
import operatorsV3Schema from "@elyra/pipeline-schemas/common-pipeline/operators/operator-v3-schema.json";
import dataRecordMetadataV3Schema from "@elyra/pipeline-schemas/common-pipeline/datarecord-metadata/datarecord-metadata-v3-schema.json";

import { Validator as SchemaValidator } from "jsonschema";

function validateParameterDefAgainstSchema(parameterDef) {
	const validator = getValidator();
	validateAgainstSchema(parameterDef, parameterDefsV3Schema, "pipelineFlow", validator);
}

// Validates the data provided, against the schema provided, using the validator
// provided and throws an error if any schema validation errors are found.
function validateAgainstSchema(data, schema, type, validator) {
	const valResult = validator.validate(data, schema, { "nestedErrors": true });

	if (valResult && valResult.errors && valResult.errors.length > 0) {
		console.error(valResult);
	}
}

function getValidator() {
	const validator = new SchemaValidator();
	const canvasPrefix = "https://api.dataplatform.ibm.com/schemas/common-canvas/";
	const pipelinePrefix = "https://api.dataplatform.ibm.com/schemas/common-pipeline/";
	validator.addSchema(parameterDefsV3Schema, canvasPrefix + "parameter-defs/pipeline-flow-v3-schema.json");
	validator.addSchema(uihintsV3Schema, pipelinePrefix + "operators/uihints-v3-schema.json");
	validator.addSchema(conditionsV3Schema, pipelinePrefix + "operators/conditions-v3-schema.json");
	validator.addSchema(operatorsV3Schema, pipelinePrefix + "operators/operator-v3-schema.json");
	validator.addSchema(dataRecordMetadataV3Schema, pipelinePrefix + "datarecord-metadata/datarecord-metadata-v3-schema.json");
	return validator;
}

export {
	validateParameterDefAgainstSchema
};
