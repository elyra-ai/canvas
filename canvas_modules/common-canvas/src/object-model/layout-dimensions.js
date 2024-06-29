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

import { cloneDeep } from "lodash";
import {
	LINK_METHOD_FREEFORM,
	LINK_METHOD_PORTS,
	LINK_TYPE_STRAIGHT,
	LINK_DIR_LEFT_RIGHT
} from "../common-canvas/constants/canvas-constants";

const portsHorizontalDefaultLayout = {
	nodeLayout: {
		// Default node sizes. These dimensions might be overridden for nodes that have
		// more ports than will fit in the default size if inputPortAutoPosition is.
		// set to true and outputPortAutoPosition is set to true. (See below).
		defaultNodeWidth: 160,
		defaultNodeHeight: 40,

		// A space separated list of classes that will be added to the group <g>
		// DOM element for the node.
		className: "",

		// Displays the node outline shape underneath the image and label.
		nodeShapeDisplay: true,

		// Default node shape. Can be "rectangle" or "port-arcs". Used when nodeOutlineDisplay is true.
		nodeShape: "port-arcs",

		// An SVG path or a function that returns an SVG path. The paths define the node
		// shape and its selection highlighting respectively. If set to null, the paths
		// will be set by default based on the nodeShape setting.
		// If these fields are set to functions they will be called in real-time as the node
		// is being sized (provided enableResizableNodes config field is set to true).
		bodyPath: null,
		selectionPath: null,

		// Displays the external object specified, as the body of the node
		nodeExternalObject: false,

		// Display image
		imageDisplay: true,

		// Image dimensions
		imageWidth: 26,
		imageHeight: 26,

		// Image position
		imagePosition: "topLeft",
		imagePosX: 6,
		imagePosY: 7,

		// Display label
		labelDisplay: true,

		// Label dimensions
		labelWidth: 112,
		labelHeight: 19,

		// Label position
		labelPosition: "topLeft",
		labelPosX: 36,
		labelPosY: 12,

		// Label appearance
		labelEditable: false,
		labelAlign: "left", // can be "left" or "center"
		labelSingleLine: true, // false allow multi-line labels
		labelOutline: false,
		labelMaxCharacters: null, // null allows unlimited characters
		labelAllowReturnKey: false, // true allows line feed to be inserted into label, "save" to make the return key save the label.

		// An array of decorations to be applied to the node. For details see:
		// https://elyra-ai.github.io/canvas/03.04.01-decorations/
		// These are added to the node at run time and will not be saved into
		// the pipeline flow.
		decorations: [],

		// Positions and dimensions for 9 enumerated default decorator positions.
		// decoratorWidth and decoratorHeight are the dimensions of the outline
		// rectangle and decoratorPadding is the padding for the image within the
		// outline rectangle.
		decoratorTopY: 2,
		decoratorMiddleY: -8,
		decoratorBottomY: -18,

		decoratorLeftX: 2,
		decoratorCenterX: -8,
		decoratorRightX: -30,

		// Width, height and padding for image decorators
		decoratorWidth: 16,
		decoratorHeight: 16,
		decoratorPadding: 2,

		// Width and height for label decorators
		decoratorLabelWidth: 80,
		decoratorLabelHeight: 30,

		// Display drop shadow under and round the nodes
		dropShadow: true,

		// The gap between a node and its selection highlight rectangle
		nodeHighlightGap: 1,

		// The size of the node sizing area that extends around the node, over
		// which the mouse pointer will change to the sizing arrows.
		nodeSizingArea: 10,

		// Error indicator dimensions
		errorPosition: "topLeft",
		errorXPos: 24,
		errorYPos: 5,
		errorWidth: 10.5,
		errorHeight: 10.5,

		// When sizing a supernode this decides the size of the corner area for
		// diagonal sizing.
		nodeCornerResizeArea: 10,

		// What point to draw the data links from and to when enableLinkType is set
		// to "Straight" and enableLinkMethod is set to "Freeform".
		// Possible values are "image_center" or "node_center".
		drawNodeLinkLineFromTo: "node_center",

		// What point to draw the comment to node link line to. Possible values
		// are "image_center" or "node_center".
		drawCommentLinkLineTo: "node_center",

		// This is the size of the horizontal line protruding from the
		// port on the source node when drawing an elbow or straight connection line.
		minInitialLine: 30,

		// For the elbow connection type with nodes with multiple output ports,
		// this is used to increment the minInitialLine so that connection lines
		// do not overlap each other when they turn up or down after the elbow.
		minInitialLineIncrement: 8,

		// This is the minimum size of the horizontal line entering the
		// target port on the target node when drawing an Elbow connection line.
		minFinalLine: 30,

		// Display input ports.
		inputPortDisplay: true,

		// Object for input port can be "circle" or "image".
		inputPortObject: "circle",

		// If input port object is "image" use this image.
		inputPortImage: "",

		// If input port dimensions for "image".
		inputPortWidth: 12,
		inputPortHeight: 12,

		// Indicates whether multiple input ports should be automatically
		// positioned (true) or positioned based on the contents of
		// inputPortPositions array (false).
		inputPortAutoPosition: true,

		// An array of input port positions. Each element is structured like
		// this: { x_pos: 5, y_pos: 10, pos: "topLeft" }. x_pos and y_pos are
		// offsets from the pos point on the node.
		// The order of the elements corresponds to the order of ports in the
		// inputs array for the node.
		inputPortPositions: [
			{ x_pos: 0, y_pos: 20, pos: "topLeft" }
		],

		// The 'guide' is the object drawn at the mouse position as a new line
		// is being dragged outwards.
		// Object for input port guide can be "circle" or "image".
		inputPortGuideObject: "circle",

		// If input port guide object is "image" use this image.
		inputPortGuideImage: "",

		// Display output ports.
		outputPortDisplay: true,

		// Object for output port can be "circle" or "image".
		outputPortObject: "circle",

		// If output port object is "image" use this image.
		outputPortImage: "",

		// Output port dimensions for "image".
		outputPortWidth: 12,
		outputPortHeight: 12,

		// Indicates whether multiple output ports should be automatically
		// positioned (true) or positioned based on the contents of
		// outputPortPositions array (false).
		outputPortAutoPosition: true,

		// An array of output port positions. Each element is structured like
		// this: { x_pos: 5, y_pos: 10, pos: "topRight" }. x_pos and y_pos are
		// offsets from the pos point on the node.
		// The order of the elements corresponds to the order of ports in the
		// outputs array for the node.
		outputPortPositions: [
			{ x_pos: 0, y_pos: 20, pos: "topRight" }
		],

		// The 'guide' is the object drawn at the mouse position as a new line
		// is being dragged outwards.
		// Object for output port guide can be "circle" or "image".
		outputPortGuideObject: "circle",

		// If output port guide object is "image" use this image.
		outputPortGuideImage: "",

		// Automatically increases the node size to accommodate its ports so both
		// input and output ports can be shown within the dimensions of
		// the node.
		autoSizeNode: true,

		// Radius of the either the input or output ports when they are set to "circle"
		portRadius: 3,

		// Size of an offset above and below the set of port arcs.
		portArcOffset: 3,

		// Radius of an imaginary circle around the port. This controls the
		// spacing of ports and the size of port arcs when nodeShape is set to
		// port-arcs.
		portArcRadius: 6,

		// Spacing between the port arcs around the ports.
		portArcSpacing: 3,

		// Position of the context toolbar realtive to the node. Some adjustment
		// will be made to account for the width of the toolbar.
		contextToolbarPosition: "topRight",

		// Display of vertical ellipsis to show context menu
		ellipsisDisplay: true,
		ellipsisPosition: "topLeft",
		ellipsisWidth: 10,
		ellipsisHeight: 22,
		ellipsisPosX: 145,
		ellipsisPosY: 9,
		ellipsisHoverAreaPadding: 2
	},

	canvasLayout: {
		// ---------------------------------------------------------------------------
		// Layout values for supernode in-place containment area
		// ---------------------------------------------------------------------------
		supernodeLabelPosX: 30,
		supernodeLabelPosY: 4,
		supernodeLabelWidth: 50,
		supernodeLabelHeight: 20,

		supernodeImageWidth: 18,
		supernodeImageHeight: 18,
		supernodeImagePosX: 5,
		supernodeImagePosY: 4,

		supernodeEllipsisPosX: -34,
		supernodeEllipsisPosY: 2,
		supernodeEllipsisWidth: 10,
		supernodeEllipsisHeight: 20,

		supernodeExpansionIconPosX: -21,
		supernodeExpansionIconPosY: 4,
		supernodeExpansionIconHeight: 18,
		supernodeExpansionIconWidth: 18,
		supernodeExpansionIconHoverAreaPadding: 2,

		supernodeErrorPosX: -50,
		supernodeErrorPosY: 5,
		supernodeErrorWidth: 14,
		supernodeErrorHeight: 14,

		supernodeDefaultWidth: 300,
		supernodeDefaultHeight: 200,
		supernodeMinWidth: 100,
		supernodeMinHeight: 80,
		supernodeTopAreaHeight: 25,
		supernodeSVGAreaPadding: 3,
		supernodeBindingPortRadius: 6,

		// ---------------------------------------------------------------------------
		// Layout values for links
		// ---------------------------------------------------------------------------
		// Specifies which method the links will use. Either: "Ports" or "Freeform"
		linkMethod: LINK_METHOD_PORTS,

		// TODO - this should be changed to be a node layout property called 'portPlacement'
		// in the next major release.
		linkDirection: LINK_DIR_LEFT_RIGHT,

		// Whether to display a link line when linked node/comments overlap. For
		// straight links we don't want to show the link when objects overlap but
		// for ports we do.
		displayLinkOnOverlap: true,

		// The gap between node or comment and the link line.
		linkGap: 7,

		// Link decoration dimensions
		linkDecoratorHeight: 20,
		linkDecoratorWidth: 20,
		linkDecoratorPadding: 2,

		// Width and height for label decorators
		linkDecoratorLabelWidth: 80,
		linkDecoratorLabelHeight: 30,

		// Values for drawing connectors. wrapAroundSpacing and
		// wrapAroundNodePadding are used when curved connectors are drawn all the
		// way around a node. ie the target is to the right of the source.
		elbowSize: 10,
		wrapAroundSpacing: 20,
		wrapAroundNodePadding: 10,

		// This is initialized by enableLinkType in the canvas config.
		// It can be "Curve", "Elbow", Angle" or "Straight".
		linkType: "Curve",

		// Display an arrow head on the comment-to-node links. May be set to true to
		// get a default arrow head or to an SVG string for a custom arrow head.
		commentLinkArrowHead: false,

		// Display an arrow head on the data links. May be set to true to
		// get a default arrow head or to an SVG string for a custom arrow head.
		dataLinkArrowHead: false,

		// Link handle for input port can be "circle" or "image".
		linkStartHandleObject: "circle",

		// Link handle image to use when linkStartHandleObject is set to "image".
		linkStartHandleImage: "",

		// Link handle dimensions to use when linkStartHandleObject is set to "image".
		linkStartHandleWidth: 12,
		linkStartHandleHeight: 12,

		// Link handle dimensions to use when linkStartHandleObject is set to "image".
		linkStartHandleRadius: 5,

		// Link handle for input port can be "circle" or "image".
		linkEndHandleObject: "circle",

		// Link handle image to use when linkStartHandleObject is set to "image".
		linkEndHandleImage: "",

		// Link handle dimensions to use when linkStartHandleObject is set to "image".
		linkEndHandleWidth: 12,
		linkEndHandleHeight: 12,

		// Link handle dimensions to use when linkStartHandleObject is set to "image".
		linkEndHandleRadius: 5,

		// ---------------------------------------------------------------------------
		// Layout values for comments
		// ---------------------------------------------------------------------------
		// When sizing a comment this decides the size of the corner area for
		// diagonal sizing.
		commentCornerResizeArea: 10,

		// The gap between a comment and its selection highlight rectangle
		commentHighlightGap: 1,

		// The gap between a comment and its sizing area rectangle
		commentSizingArea: 10,

		// Add comment toolbar action, default offset from viewport
		addCommentOffsetX: 30,
		addCommentOffsetY: 50,

		// Comment port (circle) radius
		commentPortRadius: 5,

		// Position of the comment toolbar as an offset from the comment position
		// (which is the top left corner of the comment bounding box).
		commentToolbarPosX: -2,
		commentToolbarPosY: -36,

		// ---------------------------------------------------------------------------
		// Layout values for operations
		// ---------------------------------------------------------------------------
		// A boolean that lets applications indicate they always want to display the
		// 'back to parent flow' button in the top left corner of the canvas.
		alwaysDisplayBackToParentFlow: false,

		// The amount of padding added around the canvas objects when doing a
		// zoomToFit on the primary canvas. This may be overriden by common-canvas
		// when displaying sub-flows.
		zoomToFitPadding: 10,

		// Snap to grid type.
		snapToGridType: "None",

		// Sizes of snap to grid as a percentage of default node height and width
		snapToGridX: "20%",
		snapToGridY: "33.33%",

		// Indicates the proximity to a node, when dragging a new connection,
		// to switch the data-new-link-over attribute to "yes".
		nodeProximity: 20,

		// Adds additional area around the ghost area dragged from the palette
		// which can increase the possibility of detecting detached links.
		ghostAreaPadding: 10,

		// Offsets the canvas objects within the canvas viewport area when the
		// canvas is first opened.
		initialPanX: null,
		initialPanY: null,

		// Values for AutoLayout and AutoNode function
		autoLayoutInitialMarginX: 50,
		autoLayoutInitialMarginY: 50,
		autoLayoutVerticalSpacing: 80,
		autoLayoutHorizontalSpacing: 80 // For horizontal layout, this may be overriden by space for connections
	}
};

const portsVerticalDefaultLayout = {
	nodeLayout: {
		// Default node sizes. These dimensions might be overridden for nodes that have
		// more ports than will fit in the default size if inputPortAutoPosition is.
		// set to true and outputPortAutoPosition is set to true. (See below).
		defaultNodeWidth: 70,
		defaultNodeHeight: 75,

		// A space separated list of classes that will be added to the group <g>
		// DOM element for the node.
		className: "",

		// Displays the node outline shape underneath the image and label.
		nodeShapeDisplay: true,

		// Default node shape. Can be "rectangle" or "port-arcs". Used when nodeOutlineDisplay is true.
		nodeShape: "rectangle",

		// An SVG path or a function that returns an SVG path. The paths define the node
		// shape and its selection highlighting respectively. If set to null, the paths
		// will be set by default based on the nodeShape setting.
		// If these fields are set to functions they will be called in real-time as the node
		// is being sized (provided enableResizableNodes config field is set to true).
		bodyPath: null,
		selectionPath: null,

		// Displays the external object specified, as the body of the node
		nodeExternalObject: false,

		// Display image
		imageDisplay: true,

		// Image dimensions
		imageWidth: 48,
		imageHeight: 48,

		// Image position
		imagePosition: "topLeft",
		imagePosX: 11,
		imagePosY: 6,

		// Display label
		labelDisplay: true,

		// Label dimensions
		labelWidth: 72,
		labelHeight: 19,

		// Label position
		labelPosition: "topLeft",
		labelPosX: 35,
		labelPosY: 55,

		// Label appearance
		labelEditable: false,
		labelAlign: "center", // can be "left" or "center"
		labelSingleLine: true, // false allow multi-line labels
		labelOutline: false,
		labelMaxCharacters: null, // null allows unlimited characters
		labelAllowReturnKey: false, // true allows line feed to be inserted into label, "save" to make the return key save the label.

		// An array of decorations to be applied to the node. For details see:
		// https://elyra-ai.github.io/canvas/03.04.01-decorations/
		// These are added to the node at run time and will not be saved into
		// the pipeline flow.
		decorations: [],

		// Positions and dimensions for 9 enumerated default decorator positions.
		// decoratorWidth and decoratorHeight are the dimensions of the outline
		// rectangle and decoratorPadding is the padding for the image within the
		// outline rectangle.
		decoratorTopY: 5,
		decoratorMiddleY: -8,
		decoratorBottomY: -34,

		decoratorLeftX: 10,
		decoratorCenterX: -8,
		decoratorRightX: -24,

		// Width, height and padding for image decorators
		decoratorWidth: 16,
		decoratorHeight: 16,
		decoratorPadding: 2,

		// Width and height for label decorators
		decoratorLabelWidth: 80,
		decoratorLabelHeight: 30,

		// Display drop shadow under and round the nodes
		dropShadow: false,

		// The gap between a node and its selection highlight rectangle
		nodeHighlightGap: 4,

		// The size of the node sizing area that extends around the node, over
		// which the mouse pointer will change to the sizing arrows.
		nodeSizingArea: 10,

		// Error indicator dimensions
		errorPosition: "topLeft",
		errorXPos: 45,
		errorYPos: 5,
		errorWidth: 14,
		errorHeight: 14,

		// When sizing a supernode this decides the size of the corner area for
		// diagonal sizing.
		nodeCornerResizeArea: 10,

		// What point to draw the data links from and to when enableLinkType is set
		// to "Straight" and enableLinkMethod is set to "Freeform".
		// Possible values are "image_center" or "node_center".
		drawNodeLinkLineFromTo: "node_center",

		// What point to draw the comment to node link line to. Possible values
		// are "image_center" or "node_center".
		drawCommentLinkLineTo: "node_center",

		// This is the size of the horizontal line protruding from the
		// port on the source node when drawing an elbow or straight connection line.
		minInitialLine: 30,

		// For the elbow connection type with nodes with multiple output ports,
		// this is used to increment the minInitialLine so that connection lines
		// do not overlap each other when they turn up or down after the elbow.
		minInitialLineIncrement: 8,

		// This is the minimum size of the horizontal line entering the
		// target port on the target node when drawing an Elbow connection line.
		minFinalLine: 30,

		// Display input ports.
		inputPortDisplay: true,

		// Object for input port can be "circle" or "image".
		inputPortObject: "circle",

		// If input port object is "image" use this image.
		inputPortImage: "",

		// If input port dimensions for "image".
		inputPortWidth: 12,
		inputPortHeight: 12,

		// Indicates whether multiple input ports should be automatically
		// positioned (true) or positioned based on the contents of
		// inputPortPositions array (false).
		inputPortAutoPosition: true,

		// An array of input port positions. Each element is structured like
		// this: { x_pos: 5, y_pos: 10, pos: "topLeft" }. x_pos and y_pos are
		// offsets from the pos point on the node.
		// The order of the elements corresponds to the order of ports in the
		// inputs array for the node.
		inputPortPositions: [
			{ x_pos: 0, y_pos: 29, pos: "topLeft" }
		],

		// The 'guide' is the object drawn at the mouse position as a new line
		// is being dragged outwards.
		// Object for input port guide can be "circle" or "image".
		inputPortGuideObject: "circle",

		// If input port guide object is "image" use this image.
		inputPortGuideImage: "",

		// Display output ports.
		outputPortDisplay: true,

		// Object for output port can be "circle" or "image".
		outputPortObject: "circle",

		// If output port object is "image" use this image.
		outputPortImage: "",

		// Output port dimensions for "image".
		outputPortWidth: 12,
		outputPortHeight: 12,

		// Indicates whether multiple output ports should be automatically
		// positioned (true) or positioned based on the contents of
		// outputPortPositions array (false).
		outputPortAutoPosition: true,

		// An array of output port positions. Each element is structured like
		// this: { x_pos: 5, y_pos: 10, pos: "topRight" }. x_pos and y_pos are
		// offsets from the pos point on the node.
		// The order of the elements corresponds to the order of ports in the
		// outputs array for the node.
		outputPortPositions: [
			{ x_pos: 0, y_pos: 29, pos: "topRight" }
		],

		// The 'guide' is the object drawn at the mouse position as a new line
		// is being dragged outwards.
		// Object for output port guide can be "circle" or "image".
		outputPortGuideObject: "circle",

		// If output port guide object is "image" use this image.
		outputPortGuideImage: "",

		// Automatically increases the node size to accommodate its ports so both
		// input and output ports can be shown within the dimensions of
		// the node.
		autoSizeNode: true,

		// Radius of the either the input or output ports when they are set to "circle"
		portRadius: 6,

		// Size of an offset above and below the set of port arcs.
		portArcOffset: 0,

		// Radius of an imaginary circle around the port. This controls the
		// spacing of ports and the size of port arcs when nodeShape is set to
		// port-arcs.
		portArcRadius: 10,

		// Spacing between the port arcs around the ports.
		portArcSpacing: 0,

		// Position of the context toolbar realtive to the node. Some adjustment
		// will be made to account for the width of the toolbar.
		contextToolbarPosition: "topCenter",

		// Display of vertical ellipsis to show context menu
		ellipsisDisplay: true,
		ellipsisPosition: "topLeft",
		ellipsisWidth: 11,
		ellipsisHeight: 21,
		ellipsisPosX: 57,
		ellipsisPosY: 4,
		ellipsisHoverAreaPadding: 2
	},

	canvasLayout: {
		// ---------------------------------------------------------------------------
		// Layout values for supernode in-place containment area
		// ---------------------------------------------------------------------------
		supernodeLabelPosX: 30,
		supernodeLabelPosY: 4,
		supernodeLabelWidth: 50,
		supernodeLabelHeight: 20,

		supernodeImageWidth: 18,
		supernodeImageHeight: 18,
		supernodeImagePosX: 5,
		supernodeImagePosY: 4,

		supernodeEllipsisPosX: -34,
		supernodeEllipsisPosY: 2,
		supernodeEllipsisWidth: 10,
		supernodeEllipsisHeight: 20,

		supernodeExpansionIconPosX: -21,
		supernodeExpansionIconPosY: 4,
		supernodeExpansionIconHeight: 18,
		supernodeExpansionIconWidth: 18,
		supernodeExpansionIconHoverAreaPadding: 2,

		supernodeErrorPosX: -50,
		supernodeErrorPosY: 5,
		supernodeErrorWidth: 14,
		supernodeErrorHeight: 14,

		supernodeDefaultWidth: 200,
		supernodeDefaultHeight: 200,
		supernodeMinWidth: 100,
		supernodeMinHeight: 80,
		supernodeTopAreaHeight: 25,
		supernodeSVGAreaPadding: 3,
		supernodeBindingPortRadius: 10,

		// ---------------------------------------------------------------------------
		// Layout values for links
		// ---------------------------------------------------------------------------
		// Specifies which method the links will use. Either: "Ports" or "Freeform"
		linkMethod: LINK_METHOD_PORTS,

		// Specifies the default placement of ports on a node.
		// TODO - this should be changed to be a node layout property called 'portPlacement'
		// in the next major release.
		linkDirection: LINK_DIR_LEFT_RIGHT,

		// Whether to display a link line when linked node/comments overlap. For
		// straight links we don't want to show the link when objects overlap but
		// for ports we do.
		displayLinkOnOverlap: true,

		// The gap between node or comment and the link line.
		linkGap: 7,

		// Link decoration dimensions
		linkDecoratorHeight: 20,
		linkDecoratorWidth: 20,
		linkDecoratorPadding: 2,

		// Width and height for label decorators
		linkDecoratorLabelWidth: 80,
		linkDecoratorLabelHeight: 30,

		// Values for drawing connectors. wrapAroundSpacing and
		// wrapAroundNodePadding are used when curved connectors are drawn all the
		// way around a node. ie the target is to the right of the source.
		elbowSize: 10,
		wrapAroundSpacing: 20,
		wrapAroundNodePadding: 10,

		// This is initialized by enableLinkType in the canvas config.
		// It can be "Curve", "Elbow", Angle" or "Straight".
		linkType: "Curve",

		// Display an arrow head on the comment-to-node links. May be set to true to
		// get a default arrow head or to an SVG string for a custom arrow head.
		commentLinkArrowHead: false,

		// Display an arrow head on the data links. May be set to true to
		// get a default arrow head or to an SVG string for a custom arrow head.
		dataLinkArrowHead: false,

		// Link handle for input port can be "circle" or "image".
		linkStartHandleObject: "circle",

		// Link handle image to use when linkStartHandleObject is set to "image".
		linkStartHandleImage: "",

		// Link handle dimensions to use when linkStartHandleObject is set to "image".
		linkStartHandleWidth: 12,
		linkStartHandleHeight: 12,

		// Link handle dimensions to use when linkStartHandleObject is set to "image".
		linkStartHandleRadius: 6,

		// Link handle for input port can be "circle" or "image".
		linkEndHandleObject: "circle",

		// Link handle image to use when linkStartHandleObject is set to "image".
		linkEndHandleImage: "",

		// Link handle dimensions to use when linkStartHandleObject is set to "image".
		linkEndHandleWidth: 12,
		linkEndHandleHeight: 12,

		// Link handle dimensions to use when linkStartHandleObject is set to "image".
		linkEndHandleRadius: 6,

		// ---------------------------------------------------------------------------
		// Layout values for comments
		// ---------------------------------------------------------------------------
		// When sizing a comment this decides the size of the corner area for
		// diagonal sizing.
		commentCornerResizeArea: 10,

		// The gap between a comment and its selection highlight rectangle
		commentHighlightGap: 4,

		// The gap between a comment and its sizing area rectangle
		commentSizingArea: 10,

		// Add comment toolbar action, default offset from viewport
		addCommentOffsetX: 30,
		addCommentOffsetY: 50,

		// Comment port (circle) radius
		commentPortRadius: 5,

		// Position of the comment toolbar as an offset from the comment position
		// (which is the top left corner of the comment bounding box).
		commentToolbarPosX: -2,
		commentToolbarPosY: -36,

		// ---------------------------------------------------------------------------
		// Layout values for operations
		// ---------------------------------------------------------------------------
		// A boolean that lets applications indicate they always want to display the
		// 'back to parent flow' button in the top left corner of the canvas.
		alwaysDisplayBackToParentFlow: false,

		// The amount of padding added around the canvas objects when doing a
		// zoomToFit on the primary canvas. This may be overriden by common-canvas
		// when displaying sub-flows.
		zoomToFitPadding: 10,

		// Snap to grid type.
		snapToGridType: "None",

		// Sizes of snap to grid as a percentage of default node height and width
		snapToGridX: "25%",
		snapToGridY: "20%",

		// Indicates the proximity to a node, when dragging a new connection,
		// to switch the data-new-link-over attribute to "yes".
		nodeProximity: 20,

		// Adds additional area around the ghost area dragged from the palette
		// which can increase the possibility of detecting detached links.
		ghostAreaPadding: 10,

		// Offsets the canvas objects within the canvas viewport area when the
		// canvas is first opened.
		initialPanX: null,
		initialPanY: null,

		// Values for AutoLayout and AutoNode function
		autoLayoutInitialMarginX: 50,
		autoLayoutInitialMarginY: 50,
		autoLayoutVerticalSpacing: 80,
		autoLayoutHorizontalSpacing: 80 // For horizontal layout, this may be overriden by space for connections
	}
};


export default class LayoutDimensions {
	static getLayout(config, overlayLayout = {}) {
		let newLayout = this.getDefaultLayout(config);

		if (config) {
			newLayout = this.overridePortPositions(newLayout, config); // Must do this before overrideNodeLayout
			newLayout = this.overrideNodeLayout(newLayout, overlayLayout); // Must do this before overrideSnapToGrid
			newLayout = this.overrideCanvasLayout(newLayout, config, overlayLayout);
			newLayout = this.overrideLinkType(newLayout, config);
			newLayout = this.overrideSnapToGrid(newLayout, config);
			newLayout = this.overrideAutoLayout(newLayout, config);
			newLayout = this.overrideArrowHead(newLayout, config);
		}
		return newLayout;
	}

	static getDefaultLayout(config) {
		let defaultLayout;
		if (config && config.enableNodeFormatType === "Vertical") {
			defaultLayout = portsVerticalDefaultLayout;

		} else {
			defaultLayout = portsHorizontalDefaultLayout;
		}
		return cloneDeep(defaultLayout);
	}

	static overrideNodeLayout(layout, overlayLayout) {
		layout.nodeLayout = Object.assign({}, layout.nodeLayout, overlayLayout.nodeLayout || {});

		return layout;
	}

	static overrideCanvasLayout(layout, config, overlayLayout) {
		// TODO - In a future major release the enableStraightLinksAsFreeform field should be
		// removed and this ovverride code should be returned to its original behavior where
		// config.enableLinkMethod should directly override linkMethod in the canvasLayout.
		const linkMethod = (config.enableLinkType === "Straight" && config.enableStraightLinksAsFreeform)
			? LINK_METHOD_FREEFORM
			: config.enableLinkMethod;

		const linkDirection = config.enableLinkDirection;

		layout.canvasLayout = Object.assign({}, layout.canvasLayout, { linkMethod, linkDirection }, overlayLayout.canvasLayout || {});

		return layout;
	}

	// Overrides the input layout objects with any link type provided by the
	// config object.
	static overrideLinkType(layout, config) {
		layout.canvasLayout.linkType = config.enableLinkType || layout.canvasLayout.linkType || "Curve";

		return layout;
	}

	// Overrides the snap-to-grid values in the layout object with any
	// snap-to-grid values provided in the config object.
	static overrideSnapToGrid(layout, config) {
		if (config.enableSnapToGridType) {
			layout.canvasLayout.snapToGridType = config.enableSnapToGridType;
		}

		// Snap to grid configuration. 25% for X and 20% for Y (of node width and
		// height) by default. It can be overridden by the config which can be either
		// a number or a percentage of the node width/height.
		layout.canvasLayout.snapToGridX = config.enableSnapToGridX || layout.canvasLayout.snapToGridX || "25%";
		layout.canvasLayout.snapToGridY = config.enableSnapToGridY || layout.canvasLayout.snapToGridY || "20%";

		// Set the snap-to-grid sizes in pixels.
		layout.canvasLayout.snapToGridXPx = this.getSnapToGridSize(layout.canvasLayout.snapToGridX, layout.nodeLayout.defaultNodeWidth);
		layout.canvasLayout.snapToGridYPx = this.getSnapToGridSize(layout.canvasLayout.snapToGridY, layout.nodeLayout.defaultNodeHeight);

		return layout;
	}

	// Overrides the auto-layout values in the layout object with any
	// auto-layout values provided in the config object.
	static overrideAutoLayout(layout, config) {
		layout.canvasLayout.autoLayoutVerticalSpacing = this.getAutoLayoutSpacing(config.enableAutoLayoutVerticalSpacing, layout.canvasLayout.autoLayoutVerticalSpacing);
		layout.canvasLayout.autoLayoutHorizontalSpacing = this.getAutoLayoutSpacing(config.enableAutoLayoutHorizontalSpacing, layout.canvasLayout.autoLayoutHorizontalSpacing);

		return layout;
	}

	static getAutoLayoutSpacing(configAutoLayoutSpacing, layoutAutoLayoutSpacing) {
		let spacing = 80;
		if (typeof configAutoLayoutSpacing !== "undefined" && configAutoLayoutSpacing !== null) {
			spacing = configAutoLayoutSpacing;
		} else if (typeof layoutAutoLayoutSpacing !== "undefined" && layoutAutoLayoutSpacing !== null) {
			spacing = layoutAutoLayoutSpacing;
		}
		return spacing;
	}

	// Returns a snap-to-grid size in pixels based on the snapToGridSizeStr
	// which can be either a numeric value (which is taken as the nuber of pixels)
	// or a numeric value with a % sign at the end which is taken as the percentage
	// of the defaultNodeSize passed in.
	static getSnapToGridSize(snapToGridSizeStr, defaultNodeSize) {
		if (snapToGridSizeStr.endsWith("%")) {
			return (Number.parseInt(snapToGridSizeStr, 10) / 100) * defaultNodeSize;
		}
		return Number.parseInt(snapToGridSizeStr, 10);
	}

	// Overrides the port positioning fields in the layout based on the type of node
	// and the link direction.
	static overridePortPositions(layout, config) {
		if (config.enableLinkDirection === "BottomTop") {
			layout.nodeLayout.inputPortPositions = [
				{ x_pos: 0, y_pos: 0, pos: "bottomCenter" }
			];
			layout.nodeLayout.outputPortPositions = [
				{ x_pos: 0, y_pos: 0, pos: "topCenter" }
			];

		} else if (config.enableLinkDirection === "TopBottom") {
			layout.nodeLayout.inputPortPositions = [
				{ x_pos: 0, y_pos: 0, pos: "topCenter" }
			];
			layout.nodeLayout.outputPortPositions = [
				{ x_pos: 0, y_pos: 0, pos: "bottomCenter" }
			];

		} else if (config.enableLinkDirection === "RightLeft") {
			const yPos = layout.nodeLayout.inputPortPositions[0].y_pos;
			layout.nodeLayout.inputPortPositions = [
				{ x_pos: 0, y_pos: yPos, pos: "topRight" }
			];
			layout.nodeLayout.outputPortPositions = [
				{ x_pos: 0, y_pos: yPos, pos: "topLeft" }
			];
		}
		return layout;
	}

	// Sets the default arrow head for node (data) links to true for freeform links.
	// TODO -- the second part of this if should be removed when enableStraightLinksAsFreeform
	// is removed in the next major release.
	static overrideArrowHead(layout, config) {
		if ((config.enableLinkMethod === LINK_METHOD_FREEFORM ||
				(config.enableStraightLinksAsFreeform && config.enableLinkType === LINK_TYPE_STRAIGHT)) &&
				!layout.canvasLayout.dataLinkArrowHead) {
			layout.canvasLayout.dataLinkArrowHead = true;
		}
		return layout;
	}
}
