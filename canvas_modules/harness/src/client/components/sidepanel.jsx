/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

import SidePanelForms from "./sidepanel-forms.jsx";
import SidePanelStyles from "./sidepanel-styles.jsx";

import {
	SIDE_PANEL,
	SIDE_PANEL_FORMS,
	SIDE_PANEL_STYLES
} from "../constants/constants.js";

export default class SidePanel extends React.Component {

	render() {
		var panelSize = SIDE_PANEL.MINIMIZED;
		if (this.props.openSidepanelForms || this.props.openSidepanelStyles) {
			panelSize = SIDE_PANEL.MAXIMIXED;
		}

		var view = null;
		switch (this.props.selectedPanel) {
		case SIDE_PANEL_FORMS:
			view = (<SidePanelForms
				enableNavPalette={this.props.enableNavPalette}
				setDiagramJSON={this.props.setDiagramJSON}
				setPaletteJSON={this.props.setPaletteJSON}
				log={this.props.log}
			/>);
			break;
		case SIDE_PANEL_STYLES:
			view = (<SidePanelStyles
				setLinkTypeStyle={this.props.setLinkTypeStyle}
				selectedLinkTypeStyle={this.props.selectedLinkTypeStyle}
				log={this.props.log}
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
	openSidepanelForms: React.PropTypes.bool,
	openSidepanelStyles: React.PropTypes.bool,
	setDiagramJSON: React.PropTypes.func,
	setPaletteJSON: React.PropTypes.func,
	setLinkTypeStyle: React.PropTypes.func,
	selectedLinkTypeStyle: React.PropTypes.string,
	selectedPanel: React.PropTypes.string,
	log: React.PropTypes.func
};
