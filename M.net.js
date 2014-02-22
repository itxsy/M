ajax = {
    init:function() {
        return this.CreateHTTPObject();
    },
    accepts:function(a) {
        var opts = {
            html:"text/html,text/css",
            text:"text/plain",
            json:"application/x-www-form-urlencoded, text/javascript"
        };
        return opts[a];
    },
    toData:function(data) {
        var arr = [];
        for (var i in data) {
            arr.push(i + "=" + data[i]);
        }
        arr = arr.join("&");
        return arr;
    },
    // 强大的方法 来自jquery
    extend:function(obj, prop) {
        if (!prop) {
            prop = obj;
            obj = this;
        }
        for (var i in prop) {
            obj[i] = prop[i];
        }
        return obj;
    },
    //创建一个XMLHttpRequest对象
    CreateHTTPObject:function() {
        var xmlhttp = false;
        // 使用IE的的ActiveX项来加载该文件
        if (typeof ActiveXObject != "undefined") {
            try {
                xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (E) {
                    xmlhttp = false;
                }
            }
        } else if (window.XMLHttpRequest) {
            try {
                xmlhttp = new XMLHttpRequest();
            } catch (e) {
                xmlhttp = false;
            }
        }
        return xmlhttp;
    },
    communicate:function(o) {
        var xmlhttp = this.init(), // 每次调用重新创建XMLHttpRequest对象解决IE缓存问题
        param = this.toData(o.data);
        if (!xmlhttp || !o.url) {
            return;
        }
        // 如果来自服务器的响应没有 XML mime-type 头部，则一些版本的 Mozilla 浏览器不能正常运行
        // 对于这种情况，httpRequest.overrideMimeType('text/xml'); 语句将覆盖发送给服务器的头部，强制 text/xml 作为 mime-type
        if (xmlhttp.overrideMimeType) {
            xmlhttp.overrideMimeType("text/xml");
        }
        if (!o.dataType) {
            o.dataType = "text";
        }
        o.dataType = o.dataType.toLowerCase();
        // 转换为小写
        var cache = function() {
            var now = "time=" + new Date().getTime();
            o.url += o.url.indexOf("?") + 1 ? "&" :"?";
            o.url += now;
        };
        o.cache ? cache() :false;
        // IE缓存问题
        xmlhttp.open(o.type, o.url, o.async);
        xmlhttp.setRequestHeader("Content-Type", this.accepts(o.dataType));
        xmlhttp.onreadystatechange = function() {
            // 调用一个状态变化时的功能
            if (xmlhttp.readyState == 4) {
                // 就绪状态为4时该文件被加载
                if (xmlhttp.status == 200) {
                    var result = "";
                    if (xmlhttp.responseText) {
                        result = xmlhttp.responseText;
                    }
                    // 如果返回的是JSON格式，返回之前eval的结果
                    if (o.dataType == "json") {
                        // JSON字符串如果包含\n换行符计算时会出错，所有需要全部替换
                        result = result.replace(/[\n\r]/g, "");
                        result = eval("(" + result + ")");
                    }
                    //给数据给回调函数
                    if (o.success) {
                        o.success(result);
                    }
                } else {
                    //发生错误
                    if (o.error) {
                        o.error(xmlhttp.status);
                    }
                }
            }
        };
        xmlhttp.send(param);
    },
    run:function(options) {
        var opts = {
            async:true,
            type:"POST",
            dataType:"json",
            cache:true,
            error:function(error) {},
            success:function() {}
        }, o = this.extend(opts, options);
        this.communicate(o);
    }
};