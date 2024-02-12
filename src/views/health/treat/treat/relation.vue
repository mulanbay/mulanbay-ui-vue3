<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="看病日期" style="width: 308px">
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
      <el-form-item label="疾病标签" prop="tags">
        <el-select
          v-model="queryParams.tags"
          placeholder="疾病标签"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in tagsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="全链接" prop="unionAll">
        <el-switch v-model="queryParams.unionAll" @change="handleQuery"></el-switch>
        <el-tooltip content="全连接代表显示所有的连接关系" raw-content effect="dark" placement="top">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:treat:treat:relation']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="TreatRelation">
  import { getTreatRelation,getTreatCateTree } from "@/api/health/treat/treat";
  import {getQueryObject} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const tagsOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    queryParams: {
      tags:undefined,
      unionAll:false
    }
  });

  const { queryParams } = toRefs(data);

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  /** 下拉框加载 */
  function loadOptions() {
    getTreatCateTree('tags',false).then(
      response => {
        tagsOptions.value = response;
      }
    );
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
    getTreatRelation(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createChartOption(response);
        createChart(option, statChartIns);
      }
    );
  }
  
  /**
   * 关系图
   * 参考：https://www.makeapie.com/editor.html?c=xkiiaUN8q
   * @param {Object} resData
   */
  function createChartOption(resData) {
    let data = {
      nodes: resData.itemDataList,
      links: resData.linkDataList
    }
    const colorList=['#006acc','#ff7d18', '#bda29a', '#61a0a8','#10a050', '#8B0A50','#080808', '#546570'];
    let categories = new Array();
    let cn = resData.categoryNames.length;
    for (let i = 0; i < cn; i++) {
      let cg = {
        name: resData.categoryNames[i],
        itemStyle: {
          color: colorList[i]
        }
      };
      categories.push(cg);
    }
    data.nodes.forEach(node => {
      //最大支持8级
      let index = node.category%8;
      node.symbolSize = 80-10*index;
      node.itemStyle = {
        color: colorList[index]
      };
    });
  
    data.links.forEach(link => {
      let index = link.type%8;
      link.label = {
        align: 'center',
        fontSize: 12,
        color:colorList[index]
      };
      link.lineStyle = {
        color: colorList[index]
      }
    });
  
    let option = {
      title: {
        text: resData.title,
      },
      tooltip: {},
      legend: [{
        // selectedMode: 'single',
        data: categories.map(x => x.name),
        // icon: 'circle'
      }],
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [{
        type: 'graph',
        layout: 'force',
        symbolSize: 58,
        draggable: false,// 是否可拖动
        roam: true,
        categories: categories,
        scaleLimit: {
          //所属组件的z分层，z值小的图形会被z值大的图形覆盖
          min: 0.5, //最小的缩放值
          max: 9 //最大的缩放值
        },
        edgeSymbol: ['', 'arrow'],
        //edgeSymbolSize: [80, 10],
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        },
        lineStyle: {
          color: 'source',
          curveness: 0 // 连接线的弧度，值：0-1之间
        },
        edgeLabel: {
          show: true,
          fontSize: 20,
          formatter(x) {
            return x.data.name;
          }
        },
        label: {
          show: true
        },
        force: {
          repulsion: 2000,
          edgeLength: 120
        },
        data: data.nodes,
        links: data.links
      }]
    };
    return option;
  }

  /** 初始化 **/
  onMounted(() => {
    statChartIns = echarts.init(statChart.value, "macarons");
    let qb = getQueryObject(null);
    if(qb.tags!=null){
      queryParams.value.tags = qb.tags;
      initChart();
    }
    loadOptions();
  })
</script>