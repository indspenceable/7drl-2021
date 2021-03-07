import { Glyph, Color, Terminal, Input } from "malwoden";
import Util from './Util.js'
import Tile from './Tile.js'

var FLOOR_OPTS = {
  glyph: new Glyph('.'),
  flammability: 100,
  blocksMovement: false,
  blocksFire: false,
}

var DOWNSTAIRS_OPTS = {
  glyph: new Glyph('>', Color.Red),
  flammability: 0,
  blocksMovement: false,
  blocksFire: true,
}

var UPSTAIRS_OPTS = {
  glyph: new Glyph('<', Color.Green),
  flammability: 0,
  blocksMovement: false,
  blocksFire: true,
}

var DOOR_OPTS = {
  glyph: new Glyph('+'),
  flammability: 100,
  blocksMovement: false,
  blocksFire: false,
}


var WALL_OPTS = {
  glyph: new Glyph('#'),
  flammability: 5,
  blocksMovement: true,
  blocksFire: true,
}

var OOB_OPTS = {
  glyph: new Glyph('?'),
  flammability: 0,
  blocksMovement: true,
  blocksFire: true
}

export default class LevelMap {
  constructor(w, h, iterations){
    this.w = w;
    this.h = h;
    this.builder = new LevelMapBuilder(w, h, iterations);

    this.upstairs = null;
    this.downstairs = null;
    while (this.upstairs == this.downstairs) {
      this.upstairs = this.builder.RandomFloor();
      this.downstairs = this.builder.RandomFloor();
    }

    this.tiles = {}
    for (var i = 0; i < w; i += 1) {
      this.tiles[i] = {}
      for (var j = 0; j < h; j += 1) {
        var v2 = {x:i, y:j}
        var opts = WALL_OPTS
        if (v2.x == this.upstairs.x && v2.y == this.upstairs.y) {
          opts = UPSTAIRS_OPTS
        } else if (v2.x == this.downstairs.x && v2.y == this.downstairs.y) {
          opts = DOWNSTAIRS_OPTS
        }
        else if (this.builder.IsFloor(v2)) {
          opts = FLOOR_OPTS
        } else if (this.builder.IsDoor(v2)) {
          opts = DOOR_OPTS
        }

        this.tiles[i][j] = new Tile(opts)
      }
    }
    this.oob = new Tile(OOB_OPTS)
  }

  GetTile(pos) {
    if (typeof pos !== 'object') {
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
    return !this.InBounds(pos) || this.tiles[pos.x][pos.y].blocksMovement;
  }

  Render(terminal) {
    for (var i = 0; i < this.w; i += 1) {
      for (var j = 0; j < this.h; j += 1) {
        var v2 = {x:i, y:j};
        var current = this.GetTile(v2);
        terminal.drawGlyph(v2, current.glyph);
      }
    }
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
    var x = Math.floor(Math.random() * this.w)
    var y = Math.floor(Math.random() * this.h)
    return {x, y}
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
