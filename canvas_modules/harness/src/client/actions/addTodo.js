export default function addTodo(todo) {
	const ADD_TODO = "ADD_TODO";
	return {
		type: ADD_TODO,
		todo
	};
}
