<template>

  <!-- 对话框 -->
  <el-dialog :title="title" v-model="open" width="550px" append-to-body class="customDialogCss">
    
    <el-row>
      <el-col :span="24" align="center">
        <div>
          <el-descriptions class="margin-top" :column="1" border>
            <el-descriptions-item width="150px">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <house />
                  </el-icon>
                  累计次数
                </div>
              </template>
              {{ statData.totalCount}}次
            </el-descriptions-item>
            <el-descriptions-item width="150px">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <Tools />
                  </el-icon>
                  累计时长
                </div>
              </template>
              {{ formatMinutes(statData.totalDuration)}}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>
    </el-row>
    <el-divider content-position="center">明细列表</el-divider>
    
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['read:readDetail:list']">搜索</el-button>
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['read:readDetail:create']">新增</el-button>
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['read:readDetail:edit']">修改</el-button>
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['read:readDetail:delete']">删除</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="readDetailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="detailId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.detailId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="阅读时间" align="center" width="180">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.readTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="阅读时长" align="center">
        <template #default="scope">
          <span>{{ formatMinutes(scope.row.duration) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['read:readDetail:delete']">删除
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
  <ReadDetailForm ref="formRef" @success="getList" />

</template>

<script setup name="ReadDetail">
  import { fetchList, deleteReadDetail } from "@/api/read/readDetail";
  import { getBookCostTimes } from "@/api/read/book";
  import { formatMinutes } from "@/utils/datetime";
  import ReadDetailForm from './form.vue'

  const { proxy } = getCurrentInstance();

  const title = ref('阅读明细');
  const open = ref(false);
  const formRef = ref();

  const readDetailList = ref([]);
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
    statData:{},
    queryParams: {
      page: 1,
      pageSize: 10
    },
    rules: {}
  });

  const { statData,queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (bookId) => {
    open.value = true;
    resetForm();
    queryParams.value.bookId = bookId;
    getList();
    getCostTimes();
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
    if (queryParams.value.bookId == null) {
      proxy.$modal.msgError("没有经历编号绑定，无法新增");
      return;
    }
    formRef.value.openForm(null, 'create', queryParams.value.bookId);
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.detailId || ids.value.join(",");
    formRef.value.openForm(id, 'edit', null);
  }

  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(queryParams.value).then(
      response => {
        readDetailList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.detailId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteReadDetail(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.detailId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
  
  /** 花费时间 */
  function getCostTimes() {
    statData.value = {};
    getBookCostTimes(queryParams.value.bookId).then(response => {
      if(response==null){
        return;
      }
      statData.value = response;
    });
  }


  /** 初始化 **/
  onMounted(() => {

  })
</script>