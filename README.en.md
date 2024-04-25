## Project Introduction
Mulanbay is a comprehensive system designed for the management of personal consumption, exercise, music, reading, health, diet, and life experiences, among other facets of daily living. It integrates statistical and planning modules with a scheduling system to analyze and execute tasks efficiently. Furthermore, it employs a sophisticated point and rating system to provide a holistic assessment of individuals' overall well-being. Additionally, advanced machine learning algorithms are utilized for data prediction and trend analysis.

The system, serving as a comprehensive personal management platform, primarily addresses three key issues:
* "What are my plans (expectations)?" --> (Modules: Statistics, Planning)
* "What do I need to do?" --> (Module: Calendar)
* "What have I done?" --> (Module: Behavioral Analysis)

Based on the above three questions, can we contemplate the following two questions:
* "What kind of person am I?" (User Profile)
* "How will I be?" (Machine Learning) --> (Module: Data Prediction)

The new version of Mulanbay project redesigned with SpringBoot3 and Vue3.

The project includes frontend and backend，mulanbay-server3 is the backend project,only supplies API。

backend
* Based on SpringBoot3 [mulanbay-server3](https://github.com/mulanbay/mulanbay-server3)

Algorithm：
* Based on sklearn(python)[mulanbay-sklearn](https://gitee.com/mulanbay/mulanbay-sklearn)

### Mulanbay Introduction

[Mulanbay Introduction](https://gitee.com/mulanbay)

### Function

* based on RBAC user authorization
* distributed schedule 
* based on AHANLP NLP
* provide consume、exercise、music practice、reading、health、diet、experience modules
* unified log management and analysis
* template-based statistics, plans, charts, user behavior
* unified calendar management,auto create and finish
* apply disk、CPU、memory monitor
* unified chart(based on echarts)
* message service(wechat message and email)
* data predict(scikit-learn)

## Development specification

### Technology

Vue3、Element UI、Echarts

### Software Requirement
| Software               | Version     |
| ---------------------- | ----------- |
| node                   | v20.12      |
| npm                    | v10.5       |
| Nginx                  | 1.17+       |


### develop enviroment

```bash
# clone project

# cd the folder
cd mulanbay-ui-vue3

# config backend api
vue.config.js（default:localhost:8080/api）

# install
npm install

#
# run
npm run dev
```

Address: http://localhost/index
Default Account：mulanbay / 123456

### product enviroment

```bash

# build
npm run build:prod

```

release download link：https://gitee.com/mulanbay/mulanbay-ui-vue3/releases

## nginx config

```
    upstream server.mulanbay{
       server 127.0.0.1:8080;
    }
    
    server {
        listen       80;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;
        
        # avatar
        location /20 {
            root   /your_path/avatar;
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;
            charset   utf-8;
        }
        
        # api
        location /api {
            root   html;
            index  index.html index.htm;
            proxy_pass http://server.mulanbay;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # web
        location / {
            root /your_path/vue;
            charset   utf-8;
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;            
        }
    }
```

## Project Screenshot

### Web
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


### WeChat message

<table>
    <tr>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/154050_af85354a_352331.jpeg "Screenshot_20201015_150843_com.tencent.mm.jpg"/></td>
        <td><img src="https://images.gitee.com/uploads/images/2020/1116/154104_31b29a07_352331.jpeg "Screenshot_20201015_150911_com.tencent.mm.jpg"/></td>
    </tr>

</table>


### Acknowledgment

Thanks to JetBrains for their continued support of Mulanbay project by providing a free license for the full range of products.

<img src="https://foruda.gitee.com/images/1712229322943756523/d28d99c2_352331.png" width="100px" height="100px">

JetBrains OpenSourceSupport：https://jb.gg/OpenSourceSupport.