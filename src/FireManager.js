import { Glyph, Color, Terminal, FOV, Input } from "malwoden";
import Util from './Util.js'

const INITIAL_SPARK_COUNT = 25;
const INITIAL_SPARK_HEAT = 10;

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
    for (var i = 0; i < this.floor.opts.heat+INITIAL_SPARK_COUNT; i+=1) {
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
    this.GetTile({x:dx, y:dy}).heat += INITIAL_SPARK_HEAT;
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
        if (current.heat > 80) current.heat = 80;
        // if (current.heat < 2) continue;

        if (current.cd > 0) {
          current.cd -= 1;
        } else {

          var distance = Math.floor(current.heat / 30)+1;
          var hits = this.fov.calculateArray({x, y}, distance).filter(
            hit => (hit.r <= distance)
          );

          var hit = Util.WeightedPick(hits,(h) => {
            return this.floor.map.GetTile(h.pos).flammabilitySquared()
          })

          if (hit !== undefined) {
            var hitTile = this.floor.map.GetTile(hit.pos);
            var roll = Math.floor(Math.random() * 100);
            if (distance > 0 && roll < (hitTile.flammabilityMultiplier() * current.heat/2)) {
              var hitFireData = this.GetTile(hit.pos)

              // var newHeatValue = Math.floor(hitTile.flammabilityMultiplier() * (hitFireData.heat + Math.floor(current.heat/3)) - 3);
              var newHeatValue = Math.floor(Math.random()*5);

              newHeatValue = Math.max(newHeatValue,0)
              if (newHeatValue < hitFireData.damp) {
                hitFireData.damp = newHeatValue;
              } else {
                newHeatValue -= hitFireData.damp

                hitFireData.damp = 0
                if (hitFireData.heat <= 0) {
                  hitFireData.cd = Math.random(3)+2
                }
                // console.log("HI?")
                hitFireData.heat += newHeatValue;
              }
            } else {
              var hitFireData = this.GetTile(hit.pos)
              hitFireData.minorHeat = 10;
            }
          }

          var bs = mapTile.burnSpeed()
          // console.log(bs)
          // window.mapTile = mapTile;
          // if (isNan(bs)) null();
          // current.heat = current.heat*bs
          current.cd = Math.random(3)+2


          // current.heat = current.heat*this.floor.map.GetTile({x, y}).flammabilityMultiplier();
        }
      }
    }

    var playerHit = this.GetTile(player.pos)
    if (playerHit.heat > 1) {
      player.log.Display("You burn for " + playerHit.heat + " hp.")
      player.currentHP -= Math.floor(playerHit.heat)
    }
  }
  FindTile() {

  }

  Render(terminal) {
  }
}
