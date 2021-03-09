export default class MessageLog {
  constructor() {
this.log = []
  }
  Display(message) {
    this.log.unshift(message)
  }
  GetMessage(i) {
    if (this.log.length > i) {
      return this.log[i];
    }
    return ""
  }
}
