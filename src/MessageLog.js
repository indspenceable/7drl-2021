export default class MessageLog {
  constructor() {
this.log = []
  }
  Display(message) {
    if (message.length < 25) {
      this.log.unshift(message)
    } else {
      var start = message.substring(0,25)
      var i =start.lastIndexOf(" ");
      this.Display(" " + message.substring(i));
      this.Display(message.substring(0,i));
    }

  }
  GetMessage(i) {
    if (this.log.length > i) {
      return this.log[i];
    }
    return ""
  }
}
