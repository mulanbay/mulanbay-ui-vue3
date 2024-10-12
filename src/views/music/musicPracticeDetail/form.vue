<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="曲子类型" prop="tuneType">
        <el-select
          v-model="form.tuneType"
          :style="{width: '100%'}"
          default-first-option
          @change="handleTuneTypeChange">
          <el-option
            v-for="dict in tuneTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="tuneLable" prop="tune">
        <el-select
          v-model="form.tune"
          :style="{width: '100%'}"
          filterable
          allow-create
          default-first-option>
          <el-option
            v-for="dict in tuneOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="timesLable" prop="times">
        <el-input-number v-model="form.times" controls-position="right" :min="0" :controls="true" :precision="0" />
        {{unit}}
      </el-form-item>
      <el-form-item label="练习水平" prop="level">
        <el-select
          v-model="form.level"
          :style="{width: '100%'}"
          default-first-option>
          <el-option
            v-for="dict in levelOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注信息">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"></el-input>
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

<script setup name="MusicPracticeDetailForm">
  import { createMusicPracticeDetail, editMusicPracticeDetail, getMusicPracticeDetail } from "@/api/music/musicPracticeDetail";
  import { getTuneTree } from "@/api/music/musicPracticeDetail";
  import { ElNotification } from 'element-plus'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('乐器');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const levelOptions = ref([]);
  const tuneTypeOptions = ref([]);
  const tuneOptions = ref([]);

  const unit = ref('遍');
  const tuneLable = ref('曲子名称');
  const timesLable = ref('练习时长');

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      practiceId: [
        { required: true, message: "先保存练习记录", trigger: "blur" }
      ],
      tuneType: [
        { required: true, message: "练习类型不能为空", trigger: "blur" }
      ],
      level: [
        { required: true, message: "水平不能为空", trigger: "blur" }
      ],
      tune: [
        { required: true, message: "曲子/技术名称不能为空", trigger: "blur" }
      ],
      times: [
        { required: true, message: "练习次数/分钟不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (detailId, type, practiceId) => {
    open.value = true;
    resetForm();
    if (detailId != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getMusicPracticeDetail(detailId).then(response => {
          form.value = response;
          form.value.practiceId = response.practice.practiceId;
          form.value.practice = null;
          if (practiceId != form.value.practiceId) {
            ElNotification({
              title: '警告',
              message: h('i', { style: 'color: teal' }, '表单中的父级练习编号与列表查询的练习编号对应不上，可能是不同页面跳转过来引起'),
            })
          }
          handleTuneTypeChange();
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
      form.value.practiceId = practiceId;
      handleTuneTypeChange();
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 类型改变 */
  function handleTuneTypeChange() {
    if (form.value.tuneType == 'TUNE') {
      unit.value = '遍';
      tuneLable.value = '曲子名称';
      timesLable.value = '练习时长';
    } else {
      unit.value = '分钟';
      tuneLable.value = '曲子名称';
      timesLable.value = '练习时长';
    }
    loadTuneTree(form.value.tuneType);
  }

  /** 加载曲子列表按钮 */
  function loadTuneTree(tuneType) {
    getTuneTree(tuneType).then(response => {
      tuneOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      detailId: undefined,
      practiceId: undefined,
      tune: undefined,
      level: 'PRACTICE',
      tuneType: 'TUNE',
      remark: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.detailId != undefined) {
          editMusicPracticeDetail(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createMusicPracticeDetail(form.value).then(response => {
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
    proxy.getEnumDict('TuneLevel', 'FIELD', false).then(response => {
      levelOptions.value = response;
    });
    proxy.getEnumDict('TuneType', 'FIELD', false).then(response => {
      tuneTypeOptions.value = response;
    });
  })
</script>