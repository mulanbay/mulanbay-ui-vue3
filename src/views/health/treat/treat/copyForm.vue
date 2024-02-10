<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="450px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="看病时间" prop="treatTime">
            <el-date-picker type="datetime" v-model="form.treatTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="同步消费" prop="form.syncToConsume">
            <el-switch v-model="form.syncToConsume"></el-switch>
            <el-tooltip content="勾选后自动同步该看病记录到消费记录列表中" effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="门诊阶段" prop="stage">
            <el-select
              v-model="form.stage"
              :style="{width: '100%'}"
              allow-create
              clearable
              default-first-option
              placeholder="请选择">
              <el-option
                v-for="dict in stageOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="复制药品" prop="form.copyDrug">
            <el-switch v-model="form.copyDrug"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="复制手术" prop="form.copyOperation">
            <el-switch v-model="form.copyOperation"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="TreatForm">
  import { copyTreat } from "@/api/health/treat/treat";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('复制');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const stageOptions = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      treatTime: [
        { required: true, message: "看病时间不能为空", trigger: "blur" }
      ],
      stage: [
        { required: true, message: "门诊阶段不能为空", trigger: "blur" }
      ],
      syncToConsume: [
        { required: true, message: "同步消费不能为空", trigger: "blur" }
      ],
      copyDrug: [
        { required: true, message: "复制药品不能为空", trigger: "blur" }
      ],
      copyOperation: [
        { required: true, message: "复制手术不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (treatData) => {
    open.value = true;
    title.value = '复制('+treatData.treatTime+')的看病记录';
    resetForm();
    form.value.treatId=treatData.treatId;
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      treatId: undefined,
      stage: 'RETURN',
      syncToConsume: true,
      copyDrug: true,
      copyOperation: true
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        copyTreat(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          // 发送操作成功的事件
          emit('success');
        });
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {
    proxy.getEnumDict('TreatStage', 'FIELD', false).then(response => {
      stageOptions.value = response;
    });
  })
</script>