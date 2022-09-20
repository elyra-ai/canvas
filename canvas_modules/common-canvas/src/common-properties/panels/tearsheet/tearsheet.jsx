import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal } from "carbon-components-react";
import { Portal } from "react-portal";

class TearSheet extends Component {
	componentDidMount() {
		document.querySelector(".bx--modal-close").blur();
	}
	render() {
		const title = this.props.panel.label ? this.props.panel.label : null;
		const description = this.props.panel.description ? this.props.panel.description.default : null;
		return (
			<Portal>
				<Modal
					className="properties-tearsheet-panel"
					open
					passiveModal
					size="lg"
					onRequestClose={() => {
						this.props.controller.clearActiveTearsheet();
					}}
					preventCloseOnClickOutside
				>
					<div className="properties-tearsheet-header">
						{title ? (<h3>{title}</h3>) : null}
						{description ? (<p>{description}</p>) : null}
					</div>
					<div className="properties-tearsheet-body">
						{this.props.children}
					</div>
				</Modal>
			</Portal>);
	}
}
TearSheet.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array
};

export default TearSheet;
