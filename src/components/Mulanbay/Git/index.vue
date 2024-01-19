<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://gitee.com/mulanbay');

function goto() {
  window.open(url.value)
}
</script>
