const getSuperConstructor = o => Object.getPrototypeOf(o.constructor)

const getConstructorChain = (c, lim) => {
  const constructors = []
  while (c !== Function.prototype && constructors.length <= (lim || Infinity)) {
    constructors.push(c)
    c = getSuperConstructor(c.prototype)
  }
  constructors.push(Object)
  return constructors
}

module.exports = getConstructorChain
