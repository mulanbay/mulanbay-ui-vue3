<template>

  <!-- 表单编辑对话框 -->
  <el-popover :visible="tagsPopOpen" placement="top" :width="350" :virtual-ref="btnRef">
    <el-tag
      virtual-triggering
      effect="plain"
      :key="tag"
      v-for="tag in hisKeywordsTags"
      :disable-transitions="false"
      @click="handleTagAppend(tag)">
      {{tag}}
    </el-tag>
    <el-divider content-position="center">
      已选择
    </el-divider>
    <el-tag
      :key="tag"
      v-for="tag in keywordsTags"
      closable
      type="success"
      :disable-transitions="false"
      @close="handleTagClose(tag)">
      {{tag}}
    </el-tag>
    <div style="text-align: right; margin: 0">
      <el-button size="small" type="success" icon="SuccessFilled" @click="submitForm">确定</el-button>
      <el-button size="small" type="danger" icon="CircleClose" @click="tagsPopOpen = false">关闭</el-button>
    </div>
  </el-popover>

</template>

<script setup name="TagsSelect">
  import { appendTagToOptions } from "@/utils/tagUtils";

  const { proxy } = getCurrentInstance();

  const title = ref('标签选择');
  const btnRef = ref();
  //多选
  const multiSelect = ref(false);

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
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['confirmSelect']);

  /** 打开弹窗 */
  const openForm = async (tags,multi,ref) => {
    if(proxy.isEmpty(tags)){
      return;
    }
    tagsPopOpen.value = true;
    resetForm();
    //tags 为逗号分隔的字符串
    hisKeywordsTags.value = tags.split(',');
    multiSelect.value = multi;
    btnRef.value = ref;
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 标签处理 start */
  function handleTagClose(tag) {
    keywordsTags.value.splice(keywordsTags.value.indexOf(tag), 1);
  }

  function handleTagAppend(tag) {
    if(multiSelect.value==false){
      //直接返回
      tagsPopOpen.value = false;
      // 发送选择的事件
      emit('confirmSelect', tag);
    }
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

  // 表单重置
  function resetForm() {
    hisKeywordsTags.value = [];
    keywordsTags.value = [];
  }

  /** 提交按钮 */
  function submitForm() {
    if (keywordsTags.value.length > 0) {
      let v = keywordsTags.value.join(',');
      // 发送选择的事件
      emit('confirmSelect', v);
    } else {
      proxy.$modal.msgError("请选择标签");
    }
  }

  /** 初始化 **/
  onMounted(() => {})
</script>