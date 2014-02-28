/*+======================================
* 图片延迟加载 广告延迟加载工具
* 属于M.js前端整体解决方案里面的延迟加载工具
* y.z.m 2014.0.24
*+======================================*/
(function ($,window,document,undefined){
    var opts={
            img:null, // 图片标识
            ads:null, // 广告标识
            num: 100, // 数值越大显示的时间越提前
            time: 100, // 图片的延迟时间
            attr:null, // 图片数据 广告数据的位置标识
            fn:null // 处理显示之后的功能函数
        },
        store=[],
        ad=[],
        num,
        time,
        poll,
        distance=function(obj,add){
            var a=$(obj).position().top,
                b=(window.innerHeight || document.documentElement.clientHeight),
                c=(parseInt(add,10)+$(window).scrollTop());
            return ( (a>0?a:0) <= (b+c) );
        },
        pollImages=function (){
            for(var i=store[0].length;i--;){
                if(distance(store[0][i],num)){
                    var bute=$(store[0][i]).attr(opts.attr.img);
                    if(bute){
                        var obj=$(store[0][i]);
                        obj.prepend('<img src="'+bute+'">');
                        if(opts.fn){
                            opts.fn(obj);
                        }
                    };
                    store[0].splice(i,1);
                }
            }
            for(var n=ad[0].length;n--;){
                if(distance(ad[0][n],num)){
                    $('ul>li',ad[0][n]).each(function(i,e){
                        $(this).append(decodeURIComponent($(this).attr(opts.attr.ads)));
                    });
                    ad[0].splice(n,1);
                }
            }
            !store[0].length && !ad[0].length && (removeEvent()); //队列为空则取消事件绑定
        },
        timing=function (){
            clearTimeout(poll);
            poll = setTimeout(pollImages, time);
        },
        removeEvent=function(){
            try{
                if(window.removeEventListener){
                    window.removeEventListener('resize',timing,false);
                    window.removeEventListener('scroll',timing,false);
                }else{
                    window.detachEvent('onresize',timing);
                    window.detachEvent('onscroll',timing);
                }
            }catch(e){}
            return true;
        },
        init=function (obj){
            opts=$.extend(opts,obj);
            var nodes=$(opts.img),
                el=$(opts.ads);
            num=opts.num || 0;
            time=opts.time || 250;
            store.push(nodes);
            ad.push(el);
            timing();
            if(document.addEventListener){
                window.addEventListener('resize',timing,false);
                window.addEventListener('scroll', timing, false);
            }else{
                window.attachEvent('onresize', timing);
                window.attachEvent('onscroll', timing);
            }
        };
    init({
        img:".img",
        ads:".gg",
        attr:{img:"i",ads:"ad-data"},
        fn:function(obj){
        }
    });
})(jQuery,window,document);