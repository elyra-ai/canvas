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

import React from "react";
import { useFeatureFlag } from "@carbon/react";

// Elyra Canvas draws some of its own components (tooltip, context menu,
// toolbar sub-menus) to look like Carbon components. Those components don't
// pick up Carbon's v12 styles automatically, so they need to know when the
// 'enable-v12-release' feature flag is on. This wrapper reads the flag (a hook)
// and forwards it to the wrapped component as a plain boolean 'carbonV12' prop,
// which is useful because hooks cannot be called inside class components.
// Wrapped components should add a '--v12' modifier class when the prop is true.
export default function withCarbonV12(WrappedComponent) {
	const WithCarbonV12 = React.forwardRef((props, ref) => {
		const carbonV12 = useFeatureFlag("enable-v12-release");
		return <WrappedComponent {...props} ref={ref} carbonV12={carbonV12} />;
	});

	WithCarbonV12.displayName = `WithCarbonV12(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

	return WithCarbonV12;
}
