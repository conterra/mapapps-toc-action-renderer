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
import createSizeRenderer from "./renderer/SizeRenderer";
import createClassBreaksRenderer from "./renderer/ClassBreaksRenderer";
import createTypeRenderer from "./renderer/TypeRenderer";
import {
    declare
} from "apprt-core/Mutable";


class TocRendererChangerController {
    constructor(vm, mapWidgetModel) {
        this.vm = vm;
        this._mapWidgetModel = mapWidgetModel;

        const Model = declare({
            selectedRenderer: undefined,
            selectedLayerId: undefined,
            selectedLayerAttributes: {},
            selectedAttribute: undefined
        });


        this.initProperties();
        this.model = new Model();
        this._attachWidgetEvents(vm);

    }

    initProperties() {
        this.oldRenderer = [];
    }

    setSelectedLayerId(layerId) {
        this.model.selectedLayerId = layerId;
        this.getLayerAttributes(layerId);
    }

    getLayerAttributes(layerId) {
        this.selectedLayer = this._mapWidgetModel.map.findLayerById(layerId);
        if (this.selectedLayer) {
            this.model.selectedLayerAttributes = this.selectedLayer.fields.map(item => {
                return {
                    name: item.name,
                    type: item.type
                };
            });
            this.oldRenderer[
                this.selectedLayer.id
            ] = this.selectedLayer.renderer.clone();
        }
    }


    _attachWidgetEvents(vm) {
        vm.$on('update-color', (evt) => {
            this.updateSimpleRenderer(evt);
        });

        vm.$on('updateRenderer', (evt) => {
            this.createRendererWidget(evt);
        })

        vm.$on('resetRenderer', () => {
            this.resetRenderer();
        });
    }

    updateSimpleRenderer(event) {
        let geomType = this.selectedLayer.geometryType;

        switch (geomType) {
            case "polygon":
                this.selectedLayer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "simple-fill",
                        color: event,
                        outline: {
                            width: 1,
                            color: "white"
                        }
                    }
                };
                break;
            case "point":
                this.selectedLayer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "simple-marker",
                        size: 6,
                        color: event,
                        outline: {
                            width: 0.5,
                            color: "white"
                        }
                    }
                };
                break;
            case "polyline":
                this.selectedLayer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "simple-line",
                        color: event,
                        width: "3px",
                        style: "solid"
                    }
                };
                break;
            default:
                break;
        }
    }


    createRendererWidget(evt) {
        this.removeRendererWidget();
        if (evt && evt.renderer && evt.attribute) {
            switch (evt.renderer) {
                case "Class Breaks":
                    this.setClassBreaksRenderer(evt.attribute);
                    break;
                case "Size":
                    this.setSizeRenderer(evt.attribute);
                    break;
                case "Unique Values":
                    this.setTypeRenderer(evt.attribute);
                    break;
                default:
                    break;
            }
        }
    }

    setClassBreaksRenderer(attribute) {
        createClassBreaksRenderer(
            this.selectedLayer,
            this._mapWidgetModel.view,
            attribute,
            this.vm.$refs["ctSmartRenderWidgets"]
        );
    }

    setSizeRenderer(attribute) {
        createSizeRenderer(
            this.selectedLayer,
            this._mapWidgetModel.view,
            attribute,
            this.vm.$refs["ctSmartRenderWidgets"]
        );
    }

    setTypeRenderer(attribute) {
        createTypeRenderer(
            this.selectedLayer,
            this._mapWidgetModel.view,
            attribute,
            this.vm.$refs["ctSmartRenderWidgets"]
        );
    }

    removeRendererWidget() {
        if (this.vm.$refs.ctSmartRenderWidgets && this.vm.$refs.ctSmartRenderWidgets.childNodes) {
            this.vm.$refs.ctSmartRenderWidgets.childNodes.forEach(el => {
                el.remove();
            });
        }
    }

    resetRenderer() {
        this.selectedLayer.renderer = this.oldRenderer[this.selectedLayer.id];
        this.removeRendererWidget()
        this.model.selectedRenderer = undefined;
        this.model.selectedAttribute = undefined;
    }

}

module.exports = TocRendererChangerController;