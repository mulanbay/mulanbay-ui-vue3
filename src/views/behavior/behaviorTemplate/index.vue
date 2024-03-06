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
      <el-form-item label="业务类型" prop="bussType">
        <el-select v-model="queryParams.bussType" clearable style="width: 120px" placeholder="请选择">
          <el-option
            v-for="dict in bussTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"/>
        </el-select>
      </el-form-item>
      <el-form-item label="模版状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 120px"
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['behavior:behaviorTemplate:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['behavior:behaviorTemplate:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['behavior:behaviorTemplate:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['behavior:behaviorTemplate:delete']">删除</el-button>
      </el-col>
    </el-row>
    <!--列表数据-->
    <el-table v-loading="loading" :data="behaviorTemplateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="templateId" sortable="custom" align="center" width="90">
        <template #default="scope">
          <span>{{ scope.row.templateId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" fixed="left" min-width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.templateName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务类型" align="center" width="100" >
        <template #default="scope">
          <span>{{ scope.row.bussTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置项" width="100" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleBindList(scope.row)"><el-icon><Grid /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="等级" align="center">
        <template #default="scope">
          <span>{{ scope.row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column label="月分析" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.monthStat==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="天分析" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.dayStat==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="小时分析" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.hourStat==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
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
      <el-table-column label="创建时间" align="center"  width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['behavior:behaviorTemplate:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['behavior:behaviorTemplate:delete']">删除
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
    <BehaviorTemplateForm ref="formRef" @success="getList" />

    <!-- 条件绑定列表 -->
    <StatBindConfigList ref="statBindConfigListRef" />
    
  </div>
</template>

<script setup name="BehaviorTemplate">
  import { fetchList, deleteBehaviorTemplate } from "@/api/behavior/behaviorTemplate";
  import BehaviorTemplateForm from './form.vue'
  import StatBindConfigList from '../../report/bind/statBindConfig/index.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const statBindConfigListRef = ref();

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
  const behaviorTemplateList = ref([]);
  const statusOptions = ref(proxy.commonStatusOptions);
  const bussTypeOptions = ref([]);
  
  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);
  
  /** 绑定值列表 */
  function handleBindList(row){
    statBindConfigListRef.value.showData(row.templateId,'BEHAVIOR')
  }
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    behaviorTemplateList.value = [];
    fetchList(queryParams.value).then(
      response => {
        behaviorTemplateList.value = response.rows;
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
    const id = row.templateId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.templateId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteBehaviorTemplate(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.templateId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    proxy.getEnumDict('BussType', 'FIELD', false).then(response => {
      bussTypeOptions.value = response;
    });
  })
</script>