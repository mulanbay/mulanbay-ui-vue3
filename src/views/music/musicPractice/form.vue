<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body >
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker type="datetime" v-model="form.startTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker type="datetime" v-model="form.endTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable @change="calculateMinutes">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="练习时长" prop="minutes">
            <el-input v-model="form.minutes" style="{width: '100%'}" placeholder="练习时长">
              <template #append>分钟</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="乐器选择" prop="instrumentId">
            <el-select
              v-model="form.instrumentId"
              placeholder="乐器"
              clearable
              style="width: 240px"
              @change="handleInstrumentChange">
              <el-option
                v-for="dict in instrumentOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息">
            <el-input v-model="form.remark" type="text" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer" align="right">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button type="danger" @click="closeForm">关 闭</el-button>
      </div>
    </template>

    <!-- 表单 -->
    <DetailList ref="detailListRef" />

  </el-dialog>

</template>

<script setup name="MusicPracticeForm">
  import { createMusicPractice, editMusicPractice, getMusicPractice } from "@/api/music/musicPractice";
  import { getHourDesc, minuteDiff } from "@/utils/datetime";
  import { getInstrumentTree } from "@/api/music/instrument";
  import DetailList from '../musicPracticeDetail/index.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('音乐练习');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const detailListRef = ref();

  const instrumentOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      instrumentId: [
        { required: true, message: "乐器不能为空", trigger: "blur" }
      ],
      startTime: [
        { required: true, message: "开始时间不能为空", trigger: "blur" }
      ],
      endTime: [
        { required: true, message: "结束时间不能为空", trigger: "blur" }
      ],
      minutes: [
        { required: true, message: "练习时长不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 乐器变化 */
  function handleInstrumentChange() {
    proxy.$forceUpdate();
  }

  /** 打开弹窗 */
  const openForm = async (practiceId, type, budgetId) => {
    open.value = true;
    resetForm();
    if (practiceId != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getMusicPractice(practiceId).then(response => {
          form.value = response;
          if (response.instrument != null) {
            form.value.instrumentId = response.instrument.instrumentId;
            form.value.instrument = null;
          }
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
    }
    showDetailList(practiceId);
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 明细列表
  function showDetailList(practiceId) {
    setTimeout(function() {
      detailListRef.value.showData(practiceId);
    }, 500);

  }

  // 表单重置
  function resetForm() {
    form.value = {
      practiceId: undefined,
      minutes: undefined,
      startTime: undefined,
      endTime: undefined,
      remark: undefined
    };
    proxy.resetForm("formRef");
  }

  //计算时长
  function calculateMinutes() {
    let startTime = form.value.startTime;
    let endTime = form.value.endTime;
    let minutes = minuteDiff(startTime, endTime).toFixed(0);
    form.value.minutes = minutes;
  }
  
  /** 关闭按钮 */
  function closeForm() {
    open.value = false;
    // 发送操作成功的事件
    emit('success');
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.practiceId != undefined) {
          editMusicPractice(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            //open.value = false;
            // 发送操作成功的事件
            //emit('success');
          });
        } else {
          createMusicPractice(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            //open.value = false;
            // 发送操作成功的事件
            //emit('success');
            showDetailList(response.practiceId);
          });
        }
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {
    getInstrumentTree(false, false).then(response => {
      instrumentOptions.value = response;
    });
  })
</script>