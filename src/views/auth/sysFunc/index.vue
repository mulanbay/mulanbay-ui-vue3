<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['auth:sysFunc:tree']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['auth:sysFunc:create']">新增</el-button>
        <el-button type="success" icon="refresh" @click="handleRefreshCache" v-hasPermi="['auth:sysFunc:refreshCache']">刷新缓存</el-button>

      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table
      v-loading="loading"
      :data="sysFuncList"
      row-key="funcId"
      ref="tableRef"
      lazy
      :load="loadChildren"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="名称" min-width="200px" fixed="left" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="'M'==scope.row.funcDataType">
            <el-tooltip content="目录" effect="dark" placement="top">
              <svg-icon icon-class="tree" />
            </el-tooltip>
          </span>
          <span v-else-if="'C'==scope.row.funcDataType">
            <el-tooltip content="菜单" effect="dark" placement="top">
              <svg-icon icon-class="international" />
            </el-tooltip>
          </span>
          <span v-else-if="'F'==scope.row.funcDataType">
            <el-tooltip content="按钮" effect="dark" placement="top">
              <svg-icon icon-class="icon" />
            </el-tooltip>
          </span>
          <span v-else>
            <el-tooltip content="条件" effect="dark" placement="top">
              <svg-icon icon-class="tree-table" />
            </el-tooltip>
          </span>
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.funcName }}</span>
          <span v-if="scope.row.status=='DISABLE'">
            <el-tooltip content="功能已经关闭." effect="dark" placement="top">
              <el-icon color="red"><CircleCloseFilled /></el-icon>
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" width="80">
        <template #default="scope">
          <span v-if="null !=scope.row.imageName">
            <svg-icon :icon-class="scope.row.imageName" />
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="icon" label="安全" width="80">
        <template #default="scope">
          <span v-if="true ==scope.row.loginAuth">
            <el-tooltip content="登录验证" effect="dark" placement="top">
              <svg-icon icon-class="lock" />
            </el-tooltip>
          </span>
          <span v-if="true ==scope.row.permissionAuth">
            <el-tooltip content="权限验证" effect="dark" placement="top">
              <svg-icon icon-class="password" />
            </el-tooltip>
          </span>
          <span v-if="true ==scope.row.secAuth">
            <el-tooltip content="二次认证" effect="dark" placement="top">
              <svg-icon icon-class="2" />
            </el-tooltip>
          </span>
          <span v-if="true ==scope.row.alwaysShow">
            <el-tooltip content="始终显示" effect="dark" placement="top">
              <svg-icon icon-class="show" />
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="路由地址" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column label="路由" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.router==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="菜单可见" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.visible==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="请求地址" min-width="180px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.urlAddress }}</span>
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
      <el-table-column label="操作" align="center" fixed="right" width="100" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-dropdown>
            <span class="el-dropdown-link">
              选择操作
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item><el-icon color="green"><Right /></el-icon>{{ scope.row.funcName }}</el-dropdown-item>
                <el-dropdown-item divided>
                  <el-button
                    link
                    type="info"
                    icon="InfoFilled"
                    @click="showCacheInfo(scope.row)"
                    v-hasPermi="['auth:sysFunc:cacheInfo']">详情
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    type="primary"
                    link
                    icon="plus"
                    @click="handleCreate(scope.row)"
                    v-hasPermi="['auth:sysFunc:create']">新增</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    type="success"
                    link
                    icon="CopyDocument"
                    @click="handleCopy(scope.row)"
                    v-hasPermi="['auth:sysFunc:create']">复制</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    type="danger"
                    link
                    icon="delete"
                    @click="handleDelete(scope.row)"
                    v-hasPermi="['auth:sysFunc:delete']">删除</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <span v-if="scope.row.status=='ENABLE'">
                    <el-button
                      type="danger"
                      link
                      icon="CircleClose"
                      @click="handleDisable(scope.row)"
                      v-hasPermi="['auth:sysFunc:edit']">禁用</el-button>
                  </span>
                  <span v-else>
                    <el-button
                      type="success"
                      link
                      icon="CircleCheck"
                      @click="handleEnable(scope.row)"
                      v-hasPermi="['auth:sysFunc:edit']">启用</el-button>
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改功能点对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body class="customDialogCss">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上层菜单" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                style="width: 515px"
                :data="parentSysFuncOptions"
                :props="{ value: 'id', label: 'text', children: 'children' }"
                value-key="id"
                placeholder="选择上级菜单"
                check-strictly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="功能名称" prop="name">
              <el-input v-model="form.funcName" style="width: 515px" placeholder="请输入功能名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="请求URL" prop="urlAddress">
              <el-input v-model="form.urlAddress" style="width: 515px" placeholder="" @blur="handleBeanName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="请求方式" prop="supportMethods">
              <el-select
                v-model="form.supportMethods"
                placeholder="请求方式"
                clearable
                collapse-tags>
                <el-option
                  v-for="dict in supportMethodsOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联类名" prop="beanName">
              <el-select
                v-model="form.beanName"
                placeholder="关联类名"
                clearable
                collapse-tags>
                <el-option
                  v-for="dict in beanNameOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="funcDataType">
              <el-radio-group v-model="form.funcDataType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
                <el-radio label="D">条件</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" v-if="form.funcDataType == 'M'||form.funcDataType == 'C'">
            <el-form-item label="菜单图标" prop="icon" style="width: 615px">
              <el-popover
                placement="bottom-start"
                :width="540"
                trigger="click">
                <template #reference>
                  <el-input v-model="form.imageName" placeholder="点击选择图标" @blur="showSelectIcon" readonly>
                    <template #prefix>
                      <svg-icon
                        v-if="form.imageName"
                        :icon-class="form.imageName"
                        class="el-input__icon"
                        style="height: 32px;width: 16px;" />
                      <el-icon v-else style="height: 32px;width: 16px;">
                        <search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select ref="iconSelectRef" @selected="selected" :active-icon="form.imageName" />
              </el-popover>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item v-if="form.funcDataType == 'M'||form.funcDataType == 'C'" label="路由地址" prop="path">
              <el-input v-model="form.path" style="width: 515px" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" v-if="form.funcDataType == 'M'||form.funcDataType == 'C'">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" style="width: 515px" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item v-if="form.funcDataType == 'F'||form.funcDataType == 'C'" label="权限标识">
              <el-input v-model="form.perms" style="width: 515px" placeholder="请权限标识" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item v-if="form.funcDataType == 'M'||form.funcDataType == 'C'" label="是否路由">
              <el-switch v-model="form.router"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item v-if="form.funcDataType == 'M'||form.funcDataType == 'C'" label="菜单可见">
              <el-switch v-model="form.visible"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item v-if="form.funcDataType == 'M'||form.funcDataType == 'C'" label="是否外链">
              <el-switch v-model="form.frame"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="主键列名" prop="idField">
              <el-input v-model="form.idField" style="width: 200px" placeholder="" />
              <el-tooltip content="操作日志通过该字段获取操作对象的主键值，日志分析使用." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主键类型" prop="idFieldType">
              <el-select
                v-model="form.idFieldType"
                placeholder="主键类型"
                clearable
                collapse-tags>
                <el-option
                  v-for="dict in idFieldTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="排序编号" prop="orderIndex">
              <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0" style="width: 200px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="功能类型" prop="functionType">
              <el-select
                v-model="form.funcType"
                placeholder="功能类型"
                clearable
                collapse-tags>
                <el-option
                  v-for="dict in funcTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="登陆认证" prop="loginAuth">
              <el-switch v-model="form.loginAuth"></el-switch>
              <svg-icon icon-class="lock" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="二次认证" prop="secAuth">
              <el-switch v-model="form.secAuth"></el-switch>
              <el-tooltip content="有些敏感的功能点需要在session过期后重新登录." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="权限认证" prop="permissionAuth">
              <el-switch v-model="form.permissionAuth"></el-switch>
              <svg-icon icon-class="password" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="始终显示" v-if="true == form.permissionAuth" prop="alwaysShow">
              <el-switch v-model="form.alwaysShow"></el-switch>
              <el-tooltip content="如果是目录类型，有可能下面的子节点有些不需要权限认证，这里设置为true，那么菜单能正常显示." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="系统代码" prop="code">
              <el-select
                v-model="form.code"
                placeholder="系统代码"
                allow-create
                style="width: 200px"
                collapse-tags>
                <el-option
                  v-for="dict in codeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id" />
              </el-select>
              <el-tooltip content="如果设置非0值，则该功能类型操作将通过错误代码表判断是否需要消息通知." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="积分奖励" prop="rewardPoint">
              <el-input-number v-model="form.rewardPoint" controls-position="right" :min="0" :controls="true" :precision="0" style="width: 190px" />
              <el-tooltip content="如果设置非0值，则每操作一次该功能都会有相应的积分积累." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="功能状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in commonStatusOptions"
                  :key="dict.id"
                  :label="dict.id">{{dict.text}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="记录日志" prop="doLog">
              <el-switch v-model="form.doLog"></el-switch>
              <el-tooltip content="是否记录操作日志." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否缓存" prop="cache" v-if="form.funcDataType == 'C'">
              <el-switch v-model="form.cache"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="更多设置">
              <el-switch v-model="moreSet"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="IP认证" v-if="true == moreSet" prop="ipAuth">
              <el-switch v-model="form.ipAuth"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户限流" prop="userPeriod" v-if="true == moreSet">
              每
              <el-input-number v-model="form.userPeriod" controls-position="right" :min="0" :controls="true" :precision="0" style="width: 120px;" />
              毫秒一次
              <el-tooltip content="0为不限流." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统限流" prop="sysLimit" v-if="true == moreSet">
              每天
              <el-input-number v-model="form.sysLimit" controls-position="right" :min="0" :controls="true" :precision="0" style="width: 120px;" />
              次
              <el-tooltip content="0为不限流." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="记录返回" v-if="true == moreSet" prop="recordReturnData">
              <el-switch v-model="form.logRes"></el-switch>
              <el-tooltip content="操作日志记录返回数据." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="树形统计" v-if="true == moreSet" prop="treeStat">
              <el-switch v-model="form.treeStat"></el-switch>
              <el-tooltip content="日志在树形统计中显示." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="用户触发" v-if="true == moreSet" prop="triggerStat">
              <el-switch v-model="form.triggerStat"></el-switch>
              <el-tooltip content="该请求为用户触发的,因为有些请求(如筛选项)为系统触发." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="区分用户" v-if="true == moreSet" prop="diffUser">
              <el-switch v-model="form.diffUser"></el-switch>
              <el-tooltip content="该功能的数据是否区分用户." effect="dark" placement="top">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息" prop="remark">
              <el-input v-model="form.remark" style="width: 515px" placeholder="请输入功能名称" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 缓存信息 -->
    <CacheInfo ref="cacheInfoRef" />

  </div>
</template>

<script setup name="SysFunc">
  import { treeList, getMenuTree, getSysFunc, editSysFunc, createSysFunc, deleteSysFunc, refreshCache } from "@/api/auth/sysFunc";
  import { getDomainClassList } from "@/api/common";
  import CacheInfo from './cacheInfo.vue'
  import { ArrowDown } from '@element-plus/icons-vue'

  import SvgIcon from "@/components/SvgIcon";
  import IconSelect from "@/components/IconSelect";

  const { proxy } = getCurrentInstance();
  const moreSet = ref(false);
  const cacheInfoRef = ref();
  
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
  const sysFuncList = ref([]);
  // 上层分类数据
  const parentSysFuncOptions = ref([]);
  const supportMethodsOptions = ref([]);
  const beanNameOptions = ref([]);
  const idFieldTypeOptions = ref([]);
  const funcTypeOptions = ref([]);
  const codeOptions = ref([]);
  
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const iconSelectRef = ref(null);

  // 弹出层标题
  const title = ref("");
  // 是否显示弹出层
  const open = ref(false);
  //旧的父id
  const oldPid = ref(undefined);

  const data = reactive({
    form: {},
    queryParams: {
      page: 0,
      pageSize: 10,
      name: undefined,
      pid: 0
    },
    rules: {
      funcName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      parentId: [
        { required: true, message: "上级分类不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "排序号不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ],
      urlAddress: [
        { required: true, message: "请求地址不能为空", trigger: "blur" }
      ],
      supportMethods: [
        { required: true, message: "请求方式不能为空", trigger: "blur" }
      ],
      beanName: [
        { required: true, message: "关联类名不能为空", trigger: "blur" }
      ],
      funcDataType: [
        { required: true, message: "菜单类型不能为空", trigger: "blur" }
      ],
      funcType: [
        { required: true, message: "功能类型不能为空", trigger: "blur" }
      ],
      doLog: [
        { required: true, message: "是否记录日志不能为空", trigger: "blur" }
      ],
      triggerStat: [
        { required: true, message: "是否计入触发统计不能为空", trigger: "blur" }
      ],
      diffUser: [
        { required: true, message: "是否区分用户不能为空", trigger: "blur" }
      ],
      loginAuth: [
        { required: true, message: "是否登录认证不能为空", trigger: "blur" }
      ],
      permissionAuth: [
        { required: true, message: "是否授权认证不能为空", trigger: "blur" }
      ],
      ipAuth: [
        { required: true, message: "是否IP认证不能为空", trigger: "blur" }
      ],
      alwaysShow: [
        { required: true, message: "是否始终显示不能为空", trigger: "blur" }
      ],
      userPeriod: [
        { required: true, message: "用户限流不能为空", trigger: "blur" }
      ],
      sysLimit: [
        { required: true, message: "系统限流不能为空", trigger: "blur" }
      ],
      logRes: [
        { required: true, message: "是否记录返回数据不能为空", trigger: "blur" }
      ],
      rewardPoint: [
        { required: true, message: "奖励积分不能为空", trigger: "blur" }
      ],
      code: [
        { required: true, message: "系统代码定义不能为空", trigger: "blur" }
      ],
      treeStat: [
        { required: true, message: "是否树形统计不能为空", trigger: "blur" }
      ]
    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 根据功能点路径自动算出关联的BeanName */
  function handleBeanName() {
    let url = form.value.urlAddress;
    if (proxy.isEmpty(url)) {
      return;
    }
    if (!url.startsWith('/')) {
      return;
    }
    let ss = url.split('/');
    let name = ss[1].substring(0);
    let r = name.charAt(0).toUpperCase() + name.slice(1);
    form.value.beanName = r;
  }
  
  /** 缓存信息操作 */
  function showCacheInfo(row) {
    const funcId = row.funcId;
    cacheInfoRef.value.showData(funcId);
  }

  /** 展示下拉图标 */
  function showSelectIcon() {
    iconSelectRef.value.reset();
  }
  /** 选择图标 */
  function selected(name) {
    form.value.imageName = name;
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    if (!proxy.isEmpty(queryParams.value.name)) {
      //如果采用关键字查询则不取第一级
      queryParams.value.pid = undefined;
      queryParams.value.page =1;
    } else{
      queryParams.value.pid = 0;
      queryParams.value.page =0;
    }
    sysFuncList.value = [];
    treeList(queryParams.value).then(
      response => {
        sysFuncList.value = response;
        loading.value = false;
      }
    );
  }

  // 取消按钮
  function cancel() {
    open.value = false;
    reset();
  }

  // 表单重置
  function reset() {
    form.value = {
      funcId: undefined,
      funcName: undefined,
      funcType: 'CREATE',
      funcDataType: 'F',
      loginAuth: true,
      permissionAuth: false,
      ipAuth: false,
      alwaysShow: false,
      userPeriod: 0,
      sysLimit: 0,
      doLog: true,
      triggerStat: false,
      diffUser: true,
      idField: 'id',
      idFieldType: 'LONG',
      status: 'ENABLE',
      orderIndex: 0,
      rewardPoint: 0,
      groupId: 1,
      treeStat: true,
      logRes: false,
      code: 0,
      secAuth: false,
      visible: false,
      router: false,
      frame: false,
      cache: true,
      imageName: 'icon'
    };
    proxy.resetForm("formRef");
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    sysFuncList.value = [];
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    sysFuncList.value = [];
    handleQuery();
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.funcId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
  /** 查询上级分类下拉树结构 */
  function getParentTreeSelect() {
    getMenuTree().then(response => {
      parentSysFuncOptions.value = response;
    });
  }
  /** 新增按钮操作 */
  function handleCreate(row) {
    getParentTreeSelect();
    reset();
    open.value = true;
    title.value = "添加";
    if (row != null && row.funcId) {
      form.value.parentId = row.funcId;
    } else {
      form.value.parentId = 0;
    }
  }

  /** 以模板新增按钮操作 */
  function handleCopy(row) {
    getParentTreeSelect();
    reset();
    open.value = true;
    title.value = "复制";
    if (row != null && row.funcId) {
      form.value.parentId = row.parentId;
    } else {
      form.value.parentId = 0;
    }
    getSysFunc(row.funcId).then(response => {
      form.value = response;
      form.value.funcId = undefined;
      form.value.parent = null;
    });
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    getParentTreeSelect();
    reset();
    const id = row.funcId || ids.value.join(",")
    getSysFunc(id).then(response => {
      form.value = response;
      open.value = true;
      title.value = "修改(ID:" + id + ")";
      //设置oldPid
      oldPid.value = form.value.parentId;
      form.value.parent = null;
    });
  }
  
  /** 启用按钮 */
  function handleEnable(row){
    let sf = row;
    sf.status = 'ENABLE';
    sf.parent = null;
    editSysFunc(sf).then(response => {
      proxy.$modal.msgSuccess("修改成功");
      refreshRow(sf.parentId);
    });
  }
  
  /** 禁用按钮 */
  function handleDisable(row){
    let sf = row;
    sf.status = 'DISABLE';
    sf.parent = null;
    editSysFunc(sf).then(response => {
      proxy.$modal.msgSuccess("修改成功");
      refreshRow(sf.parentId);
    });
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.funcId != undefined) {
          editSysFunc(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            refreshRow(form.value.parentId);
          });
        } else {
          createSysFunc(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false;
            refreshRow(form.value.parentId);
          });
        }
      }
    });
  }
  //局部刷新使用
  let tableRef = ref();

  //加载子节点
  function loadChildren(tree, treeNode, resolve) {
    //this.loading = true;
    const para = {
      pid: tree.funcId
    }
    treeList(para).then(
      response => {
        resolve(response);
      }
    );
  }

  /** 刷新节点 */
  function refreshRow(pid) {
    if (pid == 0) {
      //第一级菜单，刷新整个列表
      getList();
      return;
    }
    if (pid !== oldPid.value) {
      //先刷新原来的节点,否则会导致重复key，因为该节点在新老父节点里都存在
      refreshRowData(oldPid.value);
    }
    refreshRowData(pid);
  }

  /** 刷新节点 */
  function refreshRowData(pid) {
    if (pid == undefined || pid == null) {
      return;
    }
    getSysFunc(pid).then(response => {
      let row = response;
      //不管父节点之前有没有加载过数据，重置父节点
      tableRef.value.store.states.treeData.value[row.funcId].loaded = false;
      //加载数据并展开父节点
      tableRef.value.store.loadOrToggle(row);
    });

  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.funcId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      proxy.$modal.loading("正在删除数据，请稍候！");
      return deleteSysFunc(deleteIds);
    }).then(() => {
      proxy.$modal.closeLoading();
      proxy.$modal.msgSuccess("删除成功");
      refreshRow(row.parentId);
    }).catch(function() {});
  }

  /** 查询管理类名下拉树结构 */
  function getDomainClassSelect() {
    getDomainClassList().then(response => {
      beanNameOptions.value = response;
    });
  }

  /** 刷新系统缓存 */
  function handleRefreshCache() {
    proxy.$confirm('是否确认要刷新系统功能的所有缓存数据?操作可能会有一点慢.', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      proxy.$modal.loading("正在刷新，请稍候！");
      return refreshCache(null);
    }).then(() => {
      proxy.$modal.closeLoading();
      proxy.$modal.msgSuccess("刷新成功");
    }).catch(function() {});
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    //请求方式
    proxy.getDictItemTree('URL_SUPPORT_METHODS', false).then(response => {
      supportMethodsOptions.value = response;
    });
    //系统代码
    proxy.getDictItemTree('FUNC_CODE', false).then(response => {
      codeOptions.value = response;
    });
    //主键列类型
    proxy.getEnumDict('IdFieldType', 'FIELD', false).then(response => {
      idFieldTypeOptions.value = response;
    });
    //功能类型
    proxy.getEnumDict('FunctionType', 'FIELD', false).then(response => {
      funcTypeOptions.value = response;
    });
    getDomainClassSelect();
  })
</script>
<style scoped>
.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>