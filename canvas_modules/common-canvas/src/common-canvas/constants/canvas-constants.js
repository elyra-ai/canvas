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

// Private Methods ------------------------------------------------------------>

// Diff between the border for a text div (2px) and a label's editable text area (6px)
// This is used for node labels and also node/link text decorations.
export const TEXT_AREA_BORDER_ADJUSTMENT = 4;

// Public Methods ------------------------------------------------------------->
export const DND_DATA_TEXT = "text";
export const DRAG_MOVE = "move";
export const DRAG_LINK = "link";
export const DRAG_SELECT_REGION = "selectRegion";

export const DEFAULT_NOTIFICATION_HEADER = "Notifications";

// Used by both toolbar and notification panel.
export const NOTIFICATION_ICON_CLASS = "notificationCounterIcon";

// Values for enableNodeFormatType config parameter
export const NODE_FORMAT_VERTICAL = "Vertical";
export const NODE_FORMAT_HORIZONTAL = "Horizontal";

// Values for enableInteractionType config parameter
export const INTERACTION_MOUSE = "Mouse";
export const INTERACTION_TRACKPAD = "Trackpad";
export const INTERACTION_CARBON = "Carbon";

// Values for enableLinkType config parameter
export const LINK_TYPE_CURVE = "Curve";
export const LINK_TYPE_ELBOW = "Elbow";
export const LINK_TYPE_STRAIGHT = "Straight";
export const LINK_TYPE_PARALLAX = "Parallax";

// Values for enableLinkMethod config parameter
export const LINK_METHOD_PORTS = "Ports";
export const LINK_METHOD_FREEFORM = "Freeform";

// Values for enableLinkDirection config parameter
export const LINK_DIR_LEFT_RIGHT = "LeftRight";
export const LINK_DIR_RIGHT_LEFT = "RightLeft";
export const LINK_DIR_TOP_BOTTOM = "TopBottom";
export const LINK_DIR_BOTTOM_TOP = "BottomTop";

// Values for enableLinkSelection config parameter
export const LINK_SELECTION_NONE = "None";
export const LINK_SELECTION_LINK_ONLY = "LinkOnly";
export const LINK_SELECTION_HANDLES = "Handles";
export const LINK_SELECTION_DETACHABLE = "Detachable";

// Values for enableSnapToGridType config parameter
export const SNAP_TO_GRID_NONE = "None";
export const SNAP_TO_GRID_AFTER = "After";
export const SNAP_TO_GRID_DURING = "During";

// Values for enablePaletteLayout config parameter
export const PALETTE_LAYOUT_NONE = "None";
export const PALETTE_LAYOUT_FLYOUT = "Flyout";
export const PALETTE_LAYOUT_DIALOG = "Dialog";

// Values for enableToolbarLayout config parameter
export const TOOLBAR_LAYOUT_NONE = "None";
export const TOOLBAR_LAYOUT_TOP = "Top";

// Values for enableAssocLinkType config parameter
export const ASSOC_RIGHT_SIDE_CURVE = "RightSideCurve";
export const ASSOC_STRAIGHT = "Straight";

// Values for enableStateTag config parameter
export const STATE_TAG_NONE = "None";
export const STATE_TAG_LOCKED = "Locked";
export const STATE_TAG_READ_ONLY = "ReadOnly";

// Values for enableUnderlay config parameter
export const UNDERLAY_NONE = "None";
export const UNDERLAY_VARIABLE = "Variable";

// Values for enableSaveZoom config parameter
export const SAVE_ZOOM_NONE = "None";
export const SAVE_ZOOM_PIPELINE_FLOW = "Pipelineflow";
export const SAVE_ZOOM_LOCAL_STORAGE = "LocalStorage";

// Values for enableImageDisplay config parameter
export const IMAGE_DISPLAY_SVG_INLINE = "SVGInline";
export const IMAGE_DISPLAY_LOAD_SVG_TO_DEFS = "LoadSVGToDefs";
export const IMAGE_DISPLAY_SVG_AS_IMAGE = "SVGAsImage";


export const ERROR = "error";
export const WARNING = "warning";
export const INFO = "info";
export const SUCCESS = "success";

export const HORIZONTAL = "horizonal";
export const VERTICAL = "vertical";

export const PORT_DISPLAY_CIRCLE = "circle";
export const PORT_DISPLAY_IMAGE = "image";
export const PORT_DISPLAY_JSX = "jsx";

export const FLOW_IN = "in";
export const FLOW_OUT = "out";

// Variations of association links - when enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE
export const ASSOC_VAR_CURVE_RIGHT = "curveRight";
export const ASSOC_VAR_CURVE_LEFT = "curveLeft";
export const ASSOC_VAR_DOUBLE_BACK_RIGHT = "doubleBackRight";
export const ASSOC_VAR_DOUBLE_BACK_LEFT = "doubleBackLeft";

// The type of object to which deorations are to be attached.
export const DEC_NODE = "node";
export const DEC_LINK = "link";

export const DAGRE_HORIZONTAL = "LR";
export const DAGRE_VERTICAL = "TB";

export const NODE_LINK = "nodeLink";
export const ASSOCIATION_LINK = "associationLink";
export const COMMENT_LINK = "commentLink";

export const TIP_TYPE_NODE = "tipTypeNode";
export const TIP_TYPE_PORT = "tipTypePort";
export const TIP_TYPE_DEC = "tipTypeDec";
export const TIP_TYPE_LINK = "tipTypeLink";
export const TIP_TYPE_PALETTE_ITEM = "tipTypePaletteItem";
export const TIP_TYPE_PALETTE_CATEGORY = "tipTypePaletteCategory";
export const TIP_TYPE_TOOLBAR_ITEM = "tipTypeToolbarItem";
export const TIP_TYPE_STATE_TAG = "tipTypeStateTag";

export const CREATE_NODE = "create_node";
export const CLONE_NODE = "clone_node";
export const CREATE_COMMENT = "create_comment";
export const CLONE_COMMENT = "clone_comment";
export const CREATE_NODE_LINK = "create_node_link";
export const CLONE_NODE_LINK = "clone_node_link";
export const CREATE_COMMENT_LINK = "create_comment_link";
export const CLONE_COMMENT_LINK = "clone_comment_link";
export const CREATE_PIPELINE = "create_pipeline";
export const CLONE_PIPELINE = "clone_pipeline";

export const HIGHLIGHT_BRANCH = "branch";
export const HIGHLIGHT_UPSTREAM = "upstream";
export const HIGHLIGHT_DOWNSTREAM = "downstream";

export const BINDING = "binding";
export const SUPER_NODE = "super_node";
export const MODEL_NODE = "model_node";
export const EXECUTION_NODE = "execution_node";

export const SAVED_NODES_CATEGORY_ID = "savedNodes";

export const USE_DEFAULT_ICON = "useDefaultIcon";
export const USE_DEFAULT_EXT_ICON = "useDefaultExtIcon";

// Comment types
export const WYSIWYG = "WYSIWYG";
export const MARKDOWN = "markdown";

// Focus instruction.
export const CANVAS_FOCUS = "CanvasFocus";

// Directions
export const NORTH = "n";
export const SOUTH = "s";
export const EAST = "e";
export const WEST = "w";

// Cuase or actions
export const CAUSE_MOUSE = "M";
export const CAUSE_KEYBOARD = "K";

// Defaults for port size incase width and height are not provided in
// the inputPortDisplayObjects and outputPortDisplayObjects arrays.
export const PORT_WIDTH_DEFAULT = 12;
export const PORT_HEIGHT_DEFAULT = 12;

// Context Menu button value
export const CONTEXT_MENU_BUTTON = 2;

export const CANVAS_CARBON_ICONS = {
	CHEVRONARROWS: {
		UP: "chevron-up",
		DOWN: "chevron-down"
	},
	SEARCH: "search",
	WARNING_UNFILLED: "warning16"
};

export const CONTEXT_MENU_CARBON_ICONS = {
	CHEVRONARROWS: {
		RIGHT: "chevron-right"
	}
};

export const TOOLBAR_STOP = "stop";
export const TOOLBAR_RUN = "run";
export const TOOLBAR_UNDO = "undo";
export const TOOLBAR_REDO = "redo";
export const TOOLBAR_CUT = "cut";
export const TOOLBAR_COPY = "copy";
export const TOOLBAR_PASTE = "paste";
export const TOOLBAR_CLIPBOARD = "clipboard";
export const TOOLBAR_CREATE_COMMENT = "createComment";
export const TOOLBAR_CREATE_AUTO_COMMENT = "createAutoComment";
export const TOOLBAR_CREATE_WYSIWYG_COMMENT = "createWYSIWYGComment";
export const TOOLBAR_CREATE_AUTO_WYSIWYG_COMMENT = "createAutoWysiwygComment";
export const TOOLBAR_SET_COMMENT_EDIT_MODE = "setCommentEditingMode";
export const TOOLBAR_SHOW_COMMENTS = "commentsShow";
export const TOOLBAR_HIDE_COMMENTS = "commentsHide";
export const TOOLBAR_COLOR_BACKGROUND = "colorBackground";
export const TOOLBAR_DELETE_LINK = "deleteLink";
export const TOOLBAR_DELETE_SELECTED_OBJECTS = "deleteSelectedObjects";
export const TOOLBAR_ZOOM_IN = "zoomIn";
export const TOOLBAR_ZOOM_OUT = "zoomOut";
export const TOOLBAR_ZOOM_FIT = "zoomToFit";
export const TOOLBAR_ARRANGE_HORIZONALLY = "arrangeHorizontally";
export const TOOLBAR_ARRANGE_VERTICALLY = "arrangeVertically";
export const TOOLBAR_TOGGLE_NOTIFICATION_PANEL = "toggleNotificationPanel";
export const TOOLBAR_OPEN_PALETTE = "openPalette";
export const TOOLBAR_CLOSE_PALETTE = "closePalette";
export const TOOLBAR_TOGGLE_PALETTE = "togglePalette";
export const TOOLBAR_EXPAND_SUPERNODE_IN_PLACE = "expandSuperNodeInPlace";
export const TOOLBAR_COLLAPSE_SUPERNODE_IN_PLACE = "collapseSuperNodeInPlace";
export const TOOLBAR_EXPAND_SUPERNODE_FULL_PAGE = "displaySubPipeline";
export const TOOLBAR_SET_NODE_LABEL_EDIT = "setNodeLabelEditingMode";

export const EDIT_ICON =
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\">" +
	"<rect x=\"2\" y=\"26\" width=\"28\" height=\"2\"/>" +
	"<path d=\"M25.4,9c0.8-0.8,0.8-2,0-2.8c0,0,0,0,0,0l-3.6-3.6c-0.8-0.8-2-0.8-2.8,0" +
	"c0,0,0,0,0,0l-15,15V24h6.4L25.4,9z M20.4,4L24,7.6" +
	"l-3,3L17.4,7L20.4,4z M6,22v-3.6l10-10l3.6,3.6l-10,10H6z\"/>" +
	"</svg>";

export const NODE_MENU_ICON =
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 16\">" +
	"<circle cx=\"2\" cy=\"4\" r=\"1.1\"/>" +
	"<circle cx=\"2\" cy=\"9\" r=\"1.1\"/>" +
	"<circle cx=\"2\" cy=\"14\" r=\"1.1\"/>" +
	"</svg>";

export const SUPER_NODE_EXPAND_ICON =
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" enable-background=\"new 0 0 16 16\">" +
	"<g><path d=\"m14.9 9.1h-1.5c-.1 0-.1 0-.1.1v5.2h-11.6v-11.6h5.2c.1 0 .1 0 .1-.1v-1.5c0-.1 " +
	"0-.1-.1-.1h-5.4c-.8 0-1.5.7-1.5 1.4v12c0 .8.7 1.5 1.5 1.5h12.1c.8 0 1.5-.7 1.5-1.4v-5.4c-.1-.1-.2-.1-.2-.1\"/>" +
	"<path d=\"m10.4 0v1.4h3.2l-5.1 5v.1l1.1 1 4.9-5.1v3.3h1.5v-5.7z\"/>" +
	"</g>" +
	"</svg>";

export const NODE_ERROR_ICON =
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\">" +
	"<path d=\"M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm2.7 10.5L4.5 5.3l.8-.8 6.2 6.2-.8.8z\"></path>" +
	"<path style=\"fill: #ffffff;\" d=\"M10.7 11.5L4.5 5.3l.8-.8 6.2 6.2-.8.8z\"></path>" +
	"</svg>";

export const NODE_WARNING_ICON =
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\">" +
	"<path d=\"M8 1C4.2 1 1 4.2 1 8s3.2 7 7 7 7-3.1 7-7-3.1-7-7-7zm-.5 3h1v5h-1V4zm.5 8.2c-.4 0-.8-.4-.8-.8s.3-.8.8-.8c.4 0 .8.4.8.8s-.4.8-.8.8z\"></path>" +
	"<path style=\"stroke-width: 0; fill: #161616; opacity: 1;\" d=\"M7.5 4h1v5h-1V4zm.5 8.2c-.4 0-.8-.4-.8-.8s.3-.8.8-.8c.4 0 .8.4.8.8s-.4.8-.8.8z\"></path>" +
	"</svg>";

// This image is stored in the format to be shown as an <img> in the JSX
// created by palette-flyout-content-category render method.
export const SAVED_NODES_FOLDER_ICON =
	"data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllci" +
	"AxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNC" +
	"AyMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiM5NDkzOTQ7fTwvc3R5bGU+PC9kZWZzPj" +
	"x0aXRsZT5zb3VyY2VzX29wZW48L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTEwLD" +
	"MuNDRWMkgyVjE4SDIyVjMuNDRabTEwLjE3LDEzSDMuNzdWNS4xN0gyMC4xNFoiLz48L3N2Zz4=";
