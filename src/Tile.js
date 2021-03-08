import { Glyph, Color } from "malwoden";
import Util from './Util.js'
import ColorUtil from './ColorUtil.js'

const BRIGHT =[Color.Red, Color.Orange, Color.DarkOrange, Color.OrangeRed]
const DIM = [Color.Orange, Color.DarkOrange, Color.Goldenrod]

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

  FireColor(options, heat, bonus) {
    var choice = Util.Pick(options);
    // console.log(choice);
    var [h,s,v] = ColorUtil.rgbToHsv(choice.r, choice.g, choice.b)
    v = v * ((2*heat/100) + bonus)
    return new Color(...ColorUtil.hsvToRgb(h,s,v))
  }

  dynamicGlyph() {
    var c = Color.White;
    var bg = Color.Black;
    var g = this.opts.terrain;
    if (this.fire.heat > 0){
      c = this.FireColor(DIM, this.fire.heat, 0.25)
      if (this.fire.heat > 15)
        bg = this.FireColor(DIM, this.fire.heat, 0)
      g = '^'
    } else if (this.fire.damp >= 1) {
      c = Color.Blue
    }
    return new Glyph(g, c, bg)
  }
}
