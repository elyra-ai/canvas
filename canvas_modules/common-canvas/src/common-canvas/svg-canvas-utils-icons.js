/*
 * Copyright 2026 Elyra Authors
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

// Standard Carbon icons for display in the canvas under the control of D3.
// This avoids the need to create a React root (in a foreignObject) for each
// icon. Each Carbon icon descriptor (from @carbon/icons) is converted, once, at
// module load time to the markup of its child elements plus its viewBox. D3 can
// then insert it, using .html(), into any <svg> element it creates.
//
// The @carbon/icons and @carbon/icon-helpers packages are deliberately listed
// in devDependencies, not dependencies, in package.json. The rollup build only
// treats packages in dependencies and peerDependencies as external, so, as
// these packages are not in either list, rollup bundles the icon data this
// file imports into dist. This means consumers of the canvas do not need to
// install them. Do not move them to dependencies or peerDependencies without
// considering that they will then be imported at runtime.

import { toString as iconToString } from "@carbon/icon-helpers";
import editIcon16 from "@carbon/icons/es/edit/16.js";
import errorFilled16 from "@carbon/icons/es/error--filled/16.js";
import launch16 from "@carbon/icons/es/launch/16.js";
import overflowMenuVertical16 from "@carbon/icons/es/overflow-menu--vertical/16.js";
import warningFilled16 from "@carbon/icons/es/warning--filled/16.js";

// Returns an object, describing the icon, that can be displayed by D3.
// Parameters:
//   descriptor - a Carbon icon descriptor from the @carbon/icons package
//   className - (optional) class name(s) to be added to the <svg> element
//               containing the icon. These allow SCSS to color the icon.
//   viewBox - (optional) overrides the viewBox of the Carbon icon. This can be
//             used to crop an icon that has a lot of padding around its shape
//             so it fills the area allocated to it in the canvas.
function createCarbonSvgIcon(descriptor, className = "", viewBox = descriptor.attrs.viewBox) {
	return Object.freeze({
		isCarbonSvgIcon: true,
		className,
		viewBox,
		content: descriptor.content.map((child) => iconToString(child)).join("")
	});
}

export const ERROR_STATE_ICON = createCarbonSvgIcon(errorFilled16, "state-icon-error");
export const WARNING_STATE_ICON = createCarbonSvgIcon(warningFilled16, "state-icon-warning");

export const EDIT_ICON = createCarbonSvgIcon(editIcon16);

// The vertical overflow icon is three dots, with centers at x=16 and
// y=8, 16 and 24 and with a radius of 2, within a 32 x 32 viewBox. The canvas
// displays the icon in a 6 x 18 area, so we crop the viewBox to 9 x 27, centered
// on the dots. This scales the icon by about 0.67, which gives dots of a similar
// size and spacing to those of the icon this replaced.
export const NODE_MENU_ICON = createCarbonSvgIcon(overflowMenuVertical16, "", "11.5 2.5 9 27");

export const SUPER_NODE_EXPAND_ICON = createCarbonSvgIcon(launch16);
