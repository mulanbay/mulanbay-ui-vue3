<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="600px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="类型" prop="typeId">
             <el-tree-select
               v-model="form.typeId"
               style="width: 400px"
               :data="typeOptions"
               :props="{ value: 'id', label: 'text', children: 'children' }"
               value-key="id"
               placeholder="选择类型"
               :check-strictly="false" 
               @change="handleTypeChange"/>
             <el-button type="success" icon="CirclePlus" @click="handleCreateType" v-hasPermi="['commonData:commonDataType:create']">新增</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="名称" prop="dataName">
            <el-select
              v-model="form.dataName"
              :style="{width: '100%'}"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in nameOptions"
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
          <el-form-item label="时间" prop="occurTime">
            <el-date-picker type="datetime" v-model="form.occurTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数值" prop="value">
           <el-input-number v-model="form.value" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" >
              <template #suffix>
                <span>{{ valueUnit }}</span>
              </template>
            </el-input-number> 
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="地点" prop="location">
            <el-input v-model="form.location" placeholder="请输入地点" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
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

    <!-- 表单 -->
    <CommonDataTypeForm ref="typeFormRef" @success="confirmCreateType" />

</template>

<script setup name="CommonDataForm">
  import { createCommonData, editCommonData, getCommonData,getNameTree,getNearestCommonData } from "@/api/commonData/commonData";
  import { getCommonDataTypeTree,getCommonDataType } from "@/api/commonData/commonDataType";
  import CommonDataTypeForm from '../commonDataType/form.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('通用类型');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const typeOptions = ref([]);
  const nameOptions = ref([]);
  const valueUnit = ref('');
  const typeFormRef = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      typeId: [
        { required: true, message: "类型不能为空", trigger: "blur" }
      ],
      dataName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      value: [
        { required: true, message: "值不能为空", trigger: "blur" }
      ],
      occurTime: [
        { required: true, message: "时间不能为空", trigger: "blur" }
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
    loadOptions();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getCommonData(id).then(response => {
          form.value = response;
          form.value.typeId = response.type.typeId;
          form.value.type = null;
          loadTypeInfo(form.value.typeId);
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
  
  function loadOptions(){
    getCommonDataTypeTree().then(response => {
      typeOptions.value = response;
    });
  }
  
  /** 类型选择变化 */
  function handleTypeChange(typeId){
    let para ={
      typeId:typeId
    }
    getNameTree(para).then(response => {
      nameOptions.value = response;
    });
    loadTypeInfo(typeId);
    loadNearest(typeId);
  }
  
  /** 类型信息加载 */
  function loadTypeInfo(typeId){
    getCommonDataType(typeId).then(response => {
      if(response!=null){
        valueUnit.value = response.unit;
        //新增情况下，设置默认名称
        if(proxy.isEmpty(form.value.dataId)){
          form.value.dataName = response.typeName;
        }
      }
    });
  }
  
  /** 加载最近信息 */
  function loadNearest(typeId){
    let para ={
      typeId: typeId,
      nearestType:'MAX_TIME'
    }
    getNearestCommonData(para).then(response => {
      if(response!=null){
        form.value.location = response.location;
        form.value.value = response.value;
      }
    });
  }
  
  //新增类型
  function handleCreateType(){
    typeFormRef.value.openForm(null);
  }
  
  //确定新增类型
  function confirmCreateType(typeId){
    loadOptions();
    form.value.typeId=typeId;
  }
  
  // 表单重置
  function resetForm() {
    form.value = {
      dataId: undefined,
      dataName:undefined,
      location:undefined,
      occurTime:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.dataId != undefined) {
          editCommonData(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createCommonData(form.value).then(response => {
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