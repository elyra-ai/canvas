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

import SampleContent from "./sample-content.tsx";
import allTypesCanvas from "../../harness/test_resources/diagrams/allTypesCanvas.json";
import modelerPalette from "../../harness/test_resources/palettes/modelerPalette.json";

import {
  PipelineFlowDef,
  CanvasNode,
  CanvasController,
  CommonCanvas,
  CommonProperties,
  CommonPropertiesController,
} from "./index";

import { expectType } from "tsd";

const canvasController = new CanvasController();

expectType<void>(canvasController.setPipelineFlow(allTypesCanvas));

expectType<PipelineFlowDef>(canvasController.getPipelineFlow())

expectType<void>(canvasController.clearPipelineFlow());

expectType<void>(canvasController.setPipelineFlowPalette(modelerPalette));

expectType<CanvasNode>(
  canvasController.createNode({
    nodeTemplate: {
      id: "id1",
      type: "execution_node",
      op: "testOp",
      app_data: {
        ui_data: {
          label: "testOp Node",
          x_pos: 0,
          y_pos: 0
        }
      }
    },
    offsetX: 100,
    offsetY: 200
  })
);

expectType<void>(
  canvasController.addNode({
    id: "id1",
    type: "execution_node",
    op: "testOp",
    x_pos: 5,
    y_pos: 6,
    app_data: {},
    height: 10,
    width: 20,
  })
);
expectType<void>(
  canvasController.addNode(
    {
      id: "id1",
      type: "execution_node",
      op: "testOp",
      x_pos: 5,
      y_pos: 6,
      app_data: {},
      height: 10,
      width: 20,
    },
    "pipelineId1"
  )
);
expectType<void>(
  canvasController.addNode(
    {
      id: "id1",
      type: "execution_node",
      op: "testOp",
      x_pos: 5,
      y_pos: 6,
      app_data: {
        other_data: {
          prop1: "Something interesting",
        },
      },
      height: 10,
      width: 20,
    },
    "pipelineId1"
  )
);

expectType<void>(
  canvasController.addNode(
    canvasController.createNode({
      nodeTemplate: { id: "123", type: "execution_node", op: "testOp" },
      offsetX: 1,
      offsetY: 5,
    })
  )
);

expectType<void>(
  canvasController.setNodeProperties("123", { id: "123", type: "execution_node", op: "xx", label: "Craig" })
);


const commonCanvasMinimal = new CommonCanvas({ canvasController });
expectType<CommonCanvas>(commonCanvasMinimal);

const commonCanvasAll = new CommonCanvas({
  canvasController,
  config: {
    enableLinkType: "Parallax",
    tipConfig: {
      palette: {
        categories: false,
        nodeTemplates: true
      }
    }
   },
  toolbarConfig: { leftBar: [], overrideAutoEnableDisable: true },
  notificationConfig: {
    action: "notification",
    label: "label1",
    emptyMessage: "No notifications",
  },
  contextMenuConfig: { enableCreateSupernodeNonContiguous: true },
  keyboardConfig: { actions: { delete: false } },
  contextMenuHandler: (source, defaultMenu) => defaultMenu,
  beforeEditActionHandler: (data, command) => data,
  editActionHandler: (data, command) => {
    return undefined;
  },
  clickActionHandler: (source) => {
    return undefined;
  },
  decorationActionHandler: (object, id, pipelineId) => {
    return undefined;
  },
  layoutHandler: (data) => {
    return { key1: "val1" };
  },
  tipHandler: (tipType, data) => "new tooltip text",
  idGeneratorHandler: (action, data) => "new id",
  selectionChangeHandler: (data) => {
    return undefined;
  },
  actionLabelHandler: (action) => "Remove stuff",
  showRightFlyout: true,
  rightFlyoutContent: (SampleContent),
  showTopPanel: false,
  topPanelContent: (SampleContent),
  showBottomPanel: false,
  bottomPanelContent: (SampleContent),
});
expectType<CommonCanvas>(commonCanvasAll);


/* ------------------------------------------------------------------- */
/*   Common Properties tests                                           */
/* ------------------------------------------------------------------- */

class MyCustomControl {
  static id() {
    return "custom-control-1";
  }

  renderControl() {
    return "react node";
  }
}

let commonPropertiesController: CommonPropertiesController =
  {} as CommonPropertiesController;

const commonProperties = new CommonProperties({
  propertiesInfo: { parameterDef: {} },
  callbacks: {
    controllerHandler: (propertyController) => {
      commonPropertiesController = propertyController;
    },
  },
  customControls: [MyCustomControl],
  propertiesConfig: { applyOnBlur: true },
});

expectType<unknown>(
  commonPropertiesController.getControl({ name: "controlName" })
);
expectType<unknown>(
  commonPropertiesController.getControl({ name: "controlName", row: 5 })
);
expectType<unknown>(
  commonPropertiesController.getControl({ name: "controlName", row: 3, col: 2 })
);

