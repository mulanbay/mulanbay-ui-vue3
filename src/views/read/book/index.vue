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
      <el-form-item label="图书分类" prop="cateId">
        <el-select
          v-model="queryParams.cateId"
          placeholder="图书分类"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in cateIdOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="阅读状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['read:book:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['read:book:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['read:book:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['read:book:delete']">删除</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="bookList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="bookId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.bookId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图书分类" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.cate.cateName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="书籍名称" fixed="left" min-width="280px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.secondhand==true" style="color: green;">
            <el-tag type="warning">二手</el-tag>
          </span>
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.bookName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template #default="scope">
          <span v-if="scope.row.status =='READED'">
            <span style="color:green">{{ scope.row.statusName }}</span>
          </span>
          <span v-else-if="scope.row.status =='UNREAD'">
            <span style="color:red">{{ scope.row.statusName }}</span>
          </span>
          <span v-else-if="scope.row.status =='READING'">
            <span style="color:purple">{{ scope.row.statusName }}</span>
          </span>
          <span v-else>
            <span>{{ scope.row.statusName }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="明细" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleReadList(scope.row)">
            <el-icon><Grid /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="借入/购买日期" align="center" width="120">
        <template #default="scope">
          <span v-if="scope.row.storeDate ==null">
            <span>--</span>
          </span>
          <span v-else-if="calcuDays(scope.row.storeDate)<=30">
            <span style="color:red">{{ scope.row.storeDate }}</span>
          </span>
          <span v-else>
            <span>{{ scope.row.storeDate }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="期望完成日期" align="center" width="120">
        <template #default="scope">
          <span v-if="scope.row.expertFinishDate ==null">
            <span>--</span>
          </span>
          <span v-else-if="(0-calcuDays(scope.row.expertFinishDate))<=30">
            <span style="color:red">{{ scope.row.expertFinishDate }}</span>
          </span>
          <span v-else>
            <span>{{ scope.row.expertFinishDate }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="作者" min-width="100px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="国家" align="center">
        <template #default="scope">
          <span>{{ scope.row.country==null ? null:scope.row.country.cnName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评分" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="语言" align="center">
        <template #default="scope">
          <span>{{ scope.row.languageName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center">
        <template #default="scope">
          <span>{{ scope.row.sourceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="书籍类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.bookTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.beginDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成日期" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.finishDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时长" align="center" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.costDays>=30">
            <span style="color:red">{{ formateCostDays(scope.row.costDays) }}</span>
          </span>
          <span v-else>
            <span>{{ formateCostDays(scope.row.costDays) }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="出版年份" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.publishYear }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['read:book:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['read:book:delete']">删除
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
    <BookForm ref="formRef" @success="getList" />

    <!-- 阅读明细列表 -->
    <ReadDetailList ref="readDetailListRef" />

  </div>
</template>

<script setup name="Book">
  import { fetchList, deleteBook } from "@/api/read/book";
  import { getBookCategoryTree } from "@/api/read/bookCategory";
  import { getNowDateString, dateDiff, formatDays, formatSeconds } from "@/utils/datetime";
  import BookForm from './form.vue'
  import ReadDetailList from '../readDetail/index.vue'
  import { ElMessageBox } from 'element-plus'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('图书');
  const open = ref(false);
  const formRef = ref();
  const cateIdOptions = ref([]);
  const statusOptions = ref([]);

  const readDetailListRef = ref();

  const bookList = ref([]);
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
      page: 1,
      pageSize: 10
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  /** 计算时间 */
  function calcuDays(date) {
    return dateDiff(getNowDateString(), date);
  }

  /** 计算时间 */
  function formateCostDays(date) {
    return formatDays(date);
  }

  /** 阅读明细列表 */
  function handleReadList(row) {
    readDetailListRef.value.showData(row.bookId);
  }

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
    const id = row.bookId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(queryParams.value).then(
      response => {
        bookList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.bookId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteBook(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.bookId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }


  /** 初始化 **/
  onMounted(() => {
    getList();
    getBookCategoryTree(false).then(response => {
      cateIdOptions.value = response;
    });
    proxy.getEnumDict('BookStatus', 'FIELD', false).then(response => {
      statusOptions.value = response;
    });
  })
</script>