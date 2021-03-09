import { Glyph } from "malwoden";
import Util from './Util.js'

class Civilian {}

export default class RescuesManager {
  constructor(floor) {
    this.priority = 125;
    this.floor = floor;
    this.civs = []
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
  }
  TimeStep(player) {
  }
}
