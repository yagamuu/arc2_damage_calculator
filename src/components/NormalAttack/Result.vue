<template>
  <v-container>
    <p>
      ダメージ：0～9999<br />
      期待値：****
    </p>
    <v-text-field
      type="number"
      min="0"
      max="32767"
      style="max-width:350px;"
      label="入力値以上のダメージが発生する確率"
      messages="**.**%"
      dense
    ></v-text-field>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class Result extends Vue {}
</script>
