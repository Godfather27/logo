class Token {
  constructor(type, data) {
    this.type = type;
    this.data = data;
    this.args = [];
  }

  addArg(arg) {
    this.args.push(arg)
  }

  toString() {
    return `(${this.type})${this.data}`;
  }
}

class Tokenizer {
  constructor() {
    this.ops = [ '!=', '<>', '<=', '>=', '<', '>', '+', '-', '*', '/', '%', '=', '[', ']', '(', ')' ];
  }

  load(text) {
    text = text
      .replace(/\;.*$/g, "")
      .replace(/\n/g, " ")
      .replace(/(\[)(\w+)/g, (_, p1, p2) => `${p1} ${p2}`)
      .replace(/(\w+)(\])/g, (_, p1, p2) => `${p1} ${p2}`)
      .replace(/(\()([^\s])/g, (_, p1, p2) => `${p1} ${p2}`)
      .replace(/([^\s])(\))/g, (_, p1, p2) => `${p1} ${p2}`)
    this.source = text.split(" ").filter(token => token !== "");
  }

  peek() {
    let data = this.source[0];
    let type;
    [data, type] = this.tokenize(data)
    return new Token(type, data);
  }

  tokenize(data) {
    let type;
    if(typeof data === "undefined" || data === "") {
      type = "eof";
    } else if(!isNaN(parseFloat(data)) && typeof parseFloat(data) === "number") {
      data = parseFloat(data);
      type = "num";
    } else if (/to|end/i.test(data) || this.ops.indexOf(data) !== -1) {
      type = "ops"
      data = data.toLowerCase();
    } else if (/^:/.test(data)) {
      type = "var"
      data = data.substr(1);
    } else if (/^"/.test(data)) {
      type = "sym"
      data = data.substr(1);
    } else {
      type = "wrd";
    }
    return [data, type]
  }

  next() {
    const [data, type] = this.tokenize(this.source.shift());
    const args = [];
    return new Token(type, data, args);
  }
}

