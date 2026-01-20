<!--

    Copyright (C) 2025 con terra GmbH (info@conterra.de)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<template>
    <v-container
        pa-0
        class="tocactionrenderer-main-container"
    >
        <!-- Renderer Selection Tabs -->
        <v-flex
            v-if="selectedLayerId"
            mb-2
        >
            <v-select
                v-model="selectedRenderer"
                :items="rendererItems"
                :label="i18n.renderer"
                hide-details
            />
        </v-flex>

        <v-flex
            v-if="selectedLayerId && selectedRenderer !== 'simple' &&
                selectedRenderer !== 'symbol' && selectedRenderer !== 'heatmap'"
            mb-2
        >
            <v-select
                v-model="selectedAttribute"
                :items="selectedLayerAttributes"
                item-text="name"
                item-value="name"
                :label="i18n.attribute"
                hide-details
            />
        </v-flex>

        <!-- Reset Button -->
        <v-flex
            v-if="selectedRenderer"
            mb-3
        >
            <v-btn
                class="primary"
                @click="$emit('reset-renderer')"
            >
                {{ i18n.resetRenderer }}
            </v-btn>
        </v-flex>

        <v-layout
            v-if="selectedRenderer && selectedRenderer !== 'unique_values'"
            row
            wrap
            class="tocactionrenderer-content-layout"
        >
            <v-flex
                xs12
                md6
                class="tocactionrenderer-left-column"
            >
                <div v-if="selectedRenderer === 'simple'">
                    <v-card class="pa-3">
                        <p>{{ i18n.fillColor }}</p>
                        <div class="tocactionrenderer--color-picker">
                            <color-picker v-model="colorPickerValue" />
                        </div>
                        <div class="mb-4" />
                        <p>{{ i18n.outlineColor }}</p>
                        <div class="tocactionrenderer--color-picker">
                            <color-picker v-model="outlineColorPickerValue" />
                        </div>
                        <div class="mb-4" />
                        <p>{{ i18n.outlineWidth }}</p>
                        <v-text-field
                            v-model="outlineWidth"
                            type="number"
                            min="1"
                            single-line
                            hide-details
                            class="tocactionrenderer--outlineWidth-textfield"
                        />
                        <div v-if="currentGeometryType==='point'">
                            <div class="mb-4" />
                            <p>{{ i18n.pointSize }}</p>
                            <v-text-field
                                v-model="pointSize"
                                type="number"
                                min="1"
                                single-line
                                hide-details
                                class="tocactionrenderer--outlineWidth-textfield"
                            />
                        </div>
                    </v-card>
                </div>
                <div v-if="selectedRenderer === 'size' && selectedAttribute">
                    <v-card class="pa-3">
                        <p>{{ i18n.fillColor }}</p>
                        <div class="tocactionrenderer--color-picker">
                            <color-picker v-model="sizeRendererColorValue" />
                        </div>
                    </v-card>
                </div>
                <div v-if="selectedRenderer === 'symbol'">
                    <v-card class="pa-3">
                        <v-text-field
                            v-model="symbolURL"
                            :label="i18n.symbolUrlLabel"
                        />
                        <v-slider
                            v-model="symbolHeight"
                            thumb-label
                            :label="i18n.symbolHeightLabel"
                            :min="12"
                            :max="200"
                        />
                        <v-slider
                            v-model="symbolWidth"
                            thumb-label
                            :label="i18n.symbolWidthLabel"
                            :min="12"
                            :max="200"
                        />
                    </v-card>
                </div>
                <div v-if="selectedRenderer === 'heatmap'">
                    <v-card class="pa-3">
                        <div class="heatmap-settings">
                            <div
                                v-for="(item, index) in reverseArray(heatmapColors)"
                                :key="index"
                                class="heatmap-color-item"
                            >
                                <v-flex class="heatmap-color-container align-center pb-3">
                                    <color-picker
                                        :value="item.color"
                                        @input="updateHeatmapColor(index, $event)"
                                    />
                                </v-flex>
                            </div>
                        </div>
                    </v-card>
                </div>
                <div v-if="selectedRenderer === 'class_breaks' && selectedAttribute">
                    <v-card class="pa-3">
                        <div class="classbreaks-settings">
                            <div
                                v-for="(item, index) in reverseArray(classBreaksColors)"
                                :key="index"
                                class="classbreaks-color-item"
                            >
                                <div class="v-label theme--light mb-2">
                                    {{ item.label }}
                                </div>
                                <v-flex class="classbreaks-color-container align-center pb-3">
                                    <color-picker
                                        :value="item"
                                        @input="updateClassBreaksColor(index, $event)"
                                    />
                                </v-flex>
                            </div>
                        </div>
                    </v-card>
                </div>
            </v-flex>

            <v-flex
                v-if="selectedRenderer !== 'simple' &&
                    selectedRenderer !== 'symbol'"
                xs12
                md6
                class="tocactionrenderer-right-column"
            >
                <div
                    ref="ctSmartRendererWidgets"
                    class="tocactionrenderer-esri-widgets"
                />
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
    /*
    TODO:
    - different color schemes: https://developers.arcgis.com/javascript/latest/api-reference/esri-renderers-smartMapping-symbology-color.html#getSchemes
    - error handling
    - filter renderer for attr types
    - heatmap renderer
    */
    import Vue from "vue";
    import Bindable from "apprt-vue/mixins/Bindable";
    import ColorPicker from "./components/ColorPicker.vue";

    import type { ColorPickerObject, HeatmapColorStop, RGBAColor, I18n } from "./api";

    export default Vue.extend({
        components: {
            'color-picker': ColorPicker
        },
        mixins: [Bindable],
        props:{
            i18n: {
                type: Object as () => I18n,
                default: function (): I18n {
                    return {
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
                    };
                }
            }
        },
        data: function () {
            return {
                name: "",
                message: "",
                selectedLayerAttributes: [],
                selectedLayerId: undefined,
                selectedAttribute: undefined,
                selectedRenderer: "simple",
                color: [] as number[],
                outlineColor: [] as number[],
                sizeRendererColor: [] as number[],
                outlineWidth: undefined,
                pointSize: undefined,
                allowedRenderers: [] as string[],
                symbolApplicable: undefined,
                currentGeometryType: undefined,
                symbolURL: "",
                symbolHeight: {
                    type: Number,
                    default: 12
                },
                symbolWidth : {
                    type: Number,
                    default: 12
                },
                heatmapColors: [] as HeatmapColorStop[],
                classBreaksColors: [] as RGBAColor[]
            };
        },
        computed: {
            sizeRendererColorValue: {
                get() {
                    const color = this.sizeRendererColor;
                    if (color.length === 4) {
                        return {
                            r: color[0],
                            g: color[1],
                            b: color[2],
                            a: color[3]
                        };
                    } else {
                        return {
                            r: 200,
                            g: 200,
                            b: 200,
                            a: 1
                        };
                    }
                },
                set(value: ColorPickerObject) {
                    const rgba = value.rgba;
                    this.sizeRendererColor = [rgba.r, rgba.g, rgba.b, rgba.a];
                }
            },
            colorPickerValue: {
                get() {
                    const color = this.color;
                    if (color.length === 4) {
                        return {
                            r: color[0],
                            g: color[1],
                            b: color[2],
                            a: color[3]
                        };
                    } else {
                        return {
                            r: 200,
                            g: 200,
                            b: 200,
                            a: 1
                        };
                    }
                },
                set(value: ColorPickerObject) {
                    const rgba = value.rgba;
                    this.color = [rgba.r, rgba.g, rgba.b, rgba.a];
                    this.updateSimpleRenderer();
                }
            },
            outlineColorPickerValue: {
                get() {
                    const outlineColor = this.outlineColor;
                    if (outlineColor.length === 4) {
                        return {
                            r: outlineColor[0],
                            g: outlineColor[1],
                            b: outlineColor[2],
                            a: outlineColor[3]
                        };
                    } else {
                        return {
                            r: 200,
                            g: 200,
                            b: 200,
                            a: 1
                        };
                    }
                },
                set(value: ColorPickerObject) {
                    const rgba = value.rgba;
                    this.outlineColor = [rgba.r, rgba.g, rgba.b, rgba.a];
                    this.updateSimpleRenderer();
                }
            },
            rendererItems: {
                get() {
                    const rendererArray = this.i18n.renderers;

                    if (this.symbolApplicable) {
                        return rendererArray.filter((renderer) =>
                            this.allowedRenderers.includes(renderer.value));
                    } else {
                        const tempRendererList = rendererArray.filter((renderer) =>
                            this.allowedRenderers.includes(renderer.value));
                        return tempRendererList.filter(renderer => renderer.value !== "symbol");
                    }
                }
            }
        },
        watch: {
            selectedAttribute: function (attr) {
                if (attr) {
                    this.updateRenderer();
                }
            },
            selectedRenderer: function (renderer) {
                if (renderer) {
                    this.updateRenderer();
                }
            }
        },
        methods: {
            reverseArray(arr: any[]) {
                return [...arr].reverse();
            },
            updateSimpleRenderer(){

                this.$emit("update-simple-renderer", {
                    renderer: this.selectedRenderer,
                    color: this.color,
                    outlineColor: this.outlineColor,
                    outlineWidth: this.outlineWidth,
                    pointSize: this.pointSize
                });
            },
            updateHeatmapColor(index: number, colorValue: ColorPickerObject) {
                const rgba = colorValue.rgba;
                // Calculate the actual index in the original array
                const actualIndex = this.heatmapColors.length - 1 - index;
                this.heatmapColors[actualIndex].color = {
                    r: rgba.r,
                    g: rgba.g,
                    b: rgba.b,
                    a: rgba.a
                };
                this.$emit("update-renderer", {
                    renderer: this.selectedRenderer,
                    heatmapColors: this.heatmapColors
                });
            },
            updateClassBreaksColor(index: number, colorValue: ColorPickerObject) {
                const rgba = colorValue.rgba;
                // Calculate the actual index in the original array
                const actualIndex = this.classBreaksColors.length - 1 - index;
                this.classBreaksColors[actualIndex].r = rgba.r;
                this.classBreaksColors[actualIndex].g = rgba.g;
                this.classBreaksColors[actualIndex].b = rgba.b;
                this.classBreaksColors[actualIndex].a = rgba.a;

                this.$emit("update-renderer", {
                    renderer: this.selectedRenderer,
                    attribute: this.selectedAttribute,
                    classBreaksColors: this.classBreaksColors
                });
            },
            updateRenderer() {
                this.$emit("update-renderer", {
                    attribute: this.selectedAttribute,
                    renderer: this.selectedRenderer
                });
            }
        }
    });
</script>
