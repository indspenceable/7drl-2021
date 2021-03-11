import { Input } from "malwoden";



export default class MessageWindow {

  constructor(game, messages, config) {
    var defaults={
      w: 30,
      h: 20,
      cb: this.ReturnToGame
    }
    this.game = game;
    this.messages = messages
    this.config = { ...defaults, ...config}
    this.frame = 0;
  }
  BuildMouseContext(terminal) {

  }
  BuildKeyboardContext() {
    return new Input.KeyboardContext()
      .onDown(Input.KeyCode.Space, () => this.config.cb())
  }

  Render(terminal) {
    this.frame += 1;
    this.game.Render(terminal);
    var HalfHeight = Math.floor(this.config.h/2)
    // var HalfHeight = Math.floor(this.messages.length/2);
    // var lengths = this.messages.map(m => Math.floor(m.length));
    // var MaxWidth = Math.max(...lengths)
    var HalfWidth = Math.floor(this.config.w/2)
    var termSize = terminal.size();
    var middle = {x: Math.floor(termSize.x/2), y: Math.floor(termSize.y/2)}
    for (var i = 0; i < this.config.h; i += 1) {
      var xp = middle.x-HalfWidth;
      var yp= middle.y-HalfHeight+i
      // console.log({xp,yp})
      // console.log(lengths)
      // console.log(MaxWidth);
      // console.log(HalfWidth)
      if (i == 0 || i == this.config.h-1) {
         terminal.writeAt({x: xp, y:yp}, "-".repeat(this.config.w));
      } else {
        terminal.writeAt({x: xp, y:yp}, "|" + " ".repeat(this.config.w-2) + "|");
      }
      // null();
    }
    for (var i =0; i < this.messages.length; i +=1)
    {
      var message = this.messages[i]
      var xp = middle.x - Math.floor(message.length/2);
      var yp = middle.y-HalfHeight+i+1
      terminal.writeAt({x: xp, y: yp}, message)
    }

    if (this.frame > 30) {
      var message = "(press space to continue)"
      var xp = middle.x-Math.floor(message.length/2);
      var yp= middle.y+HalfHeight-2;
      terminal.writeAt({x: xp, y: yp}, message)
      if (this.frame > 60) this.frame = 0;
    }

  }
  Hover() {

  }
}
