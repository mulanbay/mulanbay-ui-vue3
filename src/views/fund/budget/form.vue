<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="640px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="预算名称" prop="budgetName">
            <el-input v-model="form.budgetName" placeholder="请输入预算名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="预算金额" prop="amount">
            <el-input-number
              v-model="form.amount"
              placeholder="单位:元"
              style="width: 100%"
              controls-position="right"
              :min="0" :controls="false" :precision="2" >
              <template #suffix>
                <span>元</span>
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预算类型" prop="type">
            <el-select
              v-model="form.type"
              placeholder="类型"
              style="width: 100%">
              <el-option
                v-for="dict in typeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="预算周期" prop="period">
            <el-select
              v-model="form.period"
              placeholder="周期"
              style="width: 100%">
              <el-option
                v-for="dict in periodOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否提醒" prop="remind">
            <el-switch
              v-model="form.remind">
            </el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="绑定消费" prop="goodsTypeId">
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
          <el-form-item label="包含子类" prop="icg">
            <el-switch
              v-model="form.icg">
            </el-switch>
            <el-tooltip content="如果包含子类,预算实际消费统计时会统计包含该商品类型旗下所有子商品的消费金额." effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="商品标签" prop="tags">
            <el-input v-model="form.tags" clearable>
              <template #append>
                <el-popover :visible="tagsPopOpen" placement="top" :width="350">
                  <el-text class="mx-1" type="danger">商品名称或商品标签中包含的关键字</el-text>
                  <el-divider content-position="center">
                    <span class="table-title">
                      <svg-icon icon-class="budget" />
                      关键字
                    </span>
                  </el-divider>
                  <el-tag
                    effect="plain"
                    :key="tag"
                    v-for="tag in goodsNameTags"
                    :disable-transitions="false"
                    @click="handleConfirmTags(tag.text)">
                    {{tag.text}}
                  </el-tag>
                  <br><br>
                  <div style="text-align: right; margin: 0">
                    <el-button size="small" type="primary" icon="refresh" @click="getNextTagsOption()">换一批</el-button>
                    <el-button size="small" type="danger" icon="CircleClose" @click="tagsPopOpen = false">关闭</el-button>
                  </div>
                  <template #reference>
                    <el-button @click="openTagsSelect" icon="Share" type="success">选择</el-button>
                  </template>
                </el-popover>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="预期时间" prop="expectPaidTime">
            <el-date-picker type="datetime" v-model="form.expectPaidTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '200px'}" placeholder="请选择时间" clearable>
            </el-date-picker>
            <el-tooltip content="<1>对于单次类型，必须设置预期实现时间，则预算金额会加入到该日期所在月的月预算中。<br><2>对于每年类型，如果设置预期实现时间，则预算金额会加入到该日期所在月的每年的该月预算中." raw-content effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预算状态" prop="period">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.id"
                :value="dict.id">{{dict.text}}
              </el-radio>
            </el-radio-group>
            <el-tooltip content="<1>如果该预算已经被执行过，那么请直接设置预算金额为0，否则设置为无效后在年度详情中会无法查询。<br><2>或者在第二年时再设置为无效。" raw-content effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
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

<script setup name="BudgetForm">
  import { createBudget, editBudget, getBudget } from "@/api/fund/budget";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import { getConsumeTagsTree } from "@/api/consume/consume";

  const { proxy } = getCurrentInstance();

  const title = ref('预算');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const statusOptions = ref(proxy.commonStatusOptions);
  const typeOptions = ref([]);
  const periodOptions = ref([]);
  const goodsTypeOptions = ref([]);

  const tagsPopOpen = ref(false);
  const goodsNameTags = ref([]);
  const tagsPage = ref(1);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      budgetName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      amount: [
        { required: true, message: "金额不能为空", trigger: "blur" }
      ],
      type: [
        { required: true, message: "类型不能为空", trigger: "blur" }
      ],
      period: [
        { required: true, message: "周期不能为空", trigger: "blur" }
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
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getBudget(id).then(response => {
          form.value = response;
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

  // 表单重置
  function resetForm() {
    form.value = {
      budgetId: undefined,
      budgetName: undefined,
      type: 'INSURANCE',
      period: "MONTHLY",
      status: 'ENABLE',
      remind: false,
      icg: true,
      tags: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.budgetId != undefined) {
          editBudget(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createBudget(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        }
      }
    });
  }
  
  
  /** 标签选择开启 */
  function openTagsSelect(){
    tagsPopOpen.value = true;
    tagsPage.value = 0;
    getNextTagsOption();
  }
  
  /** 标签下一页 */
  function getNextTagsOption(){
    tagsPopOpen.value = true;
    tagsPage.value = tagsPage.value+1;
    let para = {
      page: tagsPage.value,
      pageSize:10
    }
    getConsumeTagsTree(para).then(response => {
      if(response==null||response.length==0){
        tagsPage.value = 0;
        proxy.$modal.msgError('没有更多数据');
        return;
      }
      goodsNameTags.value = response;
    });
  }
  
  /** 标签选择回调 */
  function handleConfirmTags(tags){
    form.value.tags = tags;
    tagsPopOpen.value = false;
  }
  

  /** 初始化 **/
  onMounted(() => {
    proxy.getEnumDict('BudgetType', 'FIELD', false).then(response => {
      typeOptions.value = response;
    });
    //预算周期采用数据字典配置，有些周期类型不好实现
    proxy.getDictItemTree('BUDGET_PERIOD_TYPE', false).then(response => {
      periodOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
  })
</script>