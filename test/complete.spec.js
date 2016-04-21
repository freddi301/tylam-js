"use strict"

const t = require('../'),
  expect = require('chai').expect

describe('checkInOut', function(){
  const String_Number = t.checkInOut(String, Number),
    strlen = String_Number(function strlen(s){return s.length}),
    strlenBroken = String_Number(function strlenBroken(s){return s})
  it('strlen', function(){
    expect(_=>strlen(3)).to.throw()
    expect(strlen("hello")).to.equal(5)
    expect(_=>strlenBroken("hello")).to.throw()
  })
  const NumberString_Boolean = t.checkInOut([Number,String], Boolean),
    numberEqualString = NumberString_Boolean(function numberEqualString(n,s){return n==s})
  it('numberEqualString', function(){
    expect(numberEqualString(4,'4')).to.equal(true)
    expect(_=>numberEqualString(4,4)).to.throw()
  })
  it('curry', function(){
    // Number->String->Boolean
    const nsb = t.checkInOut(Number, t.checkInOut(String, Boolean)),
      f = nsb(n=>s=>n==s),
      f2 = nsb(n=>s=>s)
    expect(f(4)("4")).to.equal(true)
    expect(f(4)("5")).to.equal(false)
    expect(_=>f("4")("4")).to.throw()
    expect(_=>f(4)(4)).to.throw()
    expect(_=>f2(4)("4")).to.throw()
    expect(_=>f2(4,"4")).to.throw()
  })
  it('flatCurry', function(){
    // Number->String->Boolean
    const nsb = t.checkInOutFlatCurry(Number, String, Date, Boolean),
      f = nsb(n=>s=>d=>n==s),
      f2 = nsb(n=>s=>d=>s),
      d = new Date
    expect(f(4)("4")(d)).to.equal(true)
    expect(f(4)("5")(d)).to.equal(false)
    expect(_=>f("4")("4")(d)).to.throw()
    expect(_=>f(4)("4")(5)).to.throw()
    expect(_=>f(4)(4)(d)).to.throw()
    expect(_=>f2(4)("4")(d)).to.throw()
    expect(_=>f2(4,"4")(d)).to.throw()
  })
})

describe('canHoldType', function(){
  it('simple', function(){
    expect(t.canHoldType(Object, Object)).to.equal(true)
    expect(t.canHoldType(Array, Object)).to.equal(false)
    class A {}; class B extends A {};
    expect(t.canHoldType(A, B)).to.equal(true)
    expect(t.canHoldType(B, A)).to.equal(false)
    const X = {}, Y = Object.create(X);
    expect(t.canHoldType(X, Y)).to.equal(true)
    expect(t.canHoldType(Y, X)).to.equal(false)
  })
  it('with checkers', function(){
    const String_Number = t.checkInOut(String, Number),
      StringNumber_Boolean = t.checkInOut([String, Number], Boolean),
      StringNumber_$String_Number$ = t.checkInOutFlatCurry([String, Number], String_Number)
    expect(t.canHoldType(String_Number, String_Number)).to.equal(true)
    expect(t.canHoldType(StringNumber_Boolean, StringNumber_Boolean)).to.equal(true)
    expect(t.canHoldType(StringNumber_$String_Number$, StringNumber_$String_Number$)).to.equal(true)
  })
  it('functor', function(){
    class A {}; class B extends A {};
    const X = {}, Y = Object.create(X), l = t.checkInOutFlatCurry,
      fmap1 = l(l(A,X), A, X),
      fmap2 = l(l(B,Y), B, Y);
    expect(t.canHoldType(fmap1, fmap1)).to.equal(true)
    expect(t.canHoldType(fmap2, fmap2)).to.equal(true)
    expect(t.canHoldType(fmap1, fmap2)).to.equal(true)
    expect(t.canHoldType(fmap2, fmap1)).to.equal(false)
  })
})
