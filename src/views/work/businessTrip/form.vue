<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="500px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="所在公司" prop="companyId">
        <el-select
          v-model="form.companyId"
          placeholder="公司"
          clearable
          :style="{width: '100%'}"
        >
          <el-option
            v-for="dict in companyOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="出差日期" prop="tripDate">
        <el-date-picker type="date" v-model="form.tripDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                  :style="{width: '200px'}" placeholder="请选择日期" clearable >
        </el-date-picker>
        <span class="link-type" @click="msgAlert('提示','如果不填，默认是加班开始时间所在的日期')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item label="所在国家" prop="countryId">
        <el-select
          v-model="form.countryId"
          placeholder="所在国家"
          :style="{width: '100%'}"
          filterable
          @change="handleCountryChange">
          <el-option
            v-for="dict in countryOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="省市信息" prop="provinceId">
        <el-select
          v-model="form.provinceId"
          placeholder="省份"
          collapse-tags
          :style="{width: '125px'}"
          @change="handleProvinceChange">
          <el-option
            v-for="dict in provinceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-select
          v-model="form.cityId"
          placeholder="城市"
          collapse-tags
          :style="{width: '125px'}"
          @change="handleCityChange">
          <el-option
            v-for="dict in cityOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-select
          v-model="form.districtId"
          placeholder="县城"
          collapse-tags
          :style="{width: '125px'}">
          <el-option
            v-for="dict in districtOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="出差天数" prop="days">
        <el-input-number v-model="form.days" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
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

<script setup name="BusinessTripForm">
  import { createBusinessTrip, editBusinessTrip, getBusinessTrip } from "@/api/work/businessTrip";
  import { getCompanyTree } from "@/api/work/company";
  import { getCountryTree, getProvinceTree, getCityTree, getDistrictTree } from "@/api/common";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('加班');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const companyOptions = ref([]);
  const countryOptions = ref([]);
  const provinceOptions = ref([]);
  const cityOptions = ref([]);
  const districtOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      companyId: [
        { required: true, message: "公司不能为空", trigger: "blur" }
      ],
      tripDate: [
        { required: true, message: "出差不能为空", trigger: "blur" }
      ],
      days: [
        { required: true, message: "天数不能为空", trigger: "blur" }
      ],
      countryId: [
        { required: true, message: "国家不能为空", trigger: "blur" }
      ],
      provinceId: [
        { required: true, message: "省份不能为空", trigger: "blur" }
      ],
      cityId: [
        { required: true, message: "城市不能为空", trigger: "blur" }
      ],
      districtId: [
        { required: true, message: "县不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);
  
  
  /** 初始化下拉树结构 */
  function initOptions() {
    getCompanyTree().then(response => {
      companyOptions.value = response;
    });
    getCountryTreeSelect();
    getProvinceTreSelect();
  }
  
  /** 国家列表 */
  function getCountryTreeSelect() {
    getCountryTree().then(response => {
      countryOptions.value = response;
    });
  }
  
  /** 国家变化 */
  function handleCountryChange() {
    proxy.$forceUpdate();
  }
  
  /** 查询省份下拉树结构 */
  function getProvinceTreSelect() {
    getProvinceTree().then(response => {
      provinceOptions.value = response;
    });
  }
  
  /** 查询城市下拉树结构 */
  function handleProvinceChange(provinceId) {
    if(provinceId==null){
      return;
    }
    districtOptions.value = [];
    getCityTree(provinceId).then(response => {
      cityOptions.value = response;
    });
  }
  
  /** 查询县级下拉树结构 */
  function handleCityChange(cityId) {
    if(cityId==null){
      return;
    }
    getDistrictTree(cityId).then(response => {
      districtOptions.value = response;
    });
  }
  
  /** 打开弹窗 */
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    initOptions();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getBusinessTrip(id).then(response => {
          form.value = response;
          form.value.companyId = response.company.companyId;
          form.value.company = null;
          form.value.countryId = response.country==null ? null:response.country.countryId;
          form.value.country = null;
          form.value.provinceId = response.province==null ? null:response.province.provinceId;
          form.value.province = null;
          form.value.cityId = response.city==null ? null:response.city.cityId;
          form.value.city = null;
          form.value.districtId = response.district==null ? null:response.district.districtId;
          form.value.district = null;
          handleProvinceChange(form.value.provinceId);
          handleCityChange(form.value.cityId);
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
      overtimeId: undefined,
      companyId: undefined,
      countryId: 290,
      days:1,
      startTime: undefined,
      endTime: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.tripId != undefined) {
          editBusinessTrip(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createBusinessTrip(form.value).then(response => {
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