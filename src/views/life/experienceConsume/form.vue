<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="560px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="消费记录" prop="scId">
           <el-input v-model="form.scId" placeholder="" style="width: 250px;" disabled/>
           <el-button type="primary" icon="Share" @click="handleSelectGoods()" >绑定</el-button>
           <el-button type="danger" icon="Remove" @click="handleUnSelectGoods()" :disabled="form.scId==null">解绑</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="消费名称" prop="consumeName">
            <el-input v-model="form.consumeName" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="商品类型" prop="goodsTypeId">
            <el-tree-select
              v-model="form.goodsTypeId"
              style="width: 500px"
              :data="goodsTypeOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              placeholder="选择商品类型"
              check-strictly
              clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="消费金额" prop="cost">
           <el-input-number v-model="form.cost" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="加入统计" prop="stat">
           <el-switch v-model="form.stat" ></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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

  <!-- 商品选择 -->
  <GoodsSelect ref="goodsSelectRef" @confirmSelect="handleConfirmGoods" />

</template>

<script setup name="ExperienceConsumeForm">
  import { createExperienceConsume, editExperienceConsume, getExperienceConsume } from "@/api/life/experienceConsume";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import GoodsSelect from '../../consume/consume/goodsSelect.vue'
  
  
  const { proxy } = getCurrentInstance();
  const goodsSelectRef = ref();

  //可执行时间段
  const title = ref('消费详情');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const goodsTypeOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      consumeName: [
        { required: true, message: "消费名称不能为空", trigger: "blur" }
      ],
      goodsTypeId: [
        { required: true, message: "消费类型不能为空", trigger: "blur" }
      ],
      cost: [
        { required: true, message: "消费金额不能为空", trigger: "blur" }
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
  const openForm = async (id,Type,detailId) => {
    open.value = true;
    resetForm();
    initOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getExperienceConsume(id).then(response => {
        formLoading.value = false;
        form.value = response;
        form.value.detailId = response.detail.detailId;
        form.value.detail = null;
        form.value.goodsTypeId = response.goodsType.typeId;
        form.value.goodsType = null;
      });
    } else {
      title.value = "新增";
      form.value.detailId = detailId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 商品选择回调 */
  function handleConfirmGoods(consumeGoods){
    form.value.scId = consumeGoods.consumeId;
    form.value.goodsTypeId = consumeGoods.goodsType.typeId;
    form.value.consumeName = consumeGoods.goodsName;
    form.value.cost = consumeGoods.totalPrice;
  }
  
  /** 商品选择 */
  function handleSelectGoods(){
    goodsSelectRef.value.openForm(form.value.scId);
  }
  
  /** 解绑商品选择 */
  function handleUnSelectGoods(){
    form.value.scId = null;
  }
  
  /** 初始化下拉树结构 */
  function initOptions() {
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      consumeId: undefined,
      consumeName: undefined,
      stat:true,
      scId:undefined,
      goodsTypeId:undefined,
      remark:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.consumeId != undefined) {
          editExperienceConsume(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createExperienceConsume(form.value).then(response => {
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
    
  })
</script>