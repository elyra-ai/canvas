/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const haloDefaultLayout = {
	nodeLayout: {
		// CSS classes
		cssNodeBody: "d3-node-body-halo",
		cssNodeSelectionHighlight: "d3-node-selection-highlight",
		cssNodeLabel: "d3-node-label",

		// Node format specifies whether the image and label are arranged side by side
		// (horizontal) or with the image above the label (vertical).
		nodeFormatType: "vertical",

		// Default node sizes. The height might be overridden for nodes with more ports
		// than will fit in the default size.
		defaultNodeWidth: 60,
		defaultNodeHeight: 66,

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

		// Positions for 4 enumerated default decorator positions.
		decoratorTopY: 0,
		decoratorMiddleY: -8,
		decoratorBottomY: -32,

		decoratorLeftX: 6,
		decoratorCenterX: -8,
		decoratorRightX: -22,

		// Display drop shadow
		dropShadow: false,

		// The gap between a node and its selection highlight rectangle
		nodeHighlightGap: 4,

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
		// are image_center or node_center. This is used for node to node links.
		drawNodeLinkLineFromTo: "image_center",

		// What point to draw the comment to node link line to. Possible values
		// are image_center or node_center.
		drawCommentLinkLineTo: "image_center",

		// This is the size of the horizontal line protruding from the source
		// port on the source node when drawing an elbow or straight connection line.
		minInitialLine: 30,

		// Radius of the port circle
		portRadius: null,

		// Radius of an imaginary circle around the port. This controls the
		// spacing of ports and the size of port arcs when nodeShape is set to
		// port-arcs.
		portArcRadius: null,

		// Spacing between the port arcs around the ports.
		portArcSpacing: null,

		// Default position of a single port - for vertical node format this
		// is half way down the image rather than the center of the node.
		portPosY: null,

		// Display of vertical ellipsis to show context menu
		ellipsisDisplay: false,
		ellipsisWidth: 10,
		ellipsisHeight: 22,
		ellipsisPosX: 145,
		ellipsisPosY: 9,
		ellipsisHoverAreaPadding: 3
	},

	// Draw node as a simple rectangle
	nodeShape: "rectangle",

	// CSS classes
	cssNodePortOutput: "d3-node-port-output",
	cssNodePortInput: "d3-node-port-input",
	cssNodePortInputArrow: "d3-node-port-input-arrow",
	cssSupernodeLabel: "d3-supernode-label",

	// Supernode in-place containment area attributes
	supernodeLabelPosX: 30,
	supernodeLabelPosY: 18,
	supernodeImageWidth: 18,
	supernodeImageHeight: 18,
	supernodeImagePosX: 5,
	supernodeImagePosY: 4,
	supernodeEllipsisPosY: 3,
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
	supernodeSVGTopAreaHeight: 25,
	supernodeSVGAreaPadding: 3,
	supernodeBindingPortRadius: 10,
	supernodeZoomPadding: 40,

	// ---------------------------------------------------------------------------
	// Layout values for links
	// ---------------------------------------------------------------------------
	// Connection type decides whether the node to node connections use the
	// 'halo' connection mechanism and arrows pointing directly from source to
	// target or the 'ports' connections with connection lines draw from output
	// ports to input ports.
	connectionType: "halo",

	// Whether to display a link line when linked node/comments overlap. For halo
	// we don't want to show the link when objects overlap but for ports we do.
	displayLinkOnOverlap: false,

	// The gap between node or comment and the link line.
	linkGap: 7,

	// Initialize values for drawing connectors. wrapAroundSpacing and
	// wrapAroundNodePadding are used when curved connectors are drawn all the
	// way around a node. ie the target is to the right of the source.
	elbowSize: 10,
	wrapAroundSpacing: 20,
	wrapAroundNodePadding: 10,

	// This can be overrriden from common-canvas config properties
	linkType: null,

	// ---------------------------------------------------------------------------
	// Layout values for comments
	// ---------------------------------------------------------------------------
	// CSS styles for comment highlighting
	cssCommentSelectionHighlight: "d3-comment-selection-highlight",

	// When sizing a comment this decides the size of the corner area for
	// diagonal sizing.
	commentCornerResizeArea: 10,

	// The gap between a comment and its selection highlight rectangle
	commentHighlightGap: 4,

	// The gap between the edge of the comment rectangle and the comment text.
	commentWidthPadding: 10,
	commentHeightPadding: 8,

	// Display an arrow head on the comment-to-node links
	commentLinkArrowHead: true,

	// Add comment toolbar action, default offset from viewport
	addCommentOffset: 30,

	// Comment port (circle) radius
	commentPortRadius: null,

	// Comment Halo size
	haloCommentGap: 11, // Gap between comment rectangle and its halo

	// ---------------------------------------------------------------------------
	// Layout values for operations
	// ---------------------------------------------------------------------------
	// Sizes of snap to grid as a percentage of default node height and width
	snapToGridX: "25%",
	snapToGridY: "20%",

	// Values for AutoLayout and AutoNode function
	autoLayoutInitialMarginX: 50,
	autoLayoutInitialMarginY: 50,
	autoLayoutVerticalSpacing: 80,
	autoLayoutHorizontalSpacing: 80
};

const portsHorizontalDefaultLayout = {
	nodeLayout: {
		// CSS classes
		cssNodeBody: "d3-node-body-outline-austin",
		cssNodeSelectionHighlight: "d3-node-selection-highlight-austin",
		cssNodeLabel: "d3-node-label-austin",

		// Node format specifies whether the image and label are arranged side by side
		// (horizontal) or with the image above the label (vertical).
		nodeFormatType: "horizontal",

		// Default node sizes. The height might be overridden for nodes with more ports
		// than will fit in the default size.
		defaultNodeWidth: 160,
		defaultNodeHeight: 40,

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

		// Positions for 4 enumerated default decorator positions.
		decoratorTopY: 2,
		decoratorMiddleY: -8,
		decoratorBottomY: -18,

		decoratorLeftX: 2,
		decoratorCenterX: -8,
		decoratorRightX: -30,

		// Display drop shadow
		dropShadow: true,

		// The gap between a node and its selection highlight rectangle
		nodeHighlightGap: 1,

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
		// are image_center or node_center. This is used for node to node links.
		drawNodeLinkLineFromTo: "node_center",

		// What point to draw the comment to node link line to. Possible values
		// are image_center or node_center.
		drawCommentLinkLineTo: "node_center",

		// This is the size of the horizontal line protruding from the source
		// port on the source node when drawing an elbow or straight connection line.
		minInitialLine: 30,

		// Radius of the port circle
		portRadius: 3,

		// Radius of an imaginary circle around the port. This controls the
		// spacing of ports and the size of port arcs when nodeShape is set to
		// port-arcs.
		portArcRadius: 6,

		// Spacing between the port arcs around the ports.
		portArcSpacing: 3,

		// Default position of a single port - for vertical node format this
		// is half way down the image rather than the center of the node.
		portPosY: 20,

		// Display of vertical ellipsis to show context menu
		ellipsisDisplay: true,
		ellipsisWidth: 10,
		ellipsisHeight: 22,
		ellipsisPosX: 145,
		ellipsisPosY: 9,
		ellipsisHoverAreaPadding: 3
	},

	// Draw node as a rectangle with port arcs around the ports
	nodeShape: "port-arcs",

	// CSS classes
	cssNodePortOutput: "d3-node-port-output-austin",
	cssNodePortInput: "d3-node-port-input-austin",
	cssNodePortInputArrow: "d3-node-port-input-arrow-austin",
	cssSupernodeLabel: "d3-node-label-austin",

	// Supernode in-place containment area attributes
	supernodeLabelPosX: 30,
	supernodeLabelPosY: 18,
	supernodeImageWidth: 18,
	supernodeImageHeight: 18,
	supernodeImagePosX: 5,
	supernodeImagePosY: 4,
	supernodeEllipsisPosY: 3,
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
	supernodeSVGTopAreaHeight: 25,
	supernodeSVGAreaPadding: 3,
	supernodeBindingPortRadius: 7,
	supernodeZoomPadding: 40,

	// ---------------------------------------------------------------------------
	// Layout values for links
	// ---------------------------------------------------------------------------
	// Connection type decides whether the node to node connections use the
	// 'halo' connection mechanism and arrows pointing directly from source to
	// target or the 'ports' connections with connection lines draw from output
	// ports to input ports.
	connectionType: "ports",

	// Whether to display a link line when linked node/comments overlap. For halo
	// we don't want to show the link when objects overlap but for ports we do.
	displayLinkOnOverlap: true,

	// The gap between node or comment and the link line.
	linkGap: 7,

	// Initialize values for drawing connectors. minInitialLine is the
	// size of the horizontal line protruding from the source or target handles
	// when such a line is required for drawing connectors. wrapAroundSpacing
	// the spacing for wraparound curved connectors.:
	elbowSize: 10,
	wrapAroundSpacing: 20,
	wrapAroundNodePadding: 10,

	// This can be overrriden from common-canvas config properties
	linkType: "Curve",

	// ---------------------------------------------------------------------------
	// Layout values for comments
	// ---------------------------------------------------------------------------
	// CSS styles for comment highlighting
	cssCommentSelectionHighlight: "d3-comment-selection-highlight-austin",

	// When sizing a comment this decides the size of the corner area for
	// diagonal sizing.
	commentCornerResizeArea: 10,

	// The gap between a comment and its selection highlight rectangle
	commentHighlightGap: 1,

	// The gap between the edge of the comment rectangle and the comment text.
	commentWidthPadding: 10,
	commentHeightPadding: 8,

	// Display an arrow head on the comment-to-node links
	commentLinkArrowHead: false,

	// Add comment toolbar action, default offset from viewport
	addCommentOffset: 30,

	// Comment port (circle) radius
	commentPortRadius: 5,

	// Comment Halo size
	haloCommentGap: null, // Gap between comment rectangle and its halo

	// ---------------------------------------------------------------------------
	// Layout values for operations
	// ---------------------------------------------------------------------------
	// Sizes of snap to grid as a percentage of default node height and width
	snapToGridX: "20%",
	snapToGridY: "33.33%",

	// Values for AutoLayout and AutoNode function
	autoLayoutInitialMarginX: 50,
	autoLayoutInitialMarginY: 50,
	autoLayoutVerticalSpacing: 80,
	autoLayoutHorizontalSpacing: 80
};

const portsVerticalDefaultLayout = {
	nodeLayout: {
		// CSS classes
		cssNodeBody: "d3-node-body-outline",
		cssNodeSelectionHighlight: "d3-node-selection-highlight",
		cssNodeLabel: "d3-node-label",

		// Node format specifies whether the image and label are arranged side by side
		// (horizontal) or with the image above the label (vertical).
		nodeFormatType: "vertical",

		// Default node sizes. The height might be overridden for nodes with more ports
		// than will fit in the default size.
		defaultNodeWidth: 70,
		defaultNodeHeight: 75,

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

		// Positions for 4 enumerated default decorator positions.
		decoratorTopY: 5,
		decoratorMiddleY: -8,
		decoratorBottomY: -34,

		decoratorLeftX: 10,
		decoratorCenterX: -8,
		decoratorRightX: -24,

		// Display drop shadow
		dropShadow: false,

		// The gap between a node and its selection highlight rectangle
		nodeHighlightGap: 4,

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
		// are image_center or node_center. This is used for node to node links.
		drawNodeLinkLineFromTo: "node_center",

		// What point to draw the comment to node link line to. Possible values
		// are image_center or node_center.
		drawCommentLinkLineTo: "node_center",

		// This is the size of the horizontal line protruding from the source
		// port on the source node when drawing an elbow or straight connection line.
		minInitialLine: 30,

		// Radius of the port circle
		portRadius: 6,

		// Radius of an imaginary circle around the port. This controls the
		// spacing of ports and the size of port arcs when nodeShape is set to
		// port-arcs.
		portArcRadius: 10,

		// Spacing between the port arcs around the ports.
		portArcSpacing: 0,

		// Default position of a single port - for vertical node format this
		// is half way down the image rather than the center of the node.
		portPosY: 29,

		// Display of vertical ellipsis to show context menu
		ellipsisDisplay: true,
		ellipsisWidth: 11,
		ellipsisHeight: 21,
		ellipsisPosX: 57,
		ellipsisPosY: 8,
		ellipsisHoverAreaPadding: 3
	},

	// Draw node as a simple rectangle
	nodeShape: "rectangle",

	// CSS classes
	cssNodePortOutput: "d3-node-port-output",
	cssNodePortInput: "d3-node-port-input",
	cssNodePortInputArrow: "d3-node-port-input-arrow",
	cssSupernodeLabel: "d3-supernode-label",

	// Supernode in-place containment area attributes
	supernodeLabelPosX: 30,
	supernodeLabelPosY: 18,
	supernodeImageWidth: 18,
	supernodeImageHeight: 18,
	supernodeImagePosX: 5,
	supernodeImagePosY: 4,
	supernodeEllipsisPosY: 3,
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
	supernodeSVGTopAreaHeight: 25,
	supernodeSVGAreaPadding: 3,
	supernodeBindingPortRadius: 10,
	supernodeZoomPadding: 40,

	// ---------------------------------------------------------------------------
	// Layout values for links
	// ---------------------------------------------------------------------------
	// Connection type decides whether the node to node connections use the
	// 'halo' connection mechanism and arrows pointing directly from source to
	// target or the 'ports' connections with connection lines draw from output
	// ports to input ports.
	connectionType: "ports",

	// Whether to display a link line when linked node/comments overlap. For halo
	// we don't want to show the link when objects overlap but for ports we do.
	displayLinkOnOverlap: true,

	// The gap between node or comment and the link line.
	linkGap: 7,

	// Initialize values for drawing connectors. minInitialLine is the
	// size of the horizontal line protruding from the source or target handles
	// when such a line is required for drawing connectors. wrapAroundSpacing
	// the spacing for wraparound curved connectors.:
	elbowSize: 10,
	wrapAroundSpacing: 20,
	wrapAroundNodePadding: 10,


	// This can be overrriden from common-canvas config properties
	linkType: "Curve",

	// ---------------------------------------------------------------------------
	// Layout values for comments
	// ---------------------------------------------------------------------------
	// CSS styles for comment highlighting
	cssCommentSelectionHighlight: "d3-comment-selection-highlight",

	// When sizing a comment this decides the size of the corner area for
	// diagonal sizing.
	commentCornerResizeArea: 10,

	// The gap between a comment and its selection highlight rectangle
	commentHighlightGap: 4,

	// The gap between the edge of the comment rectangle and the comment text.
	commentWidthPadding: 10,
	commentHeightPadding: 8,

	// Display an arrow head on the comment-to-node links
	commentLinkArrowHead: false,

	// Add comment toolbar action, default offset from viewport
	addCommentOffset: 30,

	// Comment port (circle) radius
	commentPortRadius: 5,

	// Comment Halo size
	haloCommentGap: null, // Gap between comment rectangle and its halo

	// ---------------------------------------------------------------------------
	// Layout values for operations
	// ---------------------------------------------------------------------------
	// Sizes of snap to grid as a percentage of default node height and width
	snapToGridX: "25%",
	snapToGridY: "20%",

	// Values for AutoLayout and AutoNode function
	autoLayoutInitialMarginX: 50,
	autoLayoutInitialMarginY: 50,
	autoLayoutVerticalSpacing: 80,
	autoLayoutHorizontalSpacing: 80
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

	// Overrides the input layout objects with any link type provided by the
	// config object.
	static overrideLinkType(layout, config) {
		layout.linkType = config.enableLinkType || layout.linkType || "Curve";

		return layout;
	}

	// Overrides the snap-to-grid values in the layout object with any
	// snap-to-grid values provided in the config object.
	static overrideSnapToGrid(layout, config) {
		// Snap to grid configuration. 25% for X and 20% for Y (of node width and
		// height) by default. It can be overridden by the config which can be either
		// a number or a percentage of the node width/height.
		const snapToGridXStr = config.enableSnapToGridX || layout.snapToGridX || "25%";
		const snapToGridYStr = config.enableSnapToGridX || layout.snapToGridY || "20%";

		// Set the snap-to-grid sizes in pixels.
		layout.snapToGridX = this.getSnapToGridSize(snapToGridXStr, layout.nodeLayout.defaultNodeWidth);
		layout.snapToGridY = this.getSnapToGridSize(snapToGridYStr, layout.nodeLayout.defaultNodeHeight);

		return layout;
	}

	// Overrides the auto-layout values in the layout object with any
	// auto-layout values provided in the config object.
	static overrideAutoLayout(layout, config) {
		layout.autoLayoutVerticalSpacing = config.enableAutoLayoutVerticalSpacing || layout.autoLayoutVerticalSpacing || 80;
		layout.autoLayoutHorizontalSpacing = config.enableAutoLayoutHorizontalSpacing || layout.autoLayoutHorizontalSpacing || 80;

		return layout;
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
