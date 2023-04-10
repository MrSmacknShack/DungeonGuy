
const sprite = {
	pic: new Image(),
	runx: [],
	runy: 63,
	w: 25,
	h: 22
};
sprite.pic.src = 'spider.png';
for(let i = 1; i<=287; i+=26) {
	sprite.runx.push(i);
}

const crawling = {
	"on-right-of-wall facing up": {
		dx: 0,
		dy: -1,
		insideTurnTrigger: 'top',
		insideTurnToState: 'on-ceiling',
		insideTurnWillFace: 'right',
		attachedToTileAt: 'left',
		outsideTurnDx: -1,
		outsideTurnDy: 1,
		outsideTurnNewTileSide: 'bottom',
		outsideTurnToState: 'on-floor',
		outsideTurnWillFace: 'left'
	},
	"on-left-of-wall facing down": {
		dx: 0,
		dy: 1,
		insideTurnTrigger: 'bottom',
		insideTurnToState: 'on-floor',
		insideTurnWillFace: 'left',
		attachedToTileAt: 'right',
		outsideTurnDx: 1,
		outsideTurnDy: -1,
		outsideTurnNewTileSide: 'top',
		outsideTurnToState: 'on-ceiling',
		outsideTurnWillFace: 'right'
	},
	"on-floor facing left": {
		dx: -1,
		dy: 0,
		insideTurnTrigger: 'left',
		insideTurnToState: 'on-right-of-wall',
		insideTurnWillFace: 'up',
		attachedToTileAt: 'bottom',
		outsideTurnDx: 1,
		outsideTurnDy: 1,
		outsideTurnNewTileSide: 'right',
		outsideTurnToState: 'on-left-of-wall',
		outsideTurnWillFace: 'down'
	},
	"on-ceiling facing right": {
		dx: 1,
		dy: 0,
		insideTurnTrigger: 'right',
		insideTurnToState: 'on-left-of-wall',
		insideTurnWillFace: 'down',
		attachedToTileAt: 'top',
		outsideTurnDx: -1,
		outsideTurnDy: -1,
		outsideTurnNewTileSide: 'left',
		outsideTurnToState: 'on-right-of-wall',
		outsideTurnWillFace: 'up'
	}
};

export class Spider {

	constructor(cx, cy) {
		this.frame = 0;
		this.cx = cx;
		this.cy = cy;
		this.prevCx = cx;
		this.prevCy = cy;
		this.w = sprite.w;
		this.h = sprite.h-5;
		this.state = "falling";
		this.facing = "left";
		this.crawlSpeed = 2;
		this.fallSpeed = 4;
	}

	get x() { return this.cx - this.w/2; }
	get y() { return this.cy - this.h/2; }
	get prevX() { return this.prevCx - this.w/2; }
	get prevY() { return this.prevCy - this.h/2; }

	update(map) {
		this.frame++;
		if(this.frame >= sprite.runx.length) {
			this.frame = 0;
		}
		if(this.crawlSpeed === 0) return;

		let collide = map.getPlatformCollisions(this);
		this.prevCx = this.cx;
		this.prevCy = this.cy;

		if(this.state === "falling") {
			if(collide.bottom === false) {
				this.cy += this.fallSpeed;
			} else {
				this.cy = collide.bottom - this.h/2;
				this.state = "on-floor";
				if(this.facing !== "left" && this.facing !== "right") {
					this.facing = "left";
				}
			}
			return;
		}

		const key = `${this.state} facing ${this.facing}`;
		const c = crawling[key];
		const runIntoTile = collide[c.insideTurnTrigger] !== false;
		const stillAttachedToTile = collide[c.attachedToTileAt] !== false

		if(stillAttachedToTile && !runIntoTile) {
			this.cx += c.dx * this.crawlSpeed;
			this.cy += c.dy * this.crawlSpeed;
			return;
		}

		// If we run straight into a tile, make a simple "inside" turn.
		if(runIntoTile) {
			this.state = c.insideTurnToState;
			this.facing = c.insideTurnWillFace;
			switch(c.insideTurnTrigger) {
				case 'top' : this.cy = collide.top + this.h/2; break;
				case 'bottom': this.cy = collide.bottom - this.h/2; break;
				case 'left': this.cx = collide.left + this.w/2; break;
				case 'right': this.cx = collide.right - this.w/2; break;
			}
			return;
		}

		// the ground we are attached to isn't there anymore.
		// Try to make an outside turn: determine if we'd be
		// attached to a surface if we did that.
		collide = this.testCollide(map, c.outsideTurnDx, c.outsideTurnDy);
		if(collide[c.outsideTurnNewTileSide] === false) {
			// the surface we'd turn to isn't there, either, so fall,
			// but first move a bit forward and into the outside turn.
			this.cx += (c.dx ? c.dx : c.outsideTurnDx) * this.crawlSpeed;
			this.cy += (c.dy ? c.dy : c.outsideTurnDy) * this.crawlSpeed;
			this.state = "falling";
			return;
		}

		// Execute the "outside" turn, attaching the spider
		// to the new surface.
		switch(c.outsideTurnNewTileSide) {
			case 'top':
				this.cx += c.outsideTurnDx * this.crawlSpeed;
				this.cy = collide.top + this.h/2;
				break;
			case 'bottom':
				this.cx += c.outsideTurnDx * this.crawlSpeed;
				this.cy = collide.bottom - this.h/2;
				break;
			case 'left':
				this.cx = collide.left + this.w/2;
				this.cy += c.outsideTurnDy * this.crawlSpeed;
				break;
			case 'right':
				this.cx = collide.right - this.w/2;
				this.cy += c.outsideTurnDy * this.crawlSpeed;
				break;
		}
		this.state = c.outsideTurnToState;
		this.facing = c.outsideTurnWillFace;

	}

	/** Set up a dummy copy of this spider, move it
	 * by dx, dy, and run a collision test. This is
	 * used to determine "if we were going to try to
	 * make an outside turn, would there by a platform
	 * there to walk on?
	 *
	 * Here's an example of an outside turn, where # is
	 * a spider walking on a ceiling, moving left. The
	 * ceiling ends, but the spider can make an outside
	 * turn to go up the right-side of the wall.
	 *
	 *      +-----+
	 *      |     |
	 *      +-----+
	 *        # ->
	 **/
	testCollide(map, dx, dy) {
		const test = {
			x: this.x + this.crawlSpeed * dx,
			y: this.y + this.crawlSpeed * dy,
			prevX: this.x,
			prevY: this.y,
			w: this.w,
			h: this.h
		};
		return map.getPlatformCollisions(test);
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} scrollX
	 * @param {number} scrollY
	 */
	render(ctx, scrollX, scrollY) {

		let rotate = 0;
		let pcx = this.cx - scrollX;
		let pcy = this.cy - scrollY;
		if(this.facing === "up" && this.state === "on-right-of-wall") {
			rotate = Math.PI/2;
			pcx -= 4;
		} else if(this.facing === "right" && this.state === "on-ceiling") {
			rotate = Math.PI;
		} else if(this.facing === "down" && this.state === "on-left-of-wall") {
			rotate = Math.PI * 3/2;
			pcx += 4;
		}

		ctx.setTransform(1, 0, 0, 1, pcx, pcy);
		ctx.rotate(rotate);
		ctx.drawImage(sprite.pic, sprite.runx[this.frame], sprite.runy, sprite.w, sprite.h, -this.w/2, -this.h/2, sprite.w, sprite.h);
		ctx.rotate(0);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

}
// Designed by Adam Pettys 4/10/2023