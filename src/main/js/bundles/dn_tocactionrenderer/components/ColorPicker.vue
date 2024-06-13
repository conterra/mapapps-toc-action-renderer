<!--

    Copyright (C) 2024 con terra GmbH (info@conterra.de)

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
    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        offset-y
        max-width="220px"
    >
        <template #activator="{ on }">
            <v-btn
                small
                block
                :style="`background-color: ${backgroundColor}`"
                class="ma-0"
                v-on="on"
            />
        </template>
        <sketch-picker v-model="pickerColor" />
    </v-menu>
</template>

<script>
    import { Sketch } from "dn_vuecolor";

    export default {
        components: {
            'sketch-picker': Sketch
        },
        props: {
            value: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                menu: false
            };
        },
        computed: {
            pickerColor: {
                get() {
                    return this.value;
                },
                set(value) {
                    this.$emit("input", value);
                }
            },
            backgroundColor() {
                if (this.value) {
                    return `rgba(${this.value.r}, ${this.value.g}, ${this.value.b}, ${this.value.a})`;
                } else {
                    return "rgba(0,0,0)";
                }
            }
        }
    };
</script>
