"use strict"

const deco = require('../decorators'),
  fitIn = deco.fitIn,
  checkIn = deco.checkIn,
  checkOut = deco.checkOut,
  compose = deco.compose,
  check = deco.check,
  curryCheck = deco.curryCheck,
  assert = require('chai').assert,
  expect = require('chai').expect


class X {}
class Y extends X {}
const y = new Y,
A = {},
B = Object.create(A),
b = Object.create(B)

describe('fitIn', function(){
  it('fitIn("number")(4)', function(){ assert(fitIn("number")(4)) })
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
  const num = checkOut(fitIn("number"))(_=>_)
  it('num(4)', function(){ num(4) })
  it('num("4")', function(){ expect(_=>num("4")).to.throw() })
})

describe('checkOut+checkIn', function(){
  const stringLength_ = s=>s.length,
  stringLengthIn =
    checkIn(fitIn("string"))
    (stringLength_),
  stringLengthOut =
    checkOut(fitIn("number"))
    (stringLength_)

  it('stringLength("hello")/In/Out', function(){
    expect(stringLengthIn("hello")).to.equal(5)
    expect(stringLengthOut("hello")).to.equal(5)
    expect(_=>stringLengthIn([1,2])).to.throw()
    expect(stringLengthOut([1,2])).to.equal(2)
  })

  it('stringLength("hello")', function(){
    const stringLength =
      checkIn(fitIn('string'))(
      checkOut(fitIn('number'))(
        s=>s.length
      ))
    expect(stringLength("hello")).to.equal(5)
  })

  it('stringLength2("hello")', function(){
    const stringLength2 =
      compose(checkIn(fitIn('string')),(checkOut(fitIn('number'))))
      (s=>s.length)
    expect(stringLength2("hello")).to.equal(5)
  })

})

describe('check', function(){
  it('stringLength3("hello")', function(){
    const stringLength2 =
      check('string','number')
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
})
