<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="统计分组" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="字段"
          style="width: 120px">
          <el-option
            v-for="dict in groupFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-select
          v-model="queryParams.type"
          placeholder="方式"
          style="width: 115px">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="名称检索" prop="roleName">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
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
      <el-form-item v-if="moreCdn==true" label="商品类型" prop="goodsTypeId">
        <el-tree-select
          v-model="queryParams.goodsTypeId"
          style="width: 240px"
          :data="goodsTypeOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择商品类型"
          check-strictly
          clearable />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="购买来源" prop="sourceId">
        <el-select
          v-model="queryParams.sourceId"
          placeholder="购买来源"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in sourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="消费类型" prop="consumeType">
        <el-select
          v-model="queryParams.consumeType"
          placeholder="方式"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in consumeTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-select
          v-model="queryParams.chartType"
          placeholder="图表类型"
          style="width: 115px"
          @change="changeChartType">
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="上层分组" v-if="queryParams.groupField=='goods_type_id'" prop="groupTop">
        <el-switch v-model="queryParams.groupTop" ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['consume:consume:analyseStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="analyseStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="ConsumeAnalyseStat">
  import { getConsumeAnalyseStat } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import * as echarts from 'echarts';
  import { createChart, createBarChartOption, createPieChartOption, createTreeMapChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const analyseStatChart = ref(null);
  //echarts实例
  let analyseStatChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const typeOptions = ref([]);
  const groupFieldOptions = ref([]);
  const consumeTypeOptions = ref([]);
  const chartTypeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      name: undefined,
      chartType: 'TREE_MAP',
      groupField: 'goods_type_id',
      type: 'TOTALPRICE',
      groupTop: true
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
    getConsumeSourceTree().then(response => {
      sourceOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
    proxy.getDictItemTree('CONSUME_ANALYSE_STAT_CHART_TYPE', false).then(response => {
      chartTypeOptions.value = response;
    });
    proxy.getDictItemTree('CONSUME_GROUP_FIELD', false).then(response => {
      groupFieldOptions.value = response;
    });
    proxy.getDictItemTree('CONSUME_ANALYSE_STAT_GROUP_TYPE', false).then(response => {
      typeOptions.value = response;
    });
    proxy.getEnumDict('GoodsConsumeType', 'ORDINAL', false).then(response => {
      consumeTypeOptions.value = response;
    });
  }

  /** 修改图表类型 */
  function changeChartType(newVal) {
    if (newVal == 'TREE_MAP') {
      queryParams.value.groupField = 'goods_type_id';
    } else if (newVal == 'RADAR') {

    }
    handleQuery();
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
    getConsumeAnalyseStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        let chartType = queryParams.value.chartType;
        if (chartType == 'BAR') {
          option = createBarChartOption(response);
        } else if (chartType == 'PIE') {
          option = createPieChartOption(response);
        } else if (chartType == 'TREE_MAP') {
          option = createTreeMapChartOption(response, echarts);
        }
        createChart(option, analyseStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    analyseStatChartIns = echarts.init(analyseStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>