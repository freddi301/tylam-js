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
