<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="年份选择" prop="years">
        <el-select
          v-model="queryParams.years"
          placeholder="年份选择"
          clearable
          multiple
          collapse-tags
          style="width: 240px">
          <el-option
            v-for="dict in yearsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="统计分类" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分类"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-select
          v-model="queryParams.groupType"
          placeholder="字段"
          style="width: 115px">
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
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
      <el-form-item v-if="moreCdn==true" label="消费类型" prop="consumeType">
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
          v-model="queryParams.secondhand"
          placeholder="二手"
          clearable
          style="width: 115px">
          <el-option
            v-for="dict in secondhandOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="价格区间">
        <el-input-number v-model="queryParams.startTotalPrice" clearable :min="0" label="最低价格" style="width: 120px"></el-input-number>
        <el-input-number v-model="queryParams.endTotalPrice" clearable :min="0" label="最高价格" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['consume:consume:yoyStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="yoyStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="ConsumeYoyStat">
  import { getConsumeYoyStat } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import { getYearList } from "@/api/common";
  import { deepClone } from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createLineChartOption, createCalenderHeatMapChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const yoyStatChart = ref(null);
  //echarts实例
  let yoyStatChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const dateGroupTypeOptions = ref([]);
  const yearsOptions = ref([]);
  const consumeTypeOptions = ref([]);
  const groupTypeOptions = ref([]);
  const secondhandOptions = ref([]);

  const data = reactive({
    queryParams: {
      name: undefined,
      dateGroupType: 'MONTH',
      groupType: 'TOTALPRICE'
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
    getYearList().then(response => {
      yearsOptions.value = response;
    });
    proxy.getDictItemTree('CHART_YOY_DATE_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
    });
    proxy.getEnumDict('GoodsConsumeType', 'ORDINAL', false).then(response => {
      consumeTypeOptions.value = response;
    });
    proxy.getDictItemTree('CONSUME_YOY_GROUP_FIELD', false).then(response => {
      groupTypeOptions.value = response;
    });
    proxy.getDictItemTree('SECONDHAND', false).then(response => {
      secondhandOptions.value = response;
    });

  }

  /** 修改图表类型 */
  function changeChartType(newVal) {
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
    const dateGroupType = queryParams.value.dateGroupType;
    let years = queryParams.value.years;
    if (years == null || years.length == 0) {
      proxy.$modal.msgError("请选择至少两个年份");
      return;
    }
    if (dateGroupType == 'DAY' && years.length != 2) {
      proxy.$modal.msgError("按天统计，年份个数只支持两个");
      return;
    }
    //转换多选框的中挂号问题
    var acQueryParams = deepClone(queryParams.value);;
    acQueryParams.years = acQueryParams.years.join(',');
    proxy.$modal.loading("正在加载数据，请稍候！");
    getConsumeYoyStat(acQueryParams).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        //组装chart数据
        if (dateGroupType == 'DAY') {
          option = createCalenderHeatMapChartOption(response, echarts);
        } else {
          option = createLineChartOption(response);
        }
        createChart(option, yoyStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    yoyStatChartIns = echarts.init(yoyStatChart.value, "macarons");
    //initChart();
    loadOptions();
  })
</script>