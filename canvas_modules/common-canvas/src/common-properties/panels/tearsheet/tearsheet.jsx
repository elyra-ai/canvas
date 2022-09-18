import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Modal } from "carbon-components-react";
import { Portal } from "react-portal";

class TearSheet extends Component {
	render() {
		const title = this.props.panel.label ? this.props.panel.label : null;
		const description = this.props.panel.description ? this.props.panel.description.default : null;
		return (
			<Portal>
				<Modal
					className="tearsheet-panel"
					open={this.props.panel.id === this.props.panelState}
					passiveModal
					size="lg"
					onRequestClose={() => {
						this.props.controller.clearActiveTearsheet();
					}}
					preventCloseOnClickOutside
				>
					{title ? (<h3>{title}</h3>) : null}
					{description ? (<p>{description}</p>) : null}
					{title || description ? (<hr />) : null}
					{this.props.children}
				</Modal>
			</Portal>);
	}
}
TearSheet.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getActiveTearsheet()
});

export default connect(mapStateToProps, null)(TearSheet);
