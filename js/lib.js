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

// 音乐播放器
var bg_music;
var click_music;
var explosion_music;
var button_click_music;
var getScore_music;
var game_over_music;
var new_score_music;
var get_life_music;

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
var soundImg = getImage("img/button_sounds-sheet0.png");
var soundX = 100;
var soundY = H*5/7;
var titleImg = getImage("img/logo_-sheet0.png");
var logo = getImage("img/icon-256.png");
var bg = getImage("img/tiledbackground.png");
var gameOverImg = getImage("img/over_-sheet0.png");
var retryImg = getImage("img/again_button-sheet0.png");
var retryX = (W-233)*11/12;
var retryY = (H-232)/2;

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
var heart = new Heart();
var trap = new Trap();
var particles = [];
var score = 0;
var historyScore = localStorage.getItem("HappySubmarine_ouyang_score");
// 潜艇碰撞顶部或者底部是否已经加载过动画
var upEx = false;
var downEx = false;
// 结束音乐是否已经播放
var isplayed = false;

// 音效是否打开
var soundOn = false;

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
			this.life = -10;
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
	this.frameNow = 0;
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

// 生成爱心
function Heart(){
	this.w = 41;
	this.h = 38;
	this.x = Math.random()*(W-200)+W+200;
	this.y = Math.random()*(H-this.h-100);
	this.vx = 2;
	this.visiable = true;
	// 相当于计时，多长时间后心重新显示
	this.time = 0;
	
	this.img = getImage("img/heart-sheet0.png");
	this.drawHeart = function(){
		if(this.visiable){
			context.drawImage(this.img, this.x, this.y, this.w, this.h);
		}
	}
	this.move = function(){
		// 计时
		if(this.time < 1220){
			this.time++;
		}else{
			this.time = 0;
			// 初始化位置
			this.x = Math.random()*(W-200)+W+200;
			this.y = Math.random()*(H-this.h-100);
			this.visiable = true;
		}
		// 移动
		if(this.visiable){
			this.x -= this.vx;
		}
	}
}
// 生成陷阱
function Trap(){
	this.img = getImage("img/minechain-sheet0.png");
	this.w = 62.4;
	this.h = 76.7*1.2;
	this.x = Math.random()*(W-100) + W;
	this.y = H - 120;
	this.vx = 2;
	this.time = 0;
	this.move = function(){
		if(this.time < 1182){
			this.time++;
		}else{
			this.time = 0;
			this.x = Math.random()*(W-100) + W;
		}
		this.x -= this.vx;
	}
	this.drawTrap = function(){
		context.drawImage(this.img, this.x, this.y, this.w, this.h);
	}
}

var particlesImg = [];
var sizes = [35,10];
var vy = [4, 2];
particlesImg.push(getImage("img/particles.png"));
particlesImg.push(getImage("img/particles2.png"));

// 生成背景泡泡
function Particle(){
	this.x = Math.random()*W+20;
	this.y = Math.random()*H;
	var i = Math.floor(Math.random()*2);
	this.vy = vy[i];
	this.img = particlesImg[i];
	this.size = sizes[i];
	this.move = function(){
		this.y -= this.vy;
		this.x -= 2;
	}
	this.drawParticle = function(){
		context.globalAlpha = 0.2;
		context.drawImage(this.img,this.x, this.y, this.size, this.size);
		context.globalAlpha = 1;
	}
}
