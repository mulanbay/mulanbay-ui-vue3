<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="600px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="出发国家" prop="startCountryId">
            <el-select
              v-model="form.startCountryId"
              placeholder="出发国家"
              :style="{width: '100%'}"
              filterable
              @change="handleStartCountryChange">
              <el-option
                v-for="dict in startCountryOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="出发省市" prop="startProvinceId">
            <el-select
              v-model="form.startProvinceId"
              placeholder="省份"
              collapse-tags
              :style="{width: '160px'}"
              @change="handleStartProvinceChange">
              <el-option
                v-for="dict in startProvinceOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
            <el-select
              v-model="form.startCityId"
              placeholder="城市"
              collapse-tags
              :style="{width: '160px'}"
              @change="handleStartCityChange">
              <el-option
                v-for="dict in startCityOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
            <el-select
              v-model="form.startDistrictId"
              placeholder="县城"
              collapse-tags
              :style="{width: '160px'}">
              <el-option
                v-for="dict in startDistrictOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="抵达国家" prop="arriveCountryId">
            <el-select
              v-model="form.arriveCountryId"
              placeholder="抵达国家"
              :style="{width: '100%'}"
              filterable
              @change="handleArriveCountryChange">
              <el-option
                v-for="dict in arriveCountryOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="抵达省市" prop="arriveProvinceId">
            <el-select
              v-model="form.arriveProvinceId"
              placeholder="省份"
              collapse-tags
              :style="{width: '160px'}"
              @change="handleArriveProvinceChange">
              <el-option
                v-for="dict in arriveProvinceOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
            <el-select
              v-model="form.arriveCityId"
              placeholder="城市"
              collapse-tags
              :style="{width: '160px'}"
              @change="handleArriveCityChange">
              <el-option
                v-for="dict in arriveCityOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
            <el-select
              v-model="form.arriveDistrictId"
              placeholder="县城"
              collapse-tags
              :style="{width: '160px'}">
              <el-option
                v-for="dict in arriveDistrictOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="出发日期" prop="occurDate">
            <el-date-picker type="date" v-model="form.occurDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              :style="{width: '175px'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="地图统计" prop="mapStat">
            <el-switch v-model="form.mapStat"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="国际线路" prop="international">
            <el-switch v-model="form.international"></el-switch>
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


</template>

<script setup name="ExperienceDetailForm">
  import { createExperienceDetail, editExperienceDetail, getExperienceDetail, getLastExperienceDetail } from "@/api/life/experienceDetail";
  import { getCountryTree, getProvinceTree, getCityTree, getDistrictTree } from "@/api/common";
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('人生经历详情');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  //出发信息
  const startCountryOptions = ref([]);
  const startProvinceOptions = ref([]);
  const startCityOptions = ref([]);
  const startDistrictOptions = ref([]);

  //抵达信息
  const arriveCountryOptions = ref([]);
  const arriveProvinceOptions = ref([]);
  const arriveCityOptions = ref([]);
  const arriveDistrictOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      startCountryId: [
        { required: true, message: "出发国家不能为空", trigger: "blur" }
      ],
      arriveCountryId: [
        { required: true, message: "抵达国家不能为空", trigger: "blur" }
      ],
      // provinceId: [
      //   { required: true, message: "省份不能为空", trigger: "blur" }
      // ],
      // cityId: [
      //   { required: true, message: "城市不能为空", trigger: "blur" }
      // ],
      occurDate: [
        { required: true, message: "出发日期不能为空", trigger: "blur" }
      ],
      mapStat: [
        { required: true, message: "请选择是否加入地图统计", trigger: "blur" }
      ],
      international: [
        { required: true, message: "请选择是否国际线路", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id, Type, expId) => {
    open.value = true;
    resetForm();
    initOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getExperienceDetail(id).then(response => {
        formLoading.value = false;
        form.value = response;
        //出发地理位置
        form.value.startCountryId = response.startCountry == null ? null : response.startCountry.countryId;
        form.value.startCountry = null;
        form.value.startProvinceId = response.startProvince == null ? null : response.startProvince.provinceId;
        form.value.startProvince = null;
        form.value.startCityId = response.startCity == null ? null : response.startCity.cityId;
        form.value.startCity = null;
        form.value.startDistrictId = response.startDistrict == null ? null : response.startDistrict.districtId;
        form.value.startDistrict = null;
        handleStartCountryChange(form.value.startCountryId);
        handleStartProvinceChange(form.value.startProvinceId);
        handleStartCityChange(form.value.startCityId);

        //抵达地理位置
        form.value.arriveCountryId = response.arriveCountry == null ? null : response.arriveCountry.countryId;
        form.value.arriveCountry = null;
        form.value.arriveProvinceId = response.arriveProvince == null ? null : response.arriveProvince.provinceId;
        form.value.arriveProvince = null;
        form.value.arriveCityId = response.arriveCity == null ? null : response.arriveCity.cityId;
        form.value.arriveCity = null;
        form.value.arriveDistrictId = response.arriveDistrict == null ? null : response.arriveDistrict.districtId;
        form.value.arriveDistrict = null;
        handleArriveCountryChange(form.value.arriveCountryId);
        handleArriveProvinceChange(form.value.arriveProvinceId);
        handleArriveCityChange(form.value.arriveCityId);

        form.value.expId = response.experience.expId;
        form.value.experience = null;
      });
    } else {
      title.value = "新增";
      form.value.expId = expId;
      initCreate();
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 初始化下拉树结构 */
  function initOptions() {
    getStartCountryTreeSelect();
    getArriveCountryTreeSelect();
  }
  
  /** 新增初始化 */
  function initCreate() {
    //把上一次最近的抵达城市作为下一个的出发城市
    getLastExperienceDetail(form.value.expId).then(response => {
      if(response!=null){
        form.value.startCountryId = response.arriveCountry == null ? null : response.arriveCountry.countryId;
        form.value.startProvinceId = response.arriveProvince == null ? null : response.arriveProvince.provinceId;
        form.value.startCityId = response.arriveCity == null ? null : response.arriveCity.cityId;
        form.value.startDistrictId = response.arriveDistrict == null ? null : response.arriveDistrict.districtId;
      }
      handleStartCountryChange(form.value.startCountryId);
      handleStartProvinceChange(form.value.startProvinceId);
      handleStartCityChange(form.value.startCityId);
    });
  }
  

  /** 出发 start */
  /** 国家列表 */
  function getStartCountryTreeSelect() {
    getCountryTree().then(response => {
      startCountryOptions.value = response;
    });
  }

  /** 国家变化 */
  function handleStartCountryChange(countryId) {
    if (countryId == null) {
      return;
    }
    getProvinceTree(countryId).then(response => {
      startProvinceOptions.value = response;
    });
  }

  /** 查询城市下拉树结构 */
  function handleStartProvinceChange(provinceId) {
    if (provinceId == null) {
      return;
    }
    startDistrictOptions.value = [];
    getCityTree(provinceId).then(response => {
      startCityOptions.value = response;
    });
  }

  /** 查询县级下拉树结构 */
  function handleStartCityChange(cityId) {
    if (cityId == null) {
      return;
    }
    getDistrictTree(cityId).then(response => {
      startDistrictOptions.value = response;
    });
  }
  /** 出发 end */

  /** 抵达 arrive */
  /** 国家列表 */
  function getArriveCountryTreeSelect() {
    getCountryTree().then(response => {
      arriveCountryOptions.value = response;
    });
  }

  /** 国家变化 */
  function handleArriveCountryChange(countryId) {
    if (countryId == null) {
      return;
    }
    getProvinceTree(countryId).then(response => {
      arriveProvinceOptions.value = response;
    });
  }

  /** 查询城市下拉树结构 */
  function handleArriveProvinceChange(provinceId) {
    if (provinceId == null) {
      return;
    }
    arriveDistrictOptions.value = [];
    getCityTree(provinceId).then(response => {
      arriveCityOptions.value = response;
    });
  }

  /** 查询县级下拉树结构 */
  function handleArriveCityChange(cityId) {
    if (cityId == null) {
      return;
    }
    getDistrictTree(cityId).then(response => {
      arriveDistrictOptions.value = response;
    });
  }
  /** 抵达 end */

  // 表单重置
  function resetForm() {
    form.value = {
      detailId: undefined,
      startCountryId: 290,
      arriveCountryId: 290,
      mapStat: true,
      international: false
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.detailId != undefined) {
          editExperienceDetail(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createExperienceDetail(form.value).then(response => {
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