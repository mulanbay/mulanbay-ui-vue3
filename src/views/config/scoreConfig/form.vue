<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="700px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="配置名称" prop="configName">
            <el-input v-model="form.configName" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="查询语句" prop="sqlContent">
            <el-input v-model="form.sqlContent" type="textarea" :rows="5"  style="width: 580px"  placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="极限值" prop="limitValue">
            <el-input-number v-model="form.limitValue" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="2"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单项满分" prop="maxScore">
            <el-input-number v-model="form.maxScore" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="比较类型" prop="compareType">
            <el-select v-model="form.compareType" style="width: 230px" placeholder="请选择">
              <el-option
                v-for="dict in compareTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="配置状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in commonStatusOptions"
                :key="dict.id"
                :label="dict.id"
              >{{dict.text}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="form.remark"  style="width: 580px"  type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="ScoreConfigForm">
  import { createScoreConfig, editScoreConfig, getScoreConfig } from "@/api/config/scoreConfig";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('评分配置');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const compareTypeOptions = ref([]);
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      groupName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      groupId: [
        { required: true, message: "分组不能为空", trigger: "blur" }
      ],
      sqlContent: [
        { required: true, message: "查询语句不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ],
      limitValue: [
        { required: true, message: "极限值不能为空", trigger: "blur" }
      ],
      maxScore: [
        { required: true, message: "单项满分不能为空", trigger: "blur" }
      ],
      compareType: [
        { required: true, message: "比较类型不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id,type,groupId) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getScoreConfig(id).then(response => {
        formLoading.value = false;
        form.value = response;
      });
    } else {
      title.value = "新增";
      form.value.groupId = groupId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      configId: undefined,
      status: "ENABLE"
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.configId != undefined) {
          editScoreConfig(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createScoreConfig(form.value).then(response => {
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
    proxy.getEnumDict('CompareType','FIELD',false).then(response => {
      compareTypeOptions.value = response;
    });
  })
</script>