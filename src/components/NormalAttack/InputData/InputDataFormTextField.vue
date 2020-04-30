<template>
  <v-layout>
    <v-tooltip top v-if="hasCheckbox">
      <template v-slot:activator="{ on }">
        <v-checkbox
          class="shrink mt-0"
          v-on="on"
          v-model="enabled"
          dense
        ></v-checkbox>
      </template>
      <span>{{ checkboxTooltip }}</span>
    </v-tooltip>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-text-field
          :label="label"
          :value="value"
          @input="$emit('input', $event)"
          @keydown="validateForm"
          @keyup="validateForm"
          @blur="validateForm"
          type="number"
          :min="min"
          :max="max"
          :messages="messages"
          v-on="on"
          :disabled="isDisabled"
          dense
        ></v-text-field>
      </template>
      <span v-html="tooltip"></span>
    </v-tooltip>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from "vue-property-decorator";
import { Mixin } from "../Mixin";

@Component({
  components: {}
})
export default class InputDataFormTextField extends Mixins(Mixin) {
  @Prop({ type: Boolean, default: false })
  hasCheckbox!: boolean;

  @Prop({ type: String, default: "" })
  checkboxTooltip!: string;

  @Prop({ type: String, default: "" })
  label!: string;

  @Prop({ type: Number, default: 0 })
  min!: number;

  @Prop({ type: Number, default: 0 })
  max!: number;

  @Prop({ type: String, default: "" })
  messages!: string;

  @Prop({ type: String, default: "" })
  tooltip!: string;

  @Prop({ type: Number, default: 0 })
  value!: number;

  enabled = false;

  get isDisabled() {
    return this.hasCheckbox === true && this.enabled === false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateForm(event: any) {
    if (event.target.value > this.max) {
      event.target.value = this.max;
      event.preventDefault();
    }

    if (event.target.value < this.min) {
      event.target.value = this.min;
      event.preventDefault();
    }
  }
}
</script>
