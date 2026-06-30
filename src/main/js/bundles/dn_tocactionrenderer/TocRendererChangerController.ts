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
import { HeatmapColorStop, RendererChangeEvent, RendererType, RGBAColor, SymbolType } from "./api";

type SupportedLayer = __esri.FeatureLayer | __esri.OGCFeatureLayer | __esri.CSVLayer | __esri.GeoJSONLayer;

export class TocRendererChangerController {
    private vm: Vue;
    private model!: InjectedReference<TocRendererChangerModel>;
    private _mapWidgetModel: InjectedReference<MapWidgetModel>;
    private selectedLayer: any;
    private oldRenderer!: {[key: string]: __esri.Renderer | undefined};
    private originalHeatmapColorStops: any;
    private initializingFromLayer = false; // prevents rendering updates while setting model from existing renderer

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
        model!.watch("uniqueValueSize", ({ value }: { value: number }) => {
            this.updateTypeRenderer(model!.selectedUniqueValueSymbol, value);
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
        this.oldRenderer = {};
        this.originalHeatmapColorStops = JSON.parse(JSON.stringify(this.model!.heatmapRenderer || null));
    }

    private getLayerAttributes(layerId: string) {
        const model = this.model!;
        const selectedLayer = this.selectedLayer = this._mapWidgetModel!.map.findLayerById(layerId) as SupportedLayer;

        if (selectedLayer) {
            model.selectedLayerAttributes = selectedLayer.fields.map((item: Field) => {
                return {
                    name: item.name,
                    type: item.type
                };
            });
            this.oldRenderer[selectedLayer.id] = selectedLayer.renderer?.clone();
            model.symbolApplicable = selectedLayer.geometryType === "point";
            model.currentGeometryType = selectedLayer.geometryType;

            this.removeRendererWidget(); // drop the previous layer's smart-mapping widget
            this.applyCurrentRendererToModel(selectedLayer);
        }
    }

    /**
     * Reads the layer's current renderer and pushes its state into the model when a layer is
     * selected, so the widget opens on the renderer mode the layer actually uses and shows its
     * symbology as the default instead of the static config defaults.
     */
    private applyCurrentRendererToModel(layer: SupportedLayer): void {
        const renderer = layer.renderer;
        if (!renderer) {
            return;
        }

        this.initializingFromLayer = true;
        try {
            switch (renderer.type) {
                case "simple":
                    this.applySimpleRendererToModel(renderer);
                    break;
                case "unique-value":
                    this.applyUniqueValuesToModel(renderer);
                    break;
                case "class-breaks":
                    if (Array.isArray(renderer.visualVariables) && renderer.visualVariables.some((v: any) => v?.type === "size")) {
                        this.applySizeToModel(renderer);
                    } else {
                        this.applyClassBreaksToModel(renderer);
                    }
                    break;
                case "heatmap":
                    this.applyHeatmapToModel(renderer);
                    break;
                default:
                    break;
            }
        } finally {
            // using timeout so this runs after other timeouts used while populating
            setTimeout(() => {
                this.initializingFromLayer = false;
            }, 0);
        }
    }


    private applySimpleRendererToModel(renderer: __esri.SimpleRenderer): void {
        const model = this.model!;

        const symbol = renderer.symbol;
        if (!symbol){
            return;
        }

        if (symbol.type === "picture-marker") {
            if (symbol.url) {
                model.symbolURL = symbol.url;
            }
            if (symbol.height != null) {
                model.symbolHeight = symbol.height;
            }
            if (symbol.width != null) {
                model.symbolWidth = symbol.width;
            }
            model.selectedRenderer = "symbol";
            return;
        }

        if (symbol.color) {
            model.color = symbol.color;
        }

        if (symbol.type === "simple-line") {
            // lines carry the stroke width directly on the symbol
            if (symbol.width != null) {
                model.outlineWidth = symbol.width;
            }
        } else if (symbol.type === "simple-fill" || symbol.type === "simple-marker") {
            const outline = symbol.outline;
            if (outline?.color) {
                model.outlineColor = outline.color;
            }
            if (outline?.width != null) {
                model.outlineWidth = outline.width;
            }
            if (symbol.type === "simple-marker" && symbol.size != null) {
                model.pointSize = symbol.size;
            }
        }

        model.selectedRenderer = "simple";
    }

    private applyUniqueValuesToModel(renderer: __esri.UniqueValueRenderer): void {
        const model = this.model!;
        const attribute = this.extractAttribute(renderer);
        if (attribute) {
            model.selectedAttribute = attribute;
        }

        const infos = renderer.uniqueValueInfos;
        if (Array.isArray(infos) && infos.length) {
            model.uniqueValueInfos = infos.map((info) => {
                return {
                    value: info.value,
                    color: info.symbol?.color
                };
            });

            const symbol = infos[0].symbol;
            if (symbol && (symbol.type === "simple-fill" || symbol.type === "simple-marker" || symbol.type === "simple-line")){
                const style = symbol?.style;
                if (["circle", "square", "triangle", "diamond", "path"].includes(style)) {
                    model.selectedUniqueValueSymbol = style;
                }
                if (symbol.type === "simple-marker" && symbol?.size != null) {
                    model.uniqueValueSize = symbol.size;
                }
            }
        }
        model.selectedRenderer = "unique_values";
    }

    private applyClassBreaksToModel(renderer: __esri.ClassBreaksRenderer): void {
        const model = this.model!;
        const attribute = this.extractAttribute(renderer);
        if (attribute) {
            model.selectedAttribute = attribute;
        }

        const infos = renderer.classBreakInfos;
        if (Array.isArray(infos) && infos.length) {
            model.classBreaksColors = infos.map((info) => {
                return {
                    ...info.symbol?.color,
                    label: info.label
                };
            });
        }

        model.selectedRenderer = "class_breaks";
        this.createRendererWidget({ renderer: "class_breaks", attribute: model.selectedAttribute });
    }

    private applySizeToModel(renderer: __esri.ClassBreaksRenderer): void {
        const model = this.model!;
        const attribute = this.extractAttribute(renderer);
        if (attribute) {
            model.selectedAttribute = attribute;
        }

        const color = renderer.classBreakInfos?.[0]?.symbol?.color;
        if (color) {
            model.sizeRendererColor = color;
        }
        model.selectedRenderer = "size";
        this.createRendererWidget({ renderer: "size", attribute: model.selectedAttribute });
    }

    private applyHeatmapToModel(renderer: __esri.HeatmapRenderer): void {
        const colorStops = renderer.colorStops;
        if (!Array.isArray(colorStops) || !colorStops.length) {
            return;
        }
        this.model!.heatmapRenderer = {
            colorStops: colorStops.map((stop: HeatmapColorStop) => {
                return {
                    color: stop.color,
                    ratio: stop.ratio
                };
            })
        };

        this.model!.selectedRenderer = "heatmap";
        this.createRendererWidget({ renderer: "heatmap" });
    }

    /**
     * Resolves the field name a data-driven renderer classifies on.
     */
    private extractAttribute(renderer: any): string | undefined {
        const fromExpression = (expression: unknown): string | undefined =>
            typeof expression === "string" ? expression.split(".")[1] : undefined;
        return renderer.field
            || fromExpression(renderer.valueExpression)
            || fromExpression(renderer.visualVariables?.[0]?.valueExpression);
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
                        this.setSizeRenderer(evt.attribute, evt.color ?? this.model!.sizeRendererColor);
                        break;
                    case "unique_values":
                        if(!evt.attribute || !evt.symbol || !this.model) {
                            return;
                        }
                        this.setTypeRenderer(
                            evt.attribute,
                            evt.symbol,
                            this.model.uniqueValueSize,
                            evt.uniqueValueInfos,
                            evt.pathString);
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

    private updateSizeRenderer(color: RGBAColor): void {
        if (this.initializingFromLayer) {
            return;
        }
        if (!this.selectedLayer || !this.selectedLayer.renderer || !this.selectedLayer.renderer.classBreakInfos) {
            return;
        }
        const attribute = this.selectedLayer.renderer.visualVariables[0]?.valueExpression?.split(".")[1];

        this.createRendererWidget({ renderer: "size", attribute: attribute, color: color });
    }

    private updateTypeRenderer(symbol: string, pointSize: number): void {
        if (this.initializingFromLayer) {
            return;
        }
        if (!this.selectedLayer || !this.selectedLayer.renderer || !this.selectedLayer.renderer.uniqueValueInfos) {
            return;
        }
        const renderer = this.selectedLayer.renderer;

        renderer.uniqueValueInfos.forEach((info: any) => {
            info.symbol.style = symbol;
            info.symbol.size = pointSize;
        });
        renderer.defaultSymbol.style = symbol;
        renderer.defaultSymbol.size = pointSize;

        const colorValueInfos = renderer.uniqueValueInfos.map((info: any) => {
            return {
                value: info.value,
                color: info.symbol.color
            };
        });
        this.model!.set("uniqueValueInfos", colorValueInfos);
    }

    public updateSimpleRenderer(color: RGBAColor, outlineColor: RGBAColor, outlineWidth: number, pointSize: number): void {
        if (this.initializingFromLayer) {
            return;
        }
        const geomType = this.model!.currentGeometryType;
        const fillColor = color ? new Color(color) : new Color({ r: 200, g: 200, b: 200, a: 1 });
        const strokeColor = outlineColor ? new Color(outlineColor) : new Color({ r: 200, g: 200, b: 200, a: 1 });

        switch (geomType) {
            case "polygon":
                this.selectedLayer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "simple-fill",
                        color: fillColor,
                        outline: {
                            width: outlineWidth,
                            color: strokeColor
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
                        color: fillColor,
                        outline: {
                            width: outlineWidth,
                            color: strokeColor
                        }
                    }
                };
                break;
            case "polyline":
                this.selectedLayer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "simple-line",
                        color: fillColor,
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
        if (this.initializingFromLayer) {
            return;
        }
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

    private setSizeRenderer(attribute: string, color?: RGBAColor): void {
        const sizeColor = color ? new Color(color) : undefined;
        createSizeRenderer(
            this.selectedLayer,
            this._mapWidgetModel!.view,
            attribute,
            this.vm.$refs["ctSmartRendererWidgets"],
            sizeColor
        );
    }

    private setTypeRenderer(
        attribute: string,
        symbol: string,
        pointSize: number,
        uniqueValueInfos?: any,
        pathString?: string): void {
        createTypeRenderer(
            this.selectedLayer,
            this._mapWidgetModel!.view,
            attribute,
            symbol,
            pointSize,
            uniqueValueInfos,
            pathString
        ).then((colorAndValueInfo) => {
            this.model!.uniqueValueInfos = colorAndValueInfo;
        });
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
        this.model!.selectedUniqueValueSymbol = "circle";
        this.model!.selectedAttribute = undefined;
        this.model!.color = undefined;
        this.model!.outlineColor = undefined;
        this.model!.sizeRendererColor = undefined;
        this.model!.classBreaksColors = [];
        this.model!.heatmapRenderer = null;
        this.model!.uniqueValueInfos = [];
        this.model!.heatmapRenderer = JSON.parse(JSON.stringify(this.originalHeatmapColorStops));
    }

}
