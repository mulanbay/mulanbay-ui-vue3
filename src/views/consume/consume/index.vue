<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="起止日期" style="width: 308px">
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
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="商品类型" prop="goodsTypeId">
        <el-tree-select
          v-model="queryParams.goodsTypeId"
          style="width: 240px"
          :data="goodsTypeOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择商品类型"
          check-strictly
          clearable />
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="购买来源" prop="sourceId">
        <el-select
          v-model="queryParams.sourceId"
          placeholder="购买来源"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in sourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="排序方式" prop="sortField">
        <el-select
          v-model="queryParams.sortField"
          placeholder="字段"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in sortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="方式"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in sortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="是否二手" prop="secondhand">
        <el-select
          v-model="queryParams.secondhand"
          placeholder="二手类型"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in secondhandOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['consume:consume:list']">搜索</el-button>
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
          v-hasPermi="['consume:consume:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['consume:consume:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['consume:consume:delete']">删除
        </el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="consumeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="consumeId" sortable="custom" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.consumeId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" fixed="left" min-width="350px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.tags != null">
            <el-icon color="green"><Shop /></el-icon>
          </span>
          <span v-if="scope.row.pid != null">
            <el-icon color="red"><StarFilled /></el-icon>
          </span>
          <span v-if="scope.row.consumeType == 'TREAT'">
            <el-icon color="yellowgreen"><StarFilled /></el-icon>
          </span>
          <span v-if="scope.row.secondhand==true" style="color: green;">
            <el-tag type="warning">二手</el-tag>
          </span>
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.goodsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购买来源" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.source.sourceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品类型" align="center" min-width="95px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.goodsType.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总价" align="center" width="120">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.totalPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="购买日期" align="center" width="190">
        <template #default="scope">
          <span>{{ scope.row.buyTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="店铺名称" align="center" width="90" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.shopName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.paymentName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运费" align="center" width="95">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.shipment) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价" align="center" width="120">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.price) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费日期" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.consumeTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="70" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-dropdown>
            <span class="el-dropdown-link">
              选项
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item><el-icon color="green"><Right /></el-icon>{{ formatShortName(scope.row.goodsName) }}</el-dropdown-item>
                <el-dropdown-item divided>
                  <el-button
                    link
                    type="success"
                    icon="CopyDocument"
                    @click="handleCopy(scope.row)"
                    v-hasPermi="['consume:consume:create']">复制
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    link
                    type="danger"
                    icon="delete"
                    @click="handleDelete(scope.row)"
                    v-hasPermi="['consume:consume:delete']">删除
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    link
                    type="primary"
                    icon="Document"
                    @click="handleArchive(scope.row)"
                    v-hasPermi="['life:archive:sync']">同步档案
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    link
                    type="success"
                    icon="switch"
                    @click="showCasecade(scope.row)"
                    v-hasPermi="['consume:consume:edit']">关联消费
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
    <ConsumeForm ref="formRef" @success="getList" />

    <!-- 关联 -->
    <CascadeForm ref="cascadeFormRef" />

    <!-- 档案表单 -->
    <ArchiveForm ref="archiveFormRef" />

  </div>
</template>

<script setup name="Consume">
  import { fetchList, deleteConsume, getConsume } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import CascadeForm from './cascade/index.vue'
  import ConsumeForm from './form.vue'
  import ArchiveForm from '../../life/archive/form.vue';

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const cascadeFormRef = ref();
  const archiveFormRef = ref();

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
  const consumeList = ref([]);

  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const sortFieldOptions = ref([]);
  const sortTypeOptions = ref([]);
  const secondhandOptions = ref([]);
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      sortField: 'buyTime',
      sortType: 'desc',
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
  
  /** 缩写商品名 */
  function formatShortName(name) {
    if(name.length<=8){
      return name;
    }else{
      return name.slice(0,7)+'...';
    }
  }

  /** 级联 */
  function showCasecade(row) {
    const consumeId = row.consumeId;
    cascadeFormRef.value.openCascade(consumeId);
  }

  /** 下拉框加载 */
  function loadOptions() {
    getConsumeSourceTree().then(response => {
      sourceOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
    proxy.getDictItemTree('SECONDHAND', false).then(response => {
      secondhandOptions.value = response;
    });
    proxy.getDictItemTree('CONSUME_SORT_FIELD', false).then(response => {
      sortFieldOptions.value = response;
    });
    proxy.getDictItemTree('SORT_TYPE', false).then(response => {
      sortTypeOptions.value = response;
    });
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    consumeList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        consumeList.value = response.rows;
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
    const id = row.consumeId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 同步档案按钮操作 */
  function handleArchive(row) {
    const id = row.consumeId;
    getConsume(id).then(response => {
      let data = {
        archiveId: undefined,
        title: '消费信息',
        content: response.goodsName + ',花费:' + response.totalPrice + '元',
        date: response.buyTime,
        bussType: 'CONSUME',
        sourceId: response.consumeId,
        remark: undefined
      };
      archiveFormRef.value.syncData(data);
    });
  }

  /** 复制按钮操作 */
  function handleCopy(row) {
    const id = row.consumeId;
    formRef.value.openForm(id, 'copy');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.consumeId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteConsume(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.consumeId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    loadOptions();
  })
</script>