# tylam-js
Haskellish runtime tipecheck for JavaScript

## Install

      npm install tylam-js

## Usage

      const t = require('tylam-js')

      const StringInputNumberOutput = t(String, Number)(textToNumber => Number(textToNumber))

      const Number2StringFmap = t(t(Number, String), Array, Array)(f=>a=>a.map(f))

      const GenericFmapType = t(t('x','y'), 'a', 'a')

      GenericFmapType(f=>a=>a.map(f))

look into [test file](./test/complete.spec.js)
