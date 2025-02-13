/*
 * Copyright 2025 Elyra Authors
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

import React, { ReactNode } from "react";
import { PropertyDefinitionsSchema } from "./common-properties-schema-types/parameter-defs-v3";
import {
  CommonPropertiesController,
  PropertyId,
  PropertyMessageDef,
} from "./common-properties-controller";
import { ExpressionBuilderExpressionInfoSchema } from "./common-properties-schema-types/expression-info-v3";

export * from "./common-properties-controller";
export * from "./common-properties-schema-types/conditions-v3";
export * from "./common-properties-schema-types/expression-info-v3";
export * from "./common-properties-schema-types/function-list-v3";
export {
  ParameterDefinition as OperatorParameterDefinition,
  WatsonDataPlatformOperatorSchema,
  PortDefinition,
  ParameterRefDefinition,
  ComplexTypeDefinition as OperatorComplexTypeDefinition,
} from "./common-properties-schema-types/operator-v3";
export * from "./common-properties-schema-types/uihints-v3";

/**
 * https://elyra-ai.github.io/canvas/04.02-callbacks/#actionhandler
 */
export type ActionHandler = (
  id: string,
  appData?: Record<string, unknown> | undefined,
  data?: Record<string, unknown>
) => void;

/**
 * https://elyra-ai.github.io/canvas/04.02-callbacks/#applypropertychangespropertyset-appdata-additionalinfo-undoinfo-uiproperties
 */
export interface ErrorMessage {
  "id_ref": string;
  "text": string;
  "type": string;
  "validation_id": string;
};

export type ApplyPropertyChangesCallback = (
  propertySet: Record<string, unknown>,
  appData: Record<string, unknown> | undefined,
  additionalInfo: {
    messages?: ErrorMessage[];
    title: string;
  },
  undoInfo: {
    properties: Record<string, unknown>;
    messages?: Record<
      string,
      {
        type: "info" | "error" | "warning";
        text: string;
        propertyId?: PropertyId;
        required?: boolean;
        validation_id?: string;
      }
    >;
  },
  uiProperties?: Record<string, unknown>
) => void;

/**
 * https://elyra-ai.github.io/canvas/04.02-callbacks/#propertylistener
 */
export type PropertyListenerCallback = (
  data:
    | {
        action: "SET_PROPERTIES" | "PROPERTIES_LOADED";
      }
    | {
        action: "UPDATE_PROPERTY";
        previousValue: unknown;
        value: unknown;
        property: PropertyId;
        type?: "initial_load";
      }
    | { action: string; [key: string]: unknown }
) => void;

/**
 * https://elyra-ai.github.io/canvas/04.02-callbacks/#buttonhandler
 */
export type ButtonHandler = (
  data: {
    type: "customButtonIcon";
    propertyId: PropertyId;
    buttonId: string;
    carbonIcon: string;
  },
  callbackIcon: (icon: ReactNode) => void
) => void;

/**
 * https://elyra-ai.github.io/canvas/04.02-callbacks/#buttoniconhandler
 */
export type ButtonIconHandler = (
  data: {
    type: "customButtonIcon";
    propertyId: PropertyId;
    buttonId: string;
    carbonIcon: string;
  },
  callbackIcon: (icon: ReactNode) => void
) => void;

/**
 * https://elyra-ai.github.io/canvas/04.02-callbacks/#propertyiconhandler
 */
export type PropertyIconHandler = (
  data: {
    propertyId: PropertyId;
    enumValue: string;
  },
  callbackIcon: (icon: ReactNode) => void
) => {};

/**
 * https://elyra-ai.github.io/canvas/04.02-callbacks/#helpclickhandler
 */
export type HelpClickHandler = (
  nodeTypeId: string,
  helpData: unknown,
  appData: Record<string, unknown>
) => void;

/**
 * https://elyra-ai.github.io/canvas/04.02-callbacks/#titlechangehandler
 */
export type TitleChangeHandler = (
  title: string,
  callbackFunction: (data: {
    type: "warning" | "error";
    message: string;
  }) => void,
) => void;

/**
 * https://elyra-ai.github.io/canvas/04.08-properties-config/
 */
export interface CommonPropertiesConfig {
  /**
   * type of container to display the properties.
   * default is 'Custom'
   */
  containerType?: "Modal" | "Tearsheet" | "Custom";
  /**
   * If set to true, groups will be displayed as an accordion. If false,
   * groups are displayed as tabs. default: false
   */
  rightFlyout?: boolean;
  /**
   * calls applyPropertyChanges when focus leave Common Properties.
   * default: false
   */
  applyOnBlur?: boolean;
  /**
   * Disable the properties editor “save” button if there are required errors
   */
  disableSaveOnRequiredErrors?: boolean;
  /**
   * adds a button that allows the right-side fly-out editor to
   * expand/collapse between small and medium sizes. default: true
   */
  enableResize?: boolean;
  /**
   * used to determine how hidden or disabled control values are returned in
   * applyPropertyChanges callback. Current options are “value” or “null”.
   * default: "value"
   */
  conditionReturnValueHandling?: "value" | "null";
  buttonLabels?: {
    /** Label to use for the primary button of the properties dialog */
    primary: string;
    /** Label to use for the secondary button of the properties dialog */
    secondary: string;
  };
  /**
   * show heading and heading icon in right-side fly-out panels.
   * default: false
   */
  heading?: boolean;
  /**
   * If set to true, schema validation will be enabled when a parameter
   * definition has been set in CommonProperties. Any errors found will be
   * reported on the browser dev console. It is recommended you run with
   * schema validation switched on while in development mode.
   */
  schemaValidation?: boolean;
  /**
   * When true, will always call applyPropertyChanges even if no changes were
   * made. default: false
   */
  applyPropertiesWithoutEdit?: boolean;
  /**
   * maximum characters allowed for multi-line string controls like textarea.
   * default: 1024
   */
  maxLengthForMultiLineControls?: number;
  /**
   * maximum characters allowed for single-line string controls like textfield.
   * default: 128
   */
  maxLengthForSingleLineControls?: number;
  /**
   * Default false. If set to true, currentParameter values whose data type
   * does not match what is defined in the parameter definitions will be
   * converted to the specified data type.
   */
  convertValueDataTypes?: boolean;
  /**
   * Default true. If set to false, condition ops(isEmpty, isNotEmpty) and
   * required fields are allowed to only contain spaces without triggering
   * condition errors.
   */
  trimSpaces?: boolean;
  /**
   * Default true to show (required) indicator. If set to false, show
   * (optional) indicator next to properties label.
   */
  showRequiredIndicator?: boolean;
  /**
   * Default true to show “Alerts” tab whenever there are error or warning
   * messages. If set to false, Alerts tab won’t be displayed.
   */
  showAlertsTab?: boolean;
  /**
   * Default []. When set this will filter out any values in the array in
   * the parameters returned when applyPropertyChanges is call. Only
   * primitive data types are currently supported.
   */
  returnValueFiltering?: unknown[] | string;
  /**
   * View categories in right-flyout. Can be "accordions" or "tabs".
   * default: "accordions".
   */
  categoryView?: "accordions" | "tabs";
}

/**
 * https://elyra-ai.github.io/canvas/04.06-custom-components/
 */
export interface CustomControl {
  renderControl(): ReactNode;
}

/**
 * This is a class that constructs a {@link CustomControl}
 * https://elyra-ai.github.io/canvas/04.06-custom-components/
 */
export interface CustomControlClass {
  new (
    propertyId: PropertyId,
    controller: CommonPropertiesController,
    /** Returns values stored in data attribute */
    data: Record<string, unknown>,
    tableInfo: {
      table: boolean;
      editStyle: "summary" | "inline";
    }
  ): CustomControl;
  id(): string;
}

export interface CommonPropertiesProps {
  propertiesInfo: {
    parameterDef: PropertyDefinitionsSchema;
    appData?: Record<string, unknown>;
    additionalComponents?: Record<string, ReactNode>;
    messages?: PropertyMessageDef[];
    expressionInfo?: ExpressionBuilderExpressionInfoSchema;
    initialEditorSize?: "small" | "medium" | "large" | null;
    schemaValidation?: boolean;
    id?: string;
  };
  callbacks: {
    /**
     * Executes when the user clicks OK in the property dialog. This callback allows users to save the current property values.
     *
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#applypropertychangespropertyset-appdata-additionalinfo-undoinfo-uiproperties
     */
    applyPropertyChanges?: ApplyPropertyChangesCallback;
    /**
     * Executes when user clicks Save or Cancel in the property editor
     * dialog. This callback is used to control the visibility of the
     * property editor dialog. closeSource identifies where this call was
     * initiated from. It will equal “apply” if the user clicked on “Save”
     * when no changes were made, or “cancel” if the user clicked on “Cancel”
     *
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#closepropertiesdialogclosesource
     */
    closePropertiesDialog?: (closeSource: "apply" | "cancel") => void;
    /**
     * Executes when a user property values are updated.
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#propertylistener
     */
    propertyListener?: PropertyListenerCallback;
    /**
     * Executes when the property controller is created. Returns the property
     * controller.
     *
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#controllerhandler
     */
    controllerHandler?: (
      propertyController: CommonPropertiesController
    ) => void;
    /**
     * Called whenever an action is ran. id and data come from uihints and
     * appData is passed in with propertiesInfo.
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#actionhandler
     */
    actionHandler?: ActionHandler;
    /**
     * Called when the edit button is clicked on in a readonlyTable control,
     * or if a custom table button is clicked
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#buttonhandler
     */
    buttonHandler?: ButtonHandler;
    /**
     * Called when there is a buttons uihints set in the complex_type_info
     * section of the parameter definition. This buttonIconHandler expects a
     * Carbon Icon jsx object as the return value from the callback. This is
     * used to display the Carbon icon in the custom table button.
     *
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#buttoniconhandler
     */
    buttonIconHandler?: ButtonIconHandler;
    /**
     * Called when a user wants to pass in a specific object to a dropdown
     * menu. The propertyIconHandler expects a jsx object as the return value
     * from the callback. This is used to display the jsx object in the
     * dropdown menu.
     *
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#propertyiconhandler
     */
    propertyIconHandler?: PropertyIconHandler;
    /**
     * Executes when user clicks the help icon in the property editor dialog
     *
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#helpclickhandler
     */
    helpClickHandler?: HelpClickHandler;
    /**
     * Called on properties title change. This callback can be used to
     * validate the new title and return warning or error message if the new
     * title is invalid. This callback is optional.
     *
     * In case of error or warning, titleChangeHandler should call
     * callbackFunction with an object having type and message. If the new
     * title is valid, no need to call the callbackFunction.
     *
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#titlechangehandler
     */
    titleChangeHandler?: TitleChangeHandler;
    /**
     * This is an optional handler you don’t need to implement anything for
     * it unless you want to. This callback allows your code to override the
     * default tooltip text for the Undo and Redo buttons.
     * The propertiesActionLabelHandler callback, when provided, is called
     * for the save properties action that is performed in Common Properties.
     * This callback should return a string or null. If a string is returned
     * it will be shown in the tooltip for the Undo button in the toolbar
     * preceded by “Undo:” and the string will also appear in the tooltip for
     *  the Redo button (when appropriate) preceded by “Redo:”. If null is
     * returned, Common Properties will display the default text Save
     * {node_name} node properties for the Undo and Redo buttons.
     *
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#propertiesactionlabelhandler
     */
    propertiesActionLabelHandler?: () => string;
    /**
     * Optional callback used for adding a link in properties tooltips. link
     * object must be defined under description in uiHints parameter info.
     * Common Properties internally pass the link object to
     * tooltipLinkHandler callback. This callback must return an object
     * having url and label.
     *
     * https://elyra-ai.github.io/canvas/04.02-callbacks/#tooltiplinkhandler
     */
    tooltipLinkHandler?: (link: Record<string, unknown>) => {
      url: string;
      label: string;
    };
  };
  propertiesConfig?: CommonPropertiesConfig;
  customPanels?: unknown[];
  customControls?: CustomControlClass[];
  customConditionOps?: unknown[];
  light?: boolean;
}

/**
 * https://elyra-ai.github.io/canvas/04-common-properties/
 */
export declare class CommonProperties extends React.Component<CommonPropertiesProps> {
  applyPropertiesEditing: (closeEditor: boolean) => void;
}

