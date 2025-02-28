<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="600px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="100px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="类型名称" prop="typeName">
            <el-input v-model="form.typeName" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="分组名称" prop="groupName">
            <el-select
              v-model="form.groupName"
              :style="{width: '100%'}"
              filterable
              allow-create
              default-first-option>
              <el-option
                v-for="dict in groupNameOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="类型单位" prop="unit">
            <el-input v-model="form.unit" placeholder="请输入单位" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="积分值" prop="rewardPoint">
            <el-input-number v-model="form.rewardPoint" controls-position="right" :controls="true" :precision="0"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="显示顺序" prop="orderIndex">
            <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.id"
                :value="dict.id"
              >{{dict.text}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="月分析" prop="monthStat">
            <el-switch
              v-model="form.monthStat">
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="年分析" prop="yearStat">
            <el-switch
              v-model="form.yearStat">
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="8H+分析" prop="overWorkStat">
            <el-switch
              v-model="form.overWorkStat">
            </el-switch>
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

<script setup name="CommonDataTypeForm">
  import { createCommonDataType, editCommonDataType, getCommonDataType,getGroupNameTree } from "@/api/commonData/commonDataType";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('通用类型');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const statusOptions = ref(proxy.commonStatusOptions);
  const groupNameOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      typeName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      groupName: [
        { required: true, message: "分组名称不能为空", trigger: "blur" }
      ],
      unit: [
        { required: true, message: "单位不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "排序号不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ],
      monthStat: [
        { required: true, message: "加入月分析图表不能为空", trigger: "blur" }
      ],
      yearStat: [
        { required: true, message: "加入年分析图表不能为空", trigger: "blur" }
      ],
      overWorkStat: [
        { required: true, message: "加入八小时外分析不能为空", trigger: "blur" }
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
        getCommonDataType(id).then(response => {
          form.value = response;
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
    getGroupNameTree().then(response => {
      groupNameOptions.value = response;
    });
  }
  
  // 表单重置
  function resetForm() {
    form.value = {
      typeId: undefined,
      typeName:undefined,
      groupName:undefined,
      status:'ENABLE',
      orderIndex:1,
      monthStat : false,
      yearStat : true,
      overWorkStat : false,
      rewardPoint:0
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.typeId != undefined) {
          editCommonDataType(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createCommonDataType(form.value).then(response => {
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