<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="起止日期" v-show="moreCdn==true&&queryParams.realtime==false" style="width: 308px">
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
      <el-form-item label="选择计划" prop="planId">
        <el-tree-select
          v-model="queryParams.planId"
          style="width: 240px"
          clearable
          :data="userPlanOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择计划"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="名称检索" v-show="moreCdn==true"  prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="业务类型" v-show="moreCdn==true" prop="bussType">
        <el-select v-model="queryParams.bussType" clearable style="width: 240px" placeholder="请选择">
          <el-option
            v-for="dict in bussTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="计划类型" prop="planType">
        <el-select v-model="queryParams.planType" clearable style="width: 240px" placeholder="请选择">
          <el-option
            v-for="dict in planTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据来源" prop="realtime" @change="handleQuery">
        <el-radio-group v-model="queryParams.realtime">
          <el-radio :label="true">最新</el-radio>
          <el-radio :label="false">历史</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="计划预测" prop="predict">
        <el-switch v-model="queryParams.predict"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['report:plan:userPlan:statList']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
        <el-button type="success" icon="TrendCharts" @click="showManualStat" v-hasPermi="['report:plan:planReport:manualStat']">手动统计</el-button>
        <el-button type="danger" icon="delete" @click="showCleanData" v-hasPermi="['report:plan:planReport:cleanData']">清洗数据</el-button>
      </el-form-item>
    </el-form>

    <el-row v-loading="loading">
      <template v-for="item in statResultList">
        <el-col :span="12" class="card-box">
          <el-card>
            <el-row>
            <el-col :span="18">
              <div>
                <el-descriptions class="margin-top" :column="1" border labelStyle="width: 120px">
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">
                        <el-icon><StarFilled /></el-icon>
                        计划名称
                      </div>
                    </template>
                    <div class="cell">
                      <el-tooltip class="item" effect="dark" :content="item.title" placement="top">
                        <el-button round plain type="success" @click="handleEdit(item)">
                          {{ formatTitle(item.title) }}
                        </el-button>
                      </el-tooltip>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon><Opportunity /></el-icon>
                      业务日期
                    </template>
                    <div class="cell">
                      <span v-if="queryParams.realtime==true">
                        实时
                      </span>
                      <span v-else>
                        {{ item.planReport.bussKey }}
                      </span>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon><AlarmClock /></el-icon>
                      统计时间
                    </template>
                    <div class="cell">
                      <span>
                        {{ item.planReport.createdTime }}
                      </span>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon><Aim /></el-icon>
                      周期类型
                    </template>
                    <div class="cell">
                    {{ item.planTypeName }}
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon><StarFilled /></el-icon>
                      计划次数
                    </template>
                    <div class="cell">
                      <span v-if="item.compareType == 'MORE'">
                        <el-text class="mx-1" type="primary">
                          {{ item.compareTypeName+item.planReport.planCountValue+'次' }}
                        </el-text>
                      </span>
                      <span v-else>
                        <el-text class="mx-1" type="success">
                          {{ item.compareTypeName+item.planReport.planCountValue+'次' }}
                        </el-text>
                      </span>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon><BellFilled /></el-icon>
                      计划数值
                    </template>
                    <div class="cell">
                      <span v-if="item.compareType == 'MORE'">
                        <el-text class="mx-1" type="primary">
                          {{ item.compareTypeName+item.planReport.planValue+item.unit }}
                        </el-text>
                      </span>
                      <span v-else>
                        <el-text class="mx-1" type="success">
                          {{ item.compareTypeName+item.planReport.planValue+item.unit }}
                        </el-text>
                      </span>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon><Grid /></el-icon>
                      操作选择
                    </template>
                    <div class="cell">
                      <el-button link icon="tools" type="primary" @click="showRemindSet(item.planId)" size="small">配置提醒</el-button>
                      <el-button link icon="Promotion" type="primary" @click="handleDispatch(item.template.url)" v-hasPermi="['report:plan:userPlan:list']" size="small">详情</el-button>
                      <el-button link icon="refresh" type="danger" @click="handleReStatPlanReport(item.planReport.reportId)" v-if="queryParams.realtime==false" v-hasPermi="['report:plan:planReport:reStat']" size="small">重新统计</el-button>
                      <el-button link icon="TrendCharts" type="primary" @click="handleStat(item)" v-hasPermi="['report:plan:userPlan:stat']" v-if="queryParams.realtime==true" size="small">统计</el-button>
                    </div>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>
            <el-col :span="6">
              <table border="0" style="margin: auto" align="right">
                <tbody>
                  <tr>
                    <td>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span v-if="'MORE'==item.comapreType">
                        <el-progress :width="cicleSize" type="circle" :percentage="item.cp" :color="progressColors2">
                          <template #default="{ percentage }">
                            <span class="percentage-value">{{ item.cp }}%</span>
                          </template>
                        </el-progress>
                      </span>
                      <span v-else>
                        <el-progress :width="cicleSize" type="circle" :percentage="item.cp" :color="progressColors">
                          <template #default="{ percentage }">
                            <span class="percentage-value">{{ item.cp }}%</span>
                          </template>
                        </el-progress>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <el-text class="mx-1" type="warning">
                        次数完成度
                      </el-text>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span v-if="'MORE'==item.comapreType">
                        <el-progress :width="cicleSize" type="circle" :percentage="item.vp" :color="progressColors2">
                          <template #default="{ percentage }">
                            <span class="percentage-value">{{ item.vp }}%</span>
                          </template>
                        </el-progress>
                      </span>
                      <span v-else>
                        <el-progress :width="cicleSize" type="circle" :percentage="item.vp" :color="progressColors">
                          <template #default="{ percentage }">
                            <span class="percentage-value">{{ item.vp }}%</span>
                          </template>
                        </el-progress>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <el-text class="mx-1" type="warning">
                        值完成度
                      </el-text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-table :data="item.statDataList">
                  <el-table-column label="数据类型" align="center">
                    <template #default="scope">
                      <span>{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="统计值" align="center">
                    <template #default="scope">
                      <span>{{ scope.row.statValue }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="计划值" align="center">
                    <template #default="scope">
                      <span>{{ scope.row.planValue }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="预测值" align="center">
                    <template #default="scope">
                      <span>{{ scope.row.predictValue }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="单位" align="center">
                    <template #default="scope">
                      <span>{{ scope.row.unit }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </template>

    </el-row>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 表单 -->
    <UserPlanForm ref="formRef" @success="getList" />
    
    <!-- 提醒表单 -->
    <UserPlanRemindForm ref="userPlanRemindFormRef" />
    
    <!-- 手动统计 -->
    <ManualStatForm ref="manualStatFormRef" @success="getList"/>
    
    <!-- 统计 -->
    <UserPlanStat ref="userPlanStatRef" />
    
  </div>
</template>

<script setup name="UserPlanStatList">
  import { getUserPlanStatList,getUserPlanTree } from "@/api/report/plan/userPlan";
  import { reStatPlanReport } from "@/api/report/plan/planReport";
  import { getPercent,ellipsis,progressColors,progressColors2,getQueryObject } from "@/utils/mulanbay";
  import UserPlanRemindForm from '../userPlanRemind/form.vue'
  import ManualStatForm from '../planReport/manualStat.vue'
  import UserPlanStat from './stat.vue'
  import UserPlanForm from './form.vue'

  const { proxy } = getCurrentInstance();
  const userPlanRemindFormRef = ref();
  const manualStatFormRef = ref();
  const userPlanStatRef = ref();
  const formRef = ref();

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);
  
  const loading = ref(false);
  // 总条数
  const total = ref(0);
  const bussTypeOptions = ref([]);
  const planTypeOptions = ref([]);
  const statResultList = ref([]);
  const userPlanOptions = ref([]);
  
  const cicleSize = ref(100);
  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      realtime:true
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
    getUserPlanTree().then(response => {
      userPlanOptions.value = response;
    });
    proxy.getEnumDict('BussType', 'FIELD', false).then(response => {
      bussTypeOptions.value = response;
    });
    proxy.getEnumDict('PlanType', 'FIELD', false).then(response => {
      planTypeOptions.value = response;
    });
  }
  
  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.planId;
    formRef.value.openForm(id, 'edit');
  }
  
  /** 统计 */
  function handleStat(row){
    userPlanStatRef.value.showData(row.planId,row.title);
  }
  
  /** 提醒配置 */
  function showRemindSet(statId){
    userPlanRemindFormRef.value.openForm(statId);
  }
  
  /** 手动统计 */
  function showManualStat(){
    manualStatFormRef.value.openForm();
  }
  
  /** 清洗数据 */
  function showCleanData(){
    
  }
  
  /** 路由定向 */
  function handleDispatch(pathName) {
    //路由定向
    proxy.$router.push({ name: pathName, query: {} })
  }

  /** 省略显示 */
  function formatTitle(title) {
    let s = ellipsis(title, 10);
    return s;
  }
  
  /** 重新统计 */
  function handleReStatPlanReport(reportId) {
    let postData={
      reportId:reportId
    }
    proxy.$modal.loading("正在统计数据，请稍候！");
    reStatPlanReport(postData).then(response => {
      proxy.$modal.closeLoading();
      proxy.$modal.msgSuccess("统计成功");
      getList();
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

  function getList() {
    loading.value = true;
    statResultList.value = [];
    getUserPlanStatList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        let n = response.rows.length;
        for(let i=0;i<n;i++){
          let item = response.rows[i];
          let cp = getPercent(item.planReport.reportCountValue,item.planReport.planCountValue);
          let vp = getPercent(item.planReport.reportValue,item.planReport.planValue);
          item.cp = parseInt(cp);
          item.vp = parseInt(vp);
        
          let statDataList = [];
          let countData = {
            name:'次数',
            statValue:item.planReport.reportCountValue,
            planValue:item.planReport.planCountValue,
            predictValue:(item.predictCount==null ? null:item.predictCount.toFixed(1)),
            unit:'次'
          }
          statDataList.push(countData);
          
          let unit = item.unit;
          let valueData = {
            name:'统计值',
            statValue:item.planReport.reportValue,
            planValue:item.planReport.planValue,
            predictValue:(item.predictValue==null ? null:item.predictValue.toFixed(1)),
            unit:unit
          }
          statDataList.push(valueData);
          
          item.statDataList=statDataList;
          statResultList.value.push(item);
        }
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    let qb = getQueryObject(null);
    queryParams.value.bussType = qb.bussType;
    getList();
    loadOptions();
  })
</script>