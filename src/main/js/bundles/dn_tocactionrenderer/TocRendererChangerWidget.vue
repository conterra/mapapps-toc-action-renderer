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
    <v-container pa-0>
        <v-layout
            column
            wrap
        >
            <v-flex
                v-if="selectedLayerId"
                xs12
                mb-2
            >
                <v-select
                    v-model="selectedRenderer"
                    :items="rendererItems"
                    :label="i18n.renderer"
                    hide-details
                />
                <div v-if="selectedLayerId && selectedRenderer !== 'simple' && selectedRenderer !== 'symbol' && selectedRenderer !== 'heatmap'">
                    <v-select
                        v-model="selectedAttribute"
                        :items="selectedLayerAttributes"
                        item-text="name"
                        item-value="name"
                        :label="i18n.attribute"
                        hide-details
                    />
                </div>
            </v-flex>
            <v-flex x12>
                <div v-if="selectedRenderer === 'simple'">
                    <v-card class="pa-3 secondary">
                        <p>{{ i18n.fillColor }}</p>
                        <div class="tocactionrenderer_color_picker">
                            <color-picker v-model="colorPickerValue" />
                        </div>
                        <div class="mb-4" />
                        <p>{{ i18n.outlineColor }}</p>
                        <div class="tocactionrenderer_color_picker">
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
                            class="tocactionrenderer_outlineWidth_textfield"
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
                                class="tocactionrenderer_outlineWidth_textfield"
                            />
                        </div>
                    </v-card>
                </div>
                <div v-if="selectedRenderer === 'symbol'">
                    <v-card class="pa-3 secondary">
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
            </v-flex>
            <v-flex
                v-if="selectedRenderer"
                xs12
            >
                <v-btn
                    class="secondary ml-0"
                    @click="$emit('reset-renderer')"
                >
                    {{ i18n.resetRenderer }}
                </v-btn>
            </v-flex>
        </v-layout>
        <div
            ref="ctSmartRendererWidgets"
            class="tocactionrenderer-esri-widgets"
        />
    </v-container>
</template>

<script>
    /*
    TODO:
    - different color schemes: https://developers.arcgis.com/javascript/latest/api-reference/esri-renderers-smartMapping-symbology-color.html#getSchemes
    - error handling
    - filter renderer for attr types
    - heatmap renderer
    */
    import Bindable from "apprt-vue/mixins/Bindable";
    import ColorPicker from "./components/ColorPicker.vue";

    export default {
        components: {
            'color-picker': ColorPicker
        },
        mixins: [Bindable],
        data: function () {
            return {
                name: "",
                i18n: Object,
                message: "",
                selectedLayerAttributes: [],
                selectedLayerId: undefined,
                selectedAttribute: undefined,
                selectedRenderer: "simple",
                color: [],
                outlineColor: [],
                outlineWidth: undefined,
                pointSize: undefined,
                allowedRenderers: [],
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
                }
            };
        },
        computed: {
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
                set(value) {
                    const rgba = value.rgba;
                    this.color = [rgba.r, rgba.g, rgba.b, rgba.a];
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
                set(value) {
                    const rgba = value.rgba;
                    this.outlineColor = [rgba.r, rgba.g, rgba.b, rgba.a];
                }
            },
            rendererItems: {
                get() {
                    const rendererArray = Object.keys(this.i18n.renderers).map(key => this.i18n.renderers[key]);

                    if (this.symbolApplicable) {
                        return rendererArray.filter((renderer) => this.allowedRenderers.includes(renderer.value));
                    } else {
                        const tempRendererList = rendererArray.filter((renderer) => this.allowedRenderers.includes(renderer.value));
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
            updateRenderer() {
                this.$emit("update-renderer", {
                    attribute: this.selectedAttribute,
                    renderer: this.selectedRenderer
                });
            }
        }
    };
</script>
