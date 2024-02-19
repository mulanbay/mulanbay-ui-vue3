<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="650px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="10">
          <el-form-item label="出发城市" prop="startCity">
            <el-input v-model="form.startCity" placeholder="请输入城市" @blur="getStartCityLocation" />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="地理坐标" prop="scLocation">
            <el-input v-model="form.scLocation" placeholder="" style="width: 195px;" />
            <el-button type="primary" @click="handleStartCityML">选择</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="抵达城市" prop="arriveCity">
            <el-input v-model="form.arriveCity" placeholder="请输入城市" @blur="getArriveCityLocation" />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="地理坐标" prop="acLocation">
            <el-input v-model="form.acLocation" placeholder="" style="width: 195px;" />
            <el-button type="primary" @click="handleArriveCityML">选择</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="所在国家" prop="countryId">
            <el-select
              v-model="form.countryId"
              placeholder="所在国家"
              clearable
              filterable
              @change="handleCountryChange">
              <el-option
                v-for="dict in countryOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="地理坐标" prop="countryLocation">
            <el-input v-model="form.countryLocation" placeholder="" style="width: 195px;" />
            <el-button type="primary" @click="handleCountryML">选择</el-button>
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
          <el-form-item label="省市信息" prop="provinceId" v-if="form.international==false">
            <el-select
              v-model="form.provinceId"
              placeholder="省份"
              collapse-tags
              :style="{width: '170px'}"
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
              :style="{width: '175px'}"
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
              :style="{width: '175px'}">
              <el-option
                v-for="dict in districtOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
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
  import { createExperienceDetail, editExperienceDetail, getExperienceDetail, getCountryLocation, getCityLocation } from "@/api/life/experienceDetail";
  import { getCountryTree, getProvinceTree, getCityTree, getDistrictTree } from "@/api/common";
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('人生经历详情');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const countryOptions = ref([]);
  const provinceOptions = ref([]);
  const cityOptions = ref([]);
  const districtOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      countryId: [
        { required: true, message: "国家不能为空", trigger: "blur" }
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
      startCity: [
        { required: true, message: "出发城市不能为空", trigger: "blur" }
      ],
      arriveCity: [
        { required: true, message: "抵达城市不能为空", trigger: "blur" }
      ],
      scLocation: [
        { required: true, message: "出发城市地理坐标不能为空", trigger: "blur" }
      ],
      acLocation: [
        { required: true, message: "抵达城市地理坐标不能为空", trigger: "blur" }
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
  const openForm = async (id,Type,expId) => {
    open.value = true;
    resetForm();
    initOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getExperienceDetail(id).then(response => {
        formLoading.value = false;
        form.value = response;
        handleProvinceChange(response.provinceId);
        handleCityChange(response.cityId);
        form.value.expId = response.experience.expId;
        form.value.experience = null;
      });
    } else {
      title.value = "新增";
      form.value.expId = expId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 初始化下拉树结构 */
  function initOptions() {
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
    if (form.value.countryId != 290) {
      form.value.international = true;
    }
    getCountryLocation(form.value.countryId).then(
      response => {
        if (response != null) {
          form.value.countryLocation = response;
        }
      }
    );
  }

  /** 查询省份下拉树结构 */
  function getProvinceTreSelect() {
    getProvinceTree().then(response => {
      provinceOptions.value = response;
    });
  }

  /** 查询城市下拉树结构 */
  function handleProvinceChange(provinceId) {
    districtOptions.value = [];
    getCityTree(provinceId).then(response => {
      cityOptions.value = response;
    });
  }

  /** 查询县级下拉树结构 */
  function handleCityChange(cityId) {
    getDistrictTree(cityId).then(response => {
      districtOptions.value = response;
    });
  }

  /** 地理位置确定 */
  function setLocation(data) {

  }

  /** 自动获取出发城市的地理位置 */
  function getStartCityLocation() {
    if(form.value.startCity==null){
      return;
    }
    getCityLocation(form.value.startCity).then(
      response => {
        if (response != null) {
          form.value.scLocation = response;
        }
      }
    );
  }

  /** 自动获取抵达城市的地理位置 */
  function getArriveCityLocation() {
    if(form.value.arriveCity==null){
      return;
    }
    getCityLocation(form.value.arriveCity).then(
      response => {
        if (response != null) {
          form.value.acLocation = response;
        }
      }
    );
  }

  /** 开始城市地理位置选择 */
  function handleStartCityML() {

  }

  /** 抵达城市地理位置选择 */
  function handleArriveCityML() {

  }

  /** 国家地理位置选择 */
  function handleCountryML() {

  }

  // 表单重置
  function resetForm() {
    form.value = {
      detailId: undefined,
      countryId: 290,
      countryLocation: '116.266206,41.034901',
      mapStat:true,
      international:false,
      scLocation:undefined,
      acLocation:undefined
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