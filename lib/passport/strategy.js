/**
 * Module dependencies.
 */
var util = require('util');


/**
 * `Strategy` constructor.
 *
 * @api public
 */
function Strategy() {
  this.middleware = [];
}

/**
 * Authenticate request.
 *
 * This function must be overridden by subclasses.  In abstract form, it always
 * throws an exception.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
  throw new Error('Strategy#authenticate must be overridden by subclass');
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
