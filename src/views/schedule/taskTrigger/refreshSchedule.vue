<template>

  <!-- 刷新调度对话框 -->
  <el-dialog :title="refreshScheduleTitle" v-model="refreshScheduleOpen" width="600px" append-to-body>
    <el-form ref="refreshScheduleFormRef" :model="refreshScheduleForm" :rules="refreshScheduleRules" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="选择调度器" prop="triggerId">
            <el-tree-select
              v-model="refreshScheduleForm.triggerId"
              style="width: 515px"
              :data="taskTriggerOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              placeholder="请选择调度器"
              :check-strictly="false" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="强制刷新" prop="force">
            <el-switch v-model="refreshScheduleForm.force"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitRefreshSchedule">确 定</el-button>
        <el-button @click="refreshScheduleOpen=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="TaskTriggerRefreshSchedule">
  import { getTaskTriggerTree, refreshSchedule } from "@/api/schedule/taskTrigger";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const refreshScheduleTitle = ref('刷新调度');
  const refreshScheduleOpen = ref(false);
  const refreshScheduleFormRef = ref();
  const taskTriggerOptions = ref([]);

  const data = reactive({
    refreshScheduleForm: {},
    refreshScheduleRules: {
      triggerId: [
        { required: false, message: "调度器不能为空", trigger: "blur" }
      ],
      force: [
        { required: true, message: "是否强制不能为空", trigger: "blur" }
      ]
    }
  });

  const { refreshScheduleForm, refreshScheduleRules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openRefreshSchedule = async (triggerId) => {
    refreshScheduleOpen.value = true;
    resetForm();
    loadTaskTriggerTree();
    if (triggerId != null) {
      refreshScheduleForm.value.triggerId = triggerId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openRefreshSchedule });

  /** 加载调度树 */
  function loadTaskTriggerTree() {
    getTaskTriggerTree(false).then(response => {
      taskTriggerOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    refreshScheduleForm.value = {
      triggerId: undefined,
      force: false,
    };
    proxy.resetForm("teFormRef");
  }

  /** 提交表单 */
  function submitRefreshSchedule() {
    proxy.$refs["refreshScheduleFormRef"].validate(valid => {
      if (valid) {
        refreshSchedule(refreshScheduleForm.value).then(response => {
          proxy.$modal.msgSuccess("刷新成功");
          refreshScheduleOpen.value = false;
          // 发送操作成功的事件
          emit('success');
        });
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>