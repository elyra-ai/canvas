/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import Modal from "carbon-components-react/lib/components/Modal";
import classNames from "classnames";
import { Portal } from "react-portal";

export default class PropertiesModal extends Component {

	render() {

		return (
			<Portal>
				<Modal
					className={classNames("properties-modal", this.props.bsSize, { "noButtons": this.props.showPropertiesButtons === false })}
					open
					modalHeading={this.props.title}
					primaryButtonText={this.props.applyLabel}
					secondaryButtonText={this.props.rejectLabel}
					onRequestSubmit={this.props.okHandler}
					onSecondarySubmit={this.props.cancelHandler}
					aria-label=""
				>
					<div className="properties-modal-children">
						{this.props.children}
					</div>
				</Modal>
			</Portal>
		);
	}
}

PropertiesModal.propTypes = {
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	bsSize: PropTypes.string,
	title: PropTypes.string,
	children: PropTypes.element,
	showPropertiesButtons: PropTypes.bool,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
};
