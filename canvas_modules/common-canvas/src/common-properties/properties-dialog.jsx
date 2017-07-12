/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import { Button } from "ap-components-react/dist/ap-components-react";
import { OKAY, CANCEL } from "./constants/constants.js";

export default class PropertiesDialog extends Component {

	render() {
		const modalClassName = "modal__container";

		let buttons = (<div>
			<Button
				semantic href=""
				onClick={this.props.okHandler}
				style={{ "marginLeft": "10px" }}
			>
				{OKAY}
			</Button>

			<Button semantic href="" hyperlink onClick={this.props.cancelHandler}>
				{CANCEL}
			</Button>
		</div>);
		if (this.props.showPropertiesButtons === false) {
			buttons = <div></div>;
		}

		return (
				<Modal className="ap-container" {...this.props}
					show
					keyboard
					backdrop="static"
					onHide={this.props.cancelHandler}
				>
					<div className={modalClassName}>
						<div className="modal-title"
							style={{ "paddingBottom": "10px" }}
						>
							<h2>
								{this.props.title}
							</h2>
						</div>
						<div className="modal-children">
							{this.props.children}
						</div>
						<div className="modal__buttons">
							{buttons}
						</div>
					</div>

				</Modal>
			);
	}
}

PropertiesDialog.propTypes = {
	cancelHandler: React.PropTypes.func,
	okHandler: React.PropTypes.func,
	title: React.PropTypes.object,
	children: React.PropTypes.element,
	showPropertiesButtons: React.PropTypes.bool
};
