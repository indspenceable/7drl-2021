import { Glyph, Color, Terminal, FOV, Input } from "malwoden";
import Util from './Util.js'

const INITIAL_SPARK_COUNT = 1;
const INITIAL_SPARK_HEAT = 4;

export default class FireManager {
  constructor(floor) {
    this.priority = 25;
    this.floor = floor;

    this.fov = new FOV.PreciseShadowcasting({
      lightPasses: (pos) => !this.floor.map.GetTile(pos).blocksFire(),
      topology: "four",
      cartesianRange: true,
    });
    var litTile = null;
    for (var i = 0; i < INITIAL_SPARK_COUNT; i+=1) {
      litTile = this.LightRandomTile();
    }
  }

  LightRandomTile() {
    var dx = Math.floor(Math.random()*20);
    var dy = Math.floor(Math.random()*20);
    this.GetTile({x:dx, y:dy}).heat = INITIAL_SPARK_HEAT
    return this.GetTile({x:dx, y:dy})
  }

  GetTile(pos) {
    var mapTile = this.floor.map.GetTile(pos)
    return mapTile.fire;
  }

  TimeStep(player) {
    console.log("TIme stepping for fire..")
    for (var x = 0; x < this.floor.map.w; x += 1) {
      for (var y = 0; y < this.floor.map.h; y +=1 ) {
        var current = this.GetTile({x,y})
        var mapTile = this.floor.map.GetTile({x,y})

        if (current.heat == 0) {
          // console.log("no heat");
        } else if (current.cd > 0) {
          current.cd -= 1;
          // console.log("cd" + current.cd)
        } else {
          if (current.heat == 1) {
            if (Math.random() * 100 < 30) current.heat = 0;
          } else {
            var distance = current.heat * current.heat;
            var hits = this.fov.calculateArray({x, y}, distance);
            var hit = Util.Pick(hits);
            var roll = Math.random() * 100;
            if (hit !== undefined & roll < 30) {
              var hitTile = this.floor.map.GetTile(hit.pos);
              var hitFireData = this.GetTile(hit.pos)
              hitFireData.cd = Math.floor(Math.random(5));
              hitFireData.heat = Math.max(hitFireData.heat,current.heat-1);
            }
          }
          current.cd = Math.floor(Math.random(5));
        }
      }
    }

    // var playerHit = this.GetTile(player.pos)
    // if (playerHit.heat > 1) {
    //   player.log.Display("You burn for " + playerHit.heat + " hp.")
    //   player.currentHP -= Math.floor(playerHit.heat)
    // }
  }
  FindTile() {

  }

  Render(terminal) {
  }
}
