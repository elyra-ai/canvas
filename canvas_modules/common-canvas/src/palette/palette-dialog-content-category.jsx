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

class PaletteDialogContentCategory extends React.Component {
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
		var style = "palette-dialog-category";

		if (this.props.selectedCategory === this.props.category.label) {
			style = "palette-dialog-category-selected";
		}

		return (
			<div data-id={this.props.category.id} className={style} onClick={this.categorySelected}>
				{this.props.category.label}
			</div>
		);
	}
}

PaletteDialogContentCategory.propTypes = {
	category: PropTypes.object.isRequired,
	selectedCategory: PropTypes.string.isRequired,
	categorySelectedMethod: PropTypes.func.isRequired
};

export default PaletteDialogContentCategory;
