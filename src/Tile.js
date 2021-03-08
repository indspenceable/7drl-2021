import { Glyph, Color } from "malwoden";
import Util from './Util.js'
import ColorUtil from './ColorUtil.js'

export default class Tile {
  constructor(opts) {
    this.terrain = opts.terrain;
    this.glyph = opts.glyph;
    this.flammability = opts.flammability
    this.blocksMovement = opts.blocksMovement
    this.blocksFire = opts.blocksFire
    this.fire = {
      heat: 0,
      cd: 1,
    }
  }
  flammabilityMultiplier() {
    return this.flammability/100;
  }
  flammabilitySquared() {
    return this.flammability * this.flammability
  }

  dynamicGlyph() {
    var c = Color.White;
    var g = this.terrain;
    if (this.fire.heat > 1){
      var choice = Util.Pick([Color.Red, Color.Yellow, Color.Orange]);
      var [h,s,v] = ColorUtil.rgbToHsv(choice.r, choice.g, choice.b)

      // v = 0.25
      // 1-v = 0.75
      // (1-v)/2 = 0.375
      // (1-((1-v)/2)) = 0.625 (+0.51)

      v = v * ((2*this.fire.heat/100) + 0.25)
      c = new Color(...ColorUtil.hsvToRgb(h,s,v))
      g = '^';

    }
    return new Glyph(g, c)
  }
}
