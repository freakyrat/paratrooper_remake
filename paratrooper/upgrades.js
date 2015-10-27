function dropUpgrade(game,soldier) {
	//entscheiden, welche Art von Upgrade droppt...
	//wenn die Basis bereits Gesundheit verloren hat, wird Health-Upgrade ermöglicht
	if (basis.health < 100) {
		var i = game.rnd.integerInRange(1,4);
	}
	//andernfalls gibt es nur fireRate-, bulletSpeed- oder bulletStrength-Upgrades
	else var i = game.rnd.integerInRange(2,4);

	switch(i) {
		case 1:
		var upgrade = game.add.sprite(soldier.x,soldier.y,'upgrade');
		upgrade.type = 1;
		break;

		case 2:
		var upgrade = game.add.sprite(soldier.x,soldier.y,'upgrade');
		upgrade.type = 2;
		break;

		case 3:
		var upgrade = game.add.sprite(soldier.x,soldier.y,'upgrade');
		upgrade.type = 3;
		break;

		case 4:
		var upgrade = game.add.sprite(soldier.x,soldier.y,'upgrade');
		upgrade.type = 4;
	}
	game.physics.arcade.enable(upgrade);
    upgrade.enableBody = true;
    upgrade.body.gravity.y = 500;
    upgrades.add(upgrade);
    console.log('UpgradeDrop: Typ ' + i);
}

function useUpgrade(boden,upgrade) {
	console.log(upgrade.type);
	upgrade.destroy();
}