<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="统计模板" prop="templateId">
        <el-tree-select
          v-model="queryParams.templateId"
          style="width: 400px"
          :data="statTemplateOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择模版"
          :check-strictly="false"/>
      </el-form-item>
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="选择状态" v-show="moreCdn==true"  prop="status">
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['report:stat:userStat:list']">搜索</el-button>
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
          v-hasPermi="['report:stat:userStat:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['report:stat:userStat:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:stat:userStat:delete']">删除</el-button>
      </el-col>
    </el-row>
    <!--列表数据-->
    <el-table v-loading="loading" :data="userStatList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="statId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.statId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" fixed="left"  min-width="250" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="期望值" align="center" width="140">
        <template #default="scope">
          <span v-if="scope.row.compareType=='MORE'">
            {{ '>'+scope.row.expectValue+scope.row.unit }}
          </span>
          <span v-else>
            {{ '<'+scope.row.expectValue+scope.row.unit }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" width="80" align="center">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleStat(scope.row)"><el-icon><Histogram /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.status=='ENABLE'">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="日历时间" align="center">
        <template #default="scope">
          <span>{{ scope.row.calendarTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置提醒" align="center">
        <template #default="scope">
          <el-switch v-model="scope.row.remind" disabled ></el-switch>
          <span class="link-type" @click="showRemindSet(scope.row)"><el-icon><Tools /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
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
            v-hasPermi="['report:stat:userStat:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['report:stat:userStat:delete']">删除
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
    <UserStatForm ref="formRef" @success="getList" />
    
    <!-- 提醒表单 -->
    <UserStatRemindForm ref="userStatRemindFormRef" />
    
    <!-- 统计 -->
    <UserStatStat ref="userStatStatRef" />
    
  </div>
</template>

<script setup name="UserStat">
  import { fetchList, deleteUserStat } from "@/api/report/stat/userStat";
  import { getStatTemplateTree } from "@/api/report/stat/statTemplate";
  import UserStatForm from './form.vue'
  import UserStatRemindForm from '../userStatRemind/form.vue'
  import UserStatStat from './stat.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const userStatRemindFormRef = ref();
  const userStatStatRef = ref();
  const statTemplateOptions = ref();

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
  const userStatList = ref([]);
  const statusOptions = ref(proxy.commonStatusOptions);
  
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
  
  /** 统计 */
  function handleStat(row){
    userStatStatRef.value.showData(row.statId,row.title);
  }
  
  /** 提醒配置 */
  function showRemindSet(row){
    userStatRemindFormRef.value.openForm(row.statId);
  }
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    userStatList.value = [];
    fetchList(queryParams.value).then(
      response => {
        userStatList.value = response.rows;
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
    const id = row.statId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.statId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteUserStat(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.statId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    getStatTemplateTree().then(response => {
      statTemplateOptions.value = response;
    });
  })
</script>