/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";

export default class Breadcrumbs extends React.Component {

	createBreadcrumbs() {
		const that = this;
		const breadcrumbs = this.props.breadcrumbsDef.map((breadcrumbDef, index) => {
			const label = breadcrumbDef.label;
			const separator = index !== this.props.breadcrumbsDef.length - 1
				? <span className="harness-pipeline-breadcrumbs-separator">/</span>
				: <div />;
			const link = index !== this.props.breadcrumbsDef.length - 1
				? (<button className="harness-pipeline-breadcrumbs-label"
					key={breadcrumbDef.pipelineId}
					onClick={that.breadcrumbOnClick.bind(that, breadcrumbDef.pipelineId) }
				>
					{label}
				</button>)
				: (<div className="harness-pipeline-breadcrumbs-label last-item">
					{label}
				</div>);

			return (
				<div className="harness-pipeline-breadcrumbs" key={breadcrumbDef.pipelineId}>
					{link}
					{separator}
				</div>
			);
		});
		return breadcrumbs;
	}

	breadcrumbOnClick(pipelineId) {
		this.props.canvasController.displaySubPipeline({ pipelineId: pipelineId });
	}

	render() {
		return this.createBreadcrumbs();
	}
}

Breadcrumbs.propTypes = {
	canvasController: PropTypes.object.isRequired,
	breadcrumbsDef: PropTypes.array.isRequired
};
