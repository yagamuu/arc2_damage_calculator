<template>
  <v-app>
    <app-bar />
    <v-main>
      <contents />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppBar from "./components/AppBar.vue";
import Contents from "./components/Contents.vue";

export default defineComponent({
  components: { AppBar, Contents }
});
</script>
