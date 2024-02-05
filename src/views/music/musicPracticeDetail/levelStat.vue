<template>
  <div class="app-container">
    <!-- 对话框 -->
    <el-dialog :title="title" v-model="open" width="450px" append-to-body>
      <el-form :model="levelStatParams" ref="levelStatParamsRef" :inline="true">
        <el-form-item label="数据来源" prop="allMi">
          <el-select
            v-model="levelStatParams.allMi"
            placeholder="数据来源"
            style="width: 120px">
            <el-option
              v-for="dict in allMiOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['music:musicPracticeDetail:levelStat']">统计</el-button>
        </el-form-item>
      </el-form>
      <el-divider content-position="center">
        <span class="table-title">
          <svg-icon icon-class="budget" />
          统计数据
        </span>
      </el-divider>
      <el-timeline v-loading="loading">
        <template v-for="item in dataList">
          <el-timeline-item :timestamp="item.date" :type="item.type" placement="top">
            {{ item.levelName }}
          </el-timeline-item>
        </template>
      </el-timeline>

    </el-dialog>
  </div>
</template>

<script setup name="MusicPracticeNameStat">
  import { getMusicPracticeLevelStat } from "@/api/music/musicPracticeDetail";
  import { dateDiff, formatDays, getDay } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();
  const allMiOptions = ref([{
      id: false,
      text: '当前乐器'
    },
    {
      id: true,
      text: '所有乐器'
    }
  ]);

  //可执行时间段
  const title = ref('水平统计');
  const open = ref(false);
  const loading = ref(false);
  const levelStatParamsRef = ref();

  const data = reactive({
    dataList: [],
    levelStatParams: {
      allMi: false,
      detailId: undefined
    }
  });

  const { levelStatParams, dataList } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (detailId) => {
    open.value = true;
    levelStatParams.value.detailId = detailId;
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {

  }

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
  }

  /** 获取数据 **/
  function getList() {
    dataList.value = [];
    loading.value = true;
    getMusicPracticeLevelStat(levelStatParams.value).then(
      response => {
        loading.value = false;
        let ds = new Array();
        const n = response.length;
        let lastDate = response[0].minPracticeDate;
        for (let i = 0; i < n; i++) {
          let dd = response[i];
          if (i > 0 && n > 1) {
            let days = dateDiff(lastDate, dd.minPracticeDate);
            let timeRow = {
              type: 'success',
              levelName: null,
              date: formatDays(days)
            };
            ds.push(timeRow);
          }
          let row = {
            type: 'primary',
            levelName: 'Level:'+ (dd.levelName == null ? '未知' : dd.levelName),
            date: dd.minPracticeDate
          };
          ds.push(row);
          lastDate = dd.minPracticeDate;
        }
        dataList.value = ds;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>