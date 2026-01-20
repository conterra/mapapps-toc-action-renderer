
/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
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
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import Binding from "apprt-binding/Binding";
import MapWidgetModel from "map-widget/MapWidgetModel";

import TocRendererChangerWidget from "./TocRendererChangerWidget.vue";
import TocRendererChangerController from "./TocRendererChangerController";
import { ifDefined } from "apprt-binding/Transformers";

import type { InjectedReference } from "apprt-core/InjectedReference";
import type { MessagesReference } from "./nls/bundle";
import type { TocRendererChangerModel } from "./TocRendererChangerModel";

export class TocRendererChangerWidgetFactory {

    private vm?: Vue;
    private widget?: any;
    private binding?: Binding;

    private _i18n!: InjectedReference<MessagesReference>;
    private _mapWidgetModel!: InjectedReference<MapWidgetModel>;
    private _model!: InjectedReference<TocRendererChangerModel>;

    activate():void {
        this.#initComponent();
    }

    deactivate():void {
        this.vm?.$off();
    }

    createInstance(): any {
        return this.widget;
    }

    #initComponent() {
        const vm = this.vm = new Vue(TocRendererChangerWidget);
        const model = this._model!;
        vm.i18n = this._i18n!.get().ui;
        const controller = new TocRendererChangerController(vm, this._mapWidgetModel, this._model);
        this.#watchForEvents(vm, controller);
        const widget = this.widget = VueDijit(vm, { class: "tocactionrenderer" });

        const binding = this.binding = this.createBinding(vm);

        widget.enableBinding = function () {
            binding.enable().syncToRightNow();
        };
        widget.disableBinding = function () {
            binding.disable();
        };

        widget.own({
            remove() {
                binding.unbind();
                widget.enableBinding = widget.disableBinding = undefined;
            }
        });
    }

    private createBinding(vm: Vue): Binding {
        const model = this._model!;
        return Binding.for(model, vm)
            .syncAll("classBreaksColors", "color", "outlineColor", "sizeRendererColor", "outlineWidth", "pointSize", "symbolURL", "symbolHeight", "symbolWidth", "selectedRenderer", "selectedAttribute")
            .syncAllToRight("allowedRenderers", "selectedLayerId", "selectedLayerAttributes", "selectedAttribute", "symbolApplicable", "currentGeometryType")
            .syncToRight("heatmapRenderer", ["heatmapColors"], ifDefined((heatmapRenderer) => heatmapRenderer.colorStops));
    }

    #watchForEvents(vm: Vue, controller: TocRendererChangerController) {
        vm.$on('update-renderer', (evt: any) => {
            controller.createRendererWidget(evt);
        });
        vm.$on('update-simple-renderer', (evt: any) => {
            controller.updateSimpleRenderer(
                evt.color,
                evt.outlineColor,
                evt.outlineWidth,
                evt.pointSize
            );
        });
        vm.$on('reset-renderer', () => {
            controller.resetRenderer();
        });
    }

}
