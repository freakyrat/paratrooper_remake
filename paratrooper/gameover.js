var gameOver = function(game,score){}

gameOver.prototype = {
	/*init: function(score){
		alert("You scored: "+score)
	},*/
  	create: function(){
  		var gameOverTitle = this.game.add.bitmapText(this.game.world.width/2,this.game.world.height/2, 'carrier_command','GAME OVER!',40);
		gameOverTitle.anchor.setTo(0.5,0.5);
		var scoreText = this.game.add.bitmapText(this.game.world.width/2,this.game.world.height/2+50, 'carrier_command','SCORE: ' + score,20);
		scoreText.anchor.setTo(0.5,0.5);
		var playButton = this.game.add.button(this.game.world.width/2,this.game.world.height/2+150,"play",this.playTheGame,this);
		playButton.anchor.setTo(0.5,0.5);
	},
	playTheGame: function(){
		this.game.state.start("TheGame");
	}
}