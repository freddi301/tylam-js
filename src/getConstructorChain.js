const getSuperConstructor = o => Object.getPrototypeOf(o.constructor)

const getConstructorChain = c => {
  const constructors = []
  while (c !== Function.prototype) {
    constructors.push(c)
    c = getSuperConstructor(c.prototype)
  }
  constructors.push(Object)
  return constructors
}

module.exports = getConstructorChain
