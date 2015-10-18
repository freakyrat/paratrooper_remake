var preload = function(game){}

preload.prototype = {
	preload: function(){ 
        var loadingBar = this.add.sprite(160,240,"loading");
        loadingBar.anchor.setTo(0.5,0.5);
        this.load.setPreloadSprite(loadingBar);
        this.game.load.script("controls","paratrooper/controls.js");
        this.game.load.script("planes","paratrooper/planes.js");
        this.game.load.script("soldiers","paratrooper/soldiers.js");
        this.game.load.script("upgrades","paratrooper/upgrades.js");
        this.game.load.image("gametitle","phaser/assets/gametitle.png");
		this.game.load.image("play","phaser/assets/play.png");
		this.game.load.image('sky', 'phaser/assets/sky.png');
		this.game.load.image('ground', 'phaser/assets/boden.png');
		this.game.load.image('base', 'phaser/assets/base.png');
		this.game.load.image('bullet', 'phaser/assets/bullet.png');
		this.game.load.image('kanone', 'phaser/assets/kanone.png');
		this.game.load.spritesheet('plane','phaser/assets/plane_spritesheet_200x77.png',200,77,6);
		//this.game.load.image('plane', 'phaser/assets/plane.png');
		this.game.load.spritesheet('plane_burn', 'phaser/assets/plane_burn_spritesheet_200x77.png',200,77,6);
		this.game.load.image('jet','phaser/assets/jet.png');
		this.game.load.image('paratrooper','phaser/assets/paratrooper.png');
		this.game.load.image('soldier','phaser/assets/soldier.png');
		this.game.load.image('parachute','phaser/assets/parachute.png');
		this.game.load.image('blood','phaser/assets/blood.png');
		this.game.load.image('debris','phaser/assets/debris.png');
		this.game.load.image('upgrade','phaser/assets/upgrade.png');
		this.game.load.image('crosshair','phaser/assets/crosshair.png');
		this.game.load.image('hole','phaser/assets/hole.png');
	},
  	create: function(){
		this.game.state.start("GameTitle");
	}
}