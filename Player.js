
const animation = {
	idle:{start:0, end:12, y:0, delay:6, stop:false},
	run:{start:0, end:7, y:1, delay:4, stop:false},
	attack1:{start:0, end:9, y:2, delay:4, stop:false},
	attack2:{start:0, end:10, y:3, delay:3, stop:false},
	attack3:{start:0, end:9, y:4, delay:2, stop:false},
	jump:{start:0, end:4, y:5, delay:10, stop:true},
	hurt:{start:0, end:3, y:6, delay:6, stop:false},
	death:{start:0, end:6, y:7, delay:6, stop:true},
	duck:{start:7, end:9, y:7, delay:6, stop:true}
};

export class Player {

	constructor(x, y, map) {
		this.controller = null;
		this.map = map;
		this.health = 100;

		// The number of frames remaining that the player is
		// stunned for.
		this.stunned = 0;
		this.maxSpeed
		this.x = x;
		this.y = y;
		this.prevX = x;
		this.prevY = y;
		this.w = 38;
		this.h = 75;
		this.color = 'red';
		this.xV = 0;
		this.yV = 0;
		this.canMove = {left:true, right:true};
		this.jumpFrame = 8;
		this.onGround = false;
		this.debugMessage =  '';
		this.doorEnteredFrame = 0;
		this.player1Image = {pic:new Image(), sourceSizeX:32, sourceSizeY:32};
		this.player1Image.pic.src = 'p1SpriteSheet.png';
		this.doorAnimation = null;
	}

	update(map) {
		// If stunned, disable all player inputs
		let ctrl;
		if(this.stunned <= 0) {
			this.controller.update();
			ctrl = this.controller;
		} else {
			this.stunned--;
			ctrl = {};
		}

		if(this.doorAnimation) {
			this.advanceDoorAnimation();
			return;
		}

		if (ctrl == null) {
			ctrl = {};
		}

		if (ctrl.right && this.canMove.right) {
			this.xV++;
			if (this.xV >= this.map.physics.maxSpeed) {
				this.xV = this.map.physics.maxSpeed;
			}
		}

		if (ctrl.left && this.canMove.left) {
			this.xV--;
			if (this.xV <= -this.map.physics.maxSpeed) {
				this.xV = -this.map.physics.maxSpeed;
			}
		}

		// jumpFrame: how many frames the user has been holding JUMP
		// button for; 7 is the max, so once jumpFrame hits 7, the
		// jump button has no effect.

		if (ctrl.b) {
			if (this.jumpFrame < 8 || this.onGround) {
				this.yV = this.map.physics.jumpHeight;
				this.jumpFrame++;
			}
		} else {
			this.jumpFrame = 8;
		}

		this.prevX = this.x;
		this.prevY = this.y;
		this.x += this.xV;
		this.y += this.yV;

		this.checkDoors(ctrl, map.doors);
		if(this.doorAnimation) {
			return;
		}

		let playerPlatHit = this.map.getPlatformCollisions(this);
		if(playerPlatHit.top !== false) {
			this.jumpFrame = 8;
		}

		this.onGround = playerPlatHit.bottom !== false;
		if (playerPlatHit.bottom !== false) {
			this.y = playerPlatHit.bottom - this.h;
			this.yV = 0;
		} else if(playerPlatHit.top !== false) {
			this.y = playerPlatHit.top + 1;
			this.yV = 0;
		}
		this.canMove.right = true;
		if (playerPlatHit.right !== false) {
			this.x = playerPlatHit.right - this.w;
			this.xV = 0;
			this.canMove.right = false;
		}
		this.canMove.left = true;
		if (playerPlatHit.left !== false) {
			this.x = playerPlatHit.left;
			this.xV = 0;
			this.canMove.left =false;
		}

		if (this.onGround) {
			this.jumpFrame = 0;
			if (!ctrl.left && !ctrl.right) {
				this.xV *= this.map.physics.friction;
			}
		} else {
			this.yV += this.map.physics.gravity;
		}
	}

	checkDoors(controller, doors) {
		if (!controller.up || this.doorEnteredFrame <= 20) {
			this.doorEnteredFrame++;
			return;
		}

		for (let door of doors) {
			if (this.x <= door.firstDoorX + 40 && this.x + this.w >= door.firstDoorX && this.y <= door.firstDoorY + 40 && this.y + this.h >= door.firstDoorY && this.y + this.h == door.firstDoorY + 80) {
				const otherDoor = door.findConnectingDoor(doors);
				this.doorAnimation = {
					startX: this.x,
					fromX: door.firstDoorX,
					toX: otherDoor.firstDoorX,
					toY: otherDoor.firstDoorY,
					animationFrame: 0
				};
				break; // don't need to check other doors.
			}
		}
	}

	advanceDoorAnimation() {
		const sequence1 = 30;
		const sequence2 = 60;
		this.doorAnimation.animationFrame++;
		let fromX, toX, totalFrames, atFrame;
		if(this.doorAnimation.animationFrame < sequence1) {
			this.doorAnimation.sequence = 1;
			fromX = this.doorAnimation.startX;
			toX = this.doorAnimation.fromX + 50;
			totalFrames = sequence1;
			atFrame = this.doorAnimation.animationFrame;
		} else if(this.doorAnimation.animationFrame < sequence1 + sequence2) {
			this.doorAnimation.sequence = 2;
			fromX = this.doorAnimation.fromX + 50;
			toX = this.doorAnimation.fromX - 10;
			totalFrames = sequence2;
			atFrame = this.doorAnimation.animationFrame - sequence1;
		} else {
			// done with door animation
			this.x = this.doorAnimation.toX;
			this.y = this.doorAnimation.toY;
			this.prevX = this.x;
			this.prevY = this.y;
			this.xV = 0;
			this.yV = 0;
			this.doorEnteredFrame = 0;
			this.doorAnimation = null;
			return;
		}

		this.x = fromX + (toX - fromX) / totalFrames * atFrame;
		this.prevX = this.x;
		// Put player behind the door
		if(this.doorAnimation.sequence === 2) {
			this.doorAnimation.clipLeft = fromX - this.x + 26;
		}
	}

	explosion(pixelX, pixelY, size) {
		size = size * 40; // convert tile size to pixel size
		const cx = this.x + this.w/2;
		const cy = this.y + this.h/2;
		const dist = this.map.distance(cx, cy, pixelX, pixelY);
		if(dist >= size) return;
		const maxDamage = size * 6;
		if(dist < 1) this.takeDamage(maxDamage);
		else this.takeDamage(maxDamage/dist);
		this.xV = (cx - pixelX) / dist * this.map.physics.maxSpeed;
		this.yV = (cy - pixelY) / dist * this.map.physics.maxSpeed;
		this.stunned = 30;
	}

	takeDamage(damage) {
		this.health = Math.max(0, this.health - damage);
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} scrollX
	 * @param {number} scrollY
	 */
	render(ctx, scrollX, scrollY) {
		ctx.imageSmoothingEnabled = false;
		const sprite = this.player1Image;

		let clipLeft = 0;
		if(this.doorAnimation && this.doorAnimation.clipLeft) {
			clipLeft = this.doorAnimation.clipLeft;
		}

		let srcX = 0;
		let srcY = 0;
		if(this.stunned>0) {
			srcX = 32;
			srcY = 192;
		}

		ctx.drawImage(
			sprite.pic,
			srcX + clipLeft/4,
			srcY,
			sprite.sourceSizeX - clipLeft/4,
			sprite.sourceSizeY,
			this.x - 36 - scrollX + clipLeft,
			this.y - 48 - scrollY,
			sprite.sourceSizeX * 4 - clipLeft,
			sprite.sourceSizeY * 4);

		// draw health bar
		const radius = 40;
		const center = radius + 15;
		ctx.beginPath();
		ctx.strokeStyle = "transparent";
		ctx.fillStyle = "rgba(0, 0, 190, .4)";
		ctx.ellipse(center, center, radius, radius, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.beginPath();
		ctx.fillStyle = "rgba(0, 190, 0, .8)";
		ctx.moveTo(center, center);
		ctx.arc(center, center, radius, -Math.PI/2, -Math.PI/2 + 2 * Math.PI * this.health / 100);
		ctx.lineTo(center, center);
		ctx.fill();
	}
}

// Designed by Adam Pettys 4/10/2023