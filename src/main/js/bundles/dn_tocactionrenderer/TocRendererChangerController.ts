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
import Color from "@arcgis/core/Color";
import Field from "@arcgis/core/layers/support/Field.js";

import Vue from "apprt-vue/Vue";
import MapWidgetModel from "map-widget/MapWidgetModel";

import createSizeRenderer from "./renderer/SizeRenderer";
import createClassBreaksRenderer from "./renderer/ClassBreaksRenderer";
import createTypeRenderer from "./renderer/TypeRenderer";
import createHeatMapRenderer from "./renderer/HeatMapRenderer";

import { TocRendererChangerModel } from "./TocRendererChangerModel";
import type { InjectedReference } from "apprt-core/InjectedReference";
import { RendererChangeEvent } from "./api";

export default class TocRendererChangerController {
    private vm: Vue;
    private model!: InjectedReference<TocRendererChangerModel>;
    private _mapWidgetModel: InjectedReference<MapWidgetModel>;
    private selectedLayer: any;
    private oldRenderer!: any[];
    private originalHeatmapColorStops: any;

    constructor(
        vm: Vue,
        mapWidgetModel: InjectedReference<MapWidgetModel>,
        model: InjectedReference<TocRendererChangerModel>) {

        this.vm = vm;
        this.model = model;
        this._mapWidgetModel = mapWidgetModel;

        this.initProperties();

        model!.watch("selectedLayerId", ({ value }: { value: string }) => {
            this.getLayerAttributes(value);
        });
        model!.watch("outlineWidth", ({ value }: { value: number }) => {
            this.updateSimpleRenderer(model!.color, model!.outlineColor, value, model!.pointSize);
        });
        model!.watch("pointSize", ({ value }: { value: number }) => {
            this.updateSimpleRenderer(model!.color, model!.outlineColor, model!.outlineWidth, value);
        });
        model!.watch("symbolURL", () => {
            this.updateSymbolRenderer(model);
        });
        model!.watch("symbolHeight", () => {
            this.updateSymbolRenderer(model);
        });

        model!.watch("symbolWidth", () => {
            this.updateSymbolRenderer(model);
        });
        model!.watch("sizeRendererColor", ({ value }: { value: any }) => {
            this.updateSizeRenderer(value);
        });
    }

    initProperties(): void {
        this.oldRenderer = [];
        this.originalHeatmapColorStops = JSON.parse(JSON.stringify(this.model!.heatmapRenderer || null));
    }

    private getLayerAttributes(layerId: string) {
        const model = this.model!;
        const selectedLayer = this.selectedLayer = this._mapWidgetModel!.map.findLayerById(layerId);

        if (selectedLayer) {
            model.selectedLayerAttributes = selectedLayer.fields.map((item: Field) => {
                return {
                    name: item.name,
                    type: item.type
                };
            });
            this.oldRenderer[selectedLayer.id] = selectedLayer.renderer.clone();
        }

        model.symbolApplicable = selectedLayer!.geometryType === "point";
        model.currentGeometryType = selectedLayer!.geometryType;
    }

    private updateSizeRenderer(color: Color): void {
        if (!this.selectedLayer || !this.selectedLayer.renderer || !this.selectedLayer.renderer.classBreakInfos) {
            return;
        }
        const attribute = this.selectedLayer.renderer.visualVariables[0]?.valueExpression?.split(".")[1];

        this.createRendererWidget({ renderer: "size", attribute: attribute, color: color });
    }

    public updateSimpleRenderer(color: Color, outlineColor: Color, outlineWidth: number, pointSize: number): void {
        const geomType = this.model!.currentGeometryType;

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

    private updateSymbolRenderer(model: TocRendererChangerModel): void {
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

    public createRendererWidget(evt: RendererChangeEvent): void {
        this.removeRendererWidget();
        if (evt?.renderer) {

            this.vm.$nextTick(() => {
                switch (evt.renderer) {
                    case "class_breaks":
                        if (!evt.attribute) {
                            return;
                        }
                        this.setClassBreaksRenderer(evt.attribute);
                        break;
                    case "size":
                        if(!evt.attribute) {
                            return;
                        }
                        this.setSizeRenderer(evt.attribute, evt.color!);
                        break;
                    case "unique_values":
                        if(!evt.attribute) {
                            return;
                        }
                        this.setTypeRenderer(evt.attribute);
                        break;
                    case "heatmap":
                        if (evt.heatmapColors) {
                            this.model!.heatmapRenderer.colorStops = evt.heatmapColors;
                        }
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
            });
        }
    }
    private setSimpleRenderer(color: Color, outlineColor: Color, outlineWidth: number, pointSize: number): void {
        const geomType = this.model!.currentGeometryType;

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

    private setClassBreaksRenderer(attribute: string) {
        createClassBreaksRenderer(
            this.selectedLayer,
            this._mapWidgetModel!.view,
            attribute,
            this.vm.$refs["ctSmartRendererWidgets"],
            this.model
        );
    }

    private setHeatmapRenderer() {
        createHeatMapRenderer(
            this.selectedLayer,
            this.model!.heatmapRenderer,
            this._mapWidgetModel,
            this.vm.$refs["ctSmartRendererWidgets"]
        );
    }

    private setSizeRenderer(attribute: string, color: Color): void {
        // debugger;
        createSizeRenderer(
            this.selectedLayer,
            this._mapWidgetModel!.view,
            attribute,
            this.vm.$refs["ctSmartRendererWidgets"],
            color
        );
    }

    private setTypeRenderer(attribute: string) {
        createTypeRenderer(
            this.selectedLayer,
            this._mapWidgetModel!.view,
            attribute
        );
    }

    private setSymbolRenderer() {
        const geomType = this.selectedLayer.geometryType;
        const model = this.model!;
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

    private removeRendererWidget(): void {
        if (this.vm.$refs.ctSmartRendererWidgets && this.vm.$refs.ctSmartRendererWidgets.childNodes) {
            this.vm.$refs.ctSmartRendererWidgets.childNodes.forEach(el => {
                el.remove();
            });
        }
    }

    public resetRenderer(): void {
        this.selectedLayer.renderer = this.oldRenderer[this.selectedLayer.id];
        this.removeRendererWidget();
        this.model!.selectedRenderer = undefined;
        this.model!.selectedAttribute = undefined;
        this.model!.color = [];
        this.model!.outlineColor = [];
        this.model!.sizeRendererColor = [];
        this.model!.classBreaksColors = [];

        this.model!.heatmapRenderer = null;
        this.model!.heatmapRenderer = JSON.parse(JSON.stringify(this.originalHeatmapColorStops));
    }

}
