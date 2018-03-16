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

		for (var idx = 0; idx < this.props.categoryJSON.length; idx++) {
			var itemKey = "item_" + idx;

			contentItems.push(
				<div key={itemKey}>
					<PaletteContentListItem
						nodeTemplate={this.props.categoryJSON[idx]}
						canvasController={this.props.canvasController}
						isPaletteOpen={this.props.isPaletteOpen}
					/>
				</div>
			);
		}

		const style = this.props.style;
		style.display = this.props.show ? "block" : "none";
		return (
			<div width="100%" draggable="false" className="palette-content-list palette-scroll"
				style={ style }
			>
				{contentItems}
			</div>
		);
	}
}

PaletteContentList.propTypes = {
	categoryJSON: PropTypes.array.isRequired,
	show: PropTypes.bool.isRequired,
	style: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	isPaletteOpen: PropTypes.bool.isRequired
};

PaletteContentList.defaultProps = {
	style: {}
};

export default PaletteContentList;
