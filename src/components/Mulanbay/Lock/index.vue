<template>
  <div>
    <svg-icon icon-class="lock" @click="handleSystemLock" />
    <SystemLock ref="systemLockFormRef" />
  </div>
</template>

<script setup>
  import SystemLock from '@/views/system/system/lock.vue'
  const systemLockFormRef = ref();

  /** 系统状态设置 */
  function handleSystemLock() {
    systemLockFormRef.value.openForm();
  }
</script>