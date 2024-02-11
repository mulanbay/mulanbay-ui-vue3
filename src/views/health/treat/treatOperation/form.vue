<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="720px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="手术名称" prop="operationName">
            <el-select
              v-model="form.operationName"
              filterable
              allow-create
              default-first-option
              :style="{width: '100%'}">
              <el-option
                v-for="dict in operationNameOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="手术分类" prop="category">
            <el-select
              v-model="form.category"
              :style="{width: '100%'}"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in categoryOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手术费用" prop="fee">
            <el-input-number v-model="form.fee" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="2"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="看病日期" prop="treatDate">
            <el-date-picker type="date" v-model="form.treatDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="复查日期" prop="reviewDate">
            <el-date-picker type="date" v-model="form.reviewDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="是否有效" prop="available">
            <el-switch v-model="form.available"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否有病" prop="sick">
            <el-switch v-model="form.sick"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="form.remark" :style="{width: '100%'}" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="TreatOperationForm">
  import { createTreatOperation, editTreatOperation, getTreatOperation, getTreatOperationCateTree } from "@/api/health/treat/treatOperation";
  import {getDay,getDayByDate,getNowDateString} from "@/utils/datetime";
  import { ElNotification } from 'element-plus'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('手术信息');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const operationNameOptions = ref([]);
  const categoryOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      operationName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      category: [
        { required: true, message: "分类不能为空", trigger: "blur" }
      ],
      treatDate: [
        { required: true, message: "看病时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id, type,treatId) => {
    open.value = true;
    resetForm();
    loadOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getTreatOperation(id).then(response => {
        formLoading.value = false;
        form.value = response;
        form.value.treatId = response.treat.treatId;
        form.value.treat = null;
        if (treatId != form.value.treatId) {
          ElNotification({
            title: '警告',
            message: h('i', { style: 'color: teal' }, '表单中的父级看病编号与列表查询的看病编号对应不上，可能是不同页面跳转过来引起'),
          })
        }
      });
    } else {
      if(treatId==null){
        proxy.$modal.msgError("没有看病记录编号绑定，无法新增");
        open.value = false;
        return;
      }
      title.value = "新增";
      form.value.treatId = treatId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 加载下拉选项 */
  function loadOptions() {
    getTreatOperationCateTree('operationName', false).then(
      response => {
        operationNameOptions.value = response;
      }
    );
    proxy.getDictItemTree('OPERATION_CATEGORY', false).then(response => {
      categoryOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      operationId: undefined,
      operationName: undefined,
      fee: 0,
      category: undefined,
      treatDate:getDay(0),
      available:false,
      sick:true
    };
    proxy.resetForm("formRef");
  }
  
  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.operationId != undefined) {
          editTreatOperation(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createTreatOperation(form.value).then(response => {
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