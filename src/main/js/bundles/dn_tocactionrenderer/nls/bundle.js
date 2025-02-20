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
export default {
    root: ({
        bundleName: "dn_tocactionrenderer",
        bundleDescription: "Widget containing the esri smart renderer functionalities",
        tool: {
            title: "Change symbology",
            tooltip: "Change symbology"
        },
        windowTitle: "Change symbology",
        ui: {
            renderer: "Renderer",
            renderers: [
                {value: "simple", text: "Simple"},
                {value: "symbol", text: "Symbol"},
                {value: "class_breaks", text: "Class Breaks"},
                {value: "size", text: "Size"},
                {value: "unique_values", text: "Unique Values"},
                {value: "heatmap", text: "Heatmap"}
            ],
            resetRenderer: "Reset Renderer",
            attribute: "Attribute",
            fillColor: "Fill Color",
            outlineColor: "Outline Color",
            outlineWidth: "Outline Width",
            pointSize: "Point Size",
            symbolUrlLabel: "Symbol URL",
            symbolHeightLabel: "Symbol Height",
            symbolWidthLabel: "Symbol Width"
        }
    }),
    "de": true
};
