
const tileSet = {pic:new Image()};
tileSet.pic.src = 'tileSheet.png';

const TileSet = {

	tileName: (letter) => {
		switch(letter) {
			case 'a': return "cave air";
			case 'b': return "stone block";
			case 'c': return "door";
			case 'e': return "bomb guy";
			case 'f': return "hard stone block";
			case 'g': return "grass ground";
			case 'h': return "black air";
			case '.': return "sky";
			default: return "???";
		}
	},

	drawTile: (ctx, letter, x, y, leftLetter, downLetter, rightLetter, upLetter) => {
		switch(letter) {
			case 'a': ctx.drawImage(tileSet.pic, 0, 0, 32, 32, x, y, 40, 40); break;
			case 'b':
				TileSet.drawShadow(ctx, x, y, leftLetter, downLetter, rightLetter, upLetter);
				ctx.drawImage(tileSet.pic, 33, 0, 32, 32, x, y, 40, 40);
				break;
			case 'c':
				ctx.drawImage(tileSet.pic, 66, 0, 32, 32, x, y, 40, 40);
				ctx.drawImage(tileSet.pic, 66, 33, 32, 32, x, y + 40, 40, 40);
				break;
			case 'e':
				TileSet.drawBomb(ctx, x+8, y+12, -1, 0);
				break;
			case 'g':
				ctx.drawImage(tileSet.pic, 0, 130, 32, 32, x, y, 40, 40);

				//if(downLetter==='a') {
				//	ctx.drawImage(tileSet.pic, 0, 163, 32, 32, x, y+40, 40, 40);
				//}
				//if(upLetter==='.') {
					ctx.drawImage(tileSet.pic, 0, 97, 32, 32, x, y-40, 40, 40);
				//}a
				break;
			case 'f':
				TileSet.drawShadow(ctx, x, y, leftLetter, downLetter, rightLetter, upLetter);
				ctx.drawImage(tileSet.pic, 165, 0, 32, 32, x, y, 40, 40);
				break;
			case 'h': ctx.drawImage(tileSet.pic, 231, 0, 32, 32, x, y, 40, 40); break;
			case '.': ctx.drawImage(tileSet.pic, 198, 0, 32, 32, x, y, 40, 40); break;
		}
	},

	drawShadow(ctx, x, y, leftLetter, downLetter, rightLetter, upLetter) {
		// NORMAL SHADOW
		ctx.drawImage(tileSet.pic, 0, 33, 32, 32, x + 10, y + 10, 40, 40);
		if (leftLetter == 'a' && downLetter == 'a') {
			// CORNER SHAWDOW UNDERNEATH
			ctx.drawImage(tileSet.pic, 33, 33, 10, 10, x, y + 40, 10, 10);
		}
		if (rightLetter == 'a' && upLetter == 'a') {
			// CORNER SHADOW ON THE RIGHt
			ctx.drawImage(tileSet.pic, 44, 33, 10, 10, x + 40, y, 10, 10);
		}
	},

	drawShooter(ctx, x, y) {
		ctx.drawImage(tileSet.pic, 99, 0, 32, 32, x, y, 40, 40);
	},

	drawFireball(ctx, x, y) {
		ctx.drawImage(tileSet.pic, 146, 16, 9, 8, x, y, 12, 12);
	},

	drawBomb(ctx, x, y, facing, frame) {
		if (facing <= 0) {
			ctx.drawImage(tileSet.pic, frame * 12, 66, 12, 14, x, y, 24, 28);
		} else {
			ctx.drawImage(tileSet.pic, frame * 12, 80, 12, 14, x, y, 24, 28);
		}
	}

 };

 export { TileSet };

 // Designed by Adam Pettys 4/10/2023