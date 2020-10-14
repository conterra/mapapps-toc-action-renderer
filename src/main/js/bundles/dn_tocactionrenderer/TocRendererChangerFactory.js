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
import tocRendererChangerWidget from "./tocRendererChangerWidget.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import TocRendererChangerController from "./TocRendererChangerController";
import Binding from "apprt-binding/Binding";

class tocRendererChangerFactory {
    createInstance() {
        const vm = new Vue(tocRendererChangerWidget);
        const widget = VueDijit(vm);
        vm.i18n = this._i18n.get().ui;

        let controller = widget.controller = new TocRendererChangerController(vm,this._mapWidgetModel);
        this.createBinding(vm,controller);

        return widget;
    }

    createBinding(vm, controller){
        Binding.for(controller.model, vm)
            .syncAll("selectedLayerId", "selectedRenderer", "selectedLayerAttributes", "selectedAttribute")
            .enable()
            .syncToRightNow();

    }



    activate() {}


}

module.exports = tocRendererChangerFactory;
