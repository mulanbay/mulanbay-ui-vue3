<template>
  <div>
    <svg-icon icon-class="documentation" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://www.yuque.com/mulanbay/rgvt6k/uy08n4');

function goto() {
  window.open(url.value)
}
</script>