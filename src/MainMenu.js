import { CharCode, Color, Terminal, Input } from "malwoden";
import Game from './Game.js';
import GameMount from './GameMount.js'

var OPTS_NO_FOV = {
  floors: 5,
  floor: {
    w: 25,
    h: 30,
    iterations: 8,
  },
  fov: false

}
var OPTS_YES_FOV = {
  ...OPTS_NO_FOV,
  fov: true,
}

export default class MainMenu{
  constructor() {
    this.selection = 0;
    this.options = [
      {label: "5 Stories,  no fov", cb: () => this.NewGame(OPTS_NO_FOV)},
      {label: "5 Stories, yes fov", cb: () => this.NewGame(OPTS_YES_FOV)}
    ]
  }

  Render(terminal) {
    terminal.writeAt({x:0, y:0}, "Firefighter RL");
    for (var i = 0; i < this.options.length; i += 1) {
      if (this.selection == i) {
        terminal.writeAt({x:0, y:i+1}, "* " + this.options[i].label);
      } else {
        terminal.writeAt({x:0, y:i+1}, "  " + this.options[i].label);
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

