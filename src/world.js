import Player from './player.js'

export default class World {
  constructor() {
    this.player = new Player();
  }

  Setup()  {
    Game.scheduler.add(this.player, true);
    // this.map = new ();
  }

  DrawMap(offset = {x: 0, y: 0}) {
    for (var i = 0; i < Game.display.getOptions().width; i += 1) {
      for (var j = 0; j < Game.display.getOptions().height; j += 1){
        Game.display.draw(i+offset.x, j+offset.y, " ", "#fff");
      }
    }
  }
}
