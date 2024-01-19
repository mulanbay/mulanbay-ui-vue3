<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <Collection style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">缓存列表</span>
            <el-button
              style="float: right; padding: 3px 0"
              link
              type="primary"
              icon="Refresh"
              @click="refreshCacheNames()"
            ></el-button>
          </template>
          <el-table
            v-loading="loading"
            :data="cacheNames"
            :height="tableHeight"
            highlight-current-row
            @row-click="getCacheKeys"
            style="width: 100%"
          >
            <el-table-column
              label="序号"
              width="60"
              type="index"
            ></el-table-column>
            <el-table-column
              label="缓存名称"
              align="center"
              prop="cacheName"
              :show-overflow-tooltip="true"
            ></el-table-column>
			<el-table-column
			  label="备注"
			  align="center"
			  prop="remark"
			  :show-overflow-tooltip="true"
			/>
            <el-table-column
              label="操作"
              width="60"
              align="center"
              class-name="small-padding fixed-width"
            >
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  icon="Delete"
                  @click="handleClearCacheName(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <Key style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">键名列表</span>
            <el-button
              style="float: right; padding: 3px 0"
              link
              type="primary"
              icon="Refresh"
              @click="refreshCacheKeys()"
            ></el-button>
          </template>
          <el-table
            v-loading="subLoading"
            :data="cacheKeys"
            :height="tableHeight"
            highlight-current-row
            @row-click="handleCacheValue"
            style="width: 100%"
          >
            <el-table-column
              label="序号"
              width="60"
              type="index"
            ></el-table-column>
            <el-table-column
              label="缓存键名"
              align="center"
              :show-overflow-tooltip="true"
              :formatter="keyFormatter"
            >
            </el-table-column>
            <el-table-column
              label="操作"
              width="60"
              align="center"
              class-name="small-padding fixed-width"
            >
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  icon="Delete"
                  @click="handleClearCacheKey(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card :bordered="false" style="height: calc(100vh - 125px)">
          <template #header>
            <Document style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">缓存内容</span>
            <el-button
              style="float: right; padding: 3px 0"
              link
              type="primary"
              icon="Refresh"
              @click="handleClearCacheAll()"
              >清理全部</el-button
            >
          </template>
		  <el-descriptions class="margin-top" :column="1" border >
			  <el-descriptions-item width="180px">
				<template #label >
				  <div class="cell-item">
					<el-icon><StarFilled /></el-icon>
					缓存名称
				  </div>
				</template>
				{{ cacheForm.cacheName}}
			  </el-descriptions-item>
			  <el-descriptions-item width="180px">
				<template #label >
				  <div class="cell-item">
					<el-icon><StarFilled /></el-icon>
					缓存键名
				  </div>
				</template>
				{{ cacheForm.cacheKey}}
			  </el-descriptions-item>
		  </el-descriptions>
		  <div class="chart-wrapper">
		    <CacheValueForm ref="cacheValueFormRef" />
		  </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="CacheList">
import { listCacheName, listCacheKey, getCacheValue, deleteCacheName, deleteCacheKey, deleteAllCache } from "@/api/system/cache";
import CacheValueForm from '../../common/jsonTreeTable'

const { proxy } = getCurrentInstance();

const cacheNames = ref([]);
const cacheKeys = ref([]);
const cacheForm = ref({});
const loading = ref(true);
const subLoading = ref(false);
const nowCacheName = ref("");
const tableHeight = ref(window.innerHeight - 200);

const cacheValueFormRef = ref();

/** 查询缓存名称列表 */
function getCacheNames() {
  loading.value = true;
  listCacheName().then(response => {
    cacheNames.value = response;
    loading.value = false;
  });
}

/** 刷新缓存名称列表 */
function refreshCacheNames() {
  getCacheNames();
  proxy.$modal.msgSuccess("刷新缓存列表成功");
}

/** 清理指定名称缓存 */
function handleClearCacheName(row) {
  deleteCacheName(row.cacheName).then(response => {
    proxy.$modal.msgSuccess("清理缓存名称[" + row.cacheName + "]成功,影响条数:"+response);
    getCacheKeys();
  });
}

/** 查询缓存键名列表 */
function getCacheKeys(row) {
  const cacheName = row !== undefined ? row.cacheName : nowCacheName.value;
  if (cacheName === "") {
    return;
  }
  //清空缓存值显示
  cacheForm.value = {};
  setTimeout(function()  {
    cacheValueFormRef.value.showData(null);
  }, 100);
  subLoading.value = true;
  listCacheKey(cacheName).then(response => {
    cacheKeys.value = response;
    subLoading.value = false;
    nowCacheName.value = cacheName;
  });
}

/** 刷新缓存键名列表 */
function refreshCacheKeys() {
  getCacheKeys();
  proxy.$modal.msgSuccess("刷新键名列表成功");
}

/** 清理指定键名缓存 */
function handleClearCacheKey(cacheKey) {
  deleteCacheKey(cacheKey).then(response => {
    proxy.$modal.msgSuccess("清理缓存键名[" + cacheKey + "]成功,影响条数:"+response);
    getCacheKeys();
  });
}

/** 键名前缀去除 */
function keyFormatter(cacheKey) {
  return cacheKey;
}

/** 查询缓存内容详细 */
function handleCacheValue(cacheKey) {
  getCacheValue(nowCacheName.value, cacheKey).then(response => {
    cacheForm.value = response;
	setTimeout(function()  {
	  cacheValueFormRef.value.showData(response.cacheValue);
	}, 100);
  });
}

/** 清理全部缓存 */
function handleClearCacheAll() {
  deleteAllCache().then(response => {
    proxy.$modal.msgSuccess("清理全部缓存成功");
  });
}

getCacheNames();
</script>
<style scoped>

</style>
