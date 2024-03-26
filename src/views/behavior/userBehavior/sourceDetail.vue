<template>

  <!-- 详情对话框 -->
  <el-dialog :title="detailTitle" v-model="detailOpen" width="500px" append-to-body >

    <el-descriptions class="margin-top" :column="1" border>
      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            <el-icon><HomeFilled /></el-icon>
            标题
          </div>
        </template>
        {{ beanData.title}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><Comment /></el-icon>
            内容
          </div>
        </template>
        {{ beanData.value==null ? null:beanData.value+beanData.unit}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><Comment /></el-icon>
            详情
          </div>
        </template>
        {{ beanData.content}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><Clock /></el-icon>
            开始时间
          </div>
        </template>
        {{ beanData.bussDay}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><Clock /></el-icon>
            结束时间
          </div>
        </template>
        {{ beanData.expireTime}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><StarFilled /></el-icon>
            业务来源
          </div>
        </template>
        {{ beanData.bussTypeName}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><Clock /></el-icon>
            行为时间
          </div>
        </template>
        {{ beanData.bussDay}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><QuartzWatch /></el-icon>
            全天日历
          </div>
        </template>
        <span v-if="beanData.allDay==true">
          <el-icon color="green"><CircleCheckFilled /></el-icon>
        </span>
        <span v-else>
          <el-icon color="red"><CircleCloseFilled /></el-icon>
        </span>
      </el-descriptions-item>
    </el-descriptions>

  </el-dialog>

</template>

<script setup name="UserBehaviorSourceDetail">

  const { proxy } = getCurrentInstance();
  const formRef = ref();

  //可执行时间段
  const detailTitle = ref('行为详情');
  const detailOpen = ref(false);
  const detailLoading = ref(false);
  
  const data = reactive({
    beanData:{}
  });
  
  const { beanData } = toRefs(data);
  
  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (data) => {
    detailOpen.value = true;
    proxy.$nextTick(()=>{
      beanData.value = data;
    });
    
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 日历时间显示 */
  function formatCalendarDate(item){
    if(proxy.isEmpty(item)||proxy.isEmpty(item.bussDay)){
      return null
    }
    if(item.period=='ONCE'){
      if(item.allDay){
        return item.bussDay.substring(0,10)+' (全天日历)';
      }else{
        return item.bussDay.substring(11,16);
      }
    }else{
      return item.bussDay.substring(11,16);
    }
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
<style>
  .my-label {
    width: 120px;
    color: #999;
    font-weight: normal;
    background: #fff;
  }
</style>