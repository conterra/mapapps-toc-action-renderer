///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///


import type Tool from "ct/tools/Tool";

import { InjectedReference } from "apprt-core/InjectedReference";
import { MessagesReference } from "./nls/bundle";
import { TocRendererChangerModel } from "./TocRendererChangerModel";

const ID = "change-renderer-action";

export class TocRendererChangerActionDefinitionFactory {

    private supportedIds: string[];

    private _i18n!: InjectedReference<MessagesReference>;
    private _tool!: InjectedReference<typeof Tool>;
    private _model!: InjectedReference<TocRendererChangerModel>;

    constructor() {
        this.supportedIds = [ID];
    }

    public createDefinitionById(id:string): any {
        const i18n = this._i18n!.get();
        const tool = this._tool;
        const model = this._model;

        return {
            id,
            type: "button",
            label: i18n.tool.title,
            icon: "color_lens",

            isVisibleForItem(tocItem: any) {
                if (tocItem?.ref?.type === "feature") {
                    return true;
                }
            },

            isDisabledForItem(tocItem: any) {
                return !tocItem?.ref?.visible;
            },

            trigger(tocItem: any) {
                tool.get().set("active", true);
                model.get().selectedLayerId = tocItem.ref.id;
            }
        };
    }

}
