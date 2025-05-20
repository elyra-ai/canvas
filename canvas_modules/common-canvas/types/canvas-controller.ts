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
import { ReactNode } from "react";

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
  CanvasBoundPorts,
  CanvasComment,
  CanvasLink,
  CanvasCommentLink,
  CanvasNodeLink,
  CanvasAssociationLink
} from "@elyra/pipeline-schemas/types";


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
  | "setNodeDecorationLabelEditingMode"
  | "setLinkDecorationLabelEditingMode"
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

/** A unique identifier for a pipeline. This should be unique within the
 * set of pipelines in the pipelineFlow/CanvasInfo and, if the application
 * is using external pipeleineFlows, it should be globally unique.
 */
export type PipelineId = string;

/** A canvas object  which can be a node, link or comment.
 */
export type CanvasObject =  CanvasNode | CanvasLink | CanvasComment;

/** A unique identified for a canvas node.
 * Should be unique within the set of nodes, comments and links
 * for the pipeline.
 */
export type CanvasNodeId = string;

/** A unique identified for a canvas comment.
 * Should be unique within the set of nodes, comments and links
 * for the pipeline.
 */
export type CanvasCommentId = string;

/** A unique identified for a canvas link.
 * Should be unique within the set of nodes, comments and links
 * for the pipeline.
 */
export type CanvasLinkId = string;

/** A unique identified for a canvas node's port.
 * Should be unique within the set of port for the node.
 */
export type CanvasPortId = string;

/** Either a canvas node or comment identifier. Nodes and Comments
 * share a number of API functions that act upon them.
 */
export type CanvasNodeOrCommentId = CanvasNodeId | CanvasCommentId;

/** A canvas object identifier.  */
export type CanvasObjectId = CanvasNodeId | CanvasCommentId | CanvasLinkId;

/** A globally unique identifer for a pipeleine flow artifact. */
export type PipelineFlowId = string;

/** A value that specifies a distance, in either the X or Y direction, to
 * identify the physical position of an object within the viewport coordinate
 * system. ViewportCoordVals are measured in screen pixels from the origin,
 * which is the top-left corner of the SVG area. This is the same as a
 * corresponding CanvasCoordVal when no zoom is applied. That is, the
 * zoom transform is { k: 1, x: 0, y: 0 }.
 */
export type ViewportCoordVal = number;

/** A percentage distance of either the viewport's width or height
 * measured from the viewport's origin which is the top-left corner
 * of the flow editor panel.
 */
export type ViewportPercent = number;

/** A value that specifies a distance, in either the X or Y direction, to
 * identify the relative position of an object within the canvas coordinate
 * system. When the canvas is zoomed its coordinate system is zoomed
 * and so the CanvasCordinate for objects on the canvas (nodes, links or
 * comments) remains the same. However, the object's ViewportCoordinate
 * (its physical position on the screen) will change.
 */
export type CanvasCoordVal = number;

/** A distance measured within the canvas coordinate system used for
 * offsets, movement amounts or widths and heights.
 */
export type CanvasDistance = number;

/** A distance expressed as a percentage of a node's width or height,
 * with a % sign as the ending character. For example, "25%"
 */
export type NodePercentDistance = string;

/** The scale amount for zooming. This 1 for no zoom, > 1 for zoom in
 * and < 1 for zoom out.
 */
export type ScaleVal = number;

/** The translate amount in the X or Y direction for panning in
 * canvas coordinates. */
export type TranslateVal = number;

/** ZoomTransform describes zoom attributes of scale and translate */
export interface ZoomTransform {
  k: ScaleVal;
  x: TranslateVal;
  y: TranslateVal;
}

/** A unique identifier for a category of nodes within the palette. Nodes are
 * displayed with a category in the palette view.
 */
export type CategoryId = string;

/** A unique operator identifier stored in the op property of a node. */
export type OperatorId = string;

/** An identifier for a message store in the id_ref property of a message. */
export type MessageControlName = string;

/** A name of a class or a space separated set of class names. */
export type ClassName = string;

/** The 'setPipelineFlow' function has problems with some of the fields imported
 * from JSON. So this creates a Pipeline that allows validation that can be used
 * as part of RelaxedPipelineFlow
 */
export type RelaxedPipeline = Omit<PipelineDef, 'nodes'> & {
  nodes: unknown[]
}

/** The 'setPipelineFlow' function has problems with some of the fields imported
 * from JSON. So this creates a PipelineFlow that allows validation.
 */
export type RelaxedPipelineFlow = Omit<PipelineFlowDef, 'version' | 'json_schema' |  'pipelines'> & {
  version: string;
  json_schema: string;
  pipelines: RelaxedPipeline[]
}

/** The 'setPipelineFlowPalette' function has problems with some of the fields imported
 * from JSON. So this creates a PipelineFlowPalette that allows validation.
 */
export type RelaxedPipelineFlowPalette = Omit<PipelineFlowPalette, 'version' | 'categories'> & {
  version?: string;
  categories?: unknown[];
}

/** AncestorPipeline contains a set of properties to idetify each ancestor in a
 * chain of supernodes and their sub-flows.
 */
export interface AncestorPipeline {
  pipelineId: PipelineId;
  label?: string;
  supernodeId?: CanvasNodeId;
  parentPipelineId?: PipelineId;
}

/** StyleSpec contains a set of CSS strings that can be added inline
 * to various part of node, links, and comments.
 * @deprecated - its is recommended to use a class applied to the node,
 * link or comment along with associated CSS instead of using styles.
 */
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

/** PipelineObjectStyle ties a style spec to a specifc object in a pipeline.
 * @deprecated  - its is recommended to use a class applied to the node,
 * link or comment along with associated CSS instead of using styles.
 */
export interface PipelineObjectStyle {
	style: StyleSpec;
	pipelineId: PipelineId;
	objId: CanvasObjectId;
  }

/** One of the different types of notificaiton message.
 * https://elyra-ai.github.io/canvas/03.04.05-notification-messages/ */
export type NotificationMsgType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | ""
  | undefined
  | null;

/** A unique identifier for a notificaiton message. */
export type NotificationMsgId = string;

/** NotificationMsg represents a message displayed in the notificaiton panel.
 * https://elyra-ai.github.io/canvas/03.04.05-notification-messages/
 */
export interface NotificationMsg {
  id: NotificationMsgId;
  type: NotificationMsgType;
  title?: string | ReactNode;
  content?: string | ReactNode;
  timestamp?: string;
  callback?: (id: string) => void;
  closeMessage?: string | ReactNode;
}

/** A unique identifier for a decoration.
 * Should be unique within the set of decorations for the object
 * to which the decoration is attached.
 */
export type DecorationId = string;

/** Decoration can be applied to canvas objects to add extra images, text etc to
 * enhance their appearance or depict special attributes of the object.
 * Note: This is created and exported in the TypeScript file because json2ts
 * doesn't create a combined Decoration object even though the JSON schema uses
 * the "oneOf" keyword. This seems to be because the decoration definitions are
 * in a child schema of pipeline-flow-v3-schema.json.
 */
export type Decoration = NodeDecorationDef | LinkDecorationDef;

/** An entry in the context menu represnting a option that can be clicked or
 * a divider.
 */
export type ContextMenuEntry = ContextMenuDivider | ContextMenuItem;

/** A dividier to separate context menu options. */
export interface ContextMenuDivider {
  divider: true;
}
/** A context menu item that represents an option that can be clicked in
 * the menu. Context menu items can cascade to sub menus of items. */
export interface ContextMenuItem {
	action: InternalAction | string | "colorBackground";
	label: string;
	icon?: string | ReactNode;
	enable?: boolean;
	submenu?: boolean;
	menu?: ContextMenuEntry[];
	toolbarItem?: boolean;
  };

/** A format defintion object used for applying inline styles to a
/* canvas comment.
 */
export interface CommentFormat {
  type: string;
  value?: string;
}

/** A breadcrumb representing a pipeline which may be placed in an array
 * of breadcrumbs that represent the navigated set of pipelines.
 */
export interface Breadcrumb {
   pipelineId?: PipelineId;
   pipelineFlowId?: PipelineFlowId
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
    getPipelineFlowId(): PipelineFlowId;

    /**
     * Returns the ID of the primary pipeline from the pipelineFlow.
     * @returns the ID of the primary pipeline.
     */
    getPrimaryPipelineId(): PipelineId;

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
    getAncestorPipelineIds(pipelineId: PipelineId): AncestorPipeline[];

    /**
     * Removes all styles from nodes, comments and links. See the setObjectsStyle
     * and setLinkStyle methods for details on setting styles.
     * @param temporary - boolean that indicates whether temporary or permanent
     *                    styles should be removed.
     * @deprecated - its is recommended to use a class applied to the node,
     * link or comment along with associated CSS instead of using styles.
     */
    removeAllStyles(temporary: boolean): void;

    /**
     * Specifies the new styles for objects that are not highlighted during
     * branch highlighting.
     * @param newStyle - is a style specification object
     * @deprecated - its is recommended to use a class applied to the node,
     * link or comment along with associated CSS instead of using styles.
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
    getPipeline(pipelineId: PipelineId): CanvasPipeline;

    /**
     * Returns the ID of the pipeline object which is currently on display
     * in the canvas. Typically, this is the primary pipeline but will be
     * different if the user has navigated into one or more supernodes; in
     * which case it will be the ID of the pipeline at the level in the
     * supernode hierarchy that is currently on display.
     * @returns a pipeline ID for the currently displayed pipeline.
     */
    getCurrentPipelineId(): PipelineId;

    /**
     * Returns truthy if the pipeline is external (that is it is part of an
     * external pipeline flow). Otherwise, return falsy to indicate the pipeline
     * is local.
     * @param pipelineId - Optional. The ID of the pipeline.
     *                     Defaults to the currently displayed pipeline.
     * @returns a boolean to indicate whether the pipeline is external ot local
     */
    isPipelineExternal(pipelineId?: PipelineId): boolean;

    /**
     * Returns the messages for all the nodes in the pipeline ID passed in.
     * @param pipelineId - Optional. The ID of the pipeline.
     *                     Defaults to the currently displayed pipeline.
     * @returns An array of messages.
     */
    getFlowMessages(pipelineId?: PipelineId): MessageDef[];

    /**
     * Indicates whether the nodes have a message or not.
     * @param includeMsgType - can be either "error" or "warning"
     * @param pipelineId - Optional. The ID of the pipeline.
     *                     Defaults to the currently displayed pipeline.
     * @returns a boolean to indicate whether there are any messages of
     *          includeMsgsType for the nodes in the pipeline identified
     *          by the pipeline ID passed in.
     */
    isFlowValid(includeMsgType: "error" | "warning", pipelineId?: PipelineId): boolean;

    /**
     * Rearranges the nodes in the canvas in the direction specified for the
     * pipeline ID passed in.
     * @param layoutDirection - can be "horizontal" or "vertical"
     * @param pipelineId - Optional. The ID of the pipeline.
     *                     Defaults to the currently displayed pipeline.
     */
    autoLayout(layoutDirection: "horizontal" | "vertical", pipelineId?: PipelineId): void;

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
    setCategoryLoadingText(categoryId: CategoryId, loadingText: string): void;

    /**
     * Sets the empty text of the category. If set to a non-empty string and the
     * category does not have any nodes, the palette will show a warning icon with
     * this text as a message under the category title when the category is opened.
     * This message will not be displayed if the field is set to falsey or if
     * nodetypes are added to the category.
     * @param categoryId
     * @param emptyText
     */
    setCategoryEmptyText(categoryId: CategoryId, emptyText: string): void;

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
      categoryId: CategoryId,
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
      categoryId: CategoryId,
      categoryLabel?: string,
      categoryDescription?: string,
      categoryImage?: string
    ): void;

    /**
     * Removes nodetypes from a palette category
     * @param selObjectIds - an array of object IDs to identify the nodetypes to be
     * @param categoryId - the ID of the category from which the nodes will be removed
     */
    removeNodesFromPalette(selObjectIds: CanvasNodeId[], categoryId: CategoryId): void;

    /**
     * @returns the palette data document which will conform to the latest version
     * of the palette schema.
     */
    getPaletteData(): PipelineFlowPalette;

    /**
     * @param operatorId - ID of the operator for this node
     * @returns the palette node identified by the operator ID passed in.
     */
    getPaletteNode(operatorId: OperatorId): NodeTypeDef;

    /**
     * @param nodeId - ID of the node
     * @returns the palette node identified by the node ID passed in.
     */
    getPaletteNodeById(nodeId: CanvasNodeId): NodeTypeDef;

    /**
     * Returns the cateory that the node identified by the operatorId is in.
     * @param operatorId - ID of the operator for this node
     * @returns the category of the palette node identified by the operator passed in
     */
    getCategoryForNode(operatorId: OperatorId): CategoryDef;

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
    openPaletteCategory(categoryId: CategoryId): void;

    /** Closes the palette category idetified by the category ID passed in.
     * @param categoryId - ID of the category
     */
    closePaletteCategory(categoryId: CategoryId): void;

    /** Opens all the palette categories. */
    openAllPaletteCategories(): void;

    /** Closes all the palette categories. */
    closeAllPaletteCategories(): void;

    /** Returns true or false to indicate whether a palette category is open or not.
     * @param categoryId - ID of the category
     */
    isPaletteCategoryOpen(categoryId: CategoryId): boolean;

    /**
     * ## Selection methods
     * https://elyra-ai.github.io/canvas/03.04-canvas-controller/#selections-methods
     */

    /**
     * Sets the currently selected objects replacing any current selections.
     * Selected objects can only be in one pipeline. If this parameter is omitted
     * it is assumed the selections will be for objects in the 'top-level' pipeline
     * being displayed.
     * @param newSelections - An array of object IDs for nodes, links and/or comments.
     * @param pipelineId - Optional. The ID of the pipeline where the objects exist.
     *                     Defaults to the currently displayed pipeline.
     */
    setSelections(
      newSelections: CanvasObjectId[],
      pipelineId?: PipelineId
    ): void;
    /**
     * Clears all the current selections from the canvas.
     */
    clearSelections(): void;

    /**
     * Selects all the objects in a pipeline.
     * @param pipelineId - Optional. The ID of the pipeline of the nodes.
     *                     Defaults to the currently displayed pipeline.
     */
    selectAll(pipelineId?: PipelineId): void;

    /**
     * De-selects all the objects in a pipeline.
     * @param pipelineId - Optional. The ID of the pipeline of the nodes.
     *                     Defaults to the currently displayed pipeline.
     */
    deselectAll(pipelineId?: PipelineId): void;

    /**
     * @returns an array of the IDs of the currently selected objects.
     */
    getSelectedObjectIds(): CanvasObjectId[];

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
    getSelectedPipelineId(): PipelineId;

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
    deleteNotificationMessages(ids: NotificationMsgId[]): void;

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
        nodes: CanvasNodeOrCommentId[];
        offsetX: CanvasDistance;
        offsetY: CanvasDistance;
      },
      pipelineId?: PipelineId
    ): void;

    /**
     * Deletes the objects specified in objectIds array.
     * @param objectIds - An array of node and comment IDs
     * @param pipelineId - Optional. The ID of the pipeline of the nodes.
     *                     Defaults to the currently displayed pipeline.
     */
    deleteObjects(
      objectIds: CanvasNodeOrCommentId[],
      pipelineId?: PipelineId
    ): void;

    /**
     * Removes the links to and from the objects specified in the objectIds array.
     * @param objectIds - An array of node and comment IDs
     * @param pipelineId - Optional. The ID of the pipeline of the nodes.
     *                     Defaults to the currently displayed pipeline.
     */
    disconnectObjects(
      objectIds: CanvasNodeOrCommentId[],
      pipelineId?: PipelineId
    ): void;

    /**
     * Deletes the object specified by the ID in the pipeline specified by
     * pipeline ID.
     * @param id - The ID of the object to be deleted.
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    deleteObject(id: CanvasNodeOrCommentId, pipelineId?: PipelineId): void;

    /**
     * Sets the style of the objects specified by pipelineObjectIds to be
     * the newStyle which will be either temporary or permanent.
     * @deprecated - its is recommended to use a class applied to the node,
     * link or comment along with associated CSS instead of using styles.
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
      pipelineObjectIds: Record<PipelineId, CanvasObjectId[]>,
      newStyle: StyleSpec,
      temporary: boolean
    ): void;

    /**
     * Sets the styles of multiple objects at once.
     * @deprecated - its is recommended to use a class applied to the node,
     * link or comment along with associated CSS instead of using styles.
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
    getNodes(pipelineId?: PipelineId): CanvasNode[];

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
        offsetX: CanvasDistance;
        offsetY: CanvasDistance;
      },
      pipelineId?: PipelineId
    ): CanvasNode;

    /**
     * Adds a new node into the pipeline specified by the pipelineId.
     * @param A node that complied withe canvas info format
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    addNode(node: CanvasNode, pipelineId?: PipelineId): void;

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
        offsetX: CanvasDistance;
        offsetY: CanvasDistance;
      },
      pipelineId?: PipelineId
    ): void;

    /**
     * Deletes the node specified.
     * @param nodeId - The ID of the node
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    deleteNode(nodeId: CanvasNodeId, pipelineId?: PipelineId): void;

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
      nodeId: CanvasNodeId,
      properties:
        | Omit<Partial<CanvasExecutionNode>, "id">
        | Omit<Partial<CanvasBindingEntryNode>, "id">
        | Omit<Partial<CanvasBindingExitNode>, "id">
        | Omit<Partial<CanvasSupernode>, "id">
        | Omit<Partial<CanvasModelNode>, "id">,
      pipelineId?: PipelineId
    ): void;
    /**
     * Sets the node parameters
     * @param nodeId - The ID of the node
     * @param parameters - An array of parameters
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    setNodeParameters(
      nodeId: CanvasNodeId,
      parameters: Record<string, unknown>[],
      pipelineId?: PipelineId
    ): void;

    /**
     * Sets the node UI parameters
     * @param nodeId - The ID of the node
     * @param uiParameters - An array of UI parameters
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    setNodeUiParameters(
      nodeId: CanvasNodeId,
      uiParameters: Record<string, unknown>[],
      pipelineId?: PipelineId
    ): void;

    /**
     * Sets the node messages
     * @param nodeId - The ID of the node
     * @param messages - An array of messages
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    setNodeMessages(
      nodeId: CanvasNodeId,
      messages: MessageDef[],
      pipelineId?: PipelineId
    ): void;

    /**
     * Sets a single message on a node
     * @param nodeId - The ID of the node
     * @param message - A message
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    setNodeMessage(
      nodeId: CanvasNodeId,
      message: MessageDef,
      pipelineId?: PipelineId
    ): void;

    /**
     * Sets the label for a node
     * @param nodeId - The ID of the node
     * @param newLabel - The new label
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    setNodeLabel(
      nodeId: CanvasNodeId,
      newLabel: string,
      pipelineId?: PipelineId
    ): void;

    /**
     * Sets the class name to newClassName of the nodes identified by nodeIds
     * array in the pipeline specified by pipeline ID. The class name will be
     * applied to the nodes' group (<g>) element in the DOM. To remove any
     * previously added classes an empty string can be specified.
     * @param nodeIds - An array of node IDs
     * @param newClassName - New class string. Can be a space separated list
     *                       of classes or an empty string to remove
     *                       previously added classes.
     * @param pipelineId - Optional. The ID of the pipeline of the nodes.
     *                     Defaults to the currently displayed pipeline.
     */
    setNodesClassName(
      nodeIds: CanvasNodeId[],
      newClassName: ClassName,
      pipelineId?: PipelineId
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
      nodeId: CanvasNodeId,
      newDecorations: Decoration[],
      pipelineId?: PipelineId
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
      nodeId: CanvasNodeId,
      inputs: CanvasPorts | CanvasBoundPorts,
      pipelineId?: PipelineId
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
      nodeId: CanvasNodeId,
      outputs: CanvasPorts | CanvasBoundPorts,
      pipelineId?: PipelineId
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
        pipelineId: PipelineId;
        nodeId: CanvasNodeId;
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
      nodeId: CanvasNodeId,
      portId: CanvasPortId,
      newLabel: string,
      pipelineId?: PipelineId
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
      nodeId: CanvasNodeId,
      portId: CanvasPortId,
      newLabel: string,
      pipelineId?: PipelineId
    ): void;

    /**
     * Gets a node that conforms to the CanvasNode format.
     * @param nodeId - The ID of the node
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     * @returns A node conforming to the canvas info format. null if not found.
     */
    getNode(
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
    ): CanvasNode | null;

    /**
     * Gets the UI parameters for a node
     * @param nodeId - The ID of the node
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    getNodeUiParameters(
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
    ): Record<string, unknown>[];

    /**
     * Gets the supernodes for a pipeline.
     * @param pipelineId - Optional. The ID of the pipeline.
     *                     Defaults to the currently displayed pipeline.
     */
    getSupernodes(
      pipelineId?: PipelineId
    ): CanvasSupernode[];

    /**
     * Returns the supernode that references the given pipelineId.
     * @param pipelineId - Optional. The ID of the pipeline.
     *                     Defaults to the currently displayed pipeline.
     * @returns supernode that has a subflow_ref to the given pipelineId.
     */
    getSupernodeObjReferencing(
      pipelineId?: PipelineId
    ): CanvasSupernode;

    /**
     * Gets the messages for a node
     * @param nodeId - The ID of the node
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     * @returns An array of messages from the node or null if node not found.
     */
    getNodeMessages(
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
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
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
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
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
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
      nodeId: CanvasNodeId,
      controlName: MessageControlName,
      pipelineId?: PipelineId
    ): MessageDef | null;

    /**
     * Gets an array of decorations for a node
     * @param nodeId - The ID of the node
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     * @returns An array of decorations.
     */
    getNodeDecorations(
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
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
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
    ): ClassName;

    /**
     * Gets the style specification (see Wiki) for a node
     * @param nodeId - The ID of the node
     * @param temporary - A boolean to indicate if the style is serialized when
     *                    getPipelineFlow() method is called or not.
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     * @returns A style specification.
     * @deprecated - its is recommended to use a class applied to the node
     * along with associated CSS instead of using styles.
     */
    getNodeStyle(
      nodeId: CanvasNodeId,
      temporary: boolean,
      pipelineId?: PipelineId
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
      nodeIds: CanvasNodeId[],
      pipelineId?: PipelineId
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
      nodeIds: CanvasNodeId[],
      pipelineId?: PipelineId
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
      nodeIds: CanvasNodeId[],
      pipelineId?: PipelineId
    ): CanvasNode[];

    /**
     * Returns a boolean to indicate whether the supernode is expanded in place.
     * @param nodeId - The ID of the node
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     * @returns A boolean to indicate whether the supernode is expanded in place.
    */
    isSuperNodeExpandedInPlace(
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
    ): boolean;

    /**
     * Sets the label, for the node identified, to edit mode, provided the node
     * label is editable. This allows the user to edite the label text.
     * @param nodeId - The ID of the node
     * @param pipelineId - Optional. The ID of the pipeline of the node.
     *                     Defaults to the currently displayed pipeline.
     */
    setNodeLabelEditingMode(
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
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
      decId: DecorationId,
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
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
      pipelineId?: PipelineId
    ): CanvasComment[];

    /**
     * Returns a comment from the pipeline.
     * @param comId - The ID of the comment
     * @param pipelineId - Optional. The ID of the pipeline of the comment.
     *                     Defaults to the currently displayed pipeline.
     * @returns A comment conforming to the canvas info format. null if not found.
     */
    getComment(
      comId: CanvasCommentId,
      pipelineId?: PipelineId
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
      pipelineId?: PipelineId
    ): { x: CanvasCoordVal; y: CanvasCoordVal };

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
          x: CanvasCoordVal;
          y: CanvasCoordVal;
        };
        contentType?: null | "markdown" | "WYSIWYG";
        formats?: CommentFormat[];
        selectedObjectIds?: CanvasNodeId[];
      },
      pipelineId?: PipelineId
    ): CanvasComment;

    /**
     * Adds a comment to the pipeline.
     * @param data - a comment conforming to the canvas info format
     * @param pipelineId - Optional. The ID of the pipeline of the comment.
     *                     Defaults to the currently displayed pipeline.
     */
    addComment(
      data: CanvasComment,
      pipelineId?: PipelineId
    ): void;

    /**
     * Edits a comment with the data.
     * @param commentProperties - properties to overwrite the comment
     * @param pipelineId - Optional. The ID of the pipeline of the comment.
     *                     Defaults to the currently displayed pipeline.
     */
    editComment(
      properties: Omit<Partial<CanvasComment>, "id">,
      pipelineId?: PipelineId
    ): void;

    /**
     * Sets the properties in the comment identified by the commentId. The
     * commentProperties is an object containing one or more properties that will
     * replace the corresponding properties in the comment. For example: if
     * commentProperties is { x_pos: 50, y_pos: 70 } the comment
     * will be set to that position.
     * @param commentId - the ID of the comment to update
     * @param properties - properties to overwrite the comment
     * @param pipelineId - Optional. The ID of the pipeline of the comment.
     *                     Defaults to the currently displayed pipeline.
     */
    setCommentProperties(
      commentId: CanvasCommentId,
      properties: Omit<Partial<CanvasComment>, "id">,
      pipelineId?: PipelineId
    ): void;

    /**
     * Sets the class name to newClassName of the comments identified by commentIds
     * array in the pipeline specified by pipeline ID. The class name will be
     * applied to the comments' group (<g>) element in the DOM. To remove any
     * previously added classes an empty string can be specified.
     * @param commentIds - An array of comment IDs.
     * @param newClassName - New class string. Can be a space separated list
     *                       of classes or an empty string to remove
     *                       previously added classes.
     * @param pipelineId - Optional. The ID of the pipeline of the comment.
     *                     Defaults to the currently displayed pipeline.
     */
    setCommentsClassName(
      commentIds: CanvasCommentId[],
      newClassName: ClassName,
      pipelineId?: PipelineId
    ): void;

    /**
     * Deletes a comment
     * @param commentId - The ID of the comment
     * @param pipelineId - Optional. The ID of the pipeline of the comment.
     *                     Defaults to the currently displayed pipeline.
     */
    deleteComment(
      commentId: CanvasCommentId,
      pipelineId?: PipelineId
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
      commentId: CanvasCommentId,
      pipelineId?: PipelineId
    ): ClassName;

    /**
     * Gets the style spcification for a comment
     * @param commentId - The ID of the comment
     * @param temporary - A boolean to indicate if the style is serialized when
     *                    getPipelineFlow() method is called or not.
     * @param pipelineId - Optional. The ID of the pipeline of the comment.
     *                     Defaults to the currently displayed pipeline.
     * @returns A style specification.
     * @deprecated - its is recommended to use a class applied to the comment
     * along with associated CSS instead of using styles.
     */
    getCommentStyle(
      commentId: CanvasCommentId,
      temporary: boolean,
      pipelineId?: PipelineId
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
      commentId: CanvasCommentId,
      pipelineId?: PipelineId
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
      linkId: CanvasLinkId,
      pipelineId?: PipelineId
    ): CanvasLink;

    /**
     * Gets an array of links
     * @param pipelineId - Optional. The ID of the pipeline of the link.
     *                     Defaults to the currently displayed pipeline.
     * @returns An array a link objects that conform to the canvas info format.
     */
    getLinks(
      pipelineId?: PipelineId
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
      linkId: CanvasLinkId,
      properties: Omit<Partial<CanvasLink>, "id">,
      pipelineId?: PipelineId
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
      linkId: CanvasLinkId,
      srcNodeId: CanvasNodeId,
      srcNodePortId: CanvasPortId,
      pipelineId?: PipelineId
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
      linkId: CanvasLinkId,
      trgNodeId: CanvasNodeId,
      trgNodePortId: CanvasPortId,
      pipelineId?: PipelineId
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
      srcNodeId: CanvasNodeId,
      srcNodePortId: CanvasPortId,
      trgNodeId: CanvasNodeId,
      trgNodePortId: CanvasPortId,
      pipelineId?: PipelineId
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
      commentId: CanvasCommentId,
      nodeId: CanvasNodeId,
      pipelineId?: PipelineId
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
      nodeId1: CanvasNodeId,
      nodeId2: CanvasNodeId,
      pipelineId?: PipelineId
    ): CanvasLink;

    /**
     * Adds links to a pipeline
     * @param linkList - An array of links
     * @param pipelineId - Optional. The ID of the pipeline of the link.
     *                     Defaults to the currently displayed pipeline.
     */
    addLinks(
      linkList: CanvasLink[],
      pipelineId?: PipelineId
    ): void;

    /**
     * Deletes a link
     * @param source - The link to delete
     * @param pipelineId - Optional. The ID of the pipeline of the link.
     *                     Defaults to the currently displayed pipeline.
     */
    deleteLink(
      link: CanvasLink,
      pipelineId?: PipelineId
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
        id?: CanvasLinkId;
        type: "nodeLink"
        nodes: {
          id?: CanvasNodeId;
          portId?: CanvasPortId;
          srcPos?: {
            x_pos: CanvasCoordVal;
            y_pos: CanvasCoordVal;
          };
        }[];
        targetNodes: {
          id?: CanvasNodeId;
          portId?: CanvasPortId;
          trgPos?: {
            x_pos: CanvasCoordVal;
            y_pos: CanvasCoordVal;
          };
        }[],
        class_name?: ClassName;
        linkName?: string;
      },
      pipelineId?: PipelineId
    ): CanvasNodeLink[];

    /**
     * Creates node to node links of type "associationLink". One link will be created
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
        id?: CanvasLinkId;
        type: "associationLink"
        nodes: {
          id?: CanvasNodeId;
        }[];
        targetNodes: {
          id?: CanvasNodeId;
        }[],
        class_name?: ClassName;
        linkName?: string;
      },
      pipelineId?: PipelineId
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
        id?: CanvasLinkId;
        nodes: {
          id?: CanvasCommentId;
        }[];
        targetNodes: {
          id?: CanvasNodeId;
        }[],
        class_name?: ClassName;
      },
      pipelineId?: PipelineId
    ): CanvasCommentLink[];

    /**
     * Sets the class name to newClassName of the links identified by linkIds
     * array in the pipeline specified by pipeline ID. The class name will be
     * applied to the links' group (<g>) element in the DOM. To remove any
     * previously added classes an empty string can be specified.
     * @param linkIds - An arry of link IDs
     * @param newClassName - New class string. Can be a space separated list
     *                       of classes or an empty string to remove
     *                       previously added classes.
     * @param pipelineId - Optional. The ID of the pipeline of the link.
     *                     Defaults to the currently displayed pipeline.
     */
    setLinksClassName(
      linkIds: CanvasLinkId[],
      newClassName: ClassName,
      pipelineId?: PipelineId
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
     * @deprecated - its is recommended to use a class applied to the link
     * along with associated CSS instead of using styles.
     */
    setLinksStyle(
      pipelineLinkIds: Record<PipelineId, CanvasLinkId[]>,
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
     * @deprecated - its is recommended to use a class applied to the links
     * along with associated CSS instead of using styles.
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
      linkId: CanvasLinkId,
      pipelineId?: PipelineId
    ): void;

    /**
     * Returns the style specification for a link.
     * @param linkId - A link ID.
     * @param temporary - A boolean to indicate if the style is serialized when
     *                    getPipelineFlow() method is called or not.
     * @param pipelineId - Optional. The ID of the pipeline of the link.
     *                     Defaults to the currently displayed pipeline.
     * @returns The style specification for the link.
     * @deprecated - its is recommended to use a class applied to the link
     * along with associated CSS instead of using styles.
     */
    getLinkStyle(
      linkId: CanvasLinkId,
      temporary: boolean,
      pipelineId?: PipelineId
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
      linkId: CanvasLinkId,
      newDecorations: Decoration[],
      pipelineId?: PipelineId
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
        pipelineId: PipelineId;
        linkId: CanvasLinkId;
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
      linkId: CanvasLinkId,
      pipelineId?: PipelineId
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
      decId: DecorationId,
      linkId: CanvasLinkId,
      pipelineId?: PipelineId
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
    getBreadcrumbs(): Breadcrumb[];

    /**
     * Returns the breadcrumb for the currently displayed pipeline.
     * @returns The last breadcrumb which represents the level with supernode
     * hierarchy that the user has currently navigated to.
     */
    getCurrentBreadcrumb(): Breadcrumb;

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
      nodeIds: CanvasNodeId[],
      pipelineId: PipelineId
    ): { nodes: CanvasNodeId[], links: CanvasLinkId[] }[];

    /**
     * Highlights the upstream nodes from the node IDs passed in
     * and returns the highlighted object Ids.
     * @param nodeIds - An array of node Ids
     * @param pipelineId - The ID of the pipeline of the nodes.
     */
    highlightUpstream(
      nodeIds: CanvasNodeId[],
      pipelineId: PipelineId
    ): { nodes: CanvasNodeId[], links: CanvasLinkId[] }[];


    /**
     * Highlights the downstream nodes from the node IDs passed in
     * and returns highlighted object Ids.
     * @param nodeIds - An array of node Ids
     * @param pipelineId - The ID of the pipeline
     */
    highlightDownstream(
      nodeIds: CanvasNodeId[],
      pipelineId: PipelineId
    ): { nodes: CanvasNodeId[], links: CanvasLinkId[] }[];


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
          x: ViewportCoordVal;
          y: ViewportCoordVal;
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
      pipelineId: PipelineId
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
      supernodeId: CanvasNodeId,
      pipelineId: PipelineId
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
     * pipelineFlow document.
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
      x: CanvasDistance,
      y: CanvasDistance,
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
      objectIds: CanvasNodeOrCommentId[],
      xPos?: ViewportPercent,
      yPos?: ViewportPercent
    ): ZoomObjectDef | null;

    /**
     * Clears any saved zoom values stored in local storage. This means
     * newly opened flows will appear with the default zoom. This method
     * is only applicable when the `enableSaveZoom` config parameter is
     * set to "LocalStorage".
     */
    clearSavedZoomValues(): void;

    /**
     * ## Focus management methods
     */

    /** Restores the focus highlighting to the last focused object before focus
     *  was removed from the flow editor.
     */
    restoreFocus(): void;

    /** Sets focus on the flow editor canvas background.
     */
    setFocusOnCanvas(): void;

    /** Returns the currently focused object or the string "CanvasFocus".
     */
    getFocusObject(): "CanvasFocus" | CanvasObject;

    /** Sets the focus highlighting to parameter passed in which can be
     * either a canvas object or the string "CanvasFocus".
     */
    setFocusObject(
      focusObj: "CanvasFocus" | CanvasObject
    ): void;

    /** Returns true of the focus in currently on the flow editor canvas
     * background.
     */
    isFocusOnCanvas(): boolean;
  }
