<template>
  
  <!-- 调度详情对话框 -->
  <el-dialog :title="compareDataTitle" v-model="compareDataOpen" width="850px" append-to-body class="customDialogCss">
    <!--调度比较数据-->
    <el-row>
      <el-col :span="24" align="center">
        <el-card>
            <div>
              <el-descriptions class="margin-top" :column="1" border >
                <el-descriptions-item width="150px">
					<template #label>
					  <div class="cell-item">
						<el-icon><GoodsFilled /></el-icon>
						商品名称
					  </div>
					</template>
					<span  class="link-type" style="color:red ;">
					  {{ matchLogInfo.goodsName}}
					</span>
                </el-descriptions-item>
				<el-descriptions-item width="150px">
					<template #label>
					  <div class="cell-item">
						<el-icon><user /></el-icon>
						AI匹配度
					  </div>
					</template>
					<span>
					  {{ matchLogInfo.aiMatch}}
					</span>
				</el-descriptions-item>
				<el-descriptions-item width="150px">
					<template #label>
					  <div class="cell-item">
						<el-icon><user /></el-icon>
						实际匹配度
					  </div>
					</template>
					<span>
					  {{ matchLogInfo.acMatch}}
					</span>
				</el-descriptions-item>
				<el-descriptions-item width="150px">
					<template #label>
					  <div class="cell-item">
						<el-icon><Operation /></el-icon>
						匹配类型
					  </div>
					</template>
					<span>
					  {{ matchLogInfo.matchTypeName}}
					</span>
				</el-descriptions-item>
              </el-descriptions>
            </div>
        </el-card>
      </el-col>
    </el-row>
    <el-divider content-position="center">数据比对</el-divider>
    <el-row>
	  <el-col :span="24" class="card-box"  align="center">
		  <!--数据-->
		  <div style="padding: 0px 20px 0px 20px;">
			<el-steps align-center>
			  <el-step title="消费信息" status="success" icon="coin"></el-step>
			  <el-step title="比对信息" status="finish" icon="upload"></el-step>
			</el-steps>
		  </div>
	  </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="card-box"  align="center">
        <el-card>
          <div class="chart-wrapper">
            <ConsumeDataDetail ref="consumeDataRef" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box" align="center">
        <el-card >
          <div class="chart-wrapper">
            <CompareDataDetail ref="compareDataRef"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
	
  </el-dialog>
  
</template>

<script setup name="MatchLogCompareData">
	import {getCompareData} from "@/api/log/matchLog";
	import {tillNowSeconds,tillNowString} from "@/utils/datetime";
	import ConsumeDataDetail from '../../common/jsonTreeTable'
	import CompareDataDetail from '../../common/jsonTreeTable'
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const compareDataTitle = ref('匹配信息');
	const compareDataOpen = ref(false);
	
	const consumeDataRef = ref();
	const compareDataRef = ref();
	
	const data = reactive({
	  matchLogInfo:{}
	});
	const {matchLogInfo} = toRefs(data);
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openCompareData = async (id) => {
	  compareDataOpen.value = true;
	  resetForm();
	  getCompareData(id).then(response => {
		consumeDataRef.value.showData(response.consumeData);
		compareDataRef.value.showData(response.compareData);
	    matchLogInfo.value = response.matchLog;
	  });
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openCompareData }); 

	// 表单重置
	function resetForm() {
	  matchLogInfo.value = {};
	  setTimeout(function()  {
	    consumeDataRef.value.showData(null);
	  }, 100);
	  setTimeout(function()  {
	    compareDataRef.value.showData(null);  
	  }, 100);
	  
	}
	
	/** 初始化 **/
	onMounted(() => {
	  
	})
	
</script>
