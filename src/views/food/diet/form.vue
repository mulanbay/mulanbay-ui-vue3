<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body >
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="90px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="饮食餐次" prop="dietType">
            <el-select
              v-model="form.dietType"
              placeholder="餐次"
              clearable
              collapse-tags
              style="width: 240px">
              <el-option
                v-for="dict in dietTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="食物来源" prop="dietSource">
            <el-select
              v-model="form.dietSource"
              placeholder="来源"
              clearable
              collapse-tags
              style="width: 240px">
              <el-option
                v-for="dict in dietSourceOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="食物明细" prop="foods">
            <el-tag
              :key="tag"
              v-for="tag in foodsTags"
              closable
              size="large"
              :disable-transitions="false"
              @close="handleFoodsTagClose(tag)">
              {{tag}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputFoodsVisible"
              v-model="inputFoodsValue"
              ref="saveFoodsTagInput"
              style="width: 120px"
              @keyup.enter.native="handleFoodsTagInputConfirm"
              @blur="handleFoodsTagInputConfirm">
            </el-input>
            <el-button v-else type="primary" class="button-new-tag" @click="showFoodsTagInput">+ 新建</el-button>
            <el-popover :visible="foodsTagsPopOpen" placement="top" :width="400">
              <el-tag
                effect="plain"
                :key="tag"
                v-for="tag in hisFoodsTags"
                :disable-transitions="false"
                @click="handleFoodsTagAppend(tag.text)">
                {{tag.text}}
              </el-tag>
              <div style="text-align: right; margin: 0">
                <el-button size="small" type="danger" icon="CircleClose" @click="foodsTagsPopOpen = false">关闭</el-button>
              </div>
              <template #reference>
                <el-button @click="foodsTagsPopOpen = true" type="success" icon="Share">选择</el-button>
              </template>
            </el-popover>
            <el-tooltip content="食物的原料，比如：猪肉、胡萝卜." effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="食物类型" prop="foodType">
            <el-select
              v-model="form.foodType"
              placeholder="食物类型"
              clearable
              collapse-tags
              style="width: 240px">
              <el-option
                v-for="dict in foodTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="就餐时间" prop="occurTime">
            <el-date-picker type="datetime" v-model="form.occurTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '240px'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="食物标签" prop="tags">
            <el-tag
              :key="tag"
              v-for="tag in tagsTags"
              closable
              size="large"
              :disable-transitions="false"
              @close="handleTagsTagClose(tag)">
              {{tag}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputTagsVisible"
              v-model="inputTagsValue"
              ref="saveTagsTagInput"
              style="width: 120px"
              @keyup.enter.native="handleTagsTagInputConfirm"
              @blur="handleTagsTagInputConfirm">
            </el-input>
            <el-button v-else type="primary" class="button-new-tag" @click="showTagsTagInput">+ 新建</el-button>
            <el-popover :visible="tagsTagsPopOpen" placement="bottom" :width="400">
              <el-tag
                effect="plain"
                :key="tag"
                v-for="tag in hisTagsTags"
                :disable-transitions="false"
                @click="handleTagsTagAppend(tag.text)">
                {{tag.text}}
              </el-tag>
              <div style="text-align: right; margin: 0">
                <el-button size="small" type="danger" icon="CircleClose" @click="tagsTagsPopOpen = false">关闭</el-button>
              </div>
              <template #reference>
                <el-button @click="tagsTagsPopOpen = true" type="success" icon="Share">选择</el-button>
              </template>
            </el-popover>
            <el-tooltip content="菜名/节日名称." effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="店铺/品牌" prop="shop">
            <el-tag
              :key="tag"
              v-for="tag in shopTags"
              closable
              size="large"
              :disable-transitions="false"
              @close="handleShopTagClose(tag)">
              {{tag}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputShopVisible"
              v-model="inputShopValue"
              ref="saveShopTagInput"
              style="width: 120px"
              @keyup.enter.native="handleShopTagInputConfirm"
              @blur="handleShopTagInputConfirm">
            </el-input>
            <el-button v-else type="primary" class="button-new-tag" @click="showShopTagInput">+ 新建</el-button>
            <el-popover :visible="shopTagsPopOpen" placement="top" :width="400">
              <el-tag
                effect="plain"
                :key="tag"
                v-for="tag in hisShopTags"
                :disable-transitions="false"
                @click="handleShopTagAppend(tag.text)">
                {{tag.text}}
              </el-tag>
              <div style="text-align: right; margin: 0">
                <el-button size="small" type="danger" icon="CircleClose" @click="shopTagsPopOpen = false">关闭</el-button>
              </div>
              <template #reference>
                <el-button @click="shopTagsPopOpen = true" type="success" icon="Share">选择</el-button>
              </template>
            </el-popover>
            <el-tooltip content="店铺/品牌." effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="价格/成本" prop="price">
            <el-input-number v-model="form.price" style="width: 240px" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" />
            元
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="食物评分" prop="score">
            <el-rate
              v-model="form.score"
              show-score
              text-color="#ff9900"
              score-template="{value}">
            </el-rate>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="就餐地点" prop="location">
            <el-input v-model="form.location" style="width: 600px" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="form.remark" style="width: 600px" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="DietForm">
  import { createDiet, editDiet, getDiet, getDietCateTree,getLatestDiet } from "@/api/food/diet";
  import { appendTagToOptions } from "@/utils/tagUtils";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('食物');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const foodTypeOptions = ref([]);
  const dietTypeOptions = ref([]);
  const dietSourceOptions = ref([]);

  //食物标签编辑
  const foodsTagsPopOpen = ref(false);
  const foodsTags = ref([]);
  const hisFoodsTags = ref([]);
  const inputFoodsVisible = ref(false);
  const inputFoodsValue = ref('');

  //店铺标签编辑
  const shopTagsPopOpen = ref(false);
  const shopTags = ref([]);
  const hisShopTags = ref([]);
  const inputShopVisible = ref(false);
  const inputShopValue = ref('');

  //标签的标签编辑
  const tagsTagsPopOpen = ref(false);
  const tagsTags = ref([]);
  const hisTagsTags = ref([]);
  const inputTagsVisible = ref(false);
  const inputTagsValue = ref('');

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      dietType: [
        { required: true, message: "餐次不能为空", trigger: "blur" }
      ],
      dietSource: [
        { required: true, message: "来源不能为空", trigger: "blur" }
      ],
      foodType: [
        { required: true, message: "食物类型不能为空", trigger: "blur" }
      ],
      occurTime: [
        { required: true, message: "发生时间不能为空", trigger: "blur" }
      ],
      price: [
        { required: true, message: "价格不能为空", trigger: "blur" }
      ],
      score: [
        { required: true, message: "评分不能为空", trigger: "blur" }
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
    loadCateOption();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getDiet(id).then(response => {
          form.value = response;
          if (!proxy.isEmpty(response.tags)) {
            tagsTags.value = response.tags.split(',');
          } else {
            tagsTags.value = [];
          }
          if (!proxy.isEmpty(response.foods)) {
            foodsTags.value = response.foods.split(',');
          } else {
            foodsTags.value = [];
          }
          if (!proxy.isEmpty(response.shop)) {
            shopTags.value = response.shop.split(',');
          } else {
            shopTags.value = [];
          }
          if(type=='copy'){
            title.value = "复制";
            form.value.dietId = null;
            form.value.occurTime = null;
          }
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
      getLatestDiet().then(response => {
        if(response!=null){
          form.value.location = response.location;
        }
    });
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 食物标签处理 start */
  function handleFoodsTagClose(tag) {
    foodsTags.value.splice(foodsTags.value.indexOf(tag), 1);
  }

  function handleFoodsTagAppend(tag) {
    appendTagToOptions(tag, foodsTags.value);
  }

  function showFoodsTagInput() {
    inputFoodsVisible.value = true;
    proxy.$nextTick(_ => {
      proxy.$refs.saveFoodsTagInput.$refs.input.focus();
    });
  }

  function handleFoodsTagInputConfirm() {
    if (inputFoodsValue.value) {
      appendTagToOptions(inputFoodsValue.value, foodsTags.value);
    }
    inputFoodsVisible.value = false;
    inputFoodsValue.value = '';
  }
  /** 食物标签处理 end */

  /** 标签的标签处理 start */
  function handleTagsTagClose(tag) {
    tagsTags.value.splice(tagsTags.value.indexOf(tag), 1);
  }

  function handleTagsTagAppend(tag) {
    appendTagToOptions(tag, tagsTags.value);
  }

  function showTagsTagInput() {
    inputTagsVisible.value = true;
    proxy.$nextTick(_ => {
      proxy.$refs.saveTagsTagInput.$refs.input.focus();
    });
  }

  function handleTagsTagInputConfirm() {
    if (inputTagsValue.value) {
      appendTagToOptions(inputTagsValue.value, tagsTags.value);
    }
    inputTagsVisible.value = false;
    inputTagsValue.value = '';
  }
  /** 标签的标签处理 end */

  /** 店铺标签处理 start */
  function handleShopTagClose(tag) {
    shopTags.value.splice(shopTags.value.indexOf(tag), 1);
  }

  function handleShopTagAppend(tag) {
    appendTagToOptions(tag, shopTags.value);
  }

  function showShopTagInput() {
    inputShopVisible.value = true;
    proxy.$nextTick(_ => {
      proxy.$refs.saveShopTagInput.$refs.input.focus();
    });
  }

  function handleShopTagInputConfirm() {
    if (inputShopValue.value) {
      appendTagToOptions(inputShopValue.value, shopTags.value);
    }
    inputShopVisible.value = false;
    inputShopValue.value = '';
  }
  /** 店铺标签处理 end */

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getEnumDict('FoodType', 'FIELD', false).then(response => {
      foodTypeOptions.value = response;
    });
    proxy.getEnumDict('DietType', 'FIELD', false).then(response => {
      dietTypeOptions.value = response;
    });
    proxy.getEnumDict('DietSource', 'FIELD', false).then(response => {
      dietSourceOptions.value = response;
    });
  }

  /** 加载历史标签 */
  function loadCateOption() {
    getDietCateTree('foods').then(response => {
        hisFoodsTags.value = response;
    });
    getDietCateTree('tags').then(response => {
        hisTagsTags.value = response;
    });
    getDietCateTree('shop').then(response => {
        hisShopTags.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      dietId: undefined,
      dietType: 'BREAKFAST',
      dietSource: 'SELF_MADE',
      price: 0,
      score: 3,
      location: undefined
    };
    shopTags.value = [];
    foodsTags.value = [];
    tagsTags.value = [];
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (foodsTags.value.length > 0) {
          form.value.foods = foodsTags.value.join(',');
        } else {
          proxy.$modal.msgError("食物不能为空");
          return;
        }
        if (tagsTags.value.length > 0) {
          form.value.tags = tagsTags.value.join(',');
        }
        if (shopTags.value.length > 0) {
          form.value.shop = shopTags.value.join(',');
        }
        if (form.value.dietId != undefined) {
          editDiet(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createDiet(form.value).then(response => {
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
    loadOptions();
  })
</script>