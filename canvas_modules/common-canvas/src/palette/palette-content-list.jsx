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
import PaletteContentListItem from "./palette-content-list-item.jsx";

class PaletteContentList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		var contentItems = [];

		if (this.props.category && this.props.category.node_types.length === 0 && this.props.category.empty_text) {
			contentItems.push(
				<div key={"item_empty"}>
					<PaletteContentListItem
						category={this.props.category}
						nodeTemplate={ {} }
						canvasController={this.props.canvasController}
						isPaletteOpen={this.props.isPaletteOpen}
					/>
				</div>
			);
		} else {
			for (var idx = 0; idx < this.props.nodeTypes.length; idx++) {
				var itemKey = "item_" + idx;

				contentItems.push(
					<div key={itemKey}>
						<PaletteContentListItem
							category={this.props.category}
							nodeTemplate={this.props.nodeTypes[idx]}
							canvasController={this.props.canvasController}
							isPaletteOpen={this.props.isPaletteOpen}
						/>
					</div>
				);
			}
		}

		const style = {};
		style.display = this.props.show ? "block" : "none";
		return (
			<div width="100%" draggable="false" className="palette-content-list palette-scroll"
				style={ Object.assign(style, this.props.style) }
			>
				{contentItems}
			</div>
		);
	}
}

PaletteContentList.propTypes = {
	category: PropTypes.object.isRequired,
	nodeTypes: PropTypes.array.isRequired,
	show: PropTypes.bool.isRequired,
	style: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired
};

PaletteContentList.defaultProps = {
	style: {}
};

export default PaletteContentList;
