<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="所在公司" prop="companyId">
        <el-select
          v-model="queryParams.companyId"
          placeholder="公司"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in companyOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="起止日期" style="width: 308px">
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
      <el-form-item label="地图类型" prop="field">
        <el-select
          v-model="queryParams.field"
          placeholder="地图类型"
          style="width: 115px"
          @change="handleQuery">
          <el-option
            v-for="dict in fieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="统计类型" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="统计类型"
          style="width: 115px"
          @change="handleQuery">
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['work:businessTrip:mapStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="mapStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="BusinessTripMapStat">
  import { getBusinessTripMapStat } from "@/api/work/businessTrip";
  import { getCompanyTree } from "@/api/work/company";
  import { deepClone } from "@/utils/index";
  import * as echarts from 'echarts';
  import '@/components/echarts/map/china.js';
  import worldMap from '@/components/echarts/map/world_zh.ts';
  import { createMapChart, createLocationMapChartOption, createDefaultMapChartOption, createWorldMapChartOption } from "@/utils/mulanbay_echartsMap";

  const { proxy } = getCurrentInstance();
  //图形实例
  const mapStatChart = ref(null);
  //echarts实例
  let mapStatChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const companyOptions = ref([]);
  const fieldOptions = ref([]);
  const groupTypeOptions = ref([{
      id: 'VALUE',
      text: '天数'
    },
    {
      id: 'COUNT',
      text: '次数'
    }
  ]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      field: 'PROVINCE',
      groupType: 'VALUE'
    }
  });

  const { queryParams } = toRefs(data);

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  /** 更多查询条件处理 */
  function handleMoreCdn() {
    if (moreCdn.value == true) {
      moreCdn.value = false;
      cdnTitle.value = '更多';
    } else {
      moreCdn.value = true;
      cdnTitle.value = '取消';
    }
  }

  /** 下拉框加载 */
  function loadOptions() {
    getCompanyTree().then(response => {
      companyOptions.value = response;
    });
    proxy.getEnumDict('MapField', 'FIELD', false).then(response => {
      fieldOptions.value = response;
    });
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    initChart();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    initChart();
  }

  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    let qp = proxy.addDateRange(queryParams.value, dateRange.value);
    let acQueryParams = deepClone(qp);
    if (acQueryParams.types != null) {
      acQueryParams.types = acQueryParams.types.join(',');
    }
    getBusinessTripMapStat(acQueryParams).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        const field = queryParams.value.field;
        if (field == 'PROVINCE') {
          option = createDefaultMapChartOption(response, mapStatChartIns, echarts);
        }else if (field == 'CITY' || field == 'DISTRICT') {
          option = createLocationMapChartOption(response, mapStatChartIns);
        }else {
          echarts.registerMap('world', worldMap, {});
          option = createWorldMapChartOption(response, mapStatChartIns, echarts);
        }
        createMapChart(option, mapStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    mapStatChartIns = echarts.init(mapStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>