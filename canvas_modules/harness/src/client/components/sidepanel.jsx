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
				canvasConfig={this.props.canvasConfig.canvasConfig}
				enableNavPalette={this.props.canvasConfig.enableNavPalette}
				internalObjectModel={this.props.canvasConfig.internalObjectModel}
				setDiagramJSON={this.props.canvasConfig.setDiagramJSON}
				setPaletteJSON={this.props.canvasConfig.setPaletteJSON}
				setDiagramJSON2={this.props.canvasConfig.setDiagramJSON2}
				setPaletteJSON2={this.props.canvasConfig.setPaletteJSON2}
				setLayoutDirection={this.props.canvasConfig.setLayoutDirection}
				useInternalObjectModel={this.props.canvasConfig.useInternalObjectModel}
				setRenderingEngine={this.props.canvasConfig.setRenderingEngine}
				setConnectionType={this.props.canvasConfig.setConnectionType}
				setNodeFormatType={this.props.canvasConfig.setNodeFormatType}
				setLinkType={this.props.canvasConfig.setLinkType}
				setPaletteLayout={this.props.canvasConfig.setPaletteLayout}
				setTipConfig={this.props.canvasConfig.setTipConfig}
				extraCanvasDisplayed={this.props.canvasConfig.extraCanvasDisplayed}
				showExtraCanvas={this.props.canvasConfig.showExtraCanvas}
				narrowPalette={this.props.canvasConfig.narrowPalette}
				setNarrowPalette={this.props.canvasConfig.setNarrowPalette}
				schemaValidation={this.props.canvasConfig.schemaValidation}
				schemaValidationEnabled={this.props.canvasConfig.schemaValidationEnabled}
				validateFlowOnOpen={this.props.canvasConfig.validateFlowOnOpen}
				changeValidateFlowOnOpen={this.props.canvasConfig.changeValidateFlowOnOpen}
				log={this.props.log}
			/>);
			break;
		case SIDE_PANEL_MODAL:
			view = (<SidePanelModal
				log={this.props.log}
				closePropertiesEditorDialog={this.props.propertiesConfig.closePropertiesEditorDialog}
				openPropertiesEditorDialog={this.props.propertiesConfig.openPropertiesEditorDialog}
				setPropertiesJSON={this.props.propertiesConfig.setPropertiesJSON}
				showPropertiesDialog={this.props.propertiesConfig.showPropertiesDialog}
				usePropertiesContainerType={this.props.propertiesConfig.usePropertiesContainerType}
				propertiesContainerType={this.props.propertiesConfig.propertiesContainerType}
				closeSidePanelModal={this.props.propertiesConfig.closeSidePanelModal}
				applyOnBlur={this.props.propertiesConfig.applyOnBlur}
				useApplyOnBlur={this.props.propertiesConfig.useApplyOnBlur}
			/>);
			break;
		case SIDE_PANEL_API:
			view = (<SidePanelAPI
				log={this.props.log}
				getCanvasInfo={this.props.apiConfig.getCanvasInfo}
				getPipelineFlow={this.props.apiConfig.getPipelineFlow}
				setPipelineFlow={this.props.apiConfig.setPipelineFlow}
				addNodeTypeToPalette={this.props.apiConfig.addNodeTypeToPalette}
				setNodeLabel={this.props.apiConfig.setNodeLabel}
				setPortLabel={this.props.apiConfig.setPortLabel}
				setNotificationMessages={this.props.apiConfig.setNotificationMessages}
				appendNotificationMessages={this.props.apiConfig.appendNotificationMessages}
				deleteNotificationMessages={this.props.apiConfig.deleteNotificationMessages}
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
	canvasConfig: PropTypes.shape({
		canvasConfig: PropTypes.object,
		enableNavPalette: PropTypes.func,
		internalObjectModel: PropTypes.bool,
		setDiagramJSON: PropTypes.func,
		setPaletteJSON: PropTypes.func,
		setDiagramJSON2: PropTypes.func,
		setPaletteJSON2: PropTypes.func,
		setLayoutDirection: PropTypes.func,
		useInternalObjectModel: PropTypes.func,
		setRenderingEngine: PropTypes.func,
		setConnectionType: PropTypes.func,
		setNodeFormatType: PropTypes.func,
		setLinkType: PropTypes.func,
		setPaletteLayout: PropTypes.func,
		setTipConfig: PropTypes.func,
		extraCanvasDisplayed: PropTypes.bool,
		showExtraCanvas: PropTypes.func,
		narrowPalette: PropTypes.bool,
		setNarrowPalette: PropTypes.func,
		schemaValidation: PropTypes.func,
		schemaValidationEnabled: PropTypes.bool,
		validateFlowOnOpen: PropTypes.bool,
		changeValidateFlowOnOpen: PropTypes.func
	}),
	propertiesConfig: PropTypes.shape({
		closePropertiesEditorDialog: PropTypes.func,
		openPropertiesEditorDialog: PropTypes.func,
		setPropertiesJSON: PropTypes.func,
		showPropertiesDialog: PropTypes.bool,
		usePropertiesContainerType: PropTypes.func,
		propertiesContainerType: PropTypes.string,
		closeSidePanelModal: PropTypes.func,
		applyOnBlur: PropTypes.bool,
		useApplyOnBlur: PropTypes.func
	}),
	apiConfig: PropTypes.shape({
		getCanvasInfo: PropTypes.func,
		getPipelineFlow: PropTypes.func,
		setPipelineFlow: PropTypes.func,
		addNodeTypeToPalette: PropTypes.func,
		setNodeLabel: PropTypes.func,
		setPortLabel: PropTypes.func,
		setNotificationMessages: PropTypes.func,
		appendNotificationMessages: PropTypes.func,
		deleteNotificationMessages: PropTypes.func
	}),
	openSidepanelCanvas: PropTypes.bool,
	openSidepanelModal: PropTypes.bool,
	openSidepanelAPI: PropTypes.bool,
	selectedPanel: PropTypes.string,
	log: PropTypes.func
};
