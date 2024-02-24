<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="500px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="所在公司" prop="companyId">
        <el-select
          v-model="form.companyId"
          placeholder="公司"
          clearable
          :style="{width: '100%'}"
        >
          <el-option
            v-for="dict in companyOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker type="datetime" v-model="form.startTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                  :style="{width: '200px'}" placeholder="请选择时间" clearable >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker type="datetime" v-model="form.endTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                  :style="{width: '200px'}" placeholder="请选择时间" clearable >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="加班日期" prop="workDate">
        <el-date-picker type="date" v-model="form.workDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                  :style="{width: '200px'}" placeholder="请选择日期" clearable >
        </el-date-picker>
        <span class="link-type" @click="msgAlert('提示','如果不填，默认是加班开始时间所在的日期')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="WorkOvertimeForm">
  import { createWorkOvertime, editWorkOvertime, getWorkOvertime } from "@/api/work/workOvertime";
  import { getCompanyTree } from "@/api/work/company";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('加班');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const companyOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      companyId: [
        { required: true, message: "公司不能为空", trigger: "blur" }
      ],
      startTime: [
        { required: true, message: "加班开始时间不能为空", trigger: "blur" }
      ],
      endTime: [
        { required: true, message: "加班结束时间不能为空", trigger: "blur" }
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
    loadOptions();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getWorkOvertime(id).then(response => {
          form.value = response;
          form.value.companyId = response.company.companyId;
          form.value.company = null;
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });
  
  function loadOptions(){
    getCompanyTree().then(response => {
      companyOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      overtimeId: undefined,
      companyId: undefined,
      startTime: undefined,
      endTime: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.overtimeId != undefined) {
          editWorkOvertime(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createWorkOvertime(form.value).then(response => {
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