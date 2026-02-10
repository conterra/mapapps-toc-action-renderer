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
import * as typeRendererCreator from "@arcgis/core/smartMapping/renderers/type";

export default async function createTypeRenderer(layer, view, attribute, symbol, size, uniqueValueInfos) {

    const rendererParams = {
        layer: layer,
        view: view,
        field: attribute,
        numTypes: -1
    };

    const colorAndValueInfo = [];
    try {
        const rendererResult = await typeRendererCreator.createRenderer(rendererParams);
        if (uniqueValueInfos) {
            rendererResult.renderer.uniqueValueInfos.forEach((info, index) => {
                info.symbol.style = symbol;
                info.symbol.size = size;
                info.symbol.color = uniqueValueInfos[index].color;
                colorAndValueInfo.push({ value: info.value, color: info.symbol.color });
            });
        } else {
            rendererResult.renderer.uniqueValueInfos.forEach( info => {
                info.symbol.style = symbol;
                info.symbol.size = size;
                colorAndValueInfo.push({ value: info.value, color: info.symbol.color });
            });
        }

        rendererResult.renderer.defaultSymbol.style = symbol;
        rendererResult.renderer.defaultSymbol.size = size;
        layer.renderer = rendererResult.renderer;
    } catch (error) {
        console.error("there was an error: ", error);
    }
    return colorAndValueInfo;
}
