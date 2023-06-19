/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import PaletteDialogContentCategory from "./palette-dialog-content-category.jsx";

class PaletteDialogContentCategories extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		var catDivs = [];

		for (var idx = 0; idx < this.props.categories.length; idx++) {
			catDivs.push(
				<PaletteDialogContentCategory
					key={this.props.categories[idx].label}
					category={this.props.categories[idx]}
					selectedCategory={this.props.selectedCategory}
					categorySelectedMethod={this.props.categorySelectedMethod}
				/>
			);
		}

		return (
			<div className="palette-dialog-categories palette-scroll">
				{catDivs}
			</div>
		);
	}
}

PaletteDialogContentCategories.propTypes = {
	categories: PropTypes.array.isRequired,
	selectedCategory: PropTypes.string.isRequired,
	categorySelectedMethod: PropTypes.func.isRequired
};

export default PaletteDialogContentCategories;
