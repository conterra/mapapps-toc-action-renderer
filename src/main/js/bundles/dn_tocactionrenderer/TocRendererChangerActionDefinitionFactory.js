/*
 * Copyright (C) 2020 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const ID = "change-renderer-action";

export default class TocRendererChangerActionDefinitionFactory {

    constructor() {
        this.supportedIds = [ID];
    }


    createDefinitionById(id) {
        return {
            id,
            type: "button",

            // Label of the button menu entry
            label: this._i18n.get().ui.toolTitle,

            // Icon of the button entry
            icon: "color_lens",
            window: undefined,
            windowManager: this._windowManager,
            widget: this._tocRendererChangerFactory,
            i18n: this._i18n.get().ui,

            createWindow: function () {
                this.window = this.windowManager.createWindow({
                    title: this.i18n.toolTitle,
                    id: Math.random(),
                    marginBox: {
                        w: 500,
                        h: 650
                    },
                    resizable: true,
                    hideOnClose: true,
                    content: this.widget
                });

            },

            showWindow: function (layerId) {
                if (!this.window) {
                    this.createWindow()
                }
                this.widget.controller.setSelectedLayerId(layerId);
                this.content = this.widget;
                this.window.show();
            },


            // Method to decide if this action
            // is available for a given tocItem
            isVisibleForItem(tocItem) {
                if (tocItem?.ref?.type === "feature") {
                    return true;
                }
            },

            // method to decide if the action should be shown as
            // currently disabled (optional)
            isDisabledForItem(tocItem) {
                if (tocItem?.ref) {
                    if (!tocItem.ref.visible) {
                        return true;
                    }
                }
                return false;
            },

            // method triggered if the menu item is clicked
            trigger(tocItem) {
                this.showWindow(tocItem.ref.id);
            }
        };
    }
}
