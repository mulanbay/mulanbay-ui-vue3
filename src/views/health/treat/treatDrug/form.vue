<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="720px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="药品名称" prop="drugName">
            <el-select
              v-model="form.drugName"
              filterable
              allow-create
              default-first-option
              :style="{width: '100%'}"
              @change="loadDrugProperties">
              <el-option
                v-for="dict in drugNameOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="针对疾病" prop="disease">
            <el-select
              v-model="form.disease"
              :style="{width: '100%'}"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in diseaseOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="药品数量" prop="amount">
            <el-input-number v-model="form.amount" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="药品单位" prop="unit">
            <el-select
              v-model="form.unit"
              filterable
              allow-create
              default-first-option
              :style="{width: '100%'}">
              <el-option
                v-for="dict in unitOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="药品单价" prop="unitPrice">
            <el-input-number v-model="form.unitPrice" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="2" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="药品总价" prop="totalPrice">
            <el-input-number v-model="form.totalPrice" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="2" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用药开始日期" prop="beginDate">
            <el-date-picker type="date" v-model="form.beginDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用药结束日期" prop="endDate">
            <el-date-picker type="date" v-model="form.endDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="看病日期" prop="treatDate">
            <el-date-picker type="date" v-model="form.treatDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="使用方式" prop="useWay">
            <el-select
              v-model="form.useWay"
              filterable
              allow-create
              default-first-option
              :style="{width: '100%'}">
              <el-option
                v-for="dict in useWayOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用药频率" prop="perDay">
            每
            <el-input-number v-model="form.perDay" controls-position="right" :style="{width: '80px'}" :min="0" :controls="true" :precision="0" />
            天
            <el-input-number v-model="form.perTimes" controls-position="right" :style="{width: '80px'}" :min="0" :controls="true" :precision="0" />
            次
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用药药量" prop="ec">
            每次
            <el-input-number v-model="form.ec" controls-position="right" :style="{width: '90px'}" :min="0" :controls="true" :precision="0" />
            <el-select
              v-model="form.eu"
              filterable
              allow-create
              default-first-option
              :style="{width: '100px'}">
              <el-option
                v-for="dict in euOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="是否有效" prop="available">
            <el-switch v-model="form.available"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否提醒" prop="remind">
            <el-switch v-model="form.remind"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注">
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

</template>

<script setup name="TreatDrugForm">
  import { createTreatDrug, editTreatDrug, getTreatDrug, getTreatDrugCateTree,getLastTreatDrug } from "@/api/health/treat/treatDrug";
  import {getDay,getDayByDate,getNowDateString} from "@/utils/datetime";
  import { ElNotification } from 'element-plus'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('用药记录');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const drugNameOptions = ref([]);
  const diseaseOptions = ref([]);
  const unitOptions = ref([]);
  const useWayOptions = ref([]);
  const euOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      drugName: [
        { required: true, message: "药品名称不能为空", trigger: "blur" }
      ],
      disease: [
        { required: true, message: "针对疾病不能为空", trigger: "blur" }
      ],
      beginDate: [
        { required: true, message: "用药开始日期不能为空", trigger: "blur" }
      ],
      endDate: [
        { required: true, message: "用药结束日期不能为空", trigger: "blur" }
      ],
      treatDate: [
        { required: true, message: "看病时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id, type,treatId) => {
    open.value = true;
    resetForm();
    loadOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getTreatDrug(id).then(response => {
        formLoading.value = false;
        form.value = response;
        form.value.treatId = response.treat.treatId;
        form.value.treat = null;
        if (treatId != form.value.treatId) {
          ElNotification({
            title: '警告',
            message: h('i', { style: 'color: teal' }, '表单中的父级看病编号与列表查询的看病编号对应不上，可能是不同页面跳转过来引起'),
          })
        }
      });
    } else {
      if(treatId==null){
        proxy.$modal.msgError("没有看病记录编号绑定，无法新增");
        open.value = false;
        return;
      }
      title.value = "新增";
      form.value.treatId = treatId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 加载下拉选项 */
  function loadOptions() {
    getTreatDrugCateTree('drugName', false).then(
      response => {
        drugNameOptions.value = response;
      }
    );
    getTreatDrugCateTree('disease', false).then(
      response => {
        diseaseOptions.value = response;
      }
    );
    proxy.getDictItemTree('DRUG_USE_WAY', false).then(response => {
      useWayOptions.value = response;
    });
    proxy.getDictItemTree('DRUG_EU', false).then(response => {
      euOptions.value = response;
    });
    proxy.getDictItemTree('DRUG_UNIT', false).then(response => {
      unitOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      drugId: undefined,
      drugName:undefined,
      treatId:undefined,
      unit: '盒',
      amount: 1,
      unitPrice:0,
      shipment:0,
      perDay:1,
      treatDate:getDay(0),
      beginDate:getDay(0),
      endDate:getDay(14),
      perTimes:1,
      available:true,
      remind:true,
      totalPrice:0,
      eu:'粒',
      ec:1,
      useWay:'餐前'
    };
    proxy.resetForm("formRef");
  }
  
  //从已经有的用药记录加载
  function loadDrugProperties(newVal){
    if(!proxy.isEmpty(form.value.drugId)){
      //修改类不需要
      return;
    }
    //加载复制详情
    getLastTreatDrug(newVal).then(response => {
      form.value.unit = response.unit;
      form.value.unitPrice = response.unitPrice;
      form.value.perDay = response.perDay;
      form.value.perTimes = response.perTimes;
      form.value.available = response.available;
      form.value.remind = response.remind;
      form.value.totalPrice = response.totalPrice;
      form.value.eu = response.eu;
      form.value.ec = response.ec;
      form.value.useWay = response.useWay;
    });
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.drugId != undefined) {
          editTreatDrug(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createTreatDrug(form.value).then(response => {
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