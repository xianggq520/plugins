/*
*
* 兼容性：ie11，及支持H5 API的浏览器
*
* */

(function () {
	/**
	 * [Menu description]
	 * 导航菜单对象构造函数
	 * @type {[type]}
	 */
	var Menu = function(){
		this.menuElement = document.querySelector('#sidebar > ul');
		this.state = 'allClosed';
		this.menuList = document.querySelectorAll('#sidebar ul > li');
		//阻止menu区的点击事件冒泡，避免sidebar捕获menu区的点击事件，从而确保sidebar只捕获关闭按钮的click事件
		this.menuElement.addEventListener('click', function(e) {
			//阻止事件向上传递
			e.stopPropagation();
		});
		//记录当前出于打开状态的内容区域元素
		this.currentOpenedMenuContentElement = null;
		//缓存this指向的menu实例对象
		var self = this;
		//为每个li元素添加click事件处理函数
		for (var i = 0; i < this.menuList.length; i++) {
			this.menuList[i].addEventListener('click', function(e) {
				//获取每一个li对应的内容展示区域元素，e.currentTarget为事件绑定的对象
				var menuContenElement = document.getElementById(e.currentTarget.id+'-content');
				if(self.currentOpenedMenuContentElement===menuContenElement){
					//关闭之前打开的内容区域
					self.currentOpenedMenuContentElement.style.top = '0';
					self.currentOpenedMenuContentElement.style.left = '35px';//sidebar宽度
					self.currentOpenedMenuContentElement.className = 'nav-content';
					self.currentOpenedMenuContentElement.classList.add('fadeOut-left');//左侧淡出
					self.currentOpenedMenuContentElement = null;
					self.state = 'allClosed';
				}else{
					if (self.state==='allClosed') {
						//没有打开的内容区域
						//打开对应的内容区域
						menuContenElement.style.top = '0';
						menuContenElement.style.left = '-85px';
						menuContenElement.className = 'nav-content';
						menuContenElement.classList.add('fadeIn-left');
						//此处需要记录当前打开的内容区域
						self.currentOpenedMenuContentElement = menuContenElement;
						self.state = 'hasOpened';
					}else{
						//关闭之前打开的内容区域
						self.currentOpenedMenuContentElement.style.top = '0';
						self.currentOpenedMenuContentElement.style.left = '35px';//sidebar宽度
						self.currentOpenedMenuContentElement.className = 'nav-content';
						self.currentOpenedMenuContentElement.classList.add('fadeOut-left');//左侧淡出
						//打开当前点击的li对应的内容区域
						menuContenElement.style.top = '250px';
						menuContenElement.style.left = '35px';//tranlateX-sidebar宽度
						menuContenElement.className = 'nav-content';
						menuContenElement.classList.add('fadeIn-bottom');
						self.currentOpenedMenuContentElement = menuContenElement;
						self.state = 'hasOpened';
					}
				}
			});
		}
		//为每一个"<"关闭按钮添加事件处理函数
		this.menuCloseBarList = document.querySelectorAll('.nav-content > div.content-closebar');
		for (var i = 0; i < this.menuCloseBarList.length; i++) {
			this.menuCloseBarList[i].addEventListener('click', function(e) {
				//获取当前content
				var currentMenuContent = e.currentTarget.parentNode;
				//关闭内容区
				currentMenuContent.style.top = '0';
				currentMenuContent.style.left = '35px';//sidebar宽度
				currentMenuContent.className = 'nav-content';
				currentMenuContent.classList.add('fadeOut-left');//左侧淡出
				self.currentOpenedMenuContentElement = null;
				self.state = 'allClosed';
			});
		}
	}

	var menu = new Menu();
               
	/**
	 * Sidebar构造函数
	 * @param {[type]} eId sidebar元素的id
	 * @param {[type]} closeBarId 关闭sidebar的按钮元素的id
	 */
	var Sidebar = function(eId,closeBarId){
		this.state = 'opened';//状态
		this.sideBarElement = document.getElementById(eId||'sidebar');
		this.closeBtnElement = document.getElementById(closeBarId||'closebar');
		var self = this;//缓存sedebar对象本身
		//添加事件捕获及处理函数
		console.log(this.sideBarElement.attachEvent);
		this.sideBarElement.addEventListener('click', function(ev) {
		 	/**
		 	 * 要点：
		 	 * 1.给sideBar对象添加事件捕获，捕获所有的点击事件
		 	 * 2.通过event对象的target对象来判断点击的目标元素是功能菜单项/关闭按钮
		 	 * 3.如果点击的是功能菜单项，利用阻止事件冒泡来避免sidebar元素捕获click事件，从而只捕获来自点击关闭按钮的click事件
		 	 * 4.捕获click事件后，事件函数是由系统调用的！！！ 上下文this并不指向sidebar对象  指向window对象？
		 	 */
			if (ev.target !== self.sideBarElement) {
				//不是sidebar元素，则可能点击的是功能菜单项/关闭按钮
				//此处不能使用this上下文来调用sidebar实例对象的方法
				//this.triggerState();
				//可以使用闭包原理来调用self引用的sidebar对象，
				self.triggerState();
			}
		});
	}
	Sidebar.prototype.close = function() {
		if(menu&&menu.currentOpenedMenuContentElement!==null){
			//关闭内容区
			menu.currentOpenedMenuContentElement.style.top = '0';
			menu.currentOpenedMenuContentElement.style.left = '35px';//sidebar宽度
			menu.currentOpenedMenuContentElement.className = 'nav-content';
			menu.currentOpenedMenuContentElement.classList.add('fadeOut-left');//左侧淡出
			menu.currentOpenedMenuContentElement = null;
			menu.state = 'allClosed';
		}
		this.sideBarElement.style.left = '0';
		this.closeBtnElement.style.left = '0';
	 	this.sideBarElement.classList.add('sidebar-collapsed');
		this.closeBtnElement.classList.add('closebar-moveRight');
		this.state = 'closed';
	};
	Sidebar.prototype.open = function() {
		this.sideBarElement.style.left = '-120px';
		this.closeBtnElement.style.left = '160px';
		this.sideBarElement.classList.remove('sidebar-collapsed');
		this.sideBarElement.classList.add('sidebar-unfolded');
		this.closeBtnElement.classList.remove('closebar-moveRight');
		this.closeBtnElement.classList.add('closebar-moveLeft');
	 	this.state = 'opened';
	};
	//折叠or展开sidebar
	Sidebar.prototype.triggerState = function() {
		 if (this.state === 'opened') {
		 	this.close();
		 } else {
		 	this.open();
		 }
	};
	//实例化sidebar对象
	var sidebar = new Sidebar();

})();