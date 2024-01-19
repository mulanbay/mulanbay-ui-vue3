<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
	  <el-form-item label="关联类名" prop="beanName">
	   <el-select
	     v-model="queryParams.beanName"
	     placeholder="关联类名"
	     clearable
	     collapse-tags
	     style="width: 240px"
	   >
	     <el-option
	       v-for="dict in beanNameOptions"
	       :key="dict.id"
	       :label="dict.text"
	       :value="dict.id"
	     />
	   </el-select>
	  </el-form-item>
	  <el-form-item label="主键编号" prop="beanId">
	    <el-input
	      v-model="beanId"
	      placeholder="请输入名称"
	      clearable
	      style="width: 240px"
	      @keyup.enter.native="handleQuery"
	    />
	  </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="loadEditData" v-hasPermi="['log:operLog:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
		<el-button type="primary" icon="ArrowLeft" @click="handleFetch('EARLY')" v-hasPermi="['log:operLog:getNearestCompareData']">往前</el-button>
		<el-button type="primary" icon="ArrowRight" @click="handleFetch('LATER')" v-hasPermi="['log:operLog:getNearestCompareData']">往后</el-button>
		<el-button type="primary" icon="Operation" @click="showFlow" v-hasPermi="['log:operLog:flow']">流水日志</el-button>
      </el-form-item>
    </el-form>
	

    <!--数据-->
    <div style="padding: 0px 20px 0px 20px;">
      <el-steps simple style="margin-top: 20px">
        <el-step title="数据库最新数据" status="success" icon="files"></el-step>
        <el-step title="当前操作数据" status="process" icon="clock"></el-step>
        <el-step title="参与比较数据" status="finish" icon="picture"></el-step>
      </el-steps>
    </div>
    <el-row>
      <el-col :span="8" class="card-box">
        <el-card>
          <el-collapse v-model="activeNames">
            <el-collapse-item name="1" :title="queryParams.beanName">
			  <div>
			  <el-descriptions class="margin-top" :column="1" border>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><house /></el-icon>
						数据编号
					  </div>
					</template>
					{{ dbInfo.id}}
				  </el-descriptions-item>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><user /></el-icon>
						所属用户
					  </div>
					</template>
					<span>{{ dbInfo.userId}}</span>
				  </el-descriptions-item>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><timer /></el-icon>
						创建时间
					  </div>
					</template>
					<span>{{ dbInfo.createdTime}}</span>
				  </el-descriptions-item>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><StarFilled /></el-icon>
						修改时间
					  </div>
					</template>
					<span>{{ dbInfo.modifyTime}}</span>
				  </el-descriptions-item>
				</el-descriptions>
			  </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box"  align="left">
        <el-card>
          <el-collapse v-model="activeNames">
            <el-collapse-item name="1"  :title="currentInfo.funcName">
              <div>
			  <el-descriptions class="margin-top" :column="1" border>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><house /></el-icon>
						操作编号
					  </div>
					</template>
					{{ currentInfo.id}}
				  </el-descriptions-item>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><user /></el-icon>
						操作用户
					  </div>
					</template>
					<span>{{ currentInfo.username+'  (ID:'+currentInfo.userId +')'}}</span>
				  </el-descriptions-item>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><timer /></el-icon>
						操作时间
					  </div>
					</template>
					<span>{{ currentInfo.occurTime}}</span>
				  </el-descriptions-item>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><StarFilled /></el-icon>
						请求IP
					  </div>
					</template>
					<span>{{ currentInfo.ipAddress}}</span>
				  </el-descriptions-item>
				</el-descriptions>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box" align="left">
        <el-card v-loading="loading">
          <el-collapse v-model="activeNames">
            <el-collapse-item name="1" :title="compareInfo.funcName">
              <div>
              <el-descriptions class="margin-top" :column="1" border>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><house /></el-icon>
						操作编号
					  </div>
					</template>
					{{ compareInfo.id}}
				  </el-descriptions-item>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><user /></el-icon>
						操作用户
					  </div>
					</template>
					<span v-if="compareInfo.userId!=null">{{ compareInfo.username+'  (ID:'+compareInfo.userId +')'}}</span>
				  </el-descriptions-item>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><timer /></el-icon>
						操作时间
					  </div>
					</template>
					<span>{{ compareInfo.occurTime}}</span>
				  </el-descriptions-item>
				  <el-descriptions-item>
					<template #label>
					  <div class="cell-item">
						<el-icon><StarFilled /></el-icon>
						请求IP
					  </div>
					</template>
					<span>{{ compareInfo.ipAddress}}</span>
				  </el-descriptions-item>
				</el-descriptions>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8" class="card-box">
        <el-card>
          <div class="chart-wrapper" align="center" >
            <BeanDetail ref="dbDataRef" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box"  align="center">
        <el-card v-loading="cdLoading">
          <div class="chart-wrapper">
            <BeanDetail2 ref="currentDataRef" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box" align="center">
        <el-card v-loading="loading">
          <div class="chart-wrapper">
            <BeanDetail3 ref="compareDataRef"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
		
  </div>
</template>

<script setup name="OperLog">
	import {fetchList,getNearestCompareData,getEditLogData,getCompareData} from "@/api/log/operLog";
	import {getDomainClassList} from "@/api/common";
	import {copyObject,getQueryObject} from "@/utils/mulanbay";
	import {string2Json} from "@/utils/mulanbay";
	import BeanDetail from '../../common/jsonTreeTable'
	import BeanDetail2 from '../../common/jsonTreeTable'
	import BeanDetail3 from '../../common/jsonTreeTable'
	
	//比对数据
	let dbDataRef = ref();
	let currentDataRef = ref();
	let compareDataRef = ref();
	
	let dbInfo = ref({});
	let currentInfo = ref({});
	let compareInfo = ref({});
	
	const activeNames = ref(['0']);
	const cdLoading = ref(false);
	const loading = ref(false);
	const beanId = ref(undefined);
	const beanNameOptions = ref([]);
	
	const { proxy } = getCurrentInstance();

	const data = reactive({
	  form: {},
	  queryParams: {
		currentCompareId:undefined,
		compareType:'EARLY'
	  },
	  rules: {
		
	  }
	});

	const { queryParams, form, rules } = toRefs(data);
	
	/** 流水日志 */
	function showFlow(){
	  //路由定向
	  proxy.$router.push({name:'OperLogFlow',
	  query: {beanName:queryParams.value.beanName,idValue:beanId.value}})
	}
	
	/** 查询比较数据中最近的数据 */
	function findNearest() {
	  loading.value = true;
	  getNearestCompareData(queryParams.value).then(
	    response => {
	      if(response.compareData==null){
	        proxy.$modal.msgError('没有更多数据');
	        compareDataRef.value.showData({});
	        compareInfo.value='';
	      }else{
	        compareDataRef.value.showData(string2Json(response.compareData.paras));
	        compareInfo.value=genOperInfo(response.compareData);
	        //设置当前比较值
	        queryParams.value.currentCompareId = response.compareData.id;
	      }
	      loading.value = false;
	    }
	  );
	}
	
	function genOperInfo(log){
      if(log==null){
        return {};
      }else{
        const info={
          id:log.id,
          userId:log.userId,
          username:log.username,
          funcName:log.sysFunc.funcName,
          occurTime:log.occurEndTime,
          ipAddress:log.ipAddress
        }
        return info;
      }
    }
	
	function genDbInfo(data){
	  if(data==null){
	    return {};
	  }else{
	    const info={
	      id:data.id,
	      userId:data.userId,
	      username:data.username,
	      createdTime:data.createdTime,
	      modifyTime:data.modifyTime
	    }
	    return info;
	  }
	}
	
	/** 往前/往后按钮操作 */
	function handleFetch(compareType){
	  queryParams.value.compareType= compareType;
	  findNearest();
	}
	
	/** 操作日志页面进入:初始化获取数据 */
	function loadCompareData(operLogId) {
	  let para ={
	    operLogId:operLogId,
		compareType:queryParams.value.compareType
	  };
	  getCompareData(para).then(
	    response => {
	      dbDataRef.value.showData(response.latestData);
		  currentDataRef.value.showData(JSON.parse(response.currentData.paras));
		  if(response.compareData==null){
			  compareDataRef.value.showData({});
		  }else{
			  compareDataRef.value.showData(string2Json(response.compareData.paras));
		  }
		
	      //获取BeanName，无论从操作日志进来还是各业务模块进来，最终还是转换为业务类的Bean
	      queryParams.value.beanName = response.beanName;
	      beanId.value = response.bussId;
		  
	      //设置初始比较值
	      queryParams.value.currentCompareId = response.currentData.id;
		  dbInfo.value=genDbInfo(response.latestData);
	      currentInfo.value=genOperInfo(response.currentData);
	      compareInfo.value=genOperInfo(response.compareData);
	    }
	  );
	}
	
	/** 业务页面进入:初始化获取数据 */
	function loadEditData() {
	  cdLoading.value = true;
	  let para ={
	    id:beanId.value,
	    beanName:queryParams.value.beanName,
	    compareType:queryParams.value.compareType
	  };
	  getEditLogData(para).then(
	    response => {
		  dbDataRef.value.showData(response.latestData);
	      if(response.currentData!=null){
			currentDataRef.value.showData(JSON.parse(response.currentData.paras));
	        //设置初始比较值
	        queryParams.value.currentCompareId = response.currentData.id;
	      }else{
	        currentDataRef.value.showData({});
	      }
		  if(response.compareData==null){
		  	compareDataRef.value.showData({});
		  }else{
		  	compareDataRef.value.showData(string2Json(response.compareData.paras));
		  }
		  dbInfo.value=genDbInfo(response.latestData);
	      currentInfo.value=genOperInfo(response.currentData);
	      compareInfo.value=genOperInfo(response.compareData);
	      cdLoading.value = false;
	    }
	  );
	}
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  loadEditData();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  //handleQuery();
	}
	
	/** 初始化 **/
	onMounted(() => {
	  let qb = getQueryObject(null);
	  if(qb.operLogId!=null){
	    //操作日志页面进来
	    loadCompareData(qb.operLogId);
	  }else if(qb.beanName!=null){
	    //业务页面进来
	    queryParams.value.beanName = qb.beanName;
	    beanId.value = qb.beanId;
	    loadEditData();
	  }
	  getDomainClassList().then(response => {
	    beanNameOptions.value = response;
	  });
	})
	
</script>
