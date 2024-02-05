<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="组号" prop="groupId">
        <el-input
          v-model="queryParams.groupId"
          placeholder="请输入组号"
          disabled
          style="width: 120px" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 120px"
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['config:dictItem:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['config:dictItem:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['config:dictItem:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['config:dictItem:delete']">删除
        </el-button>
      </el-col>
    </el-row>


    <!--列表数据-->
    <el-table v-loading="loading" :data="dictItemList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="itemId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.itemId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="120px">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.itemName }}</span>
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
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="ENABLE" inactive-value="DISABLE" @click="handleChangeStatus(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['config:dictItem:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['config:dictItem:delete']">删除
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
    <DictItemForm ref="formRef" @success="getList" />

  </div>
</template>

<script setup name="DictItem">
  import { fetchList, getDictItem, createDictItem, editDictItem, deleteDictItem } from "@/api/config/dictItem";
  import {deepClone} from "@/utils/index";
  import DictItemForm from './form.vue'
  
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
  const dictItemList = ref([]);
  const commonStatusOptions = ref(proxy.commonStatusOptions);

  // 弹出层标题
  const title = ref("");
  // 是否显示弹出层
  const open = ref(false);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      groupId: undefined,
      name: undefined,
      status: undefined
    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 打开弹窗 */
  const showData = async (groupId) => {
    // 需要设置，否则第一次点击设置值
    queryParams.value.groupId = groupId;
    handleQuery();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({showData});
  
  /** 查询列表 */
  function getList() {
    //console.log('groupId:'+props.groupInfo.groupId);
    loading.value = true;
    dictItemList.value = [];
    fetchList(queryParams.value).then(
      response => {
        dictItemList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    dictItemList.value = [];
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    dictItemList.value = [];
    queryParams.value.page = 1;
    queryParams.value.groupId = props.groupInfo.groupId;
    handleQuery();
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.itemId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
  
  /** 修改状态按钮操作 */
  function handleChangeStatus(row){
    var changeForm = deepClone(row);
    changeForm.groupId = row.group.groupId;
    changeForm.group = null;
    if(row.status == 'ENABLE'){
      changeForm.status = 'DISABLE';
    }else{
      changeForm.status = 'ENABLE';
    }
    editDictItem(changeForm).then(response => {
      proxy.$modal.msgSuccess("修改成功");
      getList();
    });
  }
  
  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null,'create',queryParams.value.groupId);
  }
  
  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.itemId || ids.value.join(",")
    formRef.value.openForm(id,'edit',queryParams.value.groupId);
  }
  
  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.itemId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteDictItem(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>