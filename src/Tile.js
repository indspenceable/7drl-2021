import { Glyph, Color } from "malwoden";
import Util from './Util.js'
import ColorUtil from './ColorUtil.js'

export default class Tile {
  constructor(opts) {
    this.opts = {...opts}
    this.glyph = opts.glyph;
    this.fire = {
      heat: 0,
      cd: 1,
      damp: 0,
    }
  }
  flammabilityMultiplier() {
    return this.opts.flammability/100;
  }
  flammabilitySquared() {
    return this.opts.flammability * this.opts.flammability
  }

  dynamicGlyph() {
    var c = Color.White;
    var g = this.opts.terrain;
    if (this.fire.heat > 0){
      var choice = Util.Pick([Color.Red, Color.Yellow, Color.Orange, Color.DarkOrange, Color.OrangeRed]);
      var [h,s,v] = ColorUtil.rgbToHsv(choice.r, choice.g, choice.b)
      v = v * ((2*this.fire.heat/100) + 0.25)
      c = new Color(...ColorUtil.hsvToRgb(h,s,v))
      g = '^';
    } else if (this.fire.damp > 0) {
      // g = '%'
      c = Color.Blue
    }
    return new Glyph(g, c)
  }
}
