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

import React, { ComponentClass, FunctionComponent, ReactNode } from "react";

import {
  // Pipeline flow
  PipelineFlowDef,
  PipelineDef,
  NodeTypeDef,
  NodeDecorationDef,
  LinkDecorationDef,
  // Shared declarations
  ZoomObjectDef,
  MessageDef,
  // Palette
  PipelineFlowPalette,
  CategoryDef,
  // Canvas Info
  CanvasInfo,
  CanvasPipeline,
  CanvasNode,
  CanvasExecutionNode,
  CanvasBindingEntryNode,
  CanvasBindingExitNode,
  CanvasSupernode,
  CanvasModelNode,
  CanvasPorts,
  CanvasPort,
  CanvasBoundPorts,
  CanvasBoundPort,
  CanvasComment,
  CanvasLink,
  CanvasCommentLink,
  CanvasNodeLink,
  CanvasAssociationLink
} from "@elyra/pipeline-schemas/types";

export type {
  // Pipeline flow
  PipelineFlowDef,
  PipelineFlowUiDef,
  PipelineDef,
  PipelineUiDef,
  NodeTypeDef,
  NodeUiDef,
  ExecutionNodeDef,
  SupernodeDef,
  BindingEntryNodeDef,
  BindingExitNodeDef,
  ModelNodeDef,
  PortsDef,
  PortDef,
  BoundPortsDef,
  BoundPortDef,
  PortUiDef,
  NodeDecorationDef,
  LinkDecorationDef,
  ImageDecorationDef,
  LabelDecorationDef,
  ShapeDecorationDef,
  JsxDecorationDef,
  DecorationSharedProperties,
  NodeLinkDef,
  NodeLinkUiDef,
  AssociationLinkDef,
  CommentLinkDef,
  CommentDef,
  AppDataDef,
  // Shared declarations
  ZoomObjectDef,
  MessageDef,
  RuntimeDef,
  RuntimeUiDef,
  ParamsetRef,
  CommonPipelineConnectionDef,
  CommonPipelineDataAssetDef,
  RecordSchema,
  Field,
  Metadata,
  // Palette
  PipelineFlowPalette,
  CategoryDef,
  // Canvas info
  CanvasInfo,
  CanvasPipeline,
  CanvasNode,
  CanvasExecutionNode,
  CanvasSupernode,
  CanvasBindingEntryNode,
  CanvasBindingExitNode,
  CanvasPorts,
  CanvasPort,
  CanvasBoundPorts,
  CanvasBoundPort,
  CanvasModelNode,
  CanvasComment,
  CanvasLink,
  CanvasCommentLink,
  CanvasNodeLink,
  CanvasAssociationLink
} from  "@elyra/pipeline-schemas/types";


// The 'setPipelineFlow' function has problems with some of the fields imported
// from JSON. So this creates a PipelineFlow that allows validation.
type RelaxedPipeline = Omit<PipelineDef, 'nodes'> & {
  nodes: unknown[]
}

export type RelaxedPipelineFlow = Omit<PipelineFlowDef, 'version' | 'json_schema' |  'pipelines'> & {
  version: string;
  json_schema: string;
  pipelines: RelaxedPipeline[]
}

// The 'setPipelineFlowPalette' function has problems with some of the fields imported
// from JSON. So this creates a PipelineFlowPalette that allows validation.
export type RelaxedPipelineFlowPalette = Omit<PipelineFlowPalette, 'version' | 'categories'> & {
  version?: string;
  categories?: unknown[];
}

// Create and export Decoration here because json2ts doesn't create this even
// though the JSON schema uses the "oneOf" keyword. This seems to be because
// the decoration definitions are in a child schema of pipeline-flow-v3-schema.json.
export type Decoration = NodeDecorationDef | LinkDecorationDef;

// These positions enumerations can be used to position elements relative to
// a node or link. The values here should match those in the JSON schema files.
// I could not find away to encode them in the JSON schema so they would get
// generated as below.
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


export type ContextMenuEntry = ContextMenuDivider | ContextMenuItem;

export interface ContextMenuDivider {
  divider: true;
}

/** Existing internal common canvas actions */
export type InternalAction =
  | "selectAll"
  | "deselectAll"
  | "zoomIn"
  | "zoomOut"
  | "zoomToFit"
  | "commentsToggle"
  | "commentsHide"
  | "commentsShow"
  | "setCommentEditingMode"
  | "setNodeLabelEditingMode"
  | "setZoom"
  | "togglePalette"
  | "openPalette"
  | "closePalette"
  | "toggleNotificationPanel"
  | "openNotificationPanel"
  | "closeNotificationPanel"
  | "loadPipelineFlow"
  | "createNode"
  | "createNodeOnLink"
  | "createNodeAttachLinks"
  | "createAutoNode"
  | "createComment"
  | "createWYSIWYGComment"
  | "createAutoComment"
  | "createAutoWYSIWYGComment"
  | "insertNodeIntoLink"
  | "attachNodeToLinks"
  | "moveObjects"
  | "resizeObjects"
  | "setObjectsStyle"
  | "setLinksStyle"
  | "updateLink"
  | "editComment"
  | "editDecorationLabel"
  | "linkNodes"
  | "linkNodesAndReplace"
  | "linkComment"
  | "createDetachedLink"
  | "colorSelectedObjects"
  | "deleteSelectedObjects"
  | "displaySubPipeline"
  | "displayPreviousPipeline"
  | "arrangeHorizontally"
  | "arrangeVertically"
  | "createSuperNode"
  | "createSuperNodeExternal"
  | "deconstructSuperNode"
  | "expandSuperNodeInPlace"
  | "collapseSuperNodeInPlace"
  | "convertSuperNodeExternalToLocal"
  | "convertSuperNodeLocalToExternal"
  | "deleteLink"
  | "disconnectNode"
  | "saveToPalette"
  | "cut"
  | "copy"
  | "paste"
  | "undo"
  | "redo"
  | "highlightBranch"
  | "highlightDownstream"
  | "highlightUpstream"
  | "unhighlight";

export interface ContextMenuItem {
  action: InternalAction | string | "colorBackground";
  label: string;
  icon?: string | ReactNode;
  enable?: boolean;
  submenu?: boolean;
  menu?: ContextMenuEntry[];
  toolbarItem?: boolean;
};


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

export interface AncestorPipeline {
  pipelineId: string;
  label?: string;
  supernodeId?: string;
  parentPipelineId?: string;
 }

export interface PipelineObjectStyle {
  style: StyleSpec;
  pipelineId: string;
  objId: string;
}


/** https://elyra-ai.github.io/canvas/03.04.05-notification-messages/ */
export type NotificationMsgType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | ""
  | undefined
  | null;

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
 * https://elyra-ai.github.io/canvas/03.04-canvas-controller/ *
 * The application can programmatically perform most of the actions
 * that the user can do in Common Canvas by calling the Canvas Controller API.
 *
 * Note: See this section for differences between the structure of objects
 * in the API and the schema:
 * https://elyra-ai.github.io/canvas/03.04.02-api-object-structure/
 *
 * In most cases within the API, the pipelineId parameter is optional.
 * If pipelineId is omitted, the method will default to the pipeline that
 * is currently displayed in the main canvas viewport.
 *
 * Warning 1: Do not alter the IDs of objects that currently exist on the
 * canvas. Changing object IDs can cause internal problems, in particular
 * with the command stack.
 *
 * Warning 2: When using external pipeline flows, Pipeline IDs must be
 * globally unique identifiers.
 */
export declare class CanvasController {
  /**
   * Loads the pipelineFlow document provided into common-canvas and displays it.
   * The document must conform to the pipelineFlow schema as documented in the
   * elyra-ai pipeline-schemas repo. Documents conforming to older versions may be
   * provided, but they will be upgraded to the most recent version.
   */
  setPipelineFlow(
    pipelineFlow: PipelineFlowDef | RelaxedPipelineFlow,
  ): void;

  /**
   * Clears the pipeline flow and displays an empty canvas.
   */
  clearPipelineFlow(): void;

  /**
   * @returns the current pipelineFlow document in the latest version of the
   * pipelineFlow schema as documented in the elyra-ai pipeline-schemas repo.
   */
  getPipelineFlow(): PipelineFlowDef;

  /**
   * Returns the current pipelineFlow document ID.
   * @returns the pipeline flow ID.
   */
  getPipelineFlowId(): string;

  /**
   * Returns the ID of the primary pipeline from the pipelineFlow.
   * @returns the ID of the primary pipeline.
   */
  getPrimaryPipelineId(): string;

  /**
   * Returns the external pipeline flow for the url passed in. The external
   * flow must have been loaded through some common canvas action for this
   * method to be able to return anything.
   * @param url
   * @returns the pipeline flow ID.
   */
  getExternalPipelineFlow(url: string): PipelineFlowDef;

  /**
   * Returns the internal format of all canvas data stored in memory by
   * common-canvas. Nodes, comments and links are returned in the internal
   * format.
   * @returns the canvas objects in the internal canvas-info format
   */
  getCanvasInfo(): CanvasInfo;

  /**
   * Returns an array of ancestor pipelines from the primary pipeline to
   * the pipeline indicated by the ID passed in.
   * @param pipelineId
   * @returns the IDs of the ancestor pipeline of the pipeline ID passed in.
   */
  getAncestorPipelineIds(pipelineId: string): AncestorPipeline[];

  /**
   * Removes all styles from nodes, comments and links. See the setObjectsStyle
   * and setLinkStyle methods for details on setting styles.
   * @param temporary - boolean that indicates whether temporary or permanent
   *                    styles should be removed.
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
   * Returns the canvas info pipeline object for the pipeline Id passed in.
   * @param pipelineId
   * @returns the pipeline object for the pipeline Id passed in.
   */
  getPipeline(pipelineId: string): CanvasPipeline;

  /**
   * Returns the ID of the pipeline object which is currently on display
   * in the canvas. Typically, this is the primary pipeline but will be
   * different if the user has navigated into one or more supernodes; in
   * which case it will be the ID of the pipeline at the level in the
   * supernode hierarchy that is currently on display.
   * @returns a pipeline ID for the currently displayed pipeline.
   */
  getCurrentPipelineId(): string;

  /**
   * Returns truthy if the pipeline is external (that is it is part of an
   * external pipeline flow). Otherwise, return falsy to indicate the pipeline
   * is local.
   * @param pipelineId
   * @returns a boolean to indicate whether the pipeline is external ot local
   */
  isPipelineExternal(pipelineId: string): boolean;

  /**
   * Returns the messages for all the nodes in the pipeline ID passed in.
   * @param pipelineId - Optional. The ID of the pipeline.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of messages.
   */
  getFlowMessages(pipelineId: string): MessageDef[];

  /**
   * Indicates whether the nodes have a message or not.
   * @param includeMsgType - can be either "error" or "warning"
   * @param pipelineId - Optional. The ID of the pipeline.
   *                     Defaults to the currently displayed pipeline.
   * @returns a boolean to indicate whether there are any messages of
   *          includeMsgsType for the nodes in the pipeline identified
   *          by the pipeline ID passed in.
   */
  isFlowValid(includeMsgType: "error" | "warning", pipelineId: string): boolean;

  /**
   * Rearranges the nodes in the canvas in the direction specified for the
   * pipeline ID passed in.
   * @param layoutDirection - can be "horizontal" or "vertical"
   * @param pipelineId - Optional. The ID of the pipeline.
   *                     Defaults to the currently displayed pipeline.
   */
  autoLayout(layoutDirection: "horizontal" | "vertical", pipelineId: string): void;

  /**
   * ## Palette methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#palette-methods
   */

  /**
   * Loads the palette data as described in the palette schema in
   * elyra-ai pipeline-schemas repo. Any version can be loaded and it will be
   * upgraded to the latest version.
   * @param A palette containing nodes in the pipeline flow format.
   */
  setPipelineFlowPalette(
    palette: RelaxedPipelineFlowPalette | PipelineFlowPalette
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
   * described in the pipeline flow . See objects in nodeTypes array in the
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
    nodeTypeObj: NodeTypeDef,
    categoryId: string,
    categoryLabel?: string,
    categoryDescription?: string,
    categoryImage?: string
  ): void;

  /**
   * Adds an array of new node into the palette:
   * @param nodeTypeObjs - an array of nodetypes that must conform to the style of
   * nodes used by the palette as described in the palette schema. See objects
   * in nodeTypes array in the palette schema:
   *  https://github.com/elyra-ai/pipeline-schemas/blob/main/common-canvas/palette/palette-v3-schema.json
   * @param categoryId - is the ID of the palette category where the node will be
   * added. If the category doesn't exist it will be created.
   * @param categoryLabel - is an optional param. If a new category is created it will
   * be displayed with this label.
   * @param categoryDescription - Is an optional param. If a new category is created
   * it will be displayed with this description.
   * @param categoryImage - Is an optional param. The image displayed for the category provided as a
   * reference to an image or the image itself.
   */
  addNodeTypesToPalette(
    nodeTypeObjs: NodeTypeDef[],
    categoryId: string,
    categoryLabel?: string,
    categoryDescription?: string,
    categoryImage?: string
  ): void;

  /**
   * Removes nodetypes from a palette category
   * @param selObjectIds - an array of object IDs to identify the nodetypes to be
   * @param categoryId - the ID of teh category from which the nodes will be removed
   */
  removeNodesFromPalette(selObjectIds: string[], categoryId: string): void;

  /**
   * @returns the palette data document which will conform to the latest version
   * of the palette schema.
   */
  getPaletteData(): PipelineFlowPalette;

  /**
   * @param operatorId - ID of the operator for this node
   * @returns the palette node identified by the operator ID passed in.
   */
  getPaletteNode(operatorId: string): NodeTypeDef;

  /**
   * @param nodeId - ID of the node
   * @returns the palette node identified by the node ID passed in.
   */
  getPaletteNodeById(nodeId: string): NodeTypeDef;

  /**
   * Returns the cateory that the node identified by the operatorId is in.
   * @param operatorId - ID of the operator for this node
   * @returns the category of the palette node identified by the operator passed in
   */
  getCategoryForNode(operatorId: string): CategoryDef;

  /**
   * Converts a node template from the format use in the palette (that conforms
   * to the pipeline flow schema) to the internal node format.
   * @param nodeTemplate - A node object conforming to the pipeline flow schema
   * @returns a node object conforming to the Canvas Info schema.
   */
  convertNodeTemplate(nodeTemplate: NodeTypeDef): CanvasNode;

  /** Opens the palette category identified by the category ID passed in.
  * @param categoryId - ID of the category
  */
  openPaletteCategory(categoryId: string): void;

  /** Closes the palette category idetified by the category ID passed in.
   * @param categoryId - ID of the category
   */
  closePaletteCategory(categoryId: string): void;

  /** Opens all the palette categories. */
  openAllPaletteCategories(): void;

  /** Closes all the palette categories. */
  closeAllPaletteCategories(): void;

  /** Returns true or false to indicate whether a palette category is open or not.
   * @param categoryId - ID of the category
   */
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
   * @param newSelections - An array of object IDs for nodes and/or comments
   * @param pipelineId - Optional. The ID of the pipeline where the objects exist.
   */
  setSelections(
    newSelections: string[],
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
   * De-selects all the objects in a pipeline.
   * @param pipelineId - Optional. The ID of the pipeline of the nodes.
   *                     Defaults to the currently displayed pipeline.
   */
  deselectAll(pipelineId: string): void;

  /**
   * @returns an array of the IDs of the currently selected objects.
   */
  getSelectedObjectIds(): string[];

  /**
   * Returns the selected nodes for the currently displayed pipeline.
   * @returns the currently selected nodes.
   */
  getSelectedNodes(): CanvasNode[];

  /**
   * Returns the selected comments for the currently displayed pipeline.
   * @returns the currently selected comments.
   */
  getSelectedComments(): CanvasComment[];

  /**
   * Returns the ID of the pipeline in which the currently selected objects
   * exist. Only one pipeline may contain selected objects.
   * @returns a pipeline ID
   */
  getSelectedPipelineId(): string;

  /**
   * Deletes all currently selected objects.
   */
  deleteSelectedObjects(): void;

  /**
   * Returnd true if the currently selected objects are all linked together.
   * This is used when deciding to creating a supernode.
   * @returns true if nodes are linked
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
   * Removes notification messages from the notification panel specified
   * by the array of message IDs passed in.
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
   * @param messageType - Optional. A type of notification message.
   * @returns An Array of notificaiton messages
   */
  getNotificationMessages(messageType?: NotificationMsgType): NotificationMsg[];

  /**
   *
   * Returns the maximum notification message type present in the current set
   * of notification messages. For this: ("error" > "warning" > "success" > "info")
   * @returns `"info" | "success" | "warning" | "error";`
   */
  getNotificationMessagesMaxType(): NotificationMsgType;

  /**
   * ## Node and Comment methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#node-and-comment-methods
   */

  /**
   * Moves the objects identified in the data object which must be in the
   * pipeline identified by the pipeline ID.
   * @param data - An object containing the node IDs to move and the X Y offsets
   * @param pipelineId - Optional. The ID of the pipeline of the nodes.
   *                     Defaults to the currently displayed pipeline.
   */
  moveObjects(
    data: {
      nodes: string[];
      offsetX: number;
      offsetY: number;
    },
    pipelineId?: string
  ): void;

  /**
   * Deletes the objects specified in objectIds array.
   * @param objectIds - An array of node and comment IDs
   * @param pipelineId - Optional. The ID of the pipeline of the nodes.
   *                     Defaults to the currently displayed pipeline.
   */
  deleteObjects(
    objectIds: string[],
    pipelineId?: string
  ): void;

  /**
   * Removes the links to and from the objects specified in the objectIds array.
   * @param objectIds - An array of node and comment IDs
   * @param pipelineId - Optional. The ID of the pipeline of the nodes.
   *                     Defaults to the currently displayed pipeline.
   */
  disconnectObjects(
    objectIds: string[],
    pipelineId?: string
  ): void;

  /**
   * Deletes the object specified by the ID in the pipeline specified by
   * pipeline ID.
   * @param id - The ID of the object to be deleted.
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  deleteObject(id: string, pipelineId: string): void;

  /**
   * Sets the style of the objects specified by pipelineObjectIds to be
   * the newStyle which will be either temporary or permanent.
   * @deprecated Use classes to style objects instead of style specs.
   *
   * @param pipelineObjectIds: This identified the objects to be styles. It is a
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
   * @deprecated Use classes to style objects instead of style specs.
   *
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
   *                    getPipelineFlow() method is called or not.
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
   * @param pipelineId - Optional. The ID of the pipeline.
   *                     Defaults to the currently displayed pipeline.
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
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  createNode(
    data: {
      nodeTemplate: NodeTypeDef;
      offsetX: number;
      offsetY: number;
    },
    pipelineId?: string
  ): CanvasNode;

  /**
   * Adds a new node into the pipeline specified by the pipelineId.
   * @param A node that complied withe canvas info format
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  addNode(node: CanvasNode, pipelineId?: string): void;

  /**
   * Creates a node using the data parameter provided in the pipeline specified
   * by pipelineId and adds the command to the command stack (so the user can
   * undo/redo the command). This will also cause the beforeEditActionHandler
   * and editActionHandler callbacks to be called.
   * If pipelineId is omitted the node will be created in the current
   * "top-level" pipeline.
   * @deprectaed Use the editActionHandler call directly instead
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
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  createNodeCommand(
    data: {
      nodeTemplate: NodeTypeDef;
      offsetX: number;
      offsetY: number;
    },
    pipelineId?: string
  ): void;

  /**
   * Deletes the node specified.
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  deleteNode(nodeId: string, pipelineId?: string): void;

  /**
   * Sets the node properties
   * @param nodeId - The ID of the node
   * @param properties - A partial node object containing a sub-set of
   *                     one or more properties, but not the 'id', to
   *                     replace those in the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeProperties(
    nodeId: string,
    properties:
      | Omit<Partial<CanvasExecutionNode>, "id">
      | Omit<Partial<CanvasBindingEntryNode>, "id">
      | Omit<Partial<CanvasBindingExitNode>, "id">
      | Omit<Partial<CanvasSupernode>, "id">
      | Omit<Partial<CanvasModelNode>, "id">,
    pipelineId?: string
  ): void;
  /**
   * Sets the node parameters
   * @param nodeId - The ID of the node
   * @param parameters - An array of parameters
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeParameters(
    nodeId: string,
    parameters: Record<string, unknown>[],
    pipelineId?: string
  ): void;

  /**
   * Sets the node UI parameters
   * @param nodeId - The ID of the node
   * @param uiParameters - An array of UI parameters
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeUiParameters(
    nodeId: string,
    uiParameters: Record<string, unknown>[],
    pipelineId?: string
  ): void;

  /**
   * Sets the node messages
   * @param nodeId - The ID of the node
   * @param messages - An array of messages
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeMessages(
    nodeId: string,
    messages: MessageDef[],
    pipelineId?: string
  ): void;

  /**
   * Sets a single message on a node
   * @param nodeId - The ID of the node
   * @param message - A message
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeMessage(
    nodeId: string,
    message: MessageDef,
    pipelineId?: string
  ): void;

  /**
   * Sets the label for a node
   * @param nodeId - The ID of the node
   * @param newLabel - The new label
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeLabel(
    nodeId: string,
    newLabel: string,
    pipelineId?: string
  ): void;

  /**
   * Sets the class name to newClassName of the nodes identified by nodeIds
   * array in the pipeline specified by pipeline ID. The class name will be
   * applied to the nodes' group (<g>) element in the DOM.
   * @param nodeIds - An array of node IDs
   * @param newClassName - New class string. Can be a space separated list of classes.
   * @param pipelineId - Optional. The ID of the pipeline of the nodes.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodesClassName(
    nodeIds: string[],
    newClassName: string,
    pipelineId?: string
  ): void;

  /**
   * Sets the decorations on a node. The decorations array passed in
   * will replace any decorations currently applied to the node.
   * @param nodeId - The ID of the node
   * @param newDecorations - An array of decorations.
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeDecorations(
    nodeId: string,
    newDecorations: Decoration[],
    pipelineId?: string
  ): void;

  /**
   * Sets the input ports on a node. The inputs array of ports provided will
   * replace any input ports for a node.
   * @param nodeId - The ID of the node
   * @param inputs - An array of input port objects.
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeInputPorts(
    nodeId: string,
    inputs: CanvasPorts | CanvasBoundPorts,
    pipelineId?: string
  ): void;

  /**
   * Sets the output ports on a node. The outputs array of ports provided will
   * replace any output ports for a node.
   * @param nodeId - The ID of the node
   * @param outputs - An array of output port objects.
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeOutputPorts(
    nodeId: string,
    outputs: CanvasPorts | CanvasBoundPorts,
    pipelineId?: string
  ): void;

  /**
   * Sets the decorations of multiple nodes at once. The decorations array
   * passed in will replace any decorations currently applied to the nodes.
   * @param pipelineNodeDecorations - Specifies the nodes and their decorations.
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
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setInputPortLabel(
    nodeId: string,
    portId: string,
    newLabel: string,
    pipelineId?: string
  ): void;

  /**
   * Sets the output port label on a node
   * @param nodeId - The ID of the node
   * @param portId - The ID of the output port
   * @param newLabel - The label
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setOutputPortLabel(
    nodeId: string,
    portId: string,
    newLabel: string,
    pipelineId?: string
  ): void;

  /**
   * Gets a node that conforms to the CanvasNode format.
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   * @returns A node conforming to the canvas info format. null if not found.
   */
  getNode(
    nodeId: string,
    pipelineId?: string
  ): CanvasNode | null;

  /**
   * Gets the UI parameters for a node
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  getNodeUiParameters(
    nodeId: string,
    pipelineId?: string
  ): Record<string, unknown>[];

  /**
   * Gets the supernodes for a pipeline.
   * @param pipelineId - Optional. The ID of the pipeline.
   *                     Defaults to the currently displayed pipeline.
   */
  getSupernodes(
    pipelineId: string
  ): CanvasSupernode[];

  /**
   * Returns the supernode that references the given pipelineId.
   * @param pipelineId - The ID of a pipeline
   * @returns supernode that has a subflow_ref to the given pipelineId.
   */
  getSupernodeObjReferencing(
    pipelineId: string
  ): CanvasSupernode;

  /**
   * Gets the messages for a node
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of messages from the node or null if node not found.
   */
  getNodeMessages(
    nodeId: string,
    pipelineId?: string
  ): MessageDef[] | null;

  /**
   * Gets the array of input ports for the node or null if the node ID is
   * not recognized.
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of canvas ports or canvas bound ports.
   */
  getNodeInputPorts(
    nodeId: string,
    pipelineId?: string
  ): CanvasPorts | CanvasBoundPorts | null;

  /**
   * Gets the array of output ports for the node or null if the node ID is
   * not recognized.
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of canvas ports or canvas bound ports.
   */
  getNodeOutputPorts(
    nodeId: string,
    pipelineId?: string
  ): CanvasPorts | CanvasBoundPorts | null;

  /**
   * Gets a message for a specific control for a node
   * @param nodeId - The ID of the node
   * @param controlName - The control name
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   * @returns A message.
   */
  getNodeMessage(
    nodeId: string,
    controlName: string,
    pipelineId?: string
  ): MessageDef | null;

  /**
   * Gets an array of decorations for a node
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of decorations.
   */
  getNodeDecorations(
    nodeId: string,
    pipelineId?: string
  ): Decoration[] | null;

  /**
   * Gets the class name associated with the node specified by nodeId in the
   * pipeline specified by pipelineId.
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   * @returns A class name string. Can be a space separated list of classes.
   */
  getNodeClassName(
    nodeId: string,
    pipelineId?: string
  ): string;

  /**
   * Gets the style specification (see Wiki) for a node
   * @param nodeId - The ID of the node
   * @param temporary - A boolean to indicate if the style is serialized when
   *                    getPipelineFlow() method is called or not.
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   * @returns A style specification.
   */
  getNodeStyle(
    nodeId: string,
    temporary: boolean,
    pipelineId?: string
  ): StyleSpec;

  /**
   * Returns an array of nodes that are for the branch(es) that the nodes,
   * identified by the node IDs passed in, are within.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - Optional. The ID of the pipeline of the nodes.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of CanvasNode objects
   */
  getBranchNodes(
    nodeIds: string[],
    pipelineId?: string
  ): CanvasNode[];

  /**
   * Returns an array of nodes that are upstream from the nodes
   * identified by the node IDs passed in.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - Optional. The ID of the pipeline of the nodes.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of CanvasNode objects
  */
  getUpstreamNodes(
    nodeIds: string[],
    pipelineId?: string
  ): CanvasNode[];

  /**
   * Returns an array of nodes that are downstream from the nodes
   * identified by the node IDs passed in.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - Optional. The ID of the pipeline of the nodes.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of CanvasNode objects
  */
  getDownstreamNodes(
    nodeIds: string[],
    pipelineId?: string
  ): CanvasNode[];

  /**
   * Returns a boolean to indicate whether the supernode is expanded in place.
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   * @returns A boolean to indicate whether the supernode is expanded in place.
  */
  isSuperNodeExpandedInPlace(
    nodeId: string,
    pipelineId?: string
  ): boolean;

  /**
   * Sets the label, for the node identified, to edit mode, provided the node
   * label is editable. This allows the user to edite the label text.
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeLabelEditingMode(
    nodeId: string,
    pipelineId?: string
  ): void;

  /**
   * Sets the decoration label, for the decoration in the node identified, to edit
   * mode, provided the node label is editable. This allows the user to edit the
   * label text.
   * @param decId - The ID of the decoration.
   * @param nodeId - The ID of the node.
   * @param pipelineId - Optional. The ID of the pipeline of the node.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeDecorationLabelEditingMode(
    decId: string,
    nodeId: string,
    pipelineId?: string
  ): void;

  /**
   * ## Comment methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#comment-methods
   */

  /**
   * Returns the comments from the pipeline.
   * @param pipelineId - Optional. The ID of the pipeline of the comments.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of comments conforming to the canvas info format.
   */
  getComments(
    pipelineId?: string
  ): CanvasComment[];

  /**
   * Returns a comment from the pipeline.
   * @param comId - The ID of the comment
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   * @returns A comment conforming to the canvas info format. null if not found.
   */
  getComment(
    comId: string,
    pipelineId?: string
  ): CanvasComment | null;

  /**
   * Returns a position object which indicates the position of where a new
   * comment should be placed in a situation where the mouse position cannot be
   * used (e.g. the toolbar button was clicked).
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   * @returns A comment position with canvas coordinates.

   */
  getNewCommentPosition(
    pipelineId?: string
  ): { x: number; y: number };

  /**
   * Creates a comment for the pipeline.
   * @param source - Source data for comment creation.
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   * @returns A comment conforming to the canvas info format.
   */
  /* An interface for creating a comment. mousePos is the canvas coordinate
    * position of the comment, selectedObjectIds is an array of objectsIDs. For
    * each node identified by an ID in the array a link will be added from the
    * comment to that node.
    */
  createComment(
    source: {
      mousePos: {
        x: number;
        y: number;
      };
      contentType?: null | "markdown" | "WYSIWYG";
      formats?: {
        field: string;
        value?: string;
      }[];
      selectedObjectIds?: string[];
    },
    pipelineId?: string
  ): CanvasComment;

  /**
   * Adds a comment to the pipeline.
   * @param data - a comment conforming to the canvas info format
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   */
  addComment(
    data: CanvasComment,
    pipelineId?: string
  ): void;

  /**
   * Edits a comment with the data.
   * @param commentProperties - properties to overwrite the comment
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   */
  editComment(
    properties: Omit<Partial<CanvasComment>, "id">,
    pipelineId?: string
  ): void;

  /**
   * Sets the properties in the comment identified by the commentId. The
   * commentProperties is an object containing one or more properties that will
   * replace the corresponding properties in the comment. For example: if
   * commentProperties is { x_pos: 50, y_pos: 70 } the comment
   * will be set to that position.
   * @param commentId - the ID of teh comment to update
   * @param properties - properties to overwrite the comment
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   */
  setCommentProperties(
    commentId: string,
    properties: Omit<Partial<CanvasComment>, "id">,
    pipelineId?: string
  ): void;

  /**
   * Sets the class name to newClassName of the comments identified by commentIds
   * array in the pipeline specified by pipeline ID. The class name will be
   * applied to the comments' group (<g>) element in the DOM.
   * @param commentIds - An array of comment IDs.
   * @param newClassName - New class name. Can be a space separated list of classes.
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   */
  setCommentsClassName(
    commentIds: string[],
    newClassName: string,
    pipelineId?: string
  ): void;

  /**
   * Deletes a comment
   * @param commentId - The ID of the comment
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   */
  deleteComment(
    commentId: string,
    pipelineId?: string
  ): void;

  /**
   * Gets the class name associated with the comment specified by commentId in the
   * pipeline specified by pipelineId.
   * @param commentId - The ID of the comment
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   * @returns A class name string. Can be a space separated list of classes.
   */
  getCommentClassName(
    commentId: string,
    pipelineId?: string
  ): void;

  /**
   * Gets the style spcification for a comment
   * @param commentId - The ID of the comment
   * @param temporary - A boolean to indicate if the style is serialized when
   *                    getPipelineFlow() method is called or not.
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   * @returns A style specification.
   */
  getCommentStyle(
    commentId: string,
    temporary: boolean,
    pipelineId?: string
  ): StyleSpec;

  /** Hides all comments on the canvas. */
  hideComments(): void;

  /**
   * Shows all comments on the canvas - if they were previously hiding.
   */
  showComments(): void;

  /**
   * Returns true if comments are currently hiding.
   * @returns Boolean. true indicates comments are hiding.
   */
  isHidingComments(): boolean;

  /**
   * Sets the comment identified, to edit mode so the user can
   * edit the comment.
   * @param commentId - The ID of the comment
   * @param pipelineId - Optional. The ID of the pipeline of the comment.
   *                     Defaults to the currently displayed pipeline.
   */
  setCommentEditingMode(
    commentId: string,
    pipelineId?: string
  ): void;

  /**
   * Link methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#link-methods
   */

  /**
   * Gets a link
   * @param linkId - The ID of the link
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   * @returns A link object that conforms to the canvas info format.
   */
  getLink(
    linkId: string,
    pipelineId?: string
  ): CanvasLink;

  /**
   * Gets an array of links
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array a link objects that conform to the canvas info format.
   */
  getLinks(
    pipelineId?: string
  ): CanvasLink[];

  /**
   * Sets the properties in the link identified by the linkId. The
   * linkProperties is an object containing one or more properties that will
   * replace the corresponding properties in the link.
   * @param linkId - The ID of the link
   * @param properties - The properties to set in the link.
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  setLinkProperties(
    linkId: string,
    properties: Omit<Partial<CanvasLink>, "id">,
    pipelineId?: string
  ): void;

  /**
   * Sets the source properties in the data link identified by the linkId. The
   * srcNodeId and srcNodePortId will be set to the values provided. If
   * srcNodePortId is set to null the current srcNodePortId will be removed
   * from the link. Also, if the link has a srcPos property (because its
   * source end is detached) that will be removed.
   * @param linkId - The ID of the link
   * @param srcNodeId - The new source node ID.
   * @param srcNodePortId - The new port ID for the source node.
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeDataLinkSrcInfo(
    linkId: string,
    srcNodeId: string,
    srcNodePortId: string,
    pipelineId?: string
  ): void;

  /**
   * Sets the target properties in the data link identified by the linkId. The
   * trgNodeId and trgNodePortId will be set to the values provided. If
   * trgNodePortId is set to null the current trgNodePortId will be removed
   * from the link. Also, if the link has a trgPos property (because its
   * target end is detached) that will be removed.
   * @param linkId - The ID of the link
   * @param trgNodeId - The new target node ID.
   * @param trgNodePortId - The new port ID for the target node.
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  setNodeDataLinkTrgInfo(
    linkId: string,
    trgNodeId: string,
    trgNodePortId: string,
    pipelineId?: string
  ): void;

  /**
   * Returns a node to node data link
   * @param srcNodeId - The ID of the source node
   * @param srcNodePortId - The ID of the source node port
   * @param trgNodeId - The ID of the target node
   * @param trgNodePortId - The ID of the target node port
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   * @returns A link object in the canvas info format. null if not found.
   */
  getNodeDataLinkFromInfo(
    srcNodeId: string,
    srcNodePortId: string,
    trgNodeId: string,
    trgNodePortId: string,
    pipelineId?: string
  ): CanvasLink | null;

  /**
   * Returns a comment to node link
   * @param commentId - The ID of the comment
   * @param nodeId - The ID of the node
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   * @returns A link object in the canvas info format.
   */
  getCommentLinkFromInfo(
    commentId: string,
    nodeId: string,
    pipelineId?: string
  ): CanvasLink;

  /**
   * Gets a node to node association link
   * @param nodeId1 - The ID of one of the associated nodes
   * @param nodeId2 - The ID of the other associated nodes
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   * @returns A link object in the canvas info format.
   */
  getNodeAssocLinkFromInfo(
    nodeId1: string,
    nodeId2: string,
    pipelineId?: string
  ): CanvasLink;

  /**
   * Adds links to a pipeline
   * @param linkList - An array of links
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  addLinks(
    linkList: CanvasLink[],
    pipelineId?: string
  ): void;

  /**
   * Deletes a link
   * @param source - The link to delete
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  deleteLink(
    link: CanvasLink,
    pipelineId?: string
  ): void;

  /**
   * Creates node to node links of type "nodeLink". One link will be created
   * between each node in the nodes array and each node in the targetNodes
   * array. Link IDs will be automatically generated for the created links.
   * Note: if an ID needs to be provided for the link this method can only
   * be called for one link at a time.
   * @param data - Object describing the links to create.
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  createNodeLinks(
    data: {
      id?: string;
      type: "nodeLink"
      nodes: {
        id?: string;
        portId?: string;
        srcPos?: {
          x_pos: number;
          y_pos: number;
        };
      }[];
      targetNodes: {
        id?: string;
        portId?: string;
        trgPos?: {
          x_pos: number;
          y_pos: number;
        };
      }[],
      class_name?: string;
      linkName?: string;
    },
    pipelineId?: string
  ): CanvasNodeLink[];

  createNodeLinks(
    data: {
      id?: string;
      type: "associationLink"
      nodes: {
        id?: string;
        portId?: string;
        srcPos?: {
          x_pos: number;
          y_pos: number;
        };
      }[];
      targetNodes: {
        id?: string;
        portId?: string;
        trgPos?: {
          x_pos: number;
          y_pos: number;
        };
      }[],
      class_name?: string;
      linkName?: string;
    },
    pipelineId?: string
  ): CanvasAssociationLink[];


  /**
   * Creates comment links of type "commentLink". One link will be created
   * between each comment in the nodes array and each node in the targetNodes
   * array. Link IDs will be automatically generated for the created links.
   * Note: if an ID needs to be provided for the link this method can only
   * be called for one link at a time.
   * @param data - Data describing the links
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  createCommentLinks(
    data: {
      id?: string;
      nodes: {
        id?: string;
      }[];
      targetNodes: {
        id?: string;
      }[],
      class_name?: string;
    },
    pipelineId?: string
  ): CanvasCommentLink[];

  /**
   * Sets the class name to newClassName of the links identified by linkIds
   * array in the pipeline specified by pipeline ID. The class name will be
   * applied to the links' group (<g>) element in the DOM.
   * @param linkIds - An arry of link IDs
   * @param newClassName - New class string. Can be a space separated list of classes.
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  setLinksClassName(
    linkIds: string[],
    newClassName: string,
    pipelineId?: string
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
   * @param newStyle - This is a style specification.
   * @param temporary - A boolean to indicate if the style is serialized when
   *                    getPipelineFlow() method is called or not.
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
   * @param linkIds - A link ID.
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   * @returns A class name string. Can be a space separated list of classes.
   */
  getLinkClassName(
    linkId: string,
    pipelineId?: string
  ): void;

  /**
   * Returns the style specification for a link.
   * @param linkId - A link ID.
   * @param temporary - A boolean to indicate if the style is serialized when
   *                    getPipelineFlow() method is called or not.
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   * @returns The style specification for the link.
   */
  getLinkStyle(
    linkId: string,
    temporary: boolean,
    pipelineId?: string
  ): StyleSpec;

  /**
   * Sets the decorations on a link. The decorations array passed in
   * will replace any decorations currently applied to the link.
   * @param linkId - The ID of the link
   * @param newDecorations - An array of decorations.
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  setLinkDecorations(
    linkId: string,
    newDecorations: Decoration[],
    pipelineId?: string
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
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   * @returns An array of decorations
   */
  getLinkDecorations(
    linkId: string,
    pipelineId?: string
  ): Decoration[];

  /**
   * Sets the decoration label, for the decoration in the link identified, to edit
   * mode provided the link label is editable. This allows the user to edit the
   * label text.
   * @param decId - The ID of the label decoration on the link.
   * @param linkId - The ID of the link
   * @param pipelineId - Optional. The ID of the pipeline of the link.
   *                     Defaults to the currently displayed pipeline.
   */
  setLinkDecorationLabelEditingMode(
    decId: string,
    linkId: string,
    pipelineId?: string
  ): void;

  /**
   * Breadcrumbs methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#breadcrumbs-methods
   */

  /**
   * Returns the current array of breadcrumbs. There will one breadcrumb object
   * for each level of supernode that the user has navigated into. This array
   * can be used to display breadcrumbs to the user to show where they are
   * within the navigation hierarchy within Common Canvas.
   * @returns An array of breadcrumb objects
   */
  getBreadcrumbs(): { pipelineId?: string; pipelineFlowId?: string }[];

  /**
   * Returns the breadcrumb for teh currently displayed pipeline.
   * @returns The last breadcrumb which represents the level with supernode
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
   * @param pipelineId - The ID of the pipeline of the nodes.
   */
  highlightBranch(
    nodeIds: string[],
    pipelineId: string
  ): string[];

  /**
   * Highlights the upstream nodes from the node IDs passed in
   * and returns the highlighted object Ids.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - The ID of the pipeline of the nodes.
   */
  highlightUpstream(
    nodeIds: string[],
    pipelineId: string
  ): string[];

  /**
   * Highlights the downstream nodes from the node IDs passed in
   * and returns highlighted object Ids.
   * @param nodeIds - An array of node Ids
   * @param pipelineId - The ID of the pipeline
   */
  highlightDownstream(
    nodeIds: string[],
    pipelineId: string
  ): string[];

  /**
   * ## Logging methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#logging-methods
   */

  /**
   * @returns a Boolean to indicate whether canvas logging is switched on or off.
   */
  getLoggingState(): boolean;

  /**
   * Sets canvas logging based on the Boolean passed in.
   * @param state - true to switch on Common Canvas logging to the console.
   */
  setLoggingState(state: boolean): void;

  /**
   * Palette methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#palette-methods_1
   */

  /**
   * Opens the palette
   */
  openPalette(): void;

  /**
   * Closes the palette
   */
  closePalette(): void;

  /**
   * @returns a Boolean to indicate whether the palette is open or not. If the
   * narrow palette feature is being used (enableNarrowPalette in config), true
   * indicates that the wide palette is being displayed.
   */
  isPaletteOpen(): boolean;

  /**
   * ## Context menu methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#context-menu-methods
   */

  /**
   * Opens the context menu or the context toolbar if config property
   * enableContextToolbar is set to true.
   * @param menuDef - the definition of the context menu or context toolbar
   * @param source - additional information about the menu
   */
  openContextMenu(
    menuDef: ContextMenuEntry[],
    source?: {
      cmPos?: {
        x: number;
        y: number;
      }
    }
  ): void;

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
   * @returns a boolean to indicate if the right flyout is open or not
   */
  isRightFlyoutOpen(): boolean;

  /**
   * Top panel methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#top-panel-methods
   */

  /**
   * @returns a boolean to indicate if the top panel is open or not
   */
  isTopPanelOpen(): boolean;

  /**
   * ## Bottom panel methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#bottom-panel-methods
   */

  /**
   * @returns a boolean to indicate if the bottom panel is open or not
   */
  isBottomPanelOpen(): boolean;

  /**
   * Sets the height of the bottom panel in pixels. This can be called
   * immediately after the CanvasController has been created, if the bottom
   * panel should be displayed at a specific height when it first opens.
   * @param height - height in pixels
   */
  setBottomPanelHeight(
    height: number
  ): void;

  /**
   * ## Canvas/pipeline navigation methods
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#canvaspipeline-navigation-methods
   */

  /**
   * Displays a pipeline (identified by the pipelineId passed in). This must be
   * one of the pipelines referenced by the current set of breadcrumbs. It
   * cannot be used to open a new pipeline outside the current set of breadcruumbs.
   * @param pipelineId - The ID of the pipeline to display
   */
  displaySubPipeline(
    pipelineId: string
  ): void;

  /**
   * Displays a pipeline for the supernode (identified by the supernodeId
   * parameter) in the pipeline (identified by the pipelineId parameter). For
   * correct breadcrumb generation this pipeline should be the one in the last
   * of the current set of breadcrumbs. That is, the pipeline currently shown
   * "full page" in the canvas.
   * @param supernodeId - The ID of the supernode to display
   * @param pipelineId - The ID of the pipeline to display
   */
  displaySubPipelineForSupernode(
    supernodeId: string,
    pipelineId: string
  ): void;

  /**
   * Displays full-page the previous pipeline from the one currently being displayed.
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
  do(
    command: {
      do(): void;
      undo(): void;
      redo(): void;
      getLabel(): string;
      getFocusObject(): "CanvasFocus" | object;
    }
  ): void;

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
   * @param count - The number of commands to redo
   */
  redoMulti(count: number): void;

  /**
   * Returns true if there is a command on the command stack
   * available to be undone.
   * @returns A boolean that indicates if there is a command to undo.
   */
  canUndo(): boolean;

  /**
   * Returns true if there is a command on the command stack
   * available to be redone.
   * @returns A boolean that ndicates if there is a command to redo.
   */
  canRedo(): boolean;

  /**
   * Returns a string which is the label that descibes the next undoable
   * command.
   * @returns A label that descibes the next undoable command.
   */
  getUndoLabel(): string;

  /**
   * Returns a string which is the label that descibes the next redoable
   * command.
   * @returns A label that descibes the next redoable command.
   */
  getRedoLabel(): string;

  /**
   * Returns an array of all undoable commands currently on the command stack.
   * @returns A array of commands.
   */
  getAllUndoCommands(): object[];

  /**
   * Returns an array of all redoable commands currently on the command stack.
   * @returns A array of commands.
   */
  getAllRedoCommands(): object[];

  /**
   * Clears the command stack of all currently stored commands.
   */
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
   * @param zoomObject - A zoom object
   */
  zoomTo(
    zoomObject: ZoomObjectDef
  ): void;

  /**
   * Increments the translation of the canvas by the x and y increment
   * amounts. The optional animateTime parameter can be provided to animate the
   * movement of the canvas. It is a time for the animation in milliseconds.
   * If omitted the movement happens immediately.
   * @param x - X coordinate amount.
   * @param y - Y coordinate amount.
   * @param animateTime - Amount if miniseconds for the trasition.
   */
  translateBy(
    x: number,
    y: number,
    animateTime: number
  ): void;

  /**
   * @returns the current zoom object for the currently displayed canvas or null
   * if the canvas is not yet rendered for the first time.
   */
  getZoom(): ZoomObjectDef | null;

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
   *
   * @param objectIds - An array of nodes and/or comment IDs.
   * @param xPos - Optional. Can be set to percentage offset of the viewport width.
   * @param yPos - Optional. Can be set to percentage offset of the viewport height.
   * @returns a ZoomObject or null
   */
  getZoomToReveal(
    objectIds: string[],
    xPos?: number,
    yPos?: number
  ): ZoomObjectDef | null;

  /**
   * Clears any saved zoom values stored in local storage. This means
   * newly opened flows will appear with the default zoom. This method
   * is only applicable when the `enableSaveZoom` config parameter is
   * set to "LocalStorage".
   */
  clearSavedZoomValues(): void;
}

/*
 * Port object used to define display properties of an input or output port
 * For example, either:
 *    { type: "circle" } // Can also be "circleWithArrow"
 * or
 *    { type: "image", src: "path/picture.svg", width: 10, height: 10 }
 * or
 *    { type: "jsx", src: (<FaceCool />), width: 16, height: 16 }
 */
export type PortDisplay =
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
   * SVG path strings to define the body shape of your node and its
   * selection highlighting. If set to null the paths will be set by
   * default based on the nodeShape setting. If a function is provided,
   * it is called with the node as a parameter and must return the SVG
   * path string for that node. This can be used for drawing a new path
   * string when the node is resized.
   */
  bodyPath: null | string | ((node: CanvasNode) => string);
  selectionPath: null | string | ((node: CanvasNode) => string);

  /**
   * Display image
   */
  imageDisplay: boolean;
  imageWidth: number;
  imageHeight: number;

  /**
   * Image position
   */
  imagePosition: "topLeft";
  imagePosX: number;
  imagePosY: number;

  /** Display label */
  labelDisplay: boolean;

  /**
   * Label dimensions
   */
  labelWidth: number;
  labelHeight: number;

  /**
   * Label position
   */
  labelPosition: "topLeft";
  labelPosX: number;
  labelPosY: number;

  /**
   * Label appearance propeties
   */
  labelEditable: false;
  labelAlign: "left" | "center";
  labelSingleLine: boolean;  /* false allow multi-line labels */
  labelOutline: boolean;
  labelMaxCharacters: boolean;  /* null allows unlimited characters */
  labelAllowReturnKey: boolean;  /* true allows line feed to be inserted into label */

  /**
   * An array of decorations to be applied to the node. For details see:
   * https://elyra-ai.github.io/canvas/03.04.01-decorations/
   * These are added to the node at run time and will not be saved into
   * the pipeline flow.
   */
  decorations: NodeDecorationDef[];

  /**
   * Positions and dimensions for 9 enumerated default decorator positions.
   * decoratorWidth and decoratorHeight are the dimensions of the outline
   * rectangle and decoratorPadding is the padding for the image within the
   * outline rectangle.
   * @deprecated Specify position info in the decoration itself.
   */
  decoratorTopY: number;
  decoratorMiddleY: number;
  decoratorBottomY: number;
  decoratorLeftX: number;
  decoratorCenterX: number;
  decoratorRightX: number;

  /**
   * Default width, height and padding for image decorators
   */
  decoratorWidth: number;
  decoratorHeight: number;
  decoratorPadding: number;

  /**
   * Default width and height for label decorators
   */
  decoratorLabelWidth: 80;
  decoratorLabelHeight: 15;

  /**
   * Display drop shadow under and round the nodes
   */
  dropShadow: boolean;

  /**
   * The gap between a node and its selection highlight rectangle
   */
  nodeHighlightGap: number;

  /**
   * The size of the node sizing area that extends around the node, over
   * which the mouse pointer will change to the sizing arrows.
   */
  nodeSizingArea: number;

  /**
   * Error indicator dimensions
   */
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

  /*
   * An array of elements to control display of input ports.
   * The order of the elements corresponds to the order of ports in the
   * inputs array for the node. If there are more input ports than elements
   * in the array, the last element will be used for all remaining ports.
   */
  inputPortDisplayObjects: PortDisplay[];

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
   * The order of the elements corresponds to the order of ports in the
   * inputs array for the node. If there are more input ports than elements
   * in the array, the last element will be used for all remaining ports.
   */
  inputPortGuideObjects: PortDisplay[];

  /**
   * Display output ports.
   */
  outputPortDisplay: boolean;

  /**
   * An array of elements to control display of output ports.
   * The order of the elements corresponds to the order of ports in the
   * outputs array for the node. If there are more output ports than elements
   * in the array, the last element will be used for all remaining ports.
   */
  outputPortDisplayObjects: PortDisplay[];

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
   * The order of the elements corresponds to the order of ports in the
   * outputs array for the node. If there are more output ports than elements
   * in the array, the last element will be used for all remaining ports.
   */
  outputPortGuideObjects: PortDisplay[];

  /**
   * Automatically increases the node size to accommodate its ports so both
   * input and output ports can be shown within the dimensions of
   * the node.
   */
  autoSizeNode: boolean;

  /**
   * Radius of either the input or output ports when they are set to "circle"
   */
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

  /**
   * Spacing between the port arcs around the ports.
   */
  portArcSpacing: number;

  /**
   * Position of the context toolbar relative to the node. Some adjustment
   * will be made to account for the width of the toolbar.
   */
  contextToolbarPosition: NodePosition;

  /**
   * Display of vertical ellipsis to show context menu
   */
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
  enableLinkDirection?: "LeftRight" | "RightLeft" |"TopBottom" | "BottomTop";
  enableLinkSelection?: "None" | "LinkOnly" | "Handles" | "Detachable";
  enableLinkReplaceOnNewConnection?: boolean;
  enableInternalObjectModel?: boolean;
  enablePaletteLayout?: "Dialog" | "Flyout" | "None";
  enableToolbarLayout?: "Top" | "None";
  enableResizableNodes?: boolean;
  enableInsertNodeDroppedOnLink?: boolean;
  enableRightFlyoutUnderToolbar?: boolean;
  enablePositionNodeOnRightFlyoutOpen?: boolean;
  enableHighlightUnavailableNodes?: boolean;
  enableHighlightNodeOnNewLinkDrag?: boolean;
  enableAutoLinkOnlyFromSelNodes?: boolean;
  enableSingleClickAddFromPalette?: boolean;
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
    palette?: boolean | { categories: boolean, nodeTemplates: boolean};
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

/**
 * https://elyra-ai.github.io/canvas/03.02.02-toolbar-config/#toolbar-action-object-definition
 */
export interface ToolbarActionItem {
  action?:  string | InternalAction;
  label?: string | ReactNode;
  enable?: boolean;
  iconEnabled?: string | ReactNode;
  iconDisabled?: string | ReactNode;
  incLabelWithIcon?: "no" | "before" | "after";
  kind?: "default" | "primary" | "danger" | "secondary" | "tertiary" | "ghost";
  tooltip?: string | ReactNode;
  isSelected?: boolean;
  className?: string;
  textContent?: string;
}

/**
 * https://elyra-ai.github.io/canvas/03.02.02-toolbar-config/#sub-area-properties
 */
export interface ToolbarSubMenuItem extends ToolbarActionItem {
  subMenu: ToolbarActionItem[];
  closeSubAreaOnClick?: boolean;
}

/**
 * https://elyra-ai.github.io/canvas/03.02.02-toolbar-config/#sub-area-properties
 */
export interface ToolbarSubPanelItem extends ToolbarActionItem {
  subPanel: React.FC | React.ComponentClass;
  subPanelData?: unknown;
  purpose?: "single" | "dual";
  closeSubAreaOnClick?: boolean;
}

/**
 * https://elyra-ai.github.io/canvas/03.02.02-toolbar-config/#toolbar-divider-object-definition
 */
export interface ToolbarDivider {
  divider: true;
}

export interface ToolbarJsxItem {
  action: string;
  jsx: (tabIndex: number) => ReactNode;
  tooltip?: string | ReactNode;
}

/**
 * https://elyra-ai.github.io/canvas/03.02.02-toolbar-config/
 */
export interface ToolbarConfig {
  leftBar?: (
    | ToolbarActionItem
    | ToolbarSubPanelItem
    | ToolbarSubMenuItem
    | ToolbarDivider
    | ToolbarJsxItem
  )[];
  rightBar?: (
    | ToolbarActionItem
    | ToolbarSubPanelItem
    | ToolbarSubMenuItem
    | ToolbarDivider
    | ToolbarJsxItem
  )[];
  overrideAutoEnableDisable?: boolean;
}

/**
 * @deprecated
 */
export type DeprecatedToolbarConfig = (
  | ToolbarActionItem
  | ToolbarSubPanelItem
  | ToolbarSubMenuItem
  | ToolbarDivider
  | ToolbarJsxItem
)[];

/**
 * https://elyra-ai.github.io/canvas/03.02.03-notification-config/
 */
export interface NotificationConfig {
  action: string;
  label: string;
  enable?: boolean;
  notificationHeader?: string;
  notificationSubtitle?: string;
  emptyMessage: string;
  clearAllMessage?: string;
  keepOpen?: boolean;
  clearAllCallback?: () => void;
  secondaryButtonLabel?: string;
  secondaryButtonCallback?: () => void;
  secondaryButtonDisabled?: boolean;
}

export interface CtxMenuConfig {
  enableCreateSupernodeNonContiguous?: boolean;
  defaultMenuEntries?: {
    saveToPalette?: boolean;
    createSupernode?: boolean;
    displaySupernodeFullPage?: boolean;
    colorBackground?: boolean;
  };
}

export interface KeyboardConfig {
  actions: {
    delete?: boolean;
    undo?: boolean;
    redo?: boolean;
    selectAll?: boolean;
    cutToClipboard?: boolean;
    copyToClipboard?: boolean;
    pasteFromClipboard?: boolean;
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

export type CanvasNodeId = string;
export type CanvasCommentId = string;
export type CanvasLinkId = string;
export type CanvasPortId = string;
export type CanvasNodeOrCommentId = CanvasNodeId | CanvasCommentId;
export type ObjectId = CanvasNodeId | CanvasCommentId | CanvasLinkId;
export type ViewportCoord = number;
export type CanvasCoord = number;
export type ScaleAmount = number;
export type TranslateAmount = number;
export interface CommentFormat {
  type: string;
  value?: string;
}

export interface ResizeNodeData {
  height: number;
  isResized: boolean;
  resizeHeight: number;
  resizeWidth: number;
  width: number;
  x_pos: CanvasCoord;
  y_pos: CanvasCoord;
}

export interface ResizeCommentData {
  height: number;
  width: number;
  x_pos: CanvasCoord;
  y_pos: CanvasCoord;
}

export interface MoveNodeData {
  id: CanvasNodeId;
  height: number;
  width: number;
  x_pos: CanvasCoord;
  y_pos: CanvasCoord;
}

export interface MoveCommentData {
  id: CanvasCommentId;
  height: number;
  width: number;
  x_pos: CanvasCoord;
  y_pos: CanvasCoord;
}

export type ResizeNodeOrCommentData =
  | ResizeNodeData
  | ResizeCommentData
  | MoveNodeData
  | MoveCommentData;

export interface MoveLinkData {
  id: CanvasLinkId;
  srcPos?: { x_pos: CanvasCoord, y_pos: CanvasCoord };
  trgPos?: { x_pos: CanvasCoord, y_pos: CanvasCoord };
}

export interface Breadcrumb {
  externalUrl?: string;
  label: string;
  pipelineId: string;
  supernodeId: string;
  supernodeParentPipelineId: string;
}

export interface EditActionCreateComment extends EditActionData {
  editType: "createComment"
  editSource: "contextmenu";
  comment?: CanvasComment;
  pipelineId?: string;
  mousePos: { x: CanvasCoord; y: CanvasCoord };
  cmPos: { x: ViewportCoord; y: ViewportCoord };
  type: "canvas";
  zoom: ScaleAmount; // Scale amount from zoom object.
}

export interface EditActionCreateAutoComment extends EditActionData {
  editType: "createAutoComment"
  editSource: "contextmenu" | "toolbar";
  comment?: CanvasComment;
  pipelineId: string;
  mousePos: { x: CanvasCoord; y: CanvasCoord };

  // These properties also included when action performed using context menu.
  cmPos: { x: ViewportCoord; y: ViewportCoord };
  type: "canvas";
  zoom: ScaleAmount;
}

export interface EditActionCreateWYSIWYGComment extends EditActionData {
  editType: "createWYSIWYGComment"
  editSource: "contextmenu" | "toolbar";
  comment?: CanvasComment;
  pipelineId: string;
  mousePos: { x: CanvasCoord; y: CanvasCoord };

  // These properties also included when action performed using context menu.
  cmPos: { x: ViewportCoord; y: ViewportCoord };
  type: "canvas";
  zoom: ScaleAmount;
}

export interface EditActionCreateAutoWYSIWYGComment extends EditActionData {
  editType: "createAutoWYSIWYGComment"
  editSource: "contextmenu" | "toolbar";
  comment?: CanvasComment;
  pipelineId: string;
  mousePos: { x: CanvasCoord; y: CanvasCoord };

  // These properties also included when action performed using context menu.
  cmPos: { x: ViewportCoord; y: ViewportCoord };
  type: "canvas";
  zoom: ScaleAmount;
}

export interface EditActionCreateNode extends EditActionData {
  editType: "createNode";
  editSource: "canvas";
  newNode?: CanvasNode;
  nodeTemplate: CanvasNode
  offsetX: number,
  offsetY: number,
  pipelineId: string;
}

export interface EditActionCreateAutoNode extends EditActionData {
  editType: "createAutoNode";
  editSource: "canvas";
  addLink: boolean; // Whether to link to a source node or not.
  newLink?: CanvasLink;
  newNode?: CanvasNode;
  nodeTemplate: CanvasNode;
  offsetX: number;
  offsetY: number;
  pipelineId: string;
  sourceNode: null | CanvasNode; // The node chosen to be automatically linked from.
}

export interface EditActionMoveObjects extends EditActionData {
  editType: "moveObjects";
  editSource: "canvas";
  links?: CanvasLink[];
  nodes?: CanvasNode[];
  offsetX: number;
  offsetY: number;
  pipelineId: string;
}

export interface EditActionLinkNodes extends EditActionData {
  editType: "linkNodes";
  editSource: "canvas";
  linkIds?: string[];
  linkType: "data";
  pipelineId: string;
  nodes: { id: CanvasNodeId, portId?: CanvasPortId }[];
  targetNodes: { id: CanvasNodeId, portId?: CanvasPortId }[];
  type: "nodeLink" | "associationLink";
}

export interface EditActionLinkComment extends EditActionData {
  editType: "linkComment";
  editSource: "canvas";
  linkIds?: CanvasLinkId[];
  linkType: "comment";
  pipelineId: string;
  nodes: CanvasCommentId[];
  targetNodes: CanvasNodeId[];
  type: "commentLink";
}

export interface EditActionDeleteSelectedObjects extends EditActionData {
  editType: "deleteSelectedObjects";
  editSource: "contextmenu" | "keyboard" | "toolbar";
  pipelineId: string;

  // These properties also included when action performed using context menu.
  type?: "node" | "comment" | "link";
  targetObject?: CanvasNode | CanvasComment | CanvasLink;
  id?: "canvas" | string; // ID of object action was performd on. For historical puposes, we pass id even though that is the ID of targetObject.
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  mousePos?: { x: CanvasCoord; y: CanvasCoord };
  zoom?: ScaleAmount; // Scale amount from zoom object.
}

export interface EditActionDeleteLink extends EditActionData {
  editType: "deleteLink";
  editSource: "contextmenu";

  // These properties also included when action performed using context menu.
  type?: "link";
  targetObject?: CanvasNode | CanvasComment | CanvasLink;
  id?: CanvasLinkId; // ID of object action was performd on. For historical puposes, we pass id even though that is the ID of targetObject.
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  mousePos?: { x: CanvasCoord; y: CanvasCoord };
  pipelineId?: string;
  zoom?: ScaleAmount; // Scale amount from zoom object.
}

export interface EditActionSetNodeLabelEditingMode extends EditActionData {
  editType: "setNodeLabelEditingMode";
  editSource: "contextmenu" | "editicon" | "textdoubleclick";
  id: CanvasNodeId; // ID of object action was performd on.
  pipelineId: string;

  // These properties also included when action performed using context menu.
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  mousePos?: { x: CanvasCoord; y: CanvasCoord };
  targetObject?: CanvasNode;
  type?: "node";
  zoom?: ScaleAmount; // Scale amount from zoom object.
}

export interface EditActionSetCommentEditingMode extends EditActionData {
  editType: "setCommentEditingMode";
  editSource: "contextmenu" | "textdoubleclick";
  id: CanvasCommentId; // ID of object action was performd on.
  pipelineId: string;

  // These properties also included when action performed using context menu.
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  mousePos?: { x: CanvasCoord; y: CanvasCoord };
  targetObject?: CanvasComment;
  type?: "node";
  zoom?: ScaleAmount; // Scale amount from zoom object.
}

export interface EditActionSetZoom extends EditActionData {
  editType: "setZoom";
  editSource: "canvas";
  pipelineId: string;
  zoom: { k: ScaleAmount, x: TranslateAmount, y: TranslateAmount };
}

export interface EditActionResizeObjects extends EditActionData {
  editType: "resizeObjects";
  editSource: "canvas";
  pipelineId: string;
  detachedLinksInfo: Record<CanvasLinkId, MoveLinkData[]>;
  objectsInfo: Record<CanvasNodeOrCommentId, ResizeNodeOrCommentData[]>;
}

export interface EditActionEditComment extends EditActionData {
  editType: "editComment";
  editSource: "canvas";
  id: CanvasCommentId;
  pipelineId: string;
  content: string;
  contentType: "WYSIWYG" | undefined;
  formats?: CommentFormat[]
  height: number;
  width: number;
  x_pos: CanvasCoord;
  y_pos: CanvasCoord;
}

export interface EditActionExpandSupernodeInPlace extends EditActionData {
  editType: "expandSuperNodeInPlace";
  editSource: "contextmenu";
  id: CanvasNodeId;
  pipelineId: string;

  // These properties also included when action performed using context menu.
  addBreadcrumbs?: Breadcrumb[];
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  externalPipelineFlowLoad?: boolean;
  mousePos?: { x: CanvasCoord, y: CanvasCoord };
  targetObject?: CanvasNode;
  type?: "node";
  zoom?: ScaleAmount;
}

export interface EditActionCollapseSupernodeInPlace extends EditActionData {
  editType: "collapseSuperNodeInPlace";
  editSource: "contextmenu";
  id: CanvasNodeId;
  pipelineId: string;

  // These properties also included when action performed using context menu.
  addBreadcrumbs?: Breadcrumb[];
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  mousePos?: { x: CanvasCoord, y: CanvasCoord };
  targetObject?: CanvasNode;
  type?: "node";
  zoom?: ScaleAmount;
}

export interface EditActionCollapseSupernodeInPlace extends EditActionData {
  editType: "collapseSuperNodeInPlace";
  editSource: "contextmenu";
  id: CanvasNodeId;
  pipelineId: string;

  // These properties also included when action performed using context menu.
  addBreadcrumbs?: Breadcrumb[];
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  mousePos?: { x: CanvasCoord, y: CanvasCoord };
  targetObject?: CanvasNode;
  type?: "node";
  zoom?: ScaleAmount;
}

export interface EditActionDisplaySubPipeline extends EditActionData {
  editType: "displaySubPipeline";
  editSource: "contextmenu";
  id: CanvasNodeId;
  pipelineId: string;

  // These properties also included when action performed using context menu.
  addBreadcrumbs?: Breadcrumb[];
  externalPipelineFlowLoad?: boolean;
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  mousePos?: { x: CanvasCoord, y: CanvasCoord };
  targetObject?: CanvasNode;
  type?: "node";
  zoom?: ScaleAmount;
}

export interface EditActionDisplayPreviousPipeline extends EditActionData {
  editType: "displayPreviousPipeline";
  editSource: "canvas";
  pipelineInfo: { pipelineFlowId: string, pipelineId: string };
}

export interface EditActionUndo extends EditActionData {
  editType: "undo";
  editSource: "toolbar" | "contextmenu" | "keyboard";
  pipelineId: string;

  // These properties also included when action performed using context menu.
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  mousePos?: { x: CanvasCoord, y: CanvasCoord };
  type?: "canvas";
  zoom?: ScaleAmount;
}

export interface EditActionRedo extends EditActionData {
  editType: "redo";
  editSource: "toolbar" | "contextmenu" | "keyboard";
  pipelineId: string;

  // These properties also included when action performed using context menu.
  cmPos?: { x: ViewportCoord; y: ViewportCoord };
  mousePos?: { x: CanvasCoord, y: CanvasCoord };
  type?: "canvas";
  zoom?: ScaleAmount;
}

export interface EditActionData {
  /** @deprecated */
  selectedObjectIds: ObjectId[];
  selectedObjects: (CanvasNode | CanvasComment | CanvasLink)[];
  [key: string]: unknown;
}

// This is provided whewn an undo or redo action is performed.
// It contains the actual action object that performs the action.
// TODO - specify EditActionCommand intefaces for each action type.
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
  selectedNodes: CanvasNode[];
  selectedComments: CanvasComment[];
  addedLinks: CanvasLink[];
  addedNodes: CanvasNode[];
  addedComments: CanvasComment[];
  deselectedLinks: CanvasLink[];
  deselectedNodes: CanvasNode[];
  deselectedComments: CanvasComment[];
  selectedPipelineId: string;
}

export interface CommonCanvasProps {
  /**
   * https://elyra-ai.github.io/canvas/03.04-canvas-controller/
   */
  canvasController: CanvasController;

  /**
   * https://elyra-ai.github.io/canvas/03.02.01-canvas-config/
   */
  config?: CanvasConfig;

  /**
   * https://elyra-ai.github.io/canvas/03.02.02-toolbar-config/
   */
  toolbarConfig?: ToolbarConfig | DeprecatedToolbarConfig;

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
  contextMenuHandler?: (
    source: CtxMenuHandlerSource,
    defaultMenu: ContextMenuEntry[]
  ) => ContextMenuEntry[];

  /**
   * https://elyra-ai.github.io/canvas/03.03.02-before-edit-action-handler/
   */
  beforeEditActionHandler?: (
    data: EditActionData,
    command: EditActionCommand
  ) => EditActionData | void;

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

  /**
   * https://elyra-ai.github.io/canvas/01.09.10-panels/
   */
  showRightFlyout?: boolean;
  rightFlyoutContent?: ReactNode | FunctionComponent;
  showTopPanel?: boolean;
  topPanelContent?: ReactNode | FunctionComponent;
  showBottomPanel?: boolean;
  bottomPanelContent?: ReactNode | FunctionComponent;
}

export declare class CommonCanvas extends React.Component<CommonCanvasProps> {}
