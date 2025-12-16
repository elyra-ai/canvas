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
// Modules
import { Router } from "express";

import { get as getDiagramsList } from "./v1-get-diagrams-list-controller.js";
import { get as getFormsList } from "./v1-get-forms-list-controller.js";
import { get as getPalettesList } from "./v1-get-palettes-list-controller.js";
import { get as getParameterDefsList } from "./v1-get-parameterdefs-list-controller.js";
import { get as getPropertiesList } from "./v1-get-properties-list-controller.js";

// Globals

const router = Router({
	caseSensitive: true,
	mergeParams: true
});

// Public Methods ------------------------------------------------------------->

export default router;

// Private Methods ------------------------------------------------------------>

router.get("/forms/diagrams", getDiagramsList);
router.get("/forms/palettes", getPalettesList);
router.get("/forms/properties", getPropertiesList);
router.get("/forms/forms", getFormsList);
router.get("/forms/parameterDefs", getParameterDefsList);
