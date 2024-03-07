<template>

<!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="itemName">
          <el-input v-model="form.itemName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入代码" />
        </el-form-item>
        <el-form-item label="类型" prop="valueClass">
          <el-select v-model="form.valueClass" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="dict in valueClassOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="顺序" prop="orderIndex">
          <el-input-number v-model="form.orderIndex" style="width: 100%" controls-position="right" :min="0" :controls="true" :precision="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in commonStatusOptions"
              :key="dict.id"
              :label="dict.id">{{dict.text}}</el-radio>
          </el-radio-group>
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

<script setup name="DictItemForm">
  import { getDictItem, createDictItem, editDictItem } from "@/api/config/dictItem";
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('用户');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const valueClassOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      itemName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      code: [
        { required: true, message: "代码不能为空", trigger: "blur" }
      ],
      valueClass: [
        { required: true, message: "值类型不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "排序号不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ]
    }
  });

  const {form,rules} = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (itemId,type,groupId) => {
    open.value = true;
    reset();
    if (itemId != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getDictItem(itemId).then(response => {
          form.value = response;
          form.value.groupId = response.group.groupId;
          form.value.group = null;
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
      form.value.groupId = groupId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({openForm});

  // 表单重置
  function reset() {
    form.value = {
      itemId: undefined,
      itemName: undefined,
      code: undefined,
      valueClass: 'STRING',
      orderIndex: 0,
      status: "ENABLE"
    };
    proxy.resetForm("formRef");
  }
  
  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.itemId != undefined) {
          editDictItem(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createDictItem(form.value).then(response => {
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
    proxy.getEnumDict('StatValueClass', 'FIELD', false).then(response => {
      valueClassOptions.value = response;
    });
  })
</script>