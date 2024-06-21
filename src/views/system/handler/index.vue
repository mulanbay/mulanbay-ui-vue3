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
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['system:handler:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="handlerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="160px">
        <template #default="scope">
          <span class="link-type" @click="handleHandlerInfo(scope.row)">
            {{ scope.row.handlerName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="类名" min-width="200px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatClassName(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="自检结果" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.checkResult==null" style="color: blueviolet;">
            未自检
          </span>
          <span v-else-if="scope.row.checkResult==true">
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
      <el-table-column label="发送命令" align="center" width="80">
        <template #default="scope">
          <span class="link-type" @click="handleMethod(scope.row)">
            <svg-icon icon-class="command" class-name="card-panel-icon" />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="HASH值" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.hash }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="refresh"
            @click="handleCheck(scope.row)"
            v-hasPermi="['system:handler:check']">自检</el-button>
          <el-button
            link
            type="primary"
            icon="RefreshLeft"
            @click="handleReload(scope.row)"
            v-hasPermi="['system:handler:reload']">重载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 详情 -->
    <InfoForm ref="infoFormRef" />

    <!-- 方法命令 -->
    <MethodForm ref="methodFormRef" />

  </div>
</template>

<script setup name="Handler">
  import { fetchList, checkHandler, reloadHandler } from "@/api/system/handler";
  import InfoForm from './info.vue'
  import MethodForm from './method.vue'

  const { proxy } = getCurrentInstance();

  const infoFormRef = ref();
  const methodFormRef = ref();

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
  const handlerList = ref([]);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);

  /** 类名 */
  function formatClassName(row) {
    let className = row.className;
    let cs = className.split('.');
    return cs[cs.length - 1];
  }

  /** 详情 */
  function handleHandlerInfo(row) {
    infoFormRef.value.openInfo(row.className);
  }

  /** 命令 */
  function handleMethod(row) {
    methodFormRef.value.openMethod(row.className);
  }

  /** 自检 */
  function handleCheck(row) {
    let data = {
      className: row.className
    }
    checkHandler(data).then(
      response => {
        if (response == null) {
          proxy.$modal.msgWarning("无自检方法");
        } else if (response == true) {
          proxy.$modal.msgSuccess("自检成功");
        } else {
          proxy.$modal.msgError("自检失败");
        }

      }
    );
  }

  /** 重载 */
  function handleReload(row) {
    let data = {
      className: row.className
    }
    reloadHandler(data).then(
      response => {
        proxy.$modal.msgSuccess("重载成功");
      }
    );
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    handlerList.value = [];
    fetchList(queryParams.value).then(
      response => {
        handlerList.value = response.rows;
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
    ids.value = selection.map(item => item.code)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
  })
</script>