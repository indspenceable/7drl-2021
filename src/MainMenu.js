import { CharCode, Color, Terminal, Input } from "malwoden";
import Game from './Game.js';
import GameMount from './GameMount.js'

var EZ = {
  floors: 3,
  floor: {
    w: 20,
    h: 30,
    iterations:8,
    resuces:2,
    barrels:2,
    sparks_base: 10,
    sparks_per_floor: 5,
  },
  fov: true,
  scaling: 2
}


var EZ = {
  floors: 5,
  floor: {
    w: 20,
    h: 30,
    iterations:7,
    resuces:2,
    barrels:2,
    sparks_base: 5,
    sparks_per_floor: 3,
  },
  fov: true,
  scaling: 2
}

export default class MainMenu{
  constructor() {
    this.selection = 0;
    this.options = [
      {label: "Normal", cb: () => this.NewGame(EZ)},
      {label: "Hard",   cb: () => this.NewGame(HardMode)}
    ]
  }

  WriteCentered(terminal, pos, str) {
    var p = {x: pos.x - Math.floor(str.length/2), y: pos.y};
    // console.log(p)
    terminal.writeAt(p, str)
  }

  padString (str, length, char = ' ') {
    return str.padStart((str.length + length) / 2, char).padEnd(length, char);
  }

  Render(terminal) {
    this.WriteCentered(terminal, {x:25, y:0}, "FireFighter RL")
    for (var i = 0; i < this.options.length; i += 1) {
      if (this.selection == i) {
        this.WriteCentered(terminal, {x:25, y:i+3}, "*-  "+this.padString(this.options[i].label, 10, ' ')+"  -*");
      } else {
        this.WriteCentered(terminal, {x:25, y:i+3}, this.options[i].label);
      }
    }
  }
  Hover(terminal, pos){

  }

  BuildKeyboardContext() {
    return new Input.KeyboardContext()
      .onDown(Input.KeyCode.DownArrow, () => this.ChangeSelection(1))
      .onDown(Input.KeyCode.UpArrow, () => this.ChangeSelection(-1))
      .onDown(Input.KeyCode.S, () => this.ChangeSelection(1))
      .onDown(Input.KeyCode.W, () => this.ChangeSelection(-1))
      .onDown(Input.KeyCode.Space, () => this.ExecuteSelection());
  }
  BuildMouseContext() {
    return new Input.MouseContext();
  }

  ChangeSelection(delta) {
    this.selection = (this.selection + delta + this.options.length) % this.options.length;
  }
  ExecuteSelection() {
    // console.log("ayy");
    this.options[this.selection].cb();
  }
  NewGame(opts) {
    GameMount.SetNewInputHandler(new Game(opts));
  }
}

