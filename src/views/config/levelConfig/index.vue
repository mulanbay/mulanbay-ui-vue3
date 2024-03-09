<template>
  <div class="app-container">

    <el-form :model="queryParams" ref="queryRef" :inline="true" >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 120px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['config:levelConfig:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['config:levelConfig:create']">新增</el-button>
      </el-form-item>
    </el-form>
    
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['config:levelConfig:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['config:levelConfig:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['config:levelConfig:delete']">删除
        </el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="levelConfigList"  @selection-change="handleSelectionChange">
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="级别名称" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.levelName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="级别" align="center" >
        <template #default="scope">
          <span>{{ scope.row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最低积分" align="center" >
        <template #default="scope">
          <span>{{ scope.row.points }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最低积分天数" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.pointsDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最低评分" align="center" >
        <template #default="scope">
          <span>{{ scope.row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最低评分天数" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.scoreDays }}</span>
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
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['config:levelConfig:delete']">删除
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
  <LevelConfigForm ref="formRef" @success="getList" />
  
  </div>
</template>

<script setup name="LevelConfig">
  import { fetchList,deleteLevelConfig } from "@/api/config/levelConfig";
  import LevelConfigForm from './form.vue'

  const { proxy } = getCurrentInstance();

  const formRef = ref();
  
  const levelConfigList = ref([]);
  // 遮罩层
  const loading = ref(false);
  // 选中数组
  const ids = ref([]);
  // 非单个禁用
  const single = ref(true);
  // 非多个禁用
  const multiple = ref(true);
  // 总条数
  const total = ref(0);

  const data = reactive({
    queryParams: {
      page:1,
      pageSize:10
    },
    rules: {
    }
  });

  const { queryParams, rules } = toRefs(data);

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    getList();
  }

  // 表单重置
  function resetForm() {
    proxy.resetForm("queryRef");
  }
  
  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null, 'create');
  }
  
  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.id || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }
  
  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(queryParams.value).then(
      response => {
        levelConfigList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }
  
  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.id || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteLevelConfig(deleteIds);
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
  })
</script>