var preload = function(game){}

preload.prototype = {
	preload: function(){ 
        var loadingBar = this.add.sprite(160,240,"loading");
        loadingBar.anchor.setTo(0.5,0.5);
        this.load.setPreloadSprite(loadingBar);
        this.game.load.image("gametitle","phaser/assets/gametitle.png");
		this.game.load.image("play","phaser/assets/play.png");
		this.game.load.image('sky', 'phaser/assets/sky.png');
		this.game.load.image('ground', 'phaser/assets/platform.png');
		this.game.load.image('star', 'phaser/assets/star.png');
		this.game.load.image('bullet', 'phaser/assets/bullet.png');
		this.game.load.image('kanone', 'phaser/assets/kanone.png');
		this.game.load.image('plane', 'phaser/assets/plane.png');
		this.game.load.image('plane_rusty', 'phaser/assets/plane_rusty.png');
		this.game.load.image('paratrooper','phaser/assets/paratrooper.png');
		this.game.load.image('soldier','phaser/assets/soldier.png');
		this.game.load.image('parachute','phaser/assets/parachute.png');
		this.game.load.image('blood','phaser/assets/blood.png');
		this.game.load.image('debris','phaser/assets/debris.png');
		this.game.load.image('crosshair','phaser/assets/crosshair.png');
		this.game.load.image('hole','phaser/assets/hole.png');
	},
  	create: function(){
		this.game.state.start("GameTitle");
	}
}