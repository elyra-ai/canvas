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

import React, { Component } from "react";
import PropTypes from "prop-types";
import { injectIntl } from "react-intl";
import classNames from "classnames";
import { formatMessage } from "./../../util/property-utils";
import { ComposedModal, ModalHeader, ModalBody } from "carbon-components-react";
import { Portal } from "react-portal";
import { MESSAGE_KEYS } from "./../../constants/constants";
import PropertiesButtons from "../../components/properties-buttons";

class TearSheet extends Component {
	render() {
		const title = this.props.tearsheet ? this.props.tearsheet.title : null;
		const description = this.props.tearsheet ? this.props.tearsheet.description : null;
		const content = this.props.tearsheet ? this.props.tearsheet.content : null;
		const displayFooterButtons = this.props.showPropertiesButtons && !this.props.applyOnBlur;
		const displayTabs = !Array.isArray(content);

		const buttons = this.props.applyOnBlur
			? null
			: (<PropertiesButtons
				okHandler={this.props.okHandler}
				cancelHandler={this.props.cancelHandler}
				applyLabel={this.props.applyLabel}
				rejectLabel={this.props.rejectLabel}
				showPropertiesButtons={this.props.showPropertiesButtons}
			/>);

		return (
			<Portal>
				<ComposedModal
					className={classNames("properties-tearsheet-panel", { "properties-tearsheet-stacked": this.props.stacked })}
					open={this.props.open}
					size="lg"
					aria-label={formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_LABEL, { label: title })}
					preventCloseOnClickOutside
				>
					{title === null
						? null
						: (<ModalHeader
							className={classNames("properties-tearsheet-header",
								{ "with-buttons": displayFooterButtons },
								{ "with-tabs": displayTabs },
								{ "hide-close-button": typeof this.props.onCloseCallback !== "function" })}
							title={title}
							buttonOnClick={this.props.onCloseCallback}
						>
							{description ? (<p>{description}</p>) : null}
						</ModalHeader>)
					}
					<ModalBody className={classNames("properties-tearsheet-body",
						{ "with-buttons": displayFooterButtons },
						{ "with-tabs": displayTabs })}
					>
						{content}
					</ModalBody>
					{buttons}
				</ComposedModal>
			</Portal>);
	}
}
TearSheet.propTypes = {
	open: PropTypes.bool,
	stacked: PropTypes.bool,
	onCloseCallback: PropTypes.func,
	tearsheet: PropTypes.shape({
		title: PropTypes.string,
		description: PropTypes.string,
		content: PropTypes.oneOfType([
			PropTypes.array,
			PropTypes.object
		])
	}),
	showPropertiesButtons: PropTypes.bool,
	applyLabel: PropTypes.string, // Required if showPropertiesButtons is true
	rejectLabel: PropTypes.string, // Required if showPropertiesButtons is true
	okHandler: PropTypes.func, // Required if showPropertiesButtons is true
	cancelHandler: PropTypes.func, // Required if showPropertiesButtons is true
	applyOnBlur: PropTypes.bool.isRequired,
	intl: PropTypes.object.isRequired
};

TearSheet.defaultProps = {
	open: false,
	showPropertiesButtons: false,
	applyOnBlur: false,
	stacked: false
};

export default injectIntl(TearSheet);
