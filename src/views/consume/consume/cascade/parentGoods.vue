<template>
  <div class="app-container">
    <el-card>
      <el-descriptions class="margin-top" title="商品关联信息" :column="1" border>
        <template #extra>
          <el-button type="danger" v-if="consumeInfo.pid!=null" icon="delete" @click="handleDeleteParent" v-hasPermi="['consume:consume:deleteParent']">取消上级关联</el-button>
        </template>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <Shop />
              </el-icon>
              当前商品
            </div>
          </template>
          <span>
            {{ consumeInfo.goodsName}}
          </span>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon>
                <Shop />
              </el-icon>
              上级商品
            </div>
          </template>
          <span>
            {{ consumeInfo.parentGoodsName}}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card>
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="名称检索" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
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
        <el-form-item v-if="moreCdn==true" label="商品类型" prop="goodsTypeId">
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
        <el-form-item v-if="moreCdn==true" label="购买来源" prop="sourceId">
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
        <el-form-item v-if="moreCdn==true" label="排序方式" prop="sortField">
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
        <el-form-item v-if="moreCdn==true" label="是否二手" prop="secondhand">
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

      <!--列表数据-->
      <el-table v-loading="loading" :data="consumeList">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="商品名称" fixed="left" min-width="250px" :show-overflow-tooltip="true">
          <template #default="scope">
            <span v-if="scope.row.tags != null">
              <el-icon>
                <Shop />
              </el-icon>
            </span>
            <span v-if="scope.row.pid != null">
              <el-icon color="red">
                <StarFilled />
              </el-icon>
            </span>
            <span v-if="scope.row.consumeType == 'TREAT'">
              <el-icon color="yellowgreen">
                <StarFilled />
              </el-icon>
            </span>
            <span v-if="scope.row.secondhand==true" style="color: green;">
              <el-tag type="warning">二手</el-tag>
            </span>
            <span>{{ scope.row.goodsName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="购买日期" align="center" width="190">
          <template #default="scope">
            <span>{{ scope.row.buyTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="关联关系" fixed="left" align="center" width="80">
          <template #default="scope">
            <span v-if="scope.row.pid != null">
              <span v-if="scope.row.pid == consumeInfo.consumeId" style="color: green;">
                下级商品
              </span>
            </span>
            <span v-if="scope.row.consumeId == consumeInfo.pid" style="color: darkgreen;">
              上级商品
            </span>
            <span v-if="scope.row.consumeId == consumeInfo.consumeId" style="color: rebeccapurple;">
              当前商品
            </span>
          </template>
        </el-table-column>
        <el-table-column label="购买来源" align="center" width="95">
          <template #default="scope">
            <span>{{ scope.row.source.sourceName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品类型" align="center" width="95">
          <template #default="scope">
            <span>{{ scope.row.goodsType.typeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总价" align="center" width="95">
          <template #default="scope">
            <span>{{ formatMoney(scope.row.totalPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <span v-if="scope.row.consumeId == consumeInfo.pid">
              <el-button
                link
                type="danger"
                icon="delete"
                @click="handleDeleteParent(scope.row)"
                v-hasPermi="['consume:consume:deleteParent']">取消</el-button>
            </span>
            <span v-else-if="scope.row.consumeId == consumeInfo.consumeId">
              <el-tooltip content="当前商品" effect="dark" placement="top">
                <el-icon>
                  <UserFilled />
                </el-icon>
              </el-tooltip>
            </span>
            <span v-else>
              <el-button
                link
                type="success"
                icon="plus"
                @click="handleSetParent(scope.row)"
                v-hasPermi="['consume:consume:setParent']">关联</el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.pageSize"
        @pagination="getList" />

    </el-card>

  </div>

</template>

<script setup name="ConsumeParentGoods">
  import { fetchList, getConsume, deleteParentConsume, setParentConsume } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";

  const { proxy } = getCurrentInstance();

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
    consumeInfo: {},
    queryParams: {
      page: 1,
      pageSize: 10,
      sortField: 'buyTime',
      sortType: 'desc',
    }
  });

  const { consumeInfo, queryParams } = toRefs(data);

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

  /** 重置父级信息操作 */
  function resetParentBuyRecord() {

  }

  /** 设置为父级按钮操作 */
  function handleSetParent(row) {
    if (consumeInfo.value.consumeId == row.consumeId) {
      proxy.$modal.msgError('不能设置自己为父级商品');
      return;
    }
    let data = {
      consumeId: consumeInfo.value.consumeId,
      pid: row.consumeId
    };
    setParentConsume(data).then(response => {
      proxy.$modal.msgSuccess("设置成功");
      loadConsumeData(data.consumeId);
      getList();
    });
  }

  /** 取消上级按钮操作 */
  function handleDeleteParent() {
    let data = {
      consumeId: consumeInfo.value.consumeId,
      pid: consumeInfo.value.pid
    };
    deleteParentConsume(data).then(response => {
      proxy.$modal.msgSuccess("取消成功");
      loadConsumeData(data.consumeId);
    });
  }

  /** 加载消费信息 */
  function loadConsumeData(consumeId) {
    consumeInfo.value = {};
    consumeInfo.value.consumeId = consumeId;
    getConsume(consumeId).then(response => {
      consumeInfo.value.goodsName = response.goodsName;
      if (response.pid != null) {
        consumeInfo.value.pid = response.pid;
        getConsume(response.pid).then(parent => {
          consumeInfo.value.parentGoodsName = parent.goodsName;
        });
      }
    });
  }

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (consumeId) => {
    loadConsumeData(consumeId);
    loadOptions();
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 初始化 **/
  onMounted(() => {

  })
</script>