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
      fmap2 = l(l(B,Y), B, Y),
      fmap3 = fmap2(f=>m=>f(m));
    expect(t.canHoldType(fmap1, fmap1)).to.equal(true)
    expect(t.canHoldType(fmap2, fmap2)).to.equal(true)
    expect(t.canHoldType(fmap1, fmap2)).to.equal(true)
    expect(t.canHoldType(fmap2, fmap1)).to.equal(false)
    expect(t.canHoldType(fmap1, fmap3)).to.equal(true)
    expect(t.canHoldType(fmap2, fmap3)).to.equal(true);
    expect(t.canHoldType(fmap1(f=>m=>f(m)), fmap2(f=>m=>f(m))(x=>x))).to.equal(false)
    fmap3(l(B,Y)(b=>Object.create(Y)))(new B)
    expect(_=>fmap3(l(B,A)(b=>Object.create(Y)))(new B)).to.throw()
    expect(_=>fmap3(b=>Object.create(Y))(new A)).to.throw()
    expect(_=>fmap3(b=>Object.create(X))(new B)).to.throw()
  })
  it('join', function(){
    class A {}; class B extends A {};
    class X {}; class Y extends X {};
    const l = t.checkInOutFlatCurry,
      aA = l(A, A),
      aB = l(B, B),
      aX = l(X, X),
      aY = l(Y, Y),
      fA = aA(a=>a),
      fB = aB(b=>b),
      aBY = l(B,Y,Y),
      fBY = aBY(b=>y=>y)
    expect(t.canHoldType(aA, aB)).to.equal(true)
    expect(t.canHoldType(aA, aX)).to.equal(false)
    expect(t.canHoldType(aA, fA)).to.equal(true)
    expect(t.canHoldType(aA, fB)).to.equal(true)
    expect(t.canHoldType(aB, fB)).to.equal(true)
    expect(t.canHoldType(aB, fA)).to.equal(false)
    expect(t.canHoldType(aX, aBY)).to.equal(false)
    expect(t.canHoldType(aY, aBY)).to.equal(false)
    expect(t.canHoldType(aX, fBY(new B))).to.equal(true)
    expect(t.canHoldType(aY, fBY(new B))).to.equal(true)
    expect(t.canHoldType(aA, fBY(new B))).to.equal(false)
  })
})

describe('generic', function(){
  it('simple', function(){
    const l = t.checkInOutFlatCurry
    expect(l('a','a','a')(a1=>a2=>a1+a2)(1)(2)).to.equal(3)
    expect(_=>l('a','a','a')(a1=>a2=>a1+a2)(1)("c")).to.throw()
    expect(l('a','b','a','b')(a1=>b1=>a2=>a1+b1+a2)(1)('plus')(2)).to.equal('1plus2')
    expect(_=>l('a','b','a','b')(a1=>b1=>a2=>a1)(1)('plus')(2)).to.throw()
  })
})
