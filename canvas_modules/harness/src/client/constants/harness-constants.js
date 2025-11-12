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

// Public Methods ------------------------------------------------------------->
export const SIDE_PANEL_CANVAS = "sidepanel-canvas";
export const SIDE_PANEL_MODAL = "sidepanel-modal";
export const SIDE_PANEL_API = "sidepanel-api";

_defineConstant("EXAMPLE_APP_NONE", "None - use options below");
_defineConstant("EXAMPLE_APP_FLOWS", "Flows");
_defineConstant("EXAMPLE_APP_READ_ONLY", "Read Only");
_defineConstant("EXAMPLE_APP_PROGRESS", "Progress");
_defineConstant("EXAMPLE_APP_STAGES", "Stages");
_defineConstant("EXAMPLE_APP_STAGES_CARD_NODE", "Stages Card Node");
_defineConstant("EXAMPLE_APP_PROMPT", "Prompt");
_defineConstant("EXAMPLE_APP_EXPLAIN", "Explain");
_defineConstant("EXAMPLE_APP_EXPLAIN2", "Explain2");
_defineConstant("EXAMPLE_APP_STREAMS", "Streams");
_defineConstant("EXAMPLE_APP_TABLES", "Tables");
_defineConstant("EXAMPLE_APP_LOGIC", "Logic");
_defineConstant("EXAMPLE_APP_LINK_TYPES", "Link Types");
_defineConstant("EXAMPLE_APP_JSX_ICONS", "JSX Icons");
_defineConstant("EXAMPLE_APP_ALL_PORTS", "All Ports");
_defineConstant("EXAMPLE_APP_PARALLAX", "Parallax");
_defineConstant("EXAMPLE_APP_NETWORK", "Network");
_defineConstant("EXAMPLE_APP_WYSIWYG", "WYSIWYG Comments");
_defineConstant("EXAMPLE_APP_REACT_NODES_DRAGGABLE", "React Nodes - Draggable");
_defineConstant("EXAMPLE_APP_REACT_NODES_CARBON", "React Nodes - Carbon Charts");
_defineConstant("EXAMPLE_APP_REACT_NODES_MAPPING", "React Nodes - Mapping");

export const PROPERTIES_FLYOUT = "Flyout";
export const PROPERTIES_MODAL = "Modal";
export const PROPERTIES_TEARSHEET = "Tearsheet";
export const CUSTOM = "Custom";
export const EDITING = "Editing";

export const TOOLBAR_TYPE_DEFAULT = "Default";
export const TOOLBAR_TYPE_SUB_AREAS = "SubAreas";
export const TOOLBAR_TYPE_SINGLE_BAR = "SingleLeftBarArray";
export const TOOLBAR_TYPE_CUSTOMIZE_AUTO = "CustomizeAutoItems";
export const TOOLBAR_TYPE_BEFORE_AFTER = "TextBeforeAndAfter";
export const TOOLBAR_TYPE_CUSTOM_RIGHT_SIDE = "CustomizedRightSide";
export const TOOLBAR_TYPE_CARBON_BUTTONS = "CarbonButtons";
export const TOOLBAR_TYPE_CUSTOM_ACTIONS = "CustomActions";
export const TOOLBAR_TYPE_OVERRIDE_AUTO_ENABLE_DISABLE = "OverrideAutoEnableDisable";

export const CHOOSE_FROM_LOCATION = "Choose from location...";

export const PALETTE_TOOLTIP = "Click to show node palette";

_defineConstant("API_SET_PIPELINEFLOW", "Set PipelineFlow");
_defineConstant("API_ADD_PALETTE_ITEM", "Add PaletteItem");
_defineConstant("API_SET_NODE_LABEL", "Set Node Label");
_defineConstant("API_SET_INPUT_PORT_LABEL", "Set Input Port Label");
_defineConstant("API_SET_OUTPUT_PORT_LABEL", "Set Output Port Label");
_defineConstant("API_SET_NODE_DECORATIONS", "Set Node Decorations");
_defineConstant("API_SET_LINK_DECORATIONS", "Set Link Decorations");
_defineConstant("API_ADD_NOTIFICATION_MESSAGE", "Add Notification Message");
_defineConstant("API_ZOOM_TO_REVEAL_NODE", "Zoom To Reveal Node");
_defineConstant("API_ZOOM_TO_REVEAL_LINK", "Zoom To Reveal Link");
_defineConstant("API_SET_COMMENT_HIGHLIGHT_TEXT", "Set Comment Highlight Text");

export const INPUT_PORT = "inputPort";
export const OUTPUT_PORT = "outputPort";

export const TIP_PALETTE_CATEGORIES = "Palette Categories";
export const TIP_PALETTE_NODE_TEMPLATES = "Palette Node Templates";
export const TIP_NODES = "Nodes";
export const TIP_PORTS = "Ports";
export const TIP_DECORATIONS = "Decorations";
export const TIP_LINKS = "Links";
export const TIP_STATE_TAG = "State Tag";

export const NOTIFICATION_MESSAGE_TYPE = {
	INFO: "info",
	WARNING: "warning",
	ERROR: "error",
	SUCCESS: "success",
	UNSPECIFIED: "unspecified"
};

export const LOCAL_FILE_OPTION = "Local File";
export const PARAMETER_DEFS = "parameterDefs";

export const PRIMARY = "Primary";

export const CATEGORY_VIEW_ACCORDIONS = "accordions";
export const CATEGORY_VIEW_TABS = "tabs";
