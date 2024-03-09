<template>

  <!-- 详情对话框 -->
  <el-dialog :title="detailTitle" v-model="detailOpen" width="550px" append-to-body >

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
            业务业务
          </div>
        </template>
        {{ beanData.bussName}}
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
            积分时间
          </div>
        </template>
        {{ rewardData.createdTime}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><UploadFilled /></el-icon>
            奖励积分
          </div>
        </template>
        {{ rewardData.rewards}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><Comment /></el-icon>
            备注
          </div>
        </template>
        {{ rewardData.remark}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><Folder /></el-icon>
            消息标题
          </div>
        </template>
        {{ sourceMessage.title}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon><DocumentCopy /></el-icon>
            消息内容
          </div>
        </template>
        {{ sourceMessage.content}}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>

</template>

<script setup name="UserRewardSourceDetail">
  import { getUserRewardSourceDetail } from "@/api/data/userReward";
  import { getMessage } from "@/api/log/message";

  const { proxy } = getCurrentInstance();
  const formRef = ref();

  //可执行时间段
  const detailTitle = ref('积分详情');
  const detailOpen = ref(false);
  const detailLoading = ref(false);
  
  const data = reactive({
    //通用的bean信息
    beanData:{},
    //积分数据
    rewardData:{},
    //来源消息数据
    sourceMessage:{}
  });
  
  const { beanData,rewardData,sourceMessage } = toRefs(data);
  
  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (id) => {
    detailOpen.value = true;
    detailTitle.value = '积分详情,ID=['+id+']';
    beanData.value ={};
    rewardData.value ={};
    getUserRewardSourceDetail(id).then(response => {
      beanData.value = response.beanData;
      rewardData.value = response.rewardData;
      loadMessage(response.rewardData.messageId);
    });
  }
  
  function loadMessage(messageId){
    sourceMessage.value={};
    if(messageId==null){
      return;
    }
    getMessage(messageId).then(response => {
      if(response!=null){
        sourceMessage.value = response;
      }
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

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