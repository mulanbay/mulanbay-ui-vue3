import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/es/locale/lang/zh-cn'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
//import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { getEnumDict, getDictItemTree } from "@/api/common";
import { parseTime, resetForm, addDateRange, selectDictLabel, download, handleTree, commonStatusOptions, booleanOptions, formatMoney, isEmpty } from "@/utils/mulanbay";
import { getYearDateRange, getMonthDateRange, datePickerOptions, getFormatDate } from "@/utils/datetime";

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 自定义树选择组件
import TreeSelect from '@/components/TreeSelect'
// 字典标签组件
import DictTag from '@/components/DictTag'

globalThis.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

const app = createApp(App)

app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.handleTree = handleTree

app.config.globalProperties.getEnumDict = getEnumDict
app.config.globalProperties.getDictItemTree = getDictItemTree
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.download = download
app.config.globalProperties.formatMoney = formatMoney
app.config.globalProperties.commonStatusOptions = commonStatusOptions
app.config.globalProperties.booleanOptions = booleanOptions
app.config.globalProperties.datePickerOptions = datePickerOptions
app.config.globalProperties.isEmpty = isEmpty
app.config.globalProperties.getYearDateRange = getYearDateRange
app.config.globalProperties.getMonthDateRange = getMonthDateRange
app.config.globalProperties.getFormatDate = getFormatDate

// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('TreeSelect', TreeSelect)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)

app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

directive(app)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

app.mount('#app')