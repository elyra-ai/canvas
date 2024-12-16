/*
 * Copyright 2017-2025 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default (state = [], action) => {
	switch (action.type) {
	case "CLEAR_NOTIFICATION_MESSAGES":
		return [];

	case "SET_NOTIFICATION_MESSAGES": {
		action.data.messages.forEach((msg) => convertMsgType(msg));
		return action.data.messages;
	}

	case "DELETE_NOTIFICATION_MESSAGES": {
		const filterIds = Array.isArray(action.data.ids) ? action.data.ids : [action.data.ids];
		const messages = state.filter((message) => !filterIds.includes(message.id));
		return messages;
	}

	default:
		return state;
	}
};

function convertMsgType(msg) {
	if (msg.type === null || msg.type === "" || typeof msg.type === "undefined") {
		msg.type = "unspecified";
	}
	return msg;
}
