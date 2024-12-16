/*
 * Copyright 2017-2025 Elyra Authors
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
import { connect } from "react-redux";


class HiddenSubjectsCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	componentDidUpdate() {
		this.props.callback();
	}

	render() {
		return (
			<div />
		);
	}
}

HiddenSubjectsCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	callback: PropTypes.func.isRequired,
	data: PropTypes.object,
	result: PropTypes.bool,
	subjectsUIValue: PropTypes.array, // passed in by redux
	rMeasuresUIValue: PropTypes.array // passed in by redux
};

const mapStateToProps = (state, ownProps) => ({
	subjectsUIValue: ownProps.controller.getPropertyValue({ name: "residual_subject_ui_spec" }),
	rMeasuresUIValue: ownProps.controller.getPropertyValue({ name: "repeated_ui_measures" })
});

export default connect(mapStateToProps, null)(HiddenSubjectsCtrl);
