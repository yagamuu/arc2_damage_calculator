<template>
  <v-container>
    <v-expansion-panels multiple focusable hover :value="open">
      <v-expansion-panel v-for="(panel, i) in panels" :key="i">
        <v-expansion-panel-header>{{ panel.header }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <component :is="panel.component" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import InputData from "./AbilityAttack/InputData.vue";
import Description from "./AbilityAttack/Description.vue";

export default defineComponent({
  components: { InputData, Description },
  data() {
    return {
      open: [0],
      panels: [
        { header: "データ入力", component: InputData },
        { header: "データ詳細", component: Description }
      ]
    };
  }
});
</script>
