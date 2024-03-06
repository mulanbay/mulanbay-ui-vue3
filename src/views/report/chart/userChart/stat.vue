<template>
  
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" label-width="90px" :inline="true">
      <el-form-item label="图表模版" prop="templateId">
        <el-tree-select
          v-model="queryParams.templateId"
          style="width: 240px"
          :data="chartTemplateOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择模版"
          :check-strictly="false"
          @change="handleChartTemplateChange" />
      </el-form-item>
      <el-form-item label="起止日期" v-show="useDateRange==true" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          unlink-panels
          :value-format="dateFormat"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="datePickerOptions"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <FormCreate :option="peOption" v-model:api="peApi" :rule="peRule"></FormCreate>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['report:chart:userChart:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />
    
  </div>

</template>

<script setup name="UserChartStat">
  import { getChartTemplate,getChartTemplateUserTree } from "@/api/report/chart/chartTemplate";
  import { getUserChartStat } from "@/api/report/chart/userChart";
  import { parseStatBindConfigs } from "@/api/report/bind/statBindConfig";
  import { generateFcRules, setTriggerParasBindValues, getBindValues, setBindValues } from "@/utils/formCreateUtils";
  
  import { getPercent,addDate } from "@/utils/mulanbay";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption,createBarChartOption, createLineChartOption, createCalanderChartOption, createScatterChartOption, createMixLineBarChartOption,
           createTreeMapChartOption} from "@/utils/mulanbay_echarts";
  //导入 form-create
  import formCreate from "@form-create/element-ui";
  
  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');
 //获取 formCreate 组件
  const FormCreate = formCreate.$form();
  const parasEditTitle = ref('绑定条件编辑');
  const parasEditOpen = ref(false);
  const peApi = ref();
  
  //可执行时间段
  const title = ref('图表统计');
  const open = ref(false);
  const loading = ref(false);
  const formRef = ref();
  const chartTemplateOptions = ref([]);
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);
  //单个时间
  const dateValue = ref();
  
  //是否时间区间
  const useDateRange = ref(false);
  //是否时间（单个）
  const useDate = ref(false);
  const dateFields = ref([]);
  const dateFormat = ref('YYYY-MM-DD');
  
  const data = reactive({
    queryParams: {},
    rules: {},
    templateData:{},
    peRule: [],
    peOption: {
      onSubmit: (formData) => {
        //alert(JSON.stringify(formData));
        parasEditOpen.value = false;
        // 发送操作成功的事件
        emit('success', JSON.stringify(formData));
      },
      submitBtn:false,
      resetBtn: false,
      form: {
        labelPosition: 'right',
        labelWidth: '90px',
        size: undefined,
        //是否同一行
        inline: true,
        hideRequiredAsterisk: false
      },
      row: {
        type: '',
        gutter: 5
      }
    }
  });

  const { queryParams, rules,templateData,peRule, peOption } = toRefs(data);

  /** 模版变化 */
  function handleChartTemplateChange(templateId) {
    getChartTemplate(templateId).then(response => {
      templateData.value = response;
      let dateField =templateData.value.dateField;
      if(proxy.isEmpty(dateField)){
        useDateRange.value = false;
        useDate.value = false;
      }else{
        dateFormat.value= templateData.value.dateFormat;
        dateFields.value = dateField.split(',');
        if(dateFields.value.length ==1){
          useDate.value = true;
        }else{
          useDateRange.value = true;
        }
      }
    });
    loadStatBindConfigs(templateId,'CHART',null);
    //清空图表
    statChartIns.clear();
  }
  
  /** 获取值配置列表列表 */
  function loadStatBindConfigs(fid,type,bindValues){
    peApi.value.reload([]);
    parseStatBindConfigs(fid,type).then(
      response => {
        peRule.value = generateFcRules(response);
        //需要重载规则，否则编辑时无法设定值
        peApi.value.reload(peRule.value);
        setBindValues(bindValues,peApi.value);
      }
    );
  }
  
  function loadOptions(){
    getChartTemplateUserTree().then(response => {
      chartTemplateOptions.value = response;
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

  // 表单重置
  function resetForm() {
    queryParams.value = {
      statId: undefined
    };
    proxy.resetForm("queryRef");
  }
  
  /** 查询参数 */
  function getQueryPara(){
    let para={};
    let formData = peApi.value.formData();
    if(useDateRange.value){
      para = proxy.addDateRange(formData, dateRange.value,dateFields.value);
    }else if(useDate.value){
      para = addDate(formData,dateValue.value,dateFields.value[0]);
    }else{
      para = formData;
    }
    //console.log(JSON.stringify(para));
    return para;
  }

  /** 图表 */
  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    let para = getQueryPara();
    let api = templateData.value.api;
    getUserChartStat(api,para).then(response => {
      proxy.$modal.closeLoading();
      let chartType = templateData.value.chartType;
      if(para.chartType!=null){
        //使用自定义类型
        chartType = para.chartType;
      }
      let option = null;
      switch(chartType){
        case 'PIE':
          option = createPieChartOption(response);
          break;
        case 'LINE':
          option = createLineChartOption(response);
          break;
        case 'BAR':
          option = createBarChartOption(response);
          break;
        case 'TREE_MAP':
          option = createTreeMapChartOption(response);
          break;
        case 'MIX_LINE_BAR':
          option = createMixLineBarChartOption(response);
          break;
      }
      createChart(option, statChartIns);
    });
  }

  /** 初始化 **/
  onMounted(() => {
    statChartIns = echarts.init(statChart.value, "macarons");
    loadOptions();
  })
</script>