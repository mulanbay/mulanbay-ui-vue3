<template>
  <div class="app-container" >
	<el-card>
		<el-descriptions class="margin-top" title="商品寿命信息" :column="1" border >
			<template #extra>
			   <el-button type="primary" icon="refresh" @click="handleCostStat" v-hasPermi="['consume:consume:costStat']">刷新</el-button>
			</template>
			<el-descriptions-item>
				<template #label>
				  <div class="cell-item">
					<el-icon><Shop /></el-icon>
					当前商品
				  </div>
				</template>
				<span>
				  {{ consumeInfo.goodsName}}
				</span>
			</el-descriptions-item>
		</el-descriptions>  
	</el-card>
	
	<el-card>
	<el-row>
	  <el-col :span="24" class="card-box"  align="center">
		  <el-card>
		  <div>
		    <el-steps :active="timelineSize" align-center finish-status="success">
		      <template v-for="item in timelineList">
		      <el-step :title="item.key" :description="item.value"></el-step>
		      </template>
		    </el-steps>
		  </div>
		  </el-card>
	  </el-col>
	</el-row>
	<el-row>
	  <el-col :span="12" class="card-box"  align="center">
	    <el-card>
	      <el-divider content-position="center">系统寿命配置</el-divider>
		  <LifetimeCompareForm ref="lifetimeCompareFormRef" />
	    </el-card>
	  </el-col>
	  <el-col :span="12" class="card-box" align="center">
	    <el-card>
	      <el-divider content-position="center">成本计算</el-divider>
	      <el-form :model="queryParams" ref="queryForm" :inline="true">
	        <el-form-item label="关联子下级" prop="deepCost">
	          <el-switch v-model="queryParams.deepCost"  @change="handleCostStat" ></el-switch>
            <el-tooltip content="如果关联子下级，那么会统计该商品的下级及其下级，为树形统计." effect="dark" placement="top">
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
	        </el-form-item>
	        <el-form-item>
	          <el-button type="primary" icon="TrendCharts" @click="handleCostStat" v-hasPermi="['consume:consume:costStat']">统计</el-button>
	        </el-form-item>
	      </el-form>
	      <!--列表数据-->
	      <el-table :data="dataList" v-loading="loading" >
	        <el-table-column label="项目" prop="key" align="center"  width="150px">
	          <template #default="scope">
	            {{ scope.row.key }}
	          </template>
	        </el-table-column>
	        <el-table-column label="数值" prop="value" align="center">
	          <template #default="scope">
	            {{ scope.row.value }}
	          </template>
	        </el-table-column>
	        <el-table-column label="说明" prop="desc" align="center" width="60px">
	          <template #default="scope">
	            <span v-if="scope.row.desc != null" >
					<el-tooltip :content="scope.row.desc" effect="dark" placement="top">
					  <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</span>
			  </template>
	        </el-table-column>
	      </el-table>
	    </el-card>
	  </el-col>
	</el-row>
	</el-card>
	
  </div>
  
</template>

<script setup name="ConsumeUseTimeDetail">
	import {getConsume,getConsumeCostStat} from "@/api/consume/consume";
    import {hourDiff,dateDiff,formatDays,getNowDateTimeString,getNowDateString} from "@/utils/datetime";
	import LifetimeCompareForm from '../../../config/goodsLifetime/compare.vue'

	const { proxy } = getCurrentInstance();
	
	const lifetimeCompareFormRef = ref();
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
	const deepCost = ref(true);
	const lifetimeCompareData = ref();
	const timelineSize = ref(1);
	const dataList = ref([]);
	const timelineList = ref([]);
	
	const data = reactive({
	  consumeInfo:{},
	  queryParams: {
		deepCost:true
	  }
	});
	
	const { consumeInfo,queryParams } = toRefs(data);
	
	//查询条件更多属性 start
	const cdnTitle = ref("更多");
	const moreCdn = ref(false);
	
	function showMsg(title,content){
		proxy.$modal.msgInfo(title,content);
	}
	/** 更多查询条件处理 */
	function handleMoreCdn(){
	  if(moreCdn.value==true){
	    moreCdn.value=false;
	    cdnTitle.value='更多';
	  }else{
	    moreCdn.value=true;
		cdnTitle.value='取消';
	  }
	}

	/** 处理时间线 */
	function handleTimeline(consume){
	  timelineList.value = [];
	  let tlData  = new Array();
	  if(consume.buyTime==consume.consumeTime){
	    tlData.push({key:'购买/消费时间',value :consume.buyTime });
	  }else{
	    tlData.push({key:'购买时间',value :consume.buyTime });
	    tlData.push({key:'消费时间',value :consume.consumeTime });
	  }
	  if(consume.expectInvalidTime!=null){
	    tlData.push({key:'期望废弃时间',value :consume.expectInvalidTime });
	  }
	  if(consume.invalidTime!=null){
	    tlData.push({key:'废弃/售出时间',value :consume.invalidTime });
	  }
	  //
	  const len = tlData.length;
	  timelineSize.value = len;
	  //赋值
	  timelineList.value = tlData;
	}
	
	/** 成本分析 */
	function handleCostStat(){
	  dataList.value = [];
	  loading.value = true;
	  queryParams.value.consumeId = consumeInfo.value.consumeId;
	  getConsumeCostStat(queryParams.value).then(response => {
		loading.value = false;
	    let cc = response;
	    var brData  = new Array();
	    brData.push({key:'买入价格',value :proxy.formatMoney(cc.totalPrice) });
	    let usedDays = cc.usedMillSecs/(24*3600*1000);
	    brData.push({key:'使用时长',value :formatDays(usedDays),desc:'购买时间距离废弃时间的时间差，如果没有废弃时间那么距离当前时间的时间差' });
	    if(cc.deleteDate==null&&cc.expMillSecs!=null){
	      brData.push({key:'离预期作废',value :formatDays(cc.expMillSecs/(24*3600*1000)) });
	    }
	    let spDesc ='';
	    if(cc.soldPrice!=null){
	      let sb = cc.totalPrice-cc.soldPrice;
	      if(sb>0){
	        spDesc ='亏'+sb.toFixed(2)+'元';
	      }else{
	        spDesc ='赚'+(0-sb).toFixed(2)+'元';
	      }
	    }
	    brData.push({key:'售出价格',value :proxy.formatMoney(cc.soldPrice),desc:spDesc });
	    if(cc.childrens>0){
	      brData.push({key:'下级商品成本',value :proxy.formatMoney(cc.childrenPrice)+' ('+cc.childrens+'个)',desc:'该商品所有下级商品的个数' });
	    }
	    if(cc.childrenSoldPrice!=null){
	      brData.push({key:'下级商品售出',value :proxy.formatMoney(cc.childrenSoldPrice),desc:'该商品所有下级商品的售出价格总额' });
	    }
	    brData.push({key:'总成本',value :proxy.formatMoney(cc.totalCost),desc:'该商品买入价格和下级商品的总价之和' });
	    brData.push({key:'每天花费',value :proxy.formatMoney(cc.costPerDay)+' / '+proxy.formatMoney(cc.totalCostPerDay),desc:'前项:(买入价格-售出价格)/使用天数.</br>后项:(买入价格-售出价格+下级商品成本-下级商品售出价格)/使用天数' });
	    if(cc.soldPrice!=null){
	      brData.push({key:'折旧率',value :(cc.depRate.toFixed(1)+'折 / '+cc.totalDepRate.toFixed(1)+'折'),desc:'前项:售出价格/买入价格.</br>后项:售出价格/(总成本-下级商品售价)'});
	    }
	    dataList.value = brData;
		let cdData = {
			goodsName: response.goodsName,
			usedDays: usedDays
		}
		lifetimeCompareFormRef.value.compareData(cdData);
	  });
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  handleQuery();
	}
	
	/** 加载消费信息 */
	function loadConsumeData(consumeId){
		consumeInfo.value={};
		consumeInfo.value.consumeId=consumeId;
		getConsume(consumeId).then(response => {
			consumeInfo.value.goodsName=response.goodsName;
			handleTimeline(response);
			handleCostStat();
		});
	}
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openForm = async (consumeId) => {
	  loadConsumeData(consumeId);
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openForm }); 

	/** 初始化 **/
	onMounted(() => {
	  
	})
	
</script>
