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
import PaletteFlyoutContent from "./palette-flyout-content.jsx";

// eslint override
/* global window document */

class PaletteFlyout extends React.Component {
	constructor(props) {
		super(props);
		this.paletteNodes = [];
	}

	render() {
		var className = "palette-flyout-div";
		// hide side panel
		if (this.props.showPalette) {
			className += " palette-flyout-div-open";
		} else {
			className += " palette-flyout-div-closed";
		}

		return (
			<div className={className}>
				<PaletteFlyoutContent
					paletteJSON={this.props.paletteJSON}
				/>
			</div>
		);
	}
}

PaletteFlyout.propTypes = {
	paletteJSON: PropTypes.object.isRequired,
	showPalette: PropTypes.bool.isRequired
};

export default PaletteFlyout;
