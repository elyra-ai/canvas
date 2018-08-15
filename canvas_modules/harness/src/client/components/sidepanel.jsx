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
				commonCanvasConfig={this.props.canvasConfig.commonCanvasConfig}
				enableNavPalette={this.props.canvasConfig.enableNavPalette}
				internalObjectModel={this.props.canvasConfig.internalObjectModel}
				setDiagramJSON={this.props.canvasConfig.setDiagramJSON}
				setPaletteJSON={this.props.canvasConfig.setPaletteJSON}
				setDiagramJSON2={this.props.canvasConfig.setDiagramJSON2}
				setPaletteJSON2={this.props.canvasConfig.setPaletteJSON2}
				canvasFileChooserVisible={this.props.canvasConfig.canvasFileChooserVisible}
				canvasFileChooserVisible2={this.props.canvasConfig.canvasFileChooserVisible2}
				paletteFileChooserVisible={this.props.canvasConfig.paletteFileChooserVisible}
				paletteFileChooserVisible2={this.props.canvasConfig.paletteFileChooserVisible2}
				setCanvasDropdownFile={this.props.canvasConfig.setCanvasDropdownFile}
				setCanvasDropdownFile2={this.props.canvasConfig.setCanvasDropdownFile2}
				selectedCanvasDropdownFile={this.props.canvasConfig.selectedCanvasDropdownFile}
				selectedCanvasDropdownFile2={this.props.canvasConfig.selectedCanvasDropdownFile2}
				setPaletteDropdownSelect={this.props.canvasConfig.setPaletteDropdownSelect}
				setPaletteDropdownSelect2={this.props.canvasConfig.setPaletteDropdownSelect2}
				selectedPaletteDropdownFile={this.props.canvasConfig.selectedPaletteDropdownFile}
				selectedPaletteDropdownFile2={this.props.canvasConfig.selectedPaletteDropdownFile2}
				setLayoutDirection={this.props.canvasConfig.setLayoutDirection}
				selectedLayout={this.props.canvasConfig.selectedLayout}
				useInternalObjectModel={this.props.canvasConfig.useInternalObjectModel}
				setConnectionType={this.props.canvasConfig.setConnectionType}
				selectedConnectionType={this.props.canvasConfig.selectedConnectionType}
				setNodeFormatType={this.props.canvasConfig.setNodeFormatType}
				selectedNodeFormat={this.props.canvasConfig.selectedNodeFormat}
				setLinkType={this.props.canvasConfig.setLinkType}
				selectedLinkType={this.props.canvasConfig.selectedLinkType}
				setPaletteLayout={this.props.canvasConfig.setPaletteLayout}
				selectedPaletteLayout={this.props.canvasConfig.selectedPaletteLayout}
				setTipConfig={this.props.canvasConfig.setTipConfig}
				extraCanvasDisplayed={this.props.canvasConfig.extraCanvasDisplayed}
				showExtraCanvas={this.props.canvasConfig.showExtraCanvas}
				narrowPalette={this.props.canvasConfig.narrowPalette}
				setNarrowPalette={this.props.canvasConfig.setNarrowPalette}
				schemaValidation={this.props.canvasConfig.schemaValidation}
				schemaValidationEnabled={this.props.canvasConfig.schemaValidationEnabled}
				validateFlowOnOpen={this.props.canvasConfig.validateFlowOnOpen}
				changeValidateFlowOnOpen={this.props.canvasConfig.changeValidateFlowOnOpen}
				enableCreateSupernodeNonContiguous={this.props.canvasConfig.enableCreateSupernodeNonContiguous}
				useEnableCreateSupernodeNonContiguous={this.props.canvasConfig.useEnableCreateSupernodeNonContiguous}
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
				expressionBuilder={this.props.propertiesConfig.expressionBuilder}
				useExpressionBuilder={this.props.propertiesConfig.useExpressionBuilder}
				displayAdditionalComponents={this.props.propertiesConfig.displayAdditionalComponents}
				useDisplayAdditionalComponents={this.props.propertiesConfig.useDisplayAdditionalComponents}
				selectedPropertiesDropdownFile={this.props.propertiesConfig.selectedPropertiesDropdownFile}
				selectedPropertiesFileCategory={this.props.propertiesConfig.selectedPropertiesFileCategory}
				fileChooserVisible={this.props.propertiesConfig.fileChooserVisible}
				setPropertiesDropdownSelect={this.props.propertiesConfig.setPropertiesDropdownSelect}
			/>);
			break;
		case SIDE_PANEL_API:
			view = (<SidePanelAPI
				log={this.props.log}
				getCanvasInfo={this.props.apiConfig.getCanvasInfo}
				selectedOperation={this.props.apiConfig.selectedOperation}
				setApiSelectedOperation={this.props.apiConfig.setApiSelectedOperation}
				getPipelineFlow={this.props.apiConfig.getPipelineFlow}
				setPipelineFlow={this.props.apiConfig.setPipelineFlow}
				addNodeTypeToPalette={this.props.apiConfig.addNodeTypeToPalette}
				setNodeLabel={this.props.apiConfig.setNodeLabel}
				setPortLabel={this.props.apiConfig.setPortLabel}
				appendNotificationMessages={this.props.apiConfig.appendNotificationMessages}
				clearNotificationMessages={this.props.apiConfig.clearNotificationMessages}
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
		commonCanvasConfig: PropTypes.object,
		enableNavPalette: PropTypes.func,
		internalObjectModel: PropTypes.bool,
		setDiagramJSON: PropTypes.func,
		setPaletteJSON: PropTypes.func,
		setDiagramJSON2: PropTypes.func,
		setPaletteJSON2: PropTypes.func,
		canvasFileChooserVisible: PropTypes.bool,
		canvasFileChooserVisible2: PropTypes.bool,
		paletteFileChooserVisible: PropTypes.bool,
		paletteFileChooserVisible2: PropTypes.bool,
		enableCreateSupernodeNonContiguous: PropTypes.bool,
		useEnableCreateSupernodeNonContiguous: PropTypes.func,
		selectedCanvasDropdownFile: PropTypes.string,
		selectedCanvasDropdownFile2: PropTypes.string,
		setCanvasDropdownFile: PropTypes.func,
		setCanvasDropdownFile2: PropTypes.func,
		selectedPaletteDropdownFile: PropTypes.string,
		selectedPaletteDropdownFile2: PropTypes.string,
		setPaletteDropdownSelect: PropTypes.func,
		setPaletteDropdownSelect2: PropTypes.func,
		setLayoutDirection: PropTypes.func,
		selectedLayout: PropTypes.string,
		useInternalObjectModel: PropTypes.func,
		setConnectionType: PropTypes.func,
		selectedConnectionType: PropTypes.string,
		setNodeFormatType: PropTypes.func,
		selectedNodeFormat: PropTypes.string,
		setLinkType: PropTypes.func,
		selectedLinkType: PropTypes.string,
		setPaletteLayout: PropTypes.func,
		selectedPaletteLayout: PropTypes.string,
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
		useApplyOnBlur: PropTypes.func,
		expressionBuilder: PropTypes.bool,
		useExpressionBuilder: PropTypes.func,
		displayAdditionalComponents: PropTypes.bool,
		useDisplayAdditionalComponents: PropTypes.func,
		selectedPropertiesDropdownFile: PropTypes.string,
		selectedPropertiesFileCategory: PropTypes.string,
		fileChooserVisible: PropTypes.bool,
		setPropertiesDropdownSelect: PropTypes.func
	}),
	apiConfig: PropTypes.shape({
		getCanvasInfo: PropTypes.func,
		selectedOperation: PropTypes.string,
		setApiSelectedOperation: PropTypes.func,
		getPipelineFlow: PropTypes.func,
		setPipelineFlow: PropTypes.func,
		addNodeTypeToPalette: PropTypes.func,
		setNodeLabel: PropTypes.func,
		setPortLabel: PropTypes.func,
		appendNotificationMessages: PropTypes.func,
		clearNotificationMessages: PropTypes.func
	}),
	openSidepanelCanvas: PropTypes.bool,
	openSidepanelModal: PropTypes.bool,
	openSidepanelAPI: PropTypes.bool,
	selectedPanel: PropTypes.string,
	log: PropTypes.func
};
