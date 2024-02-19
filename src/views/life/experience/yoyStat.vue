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
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计分组" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="统计分组"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="经历类型" prop="types">
        <el-select
          v-model="queryParams.types"
          placeholder="类型"
          clearable
          multiple
          collapse-tags
          style="width: 240px"
        >
          <el-option
            v-for="dict in typesOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['life:experience:yoyStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="yoyStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="ExperienceYoyStat">
  import { getExperienceYoyStat } from "@/api/life/experience";
  import { getYearList } from "@/api/common";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createCalenderHeatMapChartOption,createLineChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const yoyStatChart = ref(null);
  //echarts实例
  let yoyStatChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const dateGroupTypeOptions = ref([]);
  const yearsOptions = ref([]);
  const groupTypeOptions = ref([
    {
      id: 'COUNT',
      text: '次数'
    },
    {
      id: 'DAYS',
      text: '天数'
    }
  ]);
  const typesOptions = ref([]);

  const data = reactive({
    queryParams: {
      name: undefined,
      dateGroupType:'MONTH',
      groupType:'COUNT'
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
    getYearList().then(response => {
      yearsOptions.value = response;
    });
    proxy.getDictItemTree('CHART_YOY_DATE_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
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
    let years = queryParams.value.years;
    const dateGroupType = queryParams.value.dateGroupType;
    if (years == null || years.length == 0) {
      proxy.$modal.msgError("请选择至少两个年份");
      return;
    }
    if (dateGroupType == 'DAY' && years.length != 2) {
      proxy.$modal.msgError("按天统计，年份个数只支持两个");
      return;
    }
    proxy.$modal.loading("正在加载数据，请稍候！");
    var acQueryParams = deepClone(queryParams.value);
    acQueryParams.years = acQueryParams.years.join(',');
    if(acQueryParams.types!=null){
      acQueryParams.types = acQueryParams.types.join(',');
    }
    getExperienceYoyStat(acQueryParams).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        //组装chart数据
        const dateGroupType = queryParams.value.dateGroupType;
        if(dateGroupType=='DAY'){
          option = createCalenderHeatMapChartOption(response,echarts);
        }else{
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