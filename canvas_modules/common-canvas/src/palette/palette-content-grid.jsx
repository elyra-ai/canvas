/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PaletteContentGridNode from "./palette-content-grid-node.jsx";


class PaletteContentGrid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		var gridNodes = [];

		for (var idx = 0; idx < this.props.paletteJSON.length; idx++) {
			gridNodes.push(
				<PaletteContentGridNode key={"pal_grid_node_" + idx}
					nodeTemplate={this.props.paletteJSON[idx]}
					createTempNode={this.props.createTempNode}
					deleteTempNode={this.props.deleteTempNode}
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
	paletteJSON: React.PropTypes.array.isRequired,
	createTempNode: React.PropTypes.func.isRequired,
	deleteTempNode: React.PropTypes.func.isRequired,
	show: React.PropTypes.bool.isRequired
};

export default PaletteContentGrid;
