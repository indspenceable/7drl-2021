import { Glyph, Color, Terminal, FOV, Input } from "malwoden";
import Util from './Util.js'

const INITIAL_SPARK_COUNT = 4;
const INITIAL_SPARK_HEAT = 30;

export default class FireManager {
  constructor(floor) {
    this.floor = floor;

    this.fov = new FOV.PreciseShadowcasting({
      lightPasses: (pos) => !this.floor.map.GetTile(pos).opts.blocksFire,
      topology: "four",
      cartesianRange: true,
    });
    var litTile = null;
    for (var i = 0; i < this.floor.opts.heat+3; i+=1) {
      litTile = this.LightRandomTile();
    }

    this.smallGlyph = [
      new Glyph("^", Color.LightCoral),
      new Glyph("^", Color.LightSalmon)
      // new Glyph("^", Color.LightYellow)
    ];
    this.medGlyph = [
      new Glyph("^", Color.Gold),
      // new Glyph("^", Color.IndianRed),
      new Glyph("^", Color.Orange)
    ];
    this.largeGlyph = [
      // new Glyph("^", Color.FireBrick)
      new Glyph("^", Color.OrangeRed),
      // new Glyph("^", Color.DarkOrange)
    ];
  }

  LightRandomTile() {
    var dx = Math.floor(Math.random()*20);
    var dy = Math.floor(Math.random()*20);
    this.GetTile({x:dx, y:dy}).heat = INITIAL_SPARK_HEAT;
    return this.GetTile({x:dx, y:dy})
  }

  GetTile(pos) {
    var mapTile = this.floor.map.GetTile(pos)
    return mapTile.fire;
  }

  TimeStep(player) {
    for (var x = 0; x < this.floor.map.w; x += 1) {
      for (var y = 0; y < this.floor.map.h; y +=1 ) {
        var current = this.GetTile({x,y})
        if (current.heat > 80) current.heat = 80;
        if (current.heat < 10) continue;

        if (current.cd > 0) {
          current.cd -= 1;
        } else {
          var distance = Math.floor(current.heat / 9);
          var hits = this.fov.calculateArray({x, y}, distance).filter(
            hit => !this.floor.map.GetTile(hit.pos).opts.blocksFire &&
              hit.r <= distance &&
              ((hit.pos.x != x) || (hit.pos.y != y))
          );
          var hit = Util.WeightedPick(hits,(h) => this.floor.map.GetTile(h.pos).flammabilitySquared())

          if (hit !== undefined) {
            var hitTile = this.floor.map.GetTile(hit.pos);
            var roll = Math.floor(Math.random() * 100);
            if (distance > 0 && roll < hitTile.flammabilityMultiplier() * current.heat/2) {
              var hitFireData = this.GetTile(hit.pos)

              var newHeatValue = Math.floor(hitTile.flammabilityMultiplier() * (hitFireData.heat + Math.floor(current.heat/3)) - 3);
              if (newHeatValue <= hitFireData.damp) {
                hitFireData.damp -= newHeatValue;
              } else {
                newHeatValue -= hitFireData.damp
                hitFireData.damp = 0
                if (hitFireData.heat <= 0) {
                  hitFireData.cd = Math.floor(Math.random()*10);
                }
                hitFireData.heat = newHeatValue;
              }

              current.heat *= this.floor.map.GetTile({x, y}).flammabilityMultiplier()
              current.cd = Math.floor(Math.random()*10);
            } else {
              var target = hitTile.flammabilityMultiplier() * current.heat/2
            }
          }
        }
      }
    }

    var playerHit = this.GetTile(player.pos)
    player.currentHP -= playerHit.heat
  }
  FindTile() {

  }

  Render(terminal) {
  }
}
