"use strict"

const FUNCTION_META = Symbol(),
  IS_CHECKER = Symbol(),
  NEED_INFERER = Symbol(),
  fitIn = require('./fitIn'),
  getFit = require('./getFit'),
  throwe = require('./throwe')

const isGeneric = t => typeof t === 'string'

const checkInOut = (argumentType, returnType, inferer) => {
  const argumentTypes = (argumentType instanceof Array ? argumentType : [argumentType]).map(a=>a[NEED_INFERER]?a(inferer):a)
  returnType = returnType[NEED_INFERER]?returnType(inferer): returnType
  const checker = (f, self) => {
    if (! f instanceof Function) throwe({msg: 'function needed', f})
    if (f[FUNCTION_META]) { if(canHoldType(checker, f)) return f; else throwe({msg: 'cannot hold annotated function'}) }
    const decorated = function (){
      const args = Array.from(arguments)
      if (args.length !== argumentTypes.length) throwe({msg: 'argument count does not match', expected: argumentTypes.length, got: args.length});
      const mismatched = argumentTypes.find((b, i)=>b[IS_CHECKER]?!args[i] instanceof Function:!fitIn(isGeneric(b)?inferer(b,args[i]):b, args[i]))
      if (mismatched) throwe({msg: 'invalid arguments', expectedTypes: argumentTypes, gotTypes: args.map(getFit), mismatched, gotValues: args, f, self });
      const returnedValue = f.apply(self || this, argumentTypes.map((b, i)=> b[IS_CHECKER] ? b(args[i], self) : args[i]))
      if (isGeneric(returnType)) return (inferer(returnType, returnedValue), returnedValue)
      if (returnType[IS_CHECKER]) return returnType(returnedValue, self)
      if (!fitIn(returnType, returnedValue)) throwe({msg: 'invalid return value', returnType, returnedValue})
      return returnedValue
    }
    decorated[FUNCTION_META] = {argumentTypes, returnType, self, f}
    if (f.name) Object.defineProperty(decorated, 'name', { value: f.name });
    return decorated
  }
  checker[IS_CHECKER] = true
  checker[FUNCTION_META] = {argumentTypes, returnType}
  return checker
}

const Inferer = (dict)=>
  (name, value) =>
    dict.hasOwnProperty(name) ?
      (fitIn(dict[name], value)?dict[name]:throwe({msg: "invalid (ifered) type", expected: dict[name], got:getFit(value), value})):
      dict[name] = getFit(value)

const checkInOutFlatCurry = function(){
  const args = Array.from(arguments),
    inf = Inferer({}),
    recBind = n => n == args.length-1 ? args[n] : checkInOut(args[n], recBind(n+1), inf)
  switch(args.length){
    case 0:
    case 1: throw {msg: 'argument and return needed'};
    default: return recBind(0)
  }
}

const checkInOutFlatCurryInfere = function(){
  const args = Array.from(arguments)
  const need = inf => { inf = inf || Inferer({})
    const  recBind = n => n == args.length-1 ? args[n] : checkInOut(args[n], recBind(n+1), inf)
    switch(args.length){
      case 0:
      case 1: throw {msg: 'argument and return needed'};
      default: return recBind(0)
    }
  }
  need[NEED_INFERER] = true
  return need
}

const canHoldType = (major, minor) => {
  if (major === minor) return true;
  if (!!major[FUNCTION_META] !== !!minor[FUNCTION_META]) return false;
  if (!major[FUNCTION_META] && major.isPrototypeOf(minor)) return true;
  if (major[FUNCTION_META] && minor[FUNCTION_META]) return canDecoratedHold(major[FUNCTION_META], minor[FUNCTION_META])
  return false
}

const canDecoratedHold = (expected, got) => {
  if (expected.argumentTypes.length !== got.argumentTypes.length) return false
  if (!canHoldType(expected.returnType, got.returnType)) return false
  const mismatchedArg = expected.argumentTypes.find((eat, i)=>!canHoldType(eat, got.argumentTypes[i]))
  if (mismatchedArg) return false
  return true
}

const genericFunction = type => implementation =>
  function(){return type()(implementation).apply(this, arguments)}

const getConstructorChain = require('./getConstructorChain')

const genericClass = klass => {
  const classMap = new Map()
  function add(parameter){
    const existing = classMap.get(parameter)
    if (existing) return existing
    const newClass = klass(parameter, add(getConstructorChain(parameter)[1]))
    classMap.set(parameter, newClass)
    return newClass
  }
  classMap.set(Object, klass(Object, Object))
  return function(parameter){
    getConstructorChain(parameter).reverse().map(add)
    return add(parameter)
  }
}

module.exports = {getFit, fitIn, checkInOut, checkInOutFlatCurry, canHoldType, checkInOutFlatCurryInfere, genericFunction, genericClass}
