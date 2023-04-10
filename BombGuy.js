export class BombGuy {

	constructor(x, y, tileSet) {
		this.x = x;
		this.prevX = x;
		this.y = y + 12;
		this.prevY = y + 12;
		this.tileSet = tileSet;
		this.animationFrame = 0;
		this.lit = false;
		this.yV = 0;
		this.xV = 0;
		this.dir = 2;
		this.w = 24;
		this.h = 28;
		this.beingHeld = {is:false, player:null};
	}

	update(map) {
		if (!this.lit) {
			if (this.animationFrame >= 1.9) {
				this.animationFrame = 0;
			} else {
				this.animationFrame += 0.1;
			}
		} else {
			if (this.animationFrame >= 15.9) {
				map.addExplosion(this.x, this.y, 4);
				return "remove";
			} else {
				this.animationFrame += 0.1;
			}
		}
		this.prevX = this.x;
		this.prevY = this.y;
		this.x += this.dir;
		this.y += this.yV;
		this.x += this.xV;

		//debugger;
		const platHit = map.getPlatformCollisions(this);
		if (platHit.right && this.dir > 0 || platHit.left && this.dir < 0) {
			this.dir *= -1;
		}

		if (platHit.right) {
			this.x = platHit.right - this.w;
			this.xV = 0;
		}
		if (platHit.left) {
			this.x = platHit.left;
			this.xV = 0;
		}

		if(!platHit.bottom) {
			this.yV += map.physics.gravity;
		} else {
			this.yV = 0;
			this.xV *= map.physics.friction;
			this.y = platHit.bottom - this.h;
		}
		for (let p of map.players) {
			if (this.x + this.w > p.x && this.x < p.x + p.w && this.y + this.h> p.y && this.y < p.y + p.h && p.controller.rightTrigger || this.beingHeld.is) {
				this.x = p.x + this.w/2;
				this.y = p.y - this.h;
				this.yV = 0;
				this.lit = true;
				this.dir = 0;
				this.beingHeld.is = true;
				this.beingHeld.player = p;
			}
			if (this.beingHeld.is && this.beingHeld.player == p && !p.controller.rightTrigger) {
				this.beingHeld.is = false;
				this.xV = p.xV;
				this.yV = p.yV * 1.5;
			}
		}
	}

	render(ctx, scrollX, scrollY) {
		this.tileSet.drawBomb(ctx, this.x - scrollX, this.y - scrollY, this.dir, Math.floor(this.animationFrame));
	}

}

// Designed by Adam Pettys 4/10/2023