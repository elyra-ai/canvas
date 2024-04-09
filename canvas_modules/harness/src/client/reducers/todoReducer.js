const initialState = {
	todo: "Nothing"
};

// You have to handle immutability.
export default function todoReducer(state = initialState, action) {
	switch (action.type) {
	case "ADD_TODO":
		return { ...state, todo: action.todo };
	case "DELETE_TODO":
		return { ...state, todo: "Nothing to see here." };
	default:
		return state;
	}
}
