M
=
## M.js简介
M.js是一个轻量级的前端解决方案，包含js的模块化加载，js函数的队列/异步执行，为js实现模拟面向对象的写法提供方法，DOM操作、事件绑定、服务器通信等模块都没有耦合，框架的几个模块都可以拆分。
框架借鉴了很多jquery的思想以及集成了网上的一些解决浏览器兼容的方法，框架的API调用支持链式调用，几乎和使用jquery的习惯一样。
这个框架目前还是初级版本，但她可以解决一些事情，适合一些页面效果不是太多的网站。

写这个框架的目的是因为现有的项目自身对jquery依赖不高，jquery本身很多功能现有项目用不上，但是必须加载一个几十KB的jquery文件，基于此目的我才写了这框架。

写这个框架之前我巩固了下javascript以及重新阅读了jquery源码，部分代码也借鉴了网上大牛的处理方式，这个框架目前自己感觉写得有点蹩脚，但是目前的水平有限，代码还不是最优。
同时感觉到jquery写的是多么的优雅。写完这个框架我感觉到我自己的js水平是多么的需要再提升。


## M.js结构
- M.js    框架的主入口，负责调用js模块以及执行队列任务和提供js模拟面向对象的方法
- M.net   框架的通信组件 负责前端和服务器的通信
- M.event 框架的事件绑定组件 负责事件绑定
- M.dom   框架的DOM操作组件

## tool工具文件
- M.delay 图片延迟加载工具

## API
- M.when();//函数队列方法
```javascript
M.when('A',function(){
    console.log('我是列队A里面的函数');
});
M.when('B',function(){
    console.log('我是列队B里面的函数');
});
```
以上函数被排入队列，如果没有触发不会执行
- M.trigger();队列触发
使用方法：
```javascript
M.trigger('B').('A');//函数执行 B函数 A函数
```
- M.delay();函数等待执行
```javascript
M.delay('2000',function(){
    console.log('hello');
});//预计两秒之后开始执行
```
这里定义的时间不可能2秒准时执行，因为javascript是单线程的，如有不理解的话可以自行百度下
- M.extend();实现js模拟面向对象的写法
使用方法：
```javascript
var A=M.extend(null,{
    // 父类构造函数
    __construct:function (a,b){
        this.name=a;
        this.sex=b;
    },
    //方法a、b、c
    a:function(){
        return this.name;
    },
    b:function(){
        alert('我的名字叫'+this.name);
    },
    c:function(){
        return this.sex;
    }
});
//M.extend()的第一个参数只能是被继承的函数名或者null，被继承的函数第一个参数为null。第二个参数为对象，里面包含需要的方法和一个构造函数。
var fn1=new A('小明','21');
fn1.b();
继承函数B
var B=M.extend(A,{
    a:function(){
        alert('我的名字叫'+this.name);
        return this.name;
    },
    get:function(){
        var a=B.uber.c.call(this);//B.uber.c.call()这种写法可以调用父类的方法为子类所用
        var b=B.uber.a.call(this);
        var c=this.a();
        alert('我的名字叫',c+'他的名字叫'+b+'他今年'+a);
    }
});
var fn2=new B('小美','20');
fn2.a();
fn2.get();
```
如果继承函数自身有构造函数那么将覆盖父类的构造函数。
- extend()基于原型链的继承，最大的特点就是可以改写父类的方法，这是优点同时也是缺点，所以框架保留了两个继承方法。
使用方法：
```javascript
//必须要写在这里面
M(function(){
    //...code
});
 
M(function(){
    var BaseA=function(a,b,c){
        this.a=a;
        this.b=b;
        this.c=c;
    };
    BaseA.prototype={
        init:function(){
            var a=this.a,b=this.b,c=this.c;
            alert('我是:'+a+'我是:'+b+'我是:'+c);
        },
        run:function(){}
    };
    var b=function(option){
        BaseA.apply(this,option);
    };
    var x={a:function(){alert('我是扩展')}};
    b.extend(BaseA,x);
 
    b.prototype.run=function(){
        this.init();
        var method={
            a:function(){
                alert('我是a方法从继承者b里面扩展');
            }
        }
        method.a();
    };
    var c=new b(['1','a','v']);
    c.run();
    b.prototype.a();
});
```
外部js加载，网上也叫模块化加载，有一种装逼的叫法叫异步加载。
- M.add();两个参数，第一个参数是名称，第二个参数是一个对象，包含地址和类型。
用法：
```javascript
M.add('b',{path:'js/m/a.css',type:'css'});
M.add('a',{path:'js/m/a.js',type:'js',requires:['b']});
var cc=function(){
    M('a',function(){
        $("#wo").addClass("red");
    });
};
M(function(){
    M("#wo").bind("click",function(){cc()});
});
```
a模块依赖b模块执行，如果看的时候不好理解，建议运行下代码。
如果很多模块需要加载那么需要设置多个$$.add();
- M.SET();批量设置
```javascript
M.SET('model',{
a:{path:'',type:''},
b:{path:'',type:'',requires:[]}
});
M('b',function(){
    //回调函数
});
```
- 样式注入：
```javascript
M.css(['.dui-dialog .hd h3{margin:0;}','.dui-dialog-close:link{text-decoration:none;}'].join('n'));
```
或者这样写：
```javascript
M.css('.dui-dialog .hd h3{margin:0;}.dui-dialog-close:link{text-decoration:none;}');
```
- M.dom组件的API
M.dom操作属性可以用Dom()也可以用$。
- 支持的选择器方式
- Dom(tag);Dom(tag > .className);
- Dom(tag > tag);
- Dom(#id > tag.className);
- Dom(.className tag);
- Dom(tag, tag, #id);
- Dom(tag#id.className);
- Dom(.className);
- Dom(span > * > b);

```javascript
Dom(selector).text();
Dom(selector).val();
Dom(selector).value();
Dom(selector).html();
Dom(selector).remove();
Dom(selector).removeClass();
Dom(selector).addClass();
Dom(selector).attr();
Dom(selector).prev();
Dom(selector).next();
Dom(selector).first();
Dom(selector).last();
Dom(selector).parent();
Dom(selector).show();
Dom(selector).hide();
```
- M.event 事件绑定组件
```javascript
Event.on();// 绑定基本事件
Event.off();// 移除事件
Event.top();// 阻止元素冒泡
Event.prevent();// 阻止浏览器点击事件的默认行为
```
- M.net 通信组件的API
```javascript
ajax.run({
	async:true,// 是否异步
    type:"POST",// 提交方式
    dataType:"json", // 数据格式
    cache:true, // 是否开启IE下的缓存
    error:function(error) {},// 错误回调
    success:function() {} // 回调函数
})
```
由于时间匆忙，API可能不够详细，如果感觉迷惑，那么可以看下源码。