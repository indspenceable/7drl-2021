import { Glyph, Color, Terminal, FOV, Input } from "malwoden";
import Util from './Util.js'

// const INITIAL_SPARK_COUNT = 1;
const INITIAL_SPARK_HEAT = 3;

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
    var count = (floor.opts.sparks_base + floor.opts.sparks_per_floor*floor.opts.heat);

    for (var i = 0; i < count; i+=1) {
      litTile = this.LightRandomTile();
    }
    // for (var i = 0; i < count; i +=1)
    //   this.TimeStep();
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
    // console.log("TIme stepping for fire..")
    for (var x = 0; x < this.floor.map.w; x += 1) {
      for (var y = 0; y < this.floor.map.h; y +=1 ) {
        var current = this.GetTile({x,y})
        var mapTile = this.floor.map.GetTile({x,y})

        if (current.damp > 0 && current.heat > 0) {
          if (Math.random() * 100 < current.damp*5) {
            current.heat -= 1;
            current.damp -= 1;
          }
        }
        if (mapTile.Feature != null && current.heat >= 1) {
          if (mapTile.Feature.Nonburning)
            current.heat = 0;
          else {
            var roll = Math.random() * 10;
            console.log( roll);
            console.log(5*current.heat)
            if (roll < 5*current.heat){
              var burn = mapTile.Feature.burn
              // console.log(burn);
              // console.log(mapTile);
              if (burn != undefined){
                burn(player, mapTile);
              }
            }
          }
        }


        if (current.heat == 0) {
          // console.log("no heat");
        } else if (current.cd > 0) {
          current.cd -= 1;
          // console.log("cd" + current.cd)
        } else if (current.heat == 1) {
          if (Math.random() * 100 < 1) current.heat = 0;
        } else {
          var distance = (current.heat * current.heat);
          var hits = this.fov.calculateArray({x, y}, distance)
          var closeHits = hits.filter(h => h.r <= distance);
          var hit = Util.Pick(hits);
          var roll = Math.floor(Math.random() * 100);
          if (roll == 0 && current.heat==3) {
            var hit2 = Util.Pick(hits)
            var hitFireData2 = this.GetTile(hit2.pos)
            hitFireData2.heat = Math.max(hitFireData2.heat,2);
          }
          if (hit !== undefined & (roll < (distance-hit.r)*10)) {
            var hitTile = this.floor.map.GetTile(hit.pos);
            var hitFireData = this.GetTile(hit.pos)

            if (hitTile.damp > 0 && Math.Random()*10 < hitTile.damp) {
              hitTile.damp -= 1;
            }
            else
            {
              hitFireData.cd = Math.floor(Math.random(5));
              hitFireData.heat = Math.max(hitFireData.heat,1);
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
