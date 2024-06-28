<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item v-show="moreCdn==true" label="起止日期" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          unlink-panels
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="datePickerOptions"></el-date-picker>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="排序方式" prop="sortType">
        <el-select
          v-model="queryParams.sortType"
          placeholder="排序方式"
          @change="handleQuery"
          style="width: 120px">
          <el-option
            v-for="dict in sortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['life:note:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['life:note:create']">新增</el-button>
      </el-form-item>
    </el-form>


    <el-timeline v-loading="loading">
      <template v-for="item in noteList">
        <el-timeline-item :timestamp="item.createdTime" :type="item.type" placement="top">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <svg-icon :icon-class="item.icon" />
              <span>
                <el-text class="mx-1" type="primary">{{ item.title }}</el-text>
              </span>
              <el-button link type="success" style="float: right; padding: 3px 0" icon="edit" @click="handleEdit(item)"
                v-hasPermi="['life:note:edit']">
                修改
              </el-button>
              <el-button link type="danger" style="color: red;float: right; padding: 3px 0" icon="delete" @click="handleDelete(item)"
                v-hasPermi="['life:note:delete']">
                删除
              </el-button>
            </div>
            <div>
              {{ item.content }}
            </div>
          </el-card>
        </el-timeline-item>
      </template>
    </el-timeline>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 表单 -->
    <NoteForm ref="noteFormRef" @success="getList" />

  </div>
</template>

<script setup name="Note">
  import { fetchList, deleteNote } from "@/api/life/note";
  import { getBussIconClass } from "@/utils/planUtils";
  import NoteForm from './form.vue';

  const { proxy } = getCurrentInstance();

  const noteFormRef = ref(true);
  
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
  const noteList = ref([]);
  const sortTypeOptions = ref([]);

  // 弹出层标题
  const title = ref("");
  // 是否显示弹出层
  const open = ref(false);

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  /** 打开弹窗 */
  const showData = async () => {
    getList();
  }
  
  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    form: {},
    queryParams: {
      page: 1,
      pageSize: 10,
      sortField: 'createdTime',
      sortType: 'desc'
    },
    rules: {

    }
  });

  const { queryParams, form, rules } = toRefs(data);

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

  /** 新增 */
  function handleCreate() {
    noteFormRef.value.openForm(null);
  }

  /** 修改 */
  function handleEdit(row) {
    noteFormRef.value.openForm(row.noteId);
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.noteId;
    proxy.$confirm('是否确认删除"' + row.title + '"的便签信息?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteNote(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    noteList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        let datas = response.rows;
        const n = datas.length;
        for (let i = 0; i < n; i++) {
          let d = datas[i];
          d.icon = 'note';
          d.type = 'primary';
          noteList.value.push(d);
        }
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
    ids.value = selection.map(item => item.noteId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    proxy.getDictItemTree('SORT_TYPE', false).then(response => {
      sortTypeOptions.value = response;
    });
  })
</script>
<style>
  .my-label {
    width: 100px;
    color: #999;
    font-weight: normal;
    background: #fff;
  }
</style>