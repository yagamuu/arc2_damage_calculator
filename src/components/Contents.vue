<template>
  <v-container>
    <v-card>
      <v-tabs v-model="tab" class="px-2 py-1">
        <v-tab class="mr-3">
          <v-icon class="mr-2">mdi-sword</v-icon>
          通常攻撃
        </v-tab>
        <v-tab class="mr-3">
          <v-icon class="mr-2">mdi-star-face</v-icon>
          特殊能力
        </v-tab>
        <v-tab-item :key="0">
          <normal-attack />
        </v-tab-item>
        <v-tab-item :key="1">
          <ability-attack />
        </v-tab-item>
      </v-tabs>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NormalAttack from "./NormalAttack.vue";
import AbilityAttack from "./AbilityAttack.vue";

@Component({
  components: { NormalAttack, AbilityAttack }
})
export default class Contents extends Vue {
  tab = null;
}
</script>
