import GameMount from './GameMount.js'

document.addEventListener('DOMContentLoaded', function () {
  GameMount.Install();
  window.GameMount = GameMount;
});
