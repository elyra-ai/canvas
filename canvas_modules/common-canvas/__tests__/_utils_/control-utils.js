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

// Retrieve the dropdown items from a non-filterable dropdown control
function getDropdownItems(wrapper, parameterId) {
	let dropdownWrapper = wrapper.find(`div[data-id='properties-${parameterId}']`);
	const dropdownButton = dropdownWrapper.find("button");
	dropdownButton.simulate("click");
	dropdownWrapper = wrapper.find(`div[data-id='properties-${parameterId}']`);
	const dropdownList = dropdownWrapper.find("div.bx--list-box__menu-item");
	return dropdownList;
}

module.exports = {
	getDropdownItems: getDropdownItems
};
