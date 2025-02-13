/*
 * Copyright 2017-2025 Elyra Authors
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

import { RecordSchema } from './common-canvas-schema-types/pipeline-flow-v3';
import { PropertyDefinitionsSchema } from './common-properties-schema-types/parameter-defs-v3';

interface BaseProperty {
  /** parameter name defined in operator definition */
  name: string;
  /** propertyId of the nested structure */
  propertyId?: string;
}

interface ArrayProperty extends BaseProperty {
  row: number;
}

interface TableProperty extends ArrayProperty {
  col: number;
}

/** https://elyra-ai.github.io/canvas/04.07-properties-controller/#common-properties-controller-api */
export type PropertyId = BaseProperty | ArrayProperty | TableProperty;

/** This is sometimes similar to MessageDef from pipeline-flow-ui-v3.ts */
export interface PropertyMessageDef {
  propertyId?: PropertyId;
  required?: boolean;
  text: string;
  type: 'error' | 'warning' | 'info';
  validation_id?: string;
  [key: string]: unknown;
}

type ControlState = 'enabled' | 'disabled' | 'visible' | 'hidden';

/**
 * https://elyra-ai.github.io/canvas/04.07-properties-controller/
 */
export interface CommonPropertiesController {
  // Property methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#property-methods

  /**
   * options - optional object of config options where:
   *   setDefaultValues (boolean): when set to true, set default values from parameter definition
   */
  setPropertyValues(
    values: unknown,
    options: {
      setDefaultValues: boolean;
    },
  ): void;
  updatePropertyValue(propertyId: PropertyId, value: unknown): void;

  /**
   * options - optional object of config options where:
   *   filterHiddenDisabled (boolean): when set to true, filter out data values with a state of disabled or hidden
   *   filterHiddenControls (boolean): when set to true, filter out data values having control type hidden
   *   applyProperties (boolean): when set to true, will return data values in the format expected by the `applyPropertyChanges` callback. If unset or false, will return the internal format used by Common Properties.
   */
  getPropertyValue(
    propertyId: PropertyId,
    options: {
      filterHiddenDisabled: boolean;
      filterHiddenControls: boolean;
      applyProperties: boolean;
    },
  ): unknown;

  /**
   * options - optional object of config options where:
   *   filterHiddenDisabled (boolean): when set to true, filter out data values with a state of disabled or hidden
   *   filterHiddenControls (boolean): when set to true, filter out data values having control type hidden
   *   applyProperties (boolean): when set to true, will return data values in the format expected by the `applyPropertyChanges` callback. If unset or false, will return the internal format used by Common Properties.
   */
  getPropertyValues(options: {
    filterHiddenDisabled: boolean;
    filterHiddenControls: boolean;
    applyProperties: boolean;
  }): unknown;

  // Message methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#message-methods

  getAllErrorMessages(): Record<string, PropertyMessageDef>;
  /**
   * Returns current list of error messages
   * @filteredPipeline (boolean) optional
   * @filterHiddenDisable (boolean) optional. If true, will not return error messages from controls that are hidden or disabled
   * @filterDisplayError (boolean) optional. If true, will not return error messages that are not displayed in the editor
   * when filteredPipeline=true returns enabled/visible control messages and only 1 per control.
   */
  getErrorMessages(
    filteredPipeline?: boolean,
    filterHiddenDisable?: boolean,
    filterSuccess?: boolean,
    filterDisplayError?: boolean,
  ): Record<string, PropertyMessageDef>;
  getErrorMessage(
    propertyId: PropertyId,
    filterHiddenDisable?: boolean,
    filterSuccess?: boolean,
    filterDisplayError?: boolean,
  ): PropertyMessageDef | null;
  getRequiredErrorMessages(): Record<string, PropertyMessageDef>;
  setErrorMessages(messages: Record<string, PropertyMessageDef>): void;
  updateErrorMessage(propertyId: PropertyId, message: PropertyMessageDef): void;

  // State methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#state-methods-disableenabled-hiddenvisible

  getControlState(propertyId: PropertyId): ControlState;
  getControlStates(): Record<string, unknown>;
  setControlStates(states: Record<string, unknown>): void;

  /**
   * @propertyId - see above
   * @state - valid values are "enabled", "disabled", "visible", "hidden"
   */
  updateControlState(propertyId: PropertyId, state: ControlState): void;

  // DatasetMetadata methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#datasetmetadata-methods

  /**
   * @datasetMetadata - see [schema](https://github.com/elyra-ai/pipeline-schemas/blob/master/common-pipeline/datarecord-metadata/datarecord-metadata-v1-schema.json)
   */
  setDatasetMetadata(datasetMetadata: RecordSchema): void;

  // Row selection methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#row-selection-methods

  /**
   * Returns table row selection indices as an array of integers.
   * @propertyId - see above
   */
  getSelectedRows(propertyId: PropertyId): number[];

  /**
   * Updates table row selections for the given table control.
   * @propertyId - see above
   * @selection - A zero-based array of integer selection indices
   */
  updateSelectedRows(propertyId: PropertyId, selection: number[]): void;

  /**
   * Clears selected table rows for the given table.
   * @propertyId - see above
   * If the propertyId is omitted all table row selections are cleared
   */
  clearSelectedRows(propertyId: PropertyId): void;

  /**
   * Adds a row selection listener for a table or list.
   * @propertyId - see above
   * @listener - callback function for when a selection is made in the table or list
   */
  addRowSelectionListener(
    propertyId: PropertyId,
    listener: (...args: any[]) => void,
  ): void;

  /**
   * Removes the row selection listener from a table or list.
   * @propertyId - see above
   */
  removeRowSelectionListener(propertyId: PropertyId): void;

  // Validation methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#validation-methods
  /**
   * Runs validation conditions on all controls
   */
  validatePropertiesValues(): void;

  /**
   * Validates a specific propertyId
   */
  validateInput(propertyId: PropertyId): void;

  // Control methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#control-methods

  /**
   * Update the enum values for a given control.  Used when enum values aren't static
   * @propertyId - see above
   * @valuesObj (array) [{ value: <string, number, boolean> , label: "<string>" }]
   */
  updateControlEnumValues(
    propertyId: PropertyId,
    valuesObj: { value: string | number | boolean; label: string }[],
  ): void;

  // General methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#general-methods

  /**
   * Returns the current size of the RHS flyout.
   */
  getEditorSize(): string;

  /**
   * Sets default property values from parameter definition in the propertiesController.
   * Note - These values won't be displayed on the UI. Host applications can call getPropertyValues() to retrieve the values.
   * @paramDef - Follows the format of https://github.com/elyra-ai/pipeline-schemas/blob/master/common-canvas/parameter-defs/parameter-defs-v3-schema.json
   */
  setParamDef(paramDef: PropertyDefinitionsSchema): void;

  /**
   * Returns the id of top-level active tab or accordion
   */
  getTopLevelActiveGroupId(): string;

  /**
   * Makes the passed in groupId active.  Only works for top-level groups
   */
  setTopLevelActiveGroupId(groupId: string): void;

  // Disable move row buttons methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#disable-move-row-buttons-methods

  /**
   * Disable table row move buttons for all propertyIds in given array
   * @param propertyIds Array of propertyIds
   *
   */
  setDisableRowMoveButtons(propertyIds: PropertyId[]): void;

  /**
   * Returns array of propertyIds for which row move buttons will be disabled
   *  @return Array of propertyIds
   */
  getDisableRowMoveButtons(): PropertyId[];

  /**
   * Check if row move buttons should be disabled for given propertyId
   * @param propertyId  The unique property identifier
   * @return boolean
   */
  isDisableRowMoveButtons(propertyId: PropertyId): boolean;

  // Custom panel and control methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#custom-panel-and-control-methods

  /**
   * Only used in custom panel to allow for custom property summary values to be displayed
   * Displays the value set in propertiesReducer for that parameter
   * @propertyId - see above
   * @label (string)
   * @inSummary (boolean)
   */
  setControlInSummary(
    propertyId: PropertyId,
    label: string,
    inSummary: boolean,
  ): void;

  /**
   * Sets the content to be displayed in the summaryPanel for a customPanel property.
   * The summary panel will directly display the content.
   * @propertyId - see above
   * @content = { value: <object> , label: "<value>" }
   */
  updateCustPropSumPanelValue(
    propertyId: PropertyId,
    content: { value: Record<string, unknown>; label: string },
  ): void;

  /**
   * Returns a standard control that can then be used in a customPanel.
   * @propertyId - See above
   * @paramDef - Follows the format of https://github.com/elyra-ai/pipeline-schemas/blob/master/common-canvas/parameter-defs/parameter-defs-v1-schema.json).  titleDefinition, current_parameters, conditions, dataset_metadata are ignored and are optional.
   * @parameter - This is the parameter from the paramDef to create the control for.
   */
  createControl(
    propertyId: PropertyId,
    paramDef: unknown,
    parameter: string,
  ): void;

  /**
   * Returns the translated text for a control given a resource key.
   * Users should be able to use the values from resources that has been uploaded as part of paramDef.
   * @key - Resource key
   * @value - Default value returned when no resource or key has been found.
   */
  getResource(key: string, value: unknown): void;

  // maxLength for single-line and multi-line control methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#maxlength-for-single-line-and-multi-line-control-methods

  /**
   * Returns the maximum characters allowed for multi-line string controls
   * Default value is 1024
   */
  getMaxLengthForMultiLineControls(): number;

  /**
   * Returns the maximum characters allowed for single-line string controls
   * Default value is 128
   */
  getMaxLengthForSingleLineControls(): number;

  // Enabling/disabling addRemoveRows methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#enablingdisabling-addremoverows-methods

  /**
   * Set the addRemoveRows attribute to 'enabled' for the given propertyId
   * @param propertyId The unique property identifier
   * @param enabled boolean value to enable or disable addRemoveRows
   */
  setAddRemoveRows(propertyId: PropertyId, enabled: boolean): void;

  /**
   * Returns the true if addRemoveRows is enabled for the given propertyID
   * @param propertyId The unique property identifier
   * @return boolean
   */
  getAddRemoveRows(propertyId: PropertyId): boolean;

  // Enabling/disabling properties editor “save” button methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#enablingdisabling-properties-editor-save-button-methods

  /**
   * Set the main "save" button to disabled(true) or enabled(false)
   * @param saveDisable (boolean)
   */
  setSaveButtonDisable(saveDisable: boolean): void;

  /**
   * Returns the true if the main "save" button is disabled, false otherwise
   * @return boolean
   */
  getSaveButtonDisable(): boolean;

  // Add static rows for table controls which will disable the re-ordering of the rows that are set as static for the given propertyId
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#add-static-rows-for-table-controls-which-will-disable-the-re-ordering-of-the-rows-that-are-set-as-static-for-the-given-propertyid

  /**
   * Set static rows for the given propertyId
   * @param propertyId The unique property identifier
   * @param staticRowsArr Array of first n row indexes or last n row indexes
   */
  updateStaticRows(propertyId: PropertyId, staticRowsArr: number[]): void;

  /**
   * Returns the static rows set for the given propertyId
   * @param propertyId The unique property identifier
   */
  getStaticRows(propertyId: PropertyId): unknown[];

  /**
   * Removes the static rows set for the given propertyId
   * @param propertyId The unique property identifier
   */
  clearStaticRows(propertyId: PropertyId): void;

  // Enabling/disabling custom table buttons
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#enablingdisabling-custom-table-buttons

  /**
   * Set the table button to 'enabled' for the given propertyId
   * @param propertyId The unique property identifier
   * @param buttonId The unique button identifier
   * @param enabled boolean value to enable or disable the button
   */
  setTableButtonEnabled(
    propertyId: PropertyId,
    buttonId: string,
    enabled: boolean,
  ): void;

  /**
   * Returns the table button states for the given propertyID
   * @param propertyId The unique property identifier
   * @return object An object of buttonIds mapped to their enabled state
   */
  getTableButtons(propertyId: PropertyId): Record<string, boolean>;

  /**
   * Returns the true if the table button is enabled for the given propertyID and buttonId
   * @param propertyId The unique property identifier
   * @param buttonId The unique button identifier
   * @return boolean
   */
  getTableButtonEnabled(propertyId: PropertyId, buttonId: string): boolean;

  // Column visibility methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#column-visibility-methods

  /**
   * Check if given column is visible in the table
   * @param propertyId The unique property identifier
   * @param columnIndex Column index in the table
   */
  getColumnVisibility(propertyId: PropertyId, columnIndex: number): boolean;

  /**
   * Set column visibility
   * @param propertyId The unique property identifier
   * @param columnIndex Column index in the table
   * @param value Boolean value to set column visible/invisible
   */
  toggleColumnVisibility(
    propertyId: PropertyId,
    columnIndex: number,
    value: boolean,
  ): void;

  // Enabling/disabling wide flyout “OK” button methods
  // https://elyra-ai.github.io/canvas/04.07-properties-controller/#enablingdisabling-wide-flyout-ok-button-methods

  /**
   * Set the "OK" button in Wide Flyout to disabled(true) or enabled(false) for given summary panel
   * @param panelId {name: panel.id}
   * @param wideFlyoutPrimaryButtonDisable boolean
   */
  setWideFlyoutPrimaryButtonDisabled(
    panelId: { name: string },
    wideFlyoutPrimaryButtonDisable: boolean,
  ): void;

  /**
   * @param panelId {name: panel.id}
   */
  getWideFlyoutPrimaryButtonDisabled(panelId: { name: string }): boolean;

  // Undocumented but used in examples

  getControl(propertyId: PropertyId): unknown;
  /**
   * @param inPropertyId the property to get the value of
   * @param options - optional object of config options where
   * @param options.filterHiddenDisabled true - filter out values from controls having state "hidden" or "disabled"
   * @param options.applyProperties true - this function is called from PropertiesMain.applyPropertiesEditing()
   * @param options.filterHidden true - filter out values from controls having state "hidden"
   * @param options.filterDisabled true - filter out values from controls having state "disabled"
   * @param options.filterHiddenControls true - filter out values from controls having type "hidden"
   * @returns the property value for the given 'inPropertyId'
   */
  getPropertyValue(
    inPropertyId: PropertyId,
    options?: {
      filterHiddenDisabled: boolean;
      applyProperties: boolean;
      filterHidden: boolean;
      filterDisabled: boolean;
      filterHiddenControls: boolean;
    },
    defaultValue?: unknown,
  ): unknown;
}
