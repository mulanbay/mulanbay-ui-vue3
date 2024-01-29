<template>
  <!-- 参数编辑对话框 -->
  <el-dialog :title="parasEditTitle" v-model="parasEditOpen" width="600px" append-to-body>
    <FormCreate :option="peOption" v-model:api="peApi" :rule="peRule"></FormCreate>
  </el-dialog>

</template>

<script setup name="TaskTriggerParas">
  import { getParaDefine } from "@/api/schedule/taskTrigger";
  import { generateTriggerParasRules, setTriggerParasBindValues, getBindValues, setBindValues } from "@/utils/formCreateUtils";
  import { encodeJsonString } from "@/utils/mulanbay";

  //导入 form-create
  import formCreate from "@form-create/element-ui";

  //获取 formCreate 组件
  const FormCreate = formCreate.$form();
  const parasEditTitle = ref('调度参数编辑');
  const parasEditOpen = ref(false);
  const peApi = ref();

  const { proxy } = getCurrentInstance();

  const data = reactive({
    peRule: [],
    peOption: {
      onSubmit: (formData) => {
        //alert(JSON.stringify(formData));
        parasEditOpen.value = false;
        // 发送操作成功的事件
        emit('success', JSON.stringify(formData));
      },
      resetBtn: true,
      form: {
        labelPosition: 'left',
        labelWidth: '160px',
        size: undefined,
        inline: false,
        hideRequiredAsterisk: false
      },
      row: {
        type: '',
        align: '',
        gutter: 5
      }
    }
  });

  const { peRule, peOption } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openParasEdit = async (className, triggerParas) => {
    if (proxy.isEmpty(className)) {
      proxy.$modal.msgError('请先设置调度类');
      return;
    }
    parasEditOpen.value = true;
    getParaDefine(className).then(response => {
      peRule.value = generateTriggerParasRules(response.paraDefine);
      //需要重载规则，否则编辑时无法设定值
      peApi.value.reload(peRule.value);
      let tp = {};
      if (triggerParas != null) {
        tp = triggerParas;
      } else {
        //使用默认
        tp = response.defaultConfig;
      }
      setTriggerParasBindValues(tp, peApi.value);
    });

  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openParasEdit });

  /** 初始化 **/
  onMounted(() => {

  })
</script>