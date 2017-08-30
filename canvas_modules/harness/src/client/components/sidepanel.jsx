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

import {
	SIDE_PANEL,
	SIDE_PANEL_CANVAS,
	SIDE_PANEL_MODAL
} from "../constants/constants.js";

export default class SidePanel extends React.Component {

	render() {
		var panelSize = SIDE_PANEL.MINIMIZED;
		if (this.props.openSidepanelCanvas ||
			this.props.openSidepanelModal) {
			panelSize = SIDE_PANEL.MAXIMIXED;
		}

		var view = null;
		switch (this.props.selectedPanel) {
		case SIDE_PANEL_CANVAS:
			view = (<SidePanelCanvas
				enableNavPalette={this.props.enableNavPalette}
				internalObjectModel={this.props.internalObjectModel}
				setDiagramJSON={this.props.setDiagramJSON}
				setPaletteJSON={this.props.setPaletteJSON}
				setLayoutDirection={this.props.setLayoutDirection}
				setOneTimeLayoutDirection={this.props.setOneTimeLayoutDirection}
				useInternalObjectModel={this.props.useInternalObjectModel}
				setRenderingEngine={this.props.setRenderingEngine}
				setConnectionType={this.props.setConnectionType}
				setLinkType={this.props.setLinkType}
				setPaletteLayout={this.props.setPaletteLayout}
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
				modalPropertiesDialog={this.props.modalPropertiesDialog}
				useModalPropertiesDialog={this.props.useModalPropertiesDialog}
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
	enableNavPalette: PropTypes.func,
	internalObjectModel: PropTypes.bool,
	closePropertiesEditorDialog: PropTypes.func,
	openPropertiesEditorDialog: PropTypes.func,
	openSidepanelCanvas: PropTypes.bool,
	openSidepanelModal: PropTypes.bool,
	setDiagramJSON: PropTypes.func,
	setPaletteJSON: PropTypes.func,
	setPropertiesJSON: PropTypes.func,
	setLayoutDirection: PropTypes.func,
	setOneTimeLayoutDirection: PropTypes.func,
	selectedPanel: PropTypes.string,
	showPropertiesDialog: PropTypes.bool,
	useInternalObjectModel: PropTypes.func,
	modalPropertiesDialog: PropTypes.bool,
	useModalPropertiesDialog: PropTypes.func,
	setRenderingEngine: PropTypes.func,
	setConnectionType: PropTypes.func,
	setLinkType: PropTypes.func,
	setPaletteLayout: PropTypes.func,
	log: PropTypes.func
};
