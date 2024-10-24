<template>

  <el-row>
    <el-col :span="24">
      <el-descriptions class="margin-top" :column="1" border>
        <el-descriptions-item label-class-name="my-label">
          <template #label>
            <div class="cell-item">
              <el-icon><StarFilled /></el-icon>
              业务名称
            </div>
          </template>
          {{ beanData.bussName}}
          <span v-if="beanData.source=='STAT'">
           <el-button link type="success" icon="InfoFilled" @click="showStatInfo(beanData)" >详情</el-button>
          </span>
          <span v-else-if="beanData.source=='PLAN'">
           <el-button link type="success" icon="InfoFilled" @click="showPlanInfo(beanData)" >详情</el-button>
          </span>
        </el-descriptions-item>
        <el-descriptions-item>
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
          {{ beanData.content}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Clock /></el-icon>
              业务时间
            </div>
          </template>
          {{ beanData.bussDay}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Clock /></el-icon>
              创建时间
            </div>
          </template>
          {{ beanData.createdTime}}
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
  </el-row>
  
  <!-- 统计 -->
  <UserStatStat ref="userStatStatRef" />
  
  <!-- 计划统计 -->
  <UserPlanStat ref="userPlanStatRef" />
    
</template>

<script setup name="BeanDetail">
  import UserStatStat from '../../report/stat/userStat/stat.vue'
  import UserPlanStat from '../../report/plan/userPlan/stat.vue'

  const { proxy } = getCurrentInstance();
  const userStatStatRef = ref();
  const userPlanStatRef = ref();
  
  const data = reactive({
    beanData: {}
  });
  const { beanData } = toRefs(data);
  
  /** 打开弹窗 */
  const showData = async (data) => {
    if(data==null){
      beanData.value = {};
    }else{
      beanData.value = data;
    } 
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  function handleClick() {

  }
  
  /** 统计 **/
  function showStatInfo(bd) {
    userStatStatRef.value.showData(bd.sourceId,bd.title);
  }
  
  /** 计划 **/
  function showPlanInfo(bd) {
    userPlanStatRef.value.showData(bd.sourceId,bd.title);
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