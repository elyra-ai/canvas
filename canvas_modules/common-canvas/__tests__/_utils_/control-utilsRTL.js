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

const { fireEvent } = require("@testing-library/react");

// Retrieve the dropdown items from a non-filterable dropdown control
function getDropdownItems(container, parameterId) {
	let dropdownWrapper = container.querySelector(`div[data-id='properties-${parameterId}']`);
	const dropdownButton = dropdownWrapper.querySelector("button");
	fireEvent.click(dropdownButton);
	dropdownWrapper = container.querySelector(`div[data-id='properties-${parameterId}']`);
	const dropdownList = dropdownWrapper.querySelectorAll("li.cds--list-box__menu-item");
	return dropdownList;
}

module.exports = {
	getDropdownItems: getDropdownItems
};
