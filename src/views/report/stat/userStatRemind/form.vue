<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="提醒周期" prop="triggerInterval">
        每
        <el-input-number v-model="form.triggerInterval" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" style="width: 120px" />
        <el-select
          v-model="form.triggerType"
          placeholder="周期"
          clearable
          collapse-tags
          style="width: 110px">
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
          style="width: 280px"
          placeholder="任意时间点">
        </el-time-picker>
      </el-form-item>
      <el-form-item label="数据超过" prop="overRate">
        <el-input-number v-model="form.overRate" style="width: 220px" controls-position="right" :min="0" :controls="true" :precision="0"/>
        %时提醒
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
         <el-input type="textarea" style="width: 280px" v-model="form.remark"></el-input>
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

<script setup name="UserStatRemindForm">
  import { createUserStatRemind, editUserStatRemind, getUserStatRemindByStat } from "@/api/report/stat/userStatRemind";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('用户统计提醒');
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
      remindTime: [
        { required: true, message: "提醒时间不能为空", trigger: "blur" }
      ],
      overRate: [
        { required: true, message: "报警比例不能为空", trigger: "blur" }
      ],
      triggerInterval: [
        { required: true, message: "提醒周期不能为空", trigger: "blur" }
      ],
      triggerType: [
        { required: true, message: "提醒周期不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (statId) => {
    open.value = true;
    resetForm();
    if (statId != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getUserStatRemindByStat(statId).then(response => {
          if(response==null){
            title.value = "新增";
            form.value.statId = statId;
          }else{
            form.value = response;
            form.value.statId = response.stat.statId;
            form.value.stat = null;
          }
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
      form.value.statId = statId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      remindId: undefined,
      owr: true,
      oar: true,
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
          editUserStatRemind(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
          });
        } else {
          createUserStatRemind(form.value).then(response => {
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