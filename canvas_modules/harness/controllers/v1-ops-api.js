/*
 * Copyright 2017-2026 Elyra Authors
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
import { get } from "./v1-get-syntax-check-controller.js";
import { setCspEnabled } from "../lib/csp-state.js";

// Globals

const router = Router({
	caseSensitive: true,
	mergeParams: true
});

// Public Methods ------------------------------------------------------------->

export default router;

// Private Methods ------------------------------------------------------------>

router.get("/ops", get);

/**
 * Sets the CSP-enabled state.  Expects a JSON body: `{ "enabled": true|false }`.
 * Responds with 204 No Content; the client navigates to a fresh page load after
 * this call returns so that the updated Content-Security-Policy header (or its
 * absence) takes effect.
 */
router.post("/csp-enabled", (req, res) => {
	const { enabled } = req.body;
	if (typeof enabled !== "boolean") {
		res.status(400).json({ error: "Body must be { \"enabled\": true|false }" });
		return;
	}
	setCspEnabled(enabled);
	res.status(204).end();
});
