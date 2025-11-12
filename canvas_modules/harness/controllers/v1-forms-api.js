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
// Modules
import { Router } from "express";

import { get } from "./v1-get-diagrams-list-controller";
import { get as _get } from "./v1-get-forms-list-controller"; // eslint-disable-line sort-imports
import { get as __get } from "./v1-get-palettes-list-controller"; // eslint-disable-line sort-imports
import { get as ___get } from "./v1-get-parameterdefs-list-controller"; // eslint-disable-line sort-imports
import { get as ____get } from "./v1-get-properties-list-controller"; // eslint-disable-line sort-imports

// Globals

const router = Router({
	caseSensitive: true,
	mergeParams: true
});

// Public Methods ------------------------------------------------------------->

export default router;

// Private Methods ------------------------------------------------------------>

router.get("/forms/diagrams", get);
router.get("/forms/palettes", __get);
router.get("/forms/properties", ____get);
router.get("/forms/forms", _get);
router.get("/forms/parameterDefs", ___get);
