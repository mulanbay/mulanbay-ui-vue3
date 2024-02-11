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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:treat:treatDrug:list']">搜索</el-button>
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
          v-hasPermi="['health:treat:treatDrug:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['health:treat:treatDrug:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:treat:treatDrug:delete']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          v-if="queryParams.treatId!=null"
          @click="handleCopyDetail"
          v-hasPermi="['health:treat:treatDrugDetail:copy']">复制明细</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="treatDrugList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="drugId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.drugId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="药品名" fixed="left" width="230" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.active == true">
            <el-tag type="success">用药中</el-tag>
          </span>
          <span v-if="scope.row.available==false">
            <el-tag type="danger">无效</el-tag>
          </span>
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.drugName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="明细" width="80" align="center">
        <template #default="scope">
          <el-tooltip class="box-item" effect="dark" content="添加明细" placement="top">
            <span class="link-type" @click="handleAddDetail(scope.row)">
              <el-icon>
                <CirclePlusFilled />
              </el-icon>
            </span>
          </el-tooltip>
          <el-divider direction="vertical"></el-divider>
          <el-tooltip class="box-item" effect="dark" content="明细列表" placement="top">
            <span class="link-type" @click="handleDetailList(scope.row)">
              <el-icon>
                <Grid />
              </el-icon>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="80" align="center">
        <template #default="scope">
          <el-tooltip class="box-item" effect="dark" content="日历统计" placement="top">
            <span class="link-type" @click="handleDetailCalendarStat(scope.row)"><el-icon>
                <Histogram />
              </el-icon>
            </span>
          </el-tooltip>
          <el-divider direction="vertical"></el-divider>
          <el-tooltip class="box-item" effect="dark" content="时间点统计" placement="top">
            <span class="link-type" @click="handleDetailTimeStat(scope.row)"><el-icon>
                <Compass />
              </el-icon>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="频率" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.perDay+'天' }}</span>
          <el-tag type="">{{ scope.row.perTimes }}</el-tag>
          次
        </template>
      </el-table-column>
      <el-table-column label="用药量" align="center" width="140">
        <template #default="scope">
          <span v-if="null !=scope.row.eu">
            每次
            <el-tag type="">{{ scope.row.ec }}</el-tag>
            {{ scope.row.eu }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="使用方式" align="center">
        <template #default="scope">
          <span>{{ scope.row.useWay }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病症状" min-width="140" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.treat.disease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医院" min-width="140" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.treat.hospital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="看病日期" width="110" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.treatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.amount+scope.row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药开始日期" width="110">
        <template #default="scope">
          <span>{{ scope.row.beginDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药结束日期" width="110">
        <template #default="scope">
          <span>{{ scope.row.endDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="器官">
        <template #default="scope">
          <span>{{ scope.row.treat.organ }}</span>
        </template>
      </el-table-column>
      <el-table-column label="确诊疾病" min-width="140" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.treat.confirmDisease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价" align="center">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.unitPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总价" align="center">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.totalPrice) }}</span>
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
      <el-table-column label="提醒" align="center" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.remind" disabled=""></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treatDrug:delete']">删除
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
    <TreatDrugForm ref="formRef" @success="getList" />

    <!-- 明细列表 -->
    <TreatDrugDetail ref="treatDrugDetailRef" />

    <!-- 明细表单 -->
    <TreatDrugDetailForm ref="treatDrugDetailFormRef" />

    <!-- 明细复制表单 -->
    <TreatDrugDetailCopyForm ref="treatDrugDetailCopyFormRef" />

    <!-- 日历统计 -->
    <TreatDrugDetailCalendarStat ref="treatDrugDetailCalendarStatRef" />

    <!-- 时间点统计 -->
    <TreatDrugDetailTimeStat ref="treatDrugDetailTimeStatRef" />

  </div>
</template>

<script setup name="TreatDrug">
  import { fetchList, getTreatDrugCateTree, deleteTreatDrug, getTreatDrug } from "@/api/health/treat/treatDrug";
  import { getTreatCateTree } from "@/api/health/treat/treat";
  import { getDay, getDayByDate, getNowDateString } from "@/utils/datetime";
  import TreatDrugForm from './form.vue'
  import TreatDrugDetail from '../treatDrugDetail/index.vue'
  import TreatDrugDetailForm from '../treatDrugDetail/form.vue'
  import TreatDrugDetailCopyForm from '../treatDrugDetail/copyForm.vue'
  import TreatDrugDetailCalendarStat from '../treatDrugDetail/calendarStat.vue'
  import TreatDrugDetailTimeStat from '../treatDrugDetail/timeStat.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const treatDrugDetailRef = ref();
  const treatDrugDetailFormRef = ref();
  const treatDrugDetailCopyFormRef = ref();
  const treatDrugDetailCalendarStatRef = ref();
  const treatDrugDetailTimeStatRef = ref();

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
  const treatDrugList = ref([]);
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
  const showData = async (treatId) => {
    queryParams.value.treatId = treatId;
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

  /** 查询列表 */
  function getList() {
    loading.value = true;
    treatDrugList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        let dataList = response.rows;
        const n = dataList.length;
        const nowTime = new Date(Date.parse(getNowDateString().replace(/-/g, "/")));
        for (let i = 0; i < n; i++) {
          let row = dataList[i];
          //先计算出days供下面的方法使用
          if (!proxy.isEmpty(row.beginDate) && !proxy.isEmpty(row.endDate)) {
            const bd = new Date(Date.parse(row.beginDate.replace(/-/g, "/")));
            const ed = new Date(Date.parse(row.endDate.replace(/-/g, "/")));
            const s1 = parseInt(bd - nowTime);
            const s2 = parseInt(ed - nowTime);
            if (s1 < 0 && s2 >= 0) {
              row.active = true;
            } else {
              row.active = false;
            }
          }
        }
        treatDrugList.value = dataList;
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
  
  /** 日历统计操作 */
  function handleDetailCalendarStat(row){
    treatDrugDetailCalendarStatRef.value.showData(row.drugId,row.drugName);
  }

  /** 时间点统计操作 */
  function handleDetailTimeStat(row){
    treatDrugDetailTimeStatRef.value.showData(row.drugId,row.drugName);
  }
  
  /** 复制明细操作 */
  function handleCopyDetail(){
    treatDrugDetailCopyFormRef.value.openForm(queryParams.value.treatId,null);
  }
  
  /** 新增明细按钮操作 */
  function handleAddDetail(row) {
    treatDrugDetailFormRef.value.openForm(null, 'create', row.drugId);
  }

  /** 明细列表按钮操作 */
  function handleDetailList(row) {
    treatDrugDetailRef.value.showData(row.drugId);
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
    const id = row.drugId || ids.value.join(",");
    formRef.value.openForm(id, 'edit', null);
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.drugId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteTreatDrug(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.drugId)
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