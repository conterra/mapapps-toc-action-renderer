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
    <div class="vc-checkerboard" :style="bgStyle"></div>
</template>

<script>
    let _checkboardCache = {}

    export default {
        name: 'Checkboard',
        props: {
            size: {
                type: [Number, String],
                default: 8
            },
            white: {
                type: String,
                default: '#fff'
            },
            grey: {
                type: String,
                default: '#e6e6e6'
            }
        },
        computed: {
            bgStyle() {
                return {
                    'background-image': 'url(' + getCheckboard(this.white, this.grey, this.size) + ')'
                }
            }
        }
    }

    /**
     * get base 64 data by canvas
     *
     * @param {String} c1 hex color
     * @param {String} c2 hex color
     * @param {Number} size
     */

    function renderCheckboard(c1, c2, size) {
        // Dont Render On Server
        if (typeof document === 'undefined') {
            return null
        }
        var canvas = document.createElement('canvas')
        canvas.width = canvas.height = size * 2
        var ctx = canvas.getContext('2d')
        // If no context can be found, return early.
        if (!ctx) {
            return null
        }
        ctx.fillStyle = c1
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = c2
        ctx.fillRect(0, 0, size, size)
        ctx.translate(size, size)
        ctx.fillRect(0, 0, size, size)
        return canvas.toDataURL()
    }

    /**
     * get checkboard base data and cache
     *
     * @param {String} c1 hex color
     * @param {String} c2 hex color
     * @param {Number} size
     */

    function getCheckboard(c1, c2, size) {
        var key = c1 + ',' + c2 + ',' + size

        if (_checkboardCache[key]) {
            return _checkboardCache[key]
        } else {
            var checkboard = renderCheckboard(c1, c2, size)
            _checkboardCache[key] = checkboard
            return checkboard
        }
    }

</script>

<style>
    .vc-checkerboard {
        position: absolute;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        background-size: contain;
    }
</style>
