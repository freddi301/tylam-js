const throwe = require('./throwe')

const getFit = value => {
  if (value === null) return null;
  switch(typeof value){
    case 'undefined': return void 0;
    case 'string': return String;
    case 'number': return Number;
    case 'boolean': return Boolean;
    case 'function': return Function;
    case 'object': switch(value.constructor){
      case Object: return Object.getPrototypeOf(value);
      default: return value instanceof value.constructor ? value.constructor : throwe({msg: 'cannot get type of', value, reason: 'value is not instanceof value.constructor'});
    };
    default: throwe({msg: 'cannot get type of', value})
  }
}

module.exports = getFit
