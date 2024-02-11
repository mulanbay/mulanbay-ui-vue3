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
      <el-form-item v-show="moreCdn==true" label="名称检索" prop="roleName">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="商品类型" prop="goodsTypeId">
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
      <el-form-item v-show="moreCdn==true" label="购买来源" prop="sourceId">
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
      <el-form-item label="排序方式" prop="orderByField">
        <el-select
          v-model="queryParams.orderByField"
          placeholder="方式"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in orderByFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="商品标签" prop="tags">
        <el-select
          v-model="queryParams.tags"
          placeholder="商品标签"
          clearable
          style="width: 240px"
          @change="handleQuery">
          <el-option
            v-for="dict in tagsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['consume:consume:goodsSimilarity']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
        <el-tooltip content="值越大说明相似度越高,则消费习惯越单一." effect="dark" placement="top">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="goodsSimilarityChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="ConsumeGoodsSimilarity">
  import { getGoodsSimilarity, getConsumeTagsTree } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import * as echarts from 'echarts';
  import { createChart, createGaugeChartOption } from "@/utils/mulanbay_echarts";
  import 'echarts-wordcloud';

  const { proxy } = getCurrentInstance();
  //图形实例
  const goodsSimilarityChart = ref(null);
  //echarts实例
  let goodsSimilarityChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const orderByFieldOptions = ref([]);
  const tagsOptions = ref([]);
  const consumeTypeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      name: undefined,
      orderByField: 'goods_name'
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
    proxy.getDictItemTree('CONSUME_GOODS_SIMI_ORDER_FIELD', false).then(response => {
      orderByFieldOptions.value = response;
    });
    proxy.getEnumDict('GoodsConsumeType', 'ORDINAL', false).then(response => {
      consumeTypeOptions.value = response;
    });
    getConsumeTagsTree(null, null, false).then(response => {
      tagsOptions.value = response;
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
    proxy.$modal.loading("正在加载数据，请稍候！");
    getGoodsSimilarity(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        let data = {};
        data.value = (response * 100).toFixed(0);
        data.name = '商品重复度';
        data.title = '商品重复度';
        //组装chart数据
        let option = createGaugeChartOption(data);
        createChart(option, goodsSimilarityChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    goodsSimilarityChartIns = echarts.init(goodsSimilarityChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>