var theGame = function(game){
flyingPlanes = [];
activeTrooper = [];
fireRate = 200;
nextFire = 0;
spawnRate = 2000;
nextPlane = 0;
nextSoldier = 0;
score = 0;
level = 1;
}

theGame.prototype = {

create: function() {
	this.game.physics.startSystem(Phaser.Physics.ARCADE);
	sky = this.game.add.sprite(0,0,'sky');
	sky.scale.x *= 2;
	sky.scale.y *= 2;

	boden = this.game.add.sprite(0,this.game.world.height-20,'ground');
	this.game.physics.arcade.enable(boden);
	boden.scale.x *= 4;
	boden.enableBody = true;
	boden.body.immovable = true;

	basis = this.game.add.sprite(this.game.world.width/2,this.game.world.height-50,'star');
	this.game.physics.arcade.enable(basis);
	basis.enableBody = true;
	basis.anchor.set(0.5);
	//basis.body.immovable = true;

	bullets = this.game.add.group();
	bullets.enableBody = true;
	bullets.physicsBodyType = Phaser.Physics.ARCADE;
	bullets.createMultiple(50,'bullet');
	bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    kanone = this.game.add.sprite(this.game.world.width/2,this.game.world.height-50,'kanone');
    kanone.anchor.setTo(0,0.5);

    // kanone = this.game.add.group(this,'kanone',true,true,Phaser.Physics.ARCADE);
    // kanone.x = this.game.world.width/2;
    // kanone.y = this.game.world.height-50;
    // canon = kanone.create(0,0,'canon');
    // canon.anchor.setTo(0,0.5);
    // crosshair = kanone.create(100,0,'crosshair');
    // crosshair.anchor.setTo(0.5);

    planes = this.game.add.group();
    planes.enableBody = true;
    planes.physicsBodyType = Phaser.Physics.ARCADE;
    planes.createMultiple(20,'plane');
    planes.setAll('checkWorldBounds',true);
    planes.setAll('outOfBoundsKill',true);

    paratroopers = this.game.add.group();

    landedSoldiers = this.game.add.group();

    fallingSoldiers = this.game.add.group();

    blood = this.game.add.emitter(0,0,1000);
    blood.makeParticles('blood');
    blood.gravity.y=100;

    debris = this.game.add.emitter(0,0,100);
    debris.makeParticles('debris');
    debris.gravity.y=600;
},

update: function() {

	//Funktion für Steuerung aufrufen
	this.controls();

	//Bedingungen zum Beenden eines Levels:
	if (planes.length == 0 && paratroopers.length == 0){
		this.game.world.removeAll();
		level += 1;
		spawnRate *= 0.9;
		this.create();
	}

//  _____ _                                      
// |  ___| |_   _  __ _ _______ _   _  __ _  ___ 
// | |_  | | | | |/ _` |_  / _ \ | | |/ _` |/ _ \
// |  _| | | |_| | (_| |/ /  __/ |_| | (_| |  __/
// |_|   |_|\__,_|\__, /___\___|\__,_|\__, |\___|
//                |___/               |___/   

	//in zufälligem Zeitabstand Flugzeuge erzeugen (spawnPlane()-Funktion)
	if (this.game.time.now > nextPlane && planes.countDead() > 0 && flyingPlanes.length <= 4) {
		nextPlane = this.game.time.now + (spawnRate*5) * Math.random();
		this.spawnPlane();
	}
	//in zufälligem Zeitabstand Soldaten fallen lassen
	if (paratroopers.length <= 15){
		this.dropSoldier();
	}


//  ____        _     _       _             
// / ___|  ___ | | __| | __ _| |_ ___ _ __  
// \___ \ / _ \| |/ _` |/ _` | __/ _ \ '_ \ 
//  ___) | (_) | | (_| | (_| | ||  __/ | | |
// |____/ \___/|_|\__,_|\__,_|\__\___|_| |_|
//

	//Jeder Paratrooper ist Teil der Paratroopers-Gruppe
	var i = 0;
	//durchlaufe alle aktiven Paratrooper
	while (i<paratroopers.countLiving()) {
    	var paratrooper = paratroopers.children[i];
    	var soldier = paratrooper.children[0];
    	var parachute = paratrooper.children[1];
    	//ein Paratrooper ist eine Gruppe mit zwei Kindern
    	//das erste Kind im Array [0] ist der Soldat, [1] ist der Fallschirm

    	//solange der Fallschirm existiert, niedrige Gravitation
    	if (parachute.exists) {
    		paratrooper.setAll('body.gravity.y',20);

    		//wenn ein Paratrooper mit Fallschirm am Boden ankommt, wird er in die landedSoldiers-Gruppe übertragen und aus der Paratroopers-Gruppe entfernt.
    		if (this.game.physics.arcade.collide(boden,soldier) == true) { 
    			paratrooper.remove(soldier);
    			this.landSoldier(soldier);
    			parachute.kill();
    			paratroopers.remove(paratrooper);
    		}
    	}

    	//wenn der Fallschirm nicht existiert, Gravitation erhöhen
    	else {
    		paratrooper.remove(soldier);
    		fallingSoldiers.add(soldier);
    		fallingSoldiers.setAll('body.gravity.y',500);
    		paratroopers.remove(paratrooper);
    		//this.game.physics.arcade.collide(soldier,landedSoldiers,soldierCollision,null,this);
		}

		//wenn der Soldat nicht mehr existiert, lösche den Fallschirm und zerstöre die Paratrooper-Gruppe
    	if (soldier.exists == false) {
    		paratrooper.destroy(); }
    
    	i++;


//  __  __         __ __ __         __                          
// |  |/  |.-----.|  |  |__|.-----.|__|.-----.-----.-----.-----.
// |     < |  _  ||  |  |  ||__ --||  ||  _  |     |  -__|     |
// |__|\__||_____||__|__|__||_____||__||_____|__|__|_____|__|__|
//

    	//wenn eine Kugel den Fallschirm des Paratroopers trifft, destroyParachute-Funktion ausführen
    	this.game.physics.arcade.overlap(bullets,parachute,this.destroyParachute,null,this);
    	//wird der Soldat getroffen, führe explodeSoldier-Funktion aus
    	this.game.physics.arcade.collide(bullets,soldier,this.explodeSoldier,null,this);
    	this.game.physics.arcade.overlap(debris,soldier,this.debrisCollision,null,this);
    	this.game.physics.arcade.collide(debris,parachute,this.destroyParachute,null,this);
    	this.game.physics.arcade.collide(fallingSoldiers,parachute,this.destroyParachute,null,this);

	}


	//wenn eine Kugel auf ein Flugzeug trifft, explodePlane-Funktion ausführen
	this.game.physics.arcade.overlap(bullets,planes,this.explodePlane,null,this);
	this.game.physics.arcade.collide(boden,fallingSoldiers,this.splatSoldier,null,this);
	this.game.physics.arcade.collide(bullets,fallingSoldiers,this.explodeSoldier,null,this);
	//this.game.physics.arcade.collide(fallingSoldiers,paratroopers,soldierCollision,null,this);
	this.game.physics.arcade.collide(fallingSoldiers,landedSoldiers,this.soldierCollision,null,this);
	this.game.physics.arcade.collide(debris,fallingSoldiers,this.soldierCollision,null,this);
	this.game.physics.arcade.collide(debris,landedSoldiers,this.soldierCollision,null,this);

},



fire: function() {
	if (this.game.time.now > nextFire && bullets.countDead() > 0) {
		nextFire = this.game.time.now + fireRate;
		var bullet = bullets.getFirstDead();
		bullet.reset(kanone.x,kanone.y-5);

		var p = new Phaser.Point(kanone.x,kanone.y);
		p.rotate(p.x,p.y,kanone.rotation,false,50);

		//Kanonenkugeln in Richtung des Mauszeigers abschießen, außer wenn er unterhalb der Kanone ist
		//Mauszeiger unterhalb der Kanone links -> Schüsse nach links
		if (this.game.input.activePointer.y > kanone.y && this.game.input.activePointer.x < kanone.x){
			this.game.physics.arcade.moveToXY(bullet,0,kanone.y,500);}
		//Mauszeiger unterhalb der Kanone rechts -> Schüsse nach rechts
		else if (this.game.input.activePointer.y > kanone.y && this.game.input.activePointer.x > kanone.x){
			this.game.physics.arcade.moveToXY(bullet,this.game.world.width,kanone.y,500);}
		//Mauszeiger oberhalb der Kanone -> Schüsse gehen Richtung Mauszeiger
		else {this.game.physics.arcade.moveToPointer(bullet,500);}

		if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			this.game.physics.arcade.moveToXY(bullet,p.x,p.y,500);
		}

		score -= 1;
	}
},


//  _____               _        __             _    _   _                        
// |__  /   _ ___  __ _| |_ ____/ _|_   _ _ __ | | _| |_(_) ___  _ __   ___ _ __  
//   / / | | / __|/ _` | __|_  / |_| | | | '_ \| |/ / __| |/ _ \| '_ \ / _ \ '_ \ 
//  / /| |_| \__ \ (_| | |_ / /|  _| |_| | | | |   <| |_| | (_) | | | |  __/ | | |
// /____\__,_|___/\__,_|\__/___|_|  \__,_|_| |_|_|\_\\__|_|\___/|_| |_|\___|_| |_|
//

spawnPlane: function() {
	//erstes Flugzeug aus Gruppe wählen
	var plane = planes.getFirstDead();
	plane.anchor.set(0.5);
	//Zufallszahl 1 oder 2 erzeugen, um zu bestimmen ob das Flugzeug rechts oder links startet
	var i = this.game.rnd.integerInRange(1,2);
	//wenn Zufallszahl 1, Flugzeug links erzeugen und nach rechts fliegen lassen
	if (i==1) { 
		plane.reset(0,(this.game.world.height-500)*Math.random());
		this.game.physics.arcade.moveToXY(plane,this.game.world.width,(this.game.world.height-500)*Math.random(),100);
		//wenn sprite gespiegelt ist, spiegele es zurück
		if (plane.scale.x < 0) {plane.scale.x *= -1;}
	}
	//andernfalls wenn Zufallszahl 2, Flugzeug rechts erzeugen und nach links fliegen lassen
	else if (i == 2) {
		plane.reset(this.game.world.width,(this.game.world.height-500)*Math.random());
		this.game.physics.arcade.moveToXY(plane,0,(this.game.world.height-500)*Math.random(),100);
		//wenn sprite nicht gespiegelt, spiegele es
		if (plane.scale.x > 0) {plane.scale.x *= -1;}
	}
},

dropSoldier: function() {
	//alle aktiven Flugzeuge in flyingPlanes-Array schieben
	flyingPlanes.length=0;
	planes.forEachAlive(function(plane){flyingPlanes.push(plane)});
	//zufällig ein FLugzeug aus dem Array wählen
	var random=this.game.rnd.integerInRange(0,flyingPlanes.length-1);
	var dropper=flyingPlanes[random];
	//Abwurf des Soldaten mit Fallschirm
	if (dropper && this.game.time.now > nextSoldier) {
		nextSoldier = this.game.time.now + spawnRate * Math.random();
		this.createTrooper(dropper);
	}
},

createTrooper: function(dropper) {
	//Für jeden Paratrooper wird eine Minigruppe erstellt
	paratrooper = this.game.make.group();
	//in ihr werden jeweils ein Soldat und ein Fallschirm erzeugt
	var soldier = paratrooper.create(dropper.x,dropper.y+21,'soldier');
	var parachute = paratrooper.create(dropper.x,dropper.y,'parachute');
	//für Soldat und Fallschirm wird Physik aktiviert
	this.game.physics.arcade.enable(soldier);
	this.game.physics.arcade.enable(parachute);
	paratrooper.enableBody = true;
    paratrooper.physicsBodyType = Phaser.Physics.ARCADE;
    paratrooper.setAll('checkWorldBounds',true);
    paratrooper.setAll('outOfBoundsKill',true);
	//die Paratrooper-Minigruppe wird der großen Paratroopers-Gruppe hinzugefügt
    paratroopers.add(paratrooper);
},


//  _  __     _ _ _     _                  __             _    _   _                        
// | |/ /___ | | (_)___(_) ___  _ __  ___ / _|_   _ _ __ | | _| |_(_) ___  _ __   ___ _ __  
// | ' // _ \| | | / __| |/ _ \| '_ \/ __| |_| | | | '_ \| |/ / __| |/ _ \| '_ \ / _ \ '_ \ 
// | . \ (_) | | | \__ \ | (_) | | | \__ \  _| |_| | | | |   <| |_| | (_) | | | |  __/ | | |
// |_|\_\___/|_|_|_|___/_|\___/|_| |_|___/_|  \__,_|_| |_|_|\_\\__|_|\___/|_| |_|\___|_| |_|
//

explodePlane: function(bullet,plane) {
	if (plane.health == 0.5) { plane.loadTexture('plane_rusty',0); plane.health -= 0.1; }
	else if (plane.health <= 0) {
		debris.x = plane.x;
		debris.y = plane.y;
		debris.start(true,5000,null,5);
		plane.destroy();
		score += 100;
	}
	else { plane.health -= 0.1; }
	bullet.kill();
},

explodeSoldier: function(soldier,bullet) {
	score += 50;
	blood.x = bullet.x;
	blood.y = bullet.y;
	blood.start(true,2000,null,50);
	bullet.kill();
	soldier.kill();
},

destroyParachute: function (parachute,bullet) {
	parachute.kill();
	//bullet.kill();
	score += 10;
},

splatSoldier: function (boden,fallingSoldier) {
	blood.x = fallingSoldier.x;
	blood.y = fallingSoldier.y;
	blood.start(true,2000,null,50);
	fallingSoldier.destroy();
},

landSoldier: function (soldier) {
	landedSoldiers.add(soldier);
	//this.game.physics.arcade.collide(soldier,boden);
	landedSoldiers.setAll('body.gravity.y',0);
},

soldierCollision: function(fallingSoldier,soldier) {
	blood.x = soldier.x;
	blood.y = soldier.y;
	blood.start(true,2000,null,50);
	soldier.destroy();
},

debrisCollision: function(soldier,debris) {
	blood.x = soldier.x;
	blood.y = soldier.y;
	blood.start(true,2000,null,50);
	soldier.kill();
},


controls: function() {
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
		this.game.input.activePointer = false;
		kanone.rotation -= 0.001;
	}

	if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
		this.game.input.activePointer = false;
		kanone.rotation += 0.001;
	}
	else if (this.game.input.activePointer) { 
		kanone.rotation = this.game.physics.arcade.angleToPointer(kanone); 
	} 

	//Beschränkung der Rotation auf obere Hälfte
	if (kanone.angle <= 0 && kanone.angle >= -180){
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
			kanone.rotation -= 0.1;
		}
		else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
			kanone.rotation += 0.1;
		}
		else if (this.game.input.activePointer) { 
			kanone.rotation = this.game.physics.arcade.angleToPointer(kanone); 
		} 
	}

	else if (kanone.angle >= 90){
		kanone.angle = -180;
	}
	else {
		kanone.angle = 0;
	}

	//Feuern auf Maus/aktiven Zeiger oder Leertaste
	if (this.game.input.activePointer.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
		this.fire();
	}

	//Pause mit P-Taste
	if (this.game.input.keyboard.isDown(Phaser.Keyboard.P)){
		this.game.physics.arcade.isPaused = true;
	}

	if (this.game.paused && this.game.input.keyboard.isDown(Phaser.Keyboard.P)){
		this.gamephysics.arcade.isPaused = false;
	}
},


//  _   _ _   _ ____      _____         _   
// | | | | | | |  _ \    |_   _|____  _| |_ 
// | |_| | | | | | | |_____| |/ _ \ \/ / __|
// |  _  | |_| | |_| |_____| |  __/>  <| |_ 
// |_| |_|\___/|____/      |_|\___/_/\_\\__|
//
                                         

render: function() {
	this.game.debug.text('SCORE: ' + score + ' | LEVEL: ' + level, 600, 24);
	this.game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.total, 32, 24);
    this.game.debug.text('X: '+ this.game.input.activePointer.x + ' Y: '+ this.game.input.activePointer.y + ' ' + this.game.rnd.integerInRange(1,2), 32, 36);
    this.game.debug.text('Flying Planes: '+ flyingPlanes.length + ' Zeit: ' + this.game.time.now, 32, 48);
    this.game.debug.text('Paratroopers: ' + paratroopers.children.length, 32, 60);
    this.game.debug.text('landedSoldiers: ' + landedSoldiers.children.length, 32, 72);
    this.game.debug.text('f: ' + bullets.length, 32, 84);
    this.game.debug.spriteInfo(kanone, 32, 450);

}

}