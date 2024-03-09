<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="450px" append-to-body class="customDialogCss">
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-form-item label="用户等级" prop="level">
        <el-input-number v-model="form.level" style="width: 240px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
      </el-form-item>
      <el-form-item label="等级名称" prop="levelName">
        <el-input v-model="form.levelName" style="width: 240px;" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="最低积分" prop="points">
        <el-input-number v-model="form.points" style="width: 240px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
      </el-form-item>
      <el-form-item label="积分连续天数" prop="pointsDays">
        <el-input-number v-model="form.pointsDays" style="width: 240px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
      </el-form-item>
      <el-form-item label="最低评分" prop="score">
        <el-input-number v-model="form.score" style="width: 240px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
      </el-form-item>
      <el-form-item label="评分连续天数" prop="scoreDays">
        <el-input-number v-model="form.scoreDays" style="width: 240px;" controls-position="right" :min="0" :controls="true" :precision="0"/>
      </el-form-item>
      <el-form-item label="对应角色" prop="roleId">
        <el-select
          v-model="form.roleId"
          clearable
          style="width: 240px;"
          placeholder="请选择">
          <el-option
            v-for="dict in roleOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="等级状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.id"
          >{{dict.text}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注信息">
        <el-input v-model="form.remark" style="width: 240px;" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="LevelConfigForm">
  import { createLevelConfig, editLevelConfig, getLevelConfig } from "@/api/config/levelConfig";
  import { getRoleTree } from "@/api/auth/role";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('等级配置');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const roleOptions = ref([]);
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      levelName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      level: [
        { required: true, message: "等级不能为空", trigger: "blur" }
      ],
      points: [
        { required: true, message: "最低积分数不能为空", trigger: "blur" }
      ],
      pointsDays: [
        { required: true, message: "最低积分数的至少连续天数不能为空", trigger: "blur" }
      ],
      score: [
        { required: true, message: "最低评分数不能为空", trigger: "blur" }
      ],
      scoreDays: [
        { required: true, message: "最低评分数的至少连续天数不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id,type) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getLevelConfig(id).then(response => {
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
      id: undefined,
      levelName: undefined,
      status: "ENABLE"
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.id != undefined) {
          editLevelConfig(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createLevelConfig(form.value).then(response => {
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
    getRoleTree().then(response => {
      roleOptions.value = response;
    });
  })
</script>