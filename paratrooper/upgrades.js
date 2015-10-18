function dropUpgrade(game,soldier) {
	var upgrade = game.add.sprite(soldier.x,soldier.y,'upgrade');
	game.physics.arcade.enable(upgrade);
    upgrade.enableBody = true;
    upgrade.body.gravity.y = 500;
    upgrades.add(upgrade);
}