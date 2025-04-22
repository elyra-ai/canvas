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
  NodeDecorationDef,
  // Canvas Info
  CanvasNode,
  CanvasComment,
  CanvasLink
} from "@elyra/pipeline-schemas/types";

import {
  InternalAction,
  PipelineId,
  CanvasNodeId,
  CanvasCommentId,
  CanvasLinkId,
  CanvasPortId,
  CanvasNodeOrCommentId,
  CanvasObjectId,
  PipelineFlowId,
  ViewportCoordVal,
  CanvasCoordVal,
  CanvasDistance,
  NodePercentDistance,
  ScaleVal,
  ZoomTransform,
  ClassName,
  DecorationId,
  ContextMenuEntry,
  CommentFormat,
  CanvasController
} from "./canvas-controller";

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

export type {
  InternalAction,
  PipelineId,
  CanvasNodeId,
  CanvasCommentId,
  CanvasLinkId,
  CanvasPortId,
  CanvasNodeOrCommentId,
  CanvasObjectId,
  PipelineFlowId,
  ViewportCoordVal,
  ViewportPercent,
  CanvasCoordVal,
  CanvasDistance,
  ScaleVal,
  TranslateVal,
  ZoomTransform,
  CategoryId,
  OperatorId,
  MessageControlName,
  ClassName,
  RelaxedPipeline,
  RelaxedPipelineFlow,
  RelaxedPipelineFlowPalette,
  AncestorPipeline,
  StyleSpec,
  PipelineObjectStyle,
  NotificationMsgType,
  NotificationMsgId,
  NotificationMsg,
  DecorationId,
  Decoration,
  ContextMenuEntry,
  ContextMenuDivider,
  ContextMenuItem,
  CommentFormat,
  CanvasController,
} from "./canvas-controller";

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
      width: CanvasDistance;
      height: CanvasDistance;
    };

/**
 * https://elyra-ai.github.io/canvas/03.06.01-node-customization/#default-values-for-node-layout-properties
 */
export interface NodeLayout {
  /**
   * Default node sizes. The height might be overridden for nodes with more ports
   * than will fit in the default size.
   */
  defaultNodeWidth: CanvasDistance;
  defaultNodeHeight: CanvasDistance;

  /**
   * A space separated list of classes that will be added to the group <g>
   * DOM element for the node.
   */
  className: ClassName;

  /**
   * Displays the node outline shape underneath the image and label.
   */
  nodeShapeDisplay: boolean;

  /**
   * Default node shape. Only used if nodeShapeDisplay is set to true.
   */
  nodeShape: "port-arcs" | "rectangle" | "rectangle-rounded-corners";

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
   * Displays the external object specified, as the body of the node
   */
  nodeExternalObject: FunctionComponent<any> | ComponentClass<any>;

  /**
   * Display image
   */
  imageDisplay: boolean;
  imageWidth: CanvasDistance;
  imageHeight: CanvasDistance;

  /**
   * Image position
   */
  imagePosition: NodePosition;
  imagePosX: CanvasDistance;
  imagePosY: CanvasDistance;

  /** Display label */
  labelDisplay: boolean;

  /**
   * Label dimensions
   */
  labelWidth: CanvasDistance;
  labelHeight: CanvasDistance;

  /**
   * Label position
   */
  labelPosition: NodePosition;
  labelPosX: CanvasDistance;
  labelPosY: CanvasDistance;

  /**
   * Label appearance propeties
   */
  labelEditable: boolean;
  labelAlign: "left" | "center";
  labelSingleLine: boolean;  /* false allow multi-line labels */
  labelOutline: boolean;
  labelMaxCharacters: number;  /* null allows unlimited characters */
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
  decoratorTopY: CanvasDistance;
  decoratorMiddleY: CanvasDistance;
  decoratorBottomY: CanvasDistance;
  decoratorLeftX: CanvasDistance;
  decoratorCenterX: CanvasDistance;
  decoratorRightX: CanvasDistance;

  /**
   * Default width, height and padding for image decorators
   */
  decoratorWidth: CanvasDistance;
  decoratorHeight: CanvasDistance;
  decoratorPadding: CanvasDistance;

  /**
   * Default width and height for label decorators
   */
  decoratorLabelWidth: CanvasDistance;
  decoratorLabelHeight: CanvasDistance;

  /**
   * Display drop shadow under and round the nodes
   */
  dropShadow: boolean;

  /**
   * The gap between a node and its selection highlight rectangle
   */
  nodeHighlightGap: CanvasDistance;

  /**
   * The size of the node sizing area that extends around the node, over
   * which the mouse pointer will change to the sizing arrows.
   */
  nodeSizingArea: CanvasDistance;

  /**
   * Error indicator dimensions
   */
  errorPosition: NodePosition;
  errorXPos: CanvasDistance;
  errorYPos: CanvasDistance;
  errorWidth: CanvasDistance;
  errorHeight: CanvasDistance;

  /**
   * When sizing a node or supernode this decides the size of the corner
   * area for diagonal sizing.
   */
  nodeCornerResizeArea: CanvasDistance;

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
  minInitialLine: CanvasDistance;

  /**
   * For the elbow connection type with nodes with multiple output ports,
   * this is used to increment the minInitialLine so that connection lines
   * do not overlap each other when they turn up or down after the elbow.
   */
  minInitialLineIncrement: CanvasDistance;

  /**
   * This is the minimum size of the horizontal line entering the
   * target port on the target node when drawing an Elbow connection line.
   */
  minFinalLine: CanvasDistance;

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
  inputPortPositions: { x_pos: CanvasDistance; y_pos: CanvasDistance; pos: NodePosition }[];

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
  outputPortPositions: { x_pos: CanvasDistance; y_pos: CanvasDistance; pos: NodePosition }[];

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
  portRadius: CanvasDistance;

  /**
   * Size of an offset above and below the set of port arcs.
   */
  portArcOffset: CanvasDistance;

  /**
   * Radius of an imaginary circle around the port. This controls the
   * spacing of ports and the size of port arcs when nodeShape is set to
   * port-arcs.
   */
  portArcRadius: CanvasDistance;

  /**
   * Spacing between the port arcs around the ports.
   */
  portArcSpacing: CanvasDistance;

  /**
   * Position of the context toolbar relative to the node. Some adjustment
   * will be made to account for the width of the toolbar.
   */
  contextToolbarPosition: NodePosition;

  /**
   * Display of vertical ellipsis to show context menu
   */
  ellipsisDisplay: boolean;
  ellipsisPosition: NodePosition;
  ellipsisWidth: CanvasDistance;
  ellipsisHeight: CanvasDistance;
  ellipsisPosX: CanvasDistance;
  ellipsisPosY: CanvasDistance;
  ellipsisHoverAreaPadding: CanvasDistance;
}


/**
 * https://elyra-ai.github.io/canvas/03.06.04-canvas-customization/#
 */
export interface CanvasLayout {
  /** Displays a grid under the canvas objects.
   */
  displayGridType: "None" | "Dots" | "Boxes" | "DotsAndLines" | "BoxesAndLines";

  /** Sizes of the displayed grid as a percentage of default node height and width.
   * These can also specified as a number which is a size in pixels.
   * The major grid dimensions are used to draw lines when 'displayGridType' is set to
   * either "DotsAndLines" or "BoxesAndLines". The minor grid dimensions are used to
   * draw a grid of dots or boxes. For correct alignment, the major grid dimensions
   * should be an exact multiple of the minor grid sizes.
   */
  displayGridMajorX: NodePercentDistance | CanvasDistance;
  displayGridMajorY: NodePercentDistance | CanvasDistance;

  displayGridMinorX: NodePercentDistance | CanvasDistance;
  displayGridMinorY: NodePercentDistance | CanvasDistance;
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
  enableCanvasLayout?: Partial<CanvasLayout>;
  enableSaveZoom?: "LocalStorage" | "None" | "PipelineFlow";
  enablePanIntoViewOnOpen?: boolean;
  enableZoomIntoSubFlows?: boolean;
  enableSnapToGridType?: "During" | "None" | "After";
  enableSnapToGridX?: NodePercentDistance | CanvasDistance;
  enableSnapToGridY?: NodePercentDistance | CanvasDistance;
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
  enableParentClass?: ClassName;
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
  className?: ClassName;
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
      selectedObjectIds: CanvasObjectId[];
      mousePos: { x: CanvasCoordVal; y: CanvasCoordVal };
    }
  | {
      type: "input_port" | "output_port" | "link" | "comment";
      targetObject: Record<string, unknown>;
      selectedObjectIds: CanvasObjectId[];
      mousePos: { x: CanvasCoordVal; y: CanvasCoordVal };
    }
  | {
      type: "canvas";
      selectedObjectIds: CanvasObjectId[];
      mousePos: { x: CanvasCoordVal; y: CanvasCoordVal };
    };

/** An assorted set of additional properties that are provided when
 * an action is performed using the context menu or context toolbar.
 * The properties herein may vary, based on the action being performed.
 */
export interface ContextMenuCommonEditActionProperties {
  cmPos: { x: ViewportCoordVal; y: ViewportCoordVal };
  mousePos: { x: CanvasCoordVal; y: CanvasCoordVal };
  zoom: ScaleVal;
  addBreadcrumbs?: Breadcrumb[];
  externalPipelineFlowLoad?: boolean;
  targetObject?: CanvasNode | CanvasComment | CanvasLink;
  /** @deprecated Use targetObject.id instead */
  id?: CanvasObjectId;
  /** @deprecated Derive the type of the targetObjects some other way */
  type: "canvas" | "node" | "comment" | "link";
}

/** MoveSizeData contains the x_pos and y_pos for sizing operations
 * because object positions are based on the top-left corner of the object,
 * so any sizing event to the top or left of the object will change the
 * position as well as the size.
 */
export interface MoveSizeData {
  width: CanvasDistance;
  height: CanvasDistance;
  x_pos: CanvasCoordVal;
  y_pos: CanvasCoordVal;
}

export type ResizeNodeData = {
  isResized: boolean;
  resizeHeight: CanvasDistance;
  resizeWidth: CanvasDistance;
} & MoveSizeData;

export type ResizeCommentData = MoveSizeData;

export type MoveNodeData = {
  id: CanvasNodeId;
} & MoveSizeData;

export type MoveCommentData = {
  id: CanvasCommentId;
} & MoveSizeData;

/** ResizeNodeOrCommentData can inlclude move data as well as
 * resize data because some resize operations (such as sizing a
 * in-place supernode can result in surrounding nodes being moved.
 */
export type ResizeNodeOrCommentData =
  | ResizeNodeData
  | ResizeCommentData
  | MoveNodeData
  | MoveCommentData;

export interface MoveLinkData {
  id: CanvasLinkId;
  srcPos?: { x_pos: CanvasCoordVal, y_pos: CanvasCoordVal };
  trgPos?: { x_pos: CanvasCoordVal, y_pos: CanvasCoordVal };
}

export interface Breadcrumb {
  externalUrl?: string;
  label: string;
  pipelineId: PipelineId;
  supernodeId: CanvasNodeId;
  supernodeParentPipelineId: PipelineId;
}

export interface EditActionCreateComment extends BaseEditActionData {
  editType: "createComment"
  editSource: "contextmenu";
  comment?: CanvasComment;
  pos: { x: CanvasCoordVal; y: CanvasCoordVal };
}

export type EditActionCreateCommentContextMenu =
  EditActionCreateAutoComment
  & ContextMenuCommonEditActionProperties
  & { type: "canvas" };

export interface EditActionCreateAutoComment extends BaseEditActionData {
  editType: "createAutoComment"
  editSource: "contextmenu" | "toolbar";
  comment?: CanvasComment;
  pos: { x: CanvasCoordVal; y: CanvasCoordVal };
}

export type EditActionCreateAutoCommentContextMenu =
  EditActionCreateAutoComment
  & ContextMenuCommonEditActionProperties
  & { type: "canvas" };

export interface EditActionCreateWYSIWYGComment extends BaseEditActionData {
  editType: "createWYSIWYGComment"
  editSource: "contextmenu" | "toolbar";
  comment?: CanvasComment;
  pos: { x: CanvasCoordVal; y: CanvasCoordVal };
}

export type EditActionCreateWYSIWYGCommentContextMenu =
  EditActionCreateWYSIWYGComment
  & ContextMenuCommonEditActionProperties
  & { type: "canvas" };

export interface EditActionCreateAutoWYSIWYGComment extends BaseEditActionData {
  editType: "createAutoWYSIWYGComment"
  editSource: "contextmenu" | "toolbar";
  comment?: CanvasComment;
  pos: { x: CanvasCoordVal; y: CanvasCoordVal };
}

export type EditActionCreateAutoWYSIWYGCommentContextMenu =
  EditActionCreateAutoWYSIWYGComment
  & ContextMenuCommonEditActionProperties
  & { type: "canvas" };

export interface EditActionCreateNode extends BaseEditActionData {
  editType: "createNode";
  editSource: "canvas";
  newNode?: CanvasNode;
  nodeTemplate: CanvasNode
  offsetX: CanvasDistance,
  offsetY: CanvasDistance
}

export interface EditActionCreateAutoNode extends BaseEditActionData {
  editType: "createAutoNode";
  editSource: "canvas";
  /** Indicates whether to link the new node to a source node or not. */
  addLink: boolean;
  newLink?: CanvasLink;
  newNode?: CanvasNode;
  nodeTemplate: CanvasNode;
  offsetX: CanvasDistance;
  offsetY: CanvasDistance;
  /** The node from which a link will be created if addLink is true. */
  sourceNode: null | CanvasNode;
}

export interface EditActionMoveObjects extends BaseEditActionData {
  editType: "moveObjects";
  editSource: "canvas";
  links?: CanvasLink[];
  nodes?: CanvasNode[];
  offsetX: CanvasDistance;
  offsetY: CanvasDistance;
}

export interface EditActionLinkNodes extends BaseEditActionData {
  editType: "linkNodes";
  editSource: "canvas";
  linkIds?: CanvasLinkId[];
  linkType: "data";
  nodes: { id: CanvasNodeId, portId?: CanvasPortId }[];
  targetNodes: { id: CanvasNodeId, portId?: CanvasPortId }[];
  type: "nodeLink" | "associationLink";
}

export interface EditActionLinkComment extends BaseEditActionData {
  editType: "linkComment";
  editSource: "canvas";
  linkIds?: CanvasLinkId[];
  linkType: "comment";
  nodes: CanvasCommentId[];
  targetNodes: CanvasNodeId[];
  type: "commentLink";
}

export interface EditActionDeleteSelectedObjects extends BaseEditActionData {
  editType: "deleteSelectedObjects";
  editSource: "contextmenu" | "keyboard" | "toolbar";
}

export type EditActionDeleteSelectedObjectsContextMenu =
  EditActionDeleteSelectedObjects
  & ContextMenuCommonEditActionProperties
  & { type: "node" | "comment" | "link" }
  & { id: CanvasNodeId | CanvasCommentId |CanvasLinkId }
  & { targetObject: CanvasNode | CanvasComment | CanvasLink };

export interface EditActionDeleteLink extends BaseEditActionData {
  editType: "deleteLink";
  editSource: "contextmenu";
}

export type EditActionDeleteLinkContextMenu =
  EditActionDeleteLink
  & ContextMenuCommonEditActionProperties
  & { type: "link" }
  & { id: CanvasLinkId }
  & { targetObject: CanvasLink };

export interface EditActionSetNodeLabelEditingMode extends BaseEditActionData {
  editType: "setNodeLabelEditingMode";
  editSource: "contextmenu" | "editicon" | "textdoubleclick";
  id: CanvasNodeId;
}

export type EditActionSetNodeLabelEditingModeContextMenu =
  EditActionSetNodeLabelEditingMode
  & ContextMenuCommonEditActionProperties
  & { type: "node" }
  & { id: CanvasNodeId }
  & { targetObject: CanvasNode };


export interface EditActionSetCommentEditingMode extends BaseEditActionData {
  editType: "setCommentEditingMode";
  editSource: "contextmenu" | "textdoubleclick";
  id: CanvasCommentId;
}

export type EditActionSetCommentEditingModeContextMenu =
  EditActionSetCommentEditingMode
  & ContextMenuCommonEditActionProperties
  & { type: "comment" }
  & { id: CanvasCommentId }
  & { targetObject: CanvasComment };


export interface EditActionSetZoom extends BaseEditActionData {
  editType: "setZoom";
  editSource: "canvas";
  zoom: ZoomTransform
}

export interface EditActionResizeObjects extends BaseEditActionData {
  editType: "resizeObjects";
  editSource: "canvas";
  detachedLinksInfo: Record<CanvasLinkId, MoveLinkData[]>;
  objectsInfo: Record<CanvasNodeOrCommentId, ResizeNodeOrCommentData[]>;
}

export interface EditActionEditComment extends BaseEditActionData {
  editType: "editComment";
  editSource: "canvas";
  id: CanvasCommentId;
  content: string;
  contentType: "WYSIWYG" | undefined;
  formats?: CommentFormat[]
  height: CanvasDistance;
  width: CanvasDistance;
  x_pos: CanvasCoordVal;
  y_pos: CanvasCoordVal;
}

export interface EditActionExpandSupernodeInPlace extends BaseEditActionData {
  editType: "expandSuperNodeInPlace";
  editSource: "contextmenu";
  id: CanvasNodeId;
}

export type EditActionExpandSupernodeInPlaceContextMenu =
  EditActionExpandSupernodeInPlace
  & ContextMenuCommonEditActionProperties
  & { type: "node" }
  & { id: CanvasNodeId }
  & { targetObject: CanvasNode };

export interface EditActionCollapseSupernodeInPlace extends BaseEditActionData {
  editType: "collapseSuperNodeInPlace";
  editSource: "contextmenu";
  id: CanvasNodeId;
}

export type EditActionCollapseSupernodeContextMenu =
  EditActionCollapseSupernodeInPlace
  & ContextMenuCommonEditActionProperties
  & { type: "node" }
  & { id: CanvasNodeId }
  & { targetObject: CanvasNode };

export interface EditActionDisplaySubPipeline extends BaseEditActionData {
  editType: "displaySubPipeline";
  editSource: "contextmenu";
  id: CanvasNodeId;
}

export type EditActionDisplaySubPipelineContextMenu =
  EditActionDisplaySubPipeline
  & ContextMenuCommonEditActionProperties
  & { type: "node" }
  & { id: CanvasNodeId }
  & { targetObject: CanvasNode };

export interface EditActionDisplayPreviousPipeline extends BaseEditActionData {
  editType: "displayPreviousPipeline";
  editSource: "canvas";
  pipelineInfo: { pipelineFlowId: PipelineFlowId, pipelineId: PipelineId };
}

export interface EditActionUndo extends BaseEditActionData {
  editType: "undo";
  editSource: "toolbar" | "contextmenu" | "keyboard";
}

export type EditActionUndoContextMenu =
  EditActionUndo
  & ContextMenuCommonEditActionProperties
  & { type: "canvas" };

export interface EditActionRedo extends BaseEditActionData {
  editType: "redo";
  editSource: "toolbar" | "contextmenu" | "keyboard";
}

export type EditActionRedoContextMenu =
  EditActionRedo
  & ContextMenuCommonEditActionProperties
  & { type: "canvas" };

export interface BaseEditActionData {
  /** @deprecated */
  selectedObjectIds: CanvasObjectId[];
  selectedObjects: (CanvasNode | CanvasComment | CanvasLink)[];
  pipelineId: PipelineId;
  [key: string]: unknown;
}

export type EditActionData =
  | EditActionCreateComment
  | EditActionCreateCommentContextMenu
  | EditActionCreateAutoComment
  | EditActionCreateAutoCommentContextMenu
  | EditActionCreateWYSIWYGComment
  | EditActionCreateWYSIWYGCommentContextMenu
  | EditActionCreateAutoWYSIWYGComment
  | EditActionCreateAutoWYSIWYGCommentContextMenu
  | EditActionCreateNode
  | EditActionCreateAutoNode
  | EditActionMoveObjects
  | EditActionLinkNodes
  | EditActionLinkComment
  | EditActionDeleteSelectedObjects
  | EditActionDeleteSelectedObjectsContextMenu
  | EditActionDeleteLink
  | EditActionDeleteLinkContextMenu
  | EditActionSetNodeLabelEditingMode
  | EditActionSetNodeLabelEditingModeContextMenu
  | EditActionSetCommentEditingMode
  | EditActionSetCommentEditingModeContextMenu
  | EditActionSetZoom
  | EditActionResizeObjects
  | EditActionEditComment
  | EditActionExpandSupernodeInPlace
  | EditActionExpandSupernodeInPlaceContextMenu
  | EditActionCollapseSupernodeInPlace
  | EditActionCollapseSupernodeContextMenu
  | EditActionDisplaySubPipeline
  | EditActionDisplaySubPipelineContextMenu
  | EditActionDisplayPreviousPipeline
  | EditActionUndo
  | EditActionUndoContextMenu
  | EditActionRedo
  | EditActionRedoContextMenu;

/** EditActionCommand is provided whewn an undo or redo action is performed.
* It contains the actual action object that performs the action.
* TODO - specify EditActionCommand intefaces for each action type.
*/
export type EditActionCommand = unknown;

export type ClickActionSource =
  | {
      clickType: "DOUBLE_CLICK" | "SINGLE_CLICK" | "SINGLE_CLICK_CONTEXTMENU";
      objectType: "node" | "comment" | "canvas" | "region";
      id?: CanvasObjectId;
      selectedObjectIds: string[];
    }
  | {
      clickType: "DOUBLE_CLICK" | "SINGLE_CLICK" | "SINGLE_CLICK_CONTEXTMENU";
      objectType: "port";
      id: CanvasObjectId;
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
  selection: CanvasObjectId[];
  selectedLinks: CanvasLink[];
  selectedNodes: CanvasNode[];
  selectedComments: CanvasComment[];
  addedLinks: CanvasLink[];
  addedNodes: CanvasNode[];
  addedComments: CanvasComment[];
  deselectedLinks: CanvasLink[];
  deselectedNodes: CanvasNode[];
  deselectedComments: CanvasComment[];
  selectedPipelineId: PipelineId;
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
    object: CanvasNode | CanvasLink,
    id: DecorationId,
    pipelineId: PipelineId
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
