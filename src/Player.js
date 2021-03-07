import { Glyph, Color, Input, FOV } from "malwoden";
import Util from './Util.js'

var PlayerGlyph = new Glyph("@", Color.Yellow)

export default class Player {
  constructor(pos, game) {
    this.pos = pos
    this.attackRange = 5;
    this.hover = {
      inRange: false,
      target: pos
    }
    this.game = game

    this.losCheck = new FOV.PreciseShadowcasting({
      lightPasses: (pos) => !this.game.GetCurrentFloor().map.GetTile(pos).blocksMovement,
      topology: "eight",
      cartesianRange: true,
    });

    this.currentHP = 100;
  }
  Hover(terminal, pos) {
    var tPos = terminal.pixelToChar(pos);
    var visibleTiles = this.losCheck.calculateArray({x:this.pos.x, y:this.pos.y}, this.attackRange)
    this.hover = {
      inRange: Util.distance(tPos, this.pos)<this.attackRange,
      target: tPos,
      inSight: visibleTiles.find(hit => hit.pos.x == tPos.x && hit.pos.y == tPos.y),
      inBounds: this.game.GetCurrentFloor().map.InBounds(tPos)
    }
  }
  mouseDown(terminal, pos) {
    var tPos = terminal.pixelToChar(pos);
    var visibleTiles = this.losCheck.calculateArray({x:this.pos.x, y:this.pos.y}, this.attackRange)
    this.hover = {
      inRange: Util.distance(tPos, this.pos)<this.attackRange,
      target: tPos,
      inSight: visibleTiles.find(hit => hit.pos.x == tPos.x && hit.pos.y == tPos.y),
      inBounds: this.game.GetCurrentFloor().map.InBounds(tPos)
    }
    if (this.hover.inRange && this.hover.inSight && this.hover.inBounds) {
      this.ShootWater(tPos)
    }
  }

  ShootWater(tPos) {
    console.log("shooting water!");
    var cf = this.game.GetCurrentFloor()
    for (var i = -1; i < 2; i += 1) {
      for (var j = -1; j < 2; j += 1) {
        if (cf.map.InBounds(tPos)) {
          var tile = cf.map.GetTile({x: tPos.x+i, y: tPos.y+j});
          tile.fire.heat -= 5;
        }
      }
    }
  }


  TimeStep() {

  }
  Render(terminal) {
    // var visibleTiles = this.losCheck.calculateArray({x:this.pos.x, y:this.pos.y}, 30)

    // for (var i = 0; i < this.game.GetCurrentFloor().map.w; i += 1) {
    //   for (var j = 0; j < this.game.GetCurrentFloor().map.h; j += 1) {
    //     if (visibleTiles.find(hit => hit.pos.x == i && hit.pos.y == j) === undefined) {
    //       terminal.drawGlyph({x: i, y: j}, new Glyph(" "))
    //     }
    //   }
    // }

    // var color = Color.Red
    if (this.hover.inRange && this.hover.inSight && this.hover.inBounds) {
      // color = Color.Green
      var line = Util.lineBetween(this.pos, this.hover.target);
      for(var i = 0 ; i < line.length; i +=1) {
        var current = line[i];
        terminal.drawGlyph(current, new Glyph('+', Color.Green))
      }
    }
    terminal.drawGlyph(this.pos, PlayerGlyph);

    terminal.writeAt({x:31, y:0}, "hp: " + this.currentHP + "/ 100");
  }
}
