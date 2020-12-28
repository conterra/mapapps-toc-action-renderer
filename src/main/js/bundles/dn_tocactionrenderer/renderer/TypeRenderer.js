/*
 * Copyright (C) 2020 con terra GmbH (info@conterra.de)
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
import * as typeRendererCreator from "esri/smartMapping/renderers/type";

export default function createTypeRenderer(layer, view, attribute, domNode) {

    const rendererParams = {
        layer: layer,
        view: view,
        field: attribute,
        numTypes: -1
    };

    let rendererResult = null;

    typeRendererCreator
        .createRenderer(rendererParams)
        .then(response => {
            // Set the output renderer on the layer

            rendererResult = response;
            layer.renderer = rendererResult.renderer;
        })
        .catch(function (error) {
            console.log("there was an error: ", error);
        });
};
