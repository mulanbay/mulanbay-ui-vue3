<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="选择药品" prop="drugId">
        <el-select
          v-model="form.drugId"
          filterable
          allow-create
          default-first-option
          :style="{width: '250px'}">
          <el-option
            v-for="dict in drugOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-tooltip class="box-item" effect="dark" content="如果选择全部,则复制当次看病记录下的所有药品的用药记录" placement="top">
          <span>
            <el-icon><QuestionFilled /></el-icon>
          </span>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="模版日期" prop="templateDate">
        <el-date-picker type="date" v-model="form.templateDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
          :style="{width: '250px'}" placeholder="请选择时间" clearable>
        </el-date-picker>
        <el-tooltip class="box-item" effect="dark" content="以某一天为模版" placement="top">
          <span>
            <el-icon><QuestionFilled /></el-icon>
          </span>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="开始日期" prop="beginDate">
        <el-date-picker type="date" v-model="form.beginDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
          :style="{width: '250px'}" placeholder="请选择时间" clearable>
        </el-date-picker>
        <el-tooltip class="box-item" effect="dark" content="用药明细的开始复制的日期" placement="top">
          <span>
            <el-icon><QuestionFilled /></el-icon>
          </span>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker type="date" v-model="form.endDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
          :style="{width: '250px'}" placeholder="请选择时间" clearable>
        </el-date-picker>
        <el-tooltip class="box-item" effect="dark" content="用药明细的结束复制的日期" placement="top">
          <span>
            <el-icon><QuestionFilled /></el-icon>
          </span>
        </el-tooltip>
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

<script setup name="TreatDrugDetailForm">
  import { copyTreatDrugDetail } from "@/api/health/treat/treatDrugDetail";
  import { fetchList as fetchDrugList } from "@/api/health/treat/treatDrug";
  import { getNowDateTimeString } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('复制用药明细');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const drugOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      templateDate: [
        { required: true, message: "模版日期不能为空", trigger: "blur" }
      ],
      beginDate: [
        { required: true, message: "开始时间不能为空", trigger: "blur" }
      ],
      endDate: [
        { required: true, message: "结束时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (treatId, drugId) => {
    open.value = true;
    resetForm();
    loadDrugSelect(treatId);
    if (drugId != null) {
      form.value.drugId = drugId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 获取drug
  function loadDrugSelect(treatId) {
    drugOptions.value = [];
    let para = {
      treatId: treatId,
      page: 0
    };
    fetchDrugList(para).then(response => {
      drugOptions.value.push({
        id: '',
        text: '--*全部药品*--',
      });
      let drugList = response.rows;
      for (var i = 0; i < drugList.length; i++) {
        let op = {
          id: drugList[i].drugId,
          text: drugList[i].drugName,
        }
        drugOptions.value.push(op);
      }
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      drugId: undefined,
      templateDate: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        proxy.$modal.loading("数据复制中，请稍候！");
        copyTreatDrugDetail(form.value).then(response => {
          proxy.$modal.closeLoading();
          proxy.$modal.msgSuccess("复制成功");
          open.value = false;
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