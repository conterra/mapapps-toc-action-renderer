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

export interface RendererChangeEvent {
    uniqueValueInfos?: UniqueValueInfo[];
    renderer?: "class_breaks" | "size" | "unique_values" | "heatmap" | "simple" | "symbol";
    symbol?: string;
    attribute?: string;
    color?: Color;
    heatmapColors?: Array<{
        color: Color;
        ratio: number;
    }>;
    outlineColor?: Color;
    outlineWidth?: number;
    pointSize?: number;
    symbolURL?: string;
    symbolHeight?: number;
    symbolWidth?: number;
    pathString?: string;
}

export interface RGBAColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface HeatmapColorStop {
    color: RGBAColor;
    ratio?: number;
}
export interface ColorPickerObject{
    rgba: RGBAColor;
}

export interface I18n {
    renderer: string;
    renderers: Array<RendererObjectType>;
    symbol: string;
    symbols: Array<SymbolObjectType>;
    resetRenderer: string;
    attribute: string;
    fillColor: string;
    outlineColor: string;
    outlineWidth: string;
    pointSize: string;
    symbolUrlLabel: string;
    symbolHeightLabel: string;
    symbolWidthLabel: string;
}

export interface RendererObjectType {
    value: RendererType;
    text: string;
}

export type RendererType = "simple" | "symbol" | "class_breaks" | "size" | "unique_values" | "heatmap";

export interface SymbolObjectType {
    value: SymbolType;
    text: string;
}
export type SymbolType = "circle" | "square" | "triangle" | "diamond" | "path";

export interface LayerAttribute {
    name: string;
    type: string;
}

export interface UniqueValueInfo {
    value: string;
    color: RGBAColor;
}

export interface ClassBreakColor extends RGBAColor {
    label?: string;
}


