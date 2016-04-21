const Type = require('../type'),
  expect = require('chai').expect,
  ok = v => "ok",
  err = v => "err"


describe('constant check', ()=>{
  const StringType = Type("String"),
    NumberType = Type("Number"),
    ciao = StringType.create("ciao"),
    hello = StringType.create('hello'),
    n4 = NumberType.create(4)
  describe('type to type check', ()=>{
    it("should be equal", ()=>expect(StringType.symbol===StringType.symbol).to.equal(true))
    it("should be not equal", ()=>expect(StringType.symbol===NumberType.symbol).to.equal(false))
    const t1 = StringType.check(StringType)(ok)(err)
    it('should be ok', ()=>expect(t1).to.equal("ok"))
    const t2 = StringType.check(NumberType)(ok)(err)
    it('should be err', ()=>expect(t2).to.equal("err"))
  })
  describe('type value check', ()=>{
    it('should be ok', ()=> expect(StringType.check(ciao)(ok)(err)).to.equal('ok'))
    it('should be ok', ()=> expect(ciao.check(hello)(ok)(err)).to.equal('ok'))
    it('should be err', ()=> expect(StringType.check(n4)(ok)(err)).to.equal('err'))
    it('should be err', ()=> expect(n4.check(ciao)(ok)(err)).to.equal('err'))
  })
  const lambda_n4 = x=>ciao // :: a => Number
  describe('lambda returning constant', ()=>{
    it('should be err', ()=> expect(NumberType.checkOut(lambda_n4)(ok)(err)).to.equal('err'))
    it('should be ok', ()=> expect(StringType.checkOut(lambda_n4)(ok)(err)).to.equal('ok'))
  })
  const stringLength = s=>NumberType.create(s.length)
  describe('lambda getting argument', ()=>{
    it('should be ok', ()=> expect(
      NumberType.check(
        StringType.checkIn(stringLength)(ciao)(err)
      )(ok)(err)
    ).to.equal('ok'))
    /*it('should be err', ()=> expect(

    ).to.equal('err'))*/
  })
})
