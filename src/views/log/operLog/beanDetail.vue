<template>

  <!-- 调度详情对话框 -->
  <el-dialog :title="beanDetailTitle" v-model="beanDetailOpen" width="650px" append-to-body class="customDialogCss">
    <el-row>
      <el-col :span="24" align="center">
        <el-card>
          <div>
            <el-descriptions class="margin-top" :column="1" border>
              <el-descriptions-item width="150px">
                <template #label>
                  <div class="cell-item">
                    <el-icon>
                      <house />
                    </el-icon>
                    对象类名
                  </div>
                </template>
                {{ beanDetail.beanName}}
              </el-descriptions-item>
              <el-descriptions-item width="150px">
                <template #label>
                  <div class="cell-item">
                    <el-icon>
                      <Tools />
                    </el-icon>
                    主键值
                  </div>
                </template>
                {{ beanDetail.idValue}}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-divider content-position="center">对象详情</el-divider>
    <el-row>
      <el-col :span="24" class="card-box" align="center">
        <el-card>
          <div class="chart-wrapper">
            <el-table
              :data="beanDataList"
              row-key="id"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
              <el-table-column label="字段" prop="id" sortable="custom" :show-overflow-tooltip="true">
                <template #default="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="值"  :show-overflow-tooltip="true">
                <template #default="scope">
                  <span>{{ scope.row.text }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

  </el-dialog>

</template>

<script setup name="OperLogBeanDetail">
  import { getBeanDetail } from "@/api/log/operLog";
  import {parseJsonToTree} from "@/utils/mulanbay";

  const { proxy } = getCurrentInstance();
  const lockKeyRef = ref();

  //可执行时间段
  const beanDetailTitle = ref('操作对象详情');
  const beanDetailOpen = ref(false);

  const beanDataList = ref([]);

  const data = reactive({
    beanDetail: {}
  });
  const { beanDetail } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (id) => {
    beanDetailOpen.value = true;
    loadData(id);
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });
  
  /** 加载数据 */
  function loadData(id){
    resetForm();
    getBeanDetail(id).then(response => {
      beanDataList.value = parseJsonToTree(response.beanData);
      beanDetail.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    beanDetail.value = {};
    beanDataList.value=[];
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>