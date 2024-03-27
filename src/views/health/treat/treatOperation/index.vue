<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="用药日期" v-show="moreCdn==true" style="width: 308px">
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
      <el-form-item v-show="moreCdn==true" label="疾病标签" prop="tags">
        <el-select
          v-model="queryParams.tags"
          placeholder="疾病标签"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in tagsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:treat:treatOperation:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          v-if="queryParams.treatId!=null"
          @click="handleCreate"
          v-hasPermi="['health:treat:treatOperation:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['health:treat:treatOperation:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:treat:treatOperation:delete']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="TrendCharts"
          @click="handleStat"
          v-hasPermi="['health:treat:treatOperation:stat']">统计</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="treatOperationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="operationId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.operationId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医院" min-width="160" align="center" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.treat.hospital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手术/检查项目" fixed="left" width="160" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.operationName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检测报告" width="80" align="center">
        <template #default="scope">
          <el-tooltip class="box-item" effect="dark" content="明细" placement="top">
            <span class="link-type" @click="handleTreatTest(scope.row)">
              <el-icon><Grid /></el-icon>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="疾病症状" min-width="140" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.treat.disease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="器官" align="center">
        <template #default="scope">
          <span>{{ scope.row.treat.organ }}</span>
        </template>
      </el-table-column>
      <el-table-column label="确诊疾病" min-width="140" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.treat.confirmDisease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="费用" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.fee) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手术/检查日期" width="110" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.treatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="距离现在" width="110" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.tdDays>=365" style="color: red;">
           {{ scope.row.tdDaysStr }}
          </span>
          <span v-else-if="scope.row.tdDays>=90" style="color: purple;">
           {{ scope.row.tdDaysStr }}
          </span>
          <span v-else-if="scope.row.tdDays>=30" style="color: green;">
           {{ scope.row.tdDaysStr }}
          </span>
          <span v-else>
           {{ scope.row.tdDaysStr }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="复查日期" width="110" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.rdDays>=365" style="color: black;">
           {{ scope.row.reviewDate }}
          </span>
          <span v-else-if="scope.row.tdDays>=90" style="color: purple;">
           {{ scope.row.reviewDate }}
          </span>
          <span v-else-if="scope.row.tdDays>=30" style="color: #8b008b;">
           {{ scope.row.reviewDate }}
          </span>
          <span v-else style="color: red;">
           {{ scope.row.reviewDate }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="是否有效" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.available==true">
            <el-icon color="green">
              <SuccessFilled />
            </el-icon>
          </span>
          <span v-else>
            <el-icon color="red">
              <CircleCloseFilled />
            </el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="病情" align="center" width="60">
        <template #default="scope">
          <span v-if="scope.row.sick==true" style="color: red;">
            <el-tag type="danger">病</el-tag>
          </span>
          <span v-else style="color: green;">
            <el-tag type="success">无</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="分类" >
        <template #default="scope">
          <span>{{ scope.row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treatOperation:delete']">删除
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
    <TreatOperationForm ref="formRef" @success="getList" />

    <!-- 检验结果列表页面 -->
    <el-dialog :title="treatTestTitle" width="900px" v-model="treatTestOpen" append-to-body>
      <TreatTest ref="treatTestRef" />
    </el-dialog>
    
    <!-- 统计 -->
    <TreatOperationStat ref="treatOperationStatRef" />
    
  </div>
</template>

<script setup name="TreatOperation">
  import { fetchList, getTreatOperationCateTree, deleteTreatOperation, getTreatOperation } from "@/api/health/treat/treatOperation";
  import { getTreatCateTree } from "@/api/health/treat/treat";
  import { getDay, getDayByDate, getNowDateString,formatDays } from "@/utils/datetime";
  import TreatOperationForm from './form.vue'
  import TreatTest from '../treatTest/index.vue'
  import TreatOperationStat from './stat.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  
  //检验结果
  const treatTestTitle = ref('检验结果');
  const treatTestOpen = ref(false);
  const treatTestRef = ref();
  const treatOperationStatRef = ref();

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

  //从父级页面过来
  const fp = ref(false);
  // 查询列表数据
  const treatOperationList = ref([]);
  const tagsOptions = ref([]);

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    queryParams: {
      treatId: undefined,
      page: 1,
      pageSize: 10,
      name: undefined
    }
  });

  const { queryParams } = toRefs(data);

  /** 显示数据 */
  const showData = async (treatId,tags) => {
    queryParams.value.treatId = treatId;
    queryParams.value.tags = tags;
    fp.value = true;
    handleQuery();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

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
  
  /** 统计 */
  function handleStat(){
    treatOperationStatRef.value.showData();
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    treatOperationList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        let dataList = response.rows;
        const n = dataList.length;
        const nowTime = new Date();
        for (let i = 0; i < n; i++) {
          let row = dataList[i];
          const td = new Date(Date.parse(row.treatDate.replace(/-/g,"/")));
          const tdDays = (parseInt(nowTime - td)) / (1000*24*3600);
          const tdDaysStr = formatDays(tdDays);
          row.tdDays=tdDays;
          row.tdDaysStr=tdDaysStr;
          if(!proxy.isEmpty(row.reviewDate)){
            const rd = new Date(Date.parse(row.treatDate.replace(/-/g,"/")));
            const rdDays = (parseInt(nowTime - rd)) / (1000*24*3600);
            row.rdDays = rdDays;
          }
        }
        treatOperationList.value = dataList;
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
  
  /** 检验报告 */
  function handleTreatTest(row){
    treatTestTitle.value = '[' + row.operationName + ']检验结果列表';
    treatTestOpen.value = true;
    setTimeout(function() {
      treatTestRef.value.showData(row.operationId);
    }, 500);
  }

  /** 新增按钮操作 */
  function handleCreate() {
    if (queryParams.value.treatId == null) {
      proxy.$modal.msgError("没有看病记录编号绑定，无法新增");
      return;
    }
    formRef.value.openForm(null, 'create', queryParams.value.treatId);
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.operationId || ids.value.join(",");
    formRef.value.openForm(id, 'edit', null);
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.operationId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteTreatOperation(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.operationId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    proxy.$nextTick(()=>{
      if (fp.value == false) {
        getList();
      }
    });
    getTreatCateTree('tags', false).then(
      response => {
        tagsOptions.value = response;
      }
    );
  })
</script>