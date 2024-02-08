<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="运动类型" prop="sportId">
             <el-select
               v-model="form.sportId"
               placeholder="运动类型"
               clearable
               collapse-tags
               style="width: 200px"
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
        </el-col>
        <el-col :span="12">
          <el-form-item label="锻炼时间" prop="exerciseTime">
            <el-date-picker type="datetime" v-model="form.exerciseTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                      :style="{width: '200px'}" placeholder="请选择时间" >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="锻炼值" prop="value">
           <el-input-number v-model="form.value" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
           <span>{{ sportUnit }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="锻炼时长" prop="duration">
           <el-input-number v-model="form.duration" :style="{width: '200px'}" placeholder="单位:分钟" controls-position="right" :min="0" :controls="false" :precision="0" />
           分钟
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="平均配速" prop="pace">
           <el-input-number v-model="form.pace" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
           分钟/公里
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最佳配速" prop="maxPace">
           <el-input-number v-model="form.maxPace" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
           分钟/公里
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="平均速度" prop="speed">
           <el-input-number v-model="form.speed" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
           公里/小时
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最佳速度" prop="maxSpeed">
           <el-input-number v-model="form.maxSpeed" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
           公里/小时
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="平均心率" prop="avgHeartRate">
           <el-input-number v-model="form.avgHeartRate" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
           次/分钟
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大心率" prop="maxHeartRate">
           <el-input-number v-model="form.maxHeartRate" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
           次/分钟
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

</template>

<script setup name="ExerciseForm">
  import { createExercise, editExercise, getExercise } from "@/api/sport/exercise";
  import { getSportTree } from "@/api/sport/sport";
  import { getSport } from "@/api/sport/sport";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('运动里程碑');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const sportUnit = ref('公里');
  const sportOptions = ref([]);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      exerciseTime: [
        { required: true, message: "锻炼时间不能为空", trigger: "blur" }
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
  const openForm = async (id,type) => {
    open.value = true;
    resetForm();
    loadSportTree();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getExercise(id).then(response => {
        formLoading.value = false;
        form.value = response;
        form.value.sportId = response.sport.sportId;
        sportUnit.value = response.sport.unit;
      });
    } else {
      title.value = "新增";
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
      exerciseId: undefined,
      exerciseTime: undefined,
      speed: 0,
      maxSpeed:0,
      pace:0,
      maxPace:0,
      maxHeartRate:0,
      avgHeartRate : 0
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.exerciseId != undefined) {
          editExercise(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createExercise(form.value).then(response => {
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