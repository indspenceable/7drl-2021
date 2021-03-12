import { Glyph, Color } from "malwoden";
import Util from './Util.js'

const CONFIG = {
  radius: 2,
  heat: 2,
}

const CivilianFeature = {
  g: "@",
  blocksMovement: false,
  bump: (player, tile) => {
    player.log.Display("You rescued a civilian.")
    player.rescues +=1
    tile.Feature = null;
  },
  burn: (player, tile) => {
    player.log.Display("A citizen in need of rescue has perished.")
    tile.Feature = null;
  }
}
const MedkitFeature = {
  blocksMovement: false,
  g: "+",
  c: Color.Red,
  bg: Color.Green,
  burn: (player, tile) => {
    player.log.Display("A medkit burns up.")
    tile.Feature = null;
  },
  bump: (player, tile) => {
    player.log.Display("You apply the medkit! HP Restored.");
    tile.Feature = null;
    player.currentHP = player.maxHP;
  }
}

const WaterJug = {
  blocksMovement: false,
  g: "%",
  c: Color.Black,
  bg: Color.Blue,
  burn: (player, tile) => {
    player.log.Display("A water refill canister bursts!")
    tile.Feature =null;
  },
  bump: (player, tile) => {
    player.log.Display("You install the water refill canister")
    tile.Feature =null;
    player.remainingWater = player.maxWater;
  }
}

const ExplosiveBarrelFeature= {
  blocksMovement: true,
  g: "O",
  c:Color.Black,
  bg:Color.Green,
  burn: (player, tile) => {
    var floor = player.game.GetCurrentFloor();
    var roll = (Math.random() * 10);
    // console.log(tile);
    // console.log("EXPLOSION???  " + roll + tile.fire.heat) ;
    if (tile.fire.heat > roll) {
      player.log.Display("A barrel explodes!")
      for (var dx = -CONFIG.radius; dx <= CONFIG.radius; dx+=1){
        for (var dy = -CONFIG.radius; dy <= CONFIG.radius; dy+=1){
          if (dx*dx + dy*dy <= CONFIG.radius * CONFIG.radius) {
            var fd = floor.map.GetTile({x: tile.pos.x+dx, y: tile.pos.y+dy}).fire;
           fd.heat = Math.max(fd.heat, Math.floor(CONFIG.heat));
          }
        }
      }
      tile.Feature = null;
    }
  }
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
    this.SpawnAllObjects(CivilianFeature, this.floor.opts.rescues);
    this.SpawnAllObjects(MedkitFeature, this.floor.opts.medkits);
    this.SpawnAllObjects(WaterJug, this.floor.opts.waterRefills);
  }
  SpawnAllObjects(obj, count) {
    var list = []
    while(list.length < count){
      this.SpawnObject(obj, list);
    }
  }
  SpawnObject(obj, list) {
    var newObj = this.floor.map.builder.RandomFloor()
    var currentTile = this.floor.map.GetTile(newObj)
    if (currentTile.Feature == null) {
      list.push(newObj)
      currentTile.Feature ={...obj};
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
