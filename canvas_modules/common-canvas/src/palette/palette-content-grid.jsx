/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import PaletteContentGridNode from "./palette-content-grid-node.jsx";


class PaletteContentGrid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		var gridNodes = [];

		for (var idx = 0; idx < this.props.categoryJSON.length; idx++) {
			gridNodes.push(
				<PaletteContentGridNode key={"pal_grid_node_" + idx}
					nodeTemplate={this.props.categoryJSON[idx]}
					canvasController={this.props.canvasController}
				/>
			);
		}

		const displayValue = this.props.show ? "block" : "none";

		return (
			<div width="100%" className="palette-scroll"
				style={{ display: displayValue }}
			>
				{gridNodes}
			</div>
		);
	}
}

PaletteContentGrid.propTypes = {
	categoryJSON: PropTypes.array.isRequired,
	show: PropTypes.bool.isRequired,
	canvasController: PropTypes.object.isRequired
};

export default PaletteContentGrid;
