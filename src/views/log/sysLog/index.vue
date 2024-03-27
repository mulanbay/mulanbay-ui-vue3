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
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="日志级别" prop="logLevel">
        <el-select
          v-model="queryParams.logLevel"
          placeholder="日志级别"
          clearable
          collapse-tags
          style="width: 240px">
          <el-option
            v-for="dict in logLevelOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="功能选择" prop="funcId">
        <el-tree-select
          v-model="queryParams.funcId"
          style="width: 240px"
          :data="funcOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择上级菜单"
          check-strictly
          clearable />
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="错误代码" prop="errorCode">
        <el-input
          v-model="queryParams.errorCode"
          placeholder="错误代码"
          clearable
          style="width: 240px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['log:sysLog:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
        <el-button type="success" icon="TrendCharts" @click="handleAnalyseStat" v-hasPermi="['log:sysLog:analyseStat']">日志分析</el-button>
      </el-form-item>
    </el-form>


    <!--列表数据-->
    <el-table v-loading="loading" :data="sysLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="log" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center">
        <template #default="scope">
          <span>{{ scope.row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="系统代码" align="center">
        <template #default="scope">
          <span class="link-type" @click="showSysCode(scope.row)">{{ scope.row.errorCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="showDetail(scope.row)">
            {{ scope.row.title }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="发生时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.occurTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日志级别" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.logLevel=='NORMAL'" style="color:black ;">
            {{ scope.row.logLevelName }}
          </span>
          <span v-else-if="scope.row.logLevel=='WARNING'" style="color:burlywood ;">
            {{ scope.row.logLevelName }}
          </span>
          <span v-else-if="scope.row.logLevel=='ERROR'" style="color:red ;">
            {{ scope.row.logLevelName }}
          </span>
          <span v-else style="color:darkmagenta ;">
            {{ scope.row.logLevelName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="功能点" align="center" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.sysFunc == null ? '--': scope.row.sysFunc.funcName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请求地址" align="center" min-width="200px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.urlAddress }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请求方式" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保存时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.storeTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="保存延迟时间" align="center" width="160">
        <template #default="scope">
          <span v-if="scope.row.storeDuration>=1000" style="color: red;">
            {{ (scope.row.storeDuration/1000).toFixed(1) }}秒
          </span>
          <span v-else-if="scope.row.storeDuration>=500" style="color: purple;">
            {{ scope.row.storeDuration }}毫秒
          </span>
          <span v-else>{{ scope.row.storeDuration }}毫秒</span>
        </template>
      </el-table-column>
      <el-table-column label="请求IP" align="center" width="150">
        <template #default="scope">
          <span>{{ scope.row.ipAddress }}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务器IP" align="center" width="150">
        <template #default="scope">
          <span>{{ scope.row.hostIpAddress }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 系统代码 -->
    <SysCodeForm ref="sysCodeFormRef" />
    
    <!-- 日志详情 -->
    <SysLogDetail ref="sysLogDetailRef" />

  </div>
</template>

<script setup name="SysLog">
  import { fetchList, getBeanDetail } from "@/api/log/sysLog";
  import { getFuncTree } from "@/api/auth/sysFunc";
  import { getDomainClassList } from "@/api/common";
  import SysLogDetail from './detail.vue'
  import SysCodeForm from '../sysCode/form.vue'

  const { proxy } = getCurrentInstance();

  const sysLogDetailRef = ref(true);
  const sysCodeFormRef = ref(true);

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
  const sysLogList = ref([]);

  // 弹出层标题
  const title = ref("");
  // 是否显示弹出层
  const open = ref(false);

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  const logLevelOptions = ref([]);
  const funcOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    form: {},
    queryParams: {
      page: 1,
      pageSize: 10
    },
    rules: {

    }
  });

  const { queryParams, form, rules } = toRefs(data);

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

  /** 日志分析 */
  function handleAnalyseStat() {
    //路由定向
    proxy.$router.push({ name: 'SysLogAnalyseStat', query: {} })
  }


  /** 系统代码详情 */
  function showSysCode(row) {
    sysCodeFormRef.value.openForm(row.errorCode, 'edit');
  }

  /** 详情 */
  function showDetail(row) {
    sysLogDetailRef.value.showData(row);
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    sysLogList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        sysLogList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    sysLogList.value = [];
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    sysLogList.value = [];
    queryParams.value.page = 1;
    handleQuery();
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.groupId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    proxy.getEnumDict('LogLevel', 'FIELD', false).then(response => {
      logLevelOptions.value = response;
    });
    getFuncTree().then(response => {
      funcOptions.value = response;
    });
  })
</script>