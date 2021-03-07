import MainMenu from './MainMenu.js'
import Game from './Game.js'
import { CharCode, Color, Terminal, Input } from "malwoden";



class GameMount {

    Install() {
        var currentRequestRef = 0;
        const mountNode = document.getElementById("game")
        var terminal = new Terminal.RetroTerminal({
              width: 50,
              height: 30,
              imageURL: "https://malwoden.com/font_16.png",
              charWidth: 16,
              charHeight: 16,
              mountNode,
            });
        this.MainMenu = new MainMenu();

        const mouse = new Input.MouseHandler();

        let InstalledInputHandler = null;
        // const c = new Input.MouseContext()
        //   .onMouseDown((pos) => {
        //     const termPos = terminal.pixelToChar(pos);
        //     InstalledInputHandler.MouseDown(termPos);
        //   })
        //   .onMouseUp((pos) => {
        //     const termPos = terminal.pixelToChar(pos);
        //     InstalledInputHandler.MouseUp(termPos);
        //   });
        // mouse.setContext(c);

        const keyboard = new Input.KeyboardHandler();
        // keyboard.setContext(movement);
        var quit = 0;
        this.DoQuit= function() {quit+=1;};
        this.SetNewInputHandler = function(NewInputHandler) {
            if (InstalledInputHandler != NewInputHandler) {
                var movement = NewInputHandler.BuildKeyboardContext()
                    .onDown(Input.KeyCode.Escape, () => {quit = true});
                keyboard.setContext(movement);
                var mouseContext = NewInputHandler.BuildMouseContext(terminal);
                mouse.setContext(mouseContext)
                InstalledInputHandler = NewInputHandler;
            }
        }

        function loop() {
            // console.log("Loopin");
            terminal.clear();
            // Draw mouse position
            const mousePos = mouse.getPos();
            InstalledInputHandler.Hover(terminal, mousePos);
            InstalledInputHandler.Render(terminal);

            // Render
            terminal.render();

            if (quit < 5)
                currentRequestRef = requestAnimationFrame(loop);
            else {
                keyboard.clearContext();
            }
        }
        this.SetNewInputHandler(this.MainMenu);
        currentRequestRef = requestAnimationFrame(loop);
    }

}
var g = new GameMount();
export default g;
