/*
 * Copyright 2017-2020 IBM Corporation
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

const haloDefaultLayout = {
	nodeLayout: {
		// Node format specifies whether the image and label are arranged side by side
		// (horizontal) or with the image above the label (vertical).
		nodeFormatType: "vertical",

		// Default node sizes. The height might be overridden for nodes with more ports
		// than will fit in the default size.
		defaultNodeWidth: 60,
		defaultNodeHeight: 66,

		// Default node shape
		nodeShape: "rectangle",

		// SVG path strings to define the shape of your node and its
		// selection highlighting. If set to null the paths will be set by default
		// based on the nodeShape setting.
		bodyPath: null,
		selectionPath: null,

		// Display image
		imageDisplay: true,

		// Image dimensions
		imageWidth: 48,
		imageHeight: 48,

		// Image position
		imagePosX: 6,
		imagePosY: 0,

		// Sets the justification of label and icon within the node height. This
		// overrides any labelPosY value provided. Possible value are "center" or
		// "none". Specify "none" to use the labelPosY and imagePosY values.
		labelAndIconVerticalJustification: "none",

		// Label dimensions used for automatically trimming the label to add ...
		labelMaxWidth: 52,

		// Label height used for automatically positioning the label
		labelHeight: 13, // Should match the font size specified in common-canvas-d3.scss

		// The underhang of letters below the baseline for the label font used
		labelDescent: 3, // Should match the font size specified in common-canvas-d3.scss

		// Label position
		labelPosX: 30,
		labelPosY: 63,

		// An array of decorations to be applied to the node. For details see:
		// https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/wiki/2.4.2-Decoration-Specification
		decorations: [],

		// Positions and dimensions for 9 enumerated default decorator positions.
		// decoratorWidth and decoratorHeight are the dimensions of the outline
		// rectangle and decoratorPadding is the padding for the image within the
		// outline rectangle.
		decoratorTopY: 0,
		decoratorMiddleY: -8,
		decoratorBottomY: -32,

		decoratorLeftX: 6,
		decoratorCenterX: -8,
		decoratorRightX: -22,

		decoratorWidth: 16,
		decoratorHeight: 16,

		decoratorPadding: 2,

		// Display drop shadow under and round the nodes
		dropShadow: false,

		// The gap between a node and its selection highlight rectangle
		nodeHighlightGap: 4,

		// The size of the node sizing area that extends around the node, over
		// which the mouse pointer will change to the sizing arrows.
		nodeSizingArea: 10,

		// Error indicator dimensions
		errorXPos: 52,
		errorYPos: 0,
		errorWidth: 14,
		errorHeight: 14,

		// When sizing a supernode this decides the size of the corner area for
		// diagonal sizing.
		nodeCornerResizeArea: 10,

		// Node Halo settings
		haloDisplay: true,
		haloCenterX: 30,
		haloCenterY: 24,
		haloRadius: 29,

		// What point to draw 'halo' style link lines from and to. Possible values
		// are "image_center" or "node_center". This is used for node to node links.
		drawNodeLinkLineFromTo: "image_center",

		// What point to draw the comment to node link line to. Possible values
		// are "image_center" or "node_center".
		drawCommentLinkLineTo: "image_center",

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

		// Position of left single input port. Multiple input ports will be
		// automatically positioned with the Y coordinate being overriden. These
		// values are an offset from the top left corner of the node outline.
		// Used when linkDirection is "LeftRight".
		inputPortLeftPosX: null,
		inputPortLeftPosY: null,

		// Position of top single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the top left corner of the node outline.
		// Used when linkDirection is "TopBottom".
		inputPortTopPosX: null,
		inputPortTopPosY: null,

		// Position of bottom single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the bottom left corner of the node outline.
		// Used when linkDirection is "BottomTop".
		inputPortBottomPosX: null,
		inputPortBottomPosY: null,

		// 'Connector' is the object drawn at the mouse position as a new line
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

		// Position of right single input port. Multiple input ports will be
		// automatically positioned with the Y coordinate being overriden. These
		// values are an offset from the top right corner of the node outline.
		// Used when linkDirection is "LeftRight".
		outputPortRightPosX: null,
		outputPortRightPosY: null,

		// Position of top single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the top left corner of the node outline.
		// Used when linkDirection is "BottomTop".
		outputPortTopPosX: null,
		outputPortTopPosY: null,

		// Position of bottom single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the bottom left corner of the node outline.
		// Used when linkDirection is "TopBottom".
		outputPortBottomPosX: null,
		outputPortBottomPosY: null,

		// The 'guide' is the object drawn at the mouse position as a new line
		// is being dragged outwards.
		// Object for output port guide can be "circle" or "image".
		outputPortGuideObject: "circle",

		// If output port guide object is "image" use this image.
		outputPortGuideImage: "",

		// Radius of the either the input or output ports when they are set to "circle"
		portRadius: null,

		// Size of an offset above and below the set of port arcs.
		portArcOffset: null,

		// Radius of an imaginary circle around the port. This controls the
		// spacing of ports and the size of port arcs when nodeShape is set to
		// port-arcs.
		portArcRadius: null,

		// Spacing between the port arcs around the ports.
		portArcSpacing: null,

		// Display of vertical ellipsis to show context menu
		ellipsisDisplay: false,
		ellipsisWidth: 10,
		ellipsisHeight: 22,
		ellipsisPosX: 145,
		ellipsisPosY: 9,
		ellipsisHoverAreaPadding: 2
	},

	canvasLayout: {
		// The amount of padding added around the canvas objects when doing a
		// zoomToFit on the primary canvas. This may be overriden by common-canvas
		// when displaying sub-flows.
		zoomToFitPadding: 10,

		// Supernode in-place containment area attributes
		supernodeLabelPosX: 30,
		supernodeLabelPosY: 18,
		supernodeImageWidth: 18,
		supernodeImageHeight: 18,
		supernodeImagePosX: 5,
		supernodeImagePosY: 4,
		supernodeEllipsisPosY: 2,
		supernodeEllipsisWidth: 10,
		supernodeEllipsisHeight: 20,
		supernodeExpansionIconPosY: 4,
		supernodeExpansionIconHeight: 18,
		supernodeExpansionIconWidth: 18,
		supernodeExpansionIconHoverAreaPadding: 2,
		supernodeIconSeparation: 3,
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
		// Connection type decides whether the node to node connections use the
		// 'halo' connection mechanism and arrows pointing directly from source to
		// target or the 'ports' connections with connection lines draw from output
		// ports to input ports.
		connectionType: "halo",

		// Specifies which direction the nodes will be linked up
		linkDirection: "LeftRight",

		// Whether to display a link line when linked node/comments overlap. For halo
		// we don't want to show the link when objects overlap but for ports we do.
		displayLinkOnOverlap: false,

		// The gap between node or comment and the link line.
		linkGap: 7,

		// Link decoration dimensions
		linkDecoratorHeight: 20,
		linkDecoratorWidth: 20,
		linkDecoratorPadding: 2,

		// Values for drawing connectors. wrapAroundSpacing and
		// wrapAroundNodePadding are used when curved connectors are drawn all the
		// way around a node. ie the target is to the right of the source.
		elbowSize: 10,
		wrapAroundSpacing: 20,
		wrapAroundNodePadding: 10,

		// This can be overrriden from common-canvas config properties
		linkType: "Straight",

		// Display an arrow head on the comment-to-node links
		commentLinkArrowHead: true,

		// Display an arrow head on the data links
		dataLinkArrowHead: true,

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

		// The gap between the edge of the comment rectangle and the comment text.
		commentWidthPadding: 10,
		commentHeightPadding: 8,

		// Add comment toolbar action, default offset from viewport
		addCommentOffset: 30,

		// Comment port (circle) radius
		commentPortRadius: null,

		// Comment Halo size
		haloCommentGap: 11, // Gap between comment rectangle and its halo

		// ---------------------------------------------------------------------------
		// Layout values for operations
		// ---------------------------------------------------------------------------
		// Snap to grid type.
		snapToGridType: "None",

		// Sizes of snap to grid as a percentage of default node height and width
		snapToGridX: "25%",
		snapToGridY: "20%",

		// Values for AutoLayout and AutoNode function
		autoLayoutInitialMarginX: 50,
		autoLayoutInitialMarginY: 50,
		autoLayoutVerticalSpacing: 80,
		autoLayoutHorizontalSpacing: 80 // For horizontal layout, this may be overriden by space for connections
	}
};

const portsHorizontalDefaultLayout = {
	nodeLayout: {
		// Node format specifies whether the image and label are arranged side by side
		// (horizontal) or with the image above the label (vertical).
		nodeFormatType: "horizontal",

		// Default node sizes. The height might be overridden for nodes with more ports
		// than will fit in the default size.
		defaultNodeWidth: 160,
		defaultNodeHeight: 40,

		// Default node shape
		nodeShape: "port-arcs",

		// SVG path strings to define the shape of your node and its
		// selection highlighting. If set to null the paths will be set by default
		// based on the nodeShape setting.
		bodyPath: null,
		selectionPath: null,

		// Display image
		imageDisplay: true,

		// Image dimensions
		imageWidth: 26,
		imageHeight: 26,

		// Image position
		imagePosX: 6,
		imagePosY: 7,

		// Sets the justification of label and icon within the node height. This
		// overrides any labelPosY value provided. Possible value are "center" or
		// "none". Specify "none" to use the labelPosY value.
		labelAndIconVerticalJustification: "center",

		// Label dimensions used for automatically trimming the label to add ...
		labelMaxWidth: 104,

		// Label height used for automatically positioning the label
		labelHeight: 12, // Should match the font size specified in common-canvas-d3.scss

		// The underhang of letters below the baseline for the label font used
		labelDescent: 3, // Should match the font size specified in common-canvas-d3.scss

		// Label position
		labelPosX: 38,
		labelPosY: 24,

		// An array of decorations to be applied to the node. For details see:
		// https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/wiki/2.4.2-Decoration-Specification
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

		decoratorWidth: 16,
		decoratorHeight: 16,

		decoratorPadding: 2,

		// Display drop shadow under and round the nodes
		dropShadow: true,

		// The gap between a node and its selection highlight rectangle
		nodeHighlightGap: 1,

		// The size of the node sizing area that extends around the node, over
		// which the mouse pointer will change to the sizing arrows.
		nodeSizingArea: 10,

		// Error indicator dimensions
		errorXPos: 24,
		errorYPos: 10,
		errorWidth: 10.5,
		errorHeight: 10.5,

		// When sizing a supernode this decides the size of the corner area for
		// diagonal sizing.
		nodeCornerResizeArea: 10,

		// Node Halo settings
		haloDisplay: false,
		haloCenterX: null,
		haloCenterY: null,
		haloRadius: null,

		// What point to draw 'halo' style link lines from and to. Possible values
		// are "image_center" or "node_center". This is used for node to node links.
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

		// Position of left single input port. Multiple input ports will be
		// automatically positioned with the Y coordinate being overriden. These
		// values are an offset from the top left corner of the node outline.
		// Used when linkDirection is "LeftRight".
		inputPortLeftPosX: 0,
		inputPortLeftPosY: 20,

		// Position of top single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the top left corner of the node outline.
		// Used when linkDirection is "TopBottom".
		inputPortTopPosX: 80,
		inputPortTopPosY: 0,

		// Position of bottom single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the bottom left corner of the node outline.
		// Used when linkDirection is "BottomTop".
		inputPortBottomPosX: 80,
		inputPortBottomPosY: 0,

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

		// Position of right single input port. Multiple input ports will be
		// automatically positioned with the Y coordinate being overriden. These
		// values are an offset from the top right corner of the node outline.
		// Used when linkDirection is "LeftRight".
		outputPortRightPosX: 0,
		outputPortRightPosY: 20,

		// Position of top single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the top left corner of the node outline.
		// Used when linkDirection is "BottomTop".
		outputPortTopPosX: 80,
		outputPortTopPosY: 0,

		// Position of bottom single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the bottom left corner of the node outline.
		// Used when linkDirection is "TopBottom".
		outputPortBottomPosX: 80,
		outputPortBottomPosY: 0,

		// The 'guide' is the object drawn at the mouse position as a new line
		// is being dragged outwards.
		// Object for output port guide can be "circle" or "image".
		outputPortGuideObject: "circle",

		// If output port guide object is "image" use this image.
		outputPortGuideImage: "",

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

		// Display of vertical ellipsis to show context menu
		ellipsisDisplay: true,
		ellipsisWidth: 10,
		ellipsisHeight: 22,
		ellipsisPosX: 145,
		ellipsisPosY: 9,
		ellipsisHoverAreaPadding: 2
	},

	canvasLayout: {
		// The amount of padding added around the canvas objects when doing a
		// zoomToFit on the primary canvas. This may be overriden by common-canvas
		// when displaying sub-flows.
		zoomToFitPadding: 10,

		// Supernode in-place containment area attributes
		supernodeLabelPosX: 30,
		supernodeLabelPosY: 18,
		supernodeImageWidth: 18,
		supernodeImageHeight: 18,
		supernodeImagePosX: 5,
		supernodeImagePosY: 4,
		supernodeEllipsisPosY: 2,
		supernodeEllipsisWidth: 10,
		supernodeEllipsisHeight: 20,
		supernodeExpansionIconPosY: 4,
		supernodeExpansionIconHeight: 18,
		supernodeExpansionIconWidth: 18,
		supernodeExpansionIconHoverAreaPadding: 2,
		supernodeIconSeparation: 3,
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
		// Connection type decides whether the node to node connections use the
		// 'halo' connection mechanism and arrows pointing directly from source to
		// target or the 'ports' connections with connection lines draw from output
		// ports to input ports.
		connectionType: "ports",

		// Specifies which direction the nodes will be linked up
		linkDirection: "LeftRight",

		// Whether to display a link line when linked node/comments overlap. For halo
		// we don't want to show the link when objects overlap but for ports we do.
		displayLinkOnOverlap: true,

		// The gap between node or comment and the link line.
		linkGap: 7,

		// Link decoration dimensions
		linkDecoratorHeight: 20,
		linkDecoratorWidth: 20,
		linkDecoratorPadding: 2,

		// Values for drawing connectors. wrapAroundSpacing and
		// wrapAroundNodePadding are used when curved connectors are drawn all the
		// way around a node. ie the target is to the right of the source.
		elbowSize: 10,
		wrapAroundSpacing: 20,
		wrapAroundNodePadding: 10,

		// This can be overrriden from common-canvas config properties
		linkType: "Curve",

		// Display an arrow head on the comment-to-node links
		commentLinkArrowHead: false,

		// Display an arrow head on the data links
		dataLinkArrowHead: false,

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

		// The gap between the edge of the comment rectangle and the comment text.
		commentWidthPadding: 10,
		commentHeightPadding: 8,

		// Add comment toolbar action, default offset from viewport
		addCommentOffset: 30,

		// Comment port (circle) radius
		commentPortRadius: 5,

		// Comment Halo size
		haloCommentGap: null, // Gap between comment rectangle and its halo

		// ---------------------------------------------------------------------------
		// Layout values for operations
		// ---------------------------------------------------------------------------
		// Snap to grid type.
		snapToGridType: "None",

		// Sizes of snap to grid as a percentage of default node height and width
		snapToGridX: "20%",
		snapToGridY: "33.33%",

		// Values for AutoLayout and AutoNode function
		autoLayoutInitialMarginX: 50,
		autoLayoutInitialMarginY: 50,
		autoLayoutVerticalSpacing: 80,
		autoLayoutHorizontalSpacing: 80 // For horizontal layout, this may be overriden by space for connections
	}
};

const portsVerticalDefaultLayout = {
	nodeLayout: {
		// Node format specifies whether the image and label are arranged side by side
		// (horizontal) or with the image above the label (vertical).
		nodeFormatType: "vertical",

		// Default node sizes. The height might be overridden for nodes with more ports
		// than will fit in the default size.
		defaultNodeWidth: 70,
		defaultNodeHeight: 75,

		// Default node shape
		nodeShape: "rectangle",

		// SVG path strings to define the shape of your node and its
		// selection highlighting. If set to null the paths will be set by default
		// based on the nodeShape setting.
		bodyPath: null,
		selectionPath: null,

		// Display image
		imageDisplay: true,

		// Image dimensions
		imageWidth: 48,
		imageHeight: 48,

		// Image position
		imagePosX: 11,
		imagePosY: 5,

		// Sets the justification of label and icon within the node height. This
		// overrides any labelPosY value provided. Possible value are "center" or
		// "none". Specify "none" to use the labelPosY value.
		labelAndIconVerticalJustification: "center",

		// Label dimensions used for automatically trimming the label to add ...
		labelMaxWidth: 64,

		// Label height used for automatically positioning the label
		labelHeight: 13, // Should match the font size specified in common-canvas-d3.scss

		// The underhang of letters below the baseline for the label font used
		labelDescent: 3, // Should match the font size specified in common-canvas-d3.scss

		// Label position
		labelPosX: 35,
		labelPosY: 67,

		// An array of decorations to be applied to the node. For details see:
		// https://github.ibm.com/NGP-TWC/wdp-abstract-canvas/wiki/2.4.2-Decoration-Specification
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

		decoratorWidth: 16,
		decoratorHeight: 16,

		decoratorPadding: 2,

		// Display drop shadow under and round the nodes
		dropShadow: false,

		// The gap between a node and its selection highlight rectangle
		nodeHighlightGap: 4,

		// The size of the node sizing area that extends around the node, over
		// which the mouse pointer will change to the sizing arrows.
		nodeSizingArea: 10,

		// Error indicator dimensions
		errorXPos: 45,
		errorYPos: 0,
		errorWidth: 14,
		errorHeight: 14,

		// When sizing a supernode this decides the size of the corner area for
		// diagonal sizing.
		nodeCornerResizeArea: 10,

		// Node Halo settings
		haloDisplay: false,
		haloCenterX: null,
		haloCenterY: null,
		haloRadius: null,

		// What point to draw 'halo' style link lines from and to. Possible values
		// are "image_center" or "node_center". This is used for node to node links.
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

		// Position of left single input port. Multiple input ports will be
		// automatically positioned with the Y coordinate being overriden. These
		// values are an offset from the top left corner of the node outline.
		// Used when linkDirection is "LeftRight".
		inputPortLeftPosX: 0,
		inputPortLeftPosY: 29,

		// Position of top single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the top left corner of the node outline.
		// Used when linkDirection is "TopBottom".
		inputPortTopPosX: 35,
		inputPortTopPosY: 0,

		// Position of bottom single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the bottom left corner of the node outline.
		// Used when linkDirection is "BottomTop".
		inputPortBottomPosX: 35,
		inputPortBottomPosY: 0,

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

		// Position of right single input port. Multiple input ports will be
		// automatically positioned with the Y coordinate being overriden. These
		// values are an offset from the top right corner of the node outline.
		// Used when linkDirection is "LeftRight".
		outputPortRightPosX: 0,
		outputPortRightPosY: 29,

		// Position of top single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the top left corner of the node outline.
		// Used when linkDirection is "BottomTop".
		outputPortTopPosX: 35,
		outputPortTopPosY: 0,

		// Position of bottom single input port. Multiple input ports will be
		// automatically positioned with the X coordinate being overriden. These
		// values are an offset from the bottom left corner of the node outline.
		// Used when linkDirection is "TopBottom".
		outputPortBottomPosX: 35,
		outputPortBottomPosY: 0,

		// The 'guide' is the object drawn at the mouse position as a new line
		// is being dragged outwards.
		// Object for output port guide can be "circle" or "image".
		outputPortGuideObject: "circle",

		// If output port guide object is "image" use this image.
		outputPortGuideImage: "",

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

		// Display of vertical ellipsis to show context menu
		ellipsisDisplay: true,
		ellipsisWidth: 11,
		ellipsisHeight: 21,
		ellipsisPosX: 57,
		ellipsisPosY: 8,
		ellipsisHoverAreaPadding: 2
	},

	canvasLayout: {
		// The amount of padding added around the canvas objects when doing a
		// zoomToFit on the primary canvas. This may be overriden by common-canvas
		// when displaying sub-flows.
		zoomToFitPadding: 10,

		// Supernode in-place containment area attributes
		supernodeLabelPosX: 30,
		supernodeLabelPosY: 18,
		supernodeImageWidth: 18,
		supernodeImageHeight: 18,
		supernodeImagePosX: 5,
		supernodeImagePosY: 4,
		supernodeEllipsisPosY: 2,
		supernodeEllipsisWidth: 10,
		supernodeEllipsisHeight: 20,
		supernodeExpansionIconPosY: 4,
		supernodeExpansionIconHeight: 18,
		supernodeExpansionIconWidth: 18,
		supernodeExpansionIconHoverAreaPadding: 2,
		supernodeIconSeparation: 3,
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
		// Connection type decides whether the node to node connections use the
		// 'halo' connection mechanism and arrows pointing directly from source to
		// target or the 'ports' connections with connection lines draw from output
		// ports to input ports.
		connectionType: "ports",

		// Specifies which direction the nodes will be linked up
		linkDirection: "LeftRight",

		// Whether to display a link line when linked node/comments overlap. For halo
		// we don't want to show the link when objects overlap but for ports we do.
		displayLinkOnOverlap: true,

		// The gap between node or comment and the link line.
		linkGap: 7,

		// Link decoration dimensions
		linkDecoratorHeight: 20,
		linkDecoratorWidth: 20,
		linkDecoratorPadding: 2,

		// Values for drawing connectors. wrapAroundSpacing and
		// wrapAroundNodePadding are used when curved connectors are drawn all the
		// way around a node. ie the target is to the right of the source.
		elbowSize: 10,
		wrapAroundSpacing: 20,
		wrapAroundNodePadding: 10,

		// This can be overrriden from common-canvas config properties
		linkType: "Curve",

		// Display an arrow head on the comment-to-node links
		commentLinkArrowHead: false,

		// Display an arrow head on the data links
		dataLinkArrowHead: false,

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

		// The gap between the edge of the comment rectangle and the comment text.
		commentWidthPadding: 10,
		commentHeightPadding: 8,

		// Add comment toolbar action, default offset from viewport
		addCommentOffset: 30,

		// Comment port (circle) radius
		commentPortRadius: 5,

		// Comment Halo size
		haloCommentGap: null, // Gap between comment rectangle and its halo

		// ---------------------------------------------------------------------------
		// Layout values for operations
		// ---------------------------------------------------------------------------
		// Snap to grid type.
		snapToGridType: "None",

		// Sizes of snap to grid as a percentage of default node height and width
		snapToGridX: "25%",
		snapToGridY: "20%",

		// Values for AutoLayout and AutoNode function
		autoLayoutInitialMarginX: 50,
		autoLayoutInitialMarginY: 50,
		autoLayoutVerticalSpacing: 80,
		autoLayoutHorizontalSpacing: 80 // For horizontal layout, this may be overriden by space for connections
	}
};


export default class LayoutDimensions {
	static getLayout(type, config) {
		let defaultLayout;
		if (type === "halo") {
			defaultLayout = haloDefaultLayout;
		} else if (type === "ports-vertical") {
			defaultLayout = portsVerticalDefaultLayout;
		} else {
			defaultLayout = portsHorizontalDefaultLayout;
		}

		let newLayout = Object.assign({}, defaultLayout);
		if (config) {
			newLayout = this.overrideNodeLayout(newLayout, config); // Do this first because snap-to-grid depends on this.
			newLayout = this.overrideCanvasLayout(newLayout, config);
			newLayout = this.overrideLinkType(newLayout, config);
			newLayout = this.overrideSnapToGrid(newLayout, config);
			newLayout = this.overrideAutoLayout(newLayout, config);
		}
		return newLayout;
	}

	static overrideNodeLayout(layout, config) {
		layout.nodeLayout = Object.assign({}, layout.nodeLayout, config.enableNodeLayout);

		return layout;
	}

	static overrideCanvasLayout(layout, config) {
		layout.canvasLayout = Object.assign({}, layout.canvasLayout, { linkDirection: config.enableLinkDirection }, config.enableCanvasLayout);

		return layout;
	}

	// Overrides the input layout objects with any link type provided by the
	// config object.
	static overrideLinkType(layout, config) {
		if (layout.canvasLayout.connectionType === "halo") {
			layout.canvasLayout.linkType = "Straight";
		} else {
			layout.canvasLayout.linkType = config.enableLinkType || layout.canvasLayout.linkType || "Curve";
		}

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
		const snapToGridXStr = config.enableSnapToGridX || layout.canvasLayout.snapToGridX || "25%";
		const snapToGridYStr = config.enableSnapToGridX || layout.canvasLayout.snapToGridY || "20%";

		// Set the snap-to-grid sizes in pixels.
		layout.canvasLayout.snapToGridX = this.getSnapToGridSize(snapToGridXStr, layout.nodeLayout.defaultNodeWidth);
		layout.canvasLayout.snapToGridY = this.getSnapToGridSize(snapToGridYStr, layout.nodeLayout.defaultNodeHeight);

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
}
