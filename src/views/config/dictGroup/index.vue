<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 320px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['config:dictGroup:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['config:dictGroup:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['config:dictGroup:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['config:dictGroup:delete']">删除
        </el-button>
      </el-col>
    </el-row>


    <!--列表数据-->
    <el-table v-loading="loading" :data="dictGroupList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="groupId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.groupId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.groupName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="字典项" width="100" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleItemList(scope.row)">
            <el-icon><Grid /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="代码" align="center" width="160" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示顺序" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.status=='ENABLE'">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="CopyDocument"
            @click="handleCopy(scope.row)"
            v-hasPermi="['config:dictGroup:copy']">复制
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['config:dictGroup:delete']">删除
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

    <!-- 明细列表页面 -->
    <el-dialog :title="itemListTitle" width="950px" v-model="itemListOpen" append-to-body>
      <DictItemList ref="dictItemRef" />
    </el-dialog>

    <!-- 表单 -->
    <DictGroupForm ref="formRef" @success="getList" />

  </div>
</template>

<script setup name="DictGroup">
  import { fetchList, deleteDictGroup } from "@/api/config/dictGroup";
  import DictItemList from '../dictItem/index'
  import DictGroupForm from './form.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const dictItemRef = ref();

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
  const dictGroupList = ref([]);

  //字典项
  // 弹出层标题
  const itemListTitle = ref("");
  // 是否显示弹出层
  const itemListOpen = ref(false);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      name: undefined,
      status: undefined
    }
  });

  //toRefs() 函数可以将 reactive() 创建出来的响应式对象，转换为普通的对象，相当于变成一个个的ref()
  const { queryParams } = toRefs(data);

  /** 查询列表 */
  function getList() {
    loading.value = true;
    dictGroupList.value = [];
    fetchList(queryParams.value).then(
      response => {
        dictGroupList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    dictGroupList.value = [];
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    dictGroupList.value = [];
    queryParams.value.page = 1;
    handleQuery();
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.groupId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 字典项操作 */
  function handleItemList(row) {
    itemListOpen.value = true;
    itemListTitle.value = "[" + row.groupName + "]字典项";
    setTimeout(function() {
      dictItemRef.value.showData(row.groupId);
    }, 500);
  }

  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null, 'create');
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.groupId || ids.value.join(",")
    formRef.value.openForm(id, 'edit');
  }

  /** 复制按钮操作 */
  function handleCopy(row) {
    const id = row.groupId
    formRef.value.openForm(id, 'copy');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.groupId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteDictGroup(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
  })
</script>