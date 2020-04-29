<template>
  <v-container>
    <v-card>
      <v-subheader>特殊能力</v-subheader>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class AbilityAttack extends Vue {
  dialog = false;
}
</script>
