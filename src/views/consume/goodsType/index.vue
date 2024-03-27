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
          style="width: 240px">
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['consume:goodType:treeList']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['consume:goodsType:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table
      v-loading="loading"
      :data="goodsTypeList"
      row-key="typeId"
      ref="tableRef"
      lazy
      :load="loadChildren"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="名称" min-width="200px" fixed="left" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.children!=null&&scope.row.children.length>0">
            <svg-icon icon-class="tree" />
          </span>
          <span v-else-if="scope.row.pid==0">
            <svg-icon icon-class="tree" />
          </span>
          <span v-else>
            <i class="user-solid"></i>
          </span>
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="行为名称" width="180px">
        <template #default="scope">
          <span>{{ scope.row.behaviorName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.stat==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.status=='ENABLE'">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="210" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            type="success"
            link
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['consume:goodsType:edit']">修改</el-button>
          <el-button
            type="primary"
            link
            icon="plus"
            @click="handleCreate(scope.row)"
            v-hasPermi="['consume:goodsType:create']">新增</el-button>
          <el-button
            type="danger"
            link
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['consume:goodsType:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单 -->
    <GoodsTypeForm ref="formRef" @success="refreshRow" />

  </div>
</template>

<script setup name="GoodsType">
  import { fetchTreeList, deleteGoodsType, getGoodsType } from "@/api/consume/goodsType";
  import GoodsTypeForm from './form.vue'

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
  const goodsTypeList = ref([]);

  //旧的父id
  const oldPid = ref(undefined);

  const data = reactive({
    queryParams: {
      page: 0,
      pageSize: 10,
      name: undefined,
      pid: 0
    }
  });

  const { queryParams } = toRefs(data);

  /** 查询列表 */
  function getList() {
    loading.value = true;
    goodsTypeList.value = [];
    fetchTreeList(queryParams.value).then(
      response => {
        goodsTypeList.value = response;
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

  //局部刷新使用
  let tableRef = ref();

  //加载子节点
  function loadChildren(tree, treeNode, resolve) {
    //this.loading = true;
    const para = {
      pid: tree.typeId
    }
    fetchTreeList(para).then(
      response => {
        resolve(response);
      }
    );
  }

  /** 刷新节点 */
  function refreshRow(pid) {
    if (pid == 0) {
      //第一级菜单，刷新整个列表
      getList();
      return;
    }
    if (pid !== oldPid.value) {
      //先刷新原来的节点,否则会导致重复key，因为该节点在新老父节点里都存在
      refreshRowData(oldPid.value);
    }
    refreshRowData(pid);
  }

  /** 刷新节点 */
  function refreshRowData(pid) {
    if (pid == undefined || pid == null) {
      return;
    }
    getGoodsType(pid).then(response => {
      let row = response;
      //不管父节点之前有没有加载过数据，重置父节点
      tableRef.value.store.states.treeData.value[row.typeId].loaded = false;
      //加载数据并展开父节点
      tableRef.value.store.loadOrToggle(row);
    });

  }

  /** 新增按钮操作 */
  function handleCreate(row) {
    let pid = null;
    if (row != null) {
      pid = row.typeId;
    }
    formRef.value.openForm(null, 'create', pid);
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.typeId || ids.value.join(",");
    formRef.value.openForm(id, 'edit', null);
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.typeId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteGoodsType(deleteIds);
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