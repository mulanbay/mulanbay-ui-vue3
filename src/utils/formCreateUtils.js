/** 动态表单生成插件form-create的通用封装方法*/
/**
 * 根据后台数据生成规则
 * @param {Object} dataRules
 */
export function generateFcRules(dataRules) {
  let selectOptions = new Array();
  if (dataRules == null || dataRules.length == 0) {
    return selectOptions;
  }
  //组装数据
  const n = dataRules.length;
  for (let i = 0; i < n; i++) {
    let r = dataRules[i];
    let field = r.model;
    let selectData=null;
    if(r.tree==true){
      //树形结构(treeSelect无效)
      selectData = {
        type:"treeSelect",
        title:r.name,
        field:field,
        value:r.defaultValue,
        props:{
          data:createTree(r.list),
          multiple: true
        }
      };
    }else if (r.list == null || r.list.length == 0) {
      ////自定义类型
      selectData = {
        type: "input",
        title: r.name,
        field: field,
        value: r.defaultValue,
        props: {
          "type": "text",
          clearable: r.nullable
        }
      }
    }else{
      const ll = r.list.length;
      let os = new Array();
      for (let j = 0; j < ll; j++) {
        let opData = r.list[j];
        let o = { "value": opData.id, "label": opData.text, "disabled": false };
        os.push(o);
      }
      //field插件需要唯一
      selectData = {
        type: "select",
        field: field,
        title: r.name,
        value: r.defaultValue,
        options: os,
        props: {
          multiple: false,
          clearable: r.nullable
        }
      };
    }
    selectData.validate = [
      { required: r.nullable==false, message: r.msg, trigger: 'blur' },
    ]
    //设置控件长度
    selectData.style='width: 200px';
    selectOptions.push(selectData);
  }
  return selectOptions;
}

/**
 * 获取绑定值:fcObject为表单对象
 * @param {Object} fcObject
 */
export function getBindValues(fcObject) {
  let formData = fcObject.formData();
  return JSON.stringify(formData);
}

/**
 * 设置绑定值
 * @param {Object} bindValues
 * @param {Object} fcObject
 */
export function setBindValues(bindValues, fcObject) {
  setTriggerParasBindValues(bindValues, fcObject);
}

/**
 * 产生规则
 * @param {Object} dataRules
 */
export function generateTriggerParasRules(dataRules) {
  let options = new Array();
  const n = dataRules.length;
  for (let i = 0; i < n; i++) {
    let dr = dataRules[i];
    let title = dr.name;
    if (dr.desc != null && dr.desc != '') {
      //title+='('+dr.desc+')';
    }
    let op = {};
    if (dr.editType == 'BOOLEAN' || dr.dataType == 'java.lang.Boolean') {
      op = {
        type: "switch",
        title: title,
        field: dr.field,
        value: true,
        props: {
          activeValue: true,
          inactiveValue: false,
        }
      };
    } else if (dr.editType == 'COMBOBOX') {
      //field插件需要唯一
      op = {
        type: "select",
        title: title,
        field: dr.field,
        value: [],
        options: [],
        props: {
          multiple: false
        }
      };
      const ed = eval('(' + dr.editData + ')');
      const ll = ed.length;
      let os = new Array();
      for (let j = 0; j < ll; j++) {
        let opData = ed[j];
        let o = { "value": opData.id, "label": opData.text, "disabled": false };
        os.push(o);
      }
      op.options = os;
    } else if (dr.editType == 'NUMBER') {
      op = {
        type: "InputNumber",
        title: title,
        field: dr.field,
        value: 1,
        props: {
          precision: dr.scale
        }
      };
    } else if (dr.editType == 'TIME') {
      op = {
        type: "TimePicker",
        title: title,
        field: dr.field,
        value: [],
        props: {
          isRange: false,
          format: "HH:mm",
          valueFormat: "HH:mm"
        }
      };
    } else {
      op = {
        type: "input",
        title: title,
        field: dr.field,
        value: "",
        props: {
          "type": "text",
        }
      }
    }
    op.validate = [
      { required: dr.notNull, message: '请输入' + title+','+dr.desc, trigger: 'blur' },
    ]
    options.push(op);
  }
  return options;
}

/**
 * 设置绑定值
 * @param {Object} bindValues
 * @param {Object} fcObject
 */
export function setTriggerParasBindValues(paras, fcObject) {
  if (paras == undefined || paras == null) {
    return;
  }
  const pp = eval('(' + paras + ')');
  for (let key in pp) {
    fcObject.setValue(key, pp[key]);
  }
}

/**
 * 创建树
 * 
 * @param {Object} dataList
 */
export function createTree(dataList){
  return getChildren('0',dataList);
}

/**
 * 获取子类
 * 
 * @param {Object} pid
 * @param {Object} dataList
 */
export function getChildren(pid,dataList) {
  let result = new Array();
  dataList.forEach(item => {
    let myPid = item.pid;
    if(myPid!=null&&myPid!=undefined&&myPid==pid){
      let child = {
        title: item.text,
        expand: true,
        selected: false,
        id: item.id,
        value: item.id, 
        label: item.text, 
        disabled: false
      };
      //寻找下一个子列表
      let c2 = getChildren(child.id, dataList);
      child.children = c2;;
      //加入到结果集
      result.push(child);
    }
  });
  return result;
}