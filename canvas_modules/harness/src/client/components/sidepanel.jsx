/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import SidePanelCanvas from "./sidepanel-canvas.jsx";
import SidePanelModal from "./sidepanel-modal.jsx";
import SidePanelAPI from "./sidepanel-api.jsx";

import {
	SIDE_PANEL,
	SIDE_PANEL_CANVAS,
	SIDE_PANEL_MODAL,
	SIDE_PANEL_API
} from "../constants/constants.js";

export default class SidePanel extends React.Component {

	render() {
		var panelSize = SIDE_PANEL.MINIMIZED;
		if (this.props.openSidepanelCanvas ||
			this.props.openSidepanelModal ||
			this.props.openSidepanelAPI) {
			panelSize = SIDE_PANEL.MAXIMIXED;
		}

		var view = null;
		switch (this.props.selectedPanel) {
		case SIDE_PANEL_CANVAS:
			view = (<SidePanelCanvas
				canvasConfig={this.props.canvasConfig}
				enableNavPalette={this.props.enableNavPalette}
				internalObjectModel={this.props.internalObjectModel}
				setDiagramJSON={this.props.setDiagramJSON}
				setPaletteJSON={this.props.setPaletteJSON}
				setDiagramJSON2={this.props.setDiagramJSON2}
				setPaletteJSON2={this.props.setPaletteJSON2}
				setLayoutDirection={this.props.setLayoutDirection}
				useInternalObjectModel={this.props.useInternalObjectModel}
				setConnectionType={this.props.setConnectionType}
				setNodeFormatType={this.props.setNodeFormatType}
				setLinkType={this.props.setLinkType}
				setPaletteLayout={this.props.setPaletteLayout}
				setTipConfig={this.props.setTipConfig}
				extraCanvasDisplayed={this.props.extraCanvasDisplayed}
				showExtraCanvas={this.props.showExtraCanvas}
				narrowPalette={this.props.narrowPalette}
				setNarrowPalette={this.props.setNarrowPalette}
				schemaValidation={this.props.schemaValidation}
				schemaValidationEnabled={this.props.schemaValidationEnabled}
				log={this.props.log}
			/>);
			break;
		case SIDE_PANEL_MODAL:
			view = (<SidePanelModal
				log={this.props.log}
				closePropertiesEditorDialog={this.props.closePropertiesEditorDialog}
				openPropertiesEditorDialog={this.props.openPropertiesEditorDialog}
				setPropertiesJSON={this.props.setPropertiesJSON}
				showPropertiesDialog={this.props.showPropertiesDialog}
				usePropertiesContainerType={this.props.usePropertiesContainerType}
				propertiesContainerType={this.props.propertiesContainerType}
				closeSidePanelModal={this.props.closeSidePanelModal}
				applyOnBlur={this.props.applyOnBlur}
				useApplyOnBlur={this.props.useApplyOnBlur}
			/>);
			break;
		case SIDE_PANEL_API:
			view = (<SidePanelAPI
				log={this.props.log}
				getCanvasInfo={this.props.getCanvasInfo}
				getPipelineFlow={this.props.getPipelineFlow}
				setPipelineFlow={this.props.setPipelineFlow}
				addNodeTypeToPalette={this.props.addNodeTypeToPalette}
				setNodeLabel={this.props.setNodeLabel}
				setPortLabel={this.props.setPortLabel}
			/>);
			break;
		default:
		}

		var sidePanel = (<div id="app-sidepanel" style={ { width: panelSize } } >
			{view}
		</div>);

		return (
			<div>{sidePanel}</div>
		);
	}
}

SidePanel.propTypes = {
	canvasConfig: PropTypes.object,
	enableNavPalette: PropTypes.func,
	internalObjectModel: PropTypes.bool,
	closePropertiesEditorDialog: PropTypes.func,
	closeSidePanelModal: PropTypes.func,
	openPropertiesEditorDialog: PropTypes.func,
	openSidepanelCanvas: PropTypes.bool,
	openSidepanelModal: PropTypes.bool,
	openSidepanelAPI: PropTypes.bool,
	setDiagramJSON: PropTypes.func,
	setPaletteJSON: PropTypes.func,
	setDiagramJSON2: PropTypes.func,
	setPaletteJSON2: PropTypes.func,
	setPropertiesJSON: PropTypes.func,
	setLayoutDirection: PropTypes.func,
	selectedPanel: PropTypes.string,
	showPropertiesDialog: PropTypes.bool,
	useInternalObjectModel: PropTypes.func,
	modalPropertiesDialog: PropTypes.bool,
	usePropertiesContainerType: PropTypes.func,
	propertiesContainerType: PropTypes.string,
	setConnectionType: PropTypes.func,
	setNodeFormatType: PropTypes.func,
	setLinkType: PropTypes.func,
	setPaletteLayout: PropTypes.func,
	getPipelineFlow: PropTypes.func,
	setPipelineFlow: PropTypes.func,
	getCanvasInfo: PropTypes.func,
	setTipConfig: PropTypes.func,
	extraCanvasDisplayed: PropTypes.bool,
	showExtraCanvas: PropTypes.func,
	addNodeTypeToPalette: PropTypes.func,
	setNodeLabel: PropTypes.func,
	setPortLabel: PropTypes.func,
	applyOnBlur: PropTypes.bool,
	useApplyOnBlur: PropTypes.func,
	narrowPalette: PropTypes.bool,
	setNarrowPalette: PropTypes.func,
	schemaValidationEnabled: PropTypes.bool,
	schemaValidation: PropTypes.func,
	log: PropTypes.func
};
