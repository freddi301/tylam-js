const fitIn = blueprint => object => { switch (typeof blueprint) {
  case 'object': return blueprint.isPrototypeOf(object);
  case 'function': switch (blueprint) {
    case String: return typeof object === 'string';
    case Number: return typeof object === 'number';
    case Boolean: return typeof object === 'boolean';
    default: return object instanceof blueprint;
  }
}}

const _ = require('lodash')

const fitInNested = blueprint =>
  _.isPlainObject(blueprint) ? (
    object => _.isPlainObject(object) ? !Object.keys(blueprint).find(x=>!fitInNested(blueprint[x])(object[x])) : false
  ) :
  _.isArray(blueprint) ? (
    object => _.isArray(object) ? blueprint.length === object.length &&
      !object.find((x, i)=>!fitInNested(blueprint[i])(x)) : false
  ) :
  object => fitIn(blueprint)(object)

const compose = function(){ return arg =>
  Array.prototype.reduce.call(arguments, (a,f)=>f(a), arg)
}

const throwe = e => {throw e}

const checkIn = check => f =>
  a => check(a) ? f(a) : throwe(new Error(a))

const checkOut = check => f =>
  a => { const r = f(a); return check(r) ? r : throwe(new Error(r)) }

const check = (inT, ouT) =>
  compose(checkOut(fitIn(ouT)), checkIn(fitIn(inT)))

const checkCurry = checks => f =>
  a => checks.length > 2 ?
    checkCurry(checks.slice(1))(checkIn(checks[0])(f)(a)) :
    compose(checkIn(checks[0]),checkOut(checks[1]))(f)(a)

const CURRY_CHECK = Symbol('curryCheck')
const curryCheck = function curryCheck(){
  const r = f => checkCurry(
    Array.prototype.slice.call(arguments)
    .map(t=>t[CURRY_CHECK]?t:fitInNested(t))
  )(f)
  r[CURRY_CHECK] = true
  return r
}

module.exports = {fitIn, compose, checkIn, checkOut, check, curryCheck, fitInNested}
