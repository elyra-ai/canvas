/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

import SidePanelCanvas from "./sidepanel-canvas.jsx";
import SidePanelStyles from "./sidepanel-styles.jsx";
import SidePanelModal from "./sidepanel-modal.jsx";

import {
	SIDE_PANEL,
	SIDE_PANEL_CANVAS,
	SIDE_PANEL_STYLES,
	SIDE_PANEL_MODAL
} from "../constants/constants.js";

export default class SidePanel extends React.Component {

	render() {
		var panelSize = SIDE_PANEL.MINIMIZED;
		if (this.props.openSidepanelCanvas ||
			this.props.openSidepanelStyles ||
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
				useInternalObjectModel={this.props.useInternalObjectModel}
				log={this.props.log}
			/>);
			break;
		case SIDE_PANEL_STYLES:
			view = (<SidePanelStyles
				setLinkTypeStyle={this.props.setLinkTypeStyle}
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
	enableNavPalette: React.PropTypes.func,
	internalObjectModel: React.PropTypes.bool,
	closePropertiesEditorDialog: React.PropTypes.func,
	openPropertiesEditorDialog: React.PropTypes.func,
	openSidepanelCanvas: React.PropTypes.bool,
	openSidepanelStyles: React.PropTypes.bool,
	openSidepanelModal: React.PropTypes.bool,
	setDiagramJSON: React.PropTypes.func,
	setPaletteJSON: React.PropTypes.func,
	setPropertiesJSON: React.PropTypes.func,
	setLayoutDirection: React.PropTypes.func,
	setLinkTypeStyle: React.PropTypes.func,
	selectedPanel: React.PropTypes.string,
	showPropertiesDialog: React.PropTypes.bool,
	useInternalObjectModel: React.PropTypes.func,
	log: React.PropTypes.func
};
