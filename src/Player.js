import { Glyph, Color, Input, FOV } from "malwoden";
import Util from './Util.js'
import MainMenu from './MainMenu.js'
import MessageLog from './MessageLog.js'
var PlayerGlyph = new Glyph("@", Color.Yellow)



export default class Player {
  constructor(pos, game) {
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

    this.currentHP = 100;
    this.remainingWater = 20;

    this.weapons = [
      {
        desc:"focused",
        power: 12,
        radius: 0,
        range: 20,
      },
      {
        desc:"spray",
        power: 4,
        radius: 2,
        range: 10
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

    if (destTile.Feature != null) {
      if (destTile.bump(this)) return;
    }

    if (!destTile.blocksMovement()) {
      this.pos = dest;
      this.game.TimeStep();
    }
  }

  ShootWater(tPos, radius, power) {
    this.log.Display("You fire the water cannon.")
    var cf = this.game.GetCurrentFloor()
    for (var i = -radius; i <= radius; i += 1) {
      for (var j = -radius; j <= radius; j += 1) {
        if (cf.map.InBounds(tPos) && Math.abs(i) + Math.abs(j) <= radius) {
          var tile = cf.map.GetTile({x: tPos.x+i, y: tPos.y+j});
          if (tile.fire.heat < power) {
            tile.fire.heat = 0
            tile.fire.damp = power-tile.fire.heat
          } else {
            tile.fire.heat -= power;
          }
        }
      }
    }
  }


  TimeStep() {
    if (this.currentHP <= 0) {
      GameMount.SetNewInputHandler(new MainMenu());
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

    terminal.writeAt({x:xp, y:0}, "vitals:");
    terminal.writeAt({x:xp2, y:1}, "hp:");
    terminal.writeAt({x:xp3, y:1}, "" + this.currentHP + "/100", Color.Green);

    terminal.writeAt({x:xp2, y:2}, "h2o:");
    terminal.writeAt({x:xp3, y:2}, " " + this.remainingWater + "/ 20", Color.Green);
    terminal.writeAt({x:xp2, y:3}, "nozzle: ")
    terminal.writeAt({x:xp3+2, y:3}, this.equippedWeapon().desc);
    terminal.writeAt({x:xp2, y:5}, "civs: " + this.rescues);
    if (this.hasAmulet)
      terminal.writeAt({x:xp2, y:6}, "carrying amulet of Rodgort");

    terminal.writeAt({x:xp2, y:8}, "-----------------");
    terminal.writeAt({x:xp, y:9}, "target:")
    if (this.game.opts.fov && !this.hover.inSight) {
      terminal.writeAt({x:xp2, y:10}, "can't see!")
    } else {
      var hoverTarget = cf.map.GetTile(this.hover.target);
      terminal.writeAt({x:xp2, y:10}, "terrain: " + hoverTarget.opts.desc)
      if (hoverTarget.Feature != null)
        terminal.writeAt({x:xp2, y:11}, "feature: " + hoverTarget.Feature.g)
      // terminal.writeAt({x:xp2, y:11}, "desc: " + hoverTarget.opts.desc)
      terminal.writeAt({x:xp2, y:12}, "heat:" + Math.floor(hoverTarget.fire.heat))
      terminal.writeAt({x:xp2, y:13}, "damp:" + Math.floor(hoverTarget.fire.damp))
    }


    terminal.writeAt({x:xp2, y:19}, "-----------------");
    for (var i = 0; i < 10; i += 1) {
      var msg = this.log.GetMessage(i);
      terminal.writeAt({x:xp2, y:20+i},msg);
    }
  }
}
