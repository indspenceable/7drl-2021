import { Glyph, Color, Terminal, Input } from "malwoden";

export default class Game{
  constructor() {
    this.rooms = [
      {x:0,y:0,w:20,h:20, g: "x"}
    ]
    this.doors = []
    this.Step();
    this.Step();
    this.Step();
    this.Step();
    this.Step();
  }
  Hover() {

  }
  Render(terminal) {
    // console.log("Rendering");
    for (var i = 0; i < this.rooms.length; i +=1) {
      // var glyph = "";
      var cr = this.rooms[i];
      terminal.fill(cr, {x: cr.x + cr.w, y: cr.y + cr.h}, new Glyph("."));
    }
    for (var i = 0; i < this.doors.length; i +=1) {
      // console.log("ayy");
      terminal.drawGlyph(this.doors[i], new Glyph("+"));
    }
  }
  BuildKeyboardContext() {
    return new Input.KeyboardContext()
      // .onDown(Input.KeyCode.DownArrow, () => this.attemptMove(0, 1))
      // .onDown(Input.KeyCode.LeftArrow, () => this.attemptMove(-1, 0))
      // .onDown(Input.KeyCode.RightArrow, () => this.attemptMove(1, 0))
      // .onDown(Input.KeyCode.UpArrow, () => this.attemptMove(0, -1));
      .onDown(Input.KeyCode.Space, () => this.Step());
  }
  BuildMouseContext() {
    return new Input.MouseContext();
  }

  Step() {
    var letters = "abcdefhijklmnopqrstuvwxyz".split("");

    while(true) {
      var Pick= function(items) {
        return items[Math.floor(Math.random() * items.length)];
      }
      var WeightedPick = function(items, weight) {
        var reducer = (acc, val) => {return acc + val};
        var valueIndex = Math.random() * (items.map(i => weight(i)).reduce(reducer, 0));
        for (var i = 0; i < items.length; i += 1) {
          valueIndex -= weight(items[i]);
          if (valueIndex < 0) return items[i];
        }
        return undefined;
      }

      var that = this;
      var AddDoor = (function(doors) {
        return function(door) {
          doors.push(door);
        };
      })(this.doors);

      var cr = WeightedPick(this.rooms, (r) => r.w * r.h);
      if (cr.w > 4 || cr.h > 4) {
        var roomsTemp = this.rooms;
        var SplitVertically = function(){
          var splitY = Pick(Array(cr.h - 4).fill().map((_, i) => i + 2));
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
          var splitX = Pick(Array(cr.w - 4).fill().map((_, i) => i + 2));
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
          if (Pick([SplitVertically, SplitHorizontally])()) return;
        }
      }
    }
  }
}
