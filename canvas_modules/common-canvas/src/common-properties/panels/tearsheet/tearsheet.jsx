import React, { Component } from "react";
import PropTypes from "prop-types";
import { ComposedModal, ModalHeader, ModalBody } from "carbon-components-react";
import { Portal } from "react-portal";

class TearSheet extends Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false
		};
	}
	componentDidMount() {
		setTimeout(() => {
			this.setState({
				open: true
			});
		}, 0);
	}
	render() {
		const title = this.props.panel.label ? this.props.panel.label : null;
		const description = this.props.panel.description ? this.props.panel.description.text : null;
		return (
			<Portal>
				<ComposedModal
					className="properties-tearsheet-panel"
					open={this.state.open}
					size="lg"
					preventCloseOnClickOutside
				>
					<ModalHeader
						title={title}
						buttonOnClick={() => {
							setTimeout(() => {
								this.props.controller.clearActiveTearsheet();
							}, 500);
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
