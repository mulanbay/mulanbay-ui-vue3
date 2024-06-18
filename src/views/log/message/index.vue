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
      <el-form-item label="发送状态" prop="sendStatus">
        <el-select
          v-model="queryParams.sendStatus"
          filterable
          clearable
          default-first-option>
          <el-option
            v-for="dict in sendStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['log:message:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['log:message:send']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['log:message:delete']">删除</el-button>
      </el-col>
    </el-row>


    <!--列表数据-->
    <el-table v-loading="loading" :data="messageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="msgId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.msgId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center">
        <template #default="scope">
          <span>{{ scope.row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="200px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="showDetail(scope.row)">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="系统代码" align="center">
        <template #default="scope">
          <span class="link-type" @click="showSysCode(scope.row)">{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发送状态" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.sendStatus=='SUCCESS'">
            <el-icon color="green">
              <SuccessFilled />
            </el-icon>
          </span>
          <span v-else-if="scope.row.sendStatus=='FAIL'">
            <el-icon color="red">
              <CircleCloseFilled />
            </el-icon>
          </span>
          <span v-else style="color:darkmagenta ;">
            {{ scope.row.sendStatusName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="失败次数" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.failCount>0" style="color:red ;">
            {{ scope.row.failCount }}
          </span>
          <span v-else style="color:black ;">
            {{ scope.row.failCount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="期望发送时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.expectSendTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后一次发送时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.lastSendTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="延迟时间" align="center" min-width="100px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ getDelayTime(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务器节点" align="center" width="150">
        <template #default="scope">
          <span>{{ scope.row.nodeId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="refresh"
            @click="handleReSend(scope.row)"
            v-hasPermi="['log:message:resend']">重发</el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['log:message:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 系统代码 -->
    <SysCodeForm ref="sysCodeFormRef" />

    <!-- 详情 -->
    <DetailForm ref="detailFormRef" />

    <!-- 发送表单 -->
    <MessageForm ref="formRef" @success="getList" />

  </div>
</template>

<script setup name="SysCode">
  import { fetchList, resendMessage } from "@/api/log/message";
  import { tillNowSeconds, formatSeconds } from "@/utils/datetime";
  import SysCodeForm from '../sysCode/form.vue'
  import DetailForm from './detail.vue'
  import MessageForm from './form.vue'

  const { proxy } = getCurrentInstance();
  const sysCodeFormRef = ref();
  const detailFormRef = ref();
  const formRef = ref();

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
  const messageList = ref([]);
  const sendStatusOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    form: {},
    queryParams: {
      page: 1,
      pageSize: 10
    },
    rules: {

    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 消息提示 */
  function showMsg(title, content) {
    proxy.$modal.msgInfo(title, content);
  }

  /** 重发 */
  function handleReSend(row) {
    const id = row.msgId;
    proxy.$confirm('是否确认重新发送编号为"' + id + '"的消息?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return resendMessage(id);
    }).then(() => {
      proxy.$modal.msgSuccess("重发成功");
      getList();
    }).catch(function() {});
  }

  /** 系统代码详情 */
  function showSysCode(row) {
    sysCodeFormRef.value.openForm(row.code, 'edit');
  }

  /** 详情 */
  function showDetail(row) {
    detailFormRef.value.openDetail(row.msgId);
  }

  /** 格式化延迟时间 */
  function getDelayTime(row) {
    if (row.lastSendTime == null) {
      return '--';
    } else {
      let s = tillNowSeconds(row.expectSendTime, row.lastSendTime);
      return formatSeconds(s);
    }
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    messageList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        messageList.value = response.rows;
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

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.code || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteSysCode(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.code)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    proxy.getEnumDict('MessageSendStatus', 'FIELD', false).then(response => {
      sendStatusOptions.value = response;
    });
  })
</script>