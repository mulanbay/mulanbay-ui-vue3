<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-if="fp==false">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['music:musicPracticeDetail:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="detailId" v-if="fp==false" sortable="custom" align="center" width="80" fixed="left">
        <template #default="scope">
          <span>{{ scope.row.detailId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="曲子" fixed="left" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.tune }}</span>
        </template>
      </el-table-column>
      <el-table-column label="练习周期" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.tuneType=='TECH'">
           {{ scope.row.times }}分钟
          </span>
          <span v-else>
            {{ scope.row.times }}遍
          </span>
        </template>
      </el-table-column>
      <el-table-column label="练习类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.tuneTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="水平" align="center">
        <template #default="scope">
          <span>{{ scope.row.levelName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="140"  align="center">
        <template #default="scope">
          <span class="link-type" @click="handleNameStat(scope.row)">
            曲子
          </span>
          ||
          <span class="link-type" @click="handleLevelStat(scope.row)">
            水平
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" v-if="fp==false" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #header>
          <el-button
            link
            type="primary"
            icon="plus"
            v-if="queryParams.practiceId!=null"
            @click="handleCreate"
            v-hasPermi="['music:musicPracticeDetail:create']">新增
          </el-button>
        </template>
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['music:musicPracticeDetail:delete']">删除
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
    <DetailForm ref="formRef" @success="getList" />

    <!-- 曲子统计 -->
    <NameStat ref="nameStatRef" />

    <!-- 水平统计 -->
    <LevelStat ref="levelStatRef" />

  </div>
</template>

<script setup name="MusicPracticeDetail">
  import { fetchList, deleteMusicPracticeDetail } from "@/api/music/musicPracticeDetail";
  import DetailForm from './form.vue'
  import NameStat from './nameStat.vue'
  import LevelStat from './levelStat.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const nameStatRef = ref();
  const levelStatRef = ref();
  
  //练习页码过来
  const fp = ref(false);
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
  // 查询列表数据
  const detailList = ref([]);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      practiceId: undefined
    }
  });

  const { queryParams } = toRefs(data);


  /** 打开弹窗 */
  const showData = async (practiceId) => {
    queryParams.value.practiceId = practiceId;
    fp.value = true;
    detailList.value = [];
    total.value = 0;
    if(practiceId==null){
      //proxy.$modal.msgError("没有上级练习记录");
      return;
    }
    handleQuery();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    detailList.value = [];
    fetchList(queryParams.value).then(
      response => {
        detailList.value = response.rows;
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

  /** 按曲子统计按钮操作 */
  function handleNameStat(row) {
    nameStatRef.value.showData(row.detailId);
  }
  
  /** 按水平统计按钮操作 */
  function handleLevelStat(row) {
    levelStatRef.value.showData(row.detailId);
  }

  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null, 'create',queryParams.value.practiceId);
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.detailId || ids.value.join(",");
    formRef.value.openForm(id, 'edit',queryParams.value.practiceId);
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.detailId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteMusicPracticeDetail(deleteIds);
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

  /** 初始化 **/
  onMounted(() => {
    if(fp.value == false){
      getList();
    }
  })
</script>