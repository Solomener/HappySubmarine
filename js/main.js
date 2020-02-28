// 获取画布、画笔
window.onload = function(){
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	if(!historyScore && typeof(historyScore)!="undefine" && historyScore!=0){
		window.localStorage.setItem("HappySubmarine_ouyang_score", 0);
		historyScore = 0;
	}

	setInterval(createBomb, 2000);
	setInterval(gameLogic, 50);
}

window.onmousedown = function(){
	submarine.isUp = true;
}
window.onmouseup = function(){
	submarine.isUp = false;
}

// 生成炸弹
function createBomb(){
	if(gameState == 1){
		var bomb = new Bomb();
		bombs.push(bomb);
	}
}

function gameLogic(){
	context.clearRect(0, 0, W, H);
	
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
		// 海底
		bgBottom.updateFrame();
		bgBottom.drawBg();
		
		// 鱼雷与潜艇的碰撞检测
		bombAndSubmarine();	
		displayExplosion();
		// 绘制分数
		context.drawImage(scoreImg, W*4/6, 30, 160, 40);
		getScore();
		submarineMove();
		if(submarine.life < 0){
			gameState = 2;
		}
	}else if(gameState == 0){
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
		}
		canvas.onclick = function(e){
			var ev = e || window.event;
			// 开始按钮点击事件
			if(hit(ev.offsetX, ev.offsetY, startX, startY, startX+300,startY+160)){
				gameState = 1;
				canvas.onclick = null;
			}
			if(hit(ev.offsetX, ev.offsetY, helpX, helpY, helpX+100, helpY+100)){
				isHelpText = true;
			}
			
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
	if(submarine.y+5 < -(submarine.h-85-40)){
		submarine.life = -10;
		submarine.frameSet = 12;
		if(!upEx){
			explosions.push(new Explosion(submarine.x, submarine.y, 1));
			upEx = true;
		}
	}
	if(submarine.y+5 > H-(submarine.h-85)-45){
		submarine.life = -10;
		submarine.frameSet = 12;
		if(!downEx){
			explosions.push(new Explosion(submarine.x, submarine.y, 1));
			downEx = true;
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
			}
		}
	}
	// 绘制分数
	paintNum(W*2/3 + 170, 25, score);
}
