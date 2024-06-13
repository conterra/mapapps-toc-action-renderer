/*
 * Copyright (C) 2024 con terra GmbH (info@conterra.de)
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
        const i18n = this._i18n.get();
        const tool = this._tool;
        const model = this._model;

        return {
            id,
            type: "button",
            label: i18n.tool.title,
            icon: "color_lens",

            isVisibleForItem(tocItem) {
                if (tocItem?.ref?.type === "feature") {
                    return true;
                }
            },

            isDisabledForItem(tocItem) {
                return !tocItem?.ref?.visible;
            },

            trigger(tocItem) {
                tool.set("active", true);
                model.selectedLayerId = tocItem.ref.id;
            }
        };
    }

}
