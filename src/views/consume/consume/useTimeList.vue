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
          :shortcuts="datePickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="名称检索" prop="name">
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
      <el-form-item label="排序方式" prop="sortField">
        <el-select
          v-model="queryParams.sortField"
          placeholder="字段"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in sortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="方式"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in sortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="是否二手" prop="secondhand">
        <el-select
          v-model="queryParams.secondhand"
          placeholder="二手类型"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in secondhandOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['consume:consume:useTimeList']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="TrendCharts" @click="handleStat" v-hasPermi="['consume:consume:useTimeStat']">统计</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="consumeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="consumeId" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.consumeId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" fixed="left" min-width="350px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.tags != null">
            <el-icon>
              <Shop />
            </el-icon>
          </span>
          <span v-if="scope.row.pid != null">
            <el-icon color="red">
              <StarFilled />
            </el-icon>
          </span>
          <span v-if="scope.row.consumeType == 'TREAT'">
            <el-icon color="yellowgreen">
              <StarFilled />
            </el-icon>
          </span>
          <span v-if="scope.row.secondhand==true" style="color: green;">
            <el-tag type="warning">二手</el-tag>
          </span>
          <span class="link-type" @click="handleConsumeInfo(scope.row)">{{ scope.row.goodsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用时长" align="center" :show-overflow-tooltip="true" width="120">
        <template #default="scope">
          <span :style="{'color':getUseTimeColor(scope.row.duration)}">{{ formatUseTime(scope.row.duration) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购买日期" align="center" width="190">
        <template #default="scope">
          <span>{{ scope.row.buyTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="售出/作废时间" align="center" width="190">
        <template #default="scope">
          <span>{{ scope.row.invalidTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="买入价格" align="center" width="95">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.totalPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="售出价格" align="center" width="95">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.soldPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="折旧率" :show-overflow-tooltip="true" align="center">
        <template #default="scope">
          <span>{{ formatDepreciation(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="每天花费" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatDailyCost(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购买来源" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.source.sourceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品类型" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.goodsType.typeName }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 关联 -->
    <CascadeForm ref="cascadeFormRef" />


  </div>
</template>

<script setup name="ConsumeUseTimeList">
  import { getConsumeUseTimeList, getConsume } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import { formatDays } from "@/utils/datetime";
  import CascadeForm from './cascade/index.vue'

  const { proxy } = getCurrentInstance();
  const cascadeFormRef = ref();

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
  const consumeList = ref([]);

  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const sortFieldOptions = ref([]);
  const sortTypeOptions = ref([]);
  const secondhandOptions = ref([]);
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      sortField: 'invalidTime',
      sortType: 'desc',
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

  /** 使用时长 */
  function formatUseTime(duration) {
    let days = calsDays(duration);
    var time = formatDays(days);
    return time;
  }

  /** 时长的字段颜色 */
  function getUseTimeColor(duration) {
    let days = calsDays(duration);
    if (days >= 365 * 10) {
      return 'red';
    } else if (days >= 365 * 5) {
      return 'green';
    } else if (days >= 365) {
      return 'purple';
    } else {
      return 'black';
    }
  }

  /** 计算天数 */
  function calsDays(duration) {
    return duration / (24 * 3600 * 1000);
  }

  /** 折旧率 */
  function formatDepreciation(row) {
    if (row.soldPrice == undefined || row.soldPrice == null) {
      return '--';
    } else {
      const dd = row.soldPrice * 10 / row.totalPrice;
      const s = dd.toFixed(1) + '折';
      return s;
    }
  }

  /** 每天花费 */
  function formatDailyCost(row) {
    let days = calsDays(row.duration);
    var pp = '';
    if (row.soldPrice == null) {
      pp = (row.totalPrice) / days;
    } else {
      pp = (row.totalPrice - row.soldPrice) / days;
    }
    return '￥' + pp.toFixed(2);
  }

  /** 统计 */
  function handleStat() {
    proxy.$router.push({ name: 'ConsumeUseTimeStat', query: {} })
  }

  /** 详情 */
  function handleConsumeInfo(row) {
    cascadeFormRef.value.openCascade(row.consumeId);
  }

  /** 下拉框加载 */
  function loadOptions() {
    getConsumeSourceTree().then(response => {
      sourceOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
    proxy.getDictItemTree('SECONDHAND', false).then(response => {
      secondhandOptions.value = response;
    });
    proxy.getDictItemTree('CONSUME_USE_TIME_SORT_FIELD', false).then(response => {
      sortFieldOptions.value = response;
    });
    proxy.getDictItemTree('SORT_TYPE', false).then(response => {
      sortTypeOptions.value = response;
    });
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    consumeList.value = [];
    getConsumeUseTimeList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        consumeList.value = response.rows;
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
    ids.value = selection.map(item => item.consumeId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    loadOptions();
  })
</script>