<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="600px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="疾病名称" prop="disease">
            <el-select
              v-model="form.disease"
              :style="{width: '100%'}"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in diseaseOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="器官名称" prop="organ">
            <el-select
              v-model="form.organ"
              :style="{width: '100%'}"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in organOptions"
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
          <el-form-item label="疼痛等级" prop="painLevel">
           <el-rate
             v-model="form.painLevel"
             show-score
             text-color="#ff9900"
             score-template="{value}">
           </el-rate>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="重要程度" prop="important">
           <el-rate
             v-model="form.important"
             show-score
             allow-half
             text-color="#ff9900"
             score-template="{value}">
           </el-rate>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="发生日期" prop="occurDate">
            <el-date-picker type="date" v-model="form.occurDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '200px'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="finishDate">
            <el-date-picker type="date" v-model="form.finishDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '200px'}" placeholder="请选择时间" clearable @change="calculateMinutes">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="持续天数" prop="days">
           <el-input-number v-model="form.days" :style="{width: '100%'}" placeholder="单位:天" controls-position="right" :min="1" :controls="false" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="BodyAbnormalForm">
  import { getAbnormalCateTree,createBodyAbnormal, editBodyAbnormal, getBodyAbnormal } from "@/api/health/body/bodyAbnormal";
  import {dateDiff} from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('身体不适');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const diseaseOptions = ref([]);
  const organOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      disease: [
        { required: true, message: "疾病不能为空", trigger: "blur" }
      ],
      organ: [
        { required: true, message: "器官不能为空", trigger: "blur" }
      ],
      occurDate: [
        { required: true, message: "发生日期不能为空", trigger: "blur" }
      ],
      finishDate: [
        { required: true, message: "结束日期不能为空", trigger: "blur" }
      ],
      days: [
        { required: true, message: "持续天数不能为空", trigger: "blur" }
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
    initOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getBodyAbnormal(id).then(response => {
        formLoading.value = false;
        form.value = response;
      });
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });
  
  /** 初始化下拉树结构 */
  function initOptions(){
    getAbnormalCateTree('disease',false).then(response => {
      diseaseOptions.value = response;
    });
    getAbnormalCateTree('organ',false).then(response => {
      organOptions.value = response;
    });
  }
  
  //计算时长
  function calculateMinutes(){
    let occurDate=form.value.occurDate;
    let finishDate =form.value.finishDate;
    let days = dateDiff(occurDate,finishDate)+1;
    form.value.days=days;
  }
  
  // 表单重置
  function resetForm() {
    form.value = {
      id: undefined,
      painLevel: 3,
      important: 3
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.id != undefined) {
          editBodyAbnormal(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createBodyAbnormal(form.value).then(response => {
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