"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPow = void 0;

var _factory = require("../../utils/factory.js");

var _number = require("../../utils/number.js");

var _array = require("../../utils/array.js");

var _index = require("../../plain/number/index.js");

var name = 'pow';
var dependencies = ['typed', 'config', 'identity', 'multiply', 'matrix', 'fraction', 'number', 'Complex'];
var createPow = /* #__PURE__ */(0, _factory.factory)(name, dependencies, function (_ref) {
  var typed = _ref.typed,
      config = _ref.config,
      identity = _ref.identity,
      multiply = _ref.multiply,
      matrix = _ref.matrix,
      number = _ref.number,
      fraction = _ref.fraction,
      Complex = _ref.Complex;

  /**
   * Calculates the power of x to y, `x ^ y`.
   * Matrix exponentiation is supported for square matrices `x`, and positive
   * integer exponents `y`.
   *
   * For cubic roots of negative numbers, the function returns the principal
   * root by default. In order to let the function return the real root,
   * math.js can be configured with `math.config({predictable: true})`.
   * To retrieve all cubic roots of a value, use `math.cbrt(x, true)`.
   *
   * Syntax:
   *
   *    math.pow(x, y)
   *
   * Examples:
   *
   *    math.pow(2, 3)               // returns number 8
   *
   *    const a = math.complex(2, 3)
   *    math.pow(a, 2)                // returns Complex -5 + 12i
   *
   *    const b = [[1, 2], [4, 3]]
   *    math.pow(b, 2)               // returns Array [[9, 8], [16, 17]]
   *
   * See also:
   *
   *    multiply, sqrt, cbrt, nthRoot
   *
   * @param  {number | BigNumber | Complex | Unit | Array | Matrix} x  The base
   * @param  {number | BigNumber | Complex} y                          The exponent
   * @return {number | BigNumber | Complex | Array | Matrix} The value of `x` to the power `y`
   */
  return typed(name, {
    'number, number': _pow,
    'Complex, Complex': function ComplexComplex(x, y) {
      return x.pow(y);
    },
    'BigNumber, BigNumber': function BigNumberBigNumber(x, y) {
      if (y.isInteger() || x >= 0 || config.predictable) {
        return x.pow(y);
      } else {
        return new Complex(x.toNumber(), 0).pow(y.toNumber(), 0);
      }
    },
    'Fraction, Fraction': function FractionFraction(x, y) {
      var result = x.pow(y);

      if (result != null) {
        return result;
      }

      if (config.predictable) {
        throw new Error('Result of pow is non-rational and cannot be expressed as a fraction');
      } else {
        return _pow(x.valueOf(), y.valueOf());
      }
    },
    'Array, number': _powArray,
    'Array, BigNumber': function ArrayBigNumber(x, y) {
      return _powArray(x, y.toNumber());
    },
    'Matrix, number': _powMatrix,
    'Matrix, BigNumber': function MatrixBigNumber(x, y) {
      return _powMatrix(x, y.toNumber());
    },
    'Unit, number | BigNumber': function UnitNumberBigNumber(x, y) {
      return x.pow(y);
    }
  });
  /**
   * Calculates the power of x to y, x^y, for two numbers.
   * @param {number} x
   * @param {number} y
   * @return {number | Complex} res
   * @private
   */

  function _pow(x, y) {
    // Alternatively could define a 'realmode' config option or something, but
    // 'predictable' will work for now
    if (config.predictable && !(0, _number.isInteger)(y) && x < 0) {
      // Check to see if y can be represented as a fraction
      try {
        var yFrac = fraction(y);
        var yNum = number(yFrac);

        if (y === yNum || Math.abs((y - yNum) / y) < 1e-14) {
          if (yFrac.d % 2 === 1) {
            return (yFrac.n % 2 === 0 ? 1 : -1) * Math.pow(-x, y);
          }
        }
      } catch (ex) {// fraction() throws an error if y is Infinity, etc.
      } // Unable to express y as a fraction, so continue on

    } // **for predictable mode** x^Infinity === NaN if x < -1
    // N.B. this behavour is different from `Math.pow` which gives
    // (-2)^Infinity === Infinity


    if (config.predictable && (x < -1 && y === Infinity || x > -1 && x < 0 && y === -Infinity)) {
      return NaN;
    }

    if ((0, _number.isInteger)(y) || x >= 0 || config.predictable) {
      return (0, _index.powNumber)(x, y);
    } else {
      // TODO: the following infinity checks are duplicated from powNumber. Deduplicate this somehow
      // x^Infinity === 0 if -1 < x < 1
      // A real number 0 is returned instead of complex(0)
      if (x * x < 1 && y === Infinity || x * x > 1 && y === -Infinity) {
        return 0;
      }

      return new Complex(x, 0).pow(y, 0);
    }
  }
  /**
   * Calculate the power of a 2d array
   * @param {Array} x     must be a 2 dimensional, square matrix
   * @param {number} y    a positive, integer value
   * @returns {Array}
   * @private
   */


  function _powArray(x, y) {
    if (!(0, _number.isInteger)(y) || y < 0) {
      throw new TypeError('For A^b, b must be a positive integer (value is ' + y + ')');
    } // verify that A is a 2 dimensional square matrix


    var s = (0, _array.arraySize)(x);

    if (s.length !== 2) {
      throw new Error('For A^b, A must be 2 dimensional (A has ' + s.length + ' dimensions)');
    }

    if (s[0] !== s[1]) {
      throw new Error('For A^b, A must be square (size is ' + s[0] + 'x' + s[1] + ')');
    }

    var res = identity(s[0]).valueOf();
    var px = x;

    while (y >= 1) {
      if ((y & 1) === 1) {
        res = multiply(px, res);
      }

      y >>= 1;
      px = multiply(px, px);
    }

    return res;
  }
  /**
   * Calculate the power of a 2d matrix
   * @param {Matrix} x     must be a 2 dimensional, square matrix
   * @param {number} y    a positive, integer value
   * @returns {Matrix}
   * @private
   */


  function _powMatrix(x, y) {
    return matrix(_powArray(x.valueOf(), y));
  }
});
exports.createPow = createPow;