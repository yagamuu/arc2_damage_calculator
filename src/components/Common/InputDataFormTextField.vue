<template>
  <div class="d-flex">
    <v-tooltip location="top" v-if="hasCheckbox">
      <template v-slot:activator="{ props: activatorProps }">
        <v-checkbox
          class="flex-grow-0 mt-0"
          v-bind="activatorProps"
          v-model="inputDataCheckbox"
          density="compact"
        ></v-checkbox>
      </template>
      <span>{{ checkboxTooltip }}</span>
    </v-tooltip>
    <v-tooltip location="top">
      <template v-slot:activator="{ props: activatorProps }">
        <v-text-field
          :label="label"
          v-model="inputData"
          @keydown="validateForm"
          @keyup="validateForm"
          @blur="validateForm"
          type="number"
          :min="min"
          :max="max"
          :messages="messages"
          v-bind="activatorProps"
          :disabled="isDisabled"
          density="compact"
        ></v-text-field>
      </template>
      <span v-html="tooltip"></span>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  components: {},
  props: {
    hasCheckbox: { type: Boolean, default: false },
    checkboxTooltip: { type: String, default: "" },
    label: { type: String, default: "" },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    messages: { type: String, default: "" },
    tooltip: { type: String, default: "" },
    value: { type: Number, default: 0 },
    checkbox: { type: Boolean, default: false }
  },
  emits: ["update:value", "update:checkbox"],
  data() {
    return {
      enabled: false
    };
  },
  computed: {
    isDisabled(): boolean {
      return this.hasCheckbox === true && this.inputDataCheckbox === false;
    },
    inputData: {
      get(): number {
        return this.value;
      },
      set(value: number) {
        this.$emit("update:value", value);
      }
    },
    inputDataCheckbox: {
      get(): boolean {
        return this.checkbox;
      },
      set(value: boolean) {
        this.$emit("update:checkbox", value);
      }
    }
  },
  methods: {
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
});
</script>
