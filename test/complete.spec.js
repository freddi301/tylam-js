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
})
