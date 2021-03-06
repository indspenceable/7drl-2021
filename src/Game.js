import { Glyph, Color, Terminal, Input } from "malwoden";
import FireManager from './FireManager.js'
import LevelMap from './LevelMap.js'

class Floor {
  constructor() {
    this.map = new LevelMap();
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
    // this.floors[this.currentFloor].fire.Step()
    var tPos = terminal.pixelToChar(pos);
    // console.log (this.floors[0].map.IsFloor(tPos))
  }
  Render(terminal) {
    var rooms = this.floors[this.currentFloor].map.rooms;
    var doors = this.floors[this.currentFloor].map.doors;
    var roomGlyph = new Glyph("#");
    var doorGlyph = new Glyph("+");

    for (var i = 0; i < rooms.length; i +=1) {
      var cr = rooms[i];
      terminal.fill(cr, {x: cr.x + cr.w, y: cr.y + cr.h}, roomGlyph);
    }
    for (var i = 0; i < doors.length; i +=1) {
      // console.log("ayy");
      terminal.drawGlyph(doors[i], doorGlyph);
    }
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
    .onMouseDown((pos) => this.ShootWater(terminal, pos));
  }
}
