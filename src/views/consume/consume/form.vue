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
                    round
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
              <template #suffix>
                <span>元</span>
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="运费费用" prop="shipment">
            <el-input-number v-model="form.shipment" placeholder="单位:元" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2" >
              <template #suffix>
                <span>元</span>
              </template>
            </el-input-number>
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
			  <el-col :span="24">
			    <el-form-item label="商品标签" prop="tags">
			      <el-input-tag v-model="keywordsTags" @input="handleTagInput" tag-type="primary" tag-effect="light" placeholder="输入标签" >
			        <template #suffix>
			          <el-popover :visible="tagsPopOpen" placement="top" :width="450">
									<el-tabs v-model="activeTagName" v-loading="tagsLoading">
										<el-tab-pane label="商品标签" name="consumeTag">
										  <el-tag
										    effect="plain"
										    round
										    :key="tag"
										    v-for="tag in hisKeywordsTags"
										    :disable-transitions="false"
										    @click="handleTagAppend(tag.text)">
										    {{tag.text}}
										  </el-tag>
										  <br><br>
										</el-tab-pane>
										<el-tab-pane label="人生经历标签" name="experienceTag">
										  <el-tag
										    effect="plain"
										    round
										    :key="tag"
										    v-for="tag in expTags"
										    :disable-transitions="false"
										    @click="handleTagAppend(tag.text)">
										    {{tag.text}}
										  </el-tag>
										  <template #reference>
										    <el-button @click="openTagsSelect" type="success" icon="Share" size="small">选择</el-button>
										  </template>
										</el-tab-pane>
									</el-tabs>	
									<div style="text-align: right; margin: 0">
										<el-tag type="success">{{tagQueryTime}}</el-tag>
									  <el-button size="small" type="primary" icon="DArrowLeft" @click="loadTagOptions(-1)">往前</el-button>
										<el-button size="small" type="primary" icon="DArrowRight" @click="loadTagOptions(1)">往后</el-button>
										<el-button size="small" type="danger" icon="CircleClose" @click="tagsPopOpen = false">关闭</el-button>
									</div>
			            <template #reference>
			              <el-button @click="openTagsSelect" type="success" icon="Share" size="small">选择</el-button>
			            </template>
			          </el-popover>
			        </template>
			        <template #tag="{ value }">
			          <div class="flex items-center">
			            <el-icon class="mr-1">
			              <ElementPlus />
			            </el-icon>
			            <span>{{ value }}</span>
			          </div>
			        </template>
			      </el-input-tag>    
			    </el-form-item>
			  </el-col>
			</el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="是否二手" prop="secondhand">
			<el-radio-group v-model="form.secondhand">
			  <el-radio :value="false" size="large">全新商品</el-radio>
			  <el-radio :value="true" size="large">二手商品</el-radio>
			</el-radio-group>  
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
              :style="{width: '190px'}" placeholder="请选择时间" clearable>
            </el-date-picker>
            <el-button type="success" icon="DArrowRight">快速选择</el-button>
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
            <el-input-number v-model="form.soldPrice" placeholder="" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2" >
              <template #suffix>
                 <span>元</span>
               </template>
            </el-input-number> 
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
	import { getExperienceTree } from "@/api/life/experience";
  import { appendTagToOptions,checkTag } from "@/utils/tagUtils";
  import { getNowDateTimeString, getDayByDate,getDay } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();
  const brandSelectBtnRef = ref();

  //可执行时间段
  const title = ref('消费表单');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const formType = ref('edit');

  const showSold = ref(false);
  const activeTagName = ref('consumeTag');

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
  const tagsPage = ref(1);
	//人生经历
  const expTags = ref([]);
	//标签字段
	const tagsEndDate = ref(null);
  const tagsLoading = ref(false);
	const tagQueryTime = ref(null);
	
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
  const openForm = async (id, type,consumeTag) => {
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
			if(consumeTag!=null){
				keywordsTags.value = [consumeTag];
			}
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

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
  
  /** 标签选择开启 */
  function openTagsSelect(){
    tagsPopOpen.value = true;
    tagsPage.value = 0;
		tagsEndDate.value = null;
    loadTagOptions(-1);
  }
	
	/** 标签加载 */
	function loadTagOptions(off){
		let offDays = off * 90;
		if(tagsEndDate.value==null){
			tagsEndDate.value = form.value.buyTime;
		}
		if(tagsEndDate.value==null){
			tagsEndDate.value = getDay(0);
		}else{
			tagsEndDate.value = tagsEndDate.value.substring(0,10);
		}
		let para = {
			startDate:getDayByDate(offDays,tagsEndDate.value),
			endDate: tagsEndDate.value,
			page: 0,
			pageSize:20
		}
		tagQueryTime.value = para.startDate + '~' + para.endDate;
		tagsLoading.value = true;
		//加载消费标签
		getConsumeTagsTree(para).then(response => {
		  hisKeywordsTags.value = response;
			tagsLoading.value = false;
		});
		//加载人生经历标签
		getExperienceTree(para).then(response => {
			expTags.value = response;
			tagsLoading.value = false;
		});
		tagsEndDate.value = para.startDate;
	}
  
  
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
    //编辑状态、没填商品名都不再智能匹配
    if (form.value.consumeId != null || proxy.isEmpty(goodsName)|| form.value.goodsTypeId != null) {
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