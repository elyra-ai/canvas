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

import type { CanvasController, CanvasObject } from "./canvas-controller.d.ts";

/**
 * https://elyra-ai.github.io/canvas/03.10-command-stack/#building-an-application-specific-command-optional
 */
export abstract class Action {
  constructor(data?: unknown, canvasController?: CanvasController);

  /**
   * Performs all actions necessary to execute the command
   */
  abstract do(): void;

  /**
   * Performs all actions necessary to reverse the actions performed in do()
   */
  abstract undo(): void;

  /**
   * Performs all actions necessary to re-execute the command. For some
   * commands this is the same as do() but for others it is different.
   */
  abstract redo(): void;

  /**
   * Returns a label that describes the action
   */
  abstract getLabel(): string;

  /**
   * Returns a canvas object (node, link or comment) or the string
   * "CanvasFocus" to indicate where keyboard focus should be set when the
   * command completes. Result will be passed to
   * CanvasController.setFocusObject()
   */
  abstract getFocusObject(): "CanvasFocus" | CanvasObject | void;
}
