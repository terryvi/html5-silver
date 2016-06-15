/**
 * @author  : Terry
 * @version : 0.1
 * @date    : 2016-05-30
 */

 if( typeof Zepto === 'undefined')  { throw new Error('slide.js\'s script requires Zepto')}
 
 !function($){
 	var startPos,           // 开始触摸点(X/Y坐标)
        endPos,             // 结束触摸点(X/Y坐标)
        stage,              // 用于标识 onStart/onMove/onEnd 流程的第几阶段，解决 onEnd 重复调用
        offset,             // 偏移距离
        direction,			// 翻页方向

        curPage, 			// page 当前页
        pageCount,          // page 数量
        pageWidth,          // page 宽度
        pageHeight,         // page 高度

        $list, 		 		//外部，包裹住每个page
 		$itemArr, 			// page 列表      // page 列表
        $animateDom,		// 所有设置 [data-animate] 的动画元素

        options,            // 最终配置项

        touchDown = false,  // 手指已按下 (取消触摸移动时 transition 过渡)
        movePrevent = true; // 阻止滑动 (动画过程中手指按下不可阻止)
 	// 先定义一个实例用法
 	$.fn.slide = function(opts) {
        options = $.extend({}, $.fn.slide.defaults, opts);

        return this.each(function() {
            $list = $(this);
            $itemArr = $list.find('.page');
            start();
        })
    }
    // 默认配置
    $.fn.slide.defaults = {
        direction: 'vertical',  //  "horizontal/vertical"
        swipeAnim: 'default',   //  "default/cover"
        drag: true,             //  是否有拖拽效果 是否允许拖拽 (若 false 则只有在 touchend 之后才会翻页)
        indicator: false,       //  是否要有指示导航
        arrow: false,           //  是否要有箭头
        onchange: function(){}, //  change callback
        orientationchange: function(){}	//  orientation callback
    };

    function start(){
    	// loading是肯定要有的。这里有一个关于loading和 moveprevent的关系，先忽略
        movePrevent = false;

    	curPage 	= 0;
		direction	= 'stay';
        pageCount   = $itemArr.length;           	// 获取 page 数量
        pageWidth   = document.documentElement.clientWidth;     // 获取手机屏幕宽度 
        pageHeight  = document.documentElement.clientHeight;    // 获取手机屏幕高度
        $animateDom = $('[data-animation]');	 	// 获取动画元素节点    感觉到时候我可以改变一下

        for (var i=0; i<pageCount; i++) {          // 批量添加 data-id
            $($itemArr[i]).attr('data-id', i+1);
        }

        // 到时候要把.default.pages .和cover.pages 这两个类 的css详细看看
        $list.addClass(options.direction);		// 添加 direction 类
    	$list.addClass(options.swipeAnim);  	// 添加 swipeAnim 类   目前只要关注default的情况    

        $itemArr.css({                    		// 初始化每一个 page 的宽高
            'width': pageWidth + 'px',
            'height': pageHeight + 'px'
        });

        // 根据是水平方向的滑动还是 竖直方向上的滑动设定整个容器的宽或者	高
        options.direction === 'horizontal' ?     // 设置 wrapper 宽高
            $list.css('width', pageWidth * $itemArr.length) :
            $list.css('height', pageHeight * $itemArr.length);

        // 目前可以暂时不考虑这个
        // if (options.swipeAnim === 'cover') {		// 重置 page 的宽高(因为这两个效果与 default 实现方式截然不同)
        //     $list.css({
        //         'width': pageWidth,
        //         'height': pageHeight
        //     });
        //     $itemArr[0].style.display = 'block'; // 不能通过 css 来定义，不然在 Android 和 iOS 下会有 bug
        // }
        $($itemArr[curPage]).addClass('current');
        animShow();

    }


    // 手指第一次按下时调用
    // 提供的接口：
    //  1. 初始位置 startPos
    // ==============================
    function onStart(e){
        if(movePrevent === true){
            event.preventDefault();
            return false;
        }
        touchDown = true;   // 手指已按下
        // startPos 通过是水平还是垂直来取值，如果是垂直那么去触碰点的Y坐标，如果是水平，就取触碰点的x坐标
        options.direction === 'horizontal' ? startPos = e.pageX : startPos = e.pageY;
        // 暂时不管swipeAnim 是cover的效果 
        $list.addClass('drag');    // 阻止过渡效果 从 css属性来看，这个drag 把animation都给干掉了
        offset = $list.css("-webkit-transform")
                    .replace("matrix(", "")
                    .replace(")", "")
                    .split(",");
        // 这里会得到一个数组...第4，第5 位置 分别表示x,y 水平方向上的变换或者竖直方向上的变换
        options.direction === 'horizontal' ?
            offset = parseInt(offset[4]) :
            offset = parseInt(offset[5]);

        stage = 1;
    }
    // 移动过程中调用（手指没有放开）
    // 提供的接口：
    //  1. 实时变化的 endPos
    //  2. 添加方向类 forward/backward
    // ==============================
    function addDirecClass(){
        // 原本的那里似乎是有点问题，冗余了
        if (endPos >= startPos) {
            $list.removeClass('forward').addClass('backward');
        } else if (endPos < startPos) {
            $list.removeClass('backward').addClass('forward');
        }
    }
    // 拖拽时调用
    function dragToMove(){
        var temp = offset + endPos - startPos;

        options.direction === 'horizontal' ?
            $list.css("-webkit-transform", "matrix(1, 0, 0, 1, " + temp + ", 0)") :
            $list.css("-webkit-transform", "matrix(1, 0, 0, 1, 0, " + temp + ")");
    }
    // 在第一页向前翻和末页前后翻都不允许
    function isHeadOrTail(){
        // 如果是水平方向上的话，如果滑动的 在第1页，如果结束距离大于开始距离  如果在最后一页，结束距离小于开始距离，那么可以滑动
        if ((endPos >= startPos && curPage === 0) ||
            (endPos <= startPos && curPage === pageCount-1)) {
            return true;
        }
        // if (options.direction === 'horizontal') {
        //     
        //     if ((endPos >= startPos && curPage === 0) ||
        //         (endPos <= startPos && curPage === pageCount-1)) {
        //         return true;
        //     }
        // } else if ((endPos >= startPos && curPage === 0) ||
        //         (endPos <= startPos && curPage === pageCount-1)) {
        //     return true;
        // }
        return false;
    }
    function onMove(e){
        // 这里就是跟着动
        if( !touchDown && movePrevent){
            event.preventDefault();
            return false;
        }
        event.preventDefault(); 
        options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;
        addDirecClass();    // 添加方向类  在没有用cover的时候似乎是没什么卵用的
        if (options.drag && !isHeadOrTail()) { // 拖拽时调用
            dragToMove();
        }
        stage = 2;
    }
    // 拖拽结束后调用
    // ==============================
    function animatePage(newPage, action){
        curPage = newPage;
        var newOffset = 0;
        options.direction === 'horizontal' ?
            newOffset = newPage * (-pageWidth) :
            newOffset = newPage * (-pageHeight);

        options.direction === 'horizontal' ?
            $list.css({'-webkit-transform': 'matrix(1, 0, 0, 1, ' + newOffset + ', 0)'}) :
            $list.css({'-webkit-transform': 'matrix(1, 0, 0, 1, 0, ' + newOffset + ')'});

        movePrevent = true;         // 动画过程中不可移动
        setTimeout(function() {
            movePrevent = false;
        }, 300);
    }
    // 手指放开后调用
    // 提供的接口：
    //  1. 获得最后的坐标信息 endPos
    //
    // 执行的操作：
    //  1、将页面归位（前后一页或者原位）
    //  2、为 indicator 添加 current 类
    // ==============================
    function onEnd(e){
        // 松开之后修正位置
        if (movePrevent === true || stage !== 2){
            // event.preventDefault();
            // return false;
        }else{
            touchDown = false;  // 不再按住屏幕了
            options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;  
            if(!isHeadOrTail()){
                $list.removeClass('drag');
                if (Math.abs(endPos-startPos) <= 50) {
                    animatePage(curPage);
                    direction = 'stay';
                }else if (endPos >= startPos) {
                    animatePage(curPage-1);
                    direction = 'backward';
                }else if (endPos < startPos) {
                    animatePage(curPage+1);
                    direction = 'forward';
                }
            }
        }
        if (options.indicator) {
            $($('.parallax-h-indicator ul li, .parallax-v-indicator ul li').removeClass('current').get(curPage)).addClass('current');
        }
        stage = 3;
    }
    $(document).on('touchstart','.page',function(e){
        // 开始拖动的时候
        onStart(e.changedTouches[0]);
    }).on('touchmove','.page',function(e){
        // 拖动ing
        onMove(e.changedTouches[0]);
    }).on('touchend','.page',function(e){
        // 拖动结束
        onEnd(e.changedTouches[0]);
    }).on('webkitAnimationEnd webkitTransitionEnd', '.pages', function() {
        // 当.paegs的动画结束了之后，每个页面的动画开始

        if (direction !== 'stay') { 
            // 这个stay 是在拖动小于50 的时候，表示在原本的页面中，如果还是在本页面中的话，是不做任何动画处理的
            setTimeout(function() {
                $(".back").hide().removeClass("back");
                $(".front").show().removeClass("front");
                $list.removeClass('forward backward animate');
            }, 10);

            $($itemArr.removeClass('current').get(curPage)).addClass('current');
            options.onchange(curPage, $itemArr[curPage], direction);  // 执行回调函数
            animShow();  //暂时还不打开！
        }
        
    });
    function animShow(){
        $animateDom.css({
            '-webkit-animation': 'none',
            'display': 'none'   // 解决部分 Android 机型 DOM 不自动重绘的 bug
            });

        
        $('.current [data-animation]').each(function(index, element){
            // 统一加进去类而已，以及要的时间，根据animation.css 来搞的

            var $element    = $(element),
                $animation  = $element.attr('data-animation'),
                $duration   = $element.attr('data-duration') || 500,
                $timfunc    = $element.attr('data-timing-function') || 'ease',
                $delay      = $element.attr('data-delay') ?  $element.attr('data-delay') : 0;

            if ($animation === 'followSlide') {
                
                if (options.direction === 'horizontal' && direction === 'forward') {
                    $animation = 'followSlideToLeft';
                }
                else if (options.direction === 'horizontal' && direction === 'backward') {
                    $animation = 'followSlideToRight';
                }
                else if (options.direction === 'vertical' && direction === 'forward') {
                    $animation = 'followSlideToTop';
                }
                else if (options.direction === 'vertical' && direction === 'backward') {
                    $animation = 'followSlideToBottom';
                }
                
            }
            $element.css({
                //'-webkit-animation': $animation +' '+ $duration + 'ms ' + $timfunc + ' '+ $delay + 'ms both',
                'display': 'block',
                // 为了兼容不支持贝塞尔曲线的动画，需要拆开写
                // 严格模式下不允许出现两个同名属性，所以不得已去掉 'use strict'
                '-webkit-animation-name': $animation,
                '-webkit-animation-duration': $duration + 'ms',
                '-webkit-animation-timing-function': 'ease',
                '-webkit-animation-timing-function': $timfunc,
                '-webkit-animation-delay': $delay + 'ms',
                '-webkit-animation-fill-mode': 'both'
            })
        });
    }

        // $(window).on("load", function() {


        //     if (options.indicator) {
        //         movePrevent = false;
                
        //         var temp = options.direction === 'horizontal' ? 'parallax-h-indicator' : 'parallax-v-indicator'; 

        //         $('.wrapper').append('<div class='+temp+'></div>');
        //         var lists = '<ul>';
        //         for (var i=1; i<=pageCount; i++) {
        //             if (i===1) {
        //                 lists += '<li class="current"></li>'
        //             } else {
        //                 lists += '<li></li>'
        //             }
        //         }
        //         lists += '</ul>';
        //         $('.'+temp).append(lists);
        //     }

        //     if (options.arrow) {
        //         $itemArr.append('<span class="parallax-arrow"></span>');
        //         $($itemArr[pageCount-1]).find('.parallax-arrow').remove();
        //     }
        // });
        
    $('.page *').on('webkitAnimationEnd', function() {
        event.stopPropagation();    // 事件代理无法阻止冒泡，所以要绑定取消
    })


 }(Zepto)
