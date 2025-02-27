/*
 * Copyright 2017-2024 Elyra Authors
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

/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript
 * from https://github.com/elyra-ai/pipeline-schemas/blob/main/common-pipeline/operators/conditions-v3-schema.json
 * It has been modified by hand, so run a diff if you need to update it.
 */

export type ConditionsDefinition =
  | ValidationDefinition
  | EnabledDefinition
  | VisibleDefinition
  | FilterDefinition
  | EnumFilterDefinition
  | AllowChangeDefinition
  | DefaultValueDefinition;
/**
 * User message
 */
export type MessageDefinition = {
  [k: string]: unknown;
} & {
  default?: string;
  resource_key?: string;
  [k: string]: unknown;
};
/**
 * Evaluates to a boolean result
 */
export type EvaluateDefinition =
  | AndDefinition
  | OrDefinition
  | ConditionDefinition
  | FilterConditionDefinition;
/**
 * A single operator for comparing data record schema field attributes and sharing source fields
 */
export type FilterOpDefinition =
  | 'dmMeasurement'
  | 'dmType'
  | 'dmModelingRole'
  | 'dmSharedFields';
/**
 * Evaluates to return values included in an enumeration control
 */
export type EvaluateDefinition1 =
  | AndDefinition
  | OrDefinition
  | ConditionDefinition
  | FilterConditionDefinition;
/**
 * Evaluates to a boolean result
 */
export type EvaluateDefinition2 =
  | AndDefinition
  | OrDefinition
  | ConditionDefinition
  | FilterConditionDefinition;
/**
 * Evaluates to a boolean result
 */
export type EvaluateDefinition3 =
  | AndDefinition
  | OrDefinition
  | ConditionDefinition
  | FilterConditionDefinition;

/**
 * User Interface Condition schema for the Watson Data Platform
 */
export interface WatsonDataPlatformValidationSchema {
  /**
   * Refers to the JSON schema used to validate documents of this type
   */
  json_schema?: 'https://api.dataplatform.ibm.com/schemas/common-pipeline/operators/conditions-v3-schema.json';
  conditions: ConditionsDefinition[];
  [k: string]: unknown;
}
export interface ValidationDefinition {
  /**
   * A single validation. The fail_message is displayed upon validation failure.
   */
  validation: {
    /**
     * Unique identifier.  Required when multiple fail_message sections have the same focus_parameter_ref value.
     */
    id?: string;
    fail_message: FailMessageDefinition;
    evaluate: EvaluateDefinition;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Error/warning
 */
export interface FailMessageDefinition {
  /**
   * The parameter control to get the error/warning message.
   */
  focus_parameter_ref: string;
  message: MessageDefinition;
  type?: 'error' | 'warning' | 'info';
  [k: string]: unknown;
}
/**
 * Container for 'and' operations
 */
export interface AndDefinition {
  /**
   * The 'and' condition. All sub-conditions evaluate to true. Can nest any number of additional conditional types.
   */
  and: (
    | AndDefinition
    | OrDefinition
    | ConditionDefinition
    | FilterConditionDefinition
  )[];
  [k: string]: unknown;
}
/**
 * Container for 'or' operations
 */
export interface OrDefinition {
  /**
   * The 'or' condition. Any sub-condition evaluates to true. Can nest any number of additional conditional types.
   */
  or: (
    | AndDefinition
    | OrDefinition
    | ConditionDefinition
    | FilterConditionDefinition
  )[];
  [k: string]: unknown;
}
/**
 * A parameter condition. Evaluates to true or false.
 */
export interface ConditionDefinition {
  /**
   * The condition that is evaluated
   */
  condition: {
    /**
     * A single operator for the properties of the condition.
     */
    op:
      | (
          | 'isEmpty'
          | 'isNotEmpty'
          | 'greaterThan'
          | 'lessThan'
          | 'equals'
          | 'notEquals'
          | 'contains'
          | 'notContains'
          | 'colNotExists'
          | 'cellNotEmpty'
          | 'colDoesExist'
          | 'isDateTime'
          | 'dmTypeEquals'
          | 'dmTypeNotEquals'
          | 'dmMeasurementEquals'
          | 'dmMeasurementNotEquals'
          | 'dmRoleEquals'
          | 'dmRoleNotEquals'
          | 'matches'
          | 'notMatches'
        )
      | string;
    /**
     * The primary parameter - must be present
     */
    parameter_ref: string;
    /**
     * Optional second parameter for multi-parameter validation
     */
    parameter_2_ref?: string;
    /**
     * Optional value against which to compare the primary parameter value
     */
    value?: string | number | boolean | unknown[] | null;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Allows for filtering available fields in the data record schema(s)
 */
export interface FilterConditionDefinition {
  /**
   * The condition that is evaluated
   */
  condition:
    | {
        op: FilterOpDefinition;
        /**
         * Value to compare against data record schema field attribute
         */
        value?: string;
        [k: string]: unknown;
      }
    | {
        op: FilterOpDefinition;
        /**
         * Array of values which are compared to a data record schema field attribute
         *
         * @minItems 1
         */
        values: [string, ...string[]];
        [k: string]: unknown;
      };
  [k: string]: unknown;
}
export interface EnabledDefinition {
  /**
   * Enablement test. Disables controls if evaluate is false.
   */
  enabled: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
export interface VisibleDefinition {
  /**
   * Visibility test. Hides controls if evaluate is false.
   */
  visible: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
export interface FilterDefinition {
  /**
   * Filter test. Includes support for filtering the values to be displayed in a control
   */
  filter: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
export interface EnumFilterDefinition {
  /**
   * Allows filtering of available enumeration options
   */
  enum_filter: {
    /**
     * The target parameter information
     */
    target: {
      /**
       * The enumeration parameter affected by this operation
       */
      parameter_ref: string;
      /**
       * Array of available enumeration options when the condition evaluates to 'true'
       *
       * @minItems 1
       */
      values: [unknown, ...unknown[]];
      [k: string]: unknown;
    };
    evaluate: EvaluateDefinition1;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
export interface AllowChangeDefinition {
  /**
   * Allow change test. Allows a field value to be changed if evaluates to true.
   */
  allow_change: {
    /**
     * Array of parameter names who values changes are allowed by this operation
     *
     * @minItems 1
     */
    parameter_refs: [string, ...string[]];
    evaluate: EvaluateDefinition2;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
export interface DefaultValueDefinition {
  /**
   * Set default value of the parameter_ref if condition evaluates to true.
   */
  default_value: {
    /**
     * Parameter whose default value is to be set.
     */
    parameter_ref: string;
    /**
     * This will be the default value of parameter_ref if condition evaluates to true.
     */
    value:
      | number
      | string
      | boolean
      | {
          [k: string]: unknown;
        }
      | unknown[];
    evaluate: EvaluateDefinition3;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
