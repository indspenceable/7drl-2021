import { Glyph, Color, Terminal, Input } from "malwoden";
import FireManager from './FireManager.js'
import LevelMap from './LevelMap.js'

class Floor {
  constructor() {
    this.map = new LevelMap(20, 20, 7);
    this.fire = new FireManager(this.map);
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
  }
  Hover(terminal, pos) {
    var tPos = terminal.pixelToChar(pos);
  }

  GetCurrentFloor() {
    return this.floors[this.currentFloor];
  }

  Render(terminal) {
    this.GetCurrentFloor().map.Render(terminal)
    var systems = this.floors[this.currentFloor].systems;
    for (var i = 0; i < systems.length; i +=1) {
      var system = systems[i];
      system.Render(terminal);
    }
  }
  attemptMove(dx, dy) {
    var systems = this.floors[this.currentFloor].systems;
    for (var i = 0; i < systems.length; i +=1) {
      var system = systems[i];
      system.Step();
    }
  }

  ShootWater(terminal, pos) {
    var tPos = terminal.pixelToChar(pos);
    // console.log(tPos);
    // console.log(pos);
    for (var i = -1; i < 2; i += 1) {
      for (var j = -1; j < 2; j += 1) {
        var cf = this.floors[this.currentFloor]
        if (cf.map.InBounds(tPos)) {
          var tile = cf.fire.GetTileAt({x: tPos.x+i, y: tPos.y+j});
          console.log(tile);
          tile.heat -= 5;
          console.log(cf.fire.GetTileAt({x: tPos.x+i, y: tPos.y+j}));
        }
      }
    }
    cf.fire.Step();
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
    // cf.fire.Step();
  }

  BuildKeyboardContext() {
    return new Input.KeyboardContext()
      .onDown(Input.KeyCode.DownArrow, () => this.attemptMove(0, 1))
      .onDown(Input.KeyCode.LeftArrow, () => this.attemptMove(-1, 0))
      .onDown(Input.KeyCode.RightArrow, () => this.attemptMove(1, 0))
      .onDown(Input.KeyCode.Space, () => this.attemptMove(0, 0))
      .onDown(Input.KeyCode.UpArrow, () => this.attemptMove(0, -1))
      .onDown(Input.KeyCode.Space,() => this.floors[this.currentFloor].fire.Step());
  }
  BuildMouseContext(terminal) {
    return new Input.MouseContext()
    .onMouseDown((pos) => this.ShootOil(terminal, pos));
  }
}
