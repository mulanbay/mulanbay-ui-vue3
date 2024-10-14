<template>

  <!-- 对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" >
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['sport:sport:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['sport:sport:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="exerciseList"  @selection-change="handleSelectionChange">
      <el-table-column label="ID" fixed="left" prop="exerciseId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.exerciseId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运动类型" align="center" min-width="80px">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.sport.sportName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.exerciseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼值" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.value+scope.row.sport.unit }}</span>
          <span v-if="'CURRENT' ==scope.row.mileageBest">
            <el-tooltip content="当前最佳" effect="dark" placement="top">
              <el-icon color="green"><Flag /></el-icon>
            </el-tooltip>
          </span>
          <span v-if="'ONCE' ==scope.row.mileageBest">
            <el-tooltip content="历史最佳" effect="dark" placement="top">
              <el-icon color="blue"><StarFilled /></el-icon>
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼时长" align="center">
        <template #default="scope">
          <span v-if="scope.row.duration<60" style="color: red;">
            {{ formatMinutes(scope.row.duration) }}
          </span>
          <span v-else>{{ formatMinutes(scope.row.duration) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['sport:exercise:delete']">删除
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
      
  </el-dialog>

  <!-- 表单 -->
  <ExerciseForm ref="formRef" @success="getList" />
  
</template>

<script setup name="ExperienceExercise">
  import { fetchList, deleteExercise, getExercise } from "@/api/sport/exercise";
  import ExerciseForm from '../../sport/exercise/form.vue'
  import { formatMinutes } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('锻炼信息');
  const open = ref(false);
  const formRef = ref();
  const exerciseList = ref([]);

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
  
  const data = reactive({
    queryParams: {
      page:1,
      pageSize:10,
      sortField: 'EXERCISE_TIME',
      sortType: 'desc'
    },
    rules: {
    }
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (expId) => {
    open.value = true;
    resetForm();
    queryParams.value.expId=expId;
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });
  
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
    if(queryParams.value.expId==null){
      proxy.$modal.msgError("没有经历编号绑定，无法新增");
      return;
    }
    formRef.value.openForm(null, 'create',queryParams.value.expId);
  }
  
  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.exerciseId || ids.value.join(",");
    formRef.value.openForm(id, 'edit',null);
  }
  
  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(queryParams.value).then(
      response => {
        exerciseList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }
  
  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.exerciseId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteExercise(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }
  
  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.exerciseId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
  

  /** 初始化 **/
  onMounted(() => {

  })
</script>