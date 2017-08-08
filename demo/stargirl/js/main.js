var can;
var ctx;

var w;
var h;

var padLeft = 100;
var padTop = 100;

var girlWidth = 600;
var girlHeight = 300;

var deltaTime;
var lastTime;

var girlPic = new Image();
var starPic = new Image();

var stars = [];
var num = 30;

var alive = 0;

var switchy = false;//是否显示星星

function init() {
	can = document.getElementById("bubble");
	ctx = can.getContext("2d");
	w = can.width;
	h = can.height;
	girlPic.src = "src/girl.jpg";
	starPic.src = "src/star.png";
	//添加鼠标移动事件监听
	document.addEventListener('mousemove', mousemove, false);
	//创建星星并初始化状态
	for (var i = 0; i < num; i++) {
		stars[i] = new Star();
		stars[i].init();
	}
	//第一次动画的开始时间
	lastTime = Date.now();
	//动画入口函数
	gameLoop();
}

function gameLoop() {
	//重复画星星这个过程
	window.requestAnimFrame(gameLoop);
	var now = Date.now();
	//计算两次画星星的时间间隔
	deltaTime = now - lastTime;
	//更新上次画星星的时间
	lastTime = now;
	//填充画布
	fillCanvas();
	//画背景图片
	drawGirl();
	//画星星
	drawStars();
	//超出背景图片的星星重新初始化位置
	aliveUpdate();
}

function fillCanvas() {
	ctx.fillStyle = "#393550";
	ctx.fillRect(0, 0, w, h);
}

function drawGirl() {
	ctx.drawImage(girlPic, padLeft, padTop, girlWidth, girlHeight);
}

function mousemove(e) {
	if (e.offsetX || e.layerX) {
		//获取鼠标的位置坐标
		var px = e.offsetX == undefined ? e.layerX : e.offsetX;
		var py = e.offsetY == undefined ? e.layerY : e.offsetY;
		//鼠标位于背景图片范围内则显示星星，否则不显示星星
		if (px > padLeft && px < (padLeft + girlWidth) && py > padTop && py < (padTop + girlHeight)) {
			switchy = true;
		} else {
			switchy = false;
		}
	}
}