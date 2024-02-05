<template>
  <div class="app-container">
    <!-- 对话框 -->
    <el-dialog :title="title" v-model="open" width="450px" append-to-body>
      <el-form :model="nameStatParams" ref="nameStatParamsRef" :inline="true">
        <el-form-item label="数据来源" prop="allMi">
          <el-select
            v-model="nameStatParams.allMi"
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
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['music:musicPracticeDetail:nameStat']">统计</el-button>
        </el-form-item>
      </el-form>
      <el-divider content-position="center">
        <span class="table-title">
          <svg-icon icon-class="budget" />
          统计数据
        </span>
      </el-divider>
      <el-descriptions class="margin-top" :column="1" border v-loading="loading">
        <el-descriptions-item  width="150px">
          <template #label>
            <div class="cell-item">
              <el-icon>
                <Clock />
              </el-icon>
              曲子名称
            </div>
          </template>
          {{ statData.tune}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <Clock />
              </el-icon>
              首次练习时间
            </div>
          </template>
          {{ statData.minPracticeDate+' ('+formatDays(dateDiff(getDay(0),statData.minPracticeDate))+')'}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <Clock />
              </el-icon>
              最后练习时间
            </div>
          </template>
          {{ statData.maxPracticeDate+' ('+formatDays(dateDiff(getDay(0),statData.maxPracticeDate))+')'}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <GoodsFilled />
              </el-icon>
              练习间隔
            </div>
          </template>
          {{ formatDays(dateDiff(statData.minPracticeDate,statData.maxPracticeDate))}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <GoodsFilled />
              </el-icon>
              练习天数
            </div>
          </template>
          {{ statData.totalTimes}}天
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <GoodsFilled />
              </el-icon>
              总练习次数
            </div>
          </template>
          {{ statData.totalTimes}}次
        </el-descriptions-item>

      </el-descriptions>

    </el-dialog>
  </div>
</template>

<script setup name="MusicPracticeNameStat">
  import { getMusicPracticeNameStat } from "@/api/music/musicPracticeDetail";
  import { dateDiff, formatDays,getDay } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();
  const allMiOptions = ref([
    {
      id: false,
      text: '当前乐器'
    },
    {
      id: true,
      text: '所有乐器'
    }
  ]);

  //可执行时间段
  const title = ref('曲子统计');
  const open = ref(false);
  const loading = ref(false);
  const nameStatParamsRef = ref();

  const data = reactive({
    statData: {},
    nameStatParams: {
      allMi: false,
      detailId: undefined
    }
  });

  const { nameStatParams, statData } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (detailId) => {
    open.value = true;
    nameStatParams.value.detailId=detailId;
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
    statData.value={};
    loading.value = true;
    getMusicPracticeNameStat(nameStatParams.value).then(
      response => {
        loading.value = false;
        statData.value = response;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>