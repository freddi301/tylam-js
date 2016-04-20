const Type = name => {
  const symbol = Symbol(name),
  check = type => matched => unmatched =>
    type.symbol === symbol ?
    matched(type.value) :
    unmatched({type, name}),
  checkOut = lambda => check(lambda(null))
  checkIn = lambda => argument => check(argument)(lambda)
  create = value => ({value, symbol, check, checkOut, checkIn})
  return {symbol, check, create, checkOut, checkIn}
}

module.exports = Type
