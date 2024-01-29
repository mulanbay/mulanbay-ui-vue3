<template>

  <!-- 执行时间段编辑对话框 -->
  <el-dialog :title="teEditTitle" v-model="teEditOpen" width="600px" append-to-body>
    <el-form ref="teFormRef" :model="teForm" label-width="120px">
      <el-form-item label="执行的时间段" prop="times">
        <el-input v-model="teForm.times" placeholder="请输入时间段" />
        <span style="color: red;">格式:08:00-13:00,14:00-16:00(空为总是要执行)</span>
      </el-form-item>
      <el-form-item label="执行的星期" prop="weeks">
        <el-checkbox-group v-model="teForm.weeks" @change="handleWeeksChange">
          <el-checkbox label="1">星期一</el-checkbox>
          <el-checkbox label="2">星期二</el-checkbox>
          <el-checkbox label="3">星期三</el-checkbox>
          <el-checkbox label="4">星期四</el-checkbox>
          <el-checkbox label="5">星期五</el-checkbox>
          <el-checkbox label="6">星期六</el-checkbox>
          <el-checkbox label="7">星期日</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitExecTimeEdit">确 定</el-button>
        <el-button @click="teEditOpen=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="TaskTriggerTimePeriods">
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const teEditTitle = ref('可执行时间段');
  const teEditOpen = ref(false);
  const teFormRef = ref();

  const data = reactive({
    teForm: {}
  });

  const { teForm } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openTimePeriodsEdit = async (execTimePeriods) => {
    teEditOpen.value = true;
    resetForm();
    if (proxy.isEmpty(execTimePeriods) || execTimePeriods == '{}') {
      return;
    }
    let pp = JSON.parse(execTimePeriods);;
    if (pp == undefined) {
      return;
    }
    if (!proxy.isEmpty(pp.times)) {
      teForm.value.times = pp.times;
    }
    if (pp.weeks != undefined) {
      teForm.value.weeks = pp.weeks.split(',');
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openTimePeriodsEdit });

  /** 不刷新显示有问题 */
  function handleWeeksChange() {
    proxy.$forceUpdate();
  }

  // 表单重置
  function resetForm() {
    teForm.value = {
      times: undefined,
      weeks: undefined
    };
    proxy.resetForm("teFormRef");
  }

  /** 提交表单 */
  function submitExecTimeEdit() {
    let pp = { times: undefined, weeks: undefined };
    pp.times = teForm.value.times;
    if (teForm.value.weeks != null && teForm.value.weeks.length > 0) {
      pp.weeks = teForm.value.weeks.join(',');
    }
    teEditOpen.value = false;
    // 发送操作成功的事件
    emit('success', JSON.stringify(pp));
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>