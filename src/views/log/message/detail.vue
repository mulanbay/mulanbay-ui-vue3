<template>

  <!-- 详情对话框 -->
  <el-dialog :title="detailTitle" v-model="detailOpen" width="750px" append-to-body>
    <el-divider content-position="center">消息详情</el-divider>
    <el-descriptions class="margin-top" :column="2" border v-loading="detailLoading">
      <el-descriptions-item width="150px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <StarFilled />
            </el-icon>
            消息编号
          </div>
        </template>
        {{ msgInfo.message.msgId}}
      </el-descriptions-item>
      <el-descriptions-item width="150px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <ChatLineRound />
            </el-icon>
            发送结果
          </div>
        </template>
        <span v-if="msgInfo.message.sendStatus=='SUCCESS'">
          <el-icon color="green">
            <SuccessFilled />
          </el-icon>
        </span>
        <span v-else-if="msgInfo.message.sendStatus=='FAIL'">
          <el-icon color="red">
            <CircleCloseFilled />
          </el-icon>
        </span>
        <span v-else style="color:darkmagenta ;">
          {{ msgInfo.message.sendStatusName }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <Clock />
            </el-icon>
            期望发送时间
          </div>
        </template>
        {{ msgInfo.message.expectSendTime}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <Clock />
            </el-icon>
            实际发送时间
          </div>
        </template>
        {{ msgInfo.message.lastSendTime}}
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <HomeFilled />
            </el-icon>
            标题
          </div>
        </template>
        {{ msgInfo.message.title}}
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <ChatLineSquare />
            </el-icon>
            内容
          </div>
        </template>
        {{ msgInfo.message.content}}
      </el-descriptions-item>
      <el-descriptions-item span="4">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <Comment />
            </el-icon>
            备注
          </div>
        </template>
        {{ msgInfo.message.remark}}
      </el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="center">用户详情</el-divider>
    <el-descriptions class="margin-top" :column="2" border v-loading="detailLoading">
      <el-descriptions-item width="150px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <Location />
            </el-icon>
            用户编号
          </div>
        </template>
        {{ msgInfo.user.userId }}
      </el-descriptions-item>
      <el-descriptions-item width="150px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <Avatar />
            </el-icon>
            用户名称
          </div>
        </template>
        {{ msgInfo.user.username }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <Iphone />
            </el-icon>
            手机号
          </div>
        </template>
        {{ msgInfo.user.phone }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <Message />
            </el-icon>
            Email
          </div>
        </template>
        {{ msgInfo.user.email }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <Management />
            </el-icon>
            发送微信
          </div>
        </template>
        <span v-if="msgInfo.user.sendWx==true">
          发送
        </span>
        <span v-else>
          不发送
        </span>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <Message />
            </el-icon>
            发送邮件
          </div>
        </template>
        <span v-if="msgInfo.user.sendEmail==true">
          发送
        </span>
        <span v-else>
          不发送
        </span>
      </el-descriptions-item>
    </el-descriptions>

  </el-dialog>

</template>

<script setup name="MessageDetail">
  import { getMessageDetail } from "@/api/log/message";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const detailTitle = ref('消息详情');
  const detailOpen = ref(false);
  const detailLoading = ref(false);

  const data = reactive({
    msgInfo: {},
  });

  const { msgInfo } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openDetail = async (msgId) => {
    detailOpen.value = true;
    resetForm();
    detailLoading.value = true;
    //按日志编号查询
    getMessageDetail(msgId).then(response => {
      detailLoading.value = false;
      msgInfo.value = response;
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openDetail });

  // 表单重置
  function resetForm() {
    msgInfo.value = {
      message: {},
      user: {}
    };
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>