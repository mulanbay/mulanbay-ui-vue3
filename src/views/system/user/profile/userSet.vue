<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
    <el-form-item label="消息(邮件发送)" prop="sendEmail">
      <el-switch v-model="form.sendEmail"></el-switch>
      <el-tooltip content="消息将发送到您绑定的邮箱" effect="dark" placement="top">
        <el-icon>
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
    </el-form-item>
    <el-form-item label="消息(微信发送)" prop="sendWx">
      <el-switch v-model="form.sendWx"></el-switch>
      <el-tooltip content="消息将以微信公众号来发送，请先关注公众号" effect="dark" placement="top">
        <el-icon>
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
    </el-form-item>
    <el-form-item label="看病商品类型" prop="treatGoodsTypeId">
      <el-tree-select
        v-model="form.treatGoodsTypeId"
        style="width: 240px"
        :data="goodsTypeOptions"
        :props="{ value: 'id', label: 'text', children: 'children' }"
        value-key="id"
        placeholder="看病商品类型"
        check-strictly/>
    </el-form-item>
    <el-form-item label="看病购买来源" prop="treatSourceId">
      <el-select
        v-model="form.treatSourceId"
        placeholder="看病购买来源"
        style="width: 240px">
        <el-option
          v-for="dict in sourceOptions"
          :key="dict.id"
          :label="dict.text"
          :value="dict.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="默认支付方式">
      <el-select v-model="form.payment" :style="{width: '100%'}" placeholder="请选择">
        <el-option
          v-for="dict in paymentOptions"
          :key="dict.id"
          :label="dict.text"
          :value="dict.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="我的常驻城市" prop="residentCity">
      <el-input v-model="form.residentCity" maxlength="50" />
    </el-form-item>
    <el-form-item label="用户评分模板" prop="scoreGroupId">
      <el-select
        v-model="form.scoreGroupId"
        placeholder="评分模板"
        collapse-tags
        style="width: 200px"
      >
        <el-option
          v-for="dict in scoreGroupOptions"
          :key="dict.id"
          :label="dict.text"
          :value="dict.id"
        />
      </el-select>
      <el-tooltip content="不同的模板采用不同的评测标准" effect="dark" placement="top">
        <el-icon>
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
      <el-button link type="primary" @click="handleSelfJudge" v-hasPermi="['data:userScore:selfJudge']">
        评测
      </el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
  import { getUserSet,editUserSet } from "@/api/auth/userSet";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getScoreGroupTree } from "@/api/config/scoreGroup";

  const { proxy } = getCurrentInstance();
  
  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const paymentOptions = ref([]);
  const scoreGroupOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      sendEmail: [
        { required: true, message: "是否发送EMail不能为空", trigger: "blur" }
      ],
      sendWx: [
        { required: true, message: "是否发送微信消息不能为空", trigger: "blur" }
      ],
      scoreGroupId: [
        { required: true, message: "评分的配置组不能为空", trigger: "blur" }
      ],
      treatGoodsTypeId: [
        { required: true, message: "看病记录商品类型不能为空", trigger: "blur" }
      ],
      treatSourceId: [
        { required: true, message: "看病记录商品来源不能为空", trigger: "blur" }
      ],
      payment: [
        { required: true, message: "支付方式不能为空", trigger: "blur" }
      ]
    }
  });
  
  const { form, rules } = toRefs(data);
  
  /** 下拉框加载 */
  function loadOptions() {
    getConsumeSourceTree().then(response => {
      sourceOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
    getScoreGroupTree().then(response => {
      scoreGroupOptions.value = response;
    });
    proxy.getEnumDict('Payment', 'FIELD', false).then(response => {
      paymentOptions.value = response;
    });
  }
  
  /** 评测 */
  function handleSelfJudge(){
    
  }
  
  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        editUserSet(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
        });
      }
    });
  };
  
  /** 初始化 **/
  onMounted(() => {
    getUserSet().then(response => {
      form.value = response;
    });
    loadOptions();
  })

</script>