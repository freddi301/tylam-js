"use strict"

const ORIGINAL_FUNCTION = Symbol(),
  SELF = Symbol(),
  ARGUMENT_TYPES = Symbol(),
  RETURN_TYPE = Symbol()

const throwe = e => {throw e}

function Any(){} //any type holds

const fitIn = (blueprint, object) => { if(blueprint === null) return false; switch (typeof blueprint) {
  case 'object': return blueprint.isPrototypeOf(object);
  case 'function': switch (blueprint) {
    case String: return typeof object === 'string';
    case Number: return typeof object === 'number';
    case Boolean: return typeof object === 'boolean';
    case Any: return true;
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

const checkInOut = (argumentType, returnType) => (f, self) => {
  const argumentTypes = argumentType instanceof Array ? argumentType : [argumentType];
  if (! f instanceof Function) throwe({msg: 'function needed', f})
  const decorated = function (){
    const args = Array.from(arguments)
    const mismatched = argumentTypes.find((b, i)=>!fitIn(b, args[i]))
    if (mismatched) throwe({msg: 'invalid arguments', expectedTypes: argumentTypes, gotTypes: args.map(getFit), mismatched, gotValues: args, f, self });
    const returnedValue = f.apply(self, args)
    if (!fitIn(returnType, returnedValue)) throwe({msg: 'invalid return value', returnType, returnedValue})
    return returnedValue
  }
  decorated[ARGUMENT_TYPES] = argumentTypes
  decorated[RETURN_TYPE] = returnType
  decorated[ORIGINAL_FUNCTION] = f
  decorated[SELF] = self
  if (f.name) Object.defineProperty(decorated, 'name', { value: f.name });
  return decorated
}

module.exports = {getFit, checkInOut}
