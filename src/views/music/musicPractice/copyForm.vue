<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="450px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-form-item label="选择乐器" prop="musicInstrumentId">
        <el-select
          v-model="form.instrumentId"
          placeholder="乐器"
          clearable
          style="width: 200px">
          <el-option
            v-for="dict in instrumentOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-tooltip content="不选则代表全部" effect="dark" placement="top">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="模板日期" prop="templateDate">
        <el-date-picker type="date" v-model="form.templateDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
          :style="{width: '200px'}" placeholder="请选择时间" clearable>
        </el-date-picker>
      </el-form-item>
      <el-form-item label="开始时间" prop="beginTime">
        <el-date-picker type="datetime" v-model="form.beginTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
          :style="{width: '200px'}" placeholder="请选择时间" clearable>
        </el-date-picker>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer" align="right">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button type="danger" @click="open=false">关 闭</el-button>
      </div>
    </template>

  </el-dialog>

</template>

<script setup name="MusicPracticeForm">
  import { copyMusicPractice } from "@/api/music/musicPractice";
  import { getInstrumentTree } from "@/api/music/instrument";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('音乐练习');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const instrumentOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      templateDate: [
        { required: true, message: "模版日期不能为空", trigger: "blur" }
      ],
      beginTime: [
        { required: true, message: "开始时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (mp) => {
    open.value = true;
    resetForm();
    if(mp!=null){
      form.value.instrumentId = mp.instrument.instrumentId;
      form.value.templateDate = mp.practiceDate;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      instrumentId: undefined,
      templateDate: undefined,
      beginTime: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$modal.loading("正在处理数据，请稍候！");
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        copyMusicPractice(form.value).then(response => {
          proxy.$modal.closeLoading();
          proxy.$modal.msgSuccess("复制成功");
          open.value = false;
          // 发送操作成功的事件
          emit('success');
        });
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