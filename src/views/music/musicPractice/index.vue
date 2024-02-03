<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="选择乐器" prop="instrumentId">
        <el-tree-select
          v-model="queryParams.instrumentId"
          style="width: 240px"
          clearable
          :data="instrumentOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择乐器"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="练习日期" style="width: 308px">
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
      <el-form-item label="练习时长">
        <el-input-number v-model="queryParams.minMinutes" clearable :min="0" label="分钟" style="width: 120px"></el-input-number>
        <el-input-number v-model="queryParams.maxMinutes" clearable :min="0" label="分钟" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['music:musicPractice:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['music:musicPractice:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['music:musicPractice:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['music:musicPractice:delete']">删除
        </el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="musicPracticeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="practiceId" sortable="custom" align="center" width="80" fixed="left">
        <template #default="scope">
          <span>{{ scope.row.practiceId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="140px" fixed="left">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.instrument.instrumentName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="练习日期" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.practiceDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="练习时间" align="center" width="200">
        <template #default="scope">
          <span>{{ formatPracticeRange(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时长(分钟)" align="center" width="120">
        <template #default="scope">
          <span :style="{'color':getMinutesColor(scope.row.minutes)}">{{ scope.row.minutes }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="80">
        <template #default="scope">
          <span class="link-type" @click="handleTillNowStat(scope.row)"><el-icon><Histogram /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['music:musicPractice:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['fund:budget:delete']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 表单 -->
    <MusicPracticeForm ref="formRef" @success="getList" />
    
    <!-- 表单 -->
    <TillNowStat ref="tillNowStatRef" />

  </div>
</template>

<script setup name="MusicPractice">
  import { fetchList, deleteMusicPractice } from "@/api/music/musicPractice";
  import { getInstrumentTree } from "@/api/music/instrument";
  import { getPercent, progressColors } from "@/utils/mulanbay";
  import { getQueryObject } from "@/utils/index";
  import MusicPracticeForm from './form.vue'
  import TillNowStat from './tillNowStat.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const tillNowStatRef = ref();

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
  const musicPracticeList = ref([]);
  const instrumentOptions = ref([]);

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

  /** 统计 */
  function handleStat() {
    //路由定向
    proxy.$router.push({ name: 'BudgetStat', query: {} })
  }

  /** 练习区间 */
  function formatPracticeRange(row) {
    let s = row.startTime.substr(11, 5) + '~~' + row.endTime.substr(11, 5);
    return s;
  }

  /** 时长的字段颜色 */
  function getMinutesColor(minutes) {
    //days需要先被计算出来这里才能使用
    if (minutes <= 50) {
      return 'red';
    } else {
      return 'black';
    }
  }

  /** 距离现在的统计值 */
  function handleTillNowStat(row) {
    tillNowStatRef.value.showData(row);
  }

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

  /** 名称 */
  function formartName(row) {
    return proxy.isEmpty(row.budget) ? '预算合计' : row.budget.budgetName;
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    musicPracticeList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        musicPracticeList.value = response.rows;
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

  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null, 'create', null);
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.practiceId || ids.value.join(",");
    formRef.value.openForm(id, 'edit', null);
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.practiceId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteBudgetLog(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.practiceId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    getInstrumentTree(false, false).then(response => {
      instrumentOptions.value = response;
    });
  })
</script>