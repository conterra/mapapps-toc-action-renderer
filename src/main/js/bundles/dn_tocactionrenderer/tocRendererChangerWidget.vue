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
<template>
  <v-container class="dn_tocactionrenderer">
    <template v-if="selectedLayerId">
      <v-select
        :items="rendererOptions"
        v-model="selectedRenderer"
        label="Renderer"
      ></v-select>
      <template v-if="selectedLayerId && selectedRenderer != 'Simple'">
        <v-select
          :items="selectedLayerAttributes"
          item-text="name"
          item-value="name"
          v-model="selectedAttribute"
          label="Attribute"
        ></v-select>
      </template>
      <template v-if="selectedRenderer">
        <v-btn @click="resetRenderer">Reset Renderer</v-btn>
      </template>
      <template v-if="selectedRenderer == 'Simple'">
        <color-picker v-model="colorPickerValue"></color-picker>
        {{colorPickerValue}}
      </template>

      <div
        class="dn_tocactionrenderer-esri-widgets"
        ref="ctSmartRendererWidgets"
      ></div>
    </template>
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
import VueColor from './VueColor/index';


export default {
  components: {
    'color-picker': VueColor.Sketch
  },
  mixins: [Bindable],
  data: function() {
    return {
      name: "",
      i18n: Object,
      message: "",
      selectedLayerAttributes: Object,
      selectedLayerId: undefined,
      selectedAttribute: undefined,
      selectedRenderer: "Simple",
      rendererOptions: ["Simple", "Class Breaks", "Size", "Unique Values"],
      colorPickerValue: '#000000'
    };
  },

  watch: {
    selectedAttribute: function(attr) {
      if (attr) this.updateRenderer();
    },
    selectedRenderer: function(ren) {
      if (ren) this.updateRenderer();
    },
    colorPickerValue: function(attr){
      let rgbColor = [attr.rgba.r, attr.rgba.g, attr.rgba.b, attr.rgba.a];
      this.$emit("update-color", rgbColor);
    }
  },
  methods: {
    updateRenderer() {
      this.$emit("updateRenderer", {
        attribute: this.selectedAttribute,
        renderer: this.selectedRenderer
      });
    },
    resetWidget() {
      this.selectedRenderer = "Simple";
      this.colorPickerValue = undefined;
      this.selectedAttribute = undefined;
    },
    updateSimpleRenderer(event) {
      this.$emit("update-color", event);
    },

    resetRenderer() {
      this.$emit("resetRenderer");
    }
  }
};
</script>
