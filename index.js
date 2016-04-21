"use strict"

const FUNCTION_META = Symbol(),
  IS_CHECKER = Symbol()

const throwe = e => {throw e}

const fitIn = (blueprint, object) => { if(blueprint === null) return false; switch (typeof blueprint) {
  case 'object': return blueprint.isPrototypeOf(object);
  case 'function': switch (blueprint) {
    case String: return typeof object === 'string';
    case Number: return typeof object === 'number';
    case Boolean: return typeof object === 'boolean';
    default: return object instanceof blueprint;
  }
  default: throwe({msg: 'invalid blueprint', blueprint})
}}

const getFit = value => { if (value === null) return null; switch(typeof value){
  case 'undefined': return void undefined;
  case 'string': return String;
  case 'number': return Number;
  case 'boolean': return Boolean;
  case 'object': switch(value.constructor){
    case Object: return Object.getPrototypeOf(value);
    default: return value instanceof value.constructor ? value.constructor : throwe({msg: 'cannot get type of', value, reason: 'value is not instanceof value.constructor'});
  };
  default: throwe({msg: 'cannot get type of', value})
}}

const checkInOut = (argumentType, returnType) => {
  const checker = (f, self) => {
    const argumentTypes = argumentType instanceof Array ? argumentType : [argumentType];
    if (! f instanceof Function) throwe({msg: 'function needed', f})
    const decorated = function (){
      const args = Array.from(arguments)
      if (args.length !== argumentTypes.length) throwe({msg: 'argument count does not match', expected: argumentTypes.length, got: args.length});
      const mismatched = argumentTypes.find((b, i)=>!fitIn(b, args[i]))
      if (mismatched) throwe({msg: 'invalid arguments', expectedTypes: argumentTypes, gotTypes: args.map(getFit), mismatched, gotValues: args, f, self });
      const returnedValue = f.apply(self || this, args)
      if (returnType[IS_CHECKER]) {
        return returnType(returnedValue, self)
      }
      if (!fitIn(returnType, returnedValue)) throwe({msg: 'invalid return value', returnType, returnedValue})
      return returnedValue
    }
    decorated[FUNCTION_META] = {argumentTypes, returnType, self, f}
    if (f.name) Object.defineProperty(decorated, 'name', { value: f.name });
    return decorated
  }
  checker[IS_CHECKER] = true
  return checker
}

const checkInOutFlatCurry = function(){
  const args = Array.from(arguments),
    recBind = n => n == args.length-1 ? args[n] : checkInOut(args[n], recBind(n+1))
  switch(args.length){
    case 0:
    case 1: throw {msg: 'argument and return needed'};
    case 2: return checkInOut(args[0], args[1]);
    default: return recBind(0)
  }
}

module.exports = {getFit, fitIn, checkInOut, checkInOutFlatCurry}
