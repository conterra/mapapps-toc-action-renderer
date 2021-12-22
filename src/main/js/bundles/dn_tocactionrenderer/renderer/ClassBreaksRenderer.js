/*
 * Copyright (C) 2021 con terra GmbH (info@conterra.de)
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
import * as colorRendererCreator from "esri/smartMapping/renderers/color";
import histogram from "esri/smartMapping/statistics/histogram";
import ClassedColorSlider from "esri/widgets/smartMapping/ClassedColorSlider";

export default function createClassBreaksRenderer(layer, view, attribute, domNode) {
    const rendererParams = {
        layer: layer,
        view: view,
        valueExpression: "$feature." + attribute,
        classificationMethod: 'natural-breaks',
        numClasses: 5,

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
    let slider = undefined;

    colorRendererCreator
        .createClassBreaksRenderer(rendererParams)
        .then(response => {
            // Set the output renderer on the layer

            rendererResult = response;
            layer.renderer = rendererResult.renderer;

            // generate a histogram for use in the slider. Input the layer
            // and field name to generate it.
            updateColorSlider(response);


            return histogram({
                layer: layer,
                valueExpression: rendererParams.valueExpression,
                view: view
            });
        })
        .catch(function (error) {
            console.log("there was an error: ", error);
        });

    function updateColorSlider(rendererResult) {
        histogram({
            layer: layer,
            valueExpression: rendererParams.valueExpression,
            view: view,
            numBins: 100
        }).then(function (histogramResult) {
            if (!slider) {

                slider = ClassedColorSlider.fromRendererResult(
                    rendererResult,
                    histogramResult
                );
                slider.container = domNode;
                slider.viewModel.precision = 1;

                function changeEventHandler() {
                    const renderer = layer.renderer.clone();
                    renderer.classBreakInfos = slider.updateClassBreakInfos(
                        renderer.classBreakInfos
                    );
                    layer.renderer = renderer;
                }

                slider.on(
                    ["thumb-change", "thumb-drag", "min-change", "max-change"],
                    changeEventHandler
                );
            } else {
                slider.updateFromRendererResult(rendererResult, histogramResult);
            }
        });
    }
};
