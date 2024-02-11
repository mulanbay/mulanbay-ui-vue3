<template>

  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="850px" append-to-body>
    <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
      <el-form-item label="运动类型" prop="sportId">
        <el-select
          v-model="queryParams.sportId"
          placeholder="运动"
          style="width: 120px">
          <el-option
            v-for="dict in sportOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="锻炼日期" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          unlink-panels
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="datePickerOptions"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['sport:exercise:multiStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column label="类别">
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最大值" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleMultiExerciseInfo(scope.row.groupType,'MAX')">{{ scope.row.maxValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最小值" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleMultiExerciseInfo(scope.row.groupType,'MIN')">{{ scope.row.minValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平均值" align="center">
        <template #default="scope">
          <span>{{ scope.row.avgValue }}</span>
        </template>
      </el-table-column>
    </el-table>

  </el-dialog>

  <!-- 表单 -->
  <ExerciseForm ref="formRef" />

</template>

<script setup name="CalendarStat">
  import { getExerciseMultiStat, getExerciseByMultiStat } from "@/api/sport/exercise";
  import { getSportTree } from "@/api/sport/sport";
  import { formatFloat } from "@/utils/mulanbay";
  import ExerciseForm from './form.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('锻炼数据统计');
  const open = ref(false);
  const formRef = ref();
  const sportOptions = ref([]);
  const dataList = ref([]);
  const loading = ref(false);
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    queryParams: {},
    rules: {
      sportId: [
        { required: false, message: "运动类型不能为空", trigger: "blur" }
      ]
    }
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (sportId) => {
    open.value = true;
    resetForm();
    loadSportTree();
    if (sportId != null) {
      queryParams.value.sportId = sportId;
    }
    //getList();
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    getList();
  }


  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 加载树 */
  function loadSportTree() {
    getSportTree(false).then(response => {
      sportOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    queryParams.value = {
      sportId: undefined
    };
    proxy.resetForm("queryRef");
  }

  /** 查询详情 */
  function handleMultiExerciseInfo(groupType, type) {
    let para = {
      groupType: groupType,
      type: type,
      sportId: queryParams.value.sportId
    }
    getExerciseByMultiStat(para).then(response => {
      if (response == null) {
        proxy.$modal.msgError("没有相关数据");
        return;
      }else{
        formRef.value.openForm(response);
      }
    });
  }

  /** 提交表单 */
  function getList() {
    loading.value = true;
    getExerciseMultiStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        loading.value = false;
        let ds = new Array();
        let kmName = '锻炼值(' + response.unit + ')';
        let kilometresRow = {
          name: kmName,
          groupType: 'VALUE',
          maxValue: response.maxValue,
          minValue: response.minValue,
          avgValue: formatFloat(response.avgValue, 2)
        };
        ds.push(kilometresRow);
        let minutesRow = {
          name: '锻炼时间(分钟)',
          groupType: 'DURATION',
          maxValue: response.maxDuration,
          minValue: response.minDuration,
          avgValue: formatFloat(response.avgDuration, 2)
        };
        ds.push(minutesRow);
        let speedRow = {
          name: '平均速度(公里/小时)',
          groupType: 'SPEED',
          maxValue: response.maxSpeed,
          minValue: response.minSpeed,
          avgValue: formatFloat(response.avgSpeed, 2)
        };
        ds.push(speedRow);
        let maxSpeedRow = {
          name: '最佳速度(公里/小时)',
          groupType: 'MAX_SPEED',
          maxValue: response.maxMaxSpeed,
          minValue: response.minMaxSpeed,
          avgValue: formatFloat(response.avgMaxSpeed, 2)
        };
        ds.push(maxSpeedRow);
        let paceRow = {
          name: '平均配速(分钟/公里)',
          groupType: 'PACE',
          maxValue: response.maxPace,
          minValue: response.minPace,
          avgValue: formatFloat(response.avgPace, 2)
        };
        ds.push(paceRow);
        let maxPaceRow = {
          name: '最佳配速(分钟/公里)',
          groupType: 'MAX_PACE',
          maxValue: response.maxMaxPace,
          minValue: response.minMaxPace,
          avgValue: formatFloat(response.avgMaxPace, 2)
        };
        ds.push(maxPaceRow);
        let maxHeartRateRow = {
          name: '最高心率(次/分钟)',
          groupType: 'MAX_HEART_RATE',
          maxValue: response.maxMaxHeartRate,
          minValue: response.minMaxHeartRate,
          avgValue: formatFloat(response.avgMaxHeartRate, 2)
        };
        ds.push(maxHeartRateRow);
        let avgHeartRateRow = {
          name: '平均心率(次/分钟)',
          groupType: 'AVG_HEART_RATE',
          maxValue: response.maxAvgHeartRate,
          minValue: response.minAvgHeartRate,
          avgValue: formatFloat(response.avgAvgHeartRate, 2)
        };
        ds.push(avgHeartRateRow);
        dataList.value = ds;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>