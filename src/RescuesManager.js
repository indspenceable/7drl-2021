import { Glyph } from "malwoden";
import Util from './Util.js'

export default class RescuesManager {
  constructor(floor) {
    this.priority = 125;
    this.floor = floor;
    this.civs = []
    while(this.civs.length < this.floor.opts.rescues){
      var newCiv = this.floor.map.builder.RandomFloor()
      if (!this.civs.some(c => Util.EqPt(newCiv, c))) {
        this.civs.push(newCiv)
      }
    }
  }
  Render(terminal) {
    for (var i = 0; i < this.civs.length; i +=1) {
      terminal.drawGlyph(this.civs[i], new Glyph("@"))
    }
  }
  TimeStep(player) {
    // console.log("YO");
    // for (int i = 0: i < this.civs.length; i +=1){
      var civ = this.civs.find(c=> Util.EqPt(c, player.pos))
      // console.log("Yeel");
      if (civ !== undefined) {
        this.civs.splice(this.civs.indexOf(civ), 1)
        player.rescues += 1;
      }
    // }
  }
}
