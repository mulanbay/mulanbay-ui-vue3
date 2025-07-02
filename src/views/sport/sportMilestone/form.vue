<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="450px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="100px">
      <el-form-item label="运动类型" prop="sportId">
        <el-select
          v-model="form.sportId"
          placeholder="运动类型"
          clearable
          @change="handleSportChange"
        >
          <el-option
            v-for="dict in sportOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="里程碑名称" prop="milestoneName">
        <el-input v-model="form.milestoneName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="里程碑别名" prop="alais">
        <el-input v-model="form.alais" placeholder="请输入别名" />
      </el-form-item>
      <el-form-item label="锻炼值" prop="value">
				<el-input-number v-model="form.value" style="width: 100%;" controls-position="right" :min="0" :controls="true" :precision="2">
					<template #suffix>
						<el-tooltip content="达到该里程碑需要锻炼值大于等于该值." effect="dark" placement="top">
						  <el-icon>
								{{ sportUnit }}
						  </el-icon>
						</el-tooltip>
					</template>
				</el-input-number>
      </el-form-item>
      <el-form-item label="锻炼时长" prop="duration">
				<el-input-number v-model="form.duration" style="width: 100%;" controls-position="right" :min="0" :controls="true" :precision="0">
					<template #suffix>
						<el-tooltip content="时长如果大于等于0，那么达到该里程碑需要锻炼时长小于等于该值." effect="dark" placement="top">
						  <el-icon>
								分钟
						  </el-icon>
						</el-tooltip>
					</template>
				</el-input-number>
      </el-form-item>
      <el-form-item label="排序号" prop="orderIndex">
				<el-input-number v-model="form.orderIndex" style="width: 100%;" controls-position="right" :min="0" :controls="true" :precision="0" :disabled="true">
				</el-input-number>
      </el-form-item>
      <el-form-item label="备注信息">
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

<script setup name="SportMilestoneForm">
  import { createSportMilestone, editSportMilestone, getSportMilestone } from "@/api/sport/sportMilestone";
  import { getSportTree } from "@/api/sport/sport";
  import { getSport } from "@/api/sport/sport";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('运动里程碑');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const sportUnit = ref('公里');
  const sportOptions = ref([]);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      milestoneName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      value: [
        { required: true, message: "锻炼值不能为空", trigger: "blur" }
      ],
      duration: [
        { required: true, message: "锻炼时长不能为空", trigger: "blur" }
      ],
      sportId: [
        { required: true, message: "运动类型不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id,type,tt) => {
    open.value = true;
    resetForm();
    loadSportTree();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getSportMilestone(id).then(response => {
        formLoading.value = false;
        form.value = response;
        form.value.sportId = response.sport.sportId;
        sportUnit.value = response.sport.unit;
      });
    } else {
      title.value = "新增";
    }
    if(tt!=null){
      title.value = tt;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  function handleSportChange(){
    getSport(form.value.sportId).then(response => {
      sportUnit.value = response.unit;
    });
  }
  
  function loadSportTree(){
    getSportTree().then(
      response => {
        sportOptions.value = response;
      }
    );
  }
  
  // 表单重置
  function resetForm() {
    form.value = {
      milestoneId: undefined,
      milestoneName: undefined,
      sportId:undefined,
      alais:undefined,
      value:undefined,
      duration:undefined,
      orderIndex:undefined,
      remark:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.milestoneId != undefined) {
          editSportMilestone(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createSportMilestone(form.value).then(response => {
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