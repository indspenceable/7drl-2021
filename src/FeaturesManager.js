import { Glyph, Color } from "malwoden";
import Util from './Util.js'

const CONFIG = {
  radius: 2,
  heat: 7,
}

const CivilianFeature ={
  g: "@",
  blocksMovement: false,
  bump: (player, tile) => {
    player.log.Display("You rescued a civilian.")
    player.rescues +=1
    tile.Feature = null;
  }
}

const ExplosiveBarrelFeature= {
  blocksMovement: true,
  g: "O",
  c:Color.Black,
  bg:Color.Green,
  tick: (tile, player) => {
    var floor = player.game.GetCurrentFloor();
    var roll = (Math.random() * 30) + 3;
    console.log(tile);
    if (tile.fire.heat > roll) {
      player.log.Display("A barrel explodes!")
      for (var dx = -CONFIG.radius; dx <= CONFIG.radius; dx+=1){
        for (var dy = -CONFIG.radius; dy <= CONFIG.radius; dy+=1){
          if (dx*dx + dy*dy <= CONFIG.radius * CONFIG.radius) {
           floor.map.GetTile({x: tile.pos.x+dx, y: tile.pos.y+dy}).fire.heat += CONFIG.heat;
          }
        }
      }
      console.log("Removing this barrel.");
      tile.Feature = null;
    }
  },
  flammabilityDelta: 20,
};



export default class FeaturesManager {
  constructor(floor) {
    this.priority = 40;
    this.floor = floor;


    var placedBarrels = []
    while(placedBarrels.length < this.floor.opts.barrels){
      var newBarrel = this.floor.map.builder.RandomFloor()
      var newBarrelTile = this.floor.map.GetTile(newBarrel);
      if (newBarrelTile.Feature == null) {
        placedBarrels.push(newBarrel)
        newBarrelTile.Feature = {...ExplosiveBarrelFeature}
      }
    }
    var spawnedCiv = []
    while(spawnedCiv.length < this.floor.opts.rescues){
      this.SpawnRescue(spawnedCiv);
    }
  }
  SpawnRescue(spawnedCiv) {
    var newCiv = this.floor.map.builder.RandomFloor()
    var civTile = this.floor.map.GetTile(newCiv)
    if (civTile.Feature == null) {
      spawnedCiv.push(newCiv)
      var that = this;
      civTile.Feature ={...CivilianFeature};
    }
  }
  Render(terminal) {
  }
  TimeStep(player) {
    var cf = player.game.GetCurrentFloor();
    for (var x = 0; x < cf.map.w; x += 1){
      for (var y = 0; y < cf.map.h; y += 1) {
        var feature = cf.map.GetTile({x, y}).Feature
        if (feature != null && feature.tick != null) {
          feature.tick(cf.map.GetTile({x,y}),player)
        }
      }
    }
  }
}
