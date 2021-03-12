import { Glyph, Color, Input, FOV } from "malwoden";
import Util from './Util.js'
import MainMenu from './MainMenu.js'
import MessageLog from './MessageLog.js'
import MessageWindow from './MessageWindow.js'
import GameMount from './GameMount.js'
var PlayerGlyph = new Glyph("@", Color.Yellow)

var defaults = {
  hp:10,
  h20:10,
}

export default class Player {
  constructor(pos, game, opts = null) {
    this.opts = { ...defaults, ...opts }
    // console.log(this.opts)
    this.priority = 100;
    this.pos = pos
    this.hover = {
      inRange: false,
      target: pos
    }
    this.game = game
    this.log = new MessageLog();
    this.hasAmulet = false;

    this.losCheck = new FOV.PreciseShadowcasting({
      lightPasses: (pos) => {
        return !this.game.GetCurrentFloor().map.GetTile(pos).blocksSight()
      },
      topology: "eight",
      cartesianRange: true,
    });

    this.currentHP = this.opts.hp;
    this.maxHP = this.opts.hp
    this.remainingWater = this.opts.h20;
    this.maxWater = this.opts.h20;

    this.weapons = [
      {
        desc:"focused",
        power: 7,
        radius: 0,
        range: 10,
      },
      {
        desc:"spray",
        power: 2,
        radius: 2,
        range: 5
      }
      ];
    this.currentWeapon = 0;
    this.rescues = 0
  }



  //
  Hover(terminal, pos) {
    var tPos = terminal.pixelToChar(pos);
    var visibleTiles = this.losCheck.calculateArray(this.pos, 50)
    var weapon = this.equippedWeapon();
    this.hover = {
      inRange: Util.distance(tPos, this.pos) < weapon.range,
      target: tPos,
      inSight: visibleTiles.find(hit => Util.EqPt(hit.pos, tPos)) !== undefined,
      inBounds: this.game.GetCurrentFloor().map.InBounds(tPos)
    }
  }
  mouseDown(terminal, pos) {
    var tPos = terminal.pixelToChar(pos);
    var weapon = this.equippedWeapon();
    if (this.hover.inRange && this.hover.inSight && this.hover.inBounds) {
      if (this.remainingWater > 0) {
        this.remainingWater -= 1;
        this.ShootWater(tPos, weapon.radius, weapon.power)
        this.game.TimeStep()
      }
    }
  }

  attemptMove(dx, dy) {
    var cf = this.game.GetCurrentFloor();
    var dest = {x: this.pos.x + dx, y: this.pos.y + dy}
    var destTile = cf.map.GetTile(dest)
    // console.log(destTile);

    if (destTile.Feature != null && destTile.bump(this)) {
        this.TakeDamageFromFire();
        this.game.TimeStep();
    } else {
      window.destTile = destTile;
      if (!destTile.blocksMovement()) {
        this.pos = dest;
        this.TakeDamageFromFire();
        this.game.TimeStep();
      }
    }
  }

  TakeDamageFromFire() {
    var ct = this.game.GetCurrentFloor().map.GetTile(this.pos);
    var damage = ct.fire.heat;
    if (damage > 0) {
      this.currentHP -= damage
      this.log.Display("You burn for " + damage + "hp.")
    }
  }

  ShootWater(tPos, radius, power) {
    var cf = this.game.GetCurrentFloor()
    for (var i = -radius; i <= radius; i += 1) {
      for (var j = -radius; j <= radius; j += 1) {
        if (cf.map.InBounds(tPos) && Math.abs(i) + Math.abs(j) <= radius) {
          var tile = cf.map.GetTile({x: tPos.x+i, y: tPos.y+j});
          tile.fire.damp += power;
        }
      }
    }
  }


  TimeStep() {
    if (this.currentHP <= 0) {
      GameMount.SetNewInputHandler(new MessageWindow(this.game,
        ["Alas, the fire has proven too much",
          "to bear. You were unable to recover",
          "the amulet of Rodgort this time.",
         "",
         "Try again soon!"],
         {w: 38, h:11, cb: () => GameMount.SetNewInputHandler(new MainMenu())}));
    }
  }

  changeWeapon(delta) {
    this.currentWeapon = (this.currentWeapon + this.weapons.length + delta) % this.weapons.length
  }
  equippedWeapon() {
    return this.weapons[this.currentWeapon];
  }

  calculateVisibleTiles() {
    if (this.game.opts.fov) {
      this.visibleTiles = this.losCheck.calculateArray({x:this.pos.x, y:this.pos.y}, 30)
    }
  }

  Render(terminal) {
    var cf = this.game.GetCurrentFloor()
    // if (this.game.opts.fov) {
    //   for (var i = 0; i < cf.map.w; i += 1) {
    //     for (var j = 0; j < cf.map.h; j += 1) {
    //       if (this.visibleTiles.find(hit => hit.pos.x == i && hit.pos.y == j) === undefined) {
    //         // terminal.drawGlyph({x: i, y: j}, new Glyph(" "))
    //         if (cf.map.GetTile({x:i, y:j}).Memory) {
    //           terminal.drawGlyph(hit.pos, memoryGlyph)
    //         }
    //       }
    //     }
    //   }
    // }

    // if  its in range, draw the attack line
    if (this.hover.inRange && this.hover.inSight && this.hover.inBounds) {
      // color = Color.Green
      var line = Util.lineBetween(this.pos, this.hover.target);
      for(var i = 0 ; i < line.length; i +=1) {
        var current = line[i];
        terminal.drawGlyph(current, new Glyph('o', Color.Green))
      }
    }
    terminal.drawGlyph(this.pos, PlayerGlyph);

    var xp = 26-6
    var xp2 = 27-6
    var xp3 = 33-6

    var ybase = 2;

    terminal.writeAt({x:xp, y:ybase+0}, "vitals:");
    terminal.writeAt({x:xp2, y:ybase+1}, "hp:");
    terminal.writeAt({x:xp3, y:ybase+1}, "" + this.currentHP + "/" + this.maxHP, Color.Green);

    terminal.writeAt({x:xp2, y:ybase+2}, "h2o:");
    terminal.writeAt({x:xp3, y:ybase+2}, " " + this.remainingWater + "/" + this.maxWater, Color.Green);
    terminal.writeAt({x:xp2, y:ybase+3}, "nozzle (q/e to swap): ")
    terminal.writeAt({x:xp2+2, y:ybase+4}, this.equippedWeapon().desc);
    terminal.writeAt({x:xp2, y:ybase+5}, "rescues: " + this.rescues);
    if (this.hasAmulet)
      terminal.writeAt({x:xp2, y:ybase+6}, "carrying amulet of Rodgort");

    terminal.writeAt({x:xp2, y:ybase+8}, "-----------------");
    terminal.writeAt({x:xp, y:ybase+9}, "Hovered tile (use mouse):")
    if (this.game.opts.fov && !this.hover.inSight) {
      terminal.writeAt({x:xp2, y:ybase+10}, "can't see!")
    } else {
      var hoverTarget = cf.map.GetTile(this.hover.target);
      terminal.writeAt({x:xp2, y:ybase+10}, "terrain: " + hoverTarget.opts.desc)
      if (hoverTarget.Feature != null)
        terminal.writeAt({x:xp2, y:ybase+11}, "feature: " + hoverTarget.Feature.g)
      // terminal.writeAt({x:xp2, y:ybase+11}, "desc: " + hoverTarget.opts.desc)
      terminal.writeAt({x:xp2, y:ybase+12}, "heat:" + Math.floor(hoverTarget.fire.heat))
      terminal.writeAt({x:xp2, y:ybase+13}, "damp:" + Math.floor(hoverTarget.fire.damp))
    }


    terminal.writeAt({x:xp2, y:ybase+19}, "-----------------");
    for (var i = 0; i < 10; i += 1) {
      var msg = this.log.GetMessage(i);
      terminal.writeAt({x:xp2, y:ybase+20+i},msg);
    }
  }
}
