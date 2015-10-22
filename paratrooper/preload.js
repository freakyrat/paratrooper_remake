var preload = function(game){}

preload.prototype = {
	preload: function(){ 
        var loadingBar = this.add.sprite(160,240,"loading");
        loadingBar.anchor.setTo(0.5,0.5);
        this.load.setPreloadSprite(loadingBar);

        //benötigte Skripte
        this.game.load.script("controls","paratrooper/controls.js");
        this.game.load.script("planes","paratrooper/planes.js");
        this.game.load.script("soldiers","paratrooper/soldiers.js");
        this.game.load.script("upgrades","paratrooper/upgrades.js");

        //Spritesheets
        this.game.load.spritesheet('kanone','paratrooper/assets/kanone_spritesheet_68x15.png',68,15,2);
        this.game.load.spritesheet('helicopter','paratrooper/assets/heli_spritesheet_124x103.png',124,103,12);
        this.game.load.spritesheet('plane','paratrooper/assets/plane_spritesheet_206x77.png',206,77,12);
		this.game.load.spritesheet('plane_burn', 'paratrooper/assets/plane_burn_spritesheet_200x77.png',200,77,6);
		this.game.load.spritesheet('landedSoldier','paratrooper/assets/landedSoldier_spritesheet_48x40.png',48,40,2);

		//Bilder
        this.game.load.image("gametitle","paratrooper/assets/gametitle.png");
		this.game.load.image("play","paratrooper/assets/play.png");
		this.game.load.image('sky', 'paratrooper/assets/sky.png');
		this.game.load.image('ground', 'paratrooper/assets/boden.png');
		this.game.load.image('base', 'paratrooper/assets/base.png');
		this.game.load.image('bullet', 'paratrooper/assets/bullet.png');
		this.game.load.image('jet','paratrooper/assets/jet.png');
		this.game.load.image('paratrooper','paratrooper/assets/paratrooper.png');
		this.game.load.image('soldier','paratrooper/assets/soldier.png');
		this.game.load.image('parachute','paratrooper/assets/parachute.png');
		this.game.load.image('blood','paratrooper/assets/blood.png');
		this.game.load.image('debris','paratrooper/assets/debris.png');
		this.game.load.image('upgrade','paratrooper/assets/upgrade.png');
		this.game.load.image('crosshair','paratrooper/assets/crosshair.png');
		this.game.load.image('hole','paratrooper/assets/hole.png');

		//Fonts
		this.game.load.bitmapFont('carrier_command', 'paratrooper/assets/fonts/carrier_command.png', 'paratrooper/assets/fonts/carrier_command.xml');

		this.game.time.advancedTiming = true;
	},
  	create: function(){
		this.game.state.start("GameTitle");
	}
}