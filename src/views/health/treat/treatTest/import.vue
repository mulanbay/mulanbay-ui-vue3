<template>

	<!-- 导入对话框 -->
	<el-dialog :title="title" v-model="open" width="850px" append-to-body class="customDialogCss">
			<!-- 上传按钮 -->
			<el-upload :on-change="handleExcelUpload" accept=".xlsx,.xls" :limit="1" :auto-upload="false" action="#" v-model:file-list="fileList">
				<el-button icon="UploadFilled" type="primary">上传 Excel</el-button>
			</el-upload>
			<el-text class="mx-1" type="success">格式说明：Excel表格按照下面数据表格的前五列作为表头（第一行为表头，不能省略）</el-text>
			
			<!-- 手术信息 -->
			<div>
			  <el-descriptions class="margin-top" :column="2" border v-loading="loading">
			    <el-descriptions-item>
			      <template #label>
			        <div class="cell-item">
			          采集时间
			        </div>
			      </template>
			      <el-date-picker type="datetime" v-model="form.testTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
			        :style="{width: '200px'}" clearable>
			      </el-date-picker>
			    </el-descriptions-item>
			    <el-descriptions-item>
			      <template #label>
			        <div class="cell-item">
			          手术名称
			        </div>
			      </template>
			      {{ form.operationName}}
			    </el-descriptions-item>
			  </el-descriptions>
			</div>

			<!-- 渲染表格 -->
			<el-table v-loading="loading" :data="tableData" style="width: 100%; margin-top: 20px">
				<el-table-column label="检查项目" align="center" width="220">
					<template #default="scope">
						<el-input v-model="scope.row.name" />
					</template>
				</el-table-column>
				<el-table-column label="检查结果" align="center" width="110">
					<template #default="scope">
						<el-input v-model="scope.row.value"/>
					</template>
				</el-table-column>
				<el-table-column label="参考下限" align="center" width="120">
					<template #default="scope">
						<el-input v-model="scope.row.minValue"/>
					</template>
				</el-table-column>
				<el-table-column label="参考上限" align="center" width="120">
					<template #default="scope">
						<el-input v-model="scope.row.maxValue"/>
					</template>
				</el-table-column>
				<el-table-column label="单位" align="center" width="120">
					<template #default="scope">
						<el-input v-model="scope.row.unit"/>
					</template>
				</el-table-column>
				<el-table-column label="分析结果" align="center" width="120">
					<template #default="scope">
						<el-select
						  v-model="scope.row.result"
						  filterable
						  default-first-option>
						  <el-option
						    v-for="dict in resultOptions"
						    :key="dict.id"
						    :label="dict.text"
						    :value="dict.id" />
						</el-select>
					</template>
				</el-table-column>
			</el-table>
			<template #footer>
				<div class="dialog-footer">
					<el-button type="success" icon="Download" @click="loadTemplate" v-hasPermi="['health:treat:treatTest:list']">加载模板</el-button>
					<el-button type="primary" @click="submitForm()">保 存</el-button>
					<el-button @click="open=false">取 消</el-button>
				</div>
			</template>
	</el-dialog>

</template>

<script setup name="TreatTestImport">
	import {importTreatTest,loadTreatTestTemplate} from "@/api/health/treat/treatTest";
	import {getTreatOperation} from "@/api/health/treat/treatOperation";
	import * as XLSX from 'xlsx';

	const {proxy} = getCurrentInstance();

	//可执行时间段
	const title = ref('导入检测报告');
	const open = ref(false);
	const loading = ref(false);
	const infoOpen = ref(false);

	const tableHeaders = ref([]) 
	const tableData = ref([]) 
  const resultOptions = ref([]);

	const fileList = ref([]);
	
	const data = reactive({
		form: {},
		// 表单校验
		rules: {
			name: [{
				required: true,
				message: "名称不能为空",
				trigger: "blur"
			}]
		}
	});

	const {
		form,
		rules
	} = toRefs(data);

	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);

	/** 打开弹窗 */
	const openForm = async (operationId) => {
		open.value = true;
		resetForm();
		loadOperation(operationId);
	}

	// 提供 open 方法，用于打开弹窗
	defineExpose({
		openForm
	});
	
	/** 加载模板 */
	function loadTemplate(){
		let para = {
			operationId: form.value.operationId
		}
		loadTreatTestTemplate(para).then(response => {
		  tableData.value = response;
		});
	}
	
	/** 加载手术信息 */
	function loadOperation(id){
		getTreatOperation(id).then(response => {
		  form.value.operationId = response.operationId;
		  form.value.operationName = response.operationName;
		});
	}

	// 上传 Excel 并解析
	const handleExcelUpload = (uploadFile) => {
		const file = uploadFile.raw
		if (!file) return

		const reader = new FileReader()
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target.result)
				const workbook = XLSX.read(data, {
					type: 'array'
				})
				const sheetName = workbook.SheetNames[0]
				const worksheet = workbook.Sheets[sheetName]

				const headers = []
				const rows = []

				for (const cell in worksheet) {
					if (cell[0] === '!') continue // 跳过元数据
					const {
						r: rowIndex,
						c: colIndex
					} = XLSX.utils.decode_cell(cell)
					const cellValue = worksheet[cell].v

					if (rowIndex === 0) {
						headers[colIndex] = cellValue
					} else {
						if (!rows[rowIndex - 1]) rows[rowIndex - 1] = {}
						rows[rowIndex - 1][`col_${colIndex}`] = cellValue
					}
				}

				tableHeaders.value = headers;
				rows.forEach(rd => {
				  let test ={
				  	"name": rd.col_0,
				  	"value":rd.col_1,
				  	"minValue":rd.col_2,
				  	"maxValue":rd.col_3,
						"unit":rd.col_4
				  };
					if(test.minValue!=null){
						let mms = test.minValue.split('-');
						if(mms.length>1){
							test.minValue = mms[0];
							test.maxValue = mms[1];
						}
					}
				  tableData.value.push(test);
				});
				
			} catch (error) {
				ElMessage({
				  message: error.message,
				  type: 'error',
				  duration: 5 * 1000
				})
			}
		}
		reader.readAsArrayBuffer(file)
	}

	/** 加载下拉选项 */
	function loadOptions() {
		proxy.getEnumDict('TreatTestResult', 'FIELD', false).then(response => {
			resultOptions.value = response;
		});
	}

	// 表单重置
	function resetForm() {
		form.value = {

		};
		tableHeaders.value = [];
		tableData.value = [];
		fileList.value = [];
		proxy.resetForm("formRef");
	}

	/** 提交按钮 */
	function submitForm() {
		let ds = JSON.stringify(tableData.value)
		//console.log(ds)
		form.value.testData = ds;
		importTreatTest(form.value).then(response => {
			open.value = false;
		  proxy.$modal.msgSuccess("导入成功");
		  // 发送操作成功的事件
		  emit('success');
		});
	}
	
	/** 初始化 **/
	onMounted(() => {
	  loadOptions();
	})

</script>