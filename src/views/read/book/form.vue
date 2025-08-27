<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="720px" append-to-body class="customDialogCss">
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="书籍名称" prop="bookName">
           <el-input v-model="form.bookName" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="图书作者" prop="author">
           <el-input v-model="form.author" placeholder="请输入作者" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="出版社" prop="press">
           <el-input v-model="form.press" placeholder="请输入出版社" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="条码ISBN" prop="isbn">
           <el-input v-model="form.isbn" placeholder="请输入isbn" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="作者国家" prop="countryId">
            <el-select
              v-model="form.countryId"
              placeholder="作者国家"
              filterable
              style="width: 220px"
            >
              <el-option
                v-for="dict in countryOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="图书分类" prop="cateId">
            <el-select
              v-model="form.cateId"
              placeholder="图书分类"
              style="width: 220px"
            >
              <el-option
                v-for="dict in cateIdOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="我的评分" prop="score">
            <el-rate
              v-model="form.score"
              show-score
              :max="5"
              allow-half
              text-color="#ff9900"
              score-template="{value}">
            </el-rate>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="图书语言" prop="language">
           <el-select
             v-model="form.language"
             placeholder="语言"
             style="width: 220px"
           >
             <el-option
               v-for="dict in languageOptions"
               :key="dict.id"
               :label="dict.text"
               :value="dict.id"
             />
           </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出版年份" prop="publishYear">
            <el-input v-model="form.publishYear" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="借入/购买日期" prop="storeDate">
            <el-date-picker type="date" v-model="form.storeDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '220px'}" placeholder="请选择日期" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="期望完成日期" prop="expertFinishDate">
            <el-date-picker type="date" v-model="form.expertFinishDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '220px'}" placeholder="请选择日期" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始日期" prop="beginDate">
            <el-date-picker type="date" v-model="form.beginDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '220px'}" placeholder="请选择日期" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="完成日期" prop="finishDate">
            <el-date-picker type="date" v-model="form.finishDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '220px'}" placeholder="请选择日期" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="阅读状态" prop="status">
           <el-select
             v-model="form.status"
             placeholder="状态"
             style="width: 220px"
           >
             <el-option
               v-for="dict in statusOptions"
               :key="dict.id"
               :label="dict.text"
               :value="dict.id"
             />
           </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="书籍类型" prop="bookType">
           <el-select
             v-model="form.bookType"
             placeholder="书籍类型"
             style="width: 220px"
           >
             <el-option
               v-for="dict in bookTypeOptions"
               :key="dict.id"
               :label="dict.text"
               :value="dict.id"
             />
           </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="图书来源" prop="source">
           <el-select
             v-model="form.source"
             placeholder="来源"
             style="width: 220px"
           >
             <el-option
               v-for="dict in sourceOptions"
               :key="dict.id"
               :label="dict.text"
               :value="dict.id"
             />
           </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
					<el-form-item label="是否二手" prop="secondhand">
						<el-radio-group v-model="form.secondhand">
							<el-radio :value="false" size="large">全新</el-radio>
							<el-radio :value="true" size="large">二手</el-radio>
						</el-radio-group>  
					</el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="BookForm">
  import { createBook, editBook, getBook } from "@/api/read/book";
  import { getBookCategoryTree } from "@/api/read/bookCategory";
  import { getCountryTree} from "@/api/common";
  
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('图书');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const cateIdOptions = ref([]);
  const statusOptions = ref([]);
  const countryOptions = ref([]);
  const languageOptions = ref([]);
  const bookTypeOptions = ref([]);
  const sourceOptions = ref([]);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      bookName: [
        { required: true, message: "书名不能为空", trigger: "blur" }
      ],
      author: [
        { required: true, message: "作者不能为空", trigger: "blur" }
      ],
      press: [
        { required: true, message: "出版社不能为空", trigger: "blur" }
      ],
      isbn: [
        { required: true, message: "ISBN不能为空", trigger: "blur" }
      ],
      countryId: [
        { required: true, message: "国家不能为空", trigger: "blur" }
      ],
      cateId: [
        { required: true, message: "图书分类不能为空", trigger: "blur" }
      ],
      storeDate: [
        { required: true, message: "借入/购买日期不能为空", trigger: "blur" }
      ],
      expertFinishDate: [
        { required: true, message: "期望完成日期不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ],
      bookType: [
        { required: true, message: "书籍类型不能为空", trigger: "blur" }
      ],
      publishYear: [
        { required: true, message: "出版年份不能为空", trigger: "blur" }
      ],
      source: [
        { required: true, message: "来源不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getBook(id).then(response => {
        formLoading.value = false;
        form.value = response;
        form.value.cateId = response.cate.cateId;
        form.value.cate = null;
        form.value.countryId = response.country.countryId;
        form.value.country=null;
      });
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      bookId: undefined,
      bookName: undefined,
      status: 'UNREAD',
      language:'CHINESE',
      bookType:'PAPER',
      score:3,
      source:'BUY',
      secondhand:false
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.bookId != undefined) {
          editBook(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createBook(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        }
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {
    getBookCategoryTree(false).then(response => {
      cateIdOptions.value = response;
    });
    getCountryTree(false).then(response => {
      countryOptions.value = response;
    });
    proxy.getEnumDict('BookStatus', 'FIELD', false).then(response => {
      statusOptions.value = response;
    });
    proxy.getEnumDict('BookLanguage', 'FIELD', false).then(response => {
      languageOptions.value = response;
    });
    proxy.getEnumDict('BookType', 'FIELD', false).then(response => {
      bookTypeOptions.value = response;
    });
    proxy.getEnumDict('BookSource', 'FIELD', false).then(response => {
      sourceOptions.value = response;
    });
  })
</script>