/*
 * Copyright 2017-2023 Elyra Authors
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

import { mount as enzymeMount } from "enzyme";

function mount(param1, param2) {
	// Workaround for problem using latest version of react-resize-detector.
	// This mocks the ResizeObserver constructor that otherwise causes an error
	// when using the mount keyword.
	// https://github.com/maslianok/react-resize-detector/issues/145
	delete window.ResizeObserver;
	window.ResizeObserver = jest.fn().mockImplementation(() => ({
		observe: jest.fn(),
		unobserve: jest.fn(),
		disconnect: jest.fn(),
	}));

	const wrapper = enzymeMount(param1, param2);

	return wrapper;
}


module.exports = {
	mount: mount
};
