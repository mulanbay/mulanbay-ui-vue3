<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body class="customDialogCss">
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="90px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="选取模板" prop="fromTemplateId">
            <el-tree-select
              v-model="form.fromTemplateId"
              style="width: 580px"
              :data="statTemplateOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              placeholder="选择模版"
              :check-strictly="false"
              :disabled="form.templateId!=null"
              @change="handleFromTemplateChange" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="form.templateName" style="width: 580px" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="模板标题" prop="title">
            <el-input v-model="form.title" style="width: 580px" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="查询类型" prop="sqlType">
            <el-select v-model="form.sqlType" style="width: 230px" placeholder="请选择">
              <el-option
                v-for="dict in sqlTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务类型" prop="bussType">
            <el-select v-model="form.bussType" style="width: 230px" placeholder="请选择">
              <el-option
                v-for="dict in bussTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" 
                @change="initOrderIndex"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="查询语句" prop="sqlContent">
            <el-input v-model="form.sqlContent" type="textarea" :rows="5" style="width: 580px" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="显示顺序" prop="orderIndex">
            <el-input-number v-model="form.orderIndex" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="参数数量" prop="paras">
            <el-input-number v-model="form.paras" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="1">
          <el-tooltip content="查询语句中已经绑定的参数数量,因为可变查询参数中需要这个索引值" raw-content effect="dark" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="数据类型" prop="resultType">
            <el-select v-model="form.resultType" style="width: 230px" placeholder="请选择">
              <el-option
                v-for="dict in resultTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数据单位" prop="valueType">
            <el-select v-model="form.valueType" style="width: 230px" placeholder="请选择">
              <el-option
                v-for="dict in valueTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="模板状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in commonStatusOptions"
                :key="dict.id"
                :label="dict.id">{{dict.text}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板等级" prop="level">
            <el-input-number v-model="form.level" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="业务来源" prop="source">
            <el-select v-model="form.source" style="width: 230px" placeholder="请选择">
              <el-option
                v-for="dict in sourceOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="跳转地址" prop="url">
            <el-tree-select
              v-model="form.url"
              style="width: 230px"
              :data="urlOptions"
              :props="{ value: 'name', label: 'title', children: 'children' }"
              value-key="id"
              placeholder="跳转地址"
              :check-strictly="false"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="积分奖励" prop="rewards">
            <el-input-number v-model="form.rewards" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="日历标题" prop="calendarTitle">
            <el-input v-model="form.calendarTitle" style="width: 230px" placeholder="" >
              <template #append>
                <el-tooltip content="显示在用户日历中的标题信息." effect="dark" placement="top">
                  <el-icon>
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </template>  
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="form.remark" style="width: 590px" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="form.templateId == null&&form.fromTemplateId != null">
        <el-col :span="24">
          <el-form-item label="附加选项" prop="copyItems">
            <el-checkbox v-model="form.copyItems" >同时复制配置项</el-checkbox>
            <el-tooltip content="勾选则新增时同时复制模板的配置项列表." effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
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

<script setup name="StatTemplateForm">
  import { createStatTemplate, editStatTemplate, getStatTemplate, getStatTemplateTree, getNextOrderIndex } from "@/api/report/stat/statTemplate";
  import { getFullRouters } from "@/api/menu";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('统计模版');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const statusOptions = ref(proxy.commonStatusOptions);
  const statTemplateOptions = ref([]);
  const sqlTypeOptions = ref([]);
  const bussTypeOptions = ref([]);
  const resultTypeOptions = ref([]);
  const valueTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const urlOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      templateName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      title: [
        { required: true, message: "标题不能为空", trigger: "blur" }
      ],
      sqlType: [
        { required: true, message: "查询类型不能为空", trigger: "blur" }
      ],
      bussType: [
        { required: true, message: "关联的业务不能为空", trigger: "blur" }
      ],
      sqlContent: [
        { required: true, message: "查询语句不能为空", trigger: "blur" }
      ],
      resultType: [
        { required: true, message: "返回类型不能为空", trigger: "blur" }
      ],
      valueType: [
        { required: true, message: "返回值类型不能为空", trigger: "blur" }
      ],
      source: [
        { required: true, message: "业务来源不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "显示顺序不能为空", trigger: "blur" }
      ],
      level: [
        { required: true, message: "模版等级不能为空", trigger: "blur" }
      ],
      paras: [
        { required: true, message: "参数数量不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 来源模版变更 */
  function handleFromTemplateChange(id) {
    if (form.value.templateId != null) {
      return;
    }
    getStatTemplate(id).then(response => {
      response.fromTemplateId = form.value.fromTemplateId;
      form.value = response;
      form.value.templateId = null;
      form.value.orderIndex = null;
      initOrderIndex();
    });
  }

  /** 打开弹窗 */
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    loadOptions();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getStatTemplate(id).then(response => {
          form.value = response;
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

  function loadOptions() {
    getStatTemplateTree().then(response => {
      statTemplateOptions.value = response;
    });
  }

  // 枚举类的下拉菜单
  function loadTypeOptions() {
    proxy.getEnumDict('SqlType', 'FIELD', false).then(response => {
      sqlTypeOptions.value = response;
    });
    proxy.getEnumDict('ResultType', 'FIELD', false).then(response => {
      resultTypeOptions.value = response;
    });
    proxy.getEnumDict('ValueType', 'FIELD', false).then(response => {
      valueTypeOptions.value = response;
    });
    proxy.getEnumDict('BussType', 'FIELD', false).then(response => {
      bussTypeOptions.value = response;
    });
    proxy.getEnumDict('BussSource', 'FIELD', false).then(response => {
      sourceOptions.value = response;
    });
    getFullRouters().then(response => {
      urlOptions.value = response;
    });
  }

  // 获取下一个排序号
  function initOrderIndex() {
    if(form.value.orderIndex!=null){
      return;
    }
    getNextOrderIndex(form.value.bussType).then(response => {
      form.value.orderIndex = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      templateId: undefined,
      templateName: undefined,
      sqlType: 'SQL',
      resultType: 'DATE',
      valueType: 'DAY',
      status: 'ENABLE',
      level: 3,
      rewards: 0,
      orderIndex: undefined,
      fromTemplateId: undefined,
      copyItems: true,
      paras:1
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.templateId != undefined) {
          editStatTemplate(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createStatTemplate(form.value).then(response => {
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
    loadTypeOptions();
  })
</script>