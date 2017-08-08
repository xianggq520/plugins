//请求字符串
var baseUrlPost, baseUrl, baseVideoUrl, loginUrl;
//定义请求字符串模块
var env = angular.module('Env', []);
/*工具*/
var Util = angular.module('Util', []) 
.factory('util', function ($rootScope) {
    var util = 
    {
    	bannerImgStyle:function(url){
    		return 'background:url('+ baseVideoUrl + url + ') no-repeat center top\;background-size:cover\;' ;
    	},
        backgroundImg : function (url) 
        {
            return {
                'background' : 'url(' + baseVideoUrl + url + ') no-repeat', 'background-size' : 'cover', 
                'background-position' : 'center top' 
            };
        },
        TopHeadersImg : function (url) 
        {
            return {
                'background' : 'url(' + url + ') no-repeat', 'background-size' : 'cover', 
                'background-position' : 'center top' 
            };
        },
        userStr : function (str, length) 
        {
            if (str)
            {
                if (str.length > length) {
                    var string = str.substring(0, length);
                } else {
                    var string = str;
                }
                return string;
            }
        },
        subStr : function (str, length) 
        {
            var string = "";
            if (str.length > length) 
            {
                string = str.substring(0, length);
                var abcLen = 0;
                if (/[a-z\s\u00A0]/.test(string))
                {
                    abcLen = string.match(/[a-z\s\u00A0]/ig).length;
                    string = str.substring(0, length + Math.ceil(abcLen / 2) - 2) + "...";
                }
            }
            else {
                string = str;
            }
            return string;
        },
        alertx : function(str, config){
			if(config){
				$rootScope.$broadcast('showDialog',{text:str,config:config});
			}else{
				$rootScope.$broadcast('showDialog',{text:str,config:{}});
			}
		},
        exit : function (data) 
        {
            if (data == undefined) {
                setTimeout(function () {
                    window.location.href = loginUrl ;
                }, 1000);
            }
        }
         
    }
    return util;
})
.service('alertInfo', function($rootScope) {
	this.alertx=function(str, config){
		if(config){
			$rootScope.$broadcast('showDialog',{text:str,config:config});
		}else{
			$rootScope.$broadcast('showDialog',{text:str,config:{}});
		}
	}
})
.service('getURL', function() {
	this.courseImg = function (url) {
        return {'background':'url('+baseVideoUrl+url+')','background-size':'cover'};
    }
})
.service('headerImg', function() {
	this.Images = function (url) {
        return {'background':'url('+url+')','background-size':'cover'};
    }
})
.service('userWord', function() {
	this.userStr = function (str,length) {
		if(str){
			if(str.length>length)
			{
				var string=str.substring(0,length);
			}
			else
			{
				var string=str;
			}
			return string;
		}
    }
}).service('Quick',function(){
    this.exit = function (data) {
        if(data==undefined){
            setTimeout(function() { 
            	window.location.href = loginUrl ;
            },1000);
        }   
    }
}).factory('errorCode',['$http','$window','Quick','alertInfo', function($http,$window,Quick,alertInfo){
	return{
		code:function(res){
			if(!res) return;
			if(res.error_code == '401' || res.error_code == '40002' || res.error_code == '40003'){ //身份验证
				Quick.exit();
				return false;
			}else if(res.error_code == '-1' || res.status == 'N' || res.error_code == '40004'){ //error_msg
				alertInfo.alertx(res.error_msg);
				return false;
			}else if(res.status == 'Y'){ //接口调通
				
			}
		}
	}
}])

/*公用语言切换模块-start*/
var CommonTranslate = angular.module('CommonTranslate', ['pascalprecht.translate', 'ngSanitize'])
.config(['$translateProvider', '$httpProvider', '$sceDelegateProvider', function($translateProvider, $httpProvider, $sceDelegateProvider){
	var lang = getCookie('lang')||window.localStorage.lang||'cn';
	$translateProvider.useStaticFilesLoader({
	    prefix: '../../../static/webapp/i18n/',
	    suffix: '.json'
    });

    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://intest.eceibs.com/**']);


    $translateProvider.preferredLanguage(lang);
    $translateProvider.useSanitizeValueStrategy('sanitize');
   	// $translateProvider.fallbackLanguage(lang);


   	$httpProvider.interceptors.push(function() {
        return {
            'request': function(response) {
                // put a new random secret into our CSRF-TOKEN Cookie before each request
                //console.log(response);
                if (response.method == 'JSONP'){
                    response.url = response.url +'&terminal='+'pc'+'&lang='+lang;
                    // response.url = response.url +'&lang='+lang;
				}else if (response.method == 'POST'){
                    response.url = response.url +'&terminal='+'pc'+'&lang='+lang;
                     // response.url = response.url +'&lang='+lang;
                }
                //response.url = response.url + '#lang='+lang;
                //response.lang = lang;
                return response;
            }
        };
    });




}])
.factory('t', ['$translate', '$q', '$http', function($translate, $q, $http){
	var T = 
	{
		lang:"",
		langJsonData : {},
		init:function($scope){
			this.lang = getCookie('lang') || window.localStorage.lang || 'cn';
			$scope.isEnglish = this.lang =='en' ? true : false;
		},
		T:function(lang){
		 	$translate.use(lang);
		 	setCookie('lang', lang, 365);
	        window.localStorage.lang = lang;
	        window.location.reload();
		}/*,
		translate : function(key){
			console.log(key+"!!!");
			if(key){
				console.log($translate.instant(key)+"!~~~~");
				return $translate.instant(key);
			}
			return key;
		}*/,
		getJsonData: function(){
			var jsonDefer = $q.defer();
    		$http.get('../../../static/webapp/i18n/' + this.lang + '.json').success(function(data){
			 	jsonDefer.resolve(data); 
    		});
		    return jsonDefer.promise;
		}
	};
	return T;
}]);

/*验证token过期*/
var Token = angular.module('Token', ['Env', 'Util'])
.factory('token', ['$http', '$q', 'ENV', 'util', function($http, $q, ENV, util){
	var tokenDefer = $q.defer(), token = request('token') ;
	//请求字符串
	baseUrlPost = ENV.baseUrlPost,
	baseUrl = ENV.baseUrl, 
	baseVideoUrl = ENV.baseVideoUrl, 
	loginUrl = ENV.loginUrl;
	adminUrl = ENV.adminUrl;
	h5CourseDomain = ENV.h5CourseDomain;
	zhongouDomain = ENV.zhongouDomain;
	if(token){
	 	setCookie('token', token, 365);
 	}else{
		token= getCookie('token');
 	}
 	//console.log("token=="+ token);
 	if(token){
 		$http.jsonp(baseUrl + "apiName=" + "QUERY_USER_BY_TOKEN" + '&token=' + token + "&apiType=" + "global")
		.success(function(data, status, header, config) 
		{
			if(data.error_code && data.error_code == '401'){
				//token过期
				console.log("check token--timeout!");
				tokenDefer.resolve({ 'tokenStatus' : - 401 });
				window.location.href = loginUrl;
			}else{
				if(data.status == 'Y'){
					setCookie('token', token, 365);
					setCookie('userId', data.results.code, 365);
					setCookie('adminStatus', data.results.adminStatus, 365);
					//console.log(getCookie('adminStatus'))
					tokenDefer.resolve({'tokenStatus' : 200 }); 
				}else{
					//接口调用error
					util.alertx(data)
					tokenDefer.resolve({'tokenStatus' : - 200 });
				}
				//console.log("check token--response status--" + data.status);
			}
	  	})
		.error( function(data) {
			//接口调用错误
			tokenDefer.reject({ 'tokenStatus': - 500 });
	  	}); 
 	}
 	else{
 		window.location.href = loginUrl;
 	}
  	return tokenDefer.promise; 
}]);

/*指令模块*/
var Direct = angular.module('Direct', []) 
//监控窗口大小
.directive('windowResize', ['$window', function ($window)
{
    return function (scope, element) 
    {
        var w = angular.element($window);
        var b = angular.element("body");
        //console.log(b, b[0].scrollHeight);
        scope.getWindowHeightAndWidth = function () 
        {
            return {
                'h' : w.innerHeight(), 'w' : w.innerWidth() 
            };
        };
        scope.$watch(scope.getWindowHeightAndWidth, function (newValue, oldValue) 
        {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;
            //自定函数
            scope.setModalDialogStyle = function () 
            {
                return {
                    'margin-top' : (newValue.h <= 170 ? 0 : (newValue.h / 2 - 80) < 0 ? 0 : (newValue.h / 2 - 80)) + 'px', 
                    'margin-bottom' : '0px' 
                };
            };
            //...
            //消息列表高度自适应
            scope.setMessageContainerStyle = function () 
            {
        		return {
            		'min-height': (newValue.h - 30 - 86 - 18 - 25 -78) + 'px' 
        		};
            };
            
        }, true);
        w.bind('resize', function () 
        {
            scope.$apply();
        });
    }
}])
.directive('heightListener', ["$timeout", function ($timeout)
{
    return {
    	restrict : 'A',
    	scope : true,
    	link : function (scope, element) {
	        var el = angular.element(element) ;
	        scope.$watch(function(){
	        	return el.height(); 
	        }, function (newValue, oldValue) {
	        	$timeout(function(){
	        		scope.$apply(function(){
	        			scope.$emit("$$leftHeight", {
	            			"height": (newValue+ 420) + "px"
	            		})
        			});
	        	})
	        }, true);
	        
	        el.bind("click", function(){
        		scope.$apply();
	        })
	    }
    }
}])
.directive('userfoot',function(){
	return {
		restrict:'A',
		template:'<footer><p translate="public.footerRights"></p></footer>'
	}
})
.directive('commonDialog', ['$timeout', function($timeout){
	return {
		restrict: 'A',
		template: '<div style="z-index:99999;" class="modal fade" ng-class="{\'in\':dialog.showDialog,\'display-block\': dialog.showDialog,\'display-none\':!dialog.showDialog}" ng-show="dialog.showDialog">'
						+'<div style="width:425px!important;" class="modal-dialog" ng-style="setModalDialogStyle()">'
							+'<div class="modal-content">'
								+'<div class="modal-header dialogtitle">'
									+'<button type="button" class="close closex" data-dismiss="modal" aria-label="Close" ng-click="close()"><span class="queren_c" aria-hidden="true">&times;</span></button>'
									+'<div class="modal-title modal-titles" translate="tankuangtishi.tishititle"></div>'
								+'</div>'
								+'<div class="modal-body">'
									+'<p style="text-align:center;" ng-bind="dialog.dialogText"></p>'
								+'</div>'
								+'<div class="modal-footer m-footer">'
									+'<a class="btn btn-default" ng-show="dialog.showCancelBtn" ng-click="close()" translate="public.cancel"></a>'
									+'<a class="btn btn-primary" ng-show="dialog.showSureBtn" ng-click="close()" translate="public.sure"></a>'
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>'
					+'<div style="z-index:99998;" class="modal-backdrop fade" ng-if="dialog.showDialog" ng-class="{\'in\': dialog.showDialog,\'display-block\': dialog.showDialog,\'display-none\':!dialog.showDialog}"></div>',
		link: function (scope, element, attrs) {
			var dialogConfig,defaultConfig = {
				showSureBtn : true,
				showCancelBtn : true,
				closeDelayTime : 1000,
				dialogStyle : {},
				refresh:false,
				cancelDelayTime : false,
				autoClose:false
			};
			scope.$watch(attrs.commonDialog, function(dialog){
				if(dialog&&dialog.config)  {
					dialogConfig = configExtend(defaultConfig, dialog.config);
					initDialog(dialogConfig);
					if(dialog.show){
						scope.dialog.show(dialog.text);
					}
				}
			})
			scope.close = function(){
				scope.dialog.close();
			}
			function configExtend(config, sourceConfig){
				for (var property in sourceConfig) {
					config[property] = sourceConfig[property];
				}
				return config; 	
			}
			function initDialog(config){
				scope.dialog =
				{
					showDialog : false,
					showSureBtn : config.showSureBtn,
					showCancelBtn : config.showCancelBtn,
					dialogText : null,
					show : function (text)
					{
						if (text && text != "") {
							scope.dialog.dialogText = text ;
							scope.dialog.showDialog = true;
							if(config.autoClose){
								scope.dialog.close();
							}
						}
					},
					close : function ()
					{
						
						if (config.cancelDelayTime) {
							scope.dialog.showDialog = false;
							scope.dialog.dialogText = null;
						}
						else
						{
							$timeout(function ()
							{
								scope.dialog.showDialog = false;
								scope.dialog.dialogText = null;
							},  config.closeDelayTime);
						}
						if(config.refresh){
							window.location.reload();
						}
					}
				}
			}
		}
	};
}])
.directive('pagetoAdmin', ['$timeout', '$interval', '$http', 'ENV', function($timeout, $interval, $http, ENV){
	return {
		restrict: 'A',
		replace: true,
		template: 	'<div class="qrcode-container" ng-class="{\'diplay-show\': showQrcode,\'diplay-hide\': !showQrcode}" >'+
						'<div class="close" ng-show="showCloseBtn" ng-mouseenter="showClose()" ng-mouseleave="hideclose()" ng-click="hideQrcode()">x</div>'+
						'<div class="qrcode" ng-mouseenter="showClose()" ng-mouseleave="hideclose()" ng-style="qrcodeStyle"></div>'+
						'<div class="qrcodetips">'+
							'<span ng-show="isError" class="error">扫码功能罢工了</span><span ng-show="!isError">扫码进入管理端</span>'+
							'<span class="qrcode-time" ng-bind="\'(\'+time+\')\'"></span>'+
						'</div>'+
					'</div>',
		link: function (scope, element, attrs) {
			var timer,timer2,isprocessed,
			issuccessed = false;
			scope.isError = false;
			scope.time = 90;
			scope.showQrcode = false;
			scope.hideQrcode = function(){
				scope.showQrcode = false;
				if(angular.isDefined(timer)){
					$interval.cancel(timer);
					timer = undefined;
					scope.time = 90;
				}
			}
			scope.showClose = function(){
				scope.showCloseBtn = true;
			}
			scope.hideclose = function(){
				scope.showCloseBtn = false;
			}
			scope.$on("showQrcode",function(e, param){
				scope.showQrcode = param.show;
				scope.authCoe = param.authCode;
				if(!angular.isDefined(timer)){
					timer = $interval(function(){
						scope.time -= 1;
						if(scope.time <= 0){
							scope.time = 90;
							scope.showQrcode = false;
							$interval.cancel(timer);
							timer = undefined;
						}
					}, 1000);
				}
				if(!angular.isDefined(timer2)){
					timer2 = $interval(function(){
						if(!(isprocessed||scope.isError||!scope.showQrcode)){
							if(issuccessed){
								$interval.cancel(timer2);
								timer2 = undefined;
							}else {
								getQr_result();
							}
						}
					}, 2000);
				}
			});
			
			function getQr_result(){
				isprocessed = true;
				$http.jsonp(baseUrl + "apiName=" + "QR_RESULT" + "&userId=" + scope.userId + "&token=" + scope.token + "&apiType=" + "myInfo" + "&authCode=" + scope.authCoe) 
				.success( function (data, status, header, config) 
				{
				    isprocessed = false;
				    if(data.status=='Y'){
				    	if(data.results&&data.results.status=='Y'){
				    		issuccessed = true;
//				    		window.location.href = ENV.baseVideoUrl;
							window.location.href = ENV.adminUrl + scope.token + scope.authCoe;
				    	} 
				    }else{
				    	scope.isError = true;
				    }
				}) 
				.error( function (data) 
				{
					isprocessed = false;
					scope.isError = true;
				    //util.exit(data);
				});
			}
			scope.$on('qrcodestyle',function(e, param){
				scope.qrcodeStyle = param.qrcodeStyle;
			});
		}
	}
}])

.directive('loadingView', [function(){
	return {
		restrict: 'A',
		replace: true,
		template: 	'<div id="loading" ng-show="loadding" ng-controller="LoadingController">'+
					'<div class="loadall">'+
					'<div class="loadPic"></div>'+
					'<div class="loadWord" translate="tankuangtishi.loadingtip">{{loadding}}</div>'+
					'</div>'+
					'</div>',
		link: function (scope, element, attrs) {
			 
		}
	}
}])
.controller("LoadingController", function($scope){
	$scope.$on('$$loadding',function(e, loadding){
		console.log("loadding", loadding);
		$scope.loadding = loadding;
		setTimeout(function(){
			$scope.$apply();
		}, 3000)
	});
})
/*placeholder翻译*/
.directive('ngBindPlaceholder', ['$sce', '$parse', '$compile', function($sce, $parse, $compile){
   return {
    restrict: 'A',
    compile: function ngBindHtmlCompile(tElement, tAttrs) {
      var ngBindHtmlGetter = $parse(tAttrs.ngBindPlaceholder);
      var ngBindPlaceholderWatch = $parse(tAttrs.ngBindPlaceholder, function getStringValue(value) {
        return (value || '').toString();
      });
      $compile.$$addBindingClass(tElement);

      return function ngBindHtmlLink(scope, element, attr) {
        $compile.$$addBindingInfo(element, attr.ngBindPlaceholder);

        scope.$watch(ngBindPlaceholderWatch, function ngBindWatchAction() {
          // we re-evaluate the expr because we want a TrustedValueHolderType
          // for $sce, not a string
          element.html($sce.getTrustedHtml(ngBindHtmlGetter(scope)) || '');
          var plc = element.text();
          element.attr('placeholder',plc);
        });
      };
    }
  };
}])
//监听ng-repeat指令结束
.directive('ngRepeatMonitor',['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
}]);

/*公共控制器模块*/
var CommonControllers = angular.module('CommonControllers', ['Util'])
//自动创建弹框指令元素
.run(function(){
	/*$rootScope.windowLoaded = false;*/
	angular.element(document.getElementsByTagName('body'))
	.prepend('<div id="common-dialog" common-dialog="config"></div>')
	.prepend('<div pageto-admin></div>');
})
.controller('CommonController',function($rootScope, $scope, $http, $q, ENV, token, util, t, alertInfo){
	angular.element(window).bind('load', function() {  
       	$rootScope.windowLoaded = true;
    }); 
	//请求字符串
	baseUrlPost = ENV.baseUrlPost,
	baseUrl = ENV.baseUrl, 
	baseVideoUrl = ENV.baseVideoUrl, 
	loginUrl = ENV.loginUrl;
	h5CourseDomain = ENV.h5CourseDomain;
	zhongouDomain = ENV.zhongouDomain;
	
	//语言切换
	$scope.T = t;
	t.init($scope);
	t.getJsonData().then(function(data){
		$scope.langJsonData = data;
		//字体控制
		$scope.isEnglish = $scope.T.lang =='en' ? true : false;
	});
	 
	//提示
	$scope.alertInfo = alertInfo;
	//监听弹框
	$scope.$on('showDialog',function(e,dialog){
		dialog.show = true;
		$scope.config = dialog;
	});
	/*$scope.$on('hideDialog',function(e){
		$scope.$broadcast("hideDialog",true);
	});*/
	$scope.$on('$loadding',function(e, loadding){
		e.stopPropagation();
		$scope.loadding = loadding;
		$scope.$broadcast("$$loadding", loadding);
	});
	//更新消息icon提示状态
	$scope.$on('NoNewMsg',function(e, mark){
		e.stopPropagation();
		
		
		$scope.$broadcast("ChangeMsgStatus", mark);
	});
	

	//消息页面左侧高度自适应
	$scope.$on("$$leftHeight",function(e, style){
		e.stopPropagation();
		$scope.leftContainerstyle = style;
	});
	
	/*工具*/
 	$scope.util = util; 
	/*工具*/
	/*校验token是否超时*/
	$scope.def = $q.defer();  
	
	token.then(function(data){
		$rootScope.token = getCookie("token");
		$rootScope.userId = getCookie("userId");
		$scope.adminStatus = getCookie("adminStatus");
		$scope.def.resolve(data);//- 401 200 - 200
	}).then(function(data){
		$scope.def.resolve(data);//- 500
	});
	
	$scope.def.promise.then(function(data){//- 500 - 401 - 200 200 
 		if(data && data.tokenStatus && data.tokenStatus > 0){
	 		//console.log("tokenStatus " + data.tokenStatus);
 			$scope.getUserInfo();
 			queryQrcode();
	 	}
	});
	//获取用户资料
	$scope.getUserInfo = function(){
		$http.jsonp(baseUrl + "apiName=" + "ELE_USER_INFO" + "&userId=" + $scope.userId + "&token=" + $scope.token + "&apiType=" + "myInfo") 
		.success( function (data, status, header, config) 
		{
		    $scope.userInfo = data.results;
		}) 
		.error( function (data) 
		{
		    util.exit(data);
		});
	}
	/*进入管理端按钮*/
	/*$scope.adminfunc = function (){
		if($rootScope.windowLoaded&&qrPath&&authCode) {
			$rootScope.$broadcast('showQrcode', { show : true, authCode: authCode });
		}
		
	}*/
	$scope.adminfunc = function (){
		// window.location.href = ENV.adminUrl + "services/backend/sys/loginpage?token="+ $scope.token + "&userId=" + $scope.userId ; 
		 window.location.href = ENV.adminUrl +  $scope.token + "&userId=" + $scope.userId ; 
	}
	var qrPath,  authCode;
	/*查询二维码*/
	var queryQrcode = function (){
		$http.jsonp(baseUrl + "apiName=" + "QR_LOGIN" + "&token=" + $scope.token + "&userId=" + $scope.userId + "&apiType=" + "myInfo")
		.success(function(data, status, header, config) 
		{
			if(data.status == 'Y'){
				qrPath = data.results.qrPath;
				authCode = data.results.authCode;
				var qrcodeStyle = {
				 	"background": "url("+ baseVideoUrl + qrPath +") no-repeat  center top",
                	"background-size":"cover"
        		};
        		if(qrPath){
        			$rootScope.$broadcast('qrcodestyle', { qrcodeStyle: qrcodeStyle });
        		}
			}
	  	})
		.error( function(data) {
			$scope.util.exit(data);
		});
		
	}
	//弹框内容中英切换
	/*$scope.parseLangJsonDataByKey = function(key){
	 	return jsonLoop(key,$scope.langJsonData);
	}*/
	
	/*function jsonLoop(key,jsonData){
		var value = "", currKey, needLoop; 
		if(key.indexOf('.')!=-1){
			currKey = key.substring(0, key.indexOf('.'));
			needLoop = true;
		}else{
			currKey = key;
		}
	 	console.log(currKey+"currKey")
	 	for(var i in jsonData){
	 		if(i==currKey){
	 			if(needLoop){
	 				value = jsonLoop(key.substring(key.indexOf('.')+1), jsonData[i]);
	 			}else{
	 				value = jsonData[i];
	 			}
	 			break;
	 		}
	 	}
	 	return value;
 	}*/
})
.controller('commonHeader',function($scope,$http,$rootScope,$window,alertInfo,getURL,userWord,Quick,headerImg){
	//$rootScope.token=localStorage.getItem("token");
	//$rootScope.userId=localStorage.getItem("userId");
	$scope.userWord=userWord.userStr;
	$rootScope.href=function (index) {
		//localStorage.setItem("navIndex",index);
		if(index==1)$scope.url='../index/index.html';
		if(index==2)$scope.url='../course/course_list.html';
		if(index==3)$scope.url='../task_center/task_center.html';
		if(index==4)$scope.url='../e_shop/e_shoplist.html';
		if(index==5)$scope.url='../user/user_index.html';

		if(index==6)$scope.url=loginUrl;
		if(index==7)$scope.url='../course/offcourse_list.html';
		
        $window.location.href=$scope.url;
	}
	$scope.searchKey= request('searchKey');
	$scope.searchAll=function(n,ev){
		if(n==1)
		{
			if (ev.keyCode !== 13) return;
		}
		else if(n==2){
			if($scope.searchKey)
			{
				//localStorage.setItem("searchKey",$scope.searchKey);
				$window.location.href='../course/course_search.html?searchKey='+$scope.searchKey;
			}
			else
			{
				alertInfo.alertx($scope.langJsonData.tankuangtishi.guanjianzitishi,{showCancelBtn:false});
				/*alertInfo.alertx('亲,请在这里输入关键字')*/
				//alert('请输入关键字');
				return false;
			}
		}
	}
	

	$rootScope.token=getCookie('token');
	$rootScope.userId=getCookie('userId');
	$rootScope.adminStatus = getCookie('adminStatus');

	$http.jsonp(baseUrl+"apiName="+"ELE_USER_INFO"+"&userId="+$rootScope.userId+'&token='+$rootScope.token+"&apiType="+"myInfo")
    .success(
    	function(data, status, header, config){
    		$scope.items=data.results;
			$scope.userImg=headerImg.Images;
			$rootScope.eShopNum=data.results.eCoin;
    	}
    )  
    .error(
		function(data){
			Quick.exit(data);
		}
	);
	$http.jsonp(baseUrl+"apiName="+"NEW_MESSAGE"+"&userId="+$rootScope.userId+'&token='+$rootScope.token+"&apiType="+"message")
	.success(
		function(data, status, header, config){
			$rootScope.newstatu=data.results.newMessage;
			if($rootScope.newstatu=='Y'){
				$rootScope.newstatu=true;	
			}else{
				$rootScope.newstatu=false;	
			}
		}
	)  
	.error(
		function(data){
			Quick.exit(data);
		}
	);	
	/*$scope.adminfunc = function (){
		$scope.href = adminUrl + $rootScope.token;
		$window.location.href=$scope.href;
		
		
	}*/
})
/*顶部导航栏*/
.controller('TopNavController',function($scope, $http, $window){
	$scope.def.promise.then(function(data){//- 500 - 401 - 200 200 
 		if(data && data.tokenStatus && data.tokenStatus > 0){
	 		//console.log("tokenStatus " + data.tokenStatus);
		 	$http.jsonp(baseUrl + "apiName=" + "NEW_MESSAGE" + "&userId=" + $scope.userId + "&token=" + $scope.token + "&apiType=" + "message") 
			.success( function (data, status, header, config)
			{
			    if (data.results.newMessage && data.results.newMessage == 'Y') {
			        $scope.newstatu = true;
			    }
			    else {
			        $scope.newstatu = false;
			    }
			}) 
			.error( function (data)
			{
			    $scope.util.exit(data);
			}) 
			
			$http.jsonp(baseUrl + "apiName=" + "QUERY_USER_BY_TOKEN" + '&token=' + $scope.token + "&apiType=" + "global")
				.success(function(data, status, header, config) 
				{
					if(data.status == 'Y'){
						$scope.adminStatus = data.results.adminStatus;
					}
			  	})
				.error( function(data) {
					$scope.util.exit(data);
			  }); 
			
	 	}
	});
 
	$scope.searchAll = function (n, ev)
	{
	    if (n == 1) {
	        if (ev.keyCode !== 13) {
	            return;
	        }
	    }
	    if ($scope.searchKey)
	    {
	        $window.location.href = '../course/course_search.html?searchKey=' + $scope.searchKey;
	    }
	    else {
	    	$scope.alertInfo.alertx($scope.langJsonData.tankuangtishi.guanjianzitishi, {showCancelBtn:false});
	        /*$scope.alertInfo.alertx('亲,请在这里输入关键字');*/
	        return false;
	    }
	}
	
	$scope.exit = function(){
		window.location.href = loginUrl;	
	}
	
	$scope.$on('ChangeMsgStatus',function(e, mark){
		$scope.newstatu = !mark;
	});
});

var Common = angular.module('Common', ['Util', 'Token', 'CommonTranslate', 'CommonControllers', 'Direct']);