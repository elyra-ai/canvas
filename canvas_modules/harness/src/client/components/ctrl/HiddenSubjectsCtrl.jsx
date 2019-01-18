/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
