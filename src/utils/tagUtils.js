/** 标签的通用方法*/
import { ElMessage } from 'element-plus'

/**
 * 添加标签
 * @param {Object} tag
 * @param {Object} tagOptions
 */
export function appendTagToOptions(tag,tagOptions){
  if(tag==null||tag==undefined||tag==''){
    return;
  }
  const a = tagOptions.indexOf(tag);
  if(a>=0){
    ElMessage({
      message: '该标签已经存在',
      type: 'error',
      duration: 5 * 1000
    });
  }else{
    tagOptions.push(tag);
  }
}

/**
 * 检查标签是否已经存在
 * @param {Object} tag
 * @param {Object} tagOptions
 */
export function checkTag(tag,tagOptions){
  if(tag==null||tag==undefined||tag==''){
    return;
  }
  const a = tagOptions.indexOf(tag);
  if(a>=0){
    ElMessage({
      message: '该标签已经存在',
      type: 'error',
      duration: 5 * 1000
    });
  }
}

