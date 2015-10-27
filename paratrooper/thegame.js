// THINGS TO DO:
// -Gesundheitsanzeige für Flak
// -GameOver wenn Health des Flak null ist
// -Gesundheit sinkt schneller je nach Anzahl der Soldaten am Boden
// -GameOver wenn >15 Soldaten 10 Sekunden lang das Flak belagern
// -einzelne Soldaten enthalten Bomben oder Health
// -> Bomben können auf rechter Maustaste eingesetzt werden - säubern Boden und Himmel
// -ein UFO das irgendwo am Himmel für 10 Sekunden auftaucht 
// -> enthält evtl. Power-Ups (höhere Feuerrate, Health für Flak etc.) -> schießt unzerstörbaren Laser, wenn nicht abgeschossen
// -ein Jet der Bombe direkt über Flak abwirft (ist schnell, aber schwach) 
// -> Bombe kann abgeschossen werden -> zerstört alle Paratrooper am Himmel
// -Globale Hi-Score-Liste in SQL-Datenbank (Lokale Hi-Scores in Cookie) inkl. diverser Statistiken (abgeschossene Soldaten etc.)
// -für kurze Zeit Punktzahl einblenden bei Abschüssen
// -Multikill-Punktzahl-Multiplier, wenn Boden lange frei etc.
// -COOLE SPRITES
// (-freischaltbare AUfwertungen für Flak)
// (-verändernde Umgebung mit steigendem Level...evtl. nur Farbe von Grün zu Rot)
// (-evtl. unterschiedliches Verhalten von Soldatentypen)

// Look & Feel
// humorvoller Comichafter Look mit viel Blut, ähnlich Worms
// Soldaten zerspringen wie Lemminge, erscheinen zunehmend in Massen
// Transportflugzeuge sind schwer, aber langsam
// Jet ist fragil, aber schnell
// UFO ist stabil, steht fest an einer Stelle
// Spieler soll stets das Gefühl haben, das Spiel retten zu können -> Motivation
// dennoch steigender Druck


var theGame = function(game){

//Level-Variablen
soldierCount = 0;
planeCount = 0;
levelCount = 0;
level = 0;
planeLimit = 3; //+1 nach jedem 10. Level =13 in Level 100

//Schuss/Kugel-Variablen
fireRate = 500;
nextFire = 0;
bulletSpeed = 500;
bulletStrength = 1;

//getrennte spawnRates um Flugzeug-Rate ggf. getrennt zu erhöhen
//Zeitfaktor zur Berechnung des Zeitabstands zwischen Erstellung von Flugzeugen/Soldaten in Millisekunden
//Minusbedingungen der Startwerte nur für eventuelle Angabe eines anderen Startlevels
planeSpawnRate = 1000-(Math.floor(level/10)*50); //-50 nach jedem 10. Level =500 in Level 100
jetSpawnRate = 60000;
soldierDropRate = 1000-level*5; //-5 nach jedem Level =500 in Level 100

//Wahrscheinlichkeit für dropSoldier() und spawnPlane()
soldierProbability = level-1; //-1 damit 99 in Level 100 -> Erhöht Wechsel zwischen Flugzeugen
planeProbability = 0+(Math.floor(level/10)); //+1 nach jedem 10. Level =10 in Level 100, entspricht 100% Wahrscheinlichkeit

//next-Variablen für minimalen Zeitabstand zwischen Flugzeugen/Soldaten in Millisekunden
//Vorbelegung gilt nur für erstes jeweiliges Objekt
nextPlane = 1000*Math.random();
nextJet = 60000*Math.random();
nextSoldier = 1000*Math.random();

//Variable für Zeitabstand zwischen "Schüssen" der gelandeten Soldaten
decreaseHealthTime = 0;

//Statistik-Variablen
score = 0;
shotsFired = 0;
hitCount = 0;
killCount = 0;
}

theGame.prototype = {

create: function() {
	this.game.physics.startSystem(Phaser.Physics.ARCADE);

	sky_top = this.game.add.sprite(0,0,'sky_top');
	sky_middle = this.game.add.sprite(0,220,'sky_middle');
	mountains = this.game.add.sprite(0,500,'mountains');

	boden = this.game.add.sprite(this.game.world.width/2,this.game.world.height,'ground');
	this.game.physics.arcade.enable(boden);
	boden.enableBody = true;
	boden.body.immovable = true;
	boden.anchor.set(0.5,1);
	boden.body.setSize(1280,30,0,0);

	bullets = this.game.add.group();
	bullets.enableBody = true;
	bullets.physicsBodyType = Phaser.Physics.ARCADE;
	bullets.createMultiple(50,'bullet');
	bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    basis = this.game.add.sprite(this.game.world.width/2,this.game.world.height-115,'base');
	this.game.physics.arcade.enable(basis);
	basis.enableBody = true;
	basis.anchor.set(0.5,0);
	basis.health *= 100;
	basis.body.immovable = true;

	kanone = this.game.add.sprite(this.game.world.width/2,this.game.world.height-110,'kanone');
	kanone.animations.add('shoot',[1,0], 1000/(fireRate/2),true);
    kanone.anchor.setTo(0.1,0.5);

    planes = this.game.add.group();
    planes.enableBody = true;
    planes.physicsBodyType = Phaser.Physics.ARCADE;
    //planes.createMultiple(level,'plane');

    paratroopers = this.game.add.group();

    landedSoldiers = this.game.add.group();

    fallingChutes = this.game.add.group();
    fallingSoldiers = this.game.add.group();

    upgrades = this.game.add.group();

    blood = this.game.add.emitter(0,0,1000);
    blood.makeParticles('blood');
    blood.gravity.y=100;

    explosions = this.game.add.group();
    explosions.createMultiple(30, 'explode');

    debris = this.game.add.emitter(0,0,100);
    debris.makeParticles('debris');
    debris.gravity.y=1000;
    debris.setAll('checkWorldBounds', true);
    debris.setAll('outOfBoundsKill', true);

    scoreText = this.game.add.bitmapText(10, 10, 'carrier_command','SCORE: ' + score,14);
    killsText = this.game.add.bitmapText(10, 24, 'carrier_command','KILLS: ' + killCount,14);
    planeText = this.game.add.bitmapText(10, 38, 'carrier_command','PLANE: ' + (level-planeCount),14);
    levelText = this.game.add.bitmapText(10, 52, 'carrier_command','LEVEL: ' + level,14);
    healthText = this.game.add.bitmapText(10, 66, 'carrier_command','HEALTH: ' + basis.health,14);
},

update: function() {

	//Funktion für Steuerung aus controls.js aufrufen
	controls(this.game);

	
	//Bedingungen und Aufrufe der spawnPlane()- und dropSoldier()-Funktionen
	if (this.game.time.now > nextPlane && planes.countLiving() < level && planes.countLiving() < planeLimit) {
	 	var j = this.game.rnd.realInRange(3,10);
	 	nextPlane = this.game.time.now + planeSpawnRate * j;
	 	if (level <= 5) {
			spawnPlane(this.game,type=1);
	 	}
	 	else {
	 		var k = this.game.rnd.integerInRange(planeProbability,10);
	 		if (k==10) { spawnPlane(this.game,type=2); }
	 		else { spawnPlane(this.game,type=1); }
	 	}
	}

	if (this.game.time.now > nextJet) {
	 	var j = this.game.rnd.realInRange(5,10);
	 	nextJet = this.game.time.now + jetSpawnRate * j;
		spawnJet(this.game);
	}

	if (planes.length != 0){
		var i=0;
    	while (planes.length>i) {
			dropSoldier(planes.children[i],this.game);
			i++;
		}
	}

	//trooperCheck durchläuft alle aktiven Paratrooper und überprüft ob Fallschirme vorhanden etc. (soldiers.js)
	trooperCheck(this.game);

	//Bedingungen zum Beenden eines Levels:
	if (planeCount >= level){
		level += 1;
		levelCount += 1; //Level-Counter für Erhöhunh von Wahrscheinlichkeiten nach jedem zehnten Level
		soldierProbability = level;
		soldierDropRate -= 5;
		planeCount = 0;
		//planes.createMultiple(level,'plane');

		if (levelCount == 10) {
			levelCount = 0;
			planeProbability += 1;
			planeLimit += 1;
			planeSpawnRate -= 50;
		}
	}

	//"Gesundheit" der Basis abhängig von gelandeten Soldaten verringern
	if (landedSoldiers.length > 0 && this.game.time.now > decreaseHealthTime) {
		decreaseHealthTime = this.game.time.now + 1000;
		basis.health -= 0.05*landedSoldiers.length;
	}

	//Sobald "Gesundheit" der Basis aufgebraucht ist, wird das Spiel beendet
	if (basis.health <= 0) {
		this.game.state.start("GameOver",true,false,score);
	}

	//Sobald "Gesundheit" der Basis aufgebraucht ist, wird das Spiel beendet
	if (level == 101) {
		this.game.state.start("GameOver",true,false,score);
	}
	//weitere GameOver-Bedingung (Turm aus 3 Soldaten/Soldat höher als 120 Pixel) in landSoldier-Funktion in soldiers.js

	scoreText.text = "SCORE: " + score;
	levelText.text = "LEVEL: " + level;
	planeText.text = "PLANE: " + (level-planeCount);
	killsText.text = "KILLS: " + killCount;
	healthText.text = "HEALTH:" + Math.round(basis.health) + '%';


	//wenn eine Kugel auf ein Flugzeug trifft, explodePlane-Funktion ausführen
	this.game.physics.arcade.overlap(bullets,planes,function(bullets,planes){
		explodePlane(bullets,planes,this.game);
	},null,this);
	this.game.physics.arcade.collide(boden,fallingSoldiers,splatSoldier,null,this);
	this.game.physics.arcade.collide(bullets,fallingSoldiers,function(bullets,fallingSoldiers){
		explodeSoldier(bullets,fallingSoldiers,this.game);
	},null,this);
	//this.game.physics.arcade.collide(fallingSoldiers,paratroopers,soldierCollision,null,this);
	this.game.physics.arcade.collide(fallingSoldiers,landedSoldiers,soldierCollision,null,this);
	this.game.physics.arcade.collide(boden,debris,this.destroyObject,null,this);
	this.game.physics.arcade.collide(boden,fallingChutes,landParachute,null,this);
	this.game.physics.arcade.collide(debris,fallingSoldiers,soldierCollision,null,this);
	this.game.physics.arcade.collide(debris,landedSoldiers,soldierCollision,null,this);
	this.game.physics.arcade.collide(upgrades,fallingSoldiers,soldierCollision,null,this);
	this.game.physics.arcade.collide(upgrades,landedSoldiers,soldierCollision,null,this);
	this.game.physics.arcade.collide(boden,upgrades,useUpgrade,null,this);
	this.game.physics.arcade.collide(boden,landedSoldiers);
	this.game.physics.arcade.collide(landedSoldiers);

},

destroyObject: function(obj1,obj2) {
	obj2.kill();
},

//  _   _ _   _ ____      _____         _   
// | | | | | | |  _ \    |_   _|____  _| |_ 
// | |_| | | | | | | |_____| |/ _ \ \/ / __|
// |  _  | |_| | |_| |_____| |  __/>  <| |_ 
// |_| |_|\___/|____/      |_|\___/_/\_\\__|
//
                                         
render: function() {

	// this.game.debug.text('LEVEL: ' + level, 400, 24);
 //    this.game.debug.text('Planes left: '+ planes.length + ' Zeit: ' + this.game.time.now, 32, 48);
 //    this.game.debug.text('Paratroopers: ' + paratroopers.children.length, 32, 60);
 //    this.game.debug.text('landedSoldiers: ' + landedSoldiers.children.length, 32, 72);
    // this.game.debug.text('Base Health: ' + basis.health, 32, 96);
    // this.game.debug.text('soldierDropRate: ' + soldierDropRate, 32,110);
    // this.game.debug.text('planeSpawnRate: ' + planeSpawnRate, 32,124);
    // this.game.debug.text('soldierProbability: ' + soldierProbability, 32,138);
    // this.game.debug.text('planeProbability: ' + planeProbability, 32,152);
    this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
    //this.game.debug.spriteInfo(kanone, 32, 450);

}

}