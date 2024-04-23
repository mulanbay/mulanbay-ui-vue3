<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:treat:treat:fullStat']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" type="index" fixed="left"  align="center" width="60">
      </el-table-column>
      <el-table-column label="疾病标签" fixed="left"  min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="showRelation(scope.row)">{{ scope.row.tags }}</span>
        </template>
      </el-table-column>
      <el-table-column label="看病总次数" width="120" align="center" >
        <template #default="scope">
          <span v-if="scope.row.totalCount<=3" style="color: green;">
            {{ scope.row.totalCount }}
          </span>
          <span v-else-if="scope.row.totalCount<=5" style="color: purple;">
           {{ scope.row.totalCount }}
          </span>
          <span v-else-if="scope.row.totalCount<=10" style="color: brown;">
           {{ scope.row.totalCount }}
          </span>
          <span v-else style="color: red;">
           {{ scope.row.totalCount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="初次看病时间" width="180" align="center">
        <template #default="scope">
          <span>{{ scope.row.minTreatTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近一次看病时间" width="180" align="center">
        <template #default="scope">
          <span>{{ scope.row.maxTreatTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="看病总时长" width="110" :show-overflow-tooltip="true"  align="center">
        <template #default="scope">
          <span>{{ formatTotalDays(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="距离现在" width="110" :show-overflow-tooltip="true"  align="center">
        <template #default="scope">
          <span>{{ formatTillNow(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总费用"  align="center" width="120" >
        <template #default="scope">
          <span>{{ formatMoney(scope.row.totalFee) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="费用统计" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleFeeDetail(scope.row)"><el-icon><Histogram /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="分析" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleAnalyse(scope.row)"><el-icon><Histogram /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="药品" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleDrugList(scope.row)"><el-icon><Grid /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="手术" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleOperationList(scope.row)"><el-icon><Grid /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="检测报告" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleTreatTest(scope.row)"><el-icon><Grid /></el-icon></span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 费用明细 -->
    <FullStatFeeDetail ref="fullStatFeeDetailRef" />

    <!-- 分析 -->
    <FullStatAnalyse ref="fullStatAnalyseRef" />
    
    <!-- 药品列表页面 -->
    <el-dialog :title="treatDrugTitle" width="900px" v-model="treatDrugOpen" append-to-body>
      <TreatDrug ref="treatDrugRef" />
    </el-dialog>
    
    <!-- 手术列表页面 -->
    <el-dialog :title="treatOperationTitle" width="900px" v-model="treatOperationOpen" append-to-body>
      <TreatOperation ref="treatOperationRef" />
    </el-dialog>
    
  </div>
</template>

<script setup name="DictItem">
  import { getTreatFullStat } from "@/api/health/treat/treat";
  import {formatDays} from "@/utils/datetime";
  import FullStatFeeDetail from './fullStatFeeDetail.vue'
  import FullStatAnalyse from './fullStatAnalyse.vue'
  import TreatDrug from '../treatDrug/index.vue';
  import TreatOperation from '../treatOperation/index.vue';
  
  const { proxy } = getCurrentInstance();
  const fullStatFeeDetailRef = ref();;
  const fullStatAnalyseRef = ref();;
  
  // 遮罩层
  const loading = ref(true);
  // 选中数组
  const ids = ref([]);
  // 非单个禁用
  const single = ref(true);
  // 非多个禁用
  const multiple = ref(true);
  // 总条数
  const total = ref(0);
  // 查询列表数据
  const dataList = ref([]);
 
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  //药品列表
  const treatDrugTitle = ref('药品列表');
  const treatDrugOpen = ref(false);
  const treatDrugRef = ref();
  
  //手术列表
  const treatOperationTitle = ref('手术列表');
  const treatOperationOpen = ref(false);
  const treatOperationRef = ref();
  
  // 弹出层标题
  const title = ref("");
  // 是否显示弹出层
  const open = ref(false);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 计算总天数 */
  function formatTotalDays(row) {
    const max = new Date(Date.parse(row.maxTreatTime.replace(/-/g,"/")));
    const min = new Date(Date.parse(row.minTreatTime.replace(/-/g,"/")));
    let r = (parseInt(max - min)) / (1000*24*3600);
    return formatDays(r);
  }
  
  /** 计算距离现在 */
  function formatTillNow(row) {
    const max = new Date();
    const min = new Date(Date.parse(row.maxTreatTime.replace(/-/g,"/")));
    let r = (parseInt(max - min)) / (1000*24*3600);
    return formatDays(r);
  }
  
  /** 费用明细 */
  function handleFeeDetail(row){
    fullStatFeeDetailRef.value.showData(row);
  }
  
  /** 分析 */
  function handleAnalyse(row){
    fullStatAnalyseRef.value.showData(row);
  }
  
  /** 关系图 */
  function showRelation(row){
    //路由定向
    proxy.$router.push({name:'TreatRelation',query: {tags:row.tags}})
  }
  
  /** 药品列表 */
  function handleDrugList(row) {
    treatDrugTitle.value = '[' + row.tags + ']药品列表';
    treatDrugOpen.value = true;
    proxy.$nextTick(()=>{
      treatDrugRef.value.showData(null,row.tags);
    });
  }
  
  /** 手术列表 */
  function handleOperationList(row) {
    treatOperationTitle.value = '[' + row.tags + ']手术列表';
    treatOperationOpen.value = true;
    proxy.$nextTick(()=>{
      treatOperationRef.value.showData(null,row.tags);
    });
  }
  
  /** 检测报告列表 */
  function handleTreatTest(row) {
    treatOperationTitle.value = '[' + row.tags + ']手术列表';
    treatOperationOpen.value = true;
    proxy.$nextTick(()=>{
      treatOperationRef.value.showData(null,row.tags);
    });
  }
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    dataList.value = [];
    getTreatFullStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        dataList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    queryParams.value.page = 1;
    handleQuery();
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
  })
</script>