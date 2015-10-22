//  ____        _     _       _             
// / ___|  ___ | | __| | __ _| |_ ___ _ __  
// \___ \ / _ \| |/ _` |/ _` | __/ _ \ '_ \ 
//  ___) | (_) | | (_| | (_| | ||  __/ | | |
// |____/ \___/|_|\__,_|\__,_|\__\___|_| |_|
//

function dropSoldier(plane,game) {
        var j = game.rnd.integerInRange(soldierProbability,100);
        //Abwurf des Soldaten mit Fallschirm nach zufälliger Zeit, abhängig von soldierDropRate, 
        //wenn "plane" existiert und jeweils 50 Pixel vom linken bzw. rechten Rand entfernt ist
        if (j == 100 && game.time.now > nextSoldier && (plane.x <= game.world.width-50 && plane.x >= 50) && (plane.x<=game.world.width/2-50 || plane.x>=game.world.width/2+50)) {
            var i = game.rnd.realInRange(0.1,1);
            nextSoldier = game.time.now + soldierDropRate * i;
            this.createTrooper(plane,game);
        }
}

function createTrooper(plane,game,type) {
    //Für jeden Paratrooper wird eine Minigruppe erstellt
    paratrooper = game.make.group();
    //in ihr wird ein Fallschirm erzeugt (+30 Pixel um versetzten Anker auszugleichen)
    var parachute = paratrooper.create(plane.x,plane.y+30,'parachute');
    //Anker des Fallschirms auf untere Mitte setzen
    parachute.anchor.setTo(0.5,1);
    //Soldaten in der Paratrooper-Gruppe erzeugen
    var soldier = paratrooper.create(plane.x,plane.y+25,'soldier');
    //Anker auf obere Mitte des Soldaten setzen
    soldier.anchor.setTo(0.5,0);
    //wenn der Soldat auf der linken Hälfte des Bildschirms erscheint, soll er gespiegelt werden
    if (soldier.x < game.world.width/2) {
        soldier.scale.x *= -1;
    }
    //für Soldat und Fallschirm wird Physik aktiviert
    game.physics.arcade.enable(soldier);
    game.physics.arcade.enable(parachute);
    soldier.enableBody = true;
    parachute.enableBody = true;
    paratrooper.enableBody = true;
    paratrooper.physicsBodyType = Phaser.Physics.ARCADE;
    paratrooper.setAll('checkWorldBounds',true);
    paratrooper.setAll('outOfBoundsKill',true);
    //die Paratrooper-Minigruppe wird der großen Paratroopers-Gruppe hinzugefügt
    paratroopers.add(paratrooper);
}

function trooperCheck(game) {
	//Jeder Paratrooper ist Teil der Paratroopers-Gruppe
	var i = 0;
	//durchlaufe alle aktiven Paratrooper
	while (i<paratroopers.countLiving()) {
    	var paratrooper = paratroopers.children[i];
    	var parachute = paratrooper.children[0];
    	var soldier = paratrooper.children[1];
    	//ein Paratrooper ist eine Gruppe mit zwei Kindern
    	//das erste Kind im Array [0] ist der Soldat, [1] ist der Fallschirm

    	//solange der Fallschirm existiert, niedrige Gravitation
    	if (parachute.exists) {
    		paratrooper.setAll('body.gravity.y',20);

    		//wenn ein Paratrooper mit Fallschirm am Boden ankommt, wird er in die landedSoldiers-Gruppe übertragen und aus der Paratroopers-Gruppe entfernt.
    		if (game.physics.arcade.collide(boden,soldier) == true || game.physics.arcade.collide(landedSoldiers,soldier) == true) { 
    			paratrooper.remove(soldier);
    			this.landSoldier(soldier,parachute,game);
    			paratroopers.remove(paratrooper);
    		}
    	}

    	//wenn der Fallschirm nicht existiert, Gravitation erhöhen
    	else {
    		paratrooper.remove(soldier);
    		fallingSoldiers.add(soldier);
    		fallingSoldiers.setAll('body.gravity.y',500);
    		paratroopers.remove(paratrooper);
    		//game.physics.arcade.collide(soldier,landedSoldiers,soldierCollision,null,this);
		}

		//wenn der Soldat nicht mehr existiert, lösche den Fallschirm und zerstöre die Paratrooper-Gruppe
    	if (soldier.exists == false) {
    		paratrooper.destroy(); }

        //wenn eine Kugel den Fallschirm des Paratroopers trifft, destroyParachute-Funktion ausführen
        game.physics.arcade.overlap(bullets,parachute,this.destroyParachute,null,this);
        //wird der Soldat getroffen, führe explodeSoldier-Funktion aus
        game.physics.arcade.collide(bullets,soldier,function(bullets,soldier){
            this.explodeSoldier(bullets,soldier,game);
        },null,this);
        game.physics.arcade.overlap(debris,soldier,this.debrisCollision,null,this);
        game.physics.arcade.collide(debris,parachute,this.destroyParachute,null,this);
        game.physics.arcade.collide(fallingSoldiers,parachute,this.destroyParachute,null,this);
        //game.physics.arcade.collide(soldier,landedSoldiers,this.landSoldier,null,this);

        i++;

    }
}

function explodeSoldier(soldier,bullet,game) {
    killCount += 1;
    score += 50;
    blood.x = bullet.x;
    blood.y = bullet.y;
    blood.start(true,2000,null,50);
    bullet.kill();
    var i = game.rnd.integerInRange(1,49);
    if (i==7) {
        dropUpgrade(game,soldier);
    }
    soldier.kill();
}

function destroyParachute(parachute,bullet) {
    parachute.kill();
    //bullet.kill();
    score += 10;
}

function splatSoldier(boden,fallingSoldier) {
    killCount += 1;
    blood.x = fallingSoldier.x;
    blood.y = fallingSoldier.y;
    blood.start(true,2000,null,50);
    fallingSoldier.destroy();
}

function landSoldier(soldier,parachute,game) {
    parachute.kill();
    soldier.loadTexture('landedSoldier',0);
    soldier.animations.add('shoot',null,15,true,true);
    soldier.animations.play('shoot');
    soldier.body.gravity.y = 500;
    soldier.body.setSize(10,40,8,0);
    landedSoldiers.add(soldier);
    //timer überprüft nach einer Sekunde mit checkSoldierHeight, ob der Soldat über 120 Pixel hinaus ragt,
    //um GameOver direkt bei Landung eines dritten Soldaten zu vermeiden
    var timer = game.time.create(true);
    timer.add(1000,this.checkSoldierHeight,this,soldier,game);
    timer.start();
}

function checkSoldierHeight(soldier,game) {
    if (soldier.y <= game.world.height-119) {
        game.state.start("GameOver",true,false,score);
    }
}

function soldierCollision(fallingSoldier,soldier) {
    blood.x = soldier.x;
    blood.y = soldier.y;
    blood.start(true,2000,null,50);
    soldier.destroy();
    killCount += 1;
}

function debrisCollision(soldier,debris) {
    blood.x = soldier.x;
    blood.y = soldier.y;
    blood.start(true,2000,null,50);
    soldier.kill();
    killCount += 1;
}