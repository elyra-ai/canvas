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

import React, { ComponentClass, FunctionComponent, ReactNode } from "react";
import { PropertyDefinitionsSchema } from "./parameter-defs-v3.model";
import {
  CommonPropertiesController,
  PropertyId,
  PropertyMessageDef,
} from "./common-properties-controller.model";
import { DecorationDef, MessageDef, NodeInfoDef } from "./pipeline-flow-ui-v3";
import {
  HttpsApiDataplatformIbmComSchemasCommonPipelinePipelineFlowPipelineFlowV3SchemaJson,
  NodeTypeDef,
} from "./pipeline-flow-v3";
import { ExpressionBuilderExpressionInfoSchema } from "./expression-info-v3.model.ts";
import { HttpsApiDataplatformIbmComSchemasCommonCanvasPalettePaletteV3SchemaJson } from "./palette-v3";

export * from "./common-properties-controller.model.ts";
export * from "./conditions-v3.model.ts";
export * from "./datarecord-metadata-v3.ts";
export * from "./expression-info-v3.model.ts";
export * from "./function-list-v3.model.ts";
export {
  ParameterDefinition as OperatorParameterDefinition,
  WatsonDataPlatformOperatorSchema,
  PortDefinition,
  ParameterRefDefinition,
  ComplexTypeDefinition as OperatorComplexTypeDefinition,
} from "./operator-v3.model.ts";
export * from "./palette-v3.ts";
export * from "./parameter-defs-v3.model.ts";
export * from "./parameters-v3.ts";
export * from "./parametersets-v3.ts";
export * from "./pipeline-connection-v3.ts";
export {
  PipelineDef as UiPipelineDef,
  HttpsApiDataplatformIbmComSchemasCommonPipelinePipelineFlowPipelineFlowUiV3SchemaJson,
  PipelineOverviewDef,
  CommentDef,
  CommentLinkDef,
  PortInfoDef,
  NodeInfoDef,
  AssociationDef,
  DecorationDef,
  MessageDef,
  NodeLinkInfoDef,
  RuntimeInfoDef,
} from "./pipeline-flow-ui-v3.ts";
export * from "./pipeline-flow-v3.ts";
export * from "./uihints-v3.model.ts";

export interface CanvasLink {
  app_data: Record<string, unknown>;
  class_name: string;
  id: string;
  srcNodeId: string;
  srcNodePortId: string;
  trgNodeId: string;
  trgNodePortId: string;
  type: string;
}

export type NodePosition =
  | "topLeft"
  | "middleLeft"
  | "bottomLeft"
  | "topCenter"
  | "middleCenter"
  | "bottomCenter"
  | "topRight"
  | "middleRight"
  | "bottomRight";

export type LinkPosition = "source" | "middle" | "target";

interface ImageDecoration {
  id: string;
  image: string;
  position: NodePosition | LinkPosition;
  distance: number;
  x_pos: number;
  y_pos: number;
  width: number;
  height: number;
  hotspot: boolean;
  class_name: string;
  outline: boolean;
  tooltip: string;
  temporary: boolean;
}

export type NodeImageDecoration = ImageDecoration &
  DecorationDef & {
    position: NodePosition;
  };
export interface LinkImageDecoration extends ImageDecoration {
  position: LinkPosition;
}

interface LabelDecoration {
  id: string;
  label?: string;
  label_editable?: boolean;
  label_align?: "center" | "left";
  label_single_line?: boolean;
  label_max_characters?: number;
  label_allow_return_key?: boolean;
  position?: NodePosition | LinkPosition;
  distance?: number;
  x_pos?: number;
  y_pos?: number;
  width?: number;
  height?: number;
  hotspot?: boolean;
  class_name?: string;
  tooltip?: string;
  temporary?: boolean;
}

export type NodeLabelDecoration = LabelDecoration &
  DecorationDef & {
    position: NodePosition;
  };
export interface LinkLabelDecoration extends LabelDecoration {
  position: LinkPosition;
}

interface ShapeDecoration {
  id: string;
  path?: string;
  position?: NodePosition | LinkPosition;
  distance?: number;
  x_pos?: number;
  y_pos?: number;
  width?: number;
  height?: number;
  hotspot?: boolean;
  class_name?: boolean;
  tooltip?: string;
  temporary?: boolean;
}

export type NodeShapeDecoration = ShapeDecoration &
  DecorationDef & {
    position: NodePosition;
  };
export interface LinkShapeDecoration extends ShapeDecoration {
  position: LinkPosition;
}

interface JsxDecoration {
  id: string;
  jsx: ReactNode;
  position: NodePosition | LinkPosition;
  distance: number;
  x_pos: number;
  y_pos: number;
  width: number;
  height: number;
  hotspot: boolean;
  class_name: string;
  tooltip: string;
}

export type NodeJsxDecoration = JsxDecoration &
  DecorationDef & {
    position: NodePosition;
  };
export interface LinkJsxDecoration extends JsxDecoration {
  position: LinkPosition;
}

/** https://elyra-ai.github.io/canvas/03.04.01-decorations/ */
export type Decoration =
  | ImageDecoration
  | LabelDecoration
  | ShapeDecoration
  | JsxDecoration;

/** https://elyra-ai.github.io/canvas/03.04.01-decorations/ */
export type LinkDecoration =
  | LinkImageDecoration
  | LinkLabelDecoration
  | LinkShapeDecoration
  | LinkJsxDecoration;

/** https://elyra-ai.github.io/canvas/03.04.01-decorations/ */
export type NodeDecoration =
  | NodeImageDecoration
  | NodeLabelDecoration
  | NodeShapeDecoration
  | NodeJsxDecoration;

/**
 * A node as represented inside Elyra Canvas. The generic type is of app_data.
 * https://elyra-ai.github.io/canvas/03.04.02-api-object-structure/#api-differences-with-schema
 */
export type CanvasNode<T = Record<string, unknown>> = NodeTypeDef &
  NodeInfoDef &
  Required<Pick<NodeInfoDef, "x_pos" | "y_pos">> & {
    app_data: T;
    height: number;
    width: number;
  };

export interface CanvasComment {
  class_name: string;
  content: string;
  height: number;
  id: string;
  width: number;
  x_pos: number;
  y_pos: number;
}

export type ContextMenuHandler = (
  source: CtxMenuHandlerSource,
  defaultMenu: CtxMenuHandlerMenuAction[]
) => CtxMenuHandlerMenuAction[];

export interface StyleSpec {
  body?: {
    default?: string;
    hover?: string;
  };
  image?: {
    default: string;
  };
  label?: {
    default: string;
  };
  selection_outline?: {
    default: string;
  };
}

export interface PipelineObjectStyle {
  style: StyleSpec;
  pipelineId: string;
  objId: string;
}

export type NotificationMsgType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | ""
  | undefined
  | null;
/** https://elyra-ai.github.io/canvas/03.04.05-notification-messages/ */
export interface NotificationMsg {
  id: string;
  type: NotificationMsgType;
  title?: string | ReactNode;
  content?: string | ReactNode;
  timestamp?: string;
  callback?: (id: string) => void;
  closeMessage?: string | ReactNode;
}

/**
 * https://elyra-ai.github.io/canvas/03.04-canvas-controller/
 */
export declare class CanvasController {
  /**
   * Loads the pipelineFlow document provided into common-canvas and displays it.
   * The document must conform to the pipelineFlow schema as documented in the
   * elyra-ai pipeline-schemas repo. Documents conforming to older versions may be
   * provided, but they will be upgraded to the most recent version.
   */
  setPipelineFlow(
    pipelineFlow: HttpsApiDataplatformIbmComSchemasCommonPipelinePipelineFlowPipelineFlowV3SchemaJson
  ): void;
  /**
   * Clears the pipeline flow and displays an empty canvas.
   */
  clearPipelineFlow(): void;
  /**
   * @return the current pipelineFlow document in the latest version of the
   * pipelineFlow schema as documented in the elyra-ai pipeline-schemas repo.
   */
  getPipelineFlow(): HttpsApiDataplatformIbmComSchemasCommonPipelinePipelineFlowPipelineFlowV3SchemaJson;
  /**
   * Returns the current pipelineFlow document ID.
   */
  getPipelineFlowId(): string;
  /**
   * Returns the ID of the primary pipeline from the pipelineFlow.
   */
  getPrimaryPipelineId(): string;
  /**
   * Returns the external pipeline flow for the url passed in. The external
   * flow must have been loaded through some common canvas action for this
   * method to be able to return anything.
   * @param url
   */
  getExternalPipelineFlow(url: string): Record<string, unknown>;
  /**
   * Returns the internal format of all canvas data stored in memory by
   * common-canvas. Nodes, comments and links are returned in the internal
   * format.
   */
  getCanvasInfo(): Record<string, unknown>;
  /**
   * @param pipelineId
   * @return the IDs of the ancestor pipeline of the pipeline ID passed in.
   */
  getAncestorPipelineIds(pipelineId: string): Record<string, unknown>[];
  /**
   * Removes all styles from nodes, comments and links. See the setObjectsStyle
   * and setLinkStyle methods for details on setting styles.
   * temporary - is a boolean that indicates whether temporary or permanent
   * styles should be removed.
   * @param temporary - boolean
   */
  removeAllStyles(temporary: boolean): void;
  /**
   * Specifies the new styles for objects that are not highlighted during
   * branch highlighting.
   * @param newStyle - is a style specification object
   */
  setSubdueStyle(newStyle: StyleSpec): void;

  /**
   * ## Pipeline methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#pipeline-methods
   */

  /**
   * @return the pipeline object for the pipeline Id passed in.
   */
  getPipeline(pipelineId: string): Record<string, unknown>;
  /**
   * Returns the ID of the pipeline object which is currently on display
   * in the canvas. Typically, this is the primary pipeline but will be
   * different if the user has navigated into one or more supernodes; in
   * which case it will be the ID of the pipeline at the level in the
   * supernode hierarchy that is currently on display.
   */
  getCurrentPipelineId(): string;
  /**
   * Returns truthy if the pipeline is external (that is it is part of an
   * external pipeline flow). Otherwise, return falsy to indicate the pipeline
   * is local.
   */
  isPipelineExternal(pipelineId: string): boolean;
  /**
   * Returns the flow validation messages for the pipeline ID passed in.
   */
  getFlowMessages(pipelineId: string): Record<string, unknown>;
  /**
   * @return a boolean to indicate whether there are any messages of
   * includeMsgsType in the pipeline identified by the pipeline ID passed in.
   * @param includeMsgType - can be either "error" or "warning"
   */
  isFlowValid(includeMsgType: "error" | "warning"): boolean;
  /**
   * Rearranges the nodes in the canvas in the direction specified for the
   * pipeline ID passed in.
   * @param layoutDirection - can be "horizontal" or "vertical"
   */
  autoLayout(layoutDirection: "horizontal" | "vertical"): void;

  /**
   * ## Palette methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#palette-methods
   */

  /**
   * Loads the palette data as described in the palette schema in
   * elyra-ai pipeline-schemas repo. Any version can be loaded and it will be
   * upgraded to the latest version.
   */
  setPipelineFlowPalette(
    palette: HttpsApiDataplatformIbmComSchemasCommonCanvasPalettePaletteV3SchemaJson
  ): void;
  /**
   * Clears the palette data from common-canvas.
   */
  clearPaletteData(): void;
  /**
   * Sets the loading text of the category. If set to a non-empty string the
   * category will show an InlineLoading control in the palette category div
   * with this text as the label. If set to falsey the palette category
   * will display as normal.
   * @param categoryId
   * @param loadingText
   */
  setCategoryLoadingText(categoryId: string, loadingText: string): void;
  /**
   * Sets the empty text of the category. If set to a non-empty string and the
   * category does not have any nodes, the palette will show a warning icon with
   * this text as a message under the category title when the category is opened.
   * This message will not be displayed if the field is set to falsey or if
   * nodetypes are added to the category.
   * @param categoryId
   * @param emptyText
   */
  setCategoryEmptyText(categoryId: string, emptyText: string): void;
  /**
   * Adds a new node into the palette:
   * @param nodeTypeObj - must conform to the style of node used by the palette as
   * described in the palette schema. See objects in nodeTypes array in the
   * palette schema:
   *  https://github.com/elyra-ai/pipeline-schemas/blob/main/common-canvas/palette/palette-v3-schema.json
   * @param categoryId - is the name of the palette category where the node will be
   * added. If the category doesn't exist it will be created.
   * @param categoryLabel - Is an optional param. If a new category is created it will
   * be displayed with this label.
   * @param categoryDescription - Is an optional param. If a new category is created
   * it will be displayed with this description.
   * @param categoryImage - Is an optional param. The image displayed for the category provided as a
   * reference to an image or the image itself.
   */
  addNodeTypeToPalette(
    nodeTypeObj: HttpsApiDataplatformIbmComSchemasCommonCanvasPalettePaletteV3SchemaJson,
    categoryId: string,
    categoryLabel?: string,
    categoryDescription?: string,
    categoryImage?: string
  ): void;
  /**
   * Adds an array of new node into the palette:
   * nodeTypeObjs - an array of nodetypes that must conform to the style of
   * nodes used by the palette as described in the palette schema. See objects
   * in nodeTypes array in the palette schema:
   *  https://github.com/elyra-ai/pipeline-schemas/blob/main/common-canvas/palette/palette-v3-schema.json
   * category - is the name of the palette category where the node will be
   * added. If the category doesn't exist it will be created.
   * categoryLabel - is an optional param. If a new category is created it will
   * be displayed with this label.
   * categoryImage - the image displayed for the category provided as a
   * reference to an image or the image itself.
   * categoryDescription - Is an optional param. If a new category is created
   * it will be displayed with this description.
   * categoryImage - Is an optional param. The image displayed for the category provided as a
   * reference to an image or the image itself.
   */
  addNodeTypesToPalette(
    nodeTypeObj: HttpsApiDataplatformIbmComSchemasCommonCanvasPalettePaletteV3SchemaJson[],
    categoryId: string,
    categoryLabel?: string,
    categoryDescription?: string,
    categoryImage?: string
  );
  /**
   * Removes nodetypes from a palette category
   * @param selObjectIds - an array of object IDs to identify the nodetypes to be
   * @param categoryId - the ID of teh category from which the nodes will be removed
   */
  removeNodesFromPalette(selObjectIds: string[], categoryId: string): void;
  /**
   * @return the palette data document which will conform to the latest version
   * of the palette schema.
   */
  getPaletteData(): HttpsApiDataplatformIbmComSchemasCommonCanvasPalettePaletteV3SchemaJson;
  /**
   * @return the palette node identified by the operator ID passed in.
   */
  getPaletteNode(operatorId: string): NodeTypeDef;
  /**
   * @return the palette node identified by the node ID passed in.
   */
  getPaletteNodeById(nodeId: string): NodeTypeDef;
  /**
   * @return the category of the palette node identified by the operator passed in
   */
  getCategoryForNode(nodeOpIdRef: string): string;
  /**
   * Converts a node template from the format use in the palette (that conforms
   * to the schema) to the internal node format.
   */
  convertNodeTemplate(nodeTemplate: NodeTypeDef): unknown;
  /** Opens the palette category identified by the category ID passed in. */
  openPaletteCategory(categoryId: string): void;
  /** Closes the palette category idetified by the category ID passed in. */
  closePaletteCategory(categoryId: string): void;
  /** Opens all the palette categories. */
  openAllPaletteCategories(): void;
  /** Closes all the palette categories. */
  closeAllPaletteCategories(): void;
  /** Returns true or false to indicate whether a palette category is open or not. */
  isPaletteCategoryOpen(categoryId: string): boolean;

  /**
   * ## Selection methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#selections-methods
   */

  /**
   * Sets the currently selected objects replacing any current selections.
   * Selected objects can only be in one pipeline. If this parameter is omitted
   * it is assumed the selections will be for objects in the 'top-level' pipeline
   * being displayed.
   * @param newSelection - An array of object IDs for nodes and/or comments
   * @param pipelineId - Optional. The ID of the pipeline where the objects exist.
   */
  setSelections(
    newSelection: string[] | Record<string, unknown>[],
    pipelineId?: string
  ): void;
  /**
   * Clears all the current selections from the canvas.
   */
  clearSelections(): void;
  /**
   * Selects all the objects on the canvas.
   */
  selectAll(): void;
  /**
   * @return an array of the IDs of the currently selected objects.
   */
  getSelectedObjectIds(): string[];
  /**
   * @return the currently selected nodes.
   */
  getSelectedNodes(): CanvasNode[];
  /**
   * @return the currently selected comments.
   */
  getSelectedComments(): CanvasComment[];
  /**
   * @return the ID of the pipeline in which the currently selected objects
   * exist. Only one pipeline may contain selected objects.
   */
  getSelectedPipelineId(): string;
  /**
   * Deletes all currently selected objects.
   */
  deleteSelectedObjects(): void;
  /**
   * This is used when deciding to creating a supernode.
   * @return true if the currently selected objects are all linked together.
   */
  areSelectedNodesContiguous(): boolean;

  /**
   * ## Notification messages methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#notification-messages-methods
   */

  /**
   * Overwrites the array of notification messages shown in the notification panel.
   * @param newMessages - An array of messages (see `getNotificationMessages`)
   */
  setNotificationMessages(newMessages: NotificationMsg[]): void;
  /**
   * Deletes all notification messages shown in the notification panel.
   */
  clearNotificationMessages(): void;
  /**
   * Removes the notification messages from array of IDs.
   * @param ids - array of IDs
   */
  deleteNotificationMessages(ids: string[]): void;
  /**
   * Returns the array of current notification messages. If the messageType is
   * provided only messages of that type will be returned. If messageType is
   * not provided, all messages will be returned. The format of a notification
   * message is an object with these fields:
   * {
   *   "id": string (Required),
   *   "type" : enum, oneOf ["info", "success", "warning", "error"] (Required),
   *   "callback": function, the callback function when a message is clicked (Required),
   *   "title": string (Optional),
   *   "content": string, html, JSX Object (Optional),
   *   "timestamp": string (Optional),
   *   "closeMessage": string (Optional)
   * }
   */
  getNotificationMessages(messageType?: NotificationMsgType): NotificationMsg;
  /**
   *
   * Returns the maximum notification message type present in the current set
   * of notification messages. For this: ("error" > "warning" > "success" > "info")
   * @return `"info" | "success" | "warning" | "error";`
   */
  getNotificationMessagesMaxType(): NotificationMsgType;

  /**
   * ## Node and Comment methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#node-and-comment-methods
   */

  /**
   * Moves the objects identified in the data object which must be in the
   * pipeline identified by the pipeline ID.
   */
  moveObjects(
    data: {
      nodes: (string | CanvasNode | CanvasComment)[];
      offsetX: number;
      offsetY: number;
    },
    pipelineId: string
  ): void;
  /**
   * Deletes the objects specified in objectIds array.
   * @param objectIds - An array of node and comment IDs
   * @param pipelineId
   */
  deleteObjects(
    objectIds: (string | CanvasNode | CanvasComment)[],
    pipelineId: string
  ): void;
  /**
   * Removes the links to and from the objects specified in the objectIds array.
   * @param objectIds - An array of node and comment IDs
   * @param pipelineId
   */
  disconnectObjects(
    objectIds: (string | CanvasNode | CanvasComment)[],
    pipelineId: string
  ): void;
  /**
   * Deletes the object specified by the id in the pipeline specified by
   * pipeline ID.
   * @deprecated Use deleteNode or deleteComment as appropriate instead.
   */
  deleteObject(id: string, pipelineId: string): void;
  /**
   * Sets the style of the objects specified by pipelineObjectIds to be
   * the newStyle which will be either temporary or permanent.
   * pipelineObjectIds: This identified the objects to be styles. It is a
   * javascript object like this:
   *
   * ```javascript
   *   {
   *     <pipelineID_1>: [
   *       <objectID_1_1>,
   *       <objectID_1_2>
   *     ],
   *     <pipelineID_2>: [
   *         <objectID_2_1>,
   *         <objectID_2_2>
   *     ]
   *   }
   * ```
   *
   * @param pipelineObjectIds
   * @param newStyle - This is a style specification. See the wiki for details.
   * @param temporary - A boolean to indicate if the style is serialized when
   *             getPipelineFlow() method is called or not.
   */
  setObjectsStyle(
    pipelineObjectIds: Record<string, string[]>,
    newStyle: StyleSpec,
    temporary: boolean
  ): void;
  /**
   * Sets the styles of multiple objects at once.
   * @param pipelineObjStyles - Specified the objects and the styles each should be
   * set to. It is a javascript array like this:
   *
   * ```javascript
   *   [
   *     { pipelineId: <pipelineId>, objId: <objectId>, style: <style_spec>},
   *     { pipelineId: <pipelineId>, objId: <objectId>, style: <style_spec>},
   *     { pipelineId: <pipelineId>, objId: <objectId>, style: <style_spec>}
   *   ]
   * ```
   * @param temporary - A boolean to indicate if the styles are serialized when
   * getPipelineFlow() method is called or not.
   */
  setObjectsMultiStyle(
    pipelineObjStyles: PipelineObjectStyle[],
    temporary: boolean
  ): void;

  /**
   * ## Node methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#node-methods
   */

  /**
   * Returns an array of nodes for the pipeline specified by the pipelineId.
   * @param pipelineId
   */
  getNodes(pipelineId?: string): CanvasNode[];
  /**
   * Returns a new node created from the data parameter in the pipeline
   * identified by the pipelineId.
   * @param data - An object containing
   *
   * `nodeTemplate` - a node template from the palette. The nodeTemplate
   *                 can be retrieved from the palette using with Canvas
   *                 Controller methods: getPaletteNode or getPaletteNodeById.
   *
   * `offsetX` - the x coordinate of the new node
   *
   * `offsetY` - the y coordinate of the new node
   *
   * @param pipelineId
   */
  createNode(newNode: {
    nodeTemplate:
      | NodeTypeDef
      | {
          type: string;
          op: string;
        };
    offsetX: number;
    offsetY: number;
  }): CanvasNode;
  /**
   * Adds a new node into the pipeline specified by the pipelineId.
   * @param node
   * @param pipelineId
   */
  addNode(node: CanvasNode, pipelineId?: string): void;
  /**
   * Creates a node using the data parameter provided in the pipeline specified
   * by pipelineId and adds the command to the command stack (so the user can
   * undo/redo the command). This will also cause the beforeEditActionHandler
   * and editActionHandler callbacks to be called.
   * If pipelineId is omitted the node will be created in the current
   * "top-level" pipeline.
   * @param data - An object containing
   *
   * `nodeTemplate` - a node template from the palette. The nodeTemplate
   *                 can be retrieved from the palette using with Canvas
   *                 Controller methods: getPaletteNode or getPaletteNodeById.
   *
   * `offsetX` - the x coordinate of the new node
   *
   * `offsetY` - the y coordinate of the new node
   *
   * @param pipelineId
   */
  createNodeCommand(
    data: {
      nodeTemplate:
        | NodeTypeDef
        | {
            type: string;
            op: string;
          };
      offsetX: number;
      offsetY: number;
    },
    pipelineId?: string
  ): void;

  openPalette(): void;
  setLinkDecorations(
    id: string,
    decorations: LinkDecoration[],
    pipelineId: string
  );
  /**
   * Deletes the node specified.
   * @param nodeId - The ID of the node
   * @param pipelineId - The ID of the pipeline
   */
  deleteNode(nodeId: string, pipelineId?: string): void;
  /**
   * Sets the node properties
   * @param nodeId - The ID of the node
   * @param properties - An object containing properties to be overriden in the node
   * @param pipelineId - The ID of the pipeline
   */
  setNodeProperties(
    nodeId: string,
    properties: {
      nodeTemplate:
        | NodeTypeDef
        | {
            type: string;
            op: string;
          };
      offsetX: number;
      offsetY: number;
    },
    pipelineId: string
  ): void;
  /**
   * Sets the node parameters
   * @param nodeId - The ID of the node
   * @param parameters - An array of parameters
   * @param pipelineId - The ID of the pipeline
   */
  setNodeParameters(
    nodeId: string,
    parameters: Record<string, unknown>[],
    pipelineId: string
  ): void;
  /**
   * Sets the node UI parameters
   * @param nodeId - The ID of the node
   * @param uiParameters - An array of UI parameters
   * @param pipelineId - The ID of the pipeline
   */
  setNodeUiParameters(
    nodeId: string,
    uiParameters: Record<string, unknown>[],
    pipelineId: string
  ): void;
  /**
   * Sets the node messages
   * @param nodeId - The ID of the node
   * @param messages - An array of messages
   * @param pipelineId - The ID of the pipeline
   */
  setNodeMessages(
    nodeId: string,
    messages: Record<string, unknown>[],
    pipelineId: string
  ): void;
  /**
   * Sets a single message on a node
   * @param nodeId - The ID of the node
   * @param message - A message
   * @param pipelineId - The ID of the pipeline
   */
  setNodeMessage(nodeId: string, message: string, pipelineId: string): void;
  /**
   * Sets the lable for a node
   * @param nodeId - The ID of the node
   * @param newLabel - The label
   * @param pipelineId - The ID of the pipeline
   */
  setNodeLabel(nodeId: string, newLabel: string, pipelineId: string): void;
  /**
   * Sets the class name to newClassName of the nodes identified by nodeIds
   * array in the pipeline specified by pipeline ID. The class name will be
   * applied to the node body path.
   */
  setNodesClassName(
    nodeIds: string[],
    newClassName: string,
    pipelineId: string
  ): void;
  /**
   * Sets the decorations on a node. The decorations array passed in
   * will replace any decorations currently applied to the node.
   * @param nodeId - The ID of the node
   * @param newDecorations - An array of decorations. See Wiki for details.
   * @param pipelineId - The ID of the pipeline
   */
  setNodeDecorations(
    nodeId: string,
    newDecorations: Decoration[],
    pipelineId: string
  ): void;
  /**
   * Sets the input ports on a node. The inputs array of ports provided will
   * replace any input ports for a node.
   * @param nodeId - The ID of the node
   * @param inputs - An array of input port objects.
   * @param pipelineId - The ID of the pipeline
   */
  setNodeInputPorts(
    nodeId: string,
    inputs: Record<string, unknown>[],
    pipelineId: string
  ): void;
  /**
   * Sets the output ports on a node. The outputs array of ports provided will
   * replace any output ports for a node.
   * @param nodeId - The ID of the node
   * @param outputs - An array of output port objects.
   * @param pipelineId - The ID of the pipeline
   */
  setNodeOutputPorts(
    nodeId: string,
    outputs: Record<string, unknown>[],
    pipelineId: string
  ): void;
  /**
   * Sets the decorations of multiple nodes at once. The decorations array
   * passed in will replace any decorations currently applied to the nodes.
   * pipelineNodeDecorations - Specifies the nodes and their decorations.
   * It is a JavaScript array like this:
   *
   * ```javascript
   *   [
   *     { pipelineId: <pipelineId>, nodeId: <nodeId>, decorations: <decoration_spec_array>},
   *     { pipelineId: <pipelineId>, nodeId: <nodeId>, decorations: <decoration_spec_array>},
   *     { pipelineId: <pipelineId>, nodeId: <nodeId>, decorations: <decoration_spec_array>}
   *   ]
   * ```
   */
  setNodesMultiDecorations(
    pipelineNodeDecorations: {
      pipelineId: string;
      nodeId: string;
      decorations: Decoration[];
    }[]
  ): void;
  /**
   * Sets the input port label on a node
   * @param nodeId - The ID of the node
   * @param portId - The ID of the input port
   * @param newLabel - The label
   * @param pipelineId - The ID of the pipeline
   */
  setInputPortLabel(
    nodeId: string,
    portId: string,
    newLabel: string,
    pipelineId: string
  ): void;
  /**
   * Sets the output port label on a node
   * @param nodeId - The ID of the node
   * @param portId - The ID of the output port
   * @param newLabel - The label
   * @param pipelineId - The ID of the pipeline
   */
  setOutputPortLabel(
    nodeId: string,
    portId: string,
    newLabel: string,
    pipelineId: string
  ): void;
  /**
   * Gets a node
   * @param nodeId - The ID of the node
   * @param pipelineId - The ID of the pipeline
   */
  getNode(nodeId: string, pipelineId?: string): CanvasNode;
  /**
   * Gets the UI parameters for a node
   * @param nodeId - The ID of the node
   * @param pipelineId - The ID of the pipeline
   */
  getNodeUiParameters(
    nodeId: string,
    pipelineId: string
  ): Record<string, unknown>[];
  /**
   * Gets the supernodes for a pipeline.
   * @param pipelineId - The ID of the pipeline
   */
  getSupernodes(pipelineId: string): Record<string, unknown>[];
  /**
   * @return supernode ID that has a subflow_ref to the given pipelineId.
   */
  getSupernodeObjReferencing(pipelineId: string): string;
  /**
   * Gets the messages for a node
   * @param nodeId - The ID of the node
   * @param pipelineId - The ID of the pipeline
   */
  getNodeMessages(
    nodeId: string,
    pipelineId: string
  ): Record<string, unknown>[];
  /**
   * Gets the array of input ports for the node or null if the node ID is
   * not recognized.
   * @param nodeId - The ID of the node
   * @param pipelineId - The ID of the pipeline
   */
  getNodeInputPorts(
    nodeId: string,
    pipelineId: string
  ): Record<string, unknown>[];
  /**
   * Gets the array of output ports for the node or null if the node ID is
   * not recognized.
   * @param nodeId - The ID of the node
   * @param pipelineId - The ID of the pipeline
   */
  getNodeOutputPorts(
    nodeId: string,
    pipelineId: string
  ): Record<string, unknown>[];
  /**
   * Gets a message for a specific control for a node
   * @param nodeId - The ID of the node
   * @param controlName - The control name
   * @param pipelineId - The ID of the pipeline
   */
  getNodeMessage(
    nodeId: string,
    controlName: string,
    pipelineId: string
  ): string;
  /**
   * Gets an array of decorations for a node
   * @param nodeId - The ID of the node
   * @param pipelineId - The ID of the pipeline
   */
  getNodeDecorations(nodeId: string, pipelineId: string): Decoration[];
  /**
   * Gets the class name associated with the node specified by nodeId in the
   * pipeline specified by pipelineId.
   */
  getNodeClassName(nodeId: string, pipelineId: string): string;
  /**
   * Gets the style specification (see Wiki) for a node
   * @param nodeId - The ID of the node
   * @param temporary - A boolean to indicate if the style is serialized when
   *             getPipelineFlow() method is called or not.
   * @param pipelineId - The ID of the pipeline
   */
  getNodeStyle(
    nodeId: string,
    temporary: boolean,
    pipelineId: string
  ): StyleSpec;
  /**
   * Returns an array of nodes that are for the branch(es) that the nodes,
   * identified by the node IDs passed in, are within.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - The ID of the pipeline where the nodes exist
   */
  getBranchNodes(nodeIds: string[], pipelineId: string): CanvasNode[];
  /**
   * Returns an array of nodes that are upstream from the nodes
   * identified by the node IDs passed in.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - The ID of the pipeline where the nodes exist
   */
  getUpstreamNodes(nodeIds: string[], pipelineId: string): CanvasNode[];
  /**
   * Returns an array of nodes that are downstream from the nodes
   * identified by the node IDs passed in.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - The ID of the pipeline where the nodes exist
   */
  getDownstreamNodes(nodeIds: string[], pipelineId: string): CanvasNode[];
  /**
   * Returns a boolean to indicate whether the supernode is expanded in place.
   * @param nodeId - The ID of the node
   * @param pipelineId - The ID of the pipeline
   */
  isSuperNodeExpandedInPlace(nodeId: string, pipelineId: string): boolean;
  /**
   * Sets the label, for the node identified, to edit mode, provided the node
   * label is editable. This allows the user to edite the label text.
   */
  setNodeLabelEditingMode(nodeId: string, pipelineId: string): void;
  /**
   * Sets the decoration label, for the decoration in the node identified, to edit
   * mode, provided the node label is editable. This allows the user to edit the
   * label text.
   */
  setNodeDecorationLabelEditingMode(
    decId: string,
    nodeId: string,
    pipelineId: string
  ): void;

  /**
   * ## Comment methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#comment-methods
   */

  /**
   * Returns the comments from the pipeline.
   * @param pipelineId - The ID of the pipeline
   */
  getComments(pipelineId: string): CanvasComment[];
  /**
   * Returns a comment from the pipeline.
   * @param comId - The ID of the comment
   * @param pipelineId - The ID of the pipeline
   */
  getComment(comId: string, pipelineId: string): CanvasComment;
  /**
   * Returns a position object which indicates the position of where a new
   * comment should be placed in a situation where the mouse position cannot be
   * used (e.g. the toolbar button was clicked).
   * pipelineId - The ID of the pipeline
   */
  getNewCommentPosition(pipelineId): { x: number; y: number };
  /**
   * Creates a comment for the pipeline.
   * @param source - Input data
   * @param pipelineId - The ID of the pipeline
   */
  createComment(source: CanvasComment, pipelineId: string): void;
  /**
   * Adds a comment to the pipeline.
   * @param data - the data describing the comment
   * @param pipelineId - The ID of the pipeline
   */
  addComment(data: CanvasComment, pipelineId: string): void;
  /**
   * Edits a comment with the data.
   * @param data - the comment
   * @param pipelineId - The ID of the pipeline
   */
  editComment(data: CanvasComment, pipelineId: string): void;
  /**
   * Sets the properties in the comment identified by the commentId. The
   * commentProperties is an object containing one or more properties that will
   * replace the corresponding properties in the comment. For example: if
   * commentProperties is { x_pos: 50, y_pos: 70 } the comment
   * will be set to that position.
   */
  setCommentProperties(
    commentId: string,
    commentProperties: Partial<CanvasComment>,
    pipelineId: string
  ): void;
  /**
   * Sets the class name to newClassName of the comments identified by commentIds
   * array in the pipeline specified by pipeline ID. The class name will be
   * applied to the comment body path.
   */
  setCommentsClassName(
    commentIds: string[],
    newClassName: string,
    pipelineId: string
  ): void;
  /**
   * Deletes a comment
   * @param comId - The ID of the comment
   * @param pipelineId - The ID of the pipeline
   */
  deleteComment(comId: string, pipelineId: string): void;
  /**
   * Gets the class name associated with the comment specified by commentId in the
   * pipeline specified by pipelineId.
   */
  getCommentClassName(commentId: string, pipelineId: string): void;
  /**
   * Gets the style spcification (see Wiki) for a comment
   * @param commentId - The ID of the node
   * @param temporary - A boolean to indicate if the style is serialized when
   *             getPipelineFlow() method is called or not.
   * @param pipelineId - The ID of the pipeline
   */
  getCommentStyle(
    commentId: string,
    temporary: boolean,
    pipelineId: string
  ): StyleSpec;
  /** Hides all comments on the canvas. */
  hideComments(): void;
  /**
   * Shows all comments on the canvas - if they were previously hiding.
   */
  showComments(): void;
  /**
   * Returns true if comments are currently hiding.
   */
  isHidingComments(): boolean;
  /**
   * Sets the comment identified, to edit mode so the user can
   * edit the comment.
   */
  setCommentEditingMode(commentId: string, pipelineId: string): void;

  /**
   * Link methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#link-methods
   */

  /**
   * Gets a link
   * @param linkId - The ID of the link
   * @param pipelineId - The ID of the pipeline
   */
  getLink(linkId: string, pipelineId: string): CanvasLink;
  /**
   * @return an array of link objects for the pipelineId passed in.
   * @param pipelineId - The ID of the pipeline
   */
  getLinks(pipelineId: string): CanvasLink[];
  /**
   * Sets the properties in the link identified by the linkId. The
   * linkProperties is an object containing one or more properties that will
   * replace the corresponding properties in the link. For exam`ple: if
   * linkProperties is { trgNodeId: "123", trgNodePortId: "789" } the target
   * node ID will be set to "123" and the target port ID set to "789".
   */
  setLinkProperties(
    linkId: string,
    linkProperties: Partial<CanvasLink>,
    pipelineId: string
  ): void;
  /**
   * Sets the source properties in the data link identified by the linkId. The
   * srcNodeId and srcNodePortId will be set to the values provided. If
   * srcNodePortId is set to null the current srcNodePortId will be removed
   * from the link. Also, if the link has a srcPos property (because its
   * source end is detached) that will be removed.
   */
  setNodeDataLinkSrcInfo(
    linkId: string,
    srcNodeId: string,
    srcNodePortId: string,
    pipelineId: string
  ): void;
  /**
   * Sets the target properties in the data link identified by the linkId. The
   * trgNodeId and trgNodePortId will be set to the values provided. If
   * trgNodePortId is set to null the current trgNodePortId will be removed
   * from the link. Also, if the link has a trgPos property (because its
   * target end is detached) that will be removed.
   */
  setNodeDataLinkTrgInfo(
    linkId: string,
    trgNodeId: string,
    trgNodePortId: string,
    pipelineId: string
  ): void;
  /**
   * Gets a node to node data link
   * @param srcNodeId - The ID of the source node
   * @param srcNodePortId - The ID of the source node port
   * @param trgNodeId - The ID of the target node
   * @param trgNodePortId - The ID of the target node port
   * @param pipelineId - The ID of the pipeline
   */
  getNodeDataLinkFromInfo(
    srcNodeId: string,
    srcNodePortId: string,
    trgNodeId: string,
    trgNodePortId: string,
    pipelineId: string
  ): CanvasNode;
  /**
   * Gets a comment to node link
   * @param id1 - The ID of the comment
   * @param id2 - The ID of the node
   * @param pipelineId - The ID of the pipeline
   */
  getCommentLinkFromInfo(
    id1: string,
    id2: string,
    pipelineId: string
  ): Record<string, unknown>;
  /**
   * Gets a node to node association link
   * @param id1 - The ID of one of the node
   * @param id2 - The ID of one of the node
   * @param pipelineId - The ID of the pipeline
   */
  getNodeAssocLinkFromInfo(id1: string, id2: string, pipelineId: string): void;
  /**
   * Adds links to a pipeline
   * @param linkList - An array of links
   * @param pipelineId - The ID of the pipeline
   */
  addLinks(linkList: CanvasLink[], pipelineId?: string): void;
  /**
   * Deletes a link
   * @param source - An array of links
   * @param pipelineId - The ID of the pipeline
   */
  deleteLink(
    link: string | CanvasLink | Record<string, unknown>,
    pipelineId?: string
  ): void;
  /**
   * Creates node to node links
   * @param data - Data describing the links
   * @param pipelineId - The ID of the pipeline
   */
  createNodeLinks(
    data: {
      id?: string;
      type: string;
      nodes: {
        id?: string;
        portId?: string;
        srcPos?: { x_pos: number; y_pos: number };
      }[];
      targetNodes: {
        id?: string;
        portId?: string;
        trgPos?: { x_pos: number; y_pos: number };
      }[];
    },
    pipelineId?: string
  ): CanvasLink[];
  /**
   * Creates comment links
   * @param data - Data describing the links
   * @param pipelineId - The ID of the pipeline
   */
  createCommentLinks(data: Record<string, unknown>, pipelineId: string): void;
  /**
   * Sets the class name to newClassName of the links identified by linkIds
   * array in the pipeline specified by pipeline ID. The class name will be
   * applied to the link line path.
   */
  setLinksClassName(
    linkIds: string[],
    newClassName: string,
    pipelineId: string
  ): void;
  /**
   * Sets the style of the links specified by pipelineLinkIds to be
   * the newStyle which will be either temporary or permanent.
   * @param pipelineLinkIds - This identifies the objects to be styles. It is a
   * javascript object like this:
   *   {
   *     <pipelineID_1>: [
   *       <linkID_1_1>,
   *       <linkID_1_2>
   *     ],
   *     <pipelineID_2>: [
   *         <linkID_2_1>,
   *         <linkID_2_2>
   *     ]
   *   }
   * @param newStyle - This is a style specification. See the wiki for details.
   * @param temporary - A boolean to indicate if the style is serialized when
   *             getPipelineFlow() method is called or not.
   */
  setLinksStyle(
    pipelineLinkIds: Record<string, string[]>,
    newStyle: StyleSpec,
    temporary: boolean
  ): void;
  /**
   * Sets the styles of multiple links at once.
   * @param pipelineObjStyles - Specified the links and the styles each should be
   * set to. It is a javascript array like this:
   *   [
   *     { pipelineId: <pipelineId>, objId: <linkId>, style: <style_spec>},
   *     { pipelineId: <pipelineId>, objId: <linkId>, style: <style_spec>},
   *     { pipelineId: <pipelineId>, objId: <linkId>, style: <style_spec>}
   *   ]
   * @param temporary - A boolean to indicate if the styles are serialized when
   *             getPipelineFlow() method is called or not.
   */
  setLinksMultiStyle(
    pipelineObjStyles: PipelineObjectStyle[],
    temporary: boolean
  ): void;
  /**
   * Gets the class name associated with the link specified by linkId in the
   * pipeline specified by pipelineId.
   */
  getLinkClassName(linkId: string, pipelineId: string): void;
  /**
   * Returns the style specification for a link.
   * @param linkIds - An array of links
   * @param temporary - A boolean to indicate if the style is serialized when
   *             getPipelineFlow() method is called or not.
   * @param pipelineId - The ID of the pipeline
   * @return the style specification for a link.
   */
  getLinkStyle(
    linkId: string,
    temporary: boolean,
    pipelineId: string
  ): StyleSpec;
  /**
   * Sets the decorations on a link. The decorations array passed in
   * will replace any decorations currently applied to the link.
   * @param linkId - The ID of the link
   * @param newDecorations - An array of decorations. See Wiki for details.
   * @param pipelineId - The ID of the pipeline
   */
  setLinkDecorations(
    linkId: string,
    newDecorations: Decoration[],
    pipelineId: string
  ): void;
  /**
   * Sets the decorations of multiple links at once. The decorations array
   * passed in will replace any decorations currently applied to the links.
   * @param pipelineLinkDecorations - Specifies the links and their decorations.
   *
   * ```javascript
   * It is a javascript array like this:
   *   [
   *     { pipelineId: <pipelineId>, linkId: <linkId>, decorations: <decoration_spec_array>},
   *     { pipelineId: <pipelineId>, linkId: <linkId>, decorations: <decoration_spec_array>},
   *     { pipelineId: <pipelineId>, linkId: <linkId>, decorations: <decoration_spec_array>}
   *   ]
   * ```
   */
  setLinksMultiDecorations(
    pipelineLinkDecorations: {
      pipelineId: string;
      linkId: string;
      decorations: Decoration[];
    }[]
  ): void;
  /**
   * Gets an array of decorations for a link
   * @param linkId - The ID of the link
   * @param pipelineId - The ID of the pipeline
   */
  getLinkDecorations(linkId: string, pipelineId: string): Decoration[];
  /**
   * Sets the decoration label, for the decoration in the link identified, to edit
   * mode provided the link label is editable. This allows the user to edit the
   * label text.
   */
  setLinkDecorationLabelEditingMode(
    decId: string,
    linkId: string,
    pipelineId: string
  ): void;

  /**
   * Breadcrumbs methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#breadcrumbs-methods
   */

  /**
   * Returns the current array of breadcrumbs. There will one breadcrumb object
   * for each level of supernode that the user has navigated into. This array
   * can be used to display breadcrumbs to the user to show where they are
   * within the navigation hierarchy within common canvas.
   */
  getBreadcrumbs(): { pipelineId?: string; pipelineFlowId?: string }[];
  /**
   * @return the last breadcrumb which represents the level with supernode
   * hierarchy that the user has currently navigated to.
   */
  getCurrentBreadcrumb(): { pipelineId?: string; pipelineFlowId?: string };

  /**
   * ## Branch highlight methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#branch-highlight-methods
   */

  /**
   * Highlights the branch(s) (both upstream and downstream) from the node
   * IDs passed in and returns the highlighted object Ids.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - The ID of the pipeline
   */
  highlightBranch(nodeIds: string[], pipelineId: string): string[];
  /**
   * Highlights the upstream nodes from the node IDs passed in
   * and returns the highlighted object Ids.
   */
  highlightUpstream(nodeIds: string[], pipelineId: string): string[];
  /**
   * Highlights the downstream nodes from the node IDs passed in
   * and returns highlighted object Ids.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - The ID of the pipeline
   */
  highlightDownstream(nodeIds: string[], pipelineId: string): string[];

  /**
   * ## Logging methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#logging-methods
   */

  /**
   * @return a Boolean to indicate whether canvas logging is switched on or off.
   */
  getLoggingState(): boolean;
  /**
   * Sets canvas logging based on the Boolean passed in.
   * @param state
   */
  setLoggingState(state: boolean): void;

  /**
   * Palette methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#palette-methods_1
   */

  openPalette(): void;
  closePalette(): void;
  isPaletteOpen(): boolean;

  /**
   * ## Context menu methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#context-menu-methods
   */

  /**
   * Opens the context menu
   * @param menuDef
   */
  openContextMenu(menuDef: Record<string, unknown>): void;
  /**
   * Closes the context menu
   */
  closeContextMenu(): void;

  /**
   * ## Notification panel methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#notification-panel-methods
   */

  /**
   * Opens the notification panel
   */
  openNotificationPanel(): void;
  /**
   * Closes the notification panel
   */
  closeNotificationPanel(): void;
  /**
   * Either opens or closes the notifictaion panel based on its current status
   */
  toggleNotificationPanel(): void;

  /**
   * Right flyout methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#right-flyout-methods
   */

  /**
   * @return a boolean to indicate if the right flyout is open or not
   */
  isRightFlyoutOpen(): boolean;

  /**
   * Top panel methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#top-panel-methods
   */

  /**
   * @return a boolean to indicate if the top panel is open or not
   */
  isTopPanelOpen(): boolean;

  /**
   * ## Bottom panel methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#bottom-panel-methods
   */

  isBottomPanelOpen(): boolean;
  /**
   * Sets the height of the bottom panel in pixels. This can be called
   * immediately after the CanvasController has been created, if the bottom
   * panel should be displayed at a specific height when it first opens.
   * @param height - height in pixels
   */
  setBottomPanelHeight(height: number): void;

  /**
   * ## Canvas/pipeline navigation methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#canvaspipeline-navigation-methods
   */

  /**
   * Displays a pipeline (identified by the pipelineId passed in). This must be
   * one of the pipelines referenced by the current set of breadcrumbs. It
   * cannot be used to open a new pipeline outside the current set of breadcruumbs.
   * @param pipelineId
   */
  displaySubPipeline(pipelineId: string): void;
  /**
   * Displays a pipeline for the supernode (identified by the supernodeId
   * parameter) in the pipeline (identified by the pipelineId parameter). For
   * correct breadcrumb generation this pipeline should be the one in the last
   * of the current set of breadcrumbs. That is, the pipeline currently shown
   * "full page" in the canvas.
   */
  displaySubPipelineForSupernode(supernodeId: string, pipelineId: string): void;
  /**
   * Displays full-page the previous pipeline from the one currently being displayed
   */
  displayPreviousPipeline(): void;

  /**
   * Command Stack interaction methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#command-stack-interaction-methods
   */

  /**
   * Adds the command object to the command stack which will cause the
   * do() method of the command to be called.
   */
  do(command: unknown): void;
  /**
   * Calls the undo() method of the next available command on the command
   * stack that can be undone, if one is available.
   */
  undo(): void;
  /**
   * Undoes a number of commands on the command stack as indicated by the
   * 'count' parameter. If 'count' is bigger than the number of undoable commands
   * on the stack, all undoable commands currently on the command stack
   * will be undone. Uses the editActionHandler method which will cause
   * the app's editActionHandler to be called.
   */
  undoMulti(count: number): void;
  /**
   * Calls the redo() method of the next available command on the command
   * stack that can be redone, if one is available.
   */
  redo(): void;
  /**
   * Redoes a number of commands on the command stack as indicated by the
   * 'count' parameter. If 'count' is bigger than the number of redoable commands
   * on the stack, all redoable commands currently on the command stack
   * will be redone. Uses the editActionHandler method which will cause
   * the app's editActionHandler to be called.
   */
  redoMulti(count: number): void;
  /**
   * Returns true if there is a command on the command stack
   * available to be undone.
   */
  canUndo(): void;
  /**
   * Returns true if there is a command on the command stack
   * available to be redone.
   */
  canRedo(): void;
  /**
   * Returns a string which is the label that descibes the next undoable
   * command.
   */
  getUndoLabel(): void;
  /**
   * Returns a string which is the label that descibes the next redoable
   * command.
   */
  getRedoLabel(): void;
  /** Returns an array of all undoable commands currently on the command stack. */
  getAllUndoCommands(): void;
  /** Returns an array of all redoable commands currently on the command stack. */
  getAllRedoCommands(): void;
  /** Clears the command stack of all currently stored commands. */
  clearCommandStack(): void;

  /**
   * ## Zoom methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#zoom-methods
   */

  /**
   * Centers the canvas contents and zooms in
   */
  zoomIn(): void;
  /**
   * Centers the canvas contents and zooms out
   */
  zoomOut(): void;
  /**
   * Zooms the canvas contents to fit within the viewport
   */
  zoomToFit(): void;
  /**
   * Changes the zoom amounts for the canvas. This method does not alter the
   * pipelineFlow document. zoomObject is an object with three fields:
   * @param zoomObject - accepts a config object where
   *
   * `x`: Is the horizontal translate amount which is a number indicating the
   *    pixel amount to move. Negative left and positive right
   *
   * `y`: Is the vertical translate amount which is a number indicating the
   *    pixel amount to move. Negative up and positive down.
   *
   * `k`: is the scale amount which is a number greater than 0 where 1 is the
   *    default scale size.
   */
  zoomTo(zoomObject: { x: number; y: number; k: number }): void;
  /**
   * Increments the translation of the canvas by the x and y increment
   * amounts. The optional animateTime parameter can be provided to animate the
   * movement of the canvas. It is a time for the animation in milliseconds.
   * If omitted the movement happens immediately.
   */
  translateBy(x: number, y: number, animateTime: number): void;
  /**
   * @return the current zoom object for the currently displayed canvas or null
   * if the canvas is not yet rendered for the first time.
   */
  getZoom(): Record<string, unknown> | null;
  /**
   * Returns a zoom object required to pan the objects (nodes and/or comments)
   * identified by the objectIds array to 'reveal' the objects in the viewport.
   * The zoom object returned can be provided to the CanvasController.zoomTo()
   * method to perform the zoom/pan action.
   * If the xPos and yPos variables are provided it will return a zoom object
   * to pan the objects to a location specified by a percentage offset of the
   * viewport width and height respectively.
   * If the xPos and yPos parameters are undefined (omitted) and all the
   * objects are fully within the canvas viewport, it will return null.
   * This can be used to detect whether the objects are fully visible or not.
   * Otherwise it will return a zoom object which can be used to pan the
   * objects into the viewport so they appear at the nearest side of the
   * viewport to where they are currently positioned.
   * The zoom object has three fields:
   *
   * `x`: Is the horizontal translate amount which is a number indicating the
   *    pixel amount to move. Negative left and positive right
   *
   * `y`: Is the vertical translate amount which is a number indicating the
   *    pixel amount to move. Negative up and positive down.
   *
   * `k`: is the scale amount which is a number greater than 0 where 1 is the
   *    default scale size.
   *
   * Parameters:
   * @param objectIds - An array of nodes and/or comment IDs.
   * @param xPos - Optional. Can be set to percentage offset of the viewport width.
   * @param yPos - Optional. Can be set to percentage offset of the viewport height.
   */
  getZoomToReveal(
    objectIds: string[],
    xPos?: number,
    yPos?: number
  ): { x: number; y: number; k: number };
  /**
   * Clears any saved zoom values stored in local storage. This means
   * newly opened flows will appear with the default zoom. This method
   * is only applicable when the `enableSaveZoom` config parameter is
   * set to "LocalStorage".
   */
  clearSavedZoomValues(): void;
}

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
export type ApplyPropertyChangesCallback = (
  propertySet: Record<string, unknown>,
  appData: Record<string, unknown> | undefined,
  additionalInfo: {
    messages?: MessageDef[];
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
  showRequiredIndicator: boolean;
  /**
   * Default true to show “Alerts” tab whenever there are error or warning
   * messages. If set to false, Alerts tab won’t be displayed.
   */
  showAlertsTab: boolean;
  /**
   * Default []. When set this will filter out any values in the array in
   * the parameters returned when applyPropertyChanges is call. Only
   * primitive data types are currently supported.
   */
  returnValueFiltering: unknown[] | string;
  /**
   * View categories in right-flyout. Can be "accordions" or "tabs".
   * default: "accordions".
   */
  categoryView: "accordions" | "tabs";
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

export type PortObject =
  | {
      type: "circle" | "circleWithArrow";
    }
  | { type: "image"; src: string; width: number; height: number }
  | {
      type: "jsx";
      src: ReactNode;
      width: number;
      height: number;
    };

/**
 * https://elyra-ai.github.io/canvas/03.06.01-node-customization/#default-values-for-node-layout-properties
 */
export interface NodeLayout {
  /**
   * Default node sizes. The height might be overridden for nodes with more ports
   * than will fit in the default size.
   */
  defaultNodeWidth: number;
  defaultNodeHeight: number;
  /**
   * A space separated list of classes that will be added to the group <g>
   * DOM element for the node.
   */
  className: string;
  /**
   * Displays the node outline shape underneath the image and label.
   */
  nodeShapeDisplay: boolean;
  /**
   * Displays the external object specified, as the body of the node
   */
  nodeExternalObject: FunctionComponent<any> | ComponentClass<any>;
  /**
   * Default node shape. Can be "rectangle" or "port-arcs"
   */
  nodeShape: "port-arcs" | "rectangle";
  /**
   * SVG path strings to define the shape of your node and its
   * selection highlighting. If set to null the paths will be set by default
   * based on the nodeShape setting.
   */
  bodyPath: null | string;
  selectionPath: null | string;
  /** Display image */
  imageDisplay: boolean;
  imageWidth: number;
  imageHeight: number;
  /** Image position */
  imagePosition: "topLeft";
  imagePosX: number;
  imagePosY: number;
  /** Display label */
  labelDisplay: boolean;
  /** Label dimensions */
  labelWidth: number;
  labelHeight: number;
  /** Label position */
  labelPosition: "topLeft";
  labelPosX: number;
  labelPosY: number;
  /** Label appearance */
  labelEditable: false;
  /** can be "left" or "center" */
  labelAlign: "left" | "center";
  /** false allow multi-line labels */
  labelSingleLine: boolean;
  labelOutline: boolean;
  /** null allows unlimited characters */
  labelMaxCharacters: boolean;
  /** true allows line feed to be inserted into label */
  labelAllowReturnKey: boolean;
  /**
   * An array of decorations to be applied to the node. For details see:
   * https://elyra-ai.github.io/canvas/03.04.01-decorations/
   * These are added to the node at run time and will not be saved into
   * the pipeline flow.
   */
  decorations: NodeDecoration[];
  /**
   * Positions and dimensions for 9 enumerated default decorator positions.
   * decoratorWidth and decoratorHeight are the dimensions of the outline
   * rectangle and decoratorPadding is the padding for the image within the
   * outline rectangle.
   */
  decoratorTopY: number;
  decoratorMiddleY: number;
  decoratorBottomY: number;
  decoratorLeftX: number;
  decoratorCenterX: number;
  decoratorRightX: number;
  /** Width, height and padding for image decorators */
  decoratorWidth: number;
  decoratorHeight: number;
  decoratorPadding: number;
  /** Width and height for label decorators */
  decoratorLabelWidth: 80;
  decoratorLabelHeight: 15;
  /** Display drop shadow under and round the nodes */
  dropShadow: boolean;
  /** The gap between a node and its selection highlight rectangle */
  nodeHighlightGap: number;
  /**
   * The size of the node sizing area that extends around the node, over
   * which the mouse pointer will change to the sizing arrows.
   */
  nodeSizingArea: number;
  /** Error indicator dimensions */
  errorPosition: "topLeft";
  errorXPos: number;
  errorYPos: number;
  errorWidth: number;
  errorHeight: number;
  /**
   * When sizing a supernode this decides the size of the corner area for
   * diagonal sizing.
   */
  nodeCornerResizeArea: number;
  /**
   * What point to draw the data links from and to when enableLinkType is set
   * to "Straight". Possible values are "image_center" or "node_center".
   */
  drawNodeLinkLineFromTo: "node_center" | "image_center";
  /**
   * What point to draw the comment to node link line to. Possible values
   * are "image_center" or "node_center".
   */
  drawCommentLinkLineTo: "node_center" | "image_center";
  /**
   * This is the size of the horizontal line protruding from the
   * port on the source node when drawing an elbow or straight connection line.
   */
  minInitialLine: number;
  /**
   * For the elbow connection type with nodes with multiple output ports,
   * this is used to increment the minInitialLine so that connection lines
   * do not overlap each other when they turn up or down after the elbow.
   */
  minInitialLineIncrement: number;
  /**
   * This is the minimum size of the horizontal line entering the
   * target port on the target node when drawing an Elbow connection line.
   */
  minFinalLine: number;
  /**
   * Display input ports.
   */
  inputPortDisplay: boolean;
  /**
   * Object for input port can be "circle" or "image".
   * @deprecated use inputPortDisplayObjects instead
   */
  inputPortObject: "circle" | "image";
  /**
   * If input port object is "image" use this image.
   * @deprecated use inputPortDisplayObjects instead
   */
  inputPortImage: string;
  /**
   * If input port dimensions for `inputPortObject: "image"`.
   * @deprecated use inputPortDisplayObjects instead
   */
  inputPortWidth: number;
  /**
   * @deprecated use inputPortDisplayObjects instead
   */
  inputPortHeight: number;
  inputPortDisplayObjects: PortObject[];
  /**
   * Indicates whether multiple input ports should be automatically
   * positioned (true) or positioned based on the contents of
   * inputPortPositions array (false).
   */
  inputPortAutoPosition: boolean;
  /**
   * An array of input port positions. Each element is structured like
   * this: { x_pos: 5, y_pos: 10, pos: "topLeft" }. x_pos and y_pos are
   * offsets from the pos point on the node.
   * The order of the elements corresponds to the order of ports in the
   * inputs array for the node. If there are more input ports than elements
   * in the array, the last element will be used for all remaining ports.
   */
  inputPortPositions: { x_pos: number; y_pos: number; pos: NodePosition }[];
  /**
   * An array of elements to control display of input port guide objects.
   * That is the object drawn at the end of a new link as it is being dragged.
   * Each element can have a number of different structures like this:
   * Either
   * { type: "circle" } // Can also be "circleWithArrow"
   * Or
   * { type: "image", src: "path/picture.svg", width: 10, height: 10 }
   * Or
   * { type: "jsx", src: (<FaceCool />), width: 16, height: 16 }
   *
   * The order of the elements corresponds to the order of ports in the
   * inputs array for the node. If there are more input ports than elements
   * in the array, the last element will be used for all remaining ports.
   */
  inputPortGuideObjects: PortObject[];
  /**
   * Position of left single input port. Multiple input ports will be
   * automatically positioned with the Y coordinate being overriden. These
   * values are an offset from the top left corner of the node outline.
   * Used when linkDirection is "LeftRight".
   */
  inputPortLeftPosX: number;
  inputPortLeftPosY: number;
  /**
   * Position of top single input port. Multiple input ports will be
   * automatically positioned with the X coordinate being overriden. These
   * values are an offset from the top left corner of the node outline.
   * Used when linkDirection is "TopBottom".
   */
  inputPortTopPosX: number;
  inputPortTopPosY: number;
  /**
   * Position of bottom single input port. Multiple input ports will be
   * automatically positioned with the X coordinate being overriden. These
   * values are an offset from the bottom left corner of the node outline.
   * Used when linkDirection is "BottomTop".
   */
  inputPortBottomPosX: number;
  inputPortBottomPosY: number;
  /**
   * The 'guide' is the object drawn at the mouse position as a new line
   * is being dragged outwards.
   * Object for input port guide can be "circle" or "image".
   * @deprecated use inputPortGuideObjects instead
   */
  inputPortGuideObject: "circle" | "image";
  /**
   * If input port guide object is "image" use this image.
   * @deprecated use inputPortGuideObjects instead
   */
  inputPortGuideImage: string;
  /** Display output ports. */
  outputPortDisplay: boolean;
  /**
   * Object for output port can be "circle" or "image".
   * @deprecated use outputPortDisplayObjects instead
   */
  outputPortObject: "circle" | "image";
  /**
   * If output port object is "image" use this image.
   * @deprecated use outputPortDisplayObjects instead
   */
  outputPortImage: string;
  /**
   * Output port dimensions for `outputPortImage: "image"`.
   * @deprecated use outputPortDisplayObjects instead
   */
  outputPortWidth: number;
  /**
   * @deprecated use outputPortDisplayObjects instead
   */
  outputPortHeight: number;
  /**
   * An array of elements to control display of output ports. Each element
   * can have a number of different structures like this:
   * Either
   * { type: "circle" } // Can also be "circleWithArrow"
   * Or
   * { type: "image", src: "path/picture.svg", width: 10, height: 10 }
   * Or
   * { type: "jsx", src: (<FaceCool />), width: 16, height: 16 }
   *
   * The order of the elements corresponds to the order of ports in the
   * outputs array for the node. If there are more output ports than elements
   * in the array, the last element will be used for all remaining ports.
   */
  outputPortDisplayObjects: PortObject[];
  /**
   * Indicates whether multiple output ports should be automatically
   * positioned (true) or positioned based on the contents of
   * outputPortPositions array (false).
   */
  outputPortAutoPosition: boolean;
  /**
   * An array of output port positions. Each element is structured like
   * this: { x_pos: 5, y_pos: 10, pos: "topRight" }. x_pos and y_pos are
   * offsets from the pos point on the node.
   * The order of the elements corresponds to the order of ports in the
   * outputs array for the node. If there are more output ports than elements
   * in the array, the last element will be used for all remaining ports.
   */
  outputPortPositions: { x_pos: number; y_pos: number; pos: NodePosition }[];
  /**
   * An array of elements to control display of output port guide objects.
   * That is the object drawn at the end of a new link as it is being dragged.
   * Each element can have a number of different structures like this:
   * Either
   * { type: "circle" } // Can also be "circleWithArrow"
   * Or
   * { type: "image", src: "path/picture.svg", width: 10, height: 10 }
   * Or
   * { type: "jsx", src: (<FaceCool />), width: 16, height: 16 }
   *
   * The order of the elements corresponds to the order of ports in the
   * outputs array for the node. If there are more output ports than elements
   * in the array, the last element will be used for all remaining ports.
   */
  outputPortGuideObjects: PortObject[];
  /**
   * Position of right single input port. Multiple input ports will be
   * automatically positioned with the Y coordinate being overriden. These
   * values are an offset from the top right corner of the node outline.
   * Used when linkDirection is "LeftRight".
   */
  outputPortRightPosX: number;
  outputPortRightPosY: number;
  /**
   * Position of top single input port. Multiple input ports will be
   * automatically positioned with the X coordinate being overriden. These
   * values are an offset from the top left corner of the node outline.
   * Used when linkDirection is "BottomTop".
   */
  outputPortTopPosX: number;
  outputPortTopPosY: number;
  /**
   * Position of bottom single input port. Multiple input ports will be
   * automatically positioned with the X coordinate being overriden. These
   * values are an offset from the bottom left corner of the node outline.
   * Used when linkDirection is "TopBottom".
   */
  outputPortBottomPosX: number;
  outputPortBottomPosY: number;
  /**
   * The 'guide' is the object drawn at the mouse position as a new line
   * is being dragged outwards.
   * Object for output port guide can be "circle" or "image".
   * @deprecated use outputPortGuideObjects instead
   */
  outputPortGuideObject: "circle" | "image";
  /**
   * If output port guide object is "image" use this image.
   * @deprecated use outputPortGuideObjects instead
   */
  outputPortGuideImage: string;
  /**
   * Automatically increases the node size to accommodate its ports so both
   * input and output ports can be shown within the dimensions of
   * the node.
   */
  autoSizeNode: boolean;
  /** Radius of either the input or output ports when they are set to "circle" */
  portRadius: number;
  /**
   * Size of an offset above and below the set of port arcs.
   */
  portArcOffset: number;
  /**
   * Radius of an imaginary circle around the port. This controls the
   * spacing of ports and the size of port arcs when nodeShape is set to
   * port-arcs.
   */
  portArcRadius: number;
  /** Spacing between the port arcs around the ports. */
  portArcSpacing: number;
  /**
   * Position of the context toolbar relative to the node. Some adjustment
   * will be made to account for the width of the toolbar.
   */
  contextToolbarPosition: NodePosition;
  /** Display of vertical ellipsis to show context menu */
  ellipsisDisplay: boolean;
  ellipsisPosition: "topLeft";
  ellipsisWidth: number;
  ellipsisHeight: number;
  ellipsisPosX: number;
  ellipsisPosY: number;
  ellipsisHoverAreaPadding: number;
}

/**
 * https://elyra-ai.github.io/canvas/03.02.01-canvas-config/
 */
export interface CanvasConfig {
  enableInteractionType?: "Mouse" | "Carbon" | "Trackpad";
  enableNodeFormatType?: "Horizontal" | "Vertical";
  enableLinkType?: "Curve" | "Elbow" | "Straight" | "Parallax";
  enableLinkDirection?: "LeftRight" | "TopBottom" | "BottomTop";
  enableLinkSelection?: "None" | "LinkOnly" | "Handles" | "Detachable";
  enableLinkReplaceOnNewConnection?: boolean;
  enableInternalObjectModel?: boolean;
  enablePaletteLayout?: "Model" | "Flyout" | "None";
  enableToolbarLayout?: "Top" | "None";
  enableResizableNodes?: boolean;
  enableInsertNodeDroppedOnLink?: boolean;
  enableRightFlyoutUnderToolbar?: boolean;
  enablePositionNodeOnRightFlyoutOpen?: boolean;
  enableHighlightUnavailableNodes?: boolean;
  enableHighlightNodeOnNewLinkDrag?: boolean;
  enableAutoLinkOnlyFromSelNodes?: boolean;
  enableExternalPipelineFlows?: boolean;
  enableMoveNodesOnSupernodeResize?: boolean;
  enableDisplayFullLabelOnHover?: boolean;
  enableSingleOutputPortDisplay?: boolean;
  enableDragWithoutSelect?: boolean;
  enableDragToMoveSizeNodesComments?: boolean;
  enableEditingActions?: boolean;
  enableStateTag?: "None" | "ReadOnly" | "Locked";
  enableDropZoneOnExternalDrag?: boolean;
  enableNodeLayout?: Partial<NodeLayout>;
  enableSaveZoom?: "LocalStorage" | "None" | "PipelineFlow";
  enablePanIntoViewOnOpen?: boolean;
  enableZoomIntoSubFlows?: boolean;
  enableSnapToGridType?: "During" | "None" | "After";
  enableSnapToGridX?: string;
  enableSnapToGridY?: string;
  enableAutoLayoutVerticalSpacing?: string;
  enableAutoLayoutHorizontalSpacing?: string;
  enableAssocLinkCreation?: boolean;
  enableAssocLinkType?: "Straight" | "RightSideCurve";
  enableBrowserEditMenu?: boolean;
  enableNarrowPalette?: boolean;
  enableContextToolbar?: boolean;
  enableRightFlyoutDragToResize?: boolean;
  enableFocusOnMount?: boolean;
  emptyCanvasContent?: ReactNode;
  dropZoneCanvasContent?: ReactNode;
  schemaValidation?: boolean;
  tipConfig?: {
    palette?: boolean;
    nodes?: boolean;
    ports?: boolean;
    links?: boolean;
    decorations?: boolean;
    stateTag?: boolean;
  };
  enableSelfRefLinks?: boolean;
  enableRaiseNodesToTopOnHover?: boolean;
  enableLinkMethod?: "Ports" | "Freeform";
  /**
   * @deprecated
   */
  enableStraightLinksAsFreeform?: boolean;
  enableLinksOverNodes?: boolean;
  enableMarkdownInComments?: boolean;
  enablePaletteHeader?: ReactNode;
  /**
   * @deprecated
   */
  paletteInitialState?: boolean;
  enableKeyboardNavigation?: boolean;
  enableParentClass?: string;
  enableImageDisplay?: "SVGInline" | "LoadSVGToDefs" | "SVGAsImage";
  enableLeftFlyoutUnderToolbar?: boolean;
}

export interface ToolbarActionItem {
  action?: string;
  label?: string;
  enable?: boolean;
  iconEnabled?: string;
  iconDisabled?: string;
  incLabelWithIcon?: string;
  kind?: string;
  tooltip?: string;
  isSelected?: boolean;
  jsx?: ReactNode;
  divider?: boolean;
}
export interface ToolbarConfig {
  leftBar: ToolbarActionItem[];
  rightBar?: ToolbarActionItem[];
  overrideAutoEnableDisable: boolean;
}

export interface NotificationConfig {
  action: string;
  label: string;
  enable: boolean;
  notificationHeader: string;
  notificationSubtitle: string;
  emptyMessage: string;
  clearAllMessage: string;
  keepOpen: boolean;
  clearAllCallback: () => void;
}

export interface CtxMenuConfig {
  enableCreateSupernodeNonContiguous: boolean;
  defaultMenuEntries: {
    saveToPalette: boolean;
    createSupernode: boolean;
    displaySupernodeFullPage: boolean;
    colorBackground: boolean;
  };
}

export interface KeyboardConfig {
  actions: {
    delete: boolean;
    undo: boolean;
    redo: boolean;
    selectAll: boolean;
    cutToClipboard: boolean;
    copyToClipboard: boolean;
    pasteFromClipboard: boolean;
  };
}

export type CtxMenuHandlerSource =
  | {
      type: "node";
      targetObject: CanvasNode;
      selectedObjectIds: string[];
      mousePos: { x: string; y: string };
    }
  | {
      type: "input_port" | "output_port" | "link" | "comment";
      targetObject: Record<string, unknown>;
      selectedObjectIds: string[];
      mousePos: { x: string; y: string };
    }
  | {
      type: "canvas";
      selectedObjectIds: string[];
      mousePos: { x: string; y: string };
    };

/** Existing internal common canvas actions */
type InternalAction =
  | "selectAll"
  | "cut"
  | "copy"
  | "paste"
  | "undo"
  | "redo"
  | "createSupernode"
  | "expandSupernode"
  | "collapseSupernode"
  | "deleteSelectedObjects"
  | "createComment"
  | "deleteLink"
  | "disconnectNode"
  | "highlightBranch"
  | "highlightDownstream"
  | "highlightUpstream"
  | "unhighlight";
export interface CtxMenuHandlerMenuAction {
  action?: InternalAction | string;
  label?: string;
  divider?: boolean;
  submenu?: boolean;
  enable?: boolean;
  toolbarItem?: boolean;
  icon?: string | ReactNode;
}

export interface EditActionData {
  editType:
    | "createComment"
    | "createNode"
    | "moveObjects"
    | "linkNodes"
    | "linkComment"
    | "resizeObjects"
    | "editComment"
    | "expandSuperNodeInPlace"
    | "displaySubPipeline"
    | "displayPreviousPipeline"
    | string;
  editSource: "contextmenu" | "toolbar" | "keyboard" | "canvas";
  selectedObjects: Record<string, unknown>[];
  /** @deprecated */
  selectedObjectIds: string[];
  [key: string]: unknown;
}

export type EditActionCommand = unknown;

export type ClickActionSource =
  | {
      clickType: "DOUBLE_CLICK" | "SINGLE_CLICK" | "SINGLE_CLICK_CONTEXTMENU";
      objectType: "node" | "comment" | "canvas" | "region";
      id?: string;
      selectedObjectIds: string[];
    }
  | {
      clickType: "DOUBLE_CLICK" | "SINGLE_CLICK" | "SINGLE_CLICK_CONTEXTMENU";
      objectType: "port";
      id: string;
      selectedObjectIds: string[];
      nodeId: string;
    };

export type GeneratorAction =
  | "create_node"
  | "create_comment"
  | "create_node_link"
  | "create_comment_link"
  | "clone_node"
  | "clone_comment"
  | "clone_node_link"
  | "clone_comment_link";
export interface GeneratorActionCreateNode {
  label: string;
  description: string;
  operator_id_ref: string;
  type: "model_node";
  image: string;
  input_ports: {
    id: "inPort" | "outPort";
    label: "Input Port";
    cardinality: {
      min: number;
      max: number;
    };
  }[];
  output_ports: [];
}
export type GeneratorData = GeneratorActionCreateNode | null;

export interface SelectionChangeHandlerData {
  selection: string[];
  selectedLinks: CanvasLink[];
  selectedNodes: NodeTypeDef[];
  selectedComments: CanvasLink[];
  addedLinks: CanvasLink[];
  addedNodes: NodeTypeDef[];
  addedComments: unknown[];
  deselectedLinks: CanvasLink[];
  deselectedNodes: NodeTypeDef[];
  deselectedComments: unknown[];
  selectedPipelineId: string;
}

export interface CommonCanvasProps {
  /**
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/
   * Your application code can programmatically perform many of the actions that the user can do in the common canvas using the Canvas Controller API. Note: See this section for differences between the structure of objects in the API and the schema.
   * In most cases within the API, the pipelineId parameter is optional. If pipelineId is omitted, the method will default to the pipeline that is currently displayed in the main canvas viewport.
   *
   * Warning 1: Do not alter the IDs of objects that currently exist on the canvas. Changing object IDs can cause internal problems, in particular with the command stack.
   *
   * Warning 2: When using external pipeline flows, Pipeline IDs must be globally unique identifiers.
   */
  canvasController: CanvasController;
  /**
   * https://elyra-ai.github.io/canvas/03.02.01-canvas-config/
   */
  config?: CanvasConfig;
  /**
   * https://elyra-ai.github.io/canvas/03.02.02-toolbar-config/
   */
  toolbarConfig?: ToolbarConfig;
  /**
   * https://elyra-ai.github.io/canvas/03.02.03-notification-config/
   */
  notificationConfig?: NotificationConfig;
  /**
   * https://elyra-ai.github.io/canvas/03.02.04-context-menu-config/
   */
  contextMenuConfig?: CtxMenuConfig;
  /**
   * https://elyra-ai.github.io/canvas/03.02.05-keyboard-config/
   */
  keyboardConfig?: KeyboardConfig;
  /**
   * https://elyra-ai.github.io/canvas/03.03.01-context-menu-handler/
   */
  contextMenuHandler?: ContextMenuHandler;
  /**
   * https://elyra-ai.github.io/canvas/03.03.02-before-edit-action-handler/
   */
  beforeEditActionHandler?: (
    data: EditActionData,
    command: EditActionCommand
  ) => EditActionCommand | void;
  /**
   * https://elyra-ai.github.io/canvas/03.03.03-edit-action-handler/
   */
  editActionHandler?: (
    data: EditActionData,
    command: EditActionCommand
  ) => void;
  /**
   * https://elyra-ai.github.io/canvas/03.03.09-click-action-handler/
   */
  clickActionHandler?: (source: ClickActionSource) => void;
  /**
   * https://elyra-ai.github.io/canvas/03.03.05-decoration-action-handler/
   */
  decorationActionHandler?: (
    object: Record<string, unknown>,
    id: string,
    pipelineId: string
  ) => void;
  /**
   * https://elyra-ai.github.io/canvas/03.03.04-layout-handler/
   */
  layoutHandler?: (data: CanvasNode) => Record<string, unknown>;
  /*
   * https://elyra-ai.github.io/canvas/03.03.06-tip-handler/
   */
  tipHandler?: (
    tipType: string,
    data: Record<string, unknown>
  ) => string | ReactNode | null;
  /**
   * https://elyra-ai.github.io/canvas/03.03.07-id-generator-handler/
   */
  idGeneratorHandler?: (action: GeneratorAction, data?: GeneratorData) => void;
  /**
   * https://elyra-ai.github.io/canvas/03.03.08-selection-change-handler/
   */
  selectionChangeHandler?: (data: SelectionChangeHandlerData) => void;
  /**
   * https://elyra-ai.github.io/canvas/03.03.10-action-label-handler/
   */
  actionLabelHandler?: (action: GeneratorAction) => string | null | void;
  showRightFlyout?: boolean;
  rightFlyoutContent?: ReactNode;
  showBottomPanel?: boolean;
  bottomPanelContent?: ReactNode;
}

export declare class CommonCanvas extends React.Component<CommonCanvasProps> {}
