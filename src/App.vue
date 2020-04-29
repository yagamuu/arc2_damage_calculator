<template>
  <v-app>
    <v-content>
      <app-bar />
      <contents />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AppBar from "./components/AppBar.vue";
import Contents from "./components/Contents.vue";

@Component({
  components: { AppBar, Contents }
})
export default class App extends Vue {}
</script>
