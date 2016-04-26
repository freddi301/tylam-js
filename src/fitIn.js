const throwe = require('./throwe')

const fitIn = (blueprint, object) => {
  if(blueprint === null) return object === null;
  switch (typeof blueprint) {
    case 'object': return blueprint.isPrototypeOf(object);
    case 'function': switch (blueprint) {
      case String: return typeof object === 'string';
      case Number: return typeof object === 'number';
      case Boolean: return typeof object === 'boolean';
      default: return object instanceof blueprint;
    };
    default: throwe({msg: 'invalid blueprint', blueprint})
  }
}

module.exports = fitIn
