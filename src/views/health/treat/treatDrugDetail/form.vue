<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="350px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="用药时间" prop="occurTime">
        <el-date-picker type="datetime" v-model="form.occurTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                  :style="{width: '100%'}" placeholder="请选择时间" clearable >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="用药药量" prop="ec">
        <el-input-number v-model="form.ec" controls-position="right" :style="{width: '130px'}" :min="0" :controls="true" :precision="1"/>
        <el-select
          v-model="form.eu"
          filterable
          allow-create
          default-first-option
          :style="{width: '100px'}">
          <el-option
            v-for="dict in euOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注信息">
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

<script setup name="TreatDrugDetailForm">
  import { createTreatDrugDetail, editTreatDrugDetail, getTreatDrugDetail } from "@/api/health/treat/treatDrugDetail";
  import { getTreatDrug} from "@/api/health/treat/treatDrug";
  import {getNowDateTimeString} from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('用药明细');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const euOptions = ref([]);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      occurTime: [
        { required: true, message: "用药时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id,type,drugId) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getTreatDrugDetail(id).then(response => {
        formLoading.value = false;
        form.value = response;
        form.value.drugId = response.drug.drugId;
        form.value.ec = response.drug.ec;
        form.value.eu = response.drug.eu;
        form.value.drug = null;
      });
    } else {
      title.value = "新增";
      form.value.drugId = drugId;
      loadDrug(drugId);
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });
  
  // 获取drug
  function loadDrug(drugId) {
    getTreatDrug(drugId).then(response => {
      form.value.ec = response.ec;
      form.value.eu = response.eu;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      detailId: undefined,
      occurTime:getNowDateTimeString(),
      ec:1,
      eu:'粒',
      remark:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.detailId != undefined) {
          editTreatDrugDetail(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createTreatDrugDetail(form.value).then(response => {
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
    proxy.getDictItemTree('DRUG_EU', false).then(response => {
      euOptions.value = response;
    });
  })
</script>