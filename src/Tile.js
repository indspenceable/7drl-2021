export default class Tile {
  constructor(opts) {
    this.glyph = opts.glyph
    this.flammability = opts.flammability
    this.blocksMovement = opts.blocksMovement
    this.blocksFire = opts.blocksFire
  }
  flammabilityMultiplier() {
    return this.flammability/100;
  }
  flammabilitySquared() {
    return this.flammability * this.flammability
  }
}
