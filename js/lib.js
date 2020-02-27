// 画布宽、高
var W = 1200;
var H = 600;
var canvas;
var context;
// 定时器
var gameTimer = null;
var bgBottom = new BgBottom();
var submarine = new Submarine();
var bombs = [];
// 获取image对象
function getImage(obj){
	var img = new Image();
	img.src = obj;
	return img;
}

// 海底背景
function BgBottom(){
	this.h = 95.5;
	this.w = 512;
	this.y = H - this.h;
	// 一次画的背景个数
	var length = Math.ceil(W / this.w) + 1;
	this.xs = [];
	this.speed = 2;
	for(var i = 0; i < length; i++){
		this.xs[i] = this.w * i;
	}
	this.img = getImage("img/bgbottom-sheet0.png");
	this.updateFrame = function(){
		for(var i = 0; i < this.xs.length; i++){
			this.xs[i] -= this.speed;
		}
	}
	this.drawBg = function(){
		for(var i = 0; i < length; i++){
			if(this.xs[i] > -this.w){
				context.drawImage(this.img, this.xs[i], this.y, this.w, this.h);
			} else{
				this.xs[i] = (length - 1) * this.w;
			}
		}
	}
}

// 玩家
function Submarine(){
	this.x = W / 8;
	this.y = H / 4;
	this.w = 232;
	this.h = 188;
	this.img = getImage("img/submarine-sheet0.png");
	// 帧图截取位置
	this.sx = 0;
	this.sy = 0;
	// 潜艇是否向上游
	this.isUp = false;
	// 潜艇帧数
	this.frameNum = 6;
	// 帧数开始位置
	this.frameStart = 0;
	// 第几个帧图
	this.frameSet = 0;
	// 潜艇生命数
	this.life = 3;
	this.heart = getImage("img/heart-sheet0.png");
	this.heartH = 38;
	this.heartW = 41;
	// 潜艇下落速度
	this.vy = 1;
	// 潜艇下落加速度
	this.avy = 0.7;
	this.updateFrame = function(){
		// 画出潜艇生命数
		for(var i = 0; i < this.life; i++){
			context.drawImage(this.heart, 30 + (this.heartW + 5) * i, 30, this.heartW, this.heartH);
		}
		
		// 循环播放帧图
		// 得到帧图所在的行列值
		var x = Math.floor(this.frameSet / 4);
		var y = this.frameSet % 4;
		if(this.frameSet < this.frameStart + this.frameNum){
			this.sx = y * this.w;
			this.sy = x * this.h;
			this.frameSet++;
		}else{
			this.frameSet = this.frameStart;
		}
	}
	this.drawSubmarine = function(){
		context.drawImage(this.img, this.sx, this.sy, this.w, this.h, this.x, this.y, 135, 110);
	}
	this.move = function(){
		if(this.isUp){
			this.vy = -7;
			this.y += this.vy;
		}else{
			this.y += this.vy;
			this.vy += this.avy;
		}
	}
}

// 鱼雷
function Bomb(){
	this.w = 105;
	this.h = 47;
	this.x = W;
	this.y = Math.random()*(H - this.h - 135);
	this.img = getImage("img/torpedo-sheet0.png");
	this.move = function(){
		this.x -= 5;
	}
	this.drawBomb = function(){
		//以右上点为中心 向右翻转画布
		context.translate(2*this.x + this.w, 0);
	    context.scale(-1, 1);
	    //画图
	    context.drawImage(this.img, 0, 0, this.w, this.h, this.x, this.y, 55, 30);
	    //翻转回来
	    context.setTransform(1, 0, 0, 1, 0, 0);
	}
}
