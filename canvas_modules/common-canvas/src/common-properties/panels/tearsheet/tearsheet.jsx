import React, { Component } from "react";
import PropTypes from "prop-types";
import { ComposedModal, ModalHeader, ModalBody } from "carbon-components-react";
import { Portal } from "react-portal";

class TearSheet extends Component {
	render() {
		const title = this.props.panel.label ? this.props.panel.label : null;
		const description = this.props.panel.description ? this.props.panel.description.default : null;
		return (
			<Portal>
				<ComposedModal
					className="properties-tearsheet-panel"
					open
					size="lg"
					preventCloseOnClickOutside
				>
					<ModalHeader
						title={title}
						buttonOnClick={() => {
							this.props.controller.clearActiveTearsheet();
						}}
					>
						{description ? (<p>{description}</p>) : null}
					</ModalHeader>
					<ModalBody>
						{this.props.children}
					</ModalBody>
				</ComposedModal>
			</Portal>);
	}
}
TearSheet.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array
};

export default TearSheet;
