// 获取画布、画笔
window.onload = function(){
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	bg_music = document.getElementById("bg_music");
	button_click_music = document.getElementById("button_click_music");
	click_music = document.getElementById("click_music");
	explosion_music = document.getElementById("explosion_music");
	getScore_music = document.getElementById("getScore_music");
	new_score_music = document.getElementById("new_score_music");
	game_over_music = document.getElementById("game_over_music");
	get_life_music = document.getElementById("get_life_music");
	// 检查 localStorage 是否存在
	if(!historyScore && typeof(historyScore)!="undefine" && historyScore!=0){
		window.localStorage.setItem("HappySubmarine_ouyang_score", 0);
		historyScore = 0;
	}

	setInterval(createBomb, 2000);
	setInterval(gameLogic, 50);
}

window.onmousedown = function(){
	if(gameState == 1){
		submarine.isUp = true;
		if(soundOn){
			var random = Math.floor(Math.random()*3);
			switch(random){
				case 0:
					click_music.src = "sounds/bubbles1.ogg";
					break;
				case 1:
					click_music.src = "sounds/bubbles2.ogg";
					break;
				case 2:
					click_music.src = "sounds/bubbles3.ogg";
					break;
			}
			click_music.play();
		}
	}
}
window.onmouseup = function(){
	if(gameState == 1){
		submarine.isUp = false;
	}
}

// 生成炸弹
function createBomb(){
	if(gameState == 1){
		var bomb = new Bomb();
		bombs.push(bomb);
	}
	for(var i = 0; i < 15; i++){
		particles.push(new Particle());
	}
}

function gameLogic(){
	context.clearRect(0, 0, W, H);
	for(var i = 0; i < particles.length; i++){
		particles[i].move();
		particles[i].drawParticle();
		if(particles[i].y < -100){
			particles.splice(i,1);
		}
	}
	
	if(gameState == 1){
		// 炸弹
		for(var i = 0; i < bombs.length; i++){
			bombs[i].move();
			bombs[i].drawBomb();
		}
		// 潜艇
		submarine.move();
		submarine.drawSubmarine();
		submarine.updateFrame();
		// 陷阱
		trap.move();
		trap.drawTrap();
		// 陷阱与潜艇碰撞检测
		trapAndSubmarine();
		// 海底
		bgBottom.updateFrame();
		bgBottom.drawBg();
		// 生命
		heart.move();
		heart.drawHeart();
		// 爱心与潜艇碰撞检测
		heartAndSubmarine();
				
		// 鱼雷与潜艇的碰撞检测
		bombAndSubmarine();

		displayExplosion();
		// 绘制分数
		context.drawImage(scoreImg, W*4/6, 30, 160, 40);
		getScore();
		submarineMove();
		// 潜艇死亡切换游戏状态
		if(submarine.life <= 0){
			// 清空炸弹
			bombs = [];
			gameState = 2;
		}
	}else if(gameState == 0){
		// 初始化
		submarine = null;
		submarine = new Submarine();
		score = 0;
		bombs = [];
		explosions = [];
		heart = null;
		heart = new Heart();
		trap = null;
		trap = new Trap();
		upEx = false;
		downEx = false;
		isplayed = false;
		
		context.drawImage(titleImg, (W-450) / 2, (H-150) / 5, 450, 200);
		context.drawImage(startImg, startX,startY);
		context.drawImage(bg, 0, H-180);
		context.drawImage(bg, 1024, H-180);
		context.drawImage(logo, 100, H / 2-100, 128,128);
		context.drawImage(soundImg, soundX, soundY, 100, 100);
		context.drawImage(helpImg, helpX,helpY, 100, 100);
		if(isHelpText){
			context.beginPath();
			context.rect(0,0,W,H);
			context.fillStyle = "rgba(0,0,0,0.7)";
			context.fill();
			context.closePath();
			context.drawImage(helpTextImg, (W-986/1.3)/2,(H-708/1.3)/2, 986/1.3, 708/1.3);
//			context.beginPath();
//			context.rect(470,490,255,70);
//			context.fillStyle = "red";
//			context.fill();
//			context.closePath();
			canvas.onclick = null;
			canvas.onclick = helpOn;
		}else{
			canvas.onclick = null;
			canvas.onclick = clickOn;
		}
	} else if(gameState == 2){
		context.drawImage(gameOverImg, (W-586/1.7)/2,(H-556/1.7)/2-100,586/1.7,556/1.7);
		
		// 潜艇
		submarine.move();
		submarine.updateFrame();
		submarine.drawSubmarine();
		// 活动边界检测
		submarineMove();
		displayExplosion();
		
		context.drawImage(bg, -50, H-160);
		context.drawImage(bg, 964, H-160);
		context.drawImage(retryImg, retryX, retryY, 233/2,232/2);
		
		paintNum(W/2-20, 235, score);
		paintNum(W/2-20, 395, historyScore);
		if(soundOn && !isplayed){
			game_over_music.play();
			isplayed = true;
		}
		if(score > historyScore){
			window.localStorage.setItem("HappySubmarine_ouyang_score", score);
			historyScore = score;
			if(soundOn){
				game_over_music.onended = function(){
					new_score_music.play();
				}
			}
			
		}
		canvas.onclick = null;
		canvas.onclick = function(e){
			var ev = e || window.event;
			if(hit(ev.offsetX, ev.offsetY, retryX, retryY, retryX+233/2, retryY+232/2)){
				gameState = 0;
				if(soundOn){
					button_click_music.play();
				}
			}
		}
	}
}
// 开始点击事件
function clickOn(e){
	var ev = e || window.event;
	// 开始按钮点击事件
	if(hit(ev.offsetX, ev.offsetY, startX, startY, startX+300,startY+160)){
		gameState = 1;
		canvas.onclick = null;
		if(soundOn){
			button_click_music.play();
		}
	}
	// 点击说明帮助按钮
	if(hit(ev.offsetX, ev.offsetY, helpX, helpY, helpX+100, helpY+100)){
		isHelpText = true;
		if(soundOn){
			button_click_music.play();
		}
	}
	// 音效点击事件
	if(hit(ev.offsetX, ev.offsetY, soundX, soundY, soundX+100, soundY+100)){
		if(soundOn){
			soundImg.src = "img/button_sounds-sheet0.png";
			soundOn = false;
			bg_music.pause();
		}else{
			soundImg.src = "img/button_sounds-sheet1.png";
			soundOn = true;
			bg_music.play();
		}
	}
}
// 说明点击事件
function helpOn(e){
	var ev = e || window.event;
	// 点击关闭说明
	if(hit(ev.offsetX, ev.offsetY, 470, 490, 470+255, 490+70)){
		isHelpText = false;
		canvas.onclick = null;
		canvas.onclick = clickOn;
		if(soundOn){
			button_click_music.play();
		}
	}
}

// 爱心与潜艇碰撞检测
function heartAndSubmarine(){
//	context.beginPath();
//	context.fillStyle = "rgba(0,0,0,0.5)";
//	context.rect(submarine.x+30,submarine.y+5,submarine.w-100,submarine.h-85);
//	
//	context.fill();
//	context.closePath();
	if(hit(heart.x,heart.y,
		submarine.x+5 - (heart.w),
		submarine.y+5 - (heart.h),
		submarine.x+5 + (submarine.w-100),
		submarine.y+5 + (submarine.h-85)
	)){
		if(heart.visiable){
			heart.visiable = false;
			submarine.life++;
			// 获得生命音效
			if(soundOn){
				var i = Math.floor(Math.random()*2)+1;
				get_life_music.src = "sounds/life" + i +".ogg";
				get_life_music.play();
			}
		}
		
	}
}

// 陷阱与潜艇碰撞检测
function trapAndSubmarine(){
	if(hit(trap.x+65, trap.y,
			submarine.x+30 - (trap.w),
			submarine.y - (trap.h),
			submarine.x+5 + (submarine.w-100),
			submarine.y+5 + (submarine.h-85))
	){
		submarine.life = -10;
		// 爆炸特效
		explosions.push(new Explosion(trap.x, trap.y, 1));
		
		if(soundOn){
			explosion_music.src = "sounds/impact_bottom.ogg";
			explosion_music.play();
		}
	}
}

// 鱼雷与潜艇的碰撞检测
function bombAndSubmarine(){
	for(var i = 0; i < bombs.length; i++){
		var bomb = bombs[i];
		// 鱼雷：bomb.x + 65, bomb.y, bomb.w-65, bomb.h-25
		// 潜艇：submarine.x + 5, submarine.y + 5, submarine.w-100, submarine.h-85
		if(hit(bomb.x+65, bomb.y,
			submarine.x+5 - (bomb.w-65),
			submarine.y+5 - (bomb.h-25),
			submarine.x+5 + (submarine.w-100),
			submarine.y+5 + (submarine.h-85))
		){
			// 添加爆炸
			explosions.push(new Explosion(bomb.x+65, bomb.y, 0));
			bombs.splice(i, 1);
			submarine.life--;
			if(soundOn){
				explosion_music.src = "sounds/explosion.ogg";
				explosion_music.play();
			}
		}
	}
}

// 播放爆炸动画
function displayExplosion(){
	if(explosions.length > 0){
		for(var i = 0; i < explosions.length; i++){
			explosions[i].updateFrame();
			explosions[i].drawExplosion();
			if(explosions[i].frameNow == explosions[i].frameNum){
				explosions.splice(i,1);
			}
		}
	}
//	console.log(explosions);
}

// 潜艇移动边界
function submarineMove(){
	if(submarine.y+5 < -(submarine.h-85)){
		submarine.life = -10;
		submarine.frameSet = 12;
		if(!upEx){
			explosions.push(new Explosion(submarine.x, submarine.y, 1));
			upEx = true;
			if(soundOn){
				explosion_music.src = "sounds/impact_bottom.ogg";
				explosion_music.play();
			}
		}
	}
	if(submarine.y+5 > H-(submarine.h-85)-45){
		submarine.life = -10;
		submarine.frameSet = 12;
		if(!downEx){
			explosions.push(new Explosion(submarine.x, submarine.y, 1));
			downEx = true;
			if(soundOn){
				explosion_music.src = "sounds/impact_bottom.ogg";
				explosion_music.play();
			}
		}
	}
}

// 得分
function getScore(){
	if(submarine.life > 0){
		for(var i = 0; i < bombs.length; i++){
			var bomb = bombs[i];
			if(bomb.x + 65 < -(bomb.w-65)){
				bombs.splice(i,1);
				score++;
				if(soundOn){
					getScore_music.play();
				}
				
			}
		}
	}
	// 绘制分数
	paintNum(W*2/3 + 170, 25, score);
}
