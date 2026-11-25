<template>
  <v-container>
    <v-card>
      <v-tabs v-model="tab" class="px-2 py-1">
        <v-tab value="normal-attack" class="mr-3">
          <v-icon class="mr-2">mdi-sword</v-icon>
          通常攻撃
        </v-tab>
        <v-tab value="ability-attack" class="mr-3">
          <v-icon class="mr-2">mdi-star-face</v-icon>
          特殊能力
        </v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="normal-attack">
          <normal-attack />
        </v-window-item>
        <v-window-item value="ability-attack">
          <ability-attack />
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NormalAttack from "./NormalAttack.vue";
import AbilityAttack from "./AbilityAttack.vue";

export default defineComponent({
  components: { NormalAttack, AbilityAttack },
  data() {
    return {
      tab: "normal-attack"
    };
  }
});
</script>
