export class GamepadController {

	constructor(number) {
		this.gamepadNumber = number;
		this.update();
	}

	update() {
		const gamepads = navigator.getGamepads()
		this.b = gamepads[this.gamepadNumber].buttons[0].pressed;
		this.a = gamepads[this.gamepadNumber].buttons[1].pressed;
		this.y = gamepads[this.gamepadNumber].buttons[2].pressed;
		this.x = gamepads[this.gamepadNumber].buttons[3].pressed;
		this.leftTrigger = gamepads[this.gamepadNumber].buttons[4].pressed;
		this.rightTrigger = gamepads[this.gamepadNumber].buttons[5].pressed;
		this.undefined1 = gamepads[this.gamepadNumber].buttons[6].pressed;
		this.undefined2 = gamepads[this.gamepadNumber].buttons[7].pressed;
		this.select = gamepads[this.gamepadNumber].buttons[8].pressed;
		this.start = gamepads[this.gamepadNumber].buttons[9].pressed;
		this.undefined3 = gamepads[this.gamepadNumber].buttons[10].pressed;
		this.undefined4 = gamepads[this.gamepadNumber].buttons[11].pressed;
		this.up = gamepads[this.gamepadNumber].buttons[12].pressed;
		this.down = gamepads[this.gamepadNumber].buttons[13].pressed;
		this.left = gamepads[this.gamepadNumber].buttons[14].pressed;
		this.right = gamepads[this.gamepadNumber].buttons[15].pressed;
	}

}

export class WASDController {

	constructor(keysDown) {
		this.keysDown = keysDown;
	}

	update() {
		this.left = this.keysDown.KeyA;
		this.right = this.keysDown.KeyD;
		this.up = this.keysDown.KeyW;
		this.rightTrigger = this.keysDown.KeyF;
		this.b = this.keysDown.Space;
	}

}
// Designed by Adam Pettys 4/10/2023