import React from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import addTodo from "./actions/addTodo";
import deleteTodo from "./actions/deleteTodo";

class Todo extends React.Component {

	render() {
		return (
			<div>
				<button onClick={() => this.props.addTodo("We now have something to do")}>
					Add Todo
				</button>
				<button onClick={() => this.props.deleteTodo()}>
					Delete Todo
				</button>
				<p>
					{this.props.todo}
				</p>
			</div>
		);
	}

}

// eslint-disable-next-line arrow-body-style
const mapStateToProps = (state) => {
	return {
		todo: state.todo.todo
	};
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ addTodo, deleteTodo }, dispatch);


Todo.propTypes = {
	addTodo: PropTypes.func,
	deleteTodo: PropTypes.func,
	todo: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(Todo);
