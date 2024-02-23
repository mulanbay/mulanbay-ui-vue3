<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="450px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="上级分类" prop="pid">
        <el-tree-select
          v-model="form.pid"
          style="width: 400px"
          :data="parentGoodsTypeOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择上级菜单"
          check-strictly />
      </el-form-item>
      <el-form-item label="类型名称" prop="typeName">
        <el-input v-model="form.typeName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="行为名称" prop="behaviorName">
        <el-input v-model="form.behaviorName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="类型标签" prop="tags">
        <el-tag
          :key="tag"
          v-for="tag in keywordsTags"
          closable
          size="large"
          :disable-transitions="false"
          @close="handleTagClose(tag)">
          {{tag}}
        </el-tag>
        <el-input
          class="input-new-tag"
          v-if="inputVisible"
          v-model="inputValue"
          ref="saveTagInput"
          style="width: 120px"
          @keyup.enter.native="handleTagInputConfirm"
          @blur="handleTagInputConfirm">
        </el-input>
        <el-button v-else type="primary" class="button-new-tag" @click="showTagInput">+ 新建</el-button>
        <el-popover :visible="tagsPopOpen" placement="top" :width="400">
          <el-tag
            effect="plain"
            :key="tag"
            v-for="tag in hisKeywordsTags"
            :disable-transitions="false"
            @click="handleTagAppend(tag.text)">
            {{tag.text}}
          </el-tag>
          <div style="text-align: right; margin: 0">
            <el-button size="small" type="success" icon="CircleCheckFilled" @click="tagsPopOpen = false">确定</el-button>
          </div>
          <template #reference>
            <el-button @click="tagsPopOpen = true" type="success" icon="Share">选择</el-button>
          </template>
        </el-popover>
      </el-form-item>
      <el-form-item label="加入统计" prop="stat">
        <el-switch
          v-model="form.stat">
        </el-switch>
      </el-form-item>
      <el-form-item label="显示顺序" prop="orderIndex">
        <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0" />
      </el-form-item>
      <el-form-item label="类型状态" prop="status">
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

<script setup name="GoodsTypeForm">
  import { createGoodsType, editGoodsType, getGoodsType, getGoodsTypeTree } from "@/api/consume/goodsType";
  import { appendTagToOptions } from "@/utils/tagUtils";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('商品类型');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);


  const parentGoodsTypeOptions = ref([]);
  //标签编辑
  const tagsPopOpen = ref(false);
  const keywordsTags = ref([]);
  const hisKeywordsTags = ref([]);
  const inputVisible = ref(false);
  const inputValue = ref('');

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      pid: [
        { required: true, message: "上级分类不能为空", trigger: "blur" }
      ],
      typeName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      parentId: [
        { required: true, message: "上级分类不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "排序号不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ],
      stat: [
        { required: true, message: "加入统计不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id, type, pid) => {
    open.value = true;
    resetForm();
    getParentTreeSelect(id);
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getGoodsType(id).then(response => {
          form.value = response;
          if (!proxy.isEmpty(response.tags)) {
            keywordsTags.value = response.tags.split(',');
          }
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
      form.value.pid = pid;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 标签处理 start */
  function handleTagClose(tag) {
    keywordsTags.value.splice(keywordsTags.value.indexOf(tag), 1);
  }

  function handleTagAppend(tag) {
    appendTagToOptions(tag, keywordsTags.value);
  }

  function showTagInput() {
    inputVisible.value = true;
    proxy.$nextTick(_ => {
      proxy.$refs.saveTagInput.$refs.input.focus();
    });
  }

  function handleTagInputConfirm() {
    if (inputValue.value) {
      appendTagToOptions(inputValue.value, keywordsTags.value);
    }
    inputVisible.value = false;
    inputValue.value = '';
  }
  /** 标签处理 end */

  /** 查询上级分类下拉树结构 */
  function getParentTreeSelect(selfId) {
    getGoodsTypeTree(selfId).then(response => {
      parentGoodsTypeOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      typeId: undefined,
      typeName: undefined,
      orderIndex: 0,
      status: "ENABLE",
      stat: true
    };
    proxy.resetForm("formRef");
    keywordsTags.value = [];
    //hisKeywordsTags.value = [];
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (keywordsTags.value.length > 0) {
          form.value.tags = keywordsTags.value.join(',');
        } else {
          form.value.tags = undefined;
        }
        if (form.value.typeId != undefined) {
          editGoodsType(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success', form.value.pid);
          });
        } else {
          createGoodsType(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success', form.value.pid);
          });
        }
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {
    proxy.getDictItemTree('GOODS_TYPE_TAGS', false).then(response => {
      hisKeywordsTags.value = response;
    });
  })
</script>