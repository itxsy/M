/* ==================================================
 * M.dom.js M框架dom操作部分 目前只提供最基本的dom操作
 * 模仿jquery的架构 基于原型链继承
 * dom目前支持的选择器:
 * tag
 * tag > .className
 * tag > tag
 * #id > tag.className
 * .className tag
 * tag, tag, #id
 * tag#id.className
 * .className
 * span > * > b
 * 现在实现的API
 * html()
 * attr()
 * value()
 * text()
 * val()
 * extend({})
 * Dom.fn.extend({})
 * 版本 v.1.0.0
 * yzm 2014.2.26
 * ==================================================*/
(function(window,undefined){
    var document=window.document,navigator=window.navigator,location=window.location;
    var Dom=(function(){
            // 构造函数
            var Dom=function(selector, context){
                    return new Dom.fn.init(selector, context);
                },
                _Dom=window.Dom,
                _$=window.$,

                rdigit=/\d/,
                snack = /(?:[\w\-\\.#]+)+(?:\[\w+?=([\'"])?(?:\\\1|.)+?\1\])?|\*|>/ig,
                exprClassName = /^(?:[\w\-_]+)?\.([\w\-_]+)/,
                exprId = /^(?:[\w\-_]+)?#([\w\-_]+)/,
                exprNodeName = /^([\w\*\-_]+)/,
                na = [null,null],

                toString=Object.prototype.toString,
                hasOwn=Object.prototype.hasOwnProperty,
                push=Array.prototype.push,
                slice=Array.prototype.slice,
                trim=String.prototype.trim,
                indexOf=Array.prototype.indexOf,
                class2type={};

            Dom.fn=Dom.constructor={
                constructor:Dom,
                init:function(selector, context){
                    context = context || document;
                    var simple = /^[\w\-_#]+$/.test(selector);
                    if (!simple && context.querySelectorAll && (!(typeof selector == 'object')) ) {
                        return Dom.classArray(Dom.realArray(context.querySelectorAll(selector)));
                    }
                    if ((!(typeof selector == 'object')) && selector.indexOf(',') > -1) {
                        var split = selector.split(/,/g), ret = [], sIndex = 0, len = split.length;
                        for(; sIndex < len; ++sIndex) {
                            ret = ret.concat( _find(split[sIndex], context) );
                        }
                        return Dom.classArray(Dom.unique(ret));
                    }
                    if((!(typeof selector == 'object'))){
                        var parts = selector.match(snack),
                            part = parts.pop(),
                            id = (part.match(exprId) || na)[1],
                            className = !id && (part.match(exprClassName) || na)[1],
                            nodeName = !id && (part.match(exprNodeName) || na)[1],
                            collection;
                    }
                    if (className && !nodeName && context.getElementsByClassName) {
                        collection = Dom.realArray(context.getElementsByClassName(className));
                    } else {
                        collection = !id && Dom.realArray(context.getElementsByTagName(nodeName || '*'));
                        if (className) {
                            collection = Dom.filterByAttr(collection, 'className', RegExp('(^|\\s)' + className + '(\\s|$)'));
                        }
                        if (id) {
                            var byId = context.getElementById(id);
                            return Dom.classArray(byId?[byId]:[]);
                        }
                    }
                    if((!(typeof selector == 'object'))){
                        return Dom.classArray(parts[0] && collection[0] ? Dom.filterParents(parts, collection) : collection);
                    }else{
                        return Dom.classArray([selector]);
                    }
                },
                selector:"",
                Dom:"1.0.0",
                length:0,
                each:function(callback,args){
                    return Dom.each(this,callback,args);
                }
            };
            Dom.fn.init.prototype=Dom.fn;
            Dom.extend=Dom.fn.extend=function(){
                var options,name,src,copy,copyIsArray,clone,
                    target=arguments[0] || {},
                    i=1,
                    length=arguments.length,
                deep=false;
                if(typeof target === "boolean"){
                    deep=target;
                    target=arguments[1] || {};
                    i=2;
                }
                if(typeof target !== "object" && !Dom.isFunction(target)){target={};}
                if(length===i){target=this;--i;}
                for(;i<length;i++){
                    if((options = arguments[ i ]) != null){
                        for(name in options){
                            src=target[name];
                            copy=options[name];
                            if(target===copy){continue;}
                            if(deep && copy && ( Dom.isPlainObject(copy) || (copyIsArray = Dom.isArray(copy)) )){
                                if(copyIsArray){
                                    copyIsArray=false;
                                    clone=src && Dom.isArray(src) ? src:[];
                                }else{
                                    clone=src && Dom.isPlainObject(src) ? src : {};
                                }
                                target[name]=Dom.extend(deep,clone,copy);
                            }else if(copy !== undefined){
                                target[name]=copy;
                            }
                        }
                    }
                }
                return target;
            };
            // 扩展工具函数 静态方法
            Dom.extend({
                noConflict:function(deep){
                    if (window.$===Dom){// 交出$的控制权
                        window.$=_$;
                    }
                    if(deep && window.Dom===Dom){// 交出Dom的控制权
                        window.Dom=_Dom;
                    }
                    return Dom;
                },
                isFunction:function(obj){return Dom.type(obj)==="function";},
                isArray:Array.isArray || function(obj){return Dom.type(obj)==="array";},
                isWindow:function(obj){return obj && typeof obj === "object" && "setInterval" in obj;},
                isNaN:function(obj){return obj==null || !rdigit.test(obj) || isNaN(obj);},
                type:function(obj){
                    return obj==null?String(obj):class2type[toString.call(obj)] || "object";
                },
                isPlainObject:function(obj){
                    if(!obj || Dom.type(obj) !== "object" || obj.nodeType || Dom.isWindow(obj)){
                        return false;
                    }
                    if(obj.constructor && !hasOwn.call(obj,"constructor") && !hasOwn.call(obj.constructor.prototype,"isPrototypeOf")){return false;}
                    var key;
                    for(key in obj){}
                    return key===undefined || hasOwn.call(obj,key);
                },
                isEmptyObject:function(obj){
                    for(var name in obj){return false;}
                    return true;
                },
                nodeName:function(elem,name){
                    return elem.nodeName && elem.nodeName.toUpperCase()===name.toUpperCase();
                },
                each:function(object,callback,args){
                    var name,i=0,length=object.length,isObj=length===undefined || Dom.isFunction(object);
                    if(args){
                        if(isObj){
                            for(name in object){
                                if(callback.apply(object[name],args)===false){
                                    break;
                                }
                            }
                        }else{
                            for(;i<length;){
                                if(callback.apply(object[i++],args)===false){
                                    break;
                                }
                            }
                        }
                    }else{
                        if(isObj){
                            for(name in object){
                                if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                                    break;
                                }
                            }
                        } else {
                            for ( ; i < length; ) {
                                if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
                                    break;
                                }
                            }
                        }
                    }
                    return object;
                },
                trim: trim ?
                function( text ) {
                    return text == null ?
                        "" :
                        trim.call( text );
                } :
                function( text ) {
                    return text == null ?
                        "" :
                        text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
                },
                // 选择器引擎用到的内部方法
                realArray:function (c) {
                    try {
                        return Array.prototype.slice.call(c);
                    } catch(e) {
                        var ret = [], i = 0, len = c.length;
                        for (; i < len; ++i) {
                            ret[i] = c[i];
                        }
                        return ret;
                    }
                },
                filterParents:function (selectorParts, collection, direct) {
                    var parentSelector = selectorParts.pop();
                    if (parentSelector === '>') {
                        return Dom.filterParents(selectorParts, collection, true);
                    }
                    var ret = [],
                        r = -1,
                        id = (parentSelector.match(exprId) || na)[1],
                        className = !id && (parentSelector.match(exprClassName) || na)[1],
                        nodeName = !id && (parentSelector.match(exprNodeName) || na)[1],
                        cIndex = -1,
                        node, parent,
                        matches;
                    nodeName = nodeName && nodeName.toLowerCase();
                    while ( (node = collection[++cIndex]) ) {
                        parent = node.parentNode;
                        do {
                            matches = !nodeName || nodeName === '*' || nodeName === parent.nodeName.toLowerCase();
                            matches = matches && (!id || parent.id === id);
                            matches = matches && (!className || RegExp('(^|\\s)' + className + '(\\s|$)').test(parent.className));
                            if (direct || matches) { break; }
                        } while ( (parent = parent.parentNode) );
                        if (matches) {
                            ret[++r] = node;
                        }
                    }
                    return selectorParts[0] && ret[0] ? Dom.filterParents(selectorParts, ret) : ret;
                },
                unique:function(){
                    (function(){
                        var uid = +new Date();  
                        var data = (function(){
                            var n = 1;
                            return function(elem) {
                                var cacheIndex = elem[uid],
                                    nextCacheIndex = n++;
                                if(!cacheIndex) {
                                    elem[uid] = nextCacheIndex;
                                    return true;
                                }
                                return false;
                            };
                        })();
                        
                        return function(arr) {
                            var length = arr.length,
                                ret = [],
                                r = -1,
                                i = 0,
                                item;
                            for (; i < length; ++i) {
                                item = arr[i];
                                if (data(item)) {
                                    ret[++r] = item;
                                }
                            }
                            uid += 1;
                            return ret;
                        };
                    })();
                },
                filterByAttr:function (collection, attr, regex) {
                    var i = -1, node, r = -1, ret = [];
                    while ( (node = collection[++i]) ) {
                        if (regex.test(node[attr])) {
                            ret[++r] = node;
                        }
                    }
                    return ret;
                },
                // 结束
                classArray:function(dom){
                    var toArray = function(s){
                        try{
                            return Array.prototype.slice.call(s);
                        } catch(e){
                               var arr = [];
                                for(var i = 0,len = s.length; i < len; i++){
                                    arr[i] = s[i]; 
                               }
                                return arr;
                        }
                    }
                    var arr = toArray(dom);
                    for(var i in Dom){
                        arr[i] = Dom[i];
                    }
                    return arr;
                }
            });
            return Dom;
        })();
    var rnocache = /<(?:script|object|embed|option|style)/i,
        rspace = /\s+/,
        rinlineDom= / Dom\d+="(?:\d+|null)"/g;
    // 属性操作
    Dom.extend({
        text:function(value){
            if(value||value==""){
                Dom.each(this,function(){
                    this.textContent? this.textContent = value:this.innerText = value;
                });
                return this;
            }else{
                var ret = "";
                Dom.each(this,function(){
                    ret+=this.textContent? this.textContent:this.innerText;
                });
                return ret;
            }
        },
        val:function(value){
            var arr = [];
            Dom.each(this,function(){
                (value||value=="") ? this.value = value : arr.push(this.value);
            });
            return arr.length>0 ? arr.join("") : this;
        },
        value:function(value){
            if(this[0].tagName.match(/INPUT|TEXTAREA/)){
                if(value&&value!=true){
                    this.val(value);
                }else{
                    return this.val();
                }
            }else{
                if(value==true){
                    return this.text();
                }else if(value){
                    this.html(value);
                }else{
                    return this.html();
                }
            }
            return this;
        },
        attr:function(name,value){
            var ele = this;
            if(value!=undefined){
                Dom.each(ele,function(i,e){
                    this.setAttribute(name,value);
                });
                return ele;
            }else{
                var arr=[],tmp;
                Dom.each(ele,function(i,e){
                    tmp = this.getAttribute(name)||this.attributes[name];
                    if(!tmp){
                        if(this.getAttributeNode){
                            tmp = this.getAttributeNode(name)?this.getAttributeNode(name).value:"";
                        }
                    }
                    if(name&&name=="class"&&this.className){
                        tmp = this.className;
                    }
                    arr.push(tmp);
                });
                return arr.length==1? arr[0] : arr;
            }
        },
        html:function(value) {
            var ele = this;
            if(typeof value=="undefined"){
                var arr=[];
                Dom.each(ele,function(){
                    arr.push(this.innerHTML);
                });
                return arr.length==1?arr.join(""):arr;
            }else{
                Dom.each(ele,function(i,e){
                    if(document.all&&e.tagName == "table"){
                        var temp = e.ownerDocument.createElement('div');
                        temp.innerHTML = '<table><tbody>' + value + '</tbody></table>';
                        e.parentNode.replaceChild(temp.firstChild.firstChild, e.parentNode.tBodies[0]);
                    }else{
                        this.innerHTML = value;
                    }
                });
                return ele;
            }
        },
        remove:function(){
            var elem=this;
            if(elem[0].nodeType != 8 && elem[0].nodeType != 3 && elem[0].nodeType !=9){
                elem[0].parentNode.removeChild(elem[0]);
            }
            return this;
        },
        prev:function(){
            var elem=this;
            do{
                this[0]=elem[0].previousSibling;
            }while(elem[0].nodeType!=1);
            return this;
        },
        next:function(){
            var elem=this;
            do{
                this[0]=elem[0].nextSibling;
            }while(elem[0].nodeType !=1);
            return this;
        },
        // 供first调用
        _next:function(elem){
            var elem=elem;
            do{
                elem[0]=elem[0].nextSibling;
            }while(elem[0].nodeType !=1);
            return elem;
        },
        // 供last调用
        _prev:function(elem){
            var elem=elem;
            do{
                elem[0]=elem[0].previousSibling;
            }while(elem[0].nodeType!=1);
            return elem;
        },
        first:function(){
            var elem=this;
            elem[0]=this[0].firstChild;
            return (elem[0] && elem[0].nodeType !=1)?Dom._next(elem):elem;
        },
        last:function(){
            var elem=this;
            elem[0]=this[0].lastChild;
            return (elem[0] && elem[0].nodeType !=1)?Dom._prev(elem):elem;
        },
        parent:function(){
            var elem=this;
            this[0]=elem[0].parentNode;
            return this;
        },
        addClass:function(value){
            if(value  &&  typeof value === "string"){    
                var classNames=(value || "").split(rspace);  
                //以空格为分割号, 把参数make成数组
                for(var i=0,l=this.length;i<l;i++){  
                    //循环集合内每个元素, 依次addClass
                    var elem=this[i];
                    if(elem.nodeType === 1){  
                        //确认是dom节点
                        if(!elem.className){   
                            elem.className=value;
                            //如果没有className属性, 直接把className设置为value
                        }else{
                            var className=" " + elem.className + " ",
                                setClass=elem.className;  
                            //加2个空格是为了统一className的格式, 方便后面的indexOf判断
                            for(var c=0,cl=classNames.length;c<cl;c++){
                                if(className.indexOf(" " + classNames[c] + " " ) < 0){ 
                                    //如果当前的className中没有
                                    setClass += " " + classNames[c];       
                                }
                            }
                            elem.className = Dom.trim(setClass);  
                            //去掉前后空格
                        }
                    }
                }
            }
            return this;
        },
        removeClass:function( value ) {
            if((value && typeof value === "string") || value === undefined ){  
                //value为undefined时, remove掉所有的className.
                var classNames=(value || "").split(rspace);  
                //需要remove掉的classNames, 数组形式
                for (var i = 0,l = this.length; i < l;i++){
                    var elem=this[i];
                    if (elem.nodeType === 1 && elem.className){
                        if(value){
                            var className=(" " + elem.className + " ").replace(rclass, " "); 
                            //当前的className中的多个空格合并成一个空格
                            for(var c = 0, cl = classNames.length; c < cl; c++ ) {
                                className = className.replace(" " + classNames[c] + " ", " ");  
                                //把需要被remove的className替换为""
                            }
                            elem.className = Dom.trim( className );
                        } else {
                            elem.className = "";  
                            //参数为undefined的时候, 清空className
                        }
                    }
                }
            }
            return this;
        }
    });
    // 动画
    Dom.extend({
        show:function(){
            var elem=this;
            elem[0].style.display='block';
            return this;
        },
        hide:function(){
            var elem=this;
            elem[0].style.display='none';
            return this;
        }
    });
    window.Dom=window.$=Dom;
})(window);