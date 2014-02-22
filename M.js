(function (win, doc, undefined) {
    'use strict';
    // 框架常用的变量声明
    var loaded = {},// 已加载模块
        loadList = {},// 已加载列表
        loadingFiles = {},// 加载中的模块
                
        globalList = [],// 全局模块
        readyList = [],
        isReady = false,
        // 内部配置文件
        config = {
            autoLoad : true,// 是否自动加载核心库
            timeout : 100,// 加载延迟
            coreLib : ['/M/js/jquery.Small.min.1.0.js'],// 核心库
            model: {}
        },
        uid=1,//用来异步执行的变量
        map={},//存放异步执行的字面量
        rmap={},//存放异步执行的字面量
        jsReference=[];// 加载外部模块参考位置
    // 初始外部配置
    (function(){
        var jsObj = (function (a) {
            var files = a.getElementsByTagName('script');
            jsReference[0] = files[files.length - 1];
            return files[files.length - 1];
        }(doc));
        (function(a){
            var obj=a,
                initAuto=obj.getAttribute('auto'),//是否关闭自动加载
                initCore=obj.getAttribute('core');//外部加载的核心库
            if(initAuto){
                config.autoLoad=(initAuto.toLowerCase()==='false')?false:true;
            }
            if(initCore){
                config.coreLib=initCore.split(',');
            }
        }(jsObj||{}));
    }());
    // 内部方法
    var method={
        _isArray : function (e) {
            return e.constructor === Array;
        },
        _getMod : function (e){
            var model = config.model,
                mod; 
            if(typeof e === 'string') {
                mod=(model[e]) ? model[e] : {path : e};
            }else{
                mod = e;
            }
            return mod;
        },
        _load : function (url, type, charset, cb) {
            var wait,nodeStr,t,img, 
            done = function () {
                loaded[url] = 1;
                cb && cb(url);
                cb = null;
                win.clearTimeout(wait);
            };
            if(!url){return;}
            if(loaded[url]){
                loadingFiles[url]=false;
                if(cb){
                    cb(url);
                }
                return;
            }
            if(loadingFiles[url]){
                setTimeout(function(){
                    method._load(url,type,charset,cb);
                },10);
                return;
            }
            loadingFiles[url]=true;
            wait=win.setTimeout(function(){
                if(config.timeoutCallback){
                    try{config.timeoutCallback(url);}catch(ex){}
                }
            },config.timeout);
            t=type || url.toLowerCase().split(/\./).pop().replace(/[\?#].*/,'');
            if(t==='js'){
                nodeStr=doc.createElement('script');
                nodeStr.setAttribute('type','text/javascript');
                nodeStr.setAttribute('src',url);
                nodeStr.setAttribute('async',true);
            }else if(t==='css'){
                nodeStr=doc.createElement('link');
                nodeStr.setAttribute('type', 'text/css');
                nodeStr.setAttribute('rel', 'stylesheet');
                nodeStr.setAttribute('href', url);
            }
            if(charset){nodeStr.charset=charset;}
            nodeStr.onerror=function(){done();nodeStr.onerror=null;};
            nodeStr.onload=nodeStr.onreadystatechange=function(){
                var url;
                if(!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete'){
                    done();
                    nodeStr.onload=nodeStr.onreadystatechange=null;
                }
            };
            jsReference[0].parentNode.insertBefore(nodeStr,jsReference[0]);
        },
        // 加载依赖论文件(顺序)
        _loadDeps:function(deps,cb){
            var model=config.model,
                id=deps.join(''),
                m,
                mod,
                i=0,
                len=deps.length;
            if(loadList[id]){
                cb();
                return;
            }
            //回调函数 比如模块加载完成需要处理的函数
            function callback(){
                if(!--len){
                    loadList[id]=1;
                    cb();
                }
            }
            for(;m=deps[i++];){
                mod=method._getMod(m);
                if(mod.requires){
                    method._loadDeps(mod.requires,(function(m){
                        return function(){
                            method._load(m.path,m.type,m.charset,callback);
                        };
                    }(mod)));
                }else{
                    method._load(mod.path,mod.type,mod.charset,callback);
                }
            }
        },
        contentLoaded:function(fn){
            var done=false,top=true, 
                doc=win.document, 
                root=doc.documentElement,
                add=doc.addEventListener ? 'addEventListener' : 'attachEvent',
                rem=doc.addEventListener ? 'removeEventListener' : 'detachEvent',
                pre=doc.addEventListener ? '' : 'on',
                init=function(e){
                    if(e.type == 'readystatechange' && doc.readyState != 'complete'){return;}
                    (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                    if (!done && (done = true)){fn.call(win, e.type || e);}
                },
                poll=function(){
                    try {root.doScroll('left');} catch(e){setTimeout(poll, 50); return;}
                    init('poll');
                };
            if(doc.readyState == 'complete'){
                fn.call(win, 'lazy');
            }else{
                if (doc.createEventObject && root.doScroll) {
                    try { top = !win.frameElement; } catch(e) { }
                    if (top) {
                        poll();
                    }
                }
                doc[add](pre + 'DOMContentLoaded', init, false);
                doc[add](pre + 'readystatechange', init, false);
                win[add](pre + 'load', init, false);
            }
        },
        fireReadyList:function(){
            var i=0,list;
            if (readyList.length){
                for(;list=readyList[i++];){
                    M.apply(this,list);
                }
            }
        },
        // 某些方面讲这是个异步执行的核心方法 这方法还有优化空间
        fire:function(callback,thisObj){
            setTimeout(function(){
                callback.call(thisObj);
            },0);
        }
    },
    // 查找数组里面当前元素的位置
    indexOf=Array.prototype.indexOf || function(obj){
        for(var i=0,len=this.length;i<len;++i){
            if(this[i]===obj){return i;}
        }
        return -1;
    };
    var M=function(){
        var args=[].slice.call(arguments),fn,id;
        // 加载核心库
        if(config.autoLoad && !loadList[config.coreLib.join('')]){
            method._loadDeps(config.coreLib,function(){
                M.apply(null,args);
            });
            return;
        }
        // 加载全局库
        if(globalList.length > 0 && !loadList[globalList.join('')]){
            method._loadDeps(globalList,function(){
                M.apply(null,args);
            });
            return;
        }
        if(typeof args[args.length-1]==='function'){
            fn=args.pop();
        }
        id=args.join('');
        if((args.length === 0 || loadList[id]) && fn){
            fn();
            return;
        }
        //正常加载
        method._loadDeps(args,function(){
            loadList[id] = 1;
            fn && fn();
        });
        return M;
    };
    //异步执行的内置方法
    M._release=function(res,list){
        var maps=map,
            rmaps=rmap;
        for(var i=0,len=list.length;i<len;++i){
            var uid=list[i],
                mapItem=maps[uid],
                waiting=mapItem.waiting,
                pos=indexOf.call(waiting,res);
                waiting.splice(pos,1);
            if (waiting.length===0){
                method.fire(mapItem.callback,mapItem.thisObj);
                delete maps[uid];
            }
        }
    };
    //============================= 静态方法 ===========================
    M.add=function(sName,oConfig){
        if(!sName || !oConfig || !oConfig.path){return;}
        config.model[sName]=oConfig;
        return this;
    };
    M.global=function(){
        var args=method._isArray(arguments[0])?arguments[0]:Array.prototype.slice.call(arguments);
        globalList=globalList.concat(args);
        return this;
    };
    M.css=function(s){
        var css=doc.getElementById('do-inline-css');
        if(!css){
            css=doc.createElement('style');
            css.type='text/css';
            css.id='do-inline-css';
            jsReference[0].parentNode.insertBefore(css,jsReference[0]);
        }
        if(css.styleSheet){
            css.styleSheet.cssText=css.styleSheet.cssText + s;
        }else{
            css.appendChild(doc.createTextNode(s));
        }
        return this;
    };
    M.SET=function(n,v){
        config[n]=v;
        return this;
    };
    M.GET=function(n){
        return config[n];
    };
    //框架最新实现的继承方式 和老版本的区别就是它不在Function原型扩展
    M.extend=function (a,b){
        var parent,Child,fn,i;
        Child=function(){
            if(Child.uber && Child.uber.hasOwnProperty("__construct")){
                Child.uber.__construct.apply(this,arguments);
            }
            if(Child.prototype.hasOwnProperty("__construct")){
                Child.prototype.__construct.apply(this,arguments);
            }
        };
        parent=a || {};
        fn=function(){};
        fn.prototype=parent.prototype;
        Child.prototype=new fn();
        Child.uber=parent.prototype;
        Child.prototype.constructor=Child;
        for(i in b){
            if(b.hasOwnProperty(i)){
                Child.prototype[i]=b[i];
            }
        }
        return Child;
    };
    // 异步执行外部调用的等待方法
    M.when=function(resources, callback, thisObj){
        var maps=map,
            rmaps=rmap;
        if(typeof resources === 'string'){resources=[resources];}
        var id=(uid++).toString(16);
        maps[id]={
            waiting:resources.slice(0),
            callback:callback,
            thisObj:thisObj || window
        };
        for (var i=0,len=resources.length;i<len;++i){
            var res=resources[i],
                list=rmaps[res] || (rmaps[res]=[]);
            list.push(id);
        }
        return this;
    };
    // 异步执行外部调用的触发方法
    M.trigger=function(resources){
        if(!resources){return this;}
        var maps=map,
            rmaps=rmap;
        if(typeof resources==='string'){resources=[resources];}
        for(var i=0,len=resources.length;i<len;++i){
            var res=resources[i];
            if (typeof rmaps[res]==='undefined') continue;
            M._release(res,rmaps[res]);
            delete rmaps[res];
        }
        return this;
    };
    //延迟执行
    M.delay=function(){
        var args=[].slice.call(arguments,0),
            delay=args.shift();
        setTimeout(function(){
            M.apply(this,args);
        },delay);
        return this;
    };
    method.contentLoaded(function(){
        isReady=true;
        method.fireReadyList();
    });
    win.M=M;
    //基于原型链的继承 框架最早实现的继承方式
    Function.prototype.extend=function(a,b){
        //保证传进来的参数是函数
        if(!typeof a==="function"){
            return this;
        }
        //保证引用地址完全正确
        this.a=a.prototype;
        this.a.constructor=a.constructor;
        //浅拷贝父函数
        var f=function(){};
        f.prototype=a.prototype;
        //扩展
        if(b){
            for(var property in b){
                f.prototype[property]=b[property];
            }
        }
        //再一次拷贝
        this.prototype=new f();
        this.prototype.constructor=this;//保证指向继承函数自身
        return this;
    };
}(window,document));