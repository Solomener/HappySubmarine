// 画布宽、高
var W = 1200;
var H = 600;
/*
 * 游戏状态
 * 0：游戏初始界面
 * 1：游戏开始
 * 2：游戏结束
 */
var gameState = 0;

var canvas;
var context;

var bomb_img_width = 40;
var bomb_img_height = 20;
var submarine_img_width = 135;
var submarine_img_height = 110;

// 按钮
var startImg = getImage("img/go_-sheet0.png");
var startX = (W-300)/2;
var startY = (H-160)*3/5;
var helpImg = getImage("img/question_mark_-sheet0.png");
var helpX = W-200;
var helpY = H*5/7;
var soundImg = getImage("img/button_sounds-sheet1.png");
var soundX = 100;
var soundY = H*5/7;
var titleImg = getImage("img/logo_-sheet0.png");
var logo = getImage("img/icon-256.png");
var bg = getImage("img/tiledbackground.png");

// 说明书是否显示
var isHelpText = false;
var helpTextImg = getImage("img/help-sheet0.png");

// 爆炸动画数组
var explosions = [];
// 定时器
var gameTimer = null;
var bgBottom = new BgBottom();
var submarine = new Submarine();
var bombs = [];
var score = 0;
var historyScore = localStorage.getItem("HappySubmarine_ouyang_score");
// 潜艇碰撞顶部或者底部可否再加载动画
var upEx = false;
var downEx = false;

var scoreImg = getImage("img/score.png");
// 获取image对象
function getImage(obj){
	var img = new Image();
	img.src = obj;
	return img;
}
// 碰撞检测
function hit(x, y, minx, miny, maxx, maxy){
	if(x >= minx && x <= maxx && y >= miny && y <= maxy){
		return true;
	}
	return false;
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
	// 潜艇生命数
	this.life = 3;
	// 帧数开始位置
	this.frameStart = 0;
	// 第几个帧图
	this.frameSet = this.frameStart;
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
		// 根据生命值自动更新显示的帧图
		if(this.life == 1){
			this.frameNum = 6;
			this.frameStart = 6;
		}else if(this.life > 1){
			this.frameNum = 6;
			this.frameStart = 0;
		}else{
			this.frameNum = 1;
			this.frameStart = 12;
		}
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
		context.drawImage(this.img, this.sx, this.sy, this.w, this.h, this.x, this.y, submarine_img_width, submarine_img_height);
	}
	this.move = function(){
		if(this.life > 0){
			if(this.isUp){
				this.vy = -7;
				this.y += this.vy;
			}else{
				this.y += this.vy;
				this.vy += this.avy;
			}
		}
		else{
			if(this.y+5 < H-(this.h-85)-40){
				this.y += this.vy;
				this.vy += this.avy;
			}else{
				this.y = H-(this.h-85)-35;
			}
		}
	}
}

// 鱼雷
function Bomb(){
	this.w = 105;
	this.h = 47;
	this.x = W;
	this.y = Math.random()*(H - this.h - 50);
	this.img = getImage("img/torpedo-sheet0.png");
	this.move = function(){
		this.x -= 5;
	}
	this.drawBomb = function(){
		context.translate(2*this.x + this.w, 0);
	    context.scale(-1, 1);
	    //画图
	    context.drawImage(this.img, 0, 0, this.w, this.h, this.x, this.y, bomb_img_width, bomb_img_height);
	    //翻转回来
	    context.setTransform(1, 0, 0, 1, 0, 0);
	}
}

// 爆炸特效
// 0 表示小；1 表示大
function Explosion(ex, ey, size){
	this.x = ex;
	this.y = ey;
	this.w = 210;
	this.h = 210;
	this.size = size;
	this.imgs = [];
	// 总帧数
	this.frameNum = 9;
	// 每张图的帧图数
	this.frames = [4,4,1];
	// 现在的帧图序号
	this.frameNow = 2;
	// 现在是第几张图
	this.i = 0;
	this.sx = 0;
	this.sy = 0;
	for(var i = 0; i < 3; i++){
		this.imgs[i] = getImage("img/explosion-sheet" + i + ".png");
	}
	this.updateFrame = function(){
		this.i = Math.floor(this.frameNow / 4);
		// 帧图所在的行列
		var xx = Math.floor(this.frameNow%4/2);
		var yy = this.frameNow%4%2;
		if(this.frameNow < this.frameNum){
			this.sx = yy*this.w;
			this.sy = xx*this.h;
			this.frameNow += 1;
		}
	}
	this.drawExplosion = function(){
		if(this.frameNow < this.frameNum){
			if(this.size){
				context.drawImage(this.imgs[this.i],this.sx,this.sy,this.w,this.h,this.x,this.y,150,150);
			}else{
				context.drawImage(this.imgs[this.i],this.sx,this.sy,this.w,this.h,this.x,this.y,80,80);
			}
		}
	}
}
// 数字转图片
function paintNum(x, y, num){
	var img = getImage("img/number.png");
	var w = 90;
	var h = 100;
	var sx = [];
	var str = String(num);
	for(var i = 0; i < str.length; i++){
		var item = Number(str[i]);
		if(item > 0){
			sx.push((item - 1)*w);
		}
		if(item == 0){
			sx.push(9*w);
		}
	}
	for(var i = 0; i < sx.length; i++){
		context.drawImage(img, sx[i], 0, w, h, x + i*(w-62), y, 45, 50);
	}
}
