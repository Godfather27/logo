class Command {
  constructor(args, code) {
    this.args = args;
    this.raw = code;
    this.code = null;
  }
}

class Parser {
  constructor() {
    this.commands = new Map();
    this.infixes = new Map([["(", Infinity]]);
    this.stack = [];
  }

  load(tokenizer) {
    this.tokenizer = tokenizer;
  }

  validateFunctionName(nameToken) {
    if (nameToken == null) {
      throw new Error('I dont know how to tokenize this');
    } else if (nameToken.type === 'eof') {
      throw new Error('You need to say what the name os for to.');
    } else if (nameToken.type === 'wrd') {
      return nameToken.data;
    } else {
      throw new Error(`${nameToken.data} is not a good name for a function`);
    }
  }

  defineFunction(token) {
    const nameToken = this.tokenizer.next();
    const name = this.validateFunctionName(nameToken)

    const args = [];
    let childToken = null;
    while (true) {
      childToken = this.tokenizer.peek();
      if (childToken == null) {
        throw new Error('I dont know how to tokenize this');
      } else if (childToken.type === 'eof') {
        throw new Error(`to ${name} needs an end`);
      } else if (childToken.type != 'let') {
        break;
      } 
      args.push(this.tokenizer.next());
      this.addCommand(name, args.length);
    };

    const code = [];

    while (true) {
      childToken = this.tokenizer.next();
      if (childToken == null) {
        throw new Error('I dont know how to tokenize this');
      } else if (childToken.type === 'eof') {
        throw new Error(`to ${name} needs an end`);
      } else if (childToken.type === 'ops' && childToken.data === 'to') {
        throw new Error('Im sorry, you cant have nested to');
      } else if (childToken.type === 'ops' && childToken.data === 'end') {
        token.type = 'def';
        token.data = name;
        token.args = new Command(args, code);
        return token;
      }
      code.push(childToken);
    };
  }

  bracket(token) {
    let args = [];
    let peekedToken = this.tokenizer.peek();
    let name = (peekedToken && peekedToken.type === 'wrd') ? this.tokenizer.next() : null;

    while (true) {
      let childToken = this.next();
      if (childToken == null) {
        throw new Error('I dont know how to tokenize this');
      } else if (childToken.type === 'eof') {
        throw new Error('Youre missing a )');
      } else if (childToken.type === 'ops' && childToken.data === ')') {
        if (name) {
          token = name;
          token.args = args;
        } else if (args.length === 1) {
          token = args[0];
        } else {
          token.type = 'lst';
          token.args = args;
        }
    
        return token;
      }
      args.push(childToken);
    };
  }

  createList(token) {
    let args = [];
    while (true) {
      let childToken = this.next();

      if (childToken == null) {
        throw new Error('I dont know how to tokenize this');
      } else if (childToken.type === 'eof') {
        throw new Error('Youre missing a ]');
      } else if (childToken.type === 'ops' && childToken.data === ']') {
        token.type = 'lst';
        token.args = args;
        return token;
      }
      args.push(childToken);
    };
  }

  infix(token, precedent) {
    while (true) {
      let peekedToken = this.tokenizer.peek();
      if (peekedToken && this.infixes.get(peekedToken.data) && this.infixes.get(peekedToken.data) < precedent) {
        const childToken = this.tokenizer.next();
        const right = this.next(this.infixes.get(peekedToken.data));
        childToken.args = new Array(token, right);
        token = childToken;
      } else {
        return token;
      }
    }
  }

  clearTokenizer(token) {
    this.tokenizer = null;
    return token;
  }

  bundleCommand(token) {
    const argsCount = this.commands.get(token.data);
    for(let i = 0; i < argsCount; i++) {
      token.addArg(this.next());
    };
    return token;
  }

  handleOperator(token) {
    switch(token.data) {
      case '(':  return this.bracket(token);
      case '[':  return this.createList(token);
      case 'to': return this.defineFunction(token);
      default:   return token;
    }
  }

  next(precedent = 100) {
    let token = this.tokenizer.next();
    switch(token.type) {
      case 'eof': return this.clearTokenizer(token);
      case 'ops': return this.handleOperator(token);
      case 'wrd': return this.bundleCommand(token);
      default:    return this.infix(token, precedent);
    }
  }

  addCommand(command, argsLength) {
    this.commands.set(command, argsLength);
  }

  addInfix(operator, precedent) {
    this.infixes.set(operator, precedent);
  }
}