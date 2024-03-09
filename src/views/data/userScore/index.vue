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
      <el-form-item label="分数范围">
          <el-input-number v-model="queryParams.minScore" clearable :min="0" label="" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.maxScore" clearable :min="0" label="" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['data:userScore:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    
    <!--列表数据-->
    <el-table v-loading="loading" :data="userScoreList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="scoreId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.scoreId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评分" fixed="left" align="center">
        <template #default="scope">
          <span v-if="scope.row.score>=80" style="color:green">
           {{ scope.row.score }}
          </span>
          <span v-else-if="scope.row.score<60" style="color:red">
           {{ scope.row.score }}
          </span>
          <span v-else>
            {{ scope.row.score }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="数据日期" align="center" width="120">
        <template #default="scope">
          <span>
           {{ scope.row.endTime.substring(0,10) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="统计时间段" align="center" width="200">
        <template #default="scope">
          <span>{{ formatDateRange(scope.row)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="详情" align="center" width="80">
        <template #default="scope">
          <span class="link-type" @click="showScoreDetail(scope.row)">
            <el-icon><Grid /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="分析" align="center" width="80">
        <template #default="scope">
          <span class="link-type" @click="analyseScoreDetail(scope.row)">
            <el-icon><Histogram /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center"  width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 详情 -->
    <UserScoreDetail ref="userScoreDetailRef" />
    
    <!-- 分析 -->
    <UserScoreAnalyse ref="userScoreAnalyseRef" />
    
  </div>
</template>

<script setup name="UserScore">
  import { fetchList } from "@/api/data/userScore";
  const { proxy } = getCurrentInstance();
  import UserScoreDetail from './detail.vue'
  import UserScoreAnalyse from './analyse.vue'

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
  const userScoreList = ref([]);
  const userScoreDetailRef = ref();
  const userScoreAnalyseRef = ref();
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);
  
  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);
  
  /** 时间段 */
  function formatDateRange(row){
    return row.startTime.substring(0,10) + '~~' +row.endTime.substring(0,10);
  }
  
  /** 详情 */
  function showScoreDetail(row){
    userScoreDetailRef.value.showData(row.scoreId);
  }
  
  /** 分析 */
  function analyseScoreDetail(row){
    userScoreAnalyseRef.value.showData(row.scoreId);
  }
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    userScoreList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        userScoreList.value = response.rows;
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
    ids.value = selection.map(item => item.scoreId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
  })
</script>