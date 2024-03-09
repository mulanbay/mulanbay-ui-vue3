<template>

  <!-- 详情对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body >
    
    <el-form ref="queryRef" :model="queryParams" label-width="120px" :inline="true">
      <el-form-item label="同时更新等级" prop="updateLevel">
        <el-switch v-model="queryParams.updateLevel" ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="UploadFilled" @click="handeSelfJudge" v-hasPermi="['config:levelConfig:selfJudge']">评测</el-button>
      </el-form-item>
    </el-form>
    
    <el-descriptions class="margin-top" :column="1" border  v-loading="loading" >
      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            <el-icon><HomeFilled /></el-icon>
            当前用户等级
          </div>
        </template>
        {{ currentLevel.level==null ? null: currentLevel.level+'  ('+currentLevel.levelName+')'}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><Comment /></el-icon>
            新定用户等级
          </div>
        </template>
        {{ newLevel.level==null ? null:newLevel.level+'  ('+newLevel.levelName+')'}}
      </el-descriptions-item>
    </el-descriptions>
    
  </el-dialog>

</template>

<script setup name="LevelConfigSelfJudge">
  import { selfJudge } from "@/api/config/levelConfig";

  const { proxy } = getCurrentInstance();
  const formRef = ref();

  //可执行时间段
  const title = ref('自我评测');
  const open = ref(false);
  const loading = ref(false);
  
  const dataList = ref([]);
  const data = reactive({
    newLevel:{},
    currentLevel:{},
    queryParams: {
      updateLevel: false
    },
    rules: {}
  });
  
  const { newLevel,currentLevel,queryParams, rules } = toRefs(data);
  
  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async () => {
    open.value = true;
  }
  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  function handeSelfJudge(){
    newLevel.value = {};
    currentLevel.value = {};
    loading.value = true;
    selfJudge(queryParams.value).then(response => {
      loading.value = false;
      newLevel.value = response.newLevel;
      currentLevel.value = response.currentLevel;
    });
  }
  
  /** 初始化 **/
  onMounted(() => {

  })
</script>
<style>
  .my-label {
    width: 140px;
    color: #999;
    font-weight: normal;
    background: #fff;
  }
</style>