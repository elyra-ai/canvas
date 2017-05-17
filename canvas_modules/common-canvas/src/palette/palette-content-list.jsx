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
import PaletteContentListItem from "./palette-content-list-item.jsx";

class PaletteContentList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		var contentItems = [];

		for (var idx = 0; idx < this.props.paletteJSON.length; idx++) {
			var itemKey = "item_" + idx;

			contentItems.push(
				<div key={itemKey}>
					<PaletteContentListItem
						nodeTemplate={this.props.paletteJSON[idx]}
						createTempNode={this.props.createTempNode}
						deleteTempNode={this.props.deleteTempNode}
					/>
				</div>
			);
		}

		const displayValue = this.props.show ? "block" : "none";

		return (
			<div width="100%" draggable="false" className="palette-content-list palette-scroll"
				style={{ display: displayValue }}
			>
				{contentItems}
			</div>
		);
	}
}

PaletteContentList.propTypes = {
	paletteJSON: React.PropTypes.array.isRequired,
	createTempNode: React.PropTypes.func.isRequired,
	deleteTempNode: React.PropTypes.func.isRequired,
	show: React.PropTypes.string.isRequired
};

export default PaletteContentList;
