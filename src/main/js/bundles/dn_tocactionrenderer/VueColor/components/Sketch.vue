<!--

    Copyright (C) 2020 con terra GmbH (info@conterra.de)

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
/*** SKIP-SONARQUBE-ANALYSIS ***/
<template>
    <div role="application" aria-label="Sketch color picker"
         :class="['vc-sketch', disableAlpha ? 'vc-sketch__disable-alpha' : '']">
        <!--        <div class="vc-sketch-saturation-wrap">-->
        <!--            <saturation v-model="colors" @change="childChange"></saturation>-->
        <!--        </div>-->
        <div class="vc-sketch-controls">
            <div class="vc-sketch-sliders">
                <div class="vc-sketch-hue-wrap">
                    <hue v-model="colors" @change="childChange"></hue>
                </div>
                <div class="vc-sketch-alpha-wrap" v-if="!disableAlpha">
                    <alpha v-model="colors" @change="childChange"></alpha>
                </div>
            </div>
            <div class="vc-sketch-color-wrap">
                <div :aria-label="`Current color is ${activeColor}`" class="vc-sketch-active-color"
                     :style="{background: activeColor}"></div>
                <checkboard></checkboard>
            </div>
        </div>
        <!--        <div class="vc-sketch-field" v-if="!disableFields">-->
        <!--            &lt;!&ndash; rgba &ndash;&gt;-->
        <!--            <div class="vc-sketch-field&#45;&#45;double">-->
        <!--                <ed-in label="hex" :value="hex" @change="inputChange"></ed-in>-->
        <!--            </div>-->
        <!--            <div class="vc-sketch-field&#45;&#45;single">-->
        <!--                <ed-in label="r" :value="colors.rgba.r" @change="inputChange"></ed-in>-->
        <!--            </div>-->
        <!--            <div class="vc-sketch-field&#45;&#45;single">-->
        <!--                <ed-in label="g" :value="colors.rgba.g" @change="inputChange"></ed-in>-->
        <!--            </div>-->
        <!--            <div class="vc-sketch-field&#45;&#45;single">-->
        <!--                <ed-in label="b" :value="colors.rgba.b" @change="inputChange"></ed-in>-->
        <!--            </div>-->
        <!--            <div class="vc-sketch-field&#45;&#45;single" v-if="!disableAlpha">-->
        <!--                <ed-in label="a" :value="colors.a" :arrow-offset="0.01" :max="1" @change="inputChange"></ed-in>-->
        <!--            </div>-->
        <!--        </div>-->
        <div class="vc-sketch-presets" role="group" aria-label="A color preset, pick one to set as current color">
            <template v-for="c in presetColors">
                <div
                        v-if="!isTransparent(c)"
                        class="vc-sketch-presets-color"
                        :aria-label="'Color:' + c"
                        :key="c"
                        :style="{background: c}"
                        @click="handlePreset(c)">
                </div>
                <div
                        v-else
                        :key="c"
                        :aria-label="'Color:' + c"
                        class="vc-sketch-presets-color"
                        @click="handlePreset(c)">
                    <checkboard/>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    import colorMixin from '../mixin/color'
    import editableInput from './common/EditableInput.vue'
    import saturation from './common/Saturation.vue'
    import hue from './common/Hue.vue'
    import alpha from './common/Alpha.vue'
    import checkboard from './common/Checkboard.vue'

    const presetColors = [
        '#ffffff', '#000000', '#EEECE1', '#1f497d', '#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646',
        '#F2F2F2', '#7F7F7F', '#DDD9C3', '#C6D9F0', '#DBE5F1', '#F2DCDB', '#EBF1DD', '#E5E0EC', '#DBEEF3', '#FDEADA',
        '#D8D8D8', '#595959', '#C4BD97', '#8DB3E2', '#B8CCE4', '#E5B9B9', '#D7E3BC', '#CCC1D9', '#B7DDE8', '#FAC08F',
        '#A5A5A5', '#262626', '#494429', '#17365D', '#366092', '#953734', '#76923C', '#5F497A', '#205867', '#974806',
        '#C00000', '#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#002060', '#7030A0',
        'rgba(0,0,0,0)',
    ]

    export default {
        name: 'Sketch',
        mixins: [colorMixin],
        components: {
            saturation,
            hue,
            alpha,
            'ed-in': editableInput,
            checkboard
        },
        props: {
            presetColors: {
                type: Array,
                default() {
                    return presetColors
                }
            },
            disableAlpha: {
                type: Boolean,
                default: false
            },
            disableFields: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            hex() {
                let hex
                if (this.colors.a < 1) {
                    hex = this.colors.hex8
                } else {
                    hex = this.colors.hex
                }
                return hex.replace('#', '')
            },
            activeColor() {
                var rgba = this.colors.rgba
                return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a].join(',') + ')'
            }
        },
        methods: {
            handlePreset(c) {
                this.colorChange({
                    hex: c,
                    source: 'hex'
                })
            },
            childChange(data) {
                // change saturation to 240 hex
                data.s = 0.941;
                // change lightness to 120 hex
                data.l = 0.471;

                this.colorChange(data)
            },
            inputChange(data) {
                if (!data) {
                    return
                }
                if (data.hex) {
                    this.isValidHex(data.hex) && this.colorChange({
                        hex: data.hex,
                        source: 'hex'
                    })
                } else if (data.r || data.g || data.b || data.a) {
                    this.colorChange({
                        r: data.r || this.colors.rgba.r,
                        g: data.g || this.colors.rgba.g,
                        b: data.b || this.colors.rgba.b,
                        a: data.a || this.colors.rgba.a,
                        source: 'rgba'
                    })
                }
            }
        }
    }
</script>

<style>
    .vc-sketch {
        position: relative;
        width: 200px;
        padding: 10px 10px 0;
        box-sizing: initial;
        background: transparent;
        border-radius: 4px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, .15), 0 8px 16px rgba(0, 0, 0, .15);
    }

    .vc-sketch-saturation-wrap {
        width: 100%;
        padding-bottom: 75%;
        position: relative;
        overflow: hidden;
    }

    .vc-sketch-controls {
        display: flex;
    }

    .vc-sketch-sliders {
        padding: 4px 0;
        flex: 1;
    }

    .vc-sketch-sliders .vc-hue,
    .vc-sketch-sliders .vc-alpha-gradient {
        border-radius: 2px;
    }

    .vc-sketch-hue-wrap {
        position: relative;
        height: 10px;
    }

    .vc-sketch-alpha-wrap {
        position: relative;
        height: 10px;
        margin-top: 4px;
        overflow: hidden;
    }

    .vc-sketch-color-wrap {
        width: 24px;
        height: 24px;
        position: relative;
        margin-top: 4px;
        margin-left: 4px;
        border-radius: 3px;
    }

    .vc-sketch-active-color {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 2px;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .15), inset 0 0 4px rgba(0, 0, 0, .25);
        z-index: 2;
    }

    .vc-sketch-color-wrap .vc-checkerboard {
        background-size: auto;
    }

    .vc-sketch-field {
        display: flex;
        padding-top: 4px;
    }

    .vc-sketch-field .vc-input__input {
        width: 90%;
        padding: 4px 0 3px 10%;
        border: none;
        box-shadow: inset 0 0 0 1px #ccc;
        font-size: 10px;
    }

    .vc-sketch-field .vc-input__label {
        display: block;
        text-align: center;
        font-size: 11px;
        color: #222;
        padding-top: 3px;
        padding-bottom: 4px;
        text-transform: capitalize;
    }

    .vc-sketch-field--single {
        flex: 1;
        padding-left: 6px;
    }

    .vc-sketch-field--double {
        flex: 2;
    }

    .vc-sketch-presets {
        margin-right: -10px;
        margin-left: -10px;
        padding-left: 10px;
        padding-top: 10px;
        border-top: 1px solid #eee;
    }

    .vc-sketch-presets-color {
        border-radius: 3px;
        overflow: hidden;
        position: relative;
        display: inline-block;
        margin: 0 10px 10px 0;
        vertical-align: top;
        cursor: pointer;
        width: 16px;
        height: 16px;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .15);
    }

    .vc-sketch-presets-color .vc-checkerboard {
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .15);
        border-radius: 3px;
    }

    .vc-sketch__disable-alpha .vc-sketch-color-wrap {
        height: 10px;
    }
</style>
