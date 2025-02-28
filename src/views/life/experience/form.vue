<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="600px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="经历名称" prop="expName">
           <el-input v-model="form.expName" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="经历类型" prop="type">
            <el-select
              v-model="form.type"
              placeholder="类型"
              collapse-tags
              :style="{width: '100%'}"
            >
              <el-option
                v-for="dict in typeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="省市信息" prop="provinceId">
            <el-select
              v-model="form.provinceId"
              placeholder="省份"
              collapse-tags
              :style="{width: '160px'}"
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
              :style="{width: '160px'}"
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
              :style="{width: '160px'}">
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
        <el-col :span="12">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker type="date" v-model="form.startDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker type="date" v-model="form.endDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable  @change="calculateMinutes">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="持续天数" prop="days">
           <el-input-number v-model="form.days" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" >
            <template #suffix>
               <span>天</span>
             </template>
            </el-input-number> 
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="花费金额" prop="cost">
           <el-input-number v-model="form.cost" :style="{width: '100%'}" disabled placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" >
             <template #suffix>
               <span>元</span>
             </template>
            </el-input-number> 
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="类型标签" prop="tags">
            <el-input-tag v-model="keywordsTags" @input="handleTagInput" tag-type="primary" tag-effect="light" placeholder="输入标签" >
              <template #suffix>
                <el-popover :visible="tagsPopOpen" placement="top" :width="400">
                  <el-tag
                    effect="plain"
                    type="primary"
                    round
                    :key="tag"
                    v-for="tag in hisKeywordsTags"
                    :disable-transitions="false"
                    @click="handleTagAppend(tag.text)">
                    {{tag.text}}
                  </el-tag>
                  <div style="text-align: right; margin: 0">
                    <el-button size="small" type="success" icon="CircleCheckFilled" @click="tagsPopOpen = false">确定</el-button>
                  </div>
                  <template #reference>
                    <el-button @click="tagsPopOpen = true" type="success" icon="Share" size="small">选择</el-button>
                  </template>
                </el-popover>
              </template>
            </el-input-tag> 
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

<script setup name="ExperienceForm">
  import { createExperience, editExperience, getExperience } from "@/api/life/experience";
  import { getCountryTree, getProvinceTree, getCityTree, getDistrictTree } from "@/api/common";
  import {dateDiff} from "@/utils/datetime";
  import { appendTagToOptions } from "@/utils/tagUtils";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('人生经历');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const typeOptions = ref([]);
  
  const countryOptions = ref([]);
  const provinceOptions = ref([]);
  const cityOptions = ref([]);
  const districtOptions = ref([]);
  
  //标签属性 start
  const keywordsTags = ref([]);
  //已经保存过的标签
  const hisKeywordsTags = ref([]);
  const tagsPopOpen = ref(false);
  //标签属性 end
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      expName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      type: [
        { required: true, message: "类型不能为空", trigger: "blur" }
      ],
      startDate: [
        { required: true, message: "开始日期不能为空", trigger: "blur" }
      ],
      endDate: [
        { required: true, message: "结束日期不能为空", trigger: "blur" }
      ],
      days: [
        { required: true, message: "天数不能为空", trigger: "blur" }
      ],
      countryId: [
        { required: true, message: "国家不能为空", trigger: "blur" }
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
    initOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getExperience(id).then(response => {
        formLoading.value = false;
        form.value = response;
        if(!proxy.isEmpty(response.tags)){
          keywordsTags.value = response.tags.split(',');
        }else{
          keywordsTags.value = [];
        }
        //地理位置
        form.value.countryId = response.country==null ? null:response.country.countryId;
        form.value.country = null;
        form.value.provinceId = response.province==null ? null:response.province.provinceId;
        form.value.province = null;
        form.value.cityId = response.city==null ? null:response.city.cityId;
        form.value.city = null;
        form.value.districtId = response.district==null ? null:response.district.districtId;
        form.value.district = null;
        handleCountryChange(form.value.countryId);
        handleProvinceChange(form.value.provinceId);
        handleCityChange(form.value.cityId);
      });
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });
  
  /** 初始化下拉树结构 */
  function initOptions(){
    getCountryTreeSelect();
  }
  
  
  /** 国家列表 */
  function getCountryTreeSelect() {
    getCountryTree().then(response => {
      countryOptions.value = response;
    });
  }
  
  /** 国家变化 */
  function handleCountryChange(countryId) {
    if(countryId==null){
      return;
    }
    getProvinceTree(countryId).then(response => {
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

  /** 地理位置确定 */
  function setLocation(data){
    
  }
  
  /** 选择地理位置 */
  function handleMapLocation(){
    if(form.value.lcName==null){
      proxy.$modal.msgError("请先输入地点名称");
      return;
    }
    locationSelectRef.value.openForm(form.value.lcName,form.value.location);
  }
  
  //计算时长
  function calculateMinutes(){
    let startDate=form.value.startDate;
    let endDate =form.value.endDate;
    let days = dateDiff(startDate,endDate)+1;
    form.value.days=days;
  }
  
  // 表单重置
  function resetForm() {
    form.value = {
      expId: undefined,
      expName: undefined,
      countryId: undefined,
      orderIndex: 0,
      status: "ENABLE",
      stat:true,
      tags:null,
      lcName:undefined,
      location:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if(keywordsTags.value.length>0){
          form.value.tags = keywordsTags.value.join(',');
        }else{
          form.value.tags = undefined;
        }
        if (form.value.expId != undefined) {
          editExperience(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createExperience(form.value).then(response => {
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
    proxy.getEnumDict('ExperienceType', 'FIELD', false).then(response => {
      typeOptions.value = response;
    });
    proxy.getDictItemTree('EXPERIENCE_TAGS', false).then(response => {
      if(!proxy.isEmpty(response)){
        hisKeywordsTags.value = response;
      }
    });
  })
</script>