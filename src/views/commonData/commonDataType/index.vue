<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['commonData:commonDataType:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['commonData:commonDataType:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['commonData:commonDataType:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['commonData:commonDataType:delete']">删除</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="commonDataTypeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="typeId" sortable="custom" align="center" width="90">
        <template #default="scope">
          <span>{{ scope.row.typeId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" fixed="left" min-width="200px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="组名" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.groupName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单位" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示顺序" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="120">
        <template #default="scope">
          <span v-if="scope.row.status=='ENABLE'">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="月度分析" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.monthStat==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="年度分析" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.yearStat==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="八小时外分析" align="center" width="120">
        <template #default="scope">
          <span v-if="scope.row.overWorkStat==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="积分" align="center">
        <template #default="scope">
          <span>{{ scope.row.rewardPoint }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['commonData:commonDataType:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['commonData:commonDataType:delete']">删除
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
    <CommonDataTypeForm ref="formRef" @success="getList" />

  </div>
</template>

<script setup name="CommonDataType">
  import { fetchList, deleteCommonDataType } from "@/api/commonData/commonDataType";
  import {formatDays} from "@/utils/datetime";
  import CommonDataTypeForm from './form.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();

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
  const commonDataTypeList = ref([]);
  const statusOptions = ref(proxy.commonStatusOptions);
  
  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);

  /** 查询列表 */
  function getList() {
    loading.value = true;
    commonDataTypeList.value = [];
    fetchList(queryParams.value).then(
      response => {
        commonDataTypeList.value = response.rows;
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
    formRef.value.openForm(null, 'create');
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.typeId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.typeId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteCommonDataType(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.typeId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
  })
</script>