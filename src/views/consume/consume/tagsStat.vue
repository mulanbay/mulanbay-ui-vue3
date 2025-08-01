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
      <el-form-item label="商品标签" prop="tags">
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
					<template #footer>
						<el-tag type="success">{{tagQueryTime}}</el-tag>
						<el-button size="small" type="primary" icon="DArrowLeft" @click="loadTagOptions(-1)">往前</el-button>
						<el-button size="small" type="primary" icon="DArrowRight" @click="loadTagOptions(1)">往后</el-button>
					</template>
        </el-select>
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
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['consume:consume:tagsStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="tagsStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="ConsumeTagsStat">
  import { getConsumeTagsStat, getConsumeTagsDetailStat, getConsumeTagsTree } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import { getNowDateTimeString, getDayByDate,getDay } from "@/utils/datetime";
  import * as echarts from 'echarts';
  import { createChart, createMixLineBarChartOption, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const tagsStatChart = ref(null);
  //echarts实例
  let tagsStatChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const tagsOptions = ref([]);
  const daysOptions = ref([]);
  const days = ref();
	
	//标签字段
	const tagsEndDate = ref(null);
	const tagsLoading = ref(false);
	const tagQueryTime = ref(null);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      groupField: 'goods_type_id',
      type: 'TOTAL_PRICE'
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
	
	/** 标签加载 */
	function loadTagOptions(off){
		let offDays = off * 365;
		if(tagsEndDate.value==null){
			tagsEndDate.value = getDay(0);
		}else{
			tagsEndDate.value = tagsEndDate.value.substring(0,10);
		}
		let para = {
			startDate:getDayByDate(offDays,tagsEndDate.value),
			endDate: tagsEndDate.value,
			page: 0,
			pageSize:20
		}
		tagQueryTime.value = para.startDate + '~' + para.endDate;
		tagsLoading.value = true;
		//加载消费标签
		getConsumeTagsTree(para).then(response => {
		  tagsOptions.value = response;
			tagsLoading.value = false;
		});
		tagsEndDate.value = para.startDate;
	}

  /** 下拉框加载 */
  function loadOptions() {
    getConsumeSourceTree().then(response => {
      sourceOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
    proxy.getDictItemTree('TAGS_DAYS_OPTION', false).then(response => {
      daysOptions.value = response;
    });
    loadTagOptions(-1);
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
    if (proxy.isEmpty(queryParams.value.tags)) {
      initStatChart();
    } else {
      initDetailChart();
    }
  }

  function initStatChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getConsumeTagsStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createMixLineBarChartOption(response);;
        createChart(option, tagsStatChartIns);
      }
    );
  }

  function initDetailChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getConsumeTagsDetailStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createPieChartOption(response);;
        createChart(option, tagsStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    tagsStatChartIns = echarts.init(tagsStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>