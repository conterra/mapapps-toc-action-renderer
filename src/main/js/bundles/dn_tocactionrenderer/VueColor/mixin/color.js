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
/*** SKIP-SONARQUBE-ANALYSIS ***/
import tinycolor from '../tinycolor2/tinycolor-min'

function _colorChange(data, oldHue) {
    var alpha = data && data.a
    var color

    // hsl is better than hex between conversions
    if (data && data.hsl) {
        color = tinycolor(data.hsl)
    } else if (data && data.hex && data.hex.length > 0) {
        color = tinycolor(data.hex)
    } else {
        color = tinycolor(data)
    }

    if (color && (color._a === undefined || color._a === null)) {
        color.setAlpha(alpha || 1)
    }

    var hsl = color.toHsl()
    var hsv = color.toHsv()

    if (hsl.s === 0) {
        hsv.h = hsl.h = data.h || (data.hsl && data.hsl.h) || oldHue || 0
    }

    /* --- comment this block to fix #109, may cause #25 again --- */
    // when the hsv.v is less than 0.0164 (base on test)
    // because of possible loss of precision
    // the result of hue and saturation would be miscalculated
    // if (hsv.v < 0.0164) {
    //   hsv.h = data.h || (data.hsv && data.hsv.h) || 0
    //   hsv.s = data.s || (data.hsv && data.hsv.s) || 0
    // }

    // if (hsl.l < 0.01) {
    //   hsl.h = data.h || (data.hsl && data.hsl.h) || 0
    //   hsl.s = data.s || (data.hsl && data.hsl.s) || 0
    // }
    /* ------ */

    return {
        hsl: hsl,
        hex: color.toHexString().toUpperCase(),
        hex8: color.toHex8String().toUpperCase(),
        rgba: color.toRgb(),
        hsv: hsv,
        oldHue: data.h || oldHue || hsl.h,
        source: data.source,
        a: data.a || color.getAlpha()
    }
}

export default {
    props: ['value'],
    data() {
        return {
            val: _colorChange(this.value)
        }
    },
    computed: {
        colors: {
            get() {
                return this.val
            },
            set(newVal) {
                this.val = newVal
                this.$emit('input', newVal)
            }
        }
    },
    watch: {
        value(newVal) {
            this.val = _colorChange(newVal)
        }
    },
    methods: {
        colorChange(data, oldHue) {
            this.oldHue = this.colors.hsl.h
            this.colors = _colorChange(data, oldHue || this.oldHue)
        },
        isValidHex(hex) {
            return tinycolor(hex).isValid()
        },
        simpleCheckForValidColor(data) {
            var keysToCheck = ['r', 'g', 'b', 'a', 'h', 's', 'l', 'v']
            var checked = 0
            var passed = 0

            for (var i = 0; i < keysToCheck.length; i++) {
                var letter = keysToCheck[i]
                if (data[letter]) {
                    checked++
                    if (!isNaN(data[letter])) {
                        passed++
                    }
                }
            }

            if (checked === passed) {
                return data
            }
        },
        paletteUpperCase(palette) {
            return palette.map(c => c.toUpperCase())
        },
        isTransparent(color) {
            return tinycolor(color).getAlpha() === 0
        }
    }
}
