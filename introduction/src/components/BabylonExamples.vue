<template>
  <div>
    <h3>Babylon Example</h3>
    <canvas></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// TODO:pathが通らない問題の解決
import { LightShadow } from '../BabylonExamples/LightShadow';

export default defineComponent({
  name: 'BabylonExamples',
  mounted(){
    const canvas = document.querySelector("canvas")!;
    new LightShadow(canvas);
  }

});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
canvas{
  width: 70%;
  height: 70%;
}
</style>
