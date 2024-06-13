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
import createSizeRenderer from "./renderer/SizeRenderer";
import createClassBreaksRenderer from "./renderer/ClassBreaksRenderer";
import createTypeRenderer from "./renderer/TypeRenderer";
import createHeatMapRenderer from "./renderer/HeatMapRenderer";

export default class TocRendererChangerController {

    constructor(vm, mapWidgetModel, model) {
        this.vm = vm;
        this.model = model;
        this._mapWidgetModel = mapWidgetModel;

        this.initProperties();

        model.watch("selectedLayerId", ({value}) => {
            this.getLayerAttributes(value);
        });

        model.watch("color", ({value}) => {
            this.updateSimpleRenderer(value, model.outlineColor, model.outlineWidth, model.pointSize);
        });
        model.watch("outlineColor", ({value}) => {
            this.updateSimpleRenderer(model.color, value, model.outlineWidth, model.pointSize);
        });
        model.watch("outlineWidth", ({value}) => {
            this.updateSimpleRenderer(model.color, model.outlineColor, value, model.pointSize);
        });
        model.watch("pointSize", ({value}) => {
            this.updateSimpleRenderer(model.color, model.outlineColor, model.outlineWidth, value);
        });
        model.watch("symbolURL", () => {
            this.updateSymbolRenderer(model);
        });
        model.watch("symbolHeight", () => {
            this.updateSymbolRenderer(model);
        });

        model.watch("symbolWidth", () => {
            this.updateSymbolRenderer(model);
        });
    }

    initProperties() {
        this.oldRenderer = [];
    }

    getLayerAttributes(layerId) {
        const model = this.model;
        const selectedLayer = this.selectedLayer = this._mapWidgetModel.map.findLayerById(layerId);

        if (selectedLayer) {
            model.selectedLayerAttributes = selectedLayer.fields.map(item => {
                return {
                    name: item.name,
                    type: item.type
                };
            });
            this.oldRenderer[selectedLayer.id] = selectedLayer.renderer.clone();
        }
        // hide/show symbol renderer in renderer selection
        model.symbolApplicable = selectedLayer.geometryType === "point";
        model.currentGeometryType = selectedLayer.geometryType;
    }

    updateSimpleRenderer(color, outlineColor, outlineWidth, pointSize) {
        const geomType = this.model.currentGeometryType;

        switch (geomType) {
            case "polygon":
                this.selectedLayer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "simple-fill",
                        color: color,
                        outline: {
                            width: outlineWidth,
                            color: outlineColor
                        }
                    }
                };
                break;
            case "point":
                this.selectedLayer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "simple-marker",
                        size: pointSize,
                        color: color,
                        outline: {
                            width: outlineWidth,
                            color: outlineColor
                        }
                    }
                };
                break;
            case "polyline":
                this.selectedLayer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "simple-line",
                        color: color,
                        width: outlineWidth,
                        style: "solid"
                    }
                };
                break;
            default:
                break;
        }
    }

    updateSymbolRenderer(model) {
        const geomType = this.selectedLayer.geometryType;

        if (geomType === "point") {
            this.selectedLayer.renderer = {
                type: "simple",  // autocasts as new PictureMarkerSymbol()
                symbol: {
                    type: "picture-marker",
                    url: model.symbolURL,
                    height: model.symbolHeight,
                    width: model.symbolWidth
                }
            };
        }
    }

    createRendererWidget(evt) {
        this.removeRendererWidget();
        if (evt?.renderer) {
            switch (evt.renderer) {
                case "class_breaks":
                    this.setClassBreaksRenderer(evt.attribute);
                    break;
                case "size":
                    this.setSizeRenderer(evt.attribute);
                    break;
                case "unique_values":
                    this.setTypeRenderer(evt.attribute);
                    break;
                case "heatmap":
                    this.setHeatmapRenderer();
                    break;
                case "simple":
                    // do nothing
                    break;
                case "symbol":
                    this.setSymbolRenderer();
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
            this.vm.$refs["ctSmartRendererWidgets"]
        );
    }

    setHeatmapRenderer() {
        createHeatMapRenderer(
            this.selectedLayer,
            this.model.heatmapRenderer,
            this._mapWidgetModel,
            this.vm.$refs["ctSmartRendererWidgets"]
        );
    }

    setSizeRenderer(attribute) {
        createSizeRenderer(
            this.selectedLayer,
            this._mapWidgetModel.view,
            attribute,
            this.vm.$refs["ctSmartRendererWidgets"]
        );
    }

    setTypeRenderer(attribute) {
        createTypeRenderer(
            this.selectedLayer,
            this._mapWidgetModel.view,
            attribute,
            this.vm.$refs["ctSmartRendererWidgets"]
        );
    }

    setSymbolRenderer() {
        const geomType = this.selectedLayer.geometryType;

        if (geomType === "point") {
            this.selectedLayer.renderer = {
                type: "simple",  // autocasts as new PictureMarkerSymbol()
                symbol: {
                    type: "picture-marker",
                    url: this.model.symbolURL,
                    height: this.model.symbolHeight,
                    width: this.model.symbolWidth
                }
            };
        }
    }

    removeRendererWidget() {
        if (this.vm.$refs.ctSmartRendererWidgets && this.vm.$refs.ctSmartRendererWidgets.childNodes) {
            this.vm.$refs.ctSmartRendererWidgets.childNodes.forEach(el => {
                el.remove();
            });
        }
    }

    resetRenderer() {
        this.selectedLayer.renderer = this.oldRenderer[this.selectedLayer.id];
        this.removeRendererWidget();
        this.model.selectedRenderer = undefined;
        this.model.selectedAttribute = undefined;
    }

}
