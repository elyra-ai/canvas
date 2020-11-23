/*
 * Copyright 2017-2020 Elyra Authors
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

class PaletteContentCategory extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.categorySelected = this.categorySelected.bind(this);
	}


	categorySelected(catSelEvent) {
		this.props.categorySelectedMethod(catSelEvent);
	}

	render() {
		var style = "palette-category";

		if (this.props.selectedCategory === this.props.categoryName) {
			style = "palette-category-selected";
		}

		return (
			<div className={style} onClick={this.categorySelected}>
				{this.props.categoryName}
			</div>
		);
	}
}

PaletteContentCategory.propTypes = {
	categoryName: PropTypes.string.isRequired,
	selectedCategory: PropTypes.string.isRequired,
	categorySelectedMethod: PropTypes.func.isRequired
};

export default PaletteContentCategory;
