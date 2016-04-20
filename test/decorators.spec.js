"use strict"

const deco = require('../decorators'),
  fitIn = deco.fitIn,
  checkIn = deco.checkIn,
  checkOut = deco.checkOut,
  compose = deco.compose,
  check = deco.check,
  curryCheck = deco.curryCheck,
  fitInNested = deco.fitInNested,
  assert = require('chai').assert,
  expect = require('chai').expect


class X {}
class Y extends X {}
const y = new Y,
A = {},
B = Object.create(A),
b = Object.create(B)

describe('fitIn', function(){
  it('fitIn("number")(4)', function(){ assert(fitIn(Number)(4)) })
  it('fitIn(X)(y)', function(){ assert(fitIn(X)(y)) })
  it('fitIn(A)(b)', function(){ assert(fitIn(A)(b)) })
})

describe('compose', function(){
  it('compose(o=>o.name, s=>s.length)({name: "fred"})', function(){
    expect(compose(o=>o.name, s=>s.length)({name: "fred"})).to.equal(4)
  })
})

describe('checkIn', function(){
  const id = checkIn(fitIn(A))(_=>_)
  it('id[A](b)', function(){ id(b) })
  it('id[A](y)', function(){ expect(_=>id(y)).to.throw() })
})

describe('checkOut', function(){
  const num = checkOut(fitIn(Number))(_=>_)
  it('num(4)', function(){ num(4) })
  it('num("4")', function(){ expect(_=>num("4")).to.throw() })
})

describe('checkOut+checkIn', function(){
  const stringLength_ = s=>s.length,
  stringLengthIn =
    checkIn(fitIn(String))
    (stringLength_),
  stringLengthOut =
    checkOut(fitIn(Number))
    (stringLength_)

  it('stringLength("hello")/In/Out', function(){
    expect(stringLengthIn("hello")).to.equal(5)
    expect(stringLengthOut("hello")).to.equal(5)
    expect(_=>stringLengthIn([1,2])).to.throw()
    expect(stringLengthOut([1,2])).to.equal(2)
  })

  it('stringLength("hello")', function(){
    const stringLength =
      checkIn(fitIn(String))(
      checkOut(fitIn(Number))(
        s=>s.length
      ))
    expect(stringLength("hello")).to.equal(5)
  })

  it('stringLength2("hello")', function(){
    const stringLength2 =
      compose(checkIn(fitIn(String),(checkOut(fitIn(Number)))))
      (s=>s.length)
    expect(stringLength2("hello")).to.equal(5)
  })

})

describe('check', function(){
  it('stringLength3("hello")', function(){
    const stringLength2 =
      check(String, Number)
      (s=>s.length)
    expect(stringLength2("hello")).to.equal(5)
  })
})

describe('curryCheck', function(){
  it('Array->Number->String', function(){
    const curried = curryCheck(Array, Number, String)(a=>n=>a+" "+n+" hello")
    expect(curried([1,2])(3)).to.equal("1,2 3 hello")
    expect(()=>
      curryCheck(Array, Number, String)(a=>n=>a.length)([1])(1)
    ).to.throw()
  })
  it('(String->Number)->Number->Number', function(){
    const fun = curryCheck(curryCheck(String, Number), Number, Number)
      (f=>n=>f("hello")+n)
    expect(fun(s=>s.length)(3)).to.equal(8)
    expect(_=>fun(s=>s)(3)).to.throw()
  })
})

describe('fitInNested', function(){
  it('ok', function(){
    curryCheck([{x: String}],{a: Number, b: [String]})(_=>({a:1, b:["c"]}))([{x: "hola"}])
    expect(()=>
      curryCheck([{x: String}],{a: Number, b: [String]})(_=>({a:1, b:["c"]}))({x: "hola"})
    ).to.throw()
    expect(()=>
      curryCheck([{x: String}],{a: Number, b: [String]})(_=>([]))([{x: "hola"}])
    ).to.throw()
    assert(fitInNested([Number])([1]))
    assert(!fitInNested([Number])(["hello"]))
    assert(fitInNested({a: Number})({a:1}))
    assert(!fitInNested({a: Number})({a:"hello"}))
    expect(()=>
      curryCheck([{x: String}],{a: Number, b: [String]})(_=>({a:1, b:["c"]}))([{x: 4}])
    ).to.throw()
  })
})
