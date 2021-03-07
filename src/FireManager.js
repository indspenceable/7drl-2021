import { Glyph, Color, Terminal, FOV, Input } from "malwoden";
import Util from './Util.js'

const INITIAL_SPARK_COUNT = 4;
const INITIAL_SPARK_HEAT = 20;
const SMALL_THRESHOLD = 10;
const LARGE_THRESHOLD = 40;




export default class FireManager {
  constructor(map) {
    this.map = map;
    this.data = {};
    this.fov = new FOV.PreciseShadowcasting({
      lightPasses: (pos) => !map.GetTile(pos).blocksFire,
      topology: "four",
      cartesianRange: true,
    });
    var litTile = null;
    for (var i = 0; i< INITIAL_SPARK_COUNT; i+=1) {
        litTile = this.LightRandomTile();
    }
    // this.litTiles = this.fov.calculateArray({x:litTile.x, y:litTile.y}, 5);




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
    this.GetTileAt({x:dx, y:dy}).heat = INITIAL_SPARK_HEAT;
    return this.GetTileAt({x:dx, y:dy})
  }
  Pick (items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  GetTileAt(pos) {
    if (this.data[pos.x] === undefined)
      this.data[pos.x] = {};
    if (this.data[pos.x][pos.y] === undefined)
      this.data[pos.x][pos.y] = {
        x: pos.x,
        y: pos.y,
        heat: 0,
        cd: 2,
        seen: false
      };
    return this.data[pos.x][pos.y];
  }


  Step() {
    // return;
    // if (this.data.length > 10000) return;
    // console.log(this.data);
    for (var [x, yValues] of Object.entries(this.data)) {
      for (var [y, current] of Object.entries(yValues)) {
        if (current.heat > 80) current.heat = 80;
        if (current.heat < 10) continue;

        if (current.cd > 0) {
          // console.log("curren ct is " + current.cd)
          current.cd -= 1;
        } else {
          // console.log("Oyyy we spreading the fire!");
          // var dx = Math.floor(Math.random()*5-2);
          // var dy = Math.floor(Math.random()*5-2);
          // var newX = current.x+dx;
          // var newY = current.y+dy;


          var distance = Math.floor(current.heat / 9);
          var hits = this.fov.calculateArray({x:current.x, y:current.y}, distance).filter(
            hit => !this.map.GetTile(hit.pos).blocksFire &&
              hit.r <= distance &&
              ((hit.pos.x != current.x) || (hit.pos.y != current.y))
          );
          var hit = Util.WeightedPick(hits,(h) => this.map.GetTile(h.pos).flammabilitySquared())




          if (hit !== undefined) {
            var hitTile = this.map.GetTile(hit.pos);
            var roll = Math.floor(Math.random() * 100);
            if (distance > 0 && roll < hitTile.flammabilityMultiplier() * current.heat/2) {
              var hitFireData = this.GetTileAt(hit.pos)

              var newHeatValue = Math.floor(hitTile.flammabilityMultiplier() * (hitFireData.heat + Math.floor(current.heat/3)) - 3);
              // console.log(this.Flammability(hitFireData))
              // var newHeatValue = Math.floor(current.heat/3);
              if (hitFireData.heat <= 0) {
                // console.log("Hit a tile! its a new one!!" + newHeatValue)

                // console.log(hitFireData)
                hitFireData.cd = Math.floor(Math.random()*10);
                hitFireData.heat = newHeatValue;
              } else {
                hitFireData.heat = newHeatValue;

                // console.log("Hit a tile! its an old one.")
              }

              current.heat *= this.map.GetTile({x: x, y: y}).flammabilityMultiplier()
              current.cd = Math.floor(Math.random()*10);
              // GameMount.DoQuit();
              // GameMount.SetNewInputHandler({});
            } else {
              var target = hitTile.flammabilityMultiplier() * current.heat/2
              // console.log("got a hit, but it failed to catch (" + roll + ") / ("+ target+ ")");
              // console.log();
            }
          } else {
            // console.log("There were no available hits...?");
            // console.log(hits.length)
            // console.log(hits.map(h => this.map.GetTile(h.pos).flammabilitySquared()))
          }
        }
      }
    }
    window.data = this.data
  }
  FindTile() {

  }

  Render(terminal) {
    // this.Step();
    // for(var t of this.litTiles) {
    //   terminal.drawGlyph(t.pos, new Glyph("*"));
    // }
    for (var [x, yValues] of Object.entries(this.data)) {
      for (var [y, current] of Object.entries(yValues)) {
        if (current.heat < 5) {}
        else if (current.heat < SMALL_THRESHOLD) terminal.drawGlyph(current, this.Pick(this.smallGlyph));
        else if (current.heat < LARGE_THRESHOLD) terminal.drawGlyph(current, this.Pick(this.medGlyph));
        else                        terminal.drawGlyph(current, this.Pick(this.largeGlyph));
      }
    }
  }
}
