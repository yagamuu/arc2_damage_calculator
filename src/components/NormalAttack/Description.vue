<template>
  <v-container>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-center">最終ダメージ</th>
            <th class="text-center">パターン1</th>
            <th class="text-center">パターン2</th>
            <th class="text-center">パターン3</th>
            <th class="text-center">パターン4</th>
            <th class="text-center">パターン5</th>
            <th class="text-center">パターン6</th>
            <th class="text-center">パターン7</th>
            <th class="text-center">パターン8</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in 6" :key="i">
            <td class="text-center">{{ i }}</td>
            <td class="text-center">****</td>
            <td class="text-center">****</td>
            <td class="text-center">****</td>
            <td class="text-center">****</td>
            <td class="text-center">****</td>
            <td class="text-center">****</td>
            <td class="text-center">****</td>
            <td class="text-center">****</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class Description extends Vue {}
</script>
