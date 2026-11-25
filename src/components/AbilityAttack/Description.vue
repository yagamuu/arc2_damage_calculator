<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6">
        <description-unit-data target="attack" />
      </v-col>
      <v-col cols="12" lg="6">
        <description-unit-data target="defense" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DescriptionUnitData from "./Description/DescriptionUnitData.vue";

export default defineComponent({
  components: { DescriptionUnitData }
});
</script>
