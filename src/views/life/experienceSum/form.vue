<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="350px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="所属年份" prop="year">
        <el-input-number v-model="form.year" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
      </el-form-item>
      <el-form-item label="总天数" prop="totalDays">
        <el-input-number v-model="form.totalDays" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
      </el-form-item>
      <el-form-item label="工作天数" prop="workDays">
        <el-input-number v-model="form.workDays" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
      </el-form-item>
      <el-form-item label="旅行天数" prop="travelDays">
        <el-input-number v-model="form.travelDays" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
      </el-form-item>
      <el-form-item label="学习天数" prop="studyDays">
        <el-input-number v-model="form.studyDays" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
        <el-input v-model="form.remark" :style="{width: '100%'}" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="ExperienceSumForm">
  import { createExperienceSum, editExperienceSum, getExperienceSum } from "@/api/life/experienceSum";
  import {getYear} from "@/utils/datetime";
  
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('经历汇总');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      year: [
        { required: true, message: "年费不能为空", trigger: "blur" }
      ],
      totalDays: [
        { required: true, message: "总天数不能为空", trigger: "blur" }
      ],
      workDays: [
        { required: true, message: "工作天数不能为空", trigger: "blur" }
      ],
      travelDays: [
        { required: true, message: "旅行天数不能为空", trigger: "blur" }
      ],
      studyDays: [
        { required: true, message: "学习天数不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getExperienceSum(id).then(response => {
        formLoading.value = false;
        form.value = response;
      });
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      sumId: undefined,
      year: getYear(0),
      totalDays: 365,
      workDays: 0,
      travelDays:0,
      studyDays:0
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.sumId != undefined) {
          editExperienceSum(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createExperienceSum(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        }
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>