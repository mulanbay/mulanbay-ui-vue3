<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <div>
          <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item label="记录类型" prop="commonRecordTypeId">
              <el-tree-select
                v-model="queryParams.typeId"
                style="width: 240px"
                clearable
                :data="typeOptions"
                :props="{ value: 'id', label: 'text', children: 'children' }"
                value-key="id"
                placeholder="选择类型"
                :check-strictly="false"
                 @change="handleTypeChange"/>
            </el-form-item>
            <el-form-item label="子项名称" prop="name">
              <el-select
                v-model="queryParams.name"
                placeholder="子项名称"
                clearable
                style="width: 240px"
              >
                <el-option
                  v-for="dict in nameOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
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
                :shortcuts="datePickerOptions">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="分组类型" prop="groupField">
              <el-select
                v-model="queryParams.groupField"
                placeholder="分组类型"
                clearable
                style="width: 240px"
              >
                <el-option
                  v-for="dict in groupFieldOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Histogram" @click="handleQuery" v-hasPermi="['commonData:commonData:analyse']">统计</el-button>
              <el-button icon="refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
  
      <el-col :span="16" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <div ref="analyseChart" :style="{height:height1,margin:0 }" />
          </div>
          <div align="center">
            <el-button type="primary" icon="Histogram" @click="handleChartStat('TIMES')" >按次数</el-button>
            <el-button type="primary" icon="Histogram" @click="handleChartStat('MINUTE')" >按时长</el-button>
          </div>
        </el-card>
      </el-col>
  
      <el-col :span="8" class="card-box">
        <el-card>
          <div slot="header">
            <span>统计信息(基于当前查询条件)</span>
          </div>
          <div>
            <el-divider content-position="center">数据统计</el-divider>
            <el-descriptions class="margin-top" title="" :column="1" border >
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><Clock /></el-icon>
                    时间跨度
                  </div>
                </template>
                <div class="cell">{{ statData.daysStr }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><InfoFilled /></el-icon>
                    总次数
                  </div>
                </template>
                <div class="cell">{{ statData.totalCount }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><Switch /></el-icon>
                    总时长
                  </div>
                </template>
                <div class="cell">{{ statData.totalValue+statData.unit }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><SemiSelect /></el-icon>
                    平均时长
                  </div>
                </template>
                <div class="cell">{{ statData.perValue+statData.unit }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><Share /></el-icon>
                    平均频率
                  </div>
                </template>
                <div class="cell">{{ statData.frequency }}天/次</div>
              </el-descriptions-item>
            </el-descriptions>
            <el-divider content-position="center">数据信息</el-divider>
            <el-tabs v-model="nearestType" @tab-click="handleNearest">
                <el-tab-pane label="时间最早" name="MIN_TIME"></el-tab-pane>
                <el-tab-pane label="时间最新" name="MAX_TIME"></el-tab-pane>
                <el-tab-pane label="时长最短" name="MIN_VALUE"></el-tab-pane>
                <el-tab-pane label="时长最长" name="MAX_VALUE"></el-tab-pane>
              </el-tabs>
            <el-descriptions class="margin-top" title="" :column="1" border >
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><InfoFilled /></el-icon>
                    名称
                  </div>
                </template>
                <div class="cell">{{ latestData.dataName }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><Clock /></el-icon>
                    数值
                  </div>
                </template>
                <div class="cell">
                {{ latestData.value }}
                <span v-if="latestData.type!=null">{{latestData.type.unit}}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><Location /></el-icon>
                    地点
                  </div>
                </template>
                <div class="cell">{{ latestData.location }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><DishDot /></el-icon>
                    时间
                  </div>
                </template>
                <div class="cell">{{ latestData.occurTime }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template #label>
                  <div class="cell-item">
                    <el-icon><Open /></el-icon>
                    距今
                  </div>
                </template>
                <div class="cell">{{ getTillNow(latestData.occurTime) }}</div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
  
      <el-col :span="24" class="card-box">
        <el-card>
          <div slot="header">
            <span>时间线统计</span>
            -->预测:<el-switch v-model="predict" @change="timelineStat()"></el-switch>
          </div>
          <div class="chart-wrapper">
            <div ref="timelineChart" :style="{height:height2,margin:0 }" />
          </div>
        </el-card>
      </el-col>
  
    </el-row>
  </div>
 
</template>

<script setup name="CommonDataAnalyse">
  import { getCommonDataAnalyse,getCommonDataTimeline,getNameTree,getNearestCommonData,statCommonData } from "@/api/commonData/commonData";
  import { getCommonDataTypeTree } from "@/api/commonData/commonDataType";
  import {getPercent,progressColors,formatFloat} from "@/utils/mulanbay";
  import {dateDiff,tillNowDays,formatDays} from "@/utils/datetime";
  import {getQueryObject} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption, createMixLineBarChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const analyseChart = ref(null);
  //echarts实例
  let analyseChartIns = ref(null);
  //图形实例
  const timelineChart = ref(null);
  let timelineChartIns = ref(null);
  
  //echarts实例
  let predict = ref(false);
  let nearestType = ref("MAX_TIME");
  
  const height1 = ref('545px');
  const height2 = ref('300px');
  
  const typeOptions = ref([]);
  const nameOptions = ref([]);
  const groupFieldOptions = ref([]);
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    statData:{},
    latestData:{},
    queryParams: {
      groupField:'data_name',
      valueType: 'TIMES',
      typeId:undefined
    }
  });

  const { statData,latestData,queryParams } = toRefs(data);

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
  
  /** 类型选择变化 */
  function handleTypeChange(typeId){
    let para ={
      typeId:typeId
    }
    getNameTree(para).then(response => {
      nameOptions.value = response;
    });
  }
  
  /** 格式化预测值 */
  function formatePredictValue(v,n) {
    return formatFloat(v,n);
  }
  
  /** 获取距今时间 */
  function getTillNow(occurTime){
    let days = tillNowDays(null,occurTime);
    let ss = formatDays(0-days);
    if(days<-30){
      ss+='('+(0-days).toFixed(0)+'天)';
    }
    return ss;
  }
  
  /** 类型选择操作 */
  function handleChartStat(type){
    queryParams.value.valueType = type;
    analyseStat();
  }
  
  /** 最近记录操作 */
  function handleNearest(){
    getNearestData();
  }
  
  /** 下拉框加载 */
  function loadOptions() {
    proxy.getDictItemTree('COMMON_DATA_ANALYSE_GROUP_FIELD', false).then(response => {
      groupFieldOptions.value = response;
    });
    getCommonDataTypeTree().then(response => {
      typeOptions.value = response;
    });
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
  
  /** 查询信息 */
  function getList() {
    if(proxy.isEmpty(queryParams.value.typeId)){
      proxy.$modal.msgError('请先选择记录类型');
      return;
    }
    analyseStat();
    timelineStat();
    getNearestData();
    getStatData();
  }
  
  /** 分析统计 */
  function analyseStat(){
    proxy.$modal.loading("正在加载数据，请稍候！");
    getCommonDataAnalyse(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        let option = createPieChartOption(response);
        createChart(option, analyseChartIns);
      }
    );
  }
  
  /** 时间线统计 */
  function timelineStat(){
    let para = {
      typeId : queryParams.value.typeId,
      name : queryParams.value.name
    }
    getCommonDataTimeline(proxy.addDateRange(para, dateRange.value)).then(
      response => {
        let option = createMixLineBarChartOption(response);
        createChart(option, timelineChartIns);
      }
    );
  }
  
  /** 获取最近 */
  function getNearestData(){
    let para = {
      typeId : queryParams.value.typeId,
      name : queryParams.value.name,
      nearestType: nearestType.value
    }
    latestData.value ={};
    getNearestCommonData(proxy.addDateRange(para, dateRange.value)).then(
      response => {
        latestData.value ={};
        if(response!=null){
          latestData.value = response;
        }
      }
    );
  }
  
  /** 获取统计 */
  function getStatData(){
    let para = {
      typeId : queryParams.value.typeId,
      name : queryParams.value.name
    }
    statCommonData(proxy.addDateRange(para, dateRange.value)).then(
      response => {
        let days = 1;
        if(response!=null&&response.minDate!=null&&response.maxDate!=null){
          days = dateDiff(response.minDate,response.maxDate);
        }
        else{
          statData.value = {};
          return;
        }
        let perValue = response.totalValue*1.0/response.totalCount;
        let frequency = days / response.totalCount;
        statData.value ={
          daysStr: formatDays(days),
          totalCount: response.totalCount,
          totalValue: response.totalValue,
          perValue: perValue.toFixed(1),
          frequency: frequency.toFixed(1),
          unit:response.unit
        };
  
      }
    );
  }
  
  /** 初始化 **/
  onMounted(() => {
    analyseChartIns = echarts.init(analyseChart.value, "macarons");
    timelineChartIns = echarts.init(timelineChart.value, "macarons");
    loadOptions();
    let qb = getQueryObject(null);
    let typeId = qb.typeId;
    if(typeId!=null){
      queryParams.value.typeId = parseInt(typeId);
      handleQuery();
    }
  })
</script>