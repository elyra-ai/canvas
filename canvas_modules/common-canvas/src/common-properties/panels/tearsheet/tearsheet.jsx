import React, { Component } from "react";
import PropTypes from "prop-types";
import { ComposedModal, ModalHeader, ModalBody } from "carbon-components-react";
import { Portal } from "react-portal";

class TearSheet extends Component {
	render() {
		const title = this.props.tearsheet ? this.props.tearsheet.title : null;
		const description = this.props.tearsheet ? this.props.tearsheet.description : null;
		const content = this.props.tearsheet ? this.props.tearsheet.content : null;
		return (
			<Portal>
				<ComposedModal
					className="properties-tearsheet-panel"
					open={this.props.open}
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
						{content}
					</ModalBody>
				</ComposedModal>
			</Portal>);
	}
}
TearSheet.propTypes = {
	open: PropTypes.bool,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array,
	tearsheet: PropTypes.object
};

export default TearSheet;
