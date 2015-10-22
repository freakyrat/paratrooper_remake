function controls(game) {
		if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
		game.input.activePointer = false;
		kanone.rotation -= 0.001;
	}

	if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
		game.input.activePointer = false;
		kanone.rotation += 0.001;
	}
	else if (game.input.activePointer) { 
		kanone.rotation = game.physics.arcade.angleToPointer(kanone); 
	} 

	//Beschränkung der Rotation auf obere Hälfte
	if (kanone.angle <= 0 && kanone.angle >= -180){
		if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
			kanone.rotation -= 0.1;
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
			kanone.rotation += 0.1;
		}
		else if (game.input.activePointer) { 
			kanone.rotation = game.physics.arcade.angleToPointer(kanone); 
		} 
	}

	else if (kanone.angle >= 90){
		kanone.angle = -180;
	}
	else {
		kanone.angle = 0;
	}

	//Feuern auf Maus/aktiven Zeiger oder Leertaste
	if (game.input.activePointer.isDown || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
		//kanone.frame = 1;
		kanone.animations.play('shoot');
		fire(game,bullets,kanone,score);
	}
	else {
		kanone.animations.stop('shoot');
		kanone.frame = 0;
	}
}

function fire(game) {
	if (game.time.now > nextFire && bullets.countDead() > 0) {
		nextFire = game.time.now + fireRate;
		var bullet = bullets.getFirstDead();
		bullet.reset(kanone.x,kanone.y);

		var p = new Phaser.Point(kanone.x,kanone.y);
		p.rotate(p.x,p.y,kanone.rotation,false,kanone.width);

		//Kanonenkugeln in Richtung des Mauszeigers abschießen, außer wenn er unterhalb der Kanone ist
		//Mauszeiger unterhalb der Kanone links -> Schüsse nach links
		if (kanone.angle == -180){
			game.physics.arcade.moveToXY(bullet,0,kanone.y,bulletSpeed);}
		//Mauszeiger unterhalb der Kanone rechts -> Schüsse nach rechts
		else if (kanone.angle == 0){
			game.physics.arcade.moveToXY(bullet,game.world.width,kanone.y,bulletSpeed);
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			game.physics.arcade.moveToXY(bullet,p.x,p.y,bulletSpeed);
		}
		//Mauszeiger oberhalb der Kanone -> Schüsse gehen Richtung Mauszeiger
		else {game.physics.arcade.moveToXY(bullet,p.x,p.y,bulletSpeed);}

		shotsFired += 1;
		score -= 1;
	}
}