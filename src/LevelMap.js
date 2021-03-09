import { Glyph, Color, Terminal, Input } from "malwoden";
import Util from './Util.js'
import Tile from './Tile.js'

var FLOOR_OPTS = {
  terrain: '.',
  desc: 'open floor',
  flammability: 110,
  blocksMovement: false,
  blocksFire: false,
  blocksSight: false
}

var DOWNSTAIRS_OPTS = {
  ...FLOOR_OPTS,
  terrain: '>',
  desc: 'stairs onward',
  glyph: new Glyph('>', Color.Red),
  flammability: 0,
}

var UPSTAIRS_OPTS = {
  ...FLOOR_OPTS,
  terrain: '<',
  desc: 'stairs back',
  glyph: new Glyph('<', Color.Green),
  flammability: 0,
}

var DOOR_OPTS = {
  ...FLOOR_OPTS,
  terrain: '>',
  desc: 'a door',
  glyph: new Glyph('+', Color.Brown),
  blocksSight: true
}


var WALL_OPTS = {
  ...FLOOR_OPTS,
  terrain: '#',
  desc: 'stone wall',
  glyph: new Glyph('#'),
  flammability: 15,
  blocksMovement: true,
  blocksFire: true,
  blocksSight: true
}

var OOB_OPTS = {
  terrain: '?',
  desc: '???',
  glyph: new Glyph('?'),
  flammability: 0,
  blocksMovement: true,
  blocksFire: true,
  blocksSight: true
}

class Upstairs{}
class Downstairs{}
class Door{}
class Wall{}

export default class LevelMap {
  constructor(floor){

    this.floor = floor
    this.w = floor.opts.w;
    this.h = floor.opts.h;
    this.builder = new LevelMapBuilder(this.w, this.h, floor.opts.iterations);

    this.upstairs = null;
    this.downstairs = null;
    while (this.upstairs == this.downstairs) {
      this.upstairs = this.builder.RandomFloor();
      this.downstairs = this.builder.RandomFloor();
    }
    this.tiles = {}
    for (var i = 0; i < this.w; i += 1) {
      this.tiles[i] = {}
      for (var j = 0; j < this.h; j += 1) {
        var v2 = {x:i, y:j}

        var nt = new Tile(FLOOR_OPTS)
        if (Util.EqPt(v2, this.upstairs))
          nt.Feature = {
            g: '<',
            c: Color.Green
          }
        else if (Util.EqPt(v2, this.downstairs))
          nt.Feature = {
            g: '>',
            c: Color.Red,
            blocksMovement: true,
            bump: (player) => {
              player.log.Display("You descend the stairs...")
              player.game.currentFloor += 1;
              player.pos = player.game.GetCurrentFloor().map.upstairs
              return true;
            }
          }
        else if (this.builder.IsDoor(v2))
          nt.Feature = {
            g: '+',
            c: Color.Brown,
            blocksSight: true,
            flammabilityDelta: -10,
          }
        else if (!this.builder.IsFloor(v2))
          nt.Feature = {
            g: '#',
            blocksSight: true,
            blocksMovement: true,
            flammabilityDelta: -50,
          }
        this.tiles[i][j] = nt
      }
    }
    this.oob = new Tile(OOB_OPTS)
  }

  GetTile(pos) {
    if (typeof pos !== 'object') {
      console.log("Trying to getTile on a nonobject'");
      (null)();
    }
    if (!this.InBounds(pos)) {
      return this.oob
    }
    return this.tiles[pos.x][pos.y]
  }

  InBounds(pos) {
    return pos.x >= 0 && pos.y >= 0 && pos.x < this.w && pos.y < this.h;
  }
  Blocked(pos) {
    return !this.InBounds(pos) || this.GetTile(pos).blocksMovement();
  }

}



class LevelMapBuilder {
  constructor(w, h, iterations) {
    this.w = w;
    this.h = h;
    this.rooms = [
      {x:1,y:1,w:this.w-3,h:this.h-3}
    ]
    this.doors = []
    for (var i = 0; i < iterations; i += 1) {
      this.Step();
    }
  }


  Step() {
    var letters = "abcdefhijklmnopqrstuvwxyz".split("");


    var tries = 100;
    while(true) {
      var Pick= function(items) {
        return items[Math.floor(Math.random() * items.length)];
      }
      // var WeightedPick = function(items, weight) {
      //   var reducer = (acc, val) => {return acc + val};
      //   var valueIndex = Math.random() * (items.map(i => weight(i)).reduce(reducer, 0));
      //   for (var i = 0; i < items.length; i += 1) {
      //     valueIndex -= weight(items[i]);
      //     if (valueIndex < 0) return items[i];
      //   }
      //   return undefined;
      // }

      var that = this;
      var WeightedRandom = function(min,max,dice) {
        var roll = () => Math.random() * (max-min) + min;
        var result = 0;
        for (var i = 0; i < dice; i += 1) {
          result += roll();
        }
        return Math.floor(result/dice);
      }

      var cr = Util.WeightedPick(this.rooms, (r) => r.w * r.w * r.h * r.h);
      if (cr.w > 4 || cr.h > 4) {
        var roomsTemp = this.rooms;



        var SplitVertically = function(){
          var splitY = WeightedRandom(1,cr.h-1,2)
          // var splitY = Pick(Array(cr.h - 4).fill().map((_, i) => i + 2));
          if (that.doors.some((door) => {
            return (door.x == cr.x-1 || door.x == cr.x+cr.w+1) && door.y == cr.y+splitY+1;
          })) {
          // if (that.doors.includes({x:cr.x+cr.w+1, y: cr.y+splitY+1}) ||
          //     that.doors.includes({x:cr.x-     1, y: cr.y+splitY+1})) {
            return false;
          }
          // window.splitY = Array(cr.h - 4).fill().map((_, i) => i + 2);
          // console.log("Selected splitY: " + splitY);
          var doorX = Pick(Array(cr.w).fill().map((_,i)=>i));
          var r1 = {x: cr.x, y: cr.y, w: cr.w, h: splitY, g:Pick(letters)};
          var r2 = {x: cr.x, y: cr.y+splitY+2, w: cr.w, h: cr.h-splitY-2, g:Pick(letters)};
          roomsTemp.splice(roomsTemp.indexOf(cr), 1);
          roomsTemp.push(r1);
          roomsTemp.push(r2);
          that.doors.push({x:cr.x+doorX, y: cr.y+splitY+1});
          return true;
        }
        var SplitHorizontally = function(){
          var splitX = WeightedRandom(1,cr.w-1,2)
          // var splitX = Pick(Array(cr.w - 4).fill().map((_, i) => i + 2));
          if (that.doors.some((door) => {
            return (door.y == cr.y-1 || door.y == cr.y+cr.h+1) && door.x == cr.x+splitX+1;
          })) {
          // if (that.doors.includes({y:cr.y+cr.h+1, x: cr.x+splitX+1}) ||
          //     that.doors.includes({y:cr.y-     1, x: cr.x+splitX+1})) {
            return false;
          }

          // window.splitX = Array(cr.w - 4).fill().map((_, i) => i + 2)
          // console.log("Selected splitX: " + splitX);
          var doorY = Pick(Array(cr.h).fill().map((_,i)=>i));
          var r1 = {y: cr.y, x: cr.x, h: cr.h, w: splitX, g:Pick(letters)};
          var r2 = {y: cr.y, x: cr.x+splitX+2, h: cr.h, w: cr.w-splitX-2, g:Pick(letters)};
          roomsTemp.splice(roomsTemp.indexOf(cr), 1);
          roomsTemp.push(r1);
          roomsTemp.push(r2);
          that.doors.push({y:cr.y+doorY, x: cr.x+splitX+1});
          return true;
        }
        if (cr.h <= 4) // Has to be height
        {
          if (SplitHorizontally()) return;
        }
        else if(cr.w <= 4) // has to be width
        {
          if (SplitVertically()) return;
        }
        else // either way
        {
          if (Util.WeightedPick([
              {weight: cr.h * cr.h, cb: SplitVertically},
              {weight: cr.w * cr.w, cb: SplitHorizontally}
            ], i => i.weight).cb()) return;
        }
        tries -= 1;
        if (tries <= 0) return;
      }
    }
  }

  RandomFloor() {
    var room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
    var x = Math.floor(Math.random() * room.w)
    var y = Math.floor(Math.random() * room.h)

    return {x:room.x+x, y:room.y+y}
  }

  IsFloor(pos) {
    return this.rooms.some(r =>
      r.x <= pos.x  && r.x + r.w >= pos.x &&
      r.y <= pos.y  && r.y + r.h >= pos.y);
  }
  IsDoor(pos) {
    return this.doors.some(d => (d.x == pos.x) && (d.y == pos.y));
  }

}
