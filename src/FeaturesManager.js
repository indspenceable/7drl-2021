import { Glyph, Color } from "malwoden";
import Util from './Util.js'

const CONFIG = {
  radius: 3,
  heat: 20
}

class ExplosiveBarrel{}

export default class FeaturesManager {
  constructor(floor) {
    this.priority = 40;
    this.floor = floor;
    this.barrels = []
    while(this.barrels.length < this.floor.opts.barrels){
      var newBarrel = this.floor.map.builder.RandomFloor()
      var newBarrelTile = this.floor.map.GetTile(newBarrel);
      if (newBarrelTile.Feature == null) {
        this.barrels.push(newBarrel)
        newBarrelTile.Feature = {
          blocksMovement: true,
          g: "O",
          c:Color.Black,
          bg:Color.Green
        };
      }
    }
    while(this.civs.length < this.floor.opts.rescues){
      this.SpawnRescue();
    }
  }
  SpawnRescue() {
    var newCiv = this.floor.map.builder.RandomFloor()
    var civTile = this.floor.map.GetTile(newCiv)
    if (civTile.Feature == null) {
      this.civs.push(newCiv)
      var that = this;
      civTile.Feature = {
        g: "@",
        blocksMovement: false,
        bump: (player) => {
          player.log.Display("You rescued a civilian.")
          player.rescues +=1
          that.civs = that.civs.filter(civ => !Util.EqPt(civ, newCiv))
        }
      };
    }
  }
  Render(terminal) {
    // for (var i = 0; i < this.barrels.length; i +=1) {
    //   terminal.drawGlyph(this.barrels[i], new Glyph("O", Color.Black, Color.Red))
    // }
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
