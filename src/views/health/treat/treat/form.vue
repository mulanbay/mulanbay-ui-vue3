<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="医院名称" prop="hospital">
            <el-select
              v-model="form.hospital"
              :style="{width: '100%'}"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in hospitalOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="科室名称" prop="department">
            <el-select
              v-model="form.department"
              :style="{width: '100%'}"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in departmentOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="疾病症状" prop="disease">
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
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属器官" prop="organ">
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
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="确诊疾病" prop="confirmDisease">
            <el-select
              v-model="form.confirmDisease"
              :style="{width: '100%'}"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in confirmDiseaseOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="看病类型" prop="treatType">
            <el-select
              v-model="form.treatType"
              :style="{width: '100%'}"
              default-first-option
              placeholder="请选择">
              <el-option
                v-for="dict in treatTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="疾病标签" prop="tags">
            <el-input-tag v-model="tagsOptions" @input="handleTagInput" tag-type="primary" tag-effect="light" placeholder="输入标签" >
              <template #suffix>
                <el-popover :visible="tagsPopOpen" placement="top" :width="400">
                  <el-tag
                    effect="plain"
                    type="primary"
                    round
                    :key="tag"
                    v-for="tag in hisTagOptions"
                    :disable-transitions="false"
                    @click="handleTagAppend(tag.text)">
                    {{tag.text}}
                  </el-tag>
                  <div style="text-align: right; margin: 0">
                    <el-button size="small" type="success" icon="CircleCheckFilled" @click="tagsPopOpen = false">确定</el-button>
                  </div>
                  <template #reference>
                    <el-button @click="tagsPopOpen=true" type="success" icon="Share" size="small">选择</el-button>
                  </template>
                </el-popover>
              </template>
            </el-input-tag>    
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="疼痛等级" prop="painLevel">
            <el-rate
              v-model="form.painLevel"
              show-score
              :max="5"
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
          <el-form-item label="门诊类型" prop="os">
            <el-select
              v-model="form.os"
              :style="{width: '100%'}"
              allow-create
              clearable
              default-first-option
              placeholder="请选择">
              <el-option
                v-for="dict in osOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
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
          <el-form-item label="医生姓名" prop="doctor">
            <el-input v-model="form.doctor" :style="{width: '100%'}" placeholder="" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="是否有病" prop="sick">
            <el-switch v-model="form.sick"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="费用信息">
            <span class="link-type" @click="showFee()"><el-icon>
                <Tools />
              </el-icon></span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="看病时间" prop="treatTime">
            <el-date-picker type="datetime" v-model="form.treatTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
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
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息">
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

    <!-- 费用表单 -->
    <FeeForm ref="feeFormRef" @success="confirmFeeData" />
    
</template>

<script setup name="TreatForm">
  import { createTreat, editTreat, getTreat, getTreatCateTree } from "@/api/health/treat/treat";
  import { appendTagToOptions,checkTag } from "@/utils/tagUtils";
  import FeeForm from './feeForm.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('看病记录');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const feeFormRef = ref();
  
  const hospitalOptions = ref([]);
  const departmentOptions = ref([]);
  const diseaseOptions = ref([]);
  const organOptions = ref([]);
  const confirmDiseaseOptions = ref([]);
  const treatTypeOptions = ref([]);
  const osOptions = ref([]);
  const stageOptions = ref([]);
  //标签
  const tagsOptions = ref([]);
  const hisTagOptions = ref([]);
  const tagsPopOpen = ref(false);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      hospital: [
        { required: true, message: "医院不能为空", trigger: "blur" }
      ],
      department: [
        { required: true, message: "科室不能为空", trigger: "blur" }
      ],
      disease: [
        { required: true, message: "疾病症状不能为空", trigger: "blur" }
      ],
      organ: [
        { required: true, message: "器官不能为空", trigger: "blur" }
      ],
      confirmDisease: [
        { required: true, message: "确诊疾病不能为空", trigger: "blur" }
      ],
      treatTime: [
        { required: true, message: "看病时间不能为空", trigger: "blur" }
      ],
      os: [
        { required: true, message: "门诊类型不能为空", trigger: "blur" }
      ],
      stage: [
        { required: true, message: "门诊阶段不能为空", trigger: "blur" }
      ],
      treatType: [
        { required: true, message: "看病类型不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id, type) => {
    open.value = true;
    resetForm();
    loadOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getTreat(id).then(response => {
        formLoading.value = false;
        form.value = response;
        if(!proxy.isEmpty(response.tags)){
          tagsOptions.value = response.tags.split(',');
        }else{
          tagsOptions.value = [];
        }
      });
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 标签处理 start */
  // 选择标签
  function handleTagAppend(tag) {
    appendTagToOptions(tag, tagsOptions.value);
  }
  //输入标签
  function handleTagInput(tag) {
    checkTag(tag, tagsOptions.value);
  }
  /** 标签处理 end */

  /** 打开费用标签 */
  function showFee() {
    feeFormRef.value.openForm(form.value,false);
  }

  /** 确定费用 */
  function confirmFeeData(data){
    form.value = data;
  }
  
  /** 加载下拉选项 */
  function loadOptions() {
    getTreatCateTree('tags', false).then(
      response => {
        hisTagOptions.value = response;
      }
    );
    getTreatCateTree('hospital', false).then(
      response => {
        hospitalOptions.value = response;
      }
    );
    getTreatCateTree('department', false).then(
      response => {
        departmentOptions.value = response;
      }
    );
    getTreatCateTree('disease', false).then(
      response => {
        diseaseOptions.value = response;
      }
    );
    getTreatCateTree('organ', false).then(
      response => {
        organOptions.value = response;
      }
    );
    getTreatCateTree('confirmDisease', false).then(
      response => {
        confirmDiseaseOptions.value = response;
      }
    );
  }

  // 表单重置
  function resetForm() {
    form.value = {
      treatId: undefined,
      sick: true,
      painLevel: 3,
      important: 3,
      treatType: 'TREAT',
      os: '普通',
      drugFee: 0,
      operationFee: 0,
      pdFee: 0,
      miFee: 0,
      regFee: 0,
      totalFee: 0,
      otherFee: 0,
      stage: 'FIRST',
      syncToConsume: true
    };
    tagsOptions.value = [];
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if(tagsOptions.value.length>0){
          form.value.tags = tagsOptions.value.join(',');
        }else{
          form.value.tags = undefined;
        }
        if (form.value.treatId != undefined) {
          editTreat(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createTreat(form.value).then(response => {
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
    proxy.getDictItemTree('TREAT_OS_NAME', false).then(response => {
      osOptions.value = response;
    });
    proxy.getEnumDict('TreatType', 'FIELD', false).then(response => {
      treatTypeOptions.value = response;
    });
    proxy.getEnumDict('TreatStage', 'FIELD', false).then(response => {
      stageOptions.value = response;
    });
  })
</script>