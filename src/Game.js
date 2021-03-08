import { Glyph, Input, FOV } from "malwoden";

import Player from './Player.js'
import Floor from './Floor.js'

export default class Game{
  constructor(opts) {
    this.opts = {...opts}
    this.floors = []
    for (var i = 0; i < opts.floors; i += 1) {
      this.floors.push(new Floor({...opts.floor, heat:i}))
    }
    this.currentFloor = 0;
    this.player = new Player(this.GetCurrentFloor().map.upstairs, this);

  }
  Hover(terminal, pos) {
    this.player.Hover(terminal, pos)
  }

  GetCurrentFloor() {
    return this.floors[this.currentFloor];
  }



  glyphFor(tile) {}

  SortedSystems() {
    var [...systems] = this.GetCurrentFloor().systems;
    systems.push(this.player);
    systems.sort((a,b) => {
      if (a.priority < b.priority) {
        return -1;
      } else if (a.priority > b.priority) {
        return 1;
      } else {
        return 0;
      }
    });
    return systems;
  }

  Render(terminal) {
    this.player.calculateVisibleTiles()

    var cf = this.GetCurrentFloor();
    // render the map
    cf.Render(terminal, this.player);

    var systems = this.SortedSystems();
    for (var i = 0; i < systems.length; i +=1) {
      var system = systems[i];
      system.Render(terminal);
    }
  }


  TimeStep(count = 1) {
    for (var j = 0; j < count ;j += 1) {
      var systems = this.SortedSystems();
      for (var i = 0; i < systems.length; i +=1) {
        var system = systems[i];
        system.TimeStep(this.player);
      }
      // this.player.TimeStep();
    }
  }


  ShootOil(terminal, pos) {
    // var tPos = terminal.pixelToChar(pos);

    // var radius = 0;
    // for (var i = -radius; i < 1+radius; i += 1) {
    //   for (var j = -radius; j < 1+radius; j += 1) {
    //     var cf = this.floors[this.currentFloor]
    //     if (cf.map.InBounds(tPos)) {
    //       var tile = cf.map.GetTile({x: tPos.x+i, y: tPos.y+j});
    //       tile.glyph = new Glyph("_");
    //       // tile.flammability = 200;
    //     }
    //   }
    // }
    // cf.fire.TimeStep();
  }

  BuildKeyboardContext() {
    return new Input.KeyboardContext()
      .onDown(Input.KeyCode.DownArrow,  () => this.player.attemptMove(0, 1))
      .onDown(Input.KeyCode.LeftArrow,  () => this.player.attemptMove(-1, 0))
      .onDown(Input.KeyCode.RightArrow, () => this.player.attemptMove(1, 0))
      .onDown(Input.KeyCode.UpArrow,    () => this.player.attemptMove(0, -1))
      .onDown(Input.KeyCode.S,          () => this.player.attemptMove(0, 1))
      .onDown(Input.KeyCode.A,          () => this.player.attemptMove(-1, 0))
      .onDown(Input.KeyCode.D,          () => this.player.attemptMove(1, 0))
      .onDown(Input.KeyCode.W,          () => this.player.attemptMove(0, -1))

      .onDown(Input.KeyCode.Space,      () => this.TimeStep( 1))
      .onDown(Input.KeyCode.Period,     () => this.TimeStep( 1))
      .onDown(Input.KeyCode.Five,       () => this.TimeStep(50))

      .onDown(Input.KeyCode.Q,          () => this.player.changeWeapon( 1))
      .onDown(Input.KeyCode.E,          () => this.player.changeWeapon(-1))

  }
  BuildMouseContext(terminal) {
    return new Input.MouseContext()
      .onMouseDown((pos) => this.player.mouseDown(terminal, pos))
    ;
  }
}
