var Star = function() {
	//星星的坐标
	this.x;
	this.y;
	//星星的位移量
	this.xSpd;
	this.ySpd;
	//动画帧[0,7)
	this.picNo;
	//两次动画之间的间隔
	this.timer;

	this.beta;
}

Star.prototype.init = function() {
	this.x = Math.random() * girlWidth + padLeft;
	this.y = Math.random() * girlHeight + padTop;
	//为每一个星星定义一个初始的位移量
	this.ySpd = Math.random() * 0.2 - 0.1;
	this.xSpd = Math.random() * 0.2 - 0.1;
	//初始化星星的当前动画帧 [0,7)
	this.picNo = Math.floor(Math.random() * 7);
	this.timer = 0;
	//随机数，计算sin值 [-1,1]
	this.beta = Math.random() * Math.PI * 0.5;
}
//更新每一个star实例的属性，位置
Star.prototype.update = function() {
	//在星星初始的位移量上叠加一个小的随机位移量，使星星的位移更加随机
	this.ySpd += Math.random() * 0.02 - 0.01;
	this.xSpd += Math.random() * 0.02 - 0.01;
	//更新星星的坐标
	this.x += this.xSpd;
	this.y += this.ySpd;
	//星星超出背景图片范围，初始化其位置
	if(this.x > (padLeft + girlWidth) || this.x < (padLeft - 10)
		||this.y > (padTop + girlHeight) || this.y < (padTop - 10)){
		this.init();
	}
	//累计多次调用gameLoop动画函数的时间间隔
	this.timer += deltaTime;
	//当累计时间间隔超过30ms，更新星星的状态（动画的下一帧及计时归零）
	if (this.timer > 30) {
		this.picNo += 1;
		this.picNo %= 7;
		this.timer = 0;
	}
}
//画星星
Star.prototype.draw = function() {
	//数据变化平滑处理
	this.beta += deltaTime * 0.005;
	//save和restore函数成对出现
	ctx.save();
	//设置星星的透明度globalAlpha
	ctx.globalAlpha = Math.sin(this.beta) * alive;//[-1,1]
	//画星星
	ctx.drawImage(starPic, this.picNo * 7, 0, 7, 7, this.x, this.y, 7, 7);
	ctx.restore();
}

function drawStars() {
	for (var i = 0; i < num; i++) {
		stars[i].update();
		stars[i].draw();
	}
}
//控制星星的透明度
function aliveUpdate() {
	if (switchy) {//鼠标移入背景区域，switchy = true,平滑提升不透明度
		alive += 0.03;
		if (alive > 0.7) {
			alive = 0.7;
		}
	} else {//鼠标移出背景区域，平滑减少不透明度，最终不显示星星
		alive -= 0.03;
		if (alive < 0) {
			alive = 0;
		}
	}
}