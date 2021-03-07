import { Glyph, Input, FOV } from "malwoden";
import FireManager from './FireManager.js'
import LevelMap from './LevelMap.js'
import Util from './Util.js'
import Player from './Player.js'

class Floor {
  constructor() {
    this.map = new LevelMap(30, 30, 14);
    this.fire = new FireManager(this);
    this.systems = [this.fire];
  }
  Foo(){}
}

export default class Game{
  constructor() {
    this.floors = [
      new Floor()
    ]
    this.currentFloor = 0;
    this.player = new Player(this.GetCurrentFloor().map.upstairs, this);
    // this.ppos =
  }
  Hover(terminal, pos) {
    this.player.Hover(terminal, pos)
  }

  GetCurrentFloor() {
    return this.floors[this.currentFloor];
  }

  Render(terminal) {
    var cf = this.GetCurrentFloor();
    cf.map.Render(terminal)
    var systems = cf.systems;
    for (var i = 0; i < systems.length; i +=1) {
      var system = systems[i];
      system.Render(terminal);
    }
    this.player.Render(terminal);
  }
  attemptMove(dx, dy) {
    var cf = this.GetCurrentFloor();
    var ppos = this.player.pos;
    var ttile = {x: ppos.x + dx, y: ppos.y + dy}
    if (!cf.map.GetTile(ttile).blocksMovement) {
      this.player.pos = ttile;
      this.TimeStep();
    }
  }

  TimeStep() {
    var systems = this.GetCurrentFloor().systems;
    for (var i = 0; i < systems.length; i +=1) {
      var system = systems[i];
      system.TimeStep(this.player);
    }
    this.player.TimeStep();
  }


  ShootOil(terminal, pos) {
    var tPos = terminal.pixelToChar(pos);

    var radius = 0;
    for (var i = -radius; i < 1+radius; i += 1) {
      for (var j = -radius; j < 1+radius; j += 1) {
        var cf = this.floors[this.currentFloor]
        if (cf.map.InBounds(tPos)) {
          var tile = cf.map.GetTile({x: tPos.x+i, y: tPos.y+j});
          tile.glyph = new Glyph("_");
          tile.flammability = 200;
        }
      }
    }
    // cf.fire.TimeStep();
  }

  BuildKeyboardContext() {
    return new Input.KeyboardContext()
      .onDown(Input.KeyCode.DownArrow, () => this.attemptMove(0, 1))
      .onDown(Input.KeyCode.LeftArrow, () => this.attemptMove(-1, 0))
      .onDown(Input.KeyCode.RightArrow, () => this.attemptMove(1, 0))
      .onDown(Input.KeyCode.UpArrow, () => this.attemptMove(0, -1))
      .onDown(Input.KeyCode.S, () => this.attemptMove(0, 1))
      .onDown(Input.KeyCode.A, () => this.attemptMove(-1, 0))
      .onDown(Input.KeyCode.D, () => this.attemptMove(1, 0))
      .onDown(Input.KeyCode.W, () => this.attemptMove(0, -1))
      .onDown(Input.KeyCode.Space, () => this.attemptMove(0, 0))
      .onDown(Input.KeyCode.Period, () => this.attemptMove(0, 0))
  }
  BuildMouseContext(terminal) {
    return new Input.MouseContext()
      .onMouseDown((pos) => this.player.mouseDown(terminal, pos))
    ;
  }
}
