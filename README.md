## 项目介绍
木兰湾是用于管理个人消费、锻炼、音乐、阅读、健康、饮食、人生经历等各个衣食住行信息的系统，由统计、计划模块利用调度系统来统计分析执行情况。
并通过积分和评分体系来综合评估个人的总体状态，同时采用机器学习算法对数据进行预测。

系统作为一个个人综合管理系统，它主要解决三个问题：
* 我的计划(期望)是什么？--> (模块：统计、计划)
* 我要做什么？--> (模块：日历)
* 我做了什么？--> (模块：行为分析)

基于以上三个问题，我们是否可以去思考以下两个问题：
* 我是怎么样的人？（用户画像）
* 我将会怎么样？ （机器学习）-->（模块：数据预测）

新版本的木兰湾项目采用了SpringBoot3，Vue3重构设计。

该系统是前后端分离的项目，当前项目mulanbay-ui-vue3为前端项目，整个系统必须要同时运行前端才能完整访问。

后端项目
* 基于SpringBoot3的后端接口[mulanbay-server3](https://gitee.com/mulanbay/mulanbay-server3)

算法端项目：
* 基于sklearn的机器学习(python)[mulanbay-sklearn](https://gitee.com/mulanbay/mulanbay-sklearn)

(对于数据预测，mulanbay-sklearn负责算法，生成pmml模型文件，java端mulanbay-server通过jpmml库加载模型文件对业务数据进行预测)

### 木兰湾项目概况

[木兰湾项目说明](https://gitee.com/mulanbay)

### 功能简介

* 基于RBAC的用户权限管理
* 支持分布式运行的调度功能
* 基于AHANLP的自然语言学习服务
* 提供消费、锻炼、音乐、阅读、健康、饮食、人生经历等常用模块
* 统一的日志管理及日志流分析
* 提供基于模板化的统计、计划、图表、行为配置及分析
* 统一的日历管理，提供日历自动新增、完成功能
* 提供磁盘、CPU、内存的监控及报警，并可以自动恢复
* 数据库数据、备份文件自动清理
* 统一及强大的图表统计分析功能
* 基于微信公众号消息、邮件的消息提醒服务
* 基于错误代码的消息发送可配置化
* 基于Hibernate的配置化的查询便捷封装
* 提供可配置的个人积分和评分体系
* 提供多角度的用户行为分析
* 提供词云、相似度、智能问答等分析功能 
* 基于sklearn的机器学习对一些数据进行预测

## 开发说明

### 所用技术

Vue3、Element UI、Echarts

### 软件要求
| 软件                    | 版本          |
| ---------------------- | ------------- |
| node                   | v20.12      |
| npm                    | v10.5       |
| Nginx                  | 1.17+       |

### 文档地址


### 开发环境

```bash
# 克隆项目

# 进入项目目录
cd mulanbay-ui-vue3

# 配置api地址
在vue.config.js中配置api服务器的地址（已配置好后端默认地址localhost:8080/api）

# 安装依赖
npm install

# 如果安装比较慢，可以选择以下指定源。
# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

#
# 启动服务
npm run dev
```

浏览器访问 http://localhost/index
账号密码：mulanbay / 123456

### 正式环境

```bash
# 构建测试环境

# 构建生产环境
npm run build:prod

# 配置nginx
参考下面Nginx说明

```

如果您不是开发者，或者没有相关前端开发经验，您可以直接使用release出来的版本进行运行
release文件下载地址：https://gitee.com/mulanbay/mulanbay-ui-vue3/releases

## 运行说明

（1）如果您是开发环境以源码方式运行，那么直接可以访问前端的地址就可以了，无需使用Nginx.
（2）如果您是正式环境以打包出的项目方式运行(或直接下载的是release发布包)，那么需要使用Nginx进行前后端跨域配置才能访问，配置如下：

```
    upstream server.mulanbay{
       server 127.0.0.1:8080;
    }
    
    server {
        listen       80;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;
        
        # 头像地址
        location /20 {
            root   /your_path/avatar;
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;
            charset   utf-8;
        }
        
        # 后端api地址
        location /api {
            root   html;
            index  index.html index.htm;
            proxy_pass http://server.mulanbay;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # 前端地址
        location / {
            # (发布出的文件夹地址)
            root /your_path/vue;
            charset   utf-8;
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;            
        }
    }
```

启动Nginx后，在浏览器输入: http://localhost/index
账号密码：mulanbay / 123456

## 常见问题

(1)npm install 运行失败
解决方法:
```
Step 1:可以尝试先清除缓存
npm cache clean -f

Step 2:.删除node_modules目录

Step 3:再次运行命令
npm install

```

## 项目截图

### 基于Vue的PC端
<table>
    <tr>
        <td><img src="https://foruda.gitee.com/images/1711693189324687407/a51df822_352331.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1711693235503695130/4f105c03_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://foruda.gitee.com/images/1711693264317884407/7ab05073_352331.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1711693286994521138/14032088_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://foruda.gitee.com/images/1711693307354029381/4c82d80e_352331.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1711693329137030436/6607f869_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://foruda.gitee.com/images/1711693349834291703/ad902327_352331.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1711693368615440821/e65729b1_352331.png"/></td>
    </tr>
    <tr>
        <td><img src="https://foruda.gitee.com/images/1711693388167077973/d06544c3_352331.png"/></td>
        <td><img src="https://foruda.gitee.com/images/1711693405769701501/8c3e86a0_352331.png"/></td>
    </tr>
</table>


### 微信公众号消息推送

<table>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/154050_af85354a_352331.jpeg "Screenshot_20201015_150843_com.tencent.mm.jpg"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/154104_31b29a07_352331.jpeg "Screenshot_20201015_150911_com.tencent.mm.jpg"/></td>
    </tr>

</table>

### 鸣谢
谢谢JetBrains公司一直以来对木兰湾项目的支持，提供了全系列产品的免费license。

<img src="https://foruda.gitee.com/images/1712229322943756523/d28d99c2_352331.png" width="100px" height="100px">

JetBrains开源支持计划：https://jb.gg/OpenSourceSupport.