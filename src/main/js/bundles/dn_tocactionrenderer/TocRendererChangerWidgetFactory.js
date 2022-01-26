/*
 * Copyright (C) 2021 con terra GmbH (info@conterra.de)
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
import TocRendererChangerWidget from "./TocRendererChangerWidget.vue";
import TocRendererChangerController from "./TocRendererChangerController";

export default class TocRendererChangerWidgetFactory {

    #vm = undefined;
    #widget = undefined;
    #controller = undefined

    activate() {
        this.#initComponent();
    }

    deactivate() {
        this.#vm.$off();
    }

    createInstance() {
        return this.#widget;
    }

    #initComponent() {
        const vm = this.#vm = new Vue(TocRendererChangerWidget);
        vm.i18n = this._i18n.get().ui;

        const controller = this.#controller = new TocRendererChangerController(vm, this._mapWidgetModel, this._model);
        this.#watchForEvents(vm, controller);
        const widget = this.#widget = VueDijit(vm, {class: "tocactionrenderer"});

        let binding = this.#createBinding(vm);
        widget.enableBinding = function () {
            binding.enable().syncToRightNow();
        };
        widget.disableBinding = function () {
            binding.disable();
        };

        widget.own({
            remove() {
                binding.unbind();
                binding = undefined;
                widget.enableBinding = widget.disableBinding = undefined;
            }
        });
    }

    #createBinding(vm) {
        return Binding.for(this._model, vm)
            .syncAll("color", "outlineColor")
            .syncAllToRight("allowedRenderers", "selectedLayerId",
                "selectedRenderer", "selectedLayerAttributes", "selectedAttribute");
    }

    #watchForEvents(vm, controller) {
        vm.$on('update-renderer', (evt) => {
            controller.createRendererWidget(evt);
        });

        vm.$on('reset-renderer', () => {
            controller.resetRenderer();
        });
    }

}
