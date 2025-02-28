<template>

  <!-- 费用信息 -->
  <el-dialog title="费用信息" width="700px" v-model="open">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-divider content-position="center">
        <span class="table-title">
          <svg-icon icon-class="budget" />
          分项费用明细(原始费用)
        </span>
      </el-divider>
      <el-card>
        <el-row>
          <el-col :span="12">
            <el-form-item label="药品费用" prop="drugFee">
              <el-input-number v-model="form.drugFee" @change="calTotalFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly" >
                <template #suffix>
                  <span>元</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手术/治疗费用" prop="operationFee">
              <el-input-number v-model="form.operationFee" @change="calTotalFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly" >
                <template #suffix>
                  <span>元</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="挂号费用" prop="regFee">
              <el-input-number v-model="form.regFee" @change="calTotalFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly" >
                <template #suffix>
                  <span>元</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="其他费用" prop="otherFee">
              <el-input-number v-model="form.otherFee" @change="calTotalFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" disabled >
                <template #suffix>
                  <span>元</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      <el-divider content-position="center">
        <span class="table-title">
          <svg-icon icon-class="budget" />
          支付详情(统计)
        </span>
      </el-divider>
      <el-card>
        <el-row>
          <el-col :span="12">
            <el-form-item label="总共花费" prop="totalFee">
              <el-input-number v-model="form.totalFee" @change="calMIPFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly" />
              元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="个人支付" prop="pdFee">
              <el-input-number v-model="form.pdFee" @change="calMIPFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly" />
              元
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="医保花费" prop="miFee">
              <el-input-number v-model="form.miFee" :style="{width: '90%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" :disabled="feeReadOnly" />
              元
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
    </el-form>
    <br>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button type="primary" @click="confirmFee">确 定</el-button>
    </div>
  </el-dialog>

</template>

<script setup name="TreatForm">

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('费用详情');
  const open = ref(false);
  const formRef = ref();
  const feeReadOnly = ref(false);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (data,fro) => {
    open.value = true;
    form.value = data;
    feeReadOnly.value = fro;
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });


  /** 计算医保费用 */
  function calMIPFee() {
    form.value.miFee = form.value.totalFee - form.value.pdFee;
  }

  /** 计算总费用 */
  function calTotalFee() {
    form.value.totalFee = form.value.drugFee + form.value.operationFee + form.value.regFee;
  }

  /** 提交按钮 */
  function confirmFee() {
    open.value = false;
    emit('success',form.value);
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>