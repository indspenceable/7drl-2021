import Util from './Util.js'
import FireManager from './FireManager.js'
import LevelMap from './LevelMap.js'
import FeaturesManager from './FeaturesManager.js'

export default class Floor {
  constructor(opts) {
    this.opts = {...opts}
    this.map = new LevelMap(this);
    this.fire = new FireManager(this);
    this.features = new FeaturesManager(this);
    this.systems = [this.fire, this.features];
  }
  Render(terminal, player) {
    for (var i = 0; i < this.map.w; i += 1) {
      for (var j = 0; j < this.map.h; j += 1) {
        var v2 = {x:i, y:j};
        if (!player.game.opts.fov || player.visibleTiles.some(h => Util.EqPt(h.pos, v2))) {
          var current = this.map.GetTile(v2);
          if (current.glyph !== undefined) {
            terminal.drawGlyph(v2, current.glyph);
          } else {
            terminal.drawGlyph(v2, current.dynamicGlyph());
          }
        }
      }
    }
  }
}
