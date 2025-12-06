/*
 * Copyright 2025 Elyra Authors
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

import { IntlProvider } from "react-intl";
import { CommonCanvas, CanvasController } from "@elyra/canvas";
import { useMemo } from "react";
import { Theme } from "@carbon/react";

import CarbonPalette from "../../test_resources/palettes/carbonPalette.json" with { type: "json" };
import CarbonFlow from "../../test_resources/diagrams/carbonCanvas.json" with { type: "json" };

const AppTiny = () => {
  const canvasController = useMemo(() => {
    const cc = new CanvasController();
    cc.setPipelineFlowPalette(CarbonPalette);
    cc.setPipelineFlow(CarbonFlow);
    cc.openPalette();
    return cc;
  }, []);

  return (
    <Theme theme="g10">
      <div style={{ height: "100vh" }}>
        <IntlProvider locale="en">
          <CommonCanvas canvasController={canvasController} />
        </IntlProvider>
      </div>
    </Theme>
  );
};

export default AppTiny;

