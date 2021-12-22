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
import HeatmapSlider from "esri/widgets/smartMapping/HeatmapSlider";
import * as heatmapRendererCreator from "esri/smartMapping/renderers/heatmap";

export default function createHeatMapRenderer(layer, properties, mapWidgetModel, domNode) {
    const params = {
        layer: layer,
        view: mapWidgetModel.view
    };

    let rendererResult = null;
    const colorStops = properties.colorStops;

    heatmapRendererCreator.createRenderer(params)
        .then(function (response) {
            rendererResult = response;
            layer.renderer = rendererResult.renderer;
        })
        .catch(function (error) {
            console.log("there was an error: ", error);
        });

    const slider = new HeatmapSlider();
    slider.stops = colorStops;
    slider.container = domNode;
    slider.on(
        ["thumb-change", "thumb-drag"],
        changeEventHandler
    );
    return slider;

    function changeEventHandler() {
        const renderer = layer.renderer.clone();
        renderer.colorStops = slider.stops;
        layer.renderer = renderer;
    }
};
