var gameTitle = function(game){}

gameTitle.prototype = {
  	create: function(){
		var gameTitle = this.game.add.bitmapText(this.game.world.width/2,this.game.world.height/2, 'carrier_command','FLAK THAT!',40);
		gameTitle.anchor.setTo(0.5,0.5);
		var playButton = this.game.add.button(this.game.world.width/2,this.game.world.height/2+150,"play",this.playTheGame,this);
		playButton.anchor.setTo(0.5,0.5);
	},
	playTheGame: function(){
		this.game.state.start("TheGame");
	}
}