<template>
  <div class="app-container home">
    首页
  </div>
</template>

<script setup name="Index">
  function goTarget(url) {
    window.open(url, '__blank')
  }
  
  /** 初始化 **/
  onMounted(() => {
    //暂时重定向到用户日历
    //location.href="/data/userCalendar/calendarList";
  })
</script>
