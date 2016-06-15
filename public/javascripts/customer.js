var customer = {
	init:function(){
		this.initLoading();
		this.bindCusEvent();
	},
	initLoading:function(){
		var that = this;
		var loadImgList = [
			'/images/img1.jpg',
			'/images/img2.jpg',
			'/images/img3.jpg',
			'/images/img4.jpg',
			'/images/img5.png',
			'/images/img6.png'
		];
		var index = 0;
		$.each(loadImgList,function(index,el){
			var img = new Image();
			img.onload = imgLoad;
			img.onerror = imgLoad;
			img.src = el;
			img.imageSrcKey = el;
			
		});
		function imgLoad(){
			index++;
			if( index === loadImgList.length){
				setTimeout(function() {
					$("#c_loading").hide();
					//去掉loading之后选择性别的那张动画就要开始了，通过加类吧。
				}, 500);
			}
		}
	},
	bindCusEvent:function(){
		$('body').on('tap','.c_boy',function(){
				$('.c_select_sex_wrap').hide();
				$('.girl_pages').remove();
				$('.boy_pages').slide({
					direction: 'vertical', 	// horizontal (水平翻页)
					swipeAnim: 'default', 	// cover (切换效果)
					drag:      true,		// 是否允许拖拽 (若 false 则只有在 touchend 之后才会翻页)
					loading:   false,		// 有无加载页
					indicator: true,		// 有无指示点
					arrow:     true,		// 有无指示箭头
					
					 // * 翻页后立即执行
					 // * {int} 		index: 第几页
					 // * {DOMElement} element: 当前页节点
					 // * {String}		directation: forward(前翻)、backward(后翻)、stay(保持原页)
					 
					onchange: function(index, element, direction) {
						// code here...
						// console.log(index, element, direction);
					},
					/*
					 * 横竖屏检测
					 * {String}		orientation: landscape、protrait
					 */
					orientationchange: function(orientation) {
						// console.log(orientation);
					}
				});
		}).on('tap','.c_gril',function(){
			$('.c_select_sex_wrap').hide();
			$('.boy_pages').remove();
				$('.girl_pages').slide({
					direction: 'vertical', 	// horizontal (水平翻页)
					swipeAnim: 'default', 	// cover (切换效果)
					drag:      true,		// 是否允许拖拽 (若 false 则只有在 touchend 之后才会翻页)
					loading:   false,		// 有无加载页
					indicator: true,		// 有无指示点
					arrow:     true,		// 有无指示箭头
					
					 // * 翻页后立即执行
					 // * {int} 		index: 第几页
					 // * {DOMElement} element: 当前页节点
					 // * {String}		directation: forward(前翻)、backward(后翻)、stay(保持原页)
					 
					onchange: function(index, element, direction) {
						// code here...
						// console.log(index, element, direction);
					},
					/*
					 * 横竖屏检测
					 * {String}		orientation: landscape、protrait
					 */
					orientationchange: function(orientation) {
						// console.log(orientation);
					}
				});
		});
		window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {
		//   	if (window.orientation === 180 || window.orientation === 0) {  
			// 	// options.orientationchange('portrait');
			// 	alert(111);
			// }  
			// if (window.orientation === 90 || window.orientation === -90 ){  
			// 	// options.orientationchange('landscape') 
			// 	alert(222);
			// } 	
			if("-90" == window.orientation || "90" == window.orientation ){
		    	$(".landscape-wrap").removeClass("hide"); 
		    }else{
				$(".landscape-wrap").addClass("hide");
		    }
		}, false);
	}
}

customer.init();