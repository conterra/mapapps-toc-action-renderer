<!--

    Copyright (C) 2021 con terra GmbH (info@conterra.de)

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
    import {Slider} from 'dn_vuecolor';

    export default {
        components: {
            'color-picker': Slider
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
                allowedRenderers: [],
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
                            r: 255,
                            g: 0,
                            b: 0,
                            a: 0
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
                            r: 255,
                            g: 0,
                            b: 0,
                            a: 0
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
                    return this.i18n.renderers.filter((renderer) => this.allowedRenderers.includes(renderer.value));
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
