// 获取画布、画笔
window.onload = function(){
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
}

window.onmousedown = function(){
	submarine.isUp = true;
}
window.onmouseup = function(){
	submarine.isUp = false;
}

// 生成炸弹
function createBomb(){
	var bomb = new Bomb();
	bombs.push(bomb);
}

setInterval(createBomb, 2000);

setInterval(function(){
	context.clearRect(0, 0, W, H);
	
	// 潜艇
	submarine.move();
	submarine.drawSubmarine();
	for(var i = 0; i < bombs.length; i++){
		bombs[i].move();
		bombs[i].drawBomb();
	}
	
	submarine.updateFrame();
	// 海底
	bgBottom.updateFrame();
	bgBottom.drawBg();
	
}, 50);
