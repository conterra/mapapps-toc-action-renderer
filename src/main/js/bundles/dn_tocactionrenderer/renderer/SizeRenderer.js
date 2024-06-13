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
import * as sizeRendererCreator from "esri/smartMapping/renderers/size";
import histogram from "esri/smartMapping/statistics/histogram";
import SizeSlider from "esri/widgets/smartMapping/SizeSlider";

export default function createSizeRenderer(layer, view, attribute, domNode) {

    const sizeParams = {
        layer: layer,
        view: view,
        valueExpression: "$feature." + attribute,

        // does not work for client side graphics?
        outlineOptimizationEnabled: false,
        sizeOptimizationEnabled: false
    };

    // Generate a continuous size renderer based on the
    // statistics of the data in the provided layer
    // and field.
    //
    // This resolves to an object containing several helpful
    // properties, including size scheme, statistics,
    // the renderer, and visual variable

    let rendererResult = null;

    sizeRendererCreator
        .createContinuousRenderer(sizeParams)
        .then(response => {
            // Set the output renderer on the layer

            rendererResult = response;
            layer.renderer = rendererResult.renderer;

            // generate a histogram for use in the slider. Input the layer
            // and field name to generate it.

            return histogram({
                layer: layer,
                valueExpression: sizeParams.valueExpression,
                view: view
            });
        })
        .then(histogramResult => {
            // Create a size slider from the renderer and histogram result

            const sizeSlider = SizeSlider.fromRendererResult(
                rendererResult,
                histogramResult
            );
            sizeSlider.container = domNode;

            // Color the slider track to match the renderer
            sizeSlider.style.trackFillColor = rendererResult.renderer.classBreakInfos[0].symbol.color;

            sizeSlider.labelFormatFunction = function (value) {
                return value.toFixed(1);
            };
            sizeSlider.viewModel.precision = 1;
            sizeSlider.histogramConfig.standardDeviation = null;

            // when the user slides the handle(s), update the renderer
            // with the updated color visual variable object

            sizeSlider.on(
                ["thumb-change", "thumb-drag", "min-change", "max-change"],
                () => {
                    const renderer = layer.renderer.clone();
                    const sizeVariable = renderer.visualVariables[0];
                    renderer.visualVariables = [
                        sizeSlider.updateVisualVariable(sizeVariable)
                    ];
                    layer.renderer = renderer;
                }
            );
        })
        .catch(function (error) {
            console.log("there was an error: ", error);
        });
};
