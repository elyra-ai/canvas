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
					onClick={that.breadcrumbOnClick.bind(that, breadcrumbDef) }
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

	breadcrumbOnClick(breadcrumbDef) {
		this.props.canvasController.displaySubPipeline(breadcrumbDef.pipelineId);
	}

	render() {
		return this.createBreadcrumbs();
	}
}

Breadcrumbs.propTypes = {
	canvasController: PropTypes.object.isRequired,
	breadcrumbsDef: PropTypes.array.isRequired
};
