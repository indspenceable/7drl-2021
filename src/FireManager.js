import { Glyph, Color, Terminal, FOV, Input } from "malwoden";

const INITIAL_SPARK_COUNT = 7;
const INITIAL_SPARK_HEAT = 40;
const SMALL_THRESHOLD = 10;
const LARGE_THRESHOLD = 40;

export default class FireManager {
  constructor(map) {
    this.map = map;
    this.data = {};
    var NotWall = function(pos) {
      // console.log("Checking: " + pos);
      return (map.IsFloor(pos) || map.IsDoor(pos)) && map.InBounds(pos);
    }
    this.fov = new FOV.PreciseShadowcasting({
      lightPasses: (pos) => !map.Blocked(pos),
      topology: "four",
      cartesianRange: true,
    });
    var litTile = null;
    for (var i = 0; i< INITIAL_SPARK_COUNT; i+=1) {
        litTile = this.LightRandomTile();
    }
    this.litTiles = this.fov.calculateArray({x:litTile.x, y:litTile.y}, 5);




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
  Flammability(pos) {
    if (!this.map.InBounds(pos))
      return 0;

    if (this.map.IsFloor(pos)) {
      return 1.1;
    } else if(this.map.IsDoor(pos)) {
      0.25;
    }
    return 0.15;
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
          window.fov  = this.fov;

          var distance = Math.floor(current.heat / 5) - 2;
          var hits = this.fov.calculateArray({x:current.x, y:current.y}, distance).filter(
            hit => !this.map.Blocked(hit.pos) &&
              hit.r <= distance &&
              ((hit.pos.x != current.x) || (hit.pos.y != current.y))
          );

          window.hits = hits;
          if (hits.length > 1 && distance > 0 && Math.floor(Math.random() * 100) < current.heat/1.5) {
            var hit = this.Pick(hits);

            var hitTile = this.GetTileAt(hit.pos)
            // console.log(current);
            // console.log(hit);
            // console.log(hitTile);
            // console.log(this.Flammability(hitTile));
            var newHeatValue = Math.floor(this.Flammability(hitTile) * (hitTile.heat + Math.floor(current.heat/3)) - 3);
            // console.log(this.Flammability(hitTile))
            // var newHeatValue = Math.floor(current.heat/3);
            if (hitTile.heat <= 0) {
              // console.log("Hit a tile! its a new one!!" + newHeatValue)

              // console.log(hitTile)
              hitTile.cd = Math.floor(Math.random()*20);
              hitTile.heat = newHeatValue;
            } else {
              hitTile.heat = newHeatValue;

              // console.log("Hit a tile! its an old one.")
            }

            current.heat *= this.Flammability(current);
            current.cd = Math.floor(Math.random()*20);
            // GameMount.DoQuit();
            // GameMount.SetNewInputHandler({});
          } else {
            // console.log("NO HITS!");
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
