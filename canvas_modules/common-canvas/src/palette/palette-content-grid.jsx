/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

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
	show: React.PropTypes.string.isRequired
};

export default PaletteContentGrid;
