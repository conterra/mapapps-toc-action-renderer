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
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color";
import histogram from "@arcgis/core/smartMapping/statistics/histogram";
import ClassedColorSlider from "@arcgis/core/widgets/smartMapping/ClassedColorSlider";
import Color from "@arcgis/core/Color";

export default function createClassBreaksRenderer(layer, view, attribute, domNode, properties) {
    let rendererParams = null;
    if (properties.classBreaksColors.length === 5) {

        const colorStops = properties.classBreaksColors;
        const classBreaksColors = colorStops.map(stop => {
            const color = new Color(stop);
            return color;
        });

        const customColorScheme = {
            id: "custom",
            tags: ["custom", "user-defined"],
            colors: classBreaksColors,
            noDataColor: new Color({ r: 128, g: 128, b: 128, a: 0.5 }),
            colorsForClassBreaks: [{
                colors: classBreaksColors,
                numClasses: classBreaksColors.length
            }],
            outline: {
                color: new Color({ r: 255, g: 255, b: 255, a: 0.5 }),
                width: 0.5
            },
            size: 8,
            occupancy: 1
        };

        rendererParams = {
            layer: layer,
            view: view,
            valueExpression: "$feature." + attribute,
            classificationMethod: 'natural-breaks',
            colorScheme: customColorScheme,

            // does not work for client side graphics?
            outlineOptimizationEnabled: false,
            sizeOptimizationEnabled: false
        };
    }
    else {
        rendererParams = {
            layer: layer,
            view: view,
            valueExpression: "$feature." + attribute,
            classificationMethod: 'natural-breaks',

            // does not work for client side graphics?
            outlineOptimizationEnabled: false,
            sizeOptimizationEnabled: false
        };
    }
    // Generate a continuous size renderer based on the
    // statistics of the data in the provided layer
    // and field.
    //
    // This resolves to an object containing several helpful
    // properties, including size scheme, statistics,
    // the renderer, and visual variable

    let rendererResult = null;
    let slider;

    colorRendererCreator
        .createClassBreaksRenderer(rendererParams)
        .then(response => {

            rendererResult = response;
            layer.renderer = rendererResult.renderer;

            // generate a histogram for use in the slider. Input the layer
            // and field name to generate it.
            updateColorSlider(rendererResult);

            if (response.colorScheme.name == "Blue 3") {
                properties.classBreaksColors = response.colorScheme.colors;

                response.renderer.classBreakInfos.forEach((info, index) => {
                    if (properties.classBreaksColors[index]) {
                        properties.classBreaksColors[index].label = info.label;
                    }
                });
            }

            return histogram({
                layer: layer,
                valueExpression: rendererParams.valueExpression,
                view: view
            });
        })
        .catch(function (error) {
            console.error("there was an error: ", error);
        });

    function updateColorSlider(rendererResult) {
        histogram({
            layer: layer,
            valueExpression: rendererParams.valueExpression,
            view: view,
            numBins: 100
        }).then(function (histogramResult) {

            function updateLabels(classBreakInfos) {
                classBreakInfos.forEach((info, index) => {
                    const min = info.minValue;
                    const max = info.maxValue;

                    if (index === 0) {
                        info.label = `${min.toFixed(1)} – ${max.toFixed(1)}`;
                    } else {
                        info.label = `> ${min.toFixed(1)} – ${max.toFixed(1)}`;
                    }

                    if (properties.classBreaksColors[index]) {
                        properties.classBreaksColors[index].label = info.label;
                    }
                });
            }

            function changeEventHandler(event) {
                layer.renderer.classBreakInfos = slider.updateClassBreakInfos(
                    layer.renderer.classBreakInfos
                );

                updateLabels(layer.renderer.classBreakInfos);
            }

            if (!slider) {

                slider = ClassedColorSlider.fromRendererResult(
                    rendererResult,
                    histogramResult
                );
                slider.container = domNode;
                slider.viewModel.precision = 1;

                slider.on(
                    ["thumb-change", "thumb-drag", "min-change", "max-change"],
                    changeEventHandler
                );
            } else {
                slider.updateFromRendererResult(rendererResult, histogramResult);
            }
        });
    }
}
