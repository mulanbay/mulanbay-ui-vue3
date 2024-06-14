<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="680px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="检验项目" prop="name">
            <el-select
              v-model="form.name"
              filterable
              allow-create
              default-first-option
              :style="{width: '520px'}"
              @change="loadProperties">
              <el-option
                v-for="dict in nameOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="检测结果" prop="value">
            <el-input v-model="form.value" placeholder="" :style="{width: '520px'}" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="参考范围" prop="minValue">
            <el-input-number v-model="form.minValue" controls-position="right" :style="{width: '120px'}" :min="0" :controls="true" :precision="3" />
            ~~
            <el-input-number v-model="form.maxValue" controls-position="right" :style="{width: '120px'}" :min="0" :controls="true" :precision="3" />
            单位:<el-input v-model="form.unit" :style="{width: '100px'}" placeholder="" />
            (针对数字区间类)
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="参考范围" prop="referScope">
            <el-input v-model="form.referScope" placeholder="" :style="{width: '400px'}" />
            (针对字符类)
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="分析结果" prop="result">
            <el-select
              v-model="form.result"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in resultOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采集时间" prop="testTime">
            <el-date-picker type="datetime" v-model="form.testTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '200px'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :style="{width: '520px'}" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm(true)" v-if="form.testId==null">保存并继续</el-button>
        <el-button type="primary" @click="submitForm(false)">保 存</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="TreatTestForm">
  import { createTreatTest, editTreatTest, getTreatTest, getTreatTestCateTree, getLastTreatTest } from "@/api/health/treat/treatTest";
  import { getNowDateTimeString } from "@/utils/datetime";
  import { copyObject } from "@/utils/mulanbay";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('检验结果');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const nameOptions = ref([]);
  const resultOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      name: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      value: [
        { required: true, message: "检查结果不能为空", trigger: "blur" }
      ],
      testTime: [
        { required: true, message: "检查时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id, type, operationId) => {
    open.value = true;
    resetForm();
    loadOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getTreatTest(id).then(response => {
        formLoading.value = false;
        form.value = response;
        form.value.operationId = response.operation.operationId;
        form.value.operation = null;
      });
    } else {
      title.value = "新增";
      form.value.operationId = operationId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 加载下拉选项 */
  function loadOptions() {
    getTreatTestCateTree('name', false).then(
      response => {
        nameOptions.value = response;
      }
    );
  }

  //从已经有的用药记录加载
  function loadProperties(newVal) {
    if (!proxy.isEmpty(form.value.testId)) {
      //修改类不需要
      return;
    }
    //加载复制详情
    getLastTreatTest(newVal).then(response => {
      if (response != null) {
        const date = form.value.testTime;
        //form.value.operationId = response.operation.operationId;
        form.value.testTime = date;
        form.value.name = response.name;
        form.value.unit = response.unit;
        form.value.minValue = response.minValue;
        form.value.maxValue = response.maxValue;
        form.value.referScope = response.referScope;
        form.value.testId = undefined;
        form.value.result = undefined;
        form.value.value = undefined;
      }
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      testId: undefined,
      name: undefined,
      operationId: undefined,
      unit: undefined,
      value: undefined,
      minValue: undefined,
      maxValue: undefined,
      referScope: undefined,
      testTime: undefined,
      result: undefined,
      typeName: undefined,
      remark: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm(ca) {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.testId != undefined) {
          editTreatTest(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            if (ca == true) {
              copyFormData();
            } else {
              open.value = false;
            }
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createTreatTest(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            if (ca == true) {
              copyFormData();
            } else {
              open.value = false;
            }
            // 发送操作成功的事件
            emit('success');
          });
        }
      }
    });
  }
  
  /** 复制表单数据 **/
  function copyFormData(){
    const date = form.value.testTime;
    const operationId = form.value.operationId;
    resetForm();
    form.value.testTime = date;
    form.value.operationId = operationId;
  }

  /** 初始化 **/
  onMounted(() => {
    proxy.getEnumDict('TreatTestResult', 'FIELD', false).then(response => {
      resultOptions.value = response;
    });
  })
</script>