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
        <el-col :span="10">
          <el-form-item label="地点名称" prop="lcName">
           <el-input v-model="form.lcName" placeholder="请输入地点名称" />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="地理坐标" prop="location">
           <el-input v-model="form.location" placeholder="" style="width: 175px;"/>
           <el-button type="primary" @click="handleMapLocation()" >选择</el-button>
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
           <el-input-number v-model="form.days" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="花费金额" prop="cost">
           <el-input-number v-model="form.cost" :style="{width: '100%'}" disabled placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="类型标签" prop="tags">
            <el-tag
              :key="tag"
              v-for="tag in keywordsTags"
              closable
              size="large"
              :disable-transitions="false"
              @close="handleTagClose(tag)">
              {{tag}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue"
              ref="saveTagInput"
              style="width: 120px"
              @keyup.enter.native="handleTagInputConfirm"
              @blur="handleTagInputConfirm">
            </el-input>
            <el-button v-else type="primary" class="button-new-tag" @click="showTagInput">+ 新建</el-button>
            <el-popover :visible="tagsPopOpen" placement="top" :width="400">
              <el-tag
                effect="plain"
                :key="tag"
                v-for="tag in hisKeywordsTags"
                :disable-transitions="false"
                @click="handleTagAppend(tag.text)">
                {{tag.text}}
              </el-tag>
              <div style="text-align: right; margin: 0">
                <el-button size="small" type="danger" icon="CircleClose" @click="tagsPopOpen = false">关闭</el-button>
              </div>
              <template #reference>
                <el-button @click="tagsPopOpen = true" type="success" icon="Share">选择</el-button>
              </template>
            </el-popover>
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
  
  <!-- 地理选择 -->
  <LocationSelect ref="locationSelectRef" @confirmLocation="setLocation" />
  
</template>

<script setup name="ExperienceForm">
  import { createExperience, editExperience, getExperience } from "@/api/life/experience";
  import {dateDiff} from "@/utils/datetime";
  import { appendTagToOptions } from "@/utils/tagUtils";
  import LocationSelect from './locationSelect.vue';

  const { proxy } = getCurrentInstance();
  const locationSelectRef = ref();

  //可执行时间段
  const title = ref('人生经历');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const typeOptions = ref([]);
  
  //标签属性 start
  const keywordsTags = ref([]);
  //已经保存过的标签
  const hisKeywordsTags = ref([]);
  const inputVisible = ref(false);
  const inputValue = ref('');
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
      });
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });
  
  /** 初始化下拉树结构 */
  function initOptions(){
    
  }
  

  /** 标签处理 start */
  function handleTagClose(tag) {
    keywordsTags.value.splice(keywordsTags.value.indexOf(tag), 1);
  }

  function handleTagAppend(tag) {
    appendTagToOptions(tag, keywordsTags.value);
  }

  function showTagInput() {
    inputVisible.value = true;
    proxy.$nextTick(_ => {
      proxy.$refs.saveTagInput.$refs.input.focus();
    });
  }

  function handleTagInputConfirm() {
    if (inputValue.value) {
      appendTagToOptions(inputValue.value, keywordsTags.value);
    }
    inputVisible.value = false;
    inputValue.value = '';
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