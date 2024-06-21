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
      <el-form-item v-if="moreCdn==true" label="积分来源" prop="source">
        <el-select
          v-model="queryParams.source"
          placeholder="类型"
          clearable
          style="width: 240px"
          @change="handleSourceChange"
        >
          <el-option
            v-for="dict in sourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="来源明细" prop="sourceId">
        <el-tree-select
          v-model="queryParams.sourceId"
          style="width: 240px"
          :data="sourceIdOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder=""
          clearable
          :check-strictly="false"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['data:userReward:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['data:userReward:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['data:userReward:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['data:userReward:delete']">删除</el-button>
      </el-col>
    </el-row>
    
    <!--列表数据-->
    <el-table v-loading="loading" :data="userRewardList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="90">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.sourceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="得分" align="center" width="100">
        <template #default="scope">
          <span class="link-type" @click="showDetail(scope.row)">{{ scope.row.rewards }}</span>
        </template>
      </el-table-column>
      <el-table-column label="累计积分" align="center">
        <template #default="scope">
          <span>{{ scope.row.afterPoints }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center"  width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="70" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['data:userReward:delete']">删除
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

    
    <!-- 来源详情 -->
    <SourceDetail ref="sourceDetailRef" />
    
  </div>
</template>

<script setup name="UserReward">
  import { fetchList, deleteUserReward } from "@/api/data/userReward";
  import { getUserStatTree } from "@/api/report/stat/userStat";
  import { getUserPlanTree } from "@/api/report/plan/userPlan";
  import SourceDetail from './sourceDetail.vue'

  const { proxy } = getCurrentInstance();

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
  const userRewardList = ref([]);
  const sourceOptions = ref([]);
  const sourceIdOptions = ref([]);
  
  const sourceDetailRef = ref();
  
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
  
  /** 消息来源详情 */
  function showDetail(row){
    sourceDetailRef.value.showData(row.id)
  }
  
  /** 来源选择菜单改变 */
  function handleSourceChange(source){
    sourceIdOptions.value = [];
    queryParams.value.sourceId = null;
    if(source=='STAT'){
      getUserStatTree().then(response => {
        sourceIdOptions.value = response;
      });
    }else if(source=='PLAN'){
      getUserPlanTree().then(response => {
        sourceIdOptions.value = response;
      });
    }
  }
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    userRewardList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        userRewardList.value = response.rows;
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
  function handleCreate(row) {
    formRef.value.openForm(null, 'create');
  }
  
  /** 关闭按钮操作 */
  function handleFinish(row) {
    const id = row.calendarId;
    formRef.value.openForm(id, 'edit');
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.id || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.id || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteUserReward(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
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
    proxy.getEnumDict('BussSource', 'FIELD', false).then(response => {
      sourceOptions.value = response;
    });
  })
</script>