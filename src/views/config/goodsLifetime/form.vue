<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="450px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="类型名称" prop="lifetimeName">
        <el-input v-model="form.lifetimeName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="类型标签" prop="tags">
        <el-input-tag v-model="keywordsTags" @input="handleTagInput" tag-type="primary" tag-effect="light" placeholder="输入标签" style="width: 350px">
          <template #suffix>
            <el-popover :visible="tagsPopOpen" placement="top" :width="400">
              <el-tag
                effect="plain"
                type="primary"
                round
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
                <el-button @click="tagsPopOpen = true" type="success" icon="Share" size="small">选择</el-button>
              </template>
            </el-popover>
          </template>
        </el-input-tag>      
      </el-form-item>
      <el-form-item label="有效天数" prop="days">
        <el-input-number v-model="form.days" :style="{width: '60%'}" controls-position="right" :min="0" :controls="true" :precision="0" >
          <template #suffix>
             <span>天</span>
           </template>
        </el-input-number> 
        <el-select
          v-model="fc"
          placeholder="快速选择"
          style="width: 130px"
          @change="selectDays">
          <el-option
            v-for="dict in daysOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注信息">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
  import { getGoodsLifetime, createGoodsLifetime, editGoodsLifetime } from "@/api/config/goodsLifetime";
  import { appendTagToOptions,checkTag } from "@/utils/tagUtils";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('商品类型');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const daysOptions = ref([
    { id: 30, text: '一个月' },
    { id: 90, text: '三个月' },
    { id: 180, text: '半年' },
    { id: 365, text: '一年' },
    { id: 730, text: '两年' },
    { id: 1095, text: '三年' },
    { id: 1825, text: '五年' },
    { id: 3650, text: '十年' }
  ]);
  const fc = ref(90);

  //标签编辑
  const tagsPopOpen = ref(false);
  const keywordsTags = ref([]);
  const hisKeywordsTags = ref([]);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      lifetimeName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      days: [
        { required: true, message: "有效天数不能为空", trigger: "blur" }
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
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getGoodsLifetime(id).then(response => {
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
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 时长快速选择 */
  function selectDays() {
    form.value.days = fc.value;
  }

  /** 标签处理 start */
  // 选择标签
  function handleTagAppend(tag) {
    appendTagToOptions(tag, keywordsTags.value);
  }
  //输入标签
  function handleTagInput(tag) {
    checkTag(tag, keywordsTags.value);
  }
  /** 标签处理 end */

  // 表单重置
  function resetForm() {
    form.value = {
      lifetimeId: undefined,
      lifetimeName: undefined,
      days: 30,
      tags: undefined,
      remark: undefined
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
        if (form.value.lifetimeId != undefined) {
          editGoodsLifetime(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createGoodsLifetime(form.value).then(response => {
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
    proxy.getDictItemTree('GOODS_LIFETIME_TAGS', false).then(response => {
      hisKeywordsTags.value = response;
    });
  })
</script>