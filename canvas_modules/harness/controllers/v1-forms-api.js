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
"use strict";
// Modules
const express = require("express");

const getDiagramsListController = require("./v1-get-diagrams-list-controller");
const getPalettesListController = require("./v1-get-palettes-list-controller");
const getPropertiesListController = require("./v1-get-properties-list-controller");
const getFormsListController = require("./v1-get-forms-list-controller");
const getParameterDefsListController = require("./v1-get-parameterdefs-list-controller");

// Globals

const router = express.Router({
	caseSensitive: true,
	mergeParams: true
});

// Public Methods ------------------------------------------------------------->

module.exports = router;

// Private Methods ------------------------------------------------------------>

router.get("/forms/diagrams", getDiagramsListController.get);
router.get("/forms/palettes", getPalettesListController.get);
router.get("/forms/properties", getPropertiesListController.get);
router.get("/forms/forms", getFormsListController.get);
router.get("/forms/parameterDefs", getParameterDefsListController.get);
