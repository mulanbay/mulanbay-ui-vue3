<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="620px" append-to-body class="customDialogCss">
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="商品名称" prop="goodsName">
            <el-input v-model="form.goodsName" placeholder="请输入商品名称" @blur="handleAIMatch" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="套餐信息" prop="sku">
            <el-input v-model="form.sku" placeholder="请输入SKU信息" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="商品类型" prop="goodsTypeId">
            <el-tree-select
              v-model="form.goodsTypeId"
              style="width: 240px"
              :data="goodsTypeOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              placeholder="选择商品类型"
              check-strictly
              clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="购买来源" prop="sourceId">
            <el-select
              v-model="form.sourceId"
              placeholder="购买来源"
              clearable
              style="width: 240px">
              <el-option
                v-for="dict in sourceOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="消费类型" prop="consumeType">
            <el-select
              v-model="form.consumeType"
              :style="{width: '100%'}"
              placeholder="请选择">
              <el-option
                v-for="dict in consumeTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="商品标签" prop="tags">
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
            <el-button v-else class="button-new-tag" type="primary" @click="showTagInput">+ 新建</el-button>
            <el-popover :visible="tagsPopOpen" placement="top" :width="450">
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
          <el-form-item label="店铺名称" prop="shopName">
            <el-input v-model="form.shopName" placeholder="请输入店铺名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="品牌名称" prop="brand">
            <el-input v-model="form.brand" placeholder="请输入品牌名称" >
              <template #append>
                <el-popover :visible="brandPopOpen" placement="top" :width="350">
                  <el-tag
                    effect="plain"
                    :key="tag"
                    v-for="tag in goodsNameTags"
                    :disable-transitions="false"
                    @click="handleConfirmBrand(tag)">
                    {{tag}}
                  </el-tag>
                  <div style="text-align: right; margin: 0">
                    <el-button size="small" type="danger" icon="CircleClose" @click="brandPopOpen = false">关闭</el-button>
                  </div>
                  <template #reference>
                    <el-button @click="openBrandSelect" ref="brandSelectBtnRef" type="success" :disabled="goodsNameTags.length<=0">选择</el-button>
                  </template>
                </el-popover>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="商品单价" prop="price">
            <el-input-number v-model="form.price" placeholder="单位:元" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2" >
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="运费费用" prop="shipment">
            <el-input-number v-model="form.shipment" placeholder="单位:元" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="商品数量" prop="amount">
            <el-input-number v-model="form.amount" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="支付方式" prop="payment">
            <el-select v-model="form.payment" :style="{width: '100%'}" placeholder="请选择">
              <el-option
                v-for="dict in paymentOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="购买时间" prop="buyTime">
            <el-date-picker type="datetime" v-model="form.buyTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="消费时间" prop="consumeTime">
            <el-date-picker type="datetime" v-model="form.consumeTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="是否二手" prop="secondhand">
            <el-switch v-model="form.secondhand" ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出售信息" prop="showSold">
            <el-switch
              v-model="showSold">
            </el-switch>
            <span class="link-type" @click="msgAlert('提示','选填内容，预期作废时间：期望该商品丢弃或者售出的时间。售出时间：商品被废弃或者卖出的时间。为了计算商品的使用寿命')"><i class="el-icon-question" /></span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="期望作废时间" label-width="100px" prop="expectInvalidTime" v-if="true==showSold">
            <el-date-picker type="datetime" v-model="form.expectInvalidTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '210px'}" placeholder="请选择时间" clearable>
            </el-date-picker>
            <el-tag class="mx-1" size="large">快速选择</el-tag>
            <el-select v-model="invalidPeriod"
              clearable
              placeholder="请选择"
              style="width: 180px"
              @change="selectInvalidDatePeriod">
              <el-option
                v-for="dict in invalidPeriodOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id">
                <span style="float: left">{{ dict.text }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.id }}天</span>
              </el-option>
            </el-select>
            <el-button type="primary" icon="el-icon-star-on" :disabled="form.goodsName==null" @click="handlePeriodRecommend()" v-hasPermi="['consume:goodsLifetime:edit']">推荐</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="售出价格" prop="soldPrice" v-if="true==showSold">
            <el-input-number v-model="form.soldPrice" placeholder="单位:元" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="售出时间" prop="invalidTime" v-if="true==showSold">
            <el-date-picker type="datetime" v-model="form.invalidTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
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
        <el-button type="primary" @click="submitForm" :disabled="formType=='view'">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="ConsumeForm">
  import { createConsume, editConsume, getConsume, getConsumeTagsTree, aiMatch } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import { appendTagToOptions } from "@/utils/tagUtils";
  import { getNowDateTimeString, getDayByDate } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();
  const brandSelectBtnRef = ref();

  //可执行时间段
  const title = ref('消费表单');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const formType = ref('edit');

  const showSold = ref(false);

  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const consumeTypeOptions = ref([]);
  const paymentOptions = ref([]);
  const invalidPeriodOptions = ref([]);
  const invalidPeriod = ref();

  //标签编辑
  const tagsPopOpen = ref(false);
  const keywordsTags = ref([]);
  const hisKeywordsTags = ref([]);
  const inputVisible = ref(false);
  const inputValue = ref('');
  
  const goodsNameTags = ref([]);
  const brandPopOpen = ref(false);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      goodsTypeId: [
        { required: true, message: "商品类型不能为空", trigger: "blur" }
      ],
      sourceId: [
        { required: true, message: "购买来源不能为空", trigger: "blur" }
      ],
      consumeType: [
        { required: true, message: "消费类型不能为空", trigger: "blur" }
      ],
      goodsName: [
        { required: true, message: "商品名称不能为空", trigger: "blur" }
      ],
      shopName: [
        { required: true, message: "店铺名称不能为空", trigger: "blur" }
      ],
      price: [
        { required: true, message: "商品单价不能为空", trigger: "blur" }
      ],
      buyTime: [
        { required: true, message: "购买时间不能为空", trigger: "blur" }
      ],
      payment: [
        { required: true, message: "支付方式不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id, type) => {
    open.value = true;
    formType.value = type;
    resetForm();
    if (id != null) {
      try {
        formLoading.value = true;
        getConsume(id).then(response => {
          copyToForm(response);
          if (type == 'copy') {
            title.value = "复制";
            form.value.consumeId = undefined;
            form.value.buyTime = undefined;
            form.value.consumeTime = undefined;
          } else {
            title.value = "修改";
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
  
  /** 品牌选择开启 */
  function openBrandSelect(){
    brandPopOpen.value = true;
  }

  /** 品牌选择回调 */
  function handleConfirmBrand(brand){
    form.value.brand = brand;
    brandPopOpen.value = false;
  }

  /** 自动匹配 */
  function handleAIMatch() {
    const goodsName = form.value.goodsName;
    //编辑状态、没填商品名、已经选择过商品类型都不再智能匹配
    if (form.value.consumeId != null || proxy.isEmpty(goodsName) || form.value.goodsTypeId != null) {
      return;
    }
    aiMatch(goodsName).then(response => {
      form.value.traceId = response.traceId;
      if(!proxy.isEmpty(response.tags)){
        goodsNameTags.value = response.tags.split(',');
      }
      if (response != null) {
        if (response.goodsTypeId != null) {
          form.value.goodsTypeId = response.goodsTypeId;
        }
        if (response.payment != null) {
          form.value.payment = response.payment;
        }
        form.value.sourceId = response.sourceId;
        form.value.shopName = response.shopName;
        if (response.match >= 0.8) {
          //基本上是同一件商品类型
          form.value.brand = response.brand;
          form.value.price = response.price;
          form.value.amount = response.amount;
          form.value.shipment = response.shipment;
          form.value.totalPrice = response.totalPrice;
          form.value.payment = response.payment;
          form.value.secondhand = response.secondhand;
          form.value.consumeType = response.consumeType;
          form.value.sku = response.sku;
        }
      }
    });
  }

  /** 期望作废时间 */
  function selectInvalidDatePeriod(val) {
    let days = parseInt(val);
    setExpectInvalidDate(days);
  }

  /** 设置期望作废时间 */
  function setExpectInvalidDate(days) {
    let date = form.value.buyTime;
    if (date == null) {
      date = getNowDateTimeString();
    }
    let eid = getDayByDate(days, date.substr(0, 10)) + ' 00:00:00';;
    form.value.expectInvalidTime = eid;
  }

  /** 下拉框加载 */
  function loadOptions() {
    getConsumeSourceTree().then(response => {
      sourceOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
    proxy.getEnumDict('GoodsConsumeType', 'FIELD', false).then(response => {
      consumeTypeOptions.value = response;
    });
    proxy.getEnumDict('Payment', 'FIELD', false).then(response => {
      paymentOptions.value = response;
    });
    proxy.getDictItemTree('CONSUME_INVALID_DATE_PERIOD', false).then(response => {
      invalidPeriodOptions.value = response;
    });
    getConsumeTagsTree().then(response => {
      hisKeywordsTags.value = response;
    });
  }

  /** 复制 */
  function copyToForm(response) {
    form.value = response;
    //后端的一对多转换为主键值
    form.value.goodsTypeId = response.goodsType.typeId;
    form.value.goodsType = undefined;
    form.value.sourceId = response.source.sourceId;
    form.value.source = undefined;
    if (!proxy.isEmpty(response.tags)) {
      keywordsTags.value = response.tags.split(',');
    } else {
      keywordsTags.value = [];
    }
  }

  // 表单重置
  function resetForm() {
    form.value = {
      consumeId: undefined,
      goodsName: undefined,
      sku: undefined,
      amount: 1,
      shipment: 0,
      payment: 'ALIPAY',
      secondhand: false,
      stat: true,
      consumeType: 'NORMAL',
      keywords: null,
      goodsTypeId: undefined,
      sourceId: undefined,
      shopName: undefined,
      brand: undefined
    };
    //proxy.resetForm("formRef");
    loadOptions();
    keywordsTags.value = [];
    goodsNameTags.value=[];
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
        if (form.value.consumeId != undefined) {
          editConsume(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createConsume(form.value).then(response => {
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
  onMounted(() => {})
</script>