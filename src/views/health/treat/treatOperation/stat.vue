<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body class="customDialogCss">
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
        <el-form-item label="分组类型" prop="groupField">
          <el-select
            v-model="queryParams.groupField"
            placeholder="分组"
            clearable
            style="width: 100px"
            @change="handleQuery">
            <el-option
              v-for="dict in groupFieldOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="手术日期" style="width: 308px">
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
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:treat:treatOperation:stat']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!--列表数据-->
      <el-table v-loading="loading" :data="dataList" :row-class-name="tableRowClassName">
        <el-table-column label="手术名称" fixed="left" min-width="160" :show-overflow-tooltip="true">
          <template #default="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="次数" align="center" width="60">
          <template #default="scope">
            <span>{{ scope.row.totalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="花费" align="center" width="110">
          <template #default="scope">
            <span>{{ formatMoney(scope.row.totalFee) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最早时间" align="center" width="110">
          <template #default="scope">
            <span>{{ scope.row.minDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最晚时间" align="center" width="110">
          <template #default="scope">
            <span>{{ scope.row.maxDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时长" align="center" width="110" :show-overflow-tooltip="true">
          <template #default="scope">
            <span>{{ scope.row.daysDesc }}</span>
          </template>
        </el-table-column>
        <el-table-column label="频率" align="center" width="110">
          <template #default="scope">
            <span>
              <el-tag :type="scope.row.type">{{ scope.row.frequence }}</el-tag>
            </span>
          </template>
        </el-table-column>
      </el-table>

    </div>
  </el-dialog>

</template>

<script setup name="TreatOperationStat">
  import { getTreatOperationStat } from "@/api/health/treat/treatOperation";
  import { formatDays, dateDiff } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  const title = ref('手术统计');
  const open = ref(false);
  const formRef = ref();
  const loading = ref(false);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const groupFieldOptions = ref([{
      id: 'operation_name',
      text: '名称'
    },
    {
      id: 'category',
      text: '分类'
    }
  ]);
  const dataList = ref([]);

  const data = reactive({
    queryParams: {
      groupField: 'operation_name'
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async () => {
    open.value = true;
    title.value = '手术统计';
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  function tableRowClassName({ row, rowIndex }) {
    if (row.sum == true) {
      return 'sum-row';
    } else {
      return ''
    }
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

  // 表单重置
  function resetForm() {
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function getList() {
    loading.value = true;
    getTreatOperationStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        dataList.value = new Array();
        const n = response.length;
        for (var i = 0; i < n; i++) {
          let name = response[i].name == null ? '未知' : response[i].name;
          let sum = false;
          let daysDesc = '';
          let frequence = '';
          let type = '';
          if (i == n - 1) {
            sum = true;
          } else {
            let days = dateDiff(response[i].minDate, response[i].maxDate);
            if(days<=0){
              //默认设置为一天
              days=1;
            }
            daysDesc = formatDays(days);
            frequence = days / 365 / response[i].totalCount;
            if (frequence < 1 / (12 * 30)) {
              frequence = (days / response[i].totalCount).toFixed(1) + '天/次';
              type = 'danger';
            } else if (frequence < 1) {
              frequence = (frequence * 12).toFixed(1) + '月/次';
              type = '';
            } else {
              frequence = frequence.toFixed(1) + '年/次'
              type = 'success';
            }
          }
          let row = {
            name: name,
            totalCount: response[i].totalCount,
            totalFee: response[i].totalFee,
            sum: sum,
            minDate: response[i].minDate,
            maxDate: response[i].maxDate,
            daysDesc: daysDesc,
            frequence: frequence,
            type: type
          };
          dataList.value.push(row);
        }
        loading.value = false;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {})
</script>
<style>
  .el-table .sum-row {
    background: #f0f9eb;
  }
</style>
