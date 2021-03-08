import { Glyph, Color } from "malwoden";
import Util from './Util.js'

const CONFIG = {
  radius: 3,
  heat: 20
}

export default class ExplosivesManager {
  constructor(floor) {
    this.priority = 40;
    this.floor = floor;
    this.barrels = []
    while(this.barrels.length < this.floor.opts.rescues){
      var newBarrel = this.floor.map.builder.RandomFloor()
      if (!this.barrels.some(c => Util.EqPt(newBarrel, c))) {
        this.barrels.push(newBarrel)
        var tile = this.floor.map.GetTile(newBarrel);
        tile.opts.flammability += 50;
        tile.opts.blocksMovement=true;
      }
    }
  }
  Render(terminal) {
    for (var i = 0; i < this.barrels.length; i +=1) {
      terminal.drawGlyph(this.barrels[i], new Glyph("O", Color.Black, Color.Red))
    }
  }
  TimeStep(player) {
    for (var i = 0; i < this.barrels.length; i +=1) {
      var c = this.barrels[i]
      var tile = this.floor.map.GetTile(c);
      var roll = (Math.random() * 50) + 25;
      // console.log(roll);
      if (tile.fire.heat > roll) {
        for (var dx = -CONFIG.radius; dx <= CONFIG.radius; dx+=1){
          for (var dy = -CONFIG.radius; dy <= CONFIG.radius; dy+=1){
            if (dx*dx + dy*dy <= CONFIG.radius) {
              this.floor.map.GetTile({x: c.x+dx, y: c.y+dy}).fire.heat += Math.floor(Math.random() * CONFIG.heat);
            }
          }
        }
        this.barrels.splice(i, 1);
        i -= 1;
      }
    }
  }
}
