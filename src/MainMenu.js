import { CharCode, Color, Terminal, Input } from "malwoden";
import Game from './Game.js';
import GameMount from './GameMount.js'

export default class MainMenu{
  constructor() {
    this.selection = 0;
    this.options = [
      {label: "Test Bed", cb: this.NewGame},
      // {label: "new game (3 stories)", exec: () => {}}
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
  Hover(pos){

  }

  BuildKeyboardContext() {
    return new Input.KeyboardContext()
      .onDown(Input.KeyCode.DownArrow, () => this.ChangeSelection(1))
      // .onDown(Input.KeyCode.LeftArrow, () => attemptMove(-1, 0))
      // .onDown(Input.KeyCode.RightArrow, () => attemptMove(1, 0))
      .onDown(Input.KeyCode.UpArrow, () => this.ChangeSelection(-1))
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
  NewGame() {
    GameMount.SetNewInputHandler(new Game());
  }
}

