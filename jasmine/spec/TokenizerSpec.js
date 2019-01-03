describe("Tokenizer",function(){
  var tokenizer;

  beforeEach(function() {
    tokenizer = new Tokenizer();
  });

  it('can tokenize empty code', () => {
    tokenizer.load("");
    let token = tokenizer.next();
    expect(token.type).toEqual('eof');
  });

  it('can tokenize with next', () => {
    tokenizer.load("right 10");
    let token;
    token = tokenizer.next();
    expect(token instanceof Token).toBeTruthy();
    expect(token.type).toEqual('wrd');
    expect(token.data).toEqual('right');
    token = tokenizer.next();
    expect(token.type).toEqual('num');
    expect(token.data).toEqual(10);
    token = tokenizer.next();
    expect(token.type).toEqual('eof');
  });

  it('can peek ahead with peek', () => {
    tokenizer.load("right 10");
    let token;
    token = tokenizer.peek();
    expect(token instanceof Token).toBeTruthy();
    expect(token.type).toEqual('wrd');
    expect(token.data).toEqual('right');
  });

  it('can peek ahead with peek, without disturbing next', () => {
    tokenizer.load("right 10");
    let token;
    token = tokenizer.peek();
    expect(token instanceof Token).toBeTruthy();
    expect(token.type).toEqual('wrd');
    expect(token.data).toEqual('right');
    token = tokenizer.next();
    expect(token.type).toEqual('wrd');
    expect(token.data).toEqual('right');
    token = tokenizer.peek();
    expect(token.type).toEqual('num');
    expect(token.data).toEqual(10);
    token = tokenizer.next();
    expect(token.type).toEqual('num');
    expect(token.data).toEqual(10);
    token = tokenizer.next();
    expect(token.type).toEqual('eof');
  });

  it('will ignore comments', () => {
    tokenizer.load(`; one line comment`);
    let token = tokenizer.next();
    expect(token.type).toEqual('eof');
  });

  it('can tokenize a word', () => {
    tokenizer.load("aword");
    let token = tokenizer.next();
    expect(token.type).toEqual('wrd');
    expect(token.data).toEqual('aword');
  });

  it('can tokenize to and end as operators', () => {
    let token;
    for (code of ["TO square END", "to square\n end"]) {
      tokenizer.load( code );
      token = tokenizer.next();
      expect(token.type).toEqual('ops');
      expect(token.data).toEqual('to');
      token = tokenizer.next();
      expect(token.type).toEqual('wrd');
      expect(token.data).toEqual('square');
      token = tokenizer.next();
      expect(token.type).toEqual('ops');
      expect(token.data).toEqual('end');
    }
  });

  it('can tokenize operators', () => {
    for( o of [ '!=', '<>', '<=', '>=', '<', '>', '+', '-', '*', '/', '%', '=',
                '[', ']', '(', ')' ] ) {
      tokenizer.load(o);
      let token;
      token = tokenizer.next();
      expect(token.type).toEqual('ops');
      expect(token.data).toEqual(o);
    }
  });

  it('can tokenize variables', () => {
    for( w of [ ':a', ':longvar' ] ) {
      tokenizer.load(w);
      let token;
      token = tokenizer.next();
      expect(token.type).toEqual('var');
      expect(token.data).toEqual(w.substr(1));
    }
  });

  it('can tokenize numbers', () => {
    for( w of [ '3', '3.141', '50000' ] ) {
      tokenizer.load(w);
      let token;
      token = tokenizer.next();
      expect(token.type).toEqual('num');
      expect(token.data).toEqual(parseFloat(w));
    }
  });


  it('can tokenize symbols', () => {
    for( w of [ '"a', '"long' ] ) {
      tokenizer.load(w);
      let token;
      token = tokenizer.next();
      expect(token.type).toEqual('sym');
      expect(token.data).toEqual(w.substr(1));
    }
  });
});

