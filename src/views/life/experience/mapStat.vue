<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
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
      <el-form-item v-if="moreCdn==true" label="所呆天数">
        <el-input-number v-model="queryParams.minDays" clearable :min="0" label="" style="width: 120px">
        </el-input-number>
        <el-input-number v-model="queryParams.maxDays" clearable :min="0" label="" style="width: 120px">
        </el-input-number>
      </el-form-item>
      <el-form-item v-if="moreCdn==true&&'LC_NAME'==queryParams.mapType" label="经历类型" prop="types">
        <el-select
          v-model="queryParams.types"
          placeholder="类型"
          clearable
          multiple
          collapse-tags
          style="width: 240px">
          <el-option
            v-for="dict in typesOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="地图类型" prop="mapType">
        <el-select
          v-model="queryParams.mapType"
          placeholder="地图类型"
          style="width: 115px"
          @change="handleQuery">
          <el-option
            v-for="dict in mapTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="统计类型" prop="statType">
        <el-select
          v-model="queryParams.statType"
          placeholder="统计类型"
          style="width: 115px"
          @change="handleQuery">
          <el-option
            v-for="dict in statTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['life:experience:mapStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="mapStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="ExperienceMapStat">
  import { getExperienceMapStat } from "@/api/life/experience";
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

  const typesOptions = ref([]);
  const mapTypeOptions = ref([]);
  const statTypeOptions = ref([{
      id: 'DAYS',
      text: '天数'
    },
    {
      id: 'COUNT',
      text: '次数'
    },
    {
      id: 'COST',
      text: '花费'
    }
  ]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      mapType: 'CHINA',
      statType: 'COUNT'
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
    proxy.getDictItemTree('STAT_MAP_TYPE', false).then(response => {
      mapTypeOptions.value = response;
    });
    proxy.getEnumDict('ExperienceType', 'ORDINAL', false).then(response => {
      typesOptions.value = response;
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
    getExperienceMapStat(acQueryParams).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        const mapType = queryParams.value.mapType;
        if (mapType == 'LOCATION' || mapType == 'LC_NAME') {
          option = createLocationMapChartOption(response, mapStatChartIns);
        } else if (mapType == 'WORLD') {
          echarts.registerMap('world', worldMap, {});
          option = createWorldMapChartOption(response, mapStatChartIns, echarts);
        } else {
          option = createDefaultMapChartOption(response, mapStatChartIns, echarts);
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