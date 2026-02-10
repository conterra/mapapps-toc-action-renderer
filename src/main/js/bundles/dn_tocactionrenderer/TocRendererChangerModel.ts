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

import { Mutable, properties } from "apprt-core/Mutable";
import { RendererType, SymbolType } from "./api";
import Color from "@arcgis/core/Color";

export interface TocRendererChangerModelProperties {

    selectedRenderer: RendererType | undefined;
    selectedLayerId: string | undefined;
    selectedAttribute: string | undefined;
    selectedLayerAttributes: string[];
    selectedUniqueValueSymbol: SymbolType | undefined;
    color: number[];
    outlineColor: number[];
    sizeRendererColor: number[];
    outlineWidth: number | undefined;
    pointSize: number | undefined;
    uniqueValueSize: number | undefined;
    uniqueValueOutlineWidth: number | undefined;
    uniqueValueInfos?: [{ value: string; color: Color }];
    heatmapRenderer: Record<string, any>;
    classBreaksColors: number[][];
    allowedRenderers: string[];
    symbolURL: string;
    symbolHeight: number | undefined;
    symbolWidth: number | undefined;
    symbolApplicable: boolean | undefined;
    currentGeometryType: string | undefined;
}

export class TocRendererChangerModel extends Mutable  { }

properties(TocRendererChangerModel, {

    selectedRenderer: undefined,
    selectedLayerId: undefined,
    selectedAttribute: undefined,
    selectedLayerAttributes: [],
    selectedUniqueValueSymbol: undefined,
    color: [],
    outlineColor: [],
    sizeRendererColor: [],
    outlineWidth: undefined,
    pointSize: undefined,
    uniqueValueSize: undefined,
    uniqueValueOutlineWidth: undefined,
    uniqueValueInfos: [],
    heatmapRenderer: {},
    classBreaksColors: [],
    allowedRenderers: [],
    symbolURL: "",
    symbolHeight: undefined,
    symbolWidth: undefined,
    symbolApplicable: undefined,
    currentGeometryType: undefined
});
