describe("Parser",function(){
  var tokenizer;
  var parser;

  beforeEach(function() {
    tokenizer = new Tokenizer();
    parser = new Parser();
  });

  it('can parse empty code', () => {
    tokenizer.load("");
    parser.load(tokenizer);
    let item = parser.next();
    expect(item.type).toEqual('eof');
  });

  it('can parse command with one argument', () => {
    tokenizer.load("right 10");
    parser.addCommand('right',1);
    parser.load(tokenizer);

    let command, argument;
    command = parser.next();
    expect(command instanceof Token).toBeTruthy();
    expect(command.type).toEqual('wrd');
    expect(command.data).toEqual('right');
    expect(command.args.length).toEqual(1);

    argument = command.args[0];
    expect(argument instanceof Token).toBeTruthy();
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(10);
  });

  it('can parse infix operator', () => {
    tokenizer.load("10 + 3.141");
    parser.addInfix('+',40);
    parser.load(tokenizer);

    let command, argument;
    command = parser.next();
    expect(command instanceof Token).toBeTruthy();
    expect(command.type).toEqual('ops');
    expect(command.data).toEqual('+');
    expect(command.args.length).toEqual(2);

    argument = command.args[0];
    expect(argument instanceof Token).toBeTruthy();
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(10);

    argument = command.args[1];
    expect(argument instanceof Token).toBeTruthy();
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(3.141);
  });


  it('can parse variable assignment', () => {
    tokenizer.load('make "count 3.141');
    parser.addCommand('make', 2)
    parser.load(tokenizer);

    let command, argument;
    command = parser.next();
    expect(command instanceof Token).toBeTruthy();
    expect(command.type).toEqual('wrd');
    expect(command.data).toEqual('make');
    expect(command.args.length).toEqual(2);

    argument = command.args[0];
    expect(argument instanceof Token).toBeTruthy();
    expect(argument.type).toEqual('sym');
    expect(argument.data).toEqual('count');

    argument = command.args[1];
    expect(argument instanceof Token).toBeTruthy();
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(3.141);
  });

  it('can parse maths expression with ()', () => {
    tokenizer.load("2 * (10 + 3.141)");
    parser.addInfix('+',40);
    parser.addInfix('*',20);
    parser.load(tokenizer);

    let command, argument, subcommand;
    command = parser.next();
    expect(command instanceof Token).toBeTruthy();
    expect(command.type).toEqual('ops');
    expect(command.data).toEqual('*');
    expect(command.args.length).toEqual(2);

    argument = command.args[0];
    expect(argument instanceof Token).toBeTruthy();
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(2);

    subcommand = command.args[1];
    expect(subcommand instanceof Token).toBeTruthy();
    expect(subcommand.data).toEqual('+');
    expect(subcommand.args.length).toEqual(2);

    argument = subcommand.args[0];
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(10);


    argument = subcommand.args[1];
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(3.141);
  });

  it('can parse maths expression with precedence', () => {
    tokenizer.load("2 + 10 * 3.141)");
    parser.addInfix('+',40);
    parser.addInfix('*',20);
    parser.load(tokenizer);

    let command, argument, subcommand;
    command = parser.next();
    expect(command instanceof Token).toBeTruthy();
    expect(command.type).toEqual('ops');
    expect(command.data).toEqual('+');
    expect(command.args.length).toEqual(2);

    argument = command.args[0];
    expect(argument instanceof Token).toBeTruthy();
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(2);

    subcommand = command.args[1];
    expect(subcommand instanceof Token).toBeTruthy();
    expect(subcommand.data).toEqual('*');
    expect(subcommand.args.length).toEqual(2);

    argument = subcommand.args[0];
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(10);


    argument = subcommand.args[1];
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(3.141);
  });

  it('can parse a repeat loop', () => {
    parser.addCommand('repeat', 2)
    tokenizer.load("repeat 100 [fw random 40 rt random 360]");
    parser.load(tokenizer);

    let command = parser.next();
    expect(command instanceof Token).toBeTruthy();
    expect(command.type).toEqual('wrd');
    expect(command.data).toEqual('repeat');
    expect(command.args.length).toEqual(2);


    let argument = command.args[0];
    expect(argument instanceof Token).toBeTruthy();
    expect(argument.type).toEqual('num');
    expect(argument.data).toEqual(100);

    let list = command.args[1];

    expect(list instanceof Token).toBeTruthy();
    expect(list.type).toEqual('lst');
    expect(list.data).toEqual('[');
    expect(list.args.length).toEqual(6);

  });

  it('can parse function definition', () => {
    tokenizer.load("to square\nend");
    parser.load(tokenizer);

    let token = parser.next();
    expect(token instanceof Token).toBeTruthy();
    expect(token.type).toEqual('def');
    expect(token.data).toEqual('square');
    expect(token.args.raw.length).toEqual(0);
  });


  it('can parse function definition, and then move on to next command after definition', () => {
    tokenizer.load("to punkt\ncircle 10\nend\npunkt");
    parser.load(tokenizer);

    let token = parser.next();
    expect(token instanceof Token).toBeTruthy();
    expect(token.type).toEqual('def');
    expect(token.data).toEqual('punkt');
    expect(token.args.raw.length).toEqual(2);

    token = parser.next();
    expect(token instanceof Token).toBeTruthy();
    expect(token.type).toEqual('wrd');
    expect(token.data).toEqual('punkt');
  });

//  if :c = 0 [stop]
// color [255-:d*5 0+:d*20 0+:d*50]

});

