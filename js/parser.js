class Parser {
  constructor() {
    this.commands = new Map();
    this.infix = new Map();
    this.infix.set("(", Infinity);
    this.stack = [];
  }

  load(tokenizer) {
    this.tokenizer = tokenizer;
  }

  command(token) {
    const argsCount = this.commands.get(token.data)
    for(let i = 0; i < argsCount; i++)
      token.addArg(this.tokenizer.next());
    return token
  }

  next() {
    let token = this.tokenizer.next();
    if(this.commands.has(token.data)) {
      token = this.command(token)
    }
    return token;
  }

  addCommand(command, argsLength) {
    this.commands.set(command, argsLength);
  }

  addInfix(operator, precedent) {
    this.infix.set(operator, precedent)
  }
}