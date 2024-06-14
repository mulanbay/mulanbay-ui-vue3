<template>

  <!-- 调度详情对话框 -->
  <el-dialog :title="timeoutTitle" v-model="timeoutOpen" width="620px" append-to-body >
    <el-descriptions class="margin-top" :column="1" border v-loading="timeoutLoading">
      <el-descriptions-item width="180px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <StarFilled />
            </el-icon>
            调度器名称
          </div>
        </template>
        {{ scheduleData.triggerName}}
      </el-descriptions-item>
      <el-descriptions-item width="180px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <BellFilled />
            </el-icon>
            当前超时时间
          </div>
        </template>
        <span v-if="scheduleData.timeout<0" >
          自动
        </span>
        <span v-else>
          {{ scheduleData.timeout+'毫秒('  }}{{ (scheduleData.timeout/1000).toFixed(0) +'秒)' }}
        </span>
      </el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="center">调度执行时长列表</el-divider>
    <el-descriptions class="margin-top" :column="1" border v-loading="timeoutLoading">
      <el-descriptions-item width="180px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <DataLine />
            </el-icon>
            计算周期
          </div>
        </template>
        <el-input-number v-model="form.days" placeholder="" controls-position="right" :controls="false" :precision="0" />
        天
        <el-button link icon="refresh" type="success" @click="refresh" v-hasPermi="['schedule:taskTrigger:calcTimeout']">重新计算</el-button>
      </el-descriptions-item>
    </el-descriptions>

    <el-table :data="dataList" v-loading="timeoutLoading">
      <el-table-column label="类型" prop="value" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时长" prop="value" align="center" >
        <template #default="scope">
          <span>{{ scope.row.value }}毫秒</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="value" align="center" width="80">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Select"
            @click="setTimeoutValue(scope.row.value)"
            v-hasPermi="['schedule:taskTrigger:edit']">选取
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <br><br>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" icon="Tools" @click="setTimeoutValue(-1)" v-hasPermi="['schedule:taskTrigger:edit']">设为自动</el-button>
      <el-button type="danger" icon="CircleCloseFilled" @click="timeoutOpen=false">关闭</el-button>
    </div>

  </el-dialog>

</template>

<script setup name="TaskTriggerTimeout">
  import { calcTimeout } from "@/api/schedule/taskTrigger";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const timeoutTitle = ref('超时时间计算');
  const timeoutOpen = ref(false);
  const timeoutLoading = ref(false);

  const scheduleData = ref();
  const dataList = ref([]);
  
  const data = reactive({
    form: {},
    rules: {
    }
  });
  
  const { form, rules } = toRefs(data);
  
  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (triggerId) => {
    timeoutOpen.value = true;
    form.value.triggerId = triggerId;
    form.value.days = null;
    loadData();
  }

  /** 加载数据 */
  function loadData() {
    resetForm();
    timeoutLoading.value = true;
    calcTimeout(form.value).then(response => {
      timeoutLoading.value = false;
      scheduleData.value = response.trigger;
      form.value.days = response.days;
      dataList.value = response.valueList;
    });
  }
  
  /** 设置超时 */
  function setTimeoutValue(v){
    // 发送操作成功的事件
    emit('success', v);
    timeoutOpen.value = false;
  }

  /** 刷新 */
  function refresh() {
    loadData();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    scheduleData.value = {};
    dataList.value = [];
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>