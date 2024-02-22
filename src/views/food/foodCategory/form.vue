<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="620px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="关键字" prop="tags">
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
                <el-button size="small" type="danger" icon="CircleClose" @click="tagsPopOpen = false">关闭</el-button>
              </div>
              <template #reference>
                <el-button @click="tagsPopOpen = true" type="success" icon="Share">选择</el-button>
              </template>
            </el-popover>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="类别名称" prop="className">
            <el-input v-model="form.className" placeholder="请输入类别名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="大类" prop="type">
            <el-select v-model="form.type" :style="{width: '100%'}" placeholder="请选择">
              <el-option
                v-for="dict in typeOptions"
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
          <el-form-item label="显示顺序" prop="orderIndex">
            <el-input-number v-model="form.orderIndex" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" :style="{width: '100%'}" prop="status">
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

<script setup name="FoodCategoryForm">
  import { createFoodCategory, editFoodCategory, getFoodCategory } from "@/api/food/foodCategory";
  import {appendTagToOptions} from "@/utils/tagUtils";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('食物类别');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const typeOptions = ref([]);
  
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
      className: [
        { required: true, message: "类别名称不能为空", trigger: "blur" }
      ],
      type: [
        { required: true, message: "大类不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "排序号不能为空", trigger: "blur" }
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
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getFoodCategory(id).then(response => {
          form.value = response;
          if(!proxy.isEmpty(response.tags)){
            keywordsTags.value = response.tags.split(',');
          }else{
            keywordsTags.value = [];
          }
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
  
  // 表单重置
  function resetForm() {
    form.value = {
      cateId: undefined,
      orderIndex: 0,
      status: "ENABLE"
    };
    keywordsTags.value = [];
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if(keywordsTags.value.length>0){
          form.value.tags = keywordsTags.value.join(',');
        }else{
          form.value.tags = undefined;
        }
        if (form.value.cateId != undefined) {
          editFoodCategory(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createFoodCategory(form.value).then(response => {
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
    proxy.getDictItemTree('DIET_CATEGORY_TYPE', false).then(response => {
      typeOptions.value = response;
    });
  })
</script>