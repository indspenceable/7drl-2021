import { Glyph, Color } from "malwoden";
import Util from './Util.js'
import ColorUtil from './ColorUtil.js'

const DIM =[Color.Red, Color.Orange, Color.DarkOrange, Color.OrangeRed]
// const DIM = [Color.Orange, Color.DarkOrange, Color.Goldenrod]

export default class Tile {
  constructor(opts, pos) {
    this.opts = {...opts}
    this.pos = pos;
    this.fire = {
      heat: 0,
      cd: 5,
      damp: 0,
    }
    this.Feature = null;
  }

  flammabilityBase() {
    return this.opts.flammability + this.query('flammabilityDelta', 0)
  }

  burnSpeed() {
    return (this.opts.burnSpeed + this.query("burnSpeedDelta", 0))/100
  }

  flammabilityMultiplier() {
    return this.flammabilityBase()/100;
  }
  flammabilitySquared() {
    var base = this.flammabilityBase();
    return base * base;
  }

  query(str, def) {
    if (def === undefined)
      console.log("Default is undefined, you probably don't want that!")
    if (this.Feature != null && str in this.Feature)
      return this.Feature[str]
    return def;
  }

  blocksMovement() {
    return this.query('blocksMovement', false) || this.opts.BlocksMovement
  }
  blocksSight() {
    return this.query('blocksSight', false)
  }
  blocksFire() {
    return this.query('blocksFire', false)
  }
  bump(player) {
    if (this.Feature != null && this.Feature.bump != undefined) {
      return this.Feature.bump(player, this)
    }
  }


  FireColor(options, heat, bonus) {
    var choice = Util.Pick(options);
    // console.log(choice);
    var [h,s,v] = ColorUtil.rgbToHsv(choice.r, choice.g, choice.b)
    v = (heat/4)
    return new Color(...ColorUtil.hsvToRgb(h,s,v))
  }

  memoryGlyph() {
    var c = Color.Gray;
    var bg = Color.Black;
    var g = '.'
    if (this.Feature != null) {
      g = this.Feature.g
    }
    return new Glyph(g, c, bg)
  }

  dynamicGlyph() {
    var c = Color.White;
    var bg = Color.Black;
    var g = null

    if (this.Feature != null) {
      g = this.Feature.g ;
      c = this.Feature.c || c;
      bg = this.Feature.bg || bg;
    }

    if (this.fire.heat > 0){
      c = this.FireColor(DIM, this.fire.heat, 0.25)
      if (this.fire.heat > 15)
        bg = this.FireColor(DIM, this.fire.heat, 0)
      g = g || '^'
    } else if (this.fire.damp >= 1) {
      c = Color.Blue
    }

    g = g || this.opts.terrain || "?"
    return new Glyph(g, c, bg)
  }
}
