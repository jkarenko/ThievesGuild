import GuildScene from "./scenes/GuildScene.js";

window.addEventListener('load', function () {

	var game = new Phaser.Game({
		width: 1280,
		height: 720,
		type: Phaser.AUTO,
		backgroundColor: "#242424",
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH
		}
	});

	game.scene.add("GuildScene", GuildScene);
	game.scene.add("Boot", Boot, true);
});

class Boot extends Phaser.Scene {

	preload() {
		// Load both asset packs
		this.load.pack("pack", "assets/preload-asset-pack.json");
		this.load.pack("pack", "assets/asset-pack.json");
	}

	create() {
		this.scene.start("GuildScene");
	}
}
