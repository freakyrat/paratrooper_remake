var startLeft = true; //boolean-Wert für Startseite des Jets

function spawnPlane(game,type) {
	//in zufälligem Zeitabstand Flugzeuge erzeugen
	
		//erstes Flugzeug aus Gruppe wählen
		//var plane = planes.getFirstDead();
		//Flugzeug in planes-Gruppe erstelen
		if (type == 1) {
			var plane = planes.create(0,(game.world.height-500)*Math.random(),'helicopter');
			plane.health = 8;
		}
		else {
			var plane = planes.create(0,(game.world.height-500)*Math.random(),'plane');
			plane.health = 16;
		}
		plane.animations.add('propeller',[0,1,2,3,4,5], 24, true,true);
		plane.animations.add('burn',[6,7,8,9,10,11], 24, true,true);
		plane.animations.play('propeller');
		plane.anchor.set(0.5);
		planes.setAll('checkWorldBounds',true);
		//Zufallszahl 1 oder 2 erzeugen, um zu bestimmen ob das Flugzeug rechts oder links startet
		var i = game.rnd.integerInRange(1,2);
		//wenn Zufallszahl 1, Flugzeug links erzeugen und nach rechts fliegen lassen
		if (i==1) { 
			//var plane = planes.create(0,(game.world.height-500)*Math.random(),'plane');
			plane.x = 0;
			plane.y = (game.world.height-500)*Math.random();
			game.physics.arcade.moveToXY(plane,game.world.width,(game.world.height-500)*Math.random(),100);
			//wenn sprite gespiegelt ist, spiegele es zurück
			if (plane.scale.x < 0) {plane.scale.x *= -1;}
		}
		//andernfalls wenn Zufallszahl 2, Flugzeug rechts erzeugen und nach links fliegen lassen
		else if (i == 2) {
			//var plane = planes.create(game.world.width,(game.world.height-500)*Math.random(),'plane');
			plane.x = game.world.width;
			plane.y = (game.world.height-500)*Math.random();
			game.physics.arcade.moveToXY(plane,0,(game.world.height-500)*Math.random(),100);
			//wenn sprite nicht gespiegelt, spiegele es
			if (plane.scale.x > 0) {plane.scale.x *= -1;}
		}
	//statt Flugzeuge außerhalb der Bildschirmgrenzen zu "killen" und zurückzusetzen, werden sie gespiegelt und wieder zurückgeschickt (planeTurn-Funktion)
	//So wird das Zurücksetzen des Health-Wertes vermieden.
	//Damit die Flugzeuge nicht sofort zurückkehren, wird ein Timer erstellt, der dann die eigentliche Funktion aufruft
		plane.events.onOutOfBounds.add(this.planeTurnTimer,this,plane,game);
}

function planeTurnTimer(plane,game) {
	//Flugzeug anhalten
	//plane.body.velocity.setTo(0,0);
	//Zufallszahl und Timer erstellen
	var i = game.rnd.integerInRange(1,5);
	var timer = game.time.create(true);
	//planeTurn-Funktion zum Timer hinzufügen und nach zufälliger Zeit entsprechend der üblichen planeSpawnRate aufrufen
	timer.add(planeSpawnRate * i,this.planeTurn,this,plane,game);
	timer.start();
}

function planeTurn(plane,game) {
	// wenn Flugzeug auf linker Seite Bildschirm verlässt
	if (plane.x <= 0) {
		plane.scale.x *= -1;
		game.physics.arcade.moveToXY(plane,game.world.width,(game.world.height-500)*Math.random(),100);
	}
	// wenn es auf rechter Seite den Bildschirm verlässt
	else if (plane.x >= game.world.width) {
		plane.scale.x *= -1;
		game.physics.arcade.moveToXY(plane,0,(game.world.height-500)*Math.random(),100);
	}
}

function explodePlane(bullet,plane,game) {
	if (plane.health >= 0) { 
		plane.health -= bulletStrength;
		if (plane.health <= 5) { 
			plane.animations.play('burn');
			//plane.animations.play('propeller');
		}
	}
	else if (plane.health <= 0) {
		var explosion = explosions.getFirstExists(false);
		explosion.animations.add('explode',null,30,false);
    	explosion.reset(plane.body.x, plane.body.y);
    	explosion.play('explode', 30, false, true);
		debris.x = plane.x;
		debris.y = plane.y;
		debris.start(true,10000,null,3);
		plane.destroy();
		score += 100;
		planeCount += 1;
		//nextPlane-Zeit zurücksetzen, damit nach Abschuss nicht sofort ein neues Flugzeug auftaucht
		var i = game.rnd.integerInRange(3,9);
		nextPlane = game.time.now + planeSpawnRate * i;
	}	
	bullet.kill();
}

function spawnJet (game) {
	var random = Math.random();
	var jet = game.add.sprite(0,(game.world.height-500)*random,'jet');
	game.physics.arcade.enable(jet);
	jet.enableBody = true;
	jet.checkWorldBounds = true;
	jet.outOfBoundsKill = true;
	//jet.health *= 3;
	if (startLeft == true) {
		game.physics.arcade.moveToXY(jet,game.world.width,(game.world.height-500)*random,250);
		startLeft = false;
	}
	else {
		jet.reset(game.world.width,(game.world.height-500)*random,'jet');
		game.physics.arcade.moveToXY(jet,0,(game.world.height-500)*random,250);
		startLeft = true;
	}
}