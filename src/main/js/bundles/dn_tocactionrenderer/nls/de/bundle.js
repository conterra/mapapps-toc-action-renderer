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
    bundleName: "dn_tocactionrenderer",
    bundleDescription: "Widget containing the esri smart renderer functionalities",
    tool: {
        title: "Symbolisierung anpassen",
        tooltip: "Symbolisierung anpassen"
    },
    windowTitle: "Symbolisierung anpassen",
    ui: {
        renderer: "Art der Symbolisierung",
        renderers: [
            {value: "simple", text: "Simple"},
            {value: "symbol", text: "Symbol"},
            {value: "class_breaks", text: "Class Breaks"},
            {value: "size", text: "Size"},
            {value: "unique_values", text: "Unique Values"},
            {value: "heatmap", text: "Heatmap"}
        ],
        resetRenderer: "Symbolisierung zurücksetzen",
        attribute: "Attribut",
        fillColor: "Füllfarbe",
        outlineColor: "Umrandfarbe",
        outlineWidth: "Umriss-Breite",
        pointSize: "Punktgröße",
        symbolUrlLabel: "Symbol URL",
        symbolHeightLabel: "Symbolhöhe",
        symbolWidthLabel: "Symbolbreite"
    }
};
