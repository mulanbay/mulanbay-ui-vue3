<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="620px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="食物名称" prop="foodName">
            <el-input v-model="form.foodName" placeholder="请输入食物名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="食物类别" prop="className">
            <el-select
              v-model="form.className"
              placeholder="食物类别"
              clearable
              collapse-tags>
              <el-option
                v-for="dict in classNameOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="卡路里数" prop="cal">
            <el-input-number v-model="form.cal" placeholder="" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="0" >
              <template #suffix>
                <span>卡</span>
              </template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计量单位" prop="amount">
            <el-input-number v-model="form.amount" placeholder="" :style="{width: '130px'}" controls-position="right" :min="0" :controls="false" :precision="0" >
            </el-input-number>
            <el-input v-model="form.unit" placeholder="" :style="{width: '80px'}" />
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
                :value="dict.id"
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

<script setup name="FoodEnergyForm">
  import { createFoodEnergy, editFoodEnergy, getFoodEnergy } from "@/api/food/foodEnergy";
  import { getCateClassTree } from "@/api/food/foodCategory";
  import {appendTagToOptions} from "@/utils/tagUtils";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('食物类别');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const classNameOptions = ref([]);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      foodName: [
        { required: true, message: "食物名称不能为空", trigger: "blur" }
      ],
      className: [
        { required: true, message: "食物类别不能为空", trigger: "blur" }
      ],
      cal: [
        { required: true, message: "卡路里数不能为空", trigger: "blur" }
      ],
      amount: [
        { required: true, message: "计量数值不能为空", trigger: "blur" }
      ],
      unit: [
        { required: true, message: "单位不能为空", trigger: "blur" }
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
  const openForm = async (id,type,foodName) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getFoodEnergy(id).then(response => {
          form.value = response;
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
      form.value.foodName = foodName;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });
  
  // 表单重置
  function resetForm() {
    form.value = {
      foodId: undefined,
      foodName: undefined,
      cal: undefined,
      amount: 100,
      unit: '克',
      className: undefined,
      orderIndex: 0,
      status: "ENABLE"
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.foodId != undefined) {
          editFoodEnergy(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createFoodEnergy(form.value).then(response => {
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
    getCateClassTree().then(response => {
      classNameOptions.value = response;
    });
  })
</script>