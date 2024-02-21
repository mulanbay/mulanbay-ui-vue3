<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="500px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-form-item label="开始提醒设置" prop="fromRate">
        当进度未达到
        <el-input-number v-model="form.fromRate" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
        %时开始提醒
      </el-form-item>
      <el-form-item label="距离天数设置" prop="fromExpectDays">
        距离期望日期
        <el-input-number v-model="form.fromExpectDays" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
        天时开始提醒
      </el-form-item>
      <el-form-item label="计划完成时提醒" prop="finishRemind">
        <el-switch v-model="form.finishRemind"></el-switch>
      </el-form-item>
      <el-form-item label="提醒周期" prop="triggerInterval">
        每
        <el-input-number v-model="form.triggerInterval" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" style="width: 100px" />
        <el-select
          v-model="form.triggerType"
          placeholder="周期"
          clearable
          collapse-tags
          style="width: 100px">
          <el-option
            v-for="dict in triggerTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        一次
      </el-form-item>
      <el-form-item label="提醒时间" prop="remindTime">
        <el-time-picker
          v-model="form.remindTime"
          :picker-options="{selectableRange: '18:30:00 - 20:30:00'}"
          format="HH:mm" value-format="HH:mm"
          placeholder="任意时间点">
        </el-time-picker>
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
        <el-input type="textarea" v-model="form.remark"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="DreamRemindForm">
  import { createDreamRemind, editDreamRemind, getRemindByDream } from "@/api/dream/dreamRemind";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('梦想提醒');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const triggerTypeOptions = ref([{
      id: 'DAY',
      text: '天'
    },
    {
      id: 'WEEK',
      text: '周'
    },
    {
      id: 'MONTH',
      text: '月'
    }
  ]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      fromRate: [
        { required: true, message: "开始进度不能为空", trigger: "blur" }
      ],
      fromExpectDays: [
        { required: true, message: "距离天数设置不能为空", trigger: "blur" }
      ],
      finishRemind: [
        { required: true, message: "计划完成时提醒不能为空", trigger: "blur" }
      ],
      triggerInterval: [
        { required: true, message: "提醒周期不能为空", trigger: "blur" }
      ],
      triggerType: [
        { required: true, message: "提醒周期不能为空", trigger: "blur" }
      ],
      remindTime: [
        { required: true, message: "提醒时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (dreamId) => {
    open.value = true;
    resetForm();
    if (dreamId != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getRemindByDream(dreamId).then(response => {
          if(response==null){
            title.value = "新增";
            form.value.dreamId = dreamId;
          }else{
            form.value = response;
            form.value.dreamId = response.dream.dreamId;
          }
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
      form.value.dreamId = dreamId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      remindId: undefined,
      fromRate: 50,
      fromExpectDays: 90,
      finishRemind: true,
      triggerInterval: 1,
      triggerType: 'DAY',
      remindTime: '08:30'
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.remindId != undefined) {
          editDreamRemind(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
          });
        } else {
          createDreamRemind(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false;
          });
        }
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>