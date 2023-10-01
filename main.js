// @bun
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __toCommonJS = (from) => {
  const moduleCache = __toCommonJS.moduleCache ??= new WeakMap;
  var cached = moduleCache.get(from);
  if (cached)
    return cached;
  var to = __defProp({}, "__esModule", { value: true });
  var desc = { enumerable: false };
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  moduleCache.set(from, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = (id) => {
  return import.meta.require(id);
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// node_modules/pg/node_modules/pg-types/node_modules/postgres-array/index.js
var require_postgres_array = __commonJS((exports) => {
  var identity = function(value) {
    return value;
  };
  exports.parse = function(source, transform) {
    return new ArrayParser(source, transform).parse();
  };

  class ArrayParser {
    constructor(source, transform) {
      this.source = source;
      this.transform = transform || identity;
      this.position = 0;
      this.entries = [];
      this.recorded = [];
      this.dimension = 0;
    }
    isEof() {
      return this.position >= this.source.length;
    }
    nextCharacter() {
      var character = this.source[this.position++];
      if (character === "\\") {
        return {
          value: this.source[this.position++],
          escaped: true
        };
      }
      return {
        value: character,
        escaped: false
      };
    }
    record(character) {
      this.recorded.push(character);
    }
    newEntry(includeEmpty) {
      var entry;
      if (this.recorded.length > 0 || includeEmpty) {
        entry = this.recorded.join("");
        if (entry === "NULL" && !includeEmpty) {
          entry = null;
        }
        if (entry !== null)
          entry = this.transform(entry);
        this.entries.push(entry);
        this.recorded = [];
      }
    }
    consumeDimensions() {
      if (this.source[0] === "[") {
        while (!this.isEof()) {
          var char = this.nextCharacter();
          if (char.value === "=")
            break;
        }
      }
    }
    parse(nested) {
      var character, parser, quote;
      this.consumeDimensions();
      while (!this.isEof()) {
        character = this.nextCharacter();
        if (character.value === "{" && !quote) {
          this.dimension++;
          if (this.dimension > 1) {
            parser = new ArrayParser(this.source.substr(this.position - 1), this.transform);
            this.entries.push(parser.parse(true));
            this.position += parser.position - 2;
          }
        } else if (character.value === "}" && !quote) {
          this.dimension--;
          if (!this.dimension) {
            this.newEntry();
            if (nested)
              return this.entries;
          }
        } else if (character.value === '"' && !character.escaped) {
          if (quote)
            this.newEntry(true);
          quote = !quote;
        } else if (character.value === "," && !quote) {
          this.newEntry();
        } else {
          this.record(character.value);
        }
      }
      if (this.dimension !== 0) {
        throw new Error("array dimension not balanced");
      }
      return this.entries;
    }
  }
});

// node_modules/pg/node_modules/pg-types/lib/arrayParser.js
var require_arrayParser = __commonJS((exports, module) => {
  var array = require_postgres_array();
  module.exports = {
    create: function(source, transform) {
      return {
        parse: function() {
          return array.parse(source, transform);
        }
      };
    }
  };
});

// node_modules/pg/node_modules/pg-types/node_modules/postgres-date/index.js
var require_postgres_date = __commonJS((exports, module) => {
  var getDate = function(isoDate) {
    var matches = DATE.exec(isoDate);
    if (!matches) {
      return;
    }
    var year = parseInt(matches[1], 10);
    var isBC = !!matches[4];
    if (isBC) {
      year = bcYearToNegativeYear(year);
    }
    var month = parseInt(matches[2], 10) - 1;
    var day = matches[3];
    var date = new Date(year, month, day);
    if (is0To99(year)) {
      date.setFullYear(year);
    }
    return date;
  };
  var timeZoneOffset = function(isoDate) {
    if (isoDate.endsWith("+00")) {
      return 0;
    }
    var zone = TIME_ZONE.exec(isoDate.split(" ")[1]);
    if (!zone)
      return;
    var type = zone[1];
    if (type === "Z") {
      return 0;
    }
    var sign = type === "-" ? -1 : 1;
    var offset = parseInt(zone[2], 10) * 3600 + parseInt(zone[3] || 0, 10) * 60 + parseInt(zone[4] || 0, 10);
    return offset * sign * 1000;
  };
  var bcYearToNegativeYear = function(year) {
    return -(year - 1);
  };
  var is0To99 = function(num) {
    return num >= 0 && num < 100;
  };
  var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
  var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
  var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
  var INFINITY = /^-?infinity$/;
  module.exports = function parseDate(isoDate) {
    if (INFINITY.test(isoDate)) {
      return Number(isoDate.replace("i", "I"));
    }
    var matches = DATE_TIME.exec(isoDate);
    if (!matches) {
      return getDate(isoDate) || null;
    }
    var isBC = !!matches[8];
    var year = parseInt(matches[1], 10);
    if (isBC) {
      year = bcYearToNegativeYear(year);
    }
    var month = parseInt(matches[2], 10) - 1;
    var day = matches[3];
    var hour = parseInt(matches[4], 10);
    var minute = parseInt(matches[5], 10);
    var second = parseInt(matches[6], 10);
    var ms = matches[7];
    ms = ms ? 1000 * parseFloat(ms) : 0;
    var date;
    var offset = timeZoneOffset(isoDate);
    if (offset != null) {
      date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
      if (is0To99(year)) {
        date.setUTCFullYear(year);
      }
      if (offset !== 0) {
        date.setTime(date.getTime() - offset);
      }
    } else {
      date = new Date(year, month, day, hour, minute, second, ms);
      if (is0To99(year)) {
        date.setFullYear(year);
      }
    }
    return date;
  };
});

// node_modules/xtend/mutable.js
var require_mutable = __commonJS((exports, module) => {
  var extend = function(target) {
    for (var i = 1;i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  module.exports = extend;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
});

// node_modules/pg/node_modules/pg-types/node_modules/postgres-interval/index.js
var require_postgres_interval = __commonJS((exports, module) => {
  var PostgresInterval = function(raw) {
    if (!(this instanceof PostgresInterval)) {
      return new PostgresInterval(raw);
    }
    extend(this, parse(raw));
  };
  var parseMilliseconds = function(fraction) {
    var microseconds = fraction + "000000".slice(fraction.length);
    return parseInt(microseconds, 10) / 1000;
  };
  var parse = function(interval) {
    if (!interval)
      return {};
    var matches = INTERVAL.exec(interval);
    var isNegative = matches[8] === "-";
    return Object.keys(positions).reduce(function(parsed, property) {
      var position = positions[property];
      var value = matches[position];
      if (!value)
        return parsed;
      value = property === "milliseconds" ? parseMilliseconds(value) : parseInt(value, 10);
      if (!value)
        return parsed;
      if (isNegative && ~negatives.indexOf(property)) {
        value *= -1;
      }
      parsed[property] = value;
      return parsed;
    }, {});
  };
  var extend = require_mutable();
  module.exports = PostgresInterval;
  var properties = ["seconds", "minutes", "hours", "days", "months", "years"];
  PostgresInterval.prototype.toPostgres = function() {
    var filtered = properties.filter(this.hasOwnProperty, this);
    if (this.milliseconds && filtered.indexOf("seconds") < 0) {
      filtered.push("seconds");
    }
    if (filtered.length === 0)
      return "0";
    return filtered.map(function(property) {
      var value = this[property] || 0;
      if (property === "seconds" && this.milliseconds) {
        value = (value + this.milliseconds / 1000).toFixed(6).replace(/\.?0+$/, "");
      }
      return value + " " + property;
    }, this).join(" ");
  };
  var propertiesISOEquivalent = {
    years: "Y",
    months: "M",
    days: "D",
    hours: "H",
    minutes: "M",
    seconds: "S"
  };
  var dateProperties = ["years", "months", "days"];
  var timeProperties = ["hours", "minutes", "seconds"];
  PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function() {
    var datePart = dateProperties.map(buildProperty, this).join("");
    var timePart = timeProperties.map(buildProperty, this).join("");
    return "P" + datePart + "T" + timePart;
    function buildProperty(property) {
      var value = this[property] || 0;
      if (property === "seconds" && this.milliseconds) {
        value = (value + this.milliseconds / 1000).toFixed(6).replace(/0+$/, "");
      }
      return value + propertiesISOEquivalent[property];
    }
  };
  var NUMBER = "([+-]?\\d+)";
  var YEAR = NUMBER + "\\s+years?";
  var MONTH = NUMBER + "\\s+mons?";
  var DAY = NUMBER + "\\s+days?";
  var TIME = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?";
  var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function(regexString) {
    return "(" + regexString + ")?";
  }).join("\\s*"));
  var positions = {
    years: 2,
    months: 4,
    days: 6,
    hours: 9,
    minutes: 10,
    seconds: 11,
    milliseconds: 12
  };
  var negatives = ["hours", "minutes", "seconds", "milliseconds"];
});

// node_modules/pg/node_modules/pg-types/node_modules/postgres-bytea/index.js
var require_postgres_bytea = __commonJS((exports, module) => {
  module.exports = function parseBytea(input) {
    if (/^\\x/.test(input)) {
      return new Buffer(input.substr(2), "hex");
    }
    var output = "";
    var i = 0;
    while (i < input.length) {
      if (input[i] !== "\\") {
        output += input[i];
        ++i;
      } else {
        if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
          output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
          i += 4;
        } else {
          var backslashes = 1;
          while (i + backslashes < input.length && input[i + backslashes] === "\\") {
            backslashes++;
          }
          for (var k = 0;k < Math.floor(backslashes / 2); ++k) {
            output += "\\";
          }
          i += Math.floor(backslashes / 2) * 2;
        }
      }
    }
    return new Buffer(output, "binary");
  };
});

// node_modules/pg/node_modules/pg-types/lib/textParsers.js
var require_textParsers = __commonJS((exports, module) => {
  var allowNull = function(fn) {
    return function nullAllowed(value) {
      if (value === null)
        return value;
      return fn(value);
    };
  };
  var parseBool = function(value) {
    if (value === null)
      return value;
    return value === "TRUE" || value === "t" || value === "true" || value === "y" || value === "yes" || value === "on" || value === "1";
  };
  var parseBoolArray = function(value) {
    if (!value)
      return null;
    return array.parse(value, parseBool);
  };
  var parseBaseTenInt = function(string) {
    return parseInt(string, 10);
  };
  var parseIntegerArray = function(value) {
    if (!value)
      return null;
    return array.parse(value, allowNull(parseBaseTenInt));
  };
  var parseBigIntegerArray = function(value) {
    if (!value)
      return null;
    return array.parse(value, allowNull(function(entry) {
      return parseBigInteger(entry).trim();
    }));
  };
  var array = require_postgres_array();
  var arrayParser = require_arrayParser();
  var parseDate = require_postgres_date();
  var parseInterval = require_postgres_interval();
  var parseByteA = require_postgres_bytea();
  var parsePointArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value, function(entry) {
      if (entry !== null) {
        entry = parsePoint(entry);
      }
      return entry;
    });
    return p.parse();
  };
  var parseFloatArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value, function(entry) {
      if (entry !== null) {
        entry = parseFloat(entry);
      }
      return entry;
    });
    return p.parse();
  };
  var parseStringArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value);
    return p.parse();
  };
  var parseDateArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value, function(entry) {
      if (entry !== null) {
        entry = parseDate(entry);
      }
      return entry;
    });
    return p.parse();
  };
  var parseIntervalArray = function(value) {
    if (!value) {
      return null;
    }
    var p = arrayParser.create(value, function(entry) {
      if (entry !== null) {
        entry = parseInterval(entry);
      }
      return entry;
    });
    return p.parse();
  };
  var parseByteAArray = function(value) {
    if (!value) {
      return null;
    }
    return array.parse(value, allowNull(parseByteA));
  };
  var parseInteger = function(value) {
    return parseInt(value, 10);
  };
  var parseBigInteger = function(value) {
    var valStr = String(value);
    if (/^\d+$/.test(valStr)) {
      return valStr;
    }
    return value;
  };
  var parseJsonArray = function(value) {
    if (!value) {
      return null;
    }
    return array.parse(value, allowNull(JSON.parse));
  };
  var parsePoint = function(value) {
    if (value[0] !== "(") {
      return null;
    }
    value = value.substring(1, value.length - 1).split(",");
    return {
      x: parseFloat(value[0]),
      y: parseFloat(value[1])
    };
  };
  var parseCircle = function(value) {
    if (value[0] !== "<" && value[1] !== "(") {
      return null;
    }
    var point = "(";
    var radius = "";
    var pointParsed = false;
    for (var i = 2;i < value.length - 1; i++) {
      if (!pointParsed) {
        point += value[i];
      }
      if (value[i] === ")") {
        pointParsed = true;
        continue;
      } else if (!pointParsed) {
        continue;
      }
      if (value[i] === ",") {
        continue;
      }
      radius += value[i];
    }
    var result = parsePoint(point);
    result.radius = parseFloat(radius);
    return result;
  };
  var init = function(register) {
    register(20, parseBigInteger);
    register(21, parseInteger);
    register(23, parseInteger);
    register(26, parseInteger);
    register(700, parseFloat);
    register(701, parseFloat);
    register(16, parseBool);
    register(1082, parseDate);
    register(1114, parseDate);
    register(1184, parseDate);
    register(600, parsePoint);
    register(651, parseStringArray);
    register(718, parseCircle);
    register(1000, parseBoolArray);
    register(1001, parseByteAArray);
    register(1005, parseIntegerArray);
    register(1007, parseIntegerArray);
    register(1028, parseIntegerArray);
    register(1016, parseBigIntegerArray);
    register(1017, parsePointArray);
    register(1021, parseFloatArray);
    register(1022, parseFloatArray);
    register(1231, parseFloatArray);
    register(1014, parseStringArray);
    register(1015, parseStringArray);
    register(1008, parseStringArray);
    register(1009, parseStringArray);
    register(1040, parseStringArray);
    register(1041, parseStringArray);
    register(1115, parseDateArray);
    register(1182, parseDateArray);
    register(1185, parseDateArray);
    register(1186, parseInterval);
    register(1187, parseIntervalArray);
    register(17, parseByteA);
    register(114, JSON.parse.bind(JSON));
    register(3802, JSON.parse.bind(JSON));
    register(199, parseJsonArray);
    register(3807, parseJsonArray);
    register(3907, parseStringArray);
    register(2951, parseStringArray);
    register(791, parseStringArray);
    register(1183, parseStringArray);
    register(1270, parseStringArray);
  };
  module.exports = {
    init
  };
});

// node_modules/pg-int8/index.js
var require_pg_int8 = __commonJS((exports, module) => {
  var readInt8 = function(buffer) {
    var high = buffer.readInt32BE(0);
    var low = buffer.readUInt32BE(4);
    var sign = "";
    if (high < 0) {
      high = ~high + (low === 0);
      low = ~low + 1 >>> 0;
      sign = "-";
    }
    var result = "";
    var carry;
    var t;
    var digits;
    var pad;
    var l;
    var i;
    {
      carry = high % BASE;
      high = high / BASE >>> 0;
      t = 4294967296 * carry + low;
      low = t / BASE >>> 0;
      digits = "" + (t - BASE * low);
      if (low === 0 && high === 0) {
        return sign + digits + result;
      }
      pad = "";
      l = 6 - digits.length;
      for (i = 0;i < l; i++) {
        pad += "0";
      }
      result = pad + digits + result;
    }
    {
      carry = high % BASE;
      high = high / BASE >>> 0;
      t = 4294967296 * carry + low;
      low = t / BASE >>> 0;
      digits = "" + (t - BASE * low);
      if (low === 0 && high === 0) {
        return sign + digits + result;
      }
      pad = "";
      l = 6 - digits.length;
      for (i = 0;i < l; i++) {
        pad += "0";
      }
      result = pad + digits + result;
    }
    {
      carry = high % BASE;
      high = high / BASE >>> 0;
      t = 4294967296 * carry + low;
      low = t / BASE >>> 0;
      digits = "" + (t - BASE * low);
      if (low === 0 && high === 0) {
        return sign + digits + result;
      }
      pad = "";
      l = 6 - digits.length;
      for (i = 0;i < l; i++) {
        pad += "0";
      }
      result = pad + digits + result;
    }
    {
      carry = high % BASE;
      t = 4294967296 * carry + low;
      digits = "" + t % BASE;
      return sign + digits + result;
    }
  };
  var BASE = 1e6;
  module.exports = readInt8;
});

// node_modules/pg/node_modules/pg-types/lib/binaryParsers.js
var require_binaryParsers = __commonJS((exports, module) => {
  var parseInt64 = require_pg_int8();
  var parseBits = function(data, bits, offset, invert, callback) {
    offset = offset || 0;
    invert = invert || false;
    callback = callback || function(lastValue, newValue, bits2) {
      return lastValue * Math.pow(2, bits2) + newValue;
    };
    var offsetBytes = offset >> 3;
    var inv = function(value) {
      if (invert) {
        return ~value & 255;
      }
      return value;
    };
    var mask = 255;
    var firstBits = 8 - offset % 8;
    if (bits < firstBits) {
      mask = 255 << 8 - bits & 255;
      firstBits = bits;
    }
    if (offset) {
      mask = mask >> offset % 8;
    }
    var result = 0;
    if (offset % 8 + bits >= 8) {
      result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
    }
    var bytes = bits + offset >> 3;
    for (var i = offsetBytes + 1;i < bytes; i++) {
      result = callback(result, inv(data[i]), 8);
    }
    var lastBits = (bits + offset) % 8;
    if (lastBits > 0) {
      result = callback(result, inv(data[bytes]) >> 8 - lastBits, lastBits);
    }
    return result;
  };
  var parseFloatFromBits = function(data, precisionBits, exponentBits) {
    var bias = Math.pow(2, exponentBits - 1) - 1;
    var sign = parseBits(data, 1);
    var exponent = parseBits(data, exponentBits, 1);
    if (exponent === 0) {
      return 0;
    }
    var precisionBitsCounter = 1;
    var parsePrecisionBits = function(lastValue, newValue, bits) {
      if (lastValue === 0) {
        lastValue = 1;
      }
      for (var i = 1;i <= bits; i++) {
        precisionBitsCounter /= 2;
        if ((newValue & 1 << bits - i) > 0) {
          lastValue += precisionBitsCounter;
        }
      }
      return lastValue;
    };
    var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);
    if (exponent == Math.pow(2, exponentBits + 1) - 1) {
      if (mantissa === 0) {
        return sign === 0 ? Infinity : (-Infinity);
      }
      return NaN;
    }
    return (sign === 0 ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
  };
  var parseInt16 = function(value) {
    if (parseBits(value, 1) == 1) {
      return -1 * (parseBits(value, 15, 1, true) + 1);
    }
    return parseBits(value, 15, 1);
  };
  var parseInt32 = function(value) {
    if (parseBits(value, 1) == 1) {
      return -1 * (parseBits(value, 31, 1, true) + 1);
    }
    return parseBits(value, 31, 1);
  };
  var parseFloat32 = function(value) {
    return parseFloatFromBits(value, 23, 8);
  };
  var parseFloat64 = function(value) {
    return parseFloatFromBits(value, 52, 11);
  };
  var parseNumeric = function(value) {
    var sign = parseBits(value, 16, 32);
    if (sign == 49152) {
      return NaN;
    }
    var weight = Math.pow(1e4, parseBits(value, 16, 16));
    var result = 0;
    var digits = [];
    var ndigits = parseBits(value, 16);
    for (var i = 0;i < ndigits; i++) {
      result += parseBits(value, 16, 64 + 16 * i) * weight;
      weight /= 1e4;
    }
    var scale = Math.pow(10, parseBits(value, 16, 48));
    return (sign === 0 ? 1 : -1) * Math.round(result * scale) / scale;
  };
  var parseDate = function(isUTC, value) {
    var sign = parseBits(value, 1);
    var rawValue = parseBits(value, 63, 1);
    var result = new Date((sign === 0 ? 1 : -1) * rawValue / 1000 + 946684800000);
    if (!isUTC) {
      result.setTime(result.getTime() + result.getTimezoneOffset() * 60000);
    }
    result.usec = rawValue % 1000;
    result.getMicroSeconds = function() {
      return this.usec;
    };
    result.setMicroSeconds = function(value2) {
      this.usec = value2;
    };
    result.getUTCMicroSeconds = function() {
      return this.usec;
    };
    return result;
  };
  var parseArray = function(value) {
    var dim = parseBits(value, 32);
    var flags = parseBits(value, 32, 32);
    var elementType = parseBits(value, 32, 64);
    var offset = 96;
    var dims = [];
    for (var i = 0;i < dim; i++) {
      dims[i] = parseBits(value, 32, offset);
      offset += 32;
      offset += 32;
    }
    var parseElement = function(elementType2) {
      var length = parseBits(value, 32, offset);
      offset += 32;
      if (length == 4294967295) {
        return null;
      }
      var result;
      if (elementType2 == 23 || elementType2 == 20) {
        result = parseBits(value, length * 8, offset);
        offset += length * 8;
        return result;
      } else if (elementType2 == 25) {
        result = value.toString(this.encoding, offset >> 3, (offset += length << 3) >> 3);
        return result;
      } else {
        console.log("ERROR: ElementType not implemented: " + elementType2);
      }
    };
    var parse = function(dimension, elementType2) {
      var array = [];
      var i2;
      if (dimension.length > 1) {
        var count = dimension.shift();
        for (i2 = 0;i2 < count; i2++) {
          array[i2] = parse(dimension, elementType2);
        }
        dimension.unshift(count);
      } else {
        for (i2 = 0;i2 < dimension[0]; i2++) {
          array[i2] = parseElement(elementType2);
        }
      }
      return array;
    };
    return parse(dims, elementType);
  };
  var parseText = function(value) {
    return value.toString("utf8");
  };
  var parseBool = function(value) {
    if (value === null)
      return null;
    return parseBits(value, 8) > 0;
  };
  var init = function(register) {
    register(20, parseInt64);
    register(21, parseInt16);
    register(23, parseInt32);
    register(26, parseInt32);
    register(1700, parseNumeric);
    register(700, parseFloat32);
    register(701, parseFloat64);
    register(16, parseBool);
    register(1114, parseDate.bind(null, false));
    register(1184, parseDate.bind(null, true));
    register(1000, parseArray);
    register(1007, parseArray);
    register(1016, parseArray);
    register(1008, parseArray);
    register(1009, parseArray);
    register(25, parseText);
  };
  module.exports = {
    init
  };
});

// node_modules/pg/node_modules/pg-types/lib/builtins.js
var require_builtins = __commonJS((exports, module) => {
  module.exports = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
  };
});

// node_modules/pg/node_modules/pg-types/index.js
var require_pg_types = __commonJS((exports) => {
  var noParse = function(val) {
    return String(val);
  };
  var getTypeParser = function(oid, format) {
    format = format || "text";
    if (!typeParsers[format]) {
      return noParse;
    }
    return typeParsers[format][oid] || noParse;
  };
  var setTypeParser = function(oid, format, parseFn) {
    if (typeof format == "function") {
      parseFn = format;
      format = "text";
    }
    typeParsers[format][oid] = parseFn;
  };
  var textParsers = require_textParsers();
  var binaryParsers = require_binaryParsers();
  var arrayParser = require_arrayParser();
  var builtinTypes = require_builtins();
  exports.getTypeParser = getTypeParser;
  exports.setTypeParser = setTypeParser;
  exports.arrayParser = arrayParser;
  exports.builtins = builtinTypes;
  var typeParsers = {
    text: {},
    binary: {}
  };
  textParsers.init(function(oid, converter) {
    typeParsers.text[oid] = converter;
  });
  binaryParsers.init(function(oid, converter) {
    typeParsers.binary[oid] = converter;
  });
});

// node_modules/pg/lib/defaults.js
var require_defaults = __commonJS((exports, module) => {
  module.exports = {
    host: "localhost",
    user: process.platform === "win32" ? process.env.USERNAME : "jose",
    database: undefined,
    password: null,
    connectionString: undefined,
    port: 5432,
    rows: 0,
    binary: false,
    max: 10,
    idleTimeoutMillis: 30000,
    client_encoding: "",
    ssl: false,
    application_name: undefined,
    fallback_application_name: undefined,
    options: undefined,
    parseInputDatesAsUTC: false,
    statement_timeout: false,
    lock_timeout: false,
    idle_in_transaction_session_timeout: false,
    query_timeout: false,
    connect_timeout: 0,
    keepalives: 1,
    keepalives_idle: 0
  };
  var pgTypes = require_pg_types();
  var parseBigInteger = pgTypes.getTypeParser(20, "text");
  var parseBigIntegerArray = pgTypes.getTypeParser(1016, "text");
  module.exports.__defineSetter__("parseInt8", function(val) {
    pgTypes.setTypeParser(20, "text", val ? pgTypes.getTypeParser(23, "text") : parseBigInteger);
    pgTypes.setTypeParser(1016, "text", val ? pgTypes.getTypeParser(1007, "text") : parseBigIntegerArray);
  });
});

// node_modules/pg/lib/utils.js
var require_utils = __commonJS((exports, module) => {
  var escapeElement = function(elementRepresentation) {
    var escaped = elementRepresentation.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return '"' + escaped + '"';
  };
  var arrayString = function(val) {
    var result = "{";
    for (var i = 0;i < val.length; i++) {
      if (i > 0) {
        result = result + ",";
      }
      if (val[i] === null || typeof val[i] === "undefined") {
        result = result + "NULL";
      } else if (Array.isArray(val[i])) {
        result = result + arrayString(val[i]);
      } else if (val[i] instanceof Buffer) {
        result += "\\\\x" + val[i].toString("hex");
      } else {
        result += escapeElement(prepareValue(val[i]));
      }
    }
    result = result + "}";
    return result;
  };
  var prepareObject = function(val, seen) {
    if (val && typeof val.toPostgres === "function") {
      seen = seen || [];
      if (seen.indexOf(val) !== -1) {
        throw new Error('circular reference detected while preparing "' + val + '" for query');
      }
      seen.push(val);
      return prepareValue(val.toPostgres(prepareValue), seen);
    }
    return JSON.stringify(val);
  };
  var pad = function(number, digits) {
    number = "" + number;
    while (number.length < digits) {
      number = "0" + number;
    }
    return number;
  };
  var dateToString = function(date) {
    var offset = -date.getTimezoneOffset();
    var year = date.getFullYear();
    var isBCYear = year < 1;
    if (isBCYear)
      year = Math.abs(year) + 1;
    var ret = pad(year, 4) + "-" + pad(date.getMonth() + 1, 2) + "-" + pad(date.getDate(), 2) + "T" + pad(date.getHours(), 2) + ":" + pad(date.getMinutes(), 2) + ":" + pad(date.getSeconds(), 2) + "." + pad(date.getMilliseconds(), 3);
    if (offset < 0) {
      ret += "-";
      offset *= -1;
    } else {
      ret += "+";
    }
    ret += pad(Math.floor(offset / 60), 2) + ":" + pad(offset % 60, 2);
    if (isBCYear)
      ret += " BC";
    return ret;
  };
  var dateToStringUTC = function(date) {
    var year = date.getUTCFullYear();
    var isBCYear = year < 1;
    if (isBCYear)
      year = Math.abs(year) + 1;
    var ret = pad(year, 4) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2) + "T" + pad(date.getUTCHours(), 2) + ":" + pad(date.getUTCMinutes(), 2) + ":" + pad(date.getUTCSeconds(), 2) + "." + pad(date.getUTCMilliseconds(), 3);
    ret += "+00:00";
    if (isBCYear)
      ret += " BC";
    return ret;
  };
  var normalizeQueryConfig = function(config, values, callback) {
    config = typeof config === "string" ? { text: config } : config;
    if (values) {
      if (typeof values === "function") {
        config.callback = values;
      } else {
        config.values = values;
      }
    }
    if (callback) {
      config.callback = callback;
    }
    return config;
  };
  var defaults = require_defaults();
  var prepareValue = function(val, seen) {
    if (val == null) {
      return null;
    }
    if (val instanceof Buffer) {
      return val;
    }
    if (ArrayBuffer.isView(val)) {
      var buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
      if (buf.length === val.byteLength) {
        return buf;
      }
      return buf.slice(val.byteOffset, val.byteOffset + val.byteLength);
    }
    if (val instanceof Date) {
      if (defaults.parseInputDatesAsUTC) {
        return dateToStringUTC(val);
      } else {
        return dateToString(val);
      }
    }
    if (Array.isArray(val)) {
      return arrayString(val);
    }
    if (typeof val === "object") {
      return prepareObject(val, seen);
    }
    return val.toString();
  };
  var escapeIdentifier = function(str) {
    return '"' + str.replace(/"/g, '""') + '"';
  };
  var escapeLiteral = function(str) {
    var hasBackslash = false;
    var escaped = "'";
    for (var i = 0;i < str.length; i++) {
      var c = str[i];
      if (c === "'") {
        escaped += c + c;
      } else if (c === "\\") {
        escaped += c + c;
        hasBackslash = true;
      } else {
        escaped += c;
      }
    }
    escaped += "'";
    if (hasBackslash === true) {
      escaped = " E" + escaped;
    }
    return escaped;
  };
  module.exports = {
    prepareValue: function prepareValueWrapper(value) {
      return prepareValue(value);
    },
    normalizeQueryConfig,
    escapeIdentifier,
    escapeLiteral
  };
});

// node_modules/pg/lib/crypto/utils-legacy.js
var require_utils_legacy = __commonJS((exports, module) => {
  var md5 = function(string) {
    return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
  };
  var postgresMd5PasswordHash = function(user, password, salt) {
    var inner = md5(password + user);
    var outer = md5(Buffer.concat([Buffer.from(inner), salt]));
    return "md5" + outer;
  };
  var sha256 = function(text) {
    return nodeCrypto.createHash("sha256").update(text).digest();
  };
  var hmacSha256 = function(key, msg) {
    return nodeCrypto.createHmac("sha256", key).update(msg).digest();
  };
  async function deriveKey(password, salt, iterations) {
    return nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  }
  var nodeCrypto = import.meta.require("crypto");
  module.exports = {
    postgresMd5PasswordHash,
    randomBytes: nodeCrypto.randomBytes,
    deriveKey,
    sha256,
    hmacSha256,
    md5
  };
});

// node_modules/pg/lib/crypto/utils-webcrypto.js
var require_utils_webcrypto = __commonJS((exports, module) => {
  var randomBytes = function(length) {
    return webCrypto.getRandomValues(Buffer.alloc(length));
  };
  async function md5(string) {
    try {
      return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
    } catch (e) {
      const data = typeof string === "string" ? textEncoder.encode(string) : string;
      const hash = await subtleCrypto.digest("MD5", data);
      return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  }
  async function postgresMd5PasswordHash(user, password, salt) {
    var inner = await md5(password + user);
    var outer = await md5(Buffer.concat([Buffer.from(inner), salt]));
    return "md5" + outer;
  }
  async function sha256(text) {
    return await subtleCrypto.digest("SHA-256", text);
  }
  async function hmacSha256(keyBuffer, msg) {
    const key = await subtleCrypto.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return await subtleCrypto.sign("HMAC", key, textEncoder.encode(msg));
  }
  async function deriveKey(password, salt, iterations) {
    const key = await subtleCrypto.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const params = { name: "PBKDF2", hash: "SHA-256", salt, iterations };
    return await subtleCrypto.deriveBits(params, key, 32 * 8, ["deriveBits"]);
  }
  var nodeCrypto = import.meta.require("crypto");
  module.exports = {
    postgresMd5PasswordHash,
    randomBytes,
    deriveKey,
    sha256,
    hmacSha256,
    md5
  };
  var webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
  var subtleCrypto = webCrypto.subtle;
  var textEncoder = new TextEncoder;
});

// node_modules/pg/lib/crypto/utils.js
var require_utils2 = __commonJS((exports, module) => {
  var useLegacyCrypto = parseInt(process.versions && process.versions.node && process.versions.node.split(".")[0]) < 15;
  if (useLegacyCrypto) {
    module.exports = require_utils_legacy();
  } else {
    module.exports = require_utils_webcrypto();
  }
});

// node_modules/pg/lib/crypto/sasl.js
var require_sasl = __commonJS((exports, module) => {
  var startSession = function(mechanisms) {
    if (mechanisms.indexOf("SCRAM-SHA-256") === -1) {
      throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
    }
    const clientNonce = crypto.randomBytes(18).toString("base64");
    return {
      mechanism: "SCRAM-SHA-256",
      clientNonce,
      response: "n,,n=*,r=" + clientNonce,
      message: "SASLInitialResponse"
    };
  };
  async function continueSession(session, password, serverData) {
    if (session.message !== "SASLInitialResponse") {
      throw new Error("SASL: Last message was not SASLInitialResponse");
    }
    if (typeof password !== "string") {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
    }
    if (password === "") {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");
    }
    if (typeof serverData !== "string") {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
    }
    const sv = parseServerFirstMessage(serverData);
    if (!sv.nonce.startsWith(session.clientNonce)) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    } else if (sv.nonce.length === session.clientNonce.length) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    }
    var clientFirstMessageBare = "n=*,r=" + session.clientNonce;
    var serverFirstMessage = "r=" + sv.nonce + ",s=" + sv.salt + ",i=" + sv.iteration;
    var clientFinalMessageWithoutProof = "c=biws,r=" + sv.nonce;
    var authMessage = clientFirstMessageBare + "," + serverFirstMessage + "," + clientFinalMessageWithoutProof;
    var saltBytes = Buffer.from(sv.salt, "base64");
    var saltedPassword = await crypto.deriveKey(password, saltBytes, sv.iteration);
    var clientKey = await crypto.hmacSha256(saltedPassword, "Client Key");
    var storedKey = await crypto.sha256(clientKey);
    var clientSignature = await crypto.hmacSha256(storedKey, authMessage);
    var clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString("base64");
    var serverKey = await crypto.hmacSha256(saltedPassword, "Server Key");
    var serverSignatureBytes = await crypto.hmacSha256(serverKey, authMessage);
    session.message = "SASLResponse";
    session.serverSignature = Buffer.from(serverSignatureBytes).toString("base64");
    session.response = clientFinalMessageWithoutProof + ",p=" + clientProof;
  }
  var finalizeSession = function(session, serverData) {
    if (session.message !== "SASLResponse") {
      throw new Error("SASL: Last message was not SASLResponse");
    }
    if (typeof serverData !== "string") {
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
    }
    const { serverSignature } = parseServerFinalMessage(serverData);
    if (serverSignature !== session.serverSignature) {
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
    }
  };
  var isPrintableChars = function(text) {
    if (typeof text !== "string") {
      throw new TypeError("SASL: text must be a string");
    }
    return text.split("").map((_, i) => text.charCodeAt(i)).every((c) => c >= 33 && c <= 43 || c >= 45 && c <= 126);
  };
  var isBase64 = function(text) {
    return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(text);
  };
  var parseAttributePairs = function(text) {
    if (typeof text !== "string") {
      throw new TypeError("SASL: attribute pairs text must be a string");
    }
    return new Map(text.split(",").map((attrValue) => {
      if (!/^.=/.test(attrValue)) {
        throw new Error("SASL: Invalid attribute pair entry");
      }
      const name = attrValue[0];
      const value = attrValue.substring(2);
      return [name, value];
    }));
  };
  var parseServerFirstMessage = function(data) {
    const attrPairs = parseAttributePairs(data);
    const nonce = attrPairs.get("r");
    if (!nonce) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
    } else if (!isPrintableChars(nonce)) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
    }
    const salt = attrPairs.get("s");
    if (!salt) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
    } else if (!isBase64(salt)) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
    }
    const iterationText = attrPairs.get("i");
    if (!iterationText) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
    } else if (!/^[1-9][0-9]*$/.test(iterationText)) {
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
    }
    const iteration = parseInt(iterationText, 10);
    return {
      nonce,
      salt,
      iteration
    };
  };
  var parseServerFinalMessage = function(serverData) {
    const attrPairs = parseAttributePairs(serverData);
    const serverSignature = attrPairs.get("v");
    if (!serverSignature) {
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
    } else if (!isBase64(serverSignature)) {
      throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
    }
    return {
      serverSignature
    };
  };
  var xorBuffers = function(a, b) {
    if (!Buffer.isBuffer(a)) {
      throw new TypeError("first argument must be a Buffer");
    }
    if (!Buffer.isBuffer(b)) {
      throw new TypeError("second argument must be a Buffer");
    }
    if (a.length !== b.length) {
      throw new Error("Buffer lengths must match");
    }
    if (a.length === 0) {
      throw new Error("Buffers cannot be empty");
    }
    return Buffer.from(a.map((_, i) => a[i] ^ b[i]));
  };
  var crypto = require_utils2();
  module.exports = {
    startSession,
    continueSession,
    finalizeSession
  };
});

// node_modules/pg/lib/type-overrides.js
var require_type_overrides = __commonJS((exports, module) => {
  var TypeOverrides = function(userTypes) {
    this._types = userTypes || types;
    this.text = {};
    this.binary = {};
  };
  var types = require_pg_types();
  TypeOverrides.prototype.getOverrides = function(format) {
    switch (format) {
      case "text":
        return this.text;
      case "binary":
        return this.binary;
      default:
        return {};
    }
  };
  TypeOverrides.prototype.setTypeParser = function(oid, format, parseFn) {
    if (typeof format === "function") {
      parseFn = format;
      format = "text";
    }
    this.getOverrides(format)[oid] = parseFn;
  };
  TypeOverrides.prototype.getTypeParser = function(oid, format) {
    format = format || "text";
    return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format);
  };
  module.exports = TypeOverrides;
});

// node_modules/pg-connection-string/index.js
var require_pg_connection_string = __commonJS((exports, module) => {
  var parse = function(str) {
    if (str.charAt(0) === "/") {
      const config2 = str.split(" ");
      return { host: config2[0], database: config2[1] };
    }
    const config = {};
    let result;
    let dummyHost = false;
    if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
      str = encodeURI(str).replace(/\%25(\d\d)/g, "%$1");
    }
    try {
      result = new URL(str, "postgres://base");
    } catch (e) {
      result = new URL(str.replace("@/", "@___DUMMY___/"), "postgres://base");
      dummyHost = true;
    }
    for (const entry of result.searchParams.entries()) {
      config[entry[0]] = entry[1];
    }
    config.user = config.user || decodeURIComponent(result.username);
    config.password = config.password || decodeURIComponent(result.password);
    if (result.protocol == "socket:") {
      config.host = decodeURI(result.pathname);
      config.database = result.searchParams.get("db");
      config.client_encoding = result.searchParams.get("encoding");
      return config;
    }
    const hostname = dummyHost ? "" : result.hostname;
    if (!config.host) {
      config.host = decodeURIComponent(hostname);
    } else if (hostname && /^%2f/i.test(hostname)) {
      result.pathname = hostname + result.pathname;
    }
    if (!config.port) {
      config.port = result.port;
    }
    const pathname = result.pathname.slice(1) || null;
    config.database = pathname ? decodeURI(pathname) : null;
    if (config.ssl === "true" || config.ssl === "1") {
      config.ssl = true;
    }
    if (config.ssl === "0") {
      config.ssl = false;
    }
    if (config.sslcert || config.sslkey || config.sslrootcert || config.sslmode) {
      config.ssl = {};
    }
    const fs = config.sslcert || config.sslkey || config.sslrootcert ? import.meta.require("fs") : null;
    if (config.sslcert) {
      config.ssl.cert = fs.readFileSync(config.sslcert).toString();
    }
    if (config.sslkey) {
      config.ssl.key = fs.readFileSync(config.sslkey).toString();
    }
    if (config.sslrootcert) {
      config.ssl.ca = fs.readFileSync(config.sslrootcert).toString();
    }
    switch (config.sslmode) {
      case "disable": {
        config.ssl = false;
        break;
      }
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full": {
        break;
      }
      case "no-verify": {
        config.ssl.rejectUnauthorized = false;
        break;
      }
    }
    return config;
  };
  module.exports = parse;
  parse.parse = parse;
});

// node_modules/pg/lib/connection-parameters.js
var require_connection_parameters = __commonJS((exports, module) => {
  var dns = import.meta.require("dns");
  var defaults = require_defaults();
  var parse = require_pg_connection_string().parse;
  var val = function(key, config, envVar) {
    if (envVar === undefined) {
      envVar = process.env["PG" + key.toUpperCase()];
    } else if (envVar === false) {
    } else {
      envVar = process.env[envVar];
    }
    return config[key] || envVar || defaults[key];
  };
  var readSSLConfigFromEnvironment = function() {
    switch (process.env.PGSSLMODE) {
      case "disable":
        return false;
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        return true;
      case "no-verify":
        return { rejectUnauthorized: false };
    }
    return defaults.ssl;
  };
  var quoteParamValue = function(value) {
    return "'" + ("" + value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  };
  var add = function(params, config, paramName) {
    var value = config[paramName];
    if (value !== undefined && value !== null) {
      params.push(paramName + "=" + quoteParamValue(value));
    }
  };

  class ConnectionParameters {
    constructor(config) {
      config = typeof config === "string" ? parse(config) : config || {};
      if (config.connectionString) {
        config = Object.assign({}, config, parse(config.connectionString));
      }
      this.user = val("user", config);
      this.database = val("database", config);
      if (this.database === undefined) {
        this.database = this.user;
      }
      this.port = parseInt(val("port", config), 10);
      this.host = val("host", config);
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: val("password", config)
      });
      this.binary = val("binary", config);
      this.options = val("options", config);
      this.ssl = typeof config.ssl === "undefined" ? readSSLConfigFromEnvironment() : config.ssl;
      if (typeof this.ssl === "string") {
        if (this.ssl === "true") {
          this.ssl = true;
        }
      }
      if (this.ssl === "no-verify") {
        this.ssl = { rejectUnauthorized: false };
      }
      if (this.ssl && this.ssl.key) {
        Object.defineProperty(this.ssl, "key", {
          enumerable: false
        });
      }
      this.client_encoding = val("client_encoding", config);
      this.replication = val("replication", config);
      this.isDomainSocket = !(this.host || "").indexOf("/");
      this.application_name = val("application_name", config, "PGAPPNAME");
      this.fallback_application_name = val("fallback_application_name", config, false);
      this.statement_timeout = val("statement_timeout", config, false);
      this.lock_timeout = val("lock_timeout", config, false);
      this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config, false);
      this.query_timeout = val("query_timeout", config, false);
      if (config.connectionTimeoutMillis === undefined) {
        this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
      } else {
        this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1000);
      }
      if (config.keepAlive === false) {
        this.keepalives = 0;
      } else if (config.keepAlive === true) {
        this.keepalives = 1;
      }
      if (typeof config.keepAliveInitialDelayMillis === "number") {
        this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1000);
      }
    }
    getLibpqConnectionString(cb) {
      var params = [];
      add(params, this, "user");
      add(params, this, "password");
      add(params, this, "port");
      add(params, this, "application_name");
      add(params, this, "fallback_application_name");
      add(params, this, "connect_timeout");
      add(params, this, "options");
      var ssl = typeof this.ssl === "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
      add(params, ssl, "sslmode");
      add(params, ssl, "sslca");
      add(params, ssl, "sslkey");
      add(params, ssl, "sslcert");
      add(params, ssl, "sslrootcert");
      if (this.database) {
        params.push("dbname=" + quoteParamValue(this.database));
      }
      if (this.replication) {
        params.push("replication=" + quoteParamValue(this.replication));
      }
      if (this.host) {
        params.push("host=" + quoteParamValue(this.host));
      }
      if (this.isDomainSocket) {
        return cb(null, params.join(" "));
      }
      if (this.client_encoding) {
        params.push("client_encoding=" + quoteParamValue(this.client_encoding));
      }
      dns.lookup(this.host, function(err, address) {
        if (err)
          return cb(err, null);
        params.push("hostaddr=" + quoteParamValue(address));
        return cb(null, params.join(" "));
      });
    }
  }
  module.exports = ConnectionParameters;
});

// node_modules/pg/lib/result.js
var require_result = __commonJS((exports, module) => {
  var types = require_pg_types();
  var matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;

  class Result {
    constructor(rowMode, types2) {
      this.command = null;
      this.rowCount = null;
      this.oid = null;
      this.rows = [];
      this.fields = [];
      this._parsers = undefined;
      this._types = types2;
      this.RowCtor = null;
      this.rowAsArray = rowMode === "array";
      if (this.rowAsArray) {
        this.parseRow = this._parseRowAsArray;
      }
      this._prebuiltEmptyResultObject = null;
    }
    addCommandComplete(msg) {
      var match;
      if (msg.text) {
        match = matchRegexp.exec(msg.text);
      } else {
        match = matchRegexp.exec(msg.command);
      }
      if (match) {
        this.command = match[1];
        if (match[3]) {
          this.oid = parseInt(match[2], 10);
          this.rowCount = parseInt(match[3], 10);
        } else if (match[2]) {
          this.rowCount = parseInt(match[2], 10);
        }
      }
    }
    _parseRowAsArray(rowData) {
      var row = new Array(rowData.length);
      for (var i = 0, len = rowData.length;i < len; i++) {
        var rawValue = rowData[i];
        if (rawValue !== null) {
          row[i] = this._parsers[i](rawValue);
        } else {
          row[i] = null;
        }
      }
      return row;
    }
    parseRow(rowData) {
      var row = { ...this._prebuiltEmptyResultObject };
      for (var i = 0, len = rowData.length;i < len; i++) {
        var rawValue = rowData[i];
        var field = this.fields[i].name;
        if (rawValue !== null) {
          row[field] = this._parsers[i](rawValue);
        }
      }
      return row;
    }
    addRow(row) {
      this.rows.push(row);
    }
    addFields(fieldDescriptions) {
      this.fields = fieldDescriptions;
      if (this.fields.length) {
        this._parsers = new Array(fieldDescriptions.length);
      }
      for (var i = 0;i < fieldDescriptions.length; i++) {
        var desc = fieldDescriptions[i];
        if (this._types) {
          this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || "text");
        } else {
          this._parsers[i] = types.getTypeParser(desc.dataTypeID, desc.format || "text");
        }
      }
      this._createPrebuiltEmptyResultObject();
    }
    _createPrebuiltEmptyResultObject() {
      var row = {};
      for (var i = 0;i < this.fields.length; i++) {
        row[this.fields[i].name] = null;
      }
      this._prebuiltEmptyResultObject = { ...row };
    }
  }
  module.exports = Result;
});

// node_modules/pg/lib/query.js
var require_query = __commonJS((exports, module) => {
  var { EventEmitter } = import.meta.require("events");
  var Result = require_result();
  var utils = require_utils();

  class Query extends EventEmitter {
    constructor(config, values, callback) {
      super();
      config = utils.normalizeQueryConfig(config, values, callback);
      this.text = config.text;
      this.values = config.values;
      this.rows = config.rows;
      this.types = config.types;
      this.name = config.name;
      this.binary = config.binary;
      this.portal = config.portal || "";
      this.callback = config.callback;
      this._rowMode = config.rowMode;
      if (process.domain && config.callback) {
        this.callback = process.domain.bind(config.callback);
      }
      this._result = new Result(this._rowMode, this.types);
      this._results = this._result;
      this.isPreparedStatement = false;
      this._canceledDueToError = false;
      this._promise = null;
    }
    requiresPreparation() {
      if (this.name) {
        return true;
      }
      if (this.rows) {
        return true;
      }
      if (!this.text) {
        return false;
      }
      if (!this.values) {
        return false;
      }
      return this.values.length > 0;
    }
    _checkForMultirow() {
      if (this._result.command) {
        if (!Array.isArray(this._results)) {
          this._results = [this._result];
        }
        this._result = new Result(this._rowMode, this.types);
        this._results.push(this._result);
      }
    }
    handleRowDescription(msg) {
      this._checkForMultirow();
      this._result.addFields(msg.fields);
      this._accumulateRows = this.callback || !this.listeners("row").length;
    }
    handleDataRow(msg) {
      let row;
      if (this._canceledDueToError) {
        return;
      }
      try {
        row = this._result.parseRow(msg.fields);
      } catch (err) {
        this._canceledDueToError = err;
        return;
      }
      this.emit("row", row, this._result);
      if (this._accumulateRows) {
        this._result.addRow(row);
      }
    }
    handleCommandComplete(msg, connection) {
      this._checkForMultirow();
      this._result.addCommandComplete(msg);
      if (this.rows) {
        connection.sync();
      }
    }
    handleEmptyQuery(connection) {
      if (this.rows) {
        connection.sync();
      }
    }
    handleError(err, connection) {
      if (this._canceledDueToError) {
        err = this._canceledDueToError;
        this._canceledDueToError = false;
      }
      if (this.callback) {
        return this.callback(err);
      }
      this.emit("error", err);
    }
    handleReadyForQuery(con) {
      if (this._canceledDueToError) {
        return this.handleError(this._canceledDueToError, con);
      }
      if (this.callback) {
        try {
          this.callback(null, this._results);
        } catch (err) {
          process.nextTick(() => {
            throw err;
          });
        }
      }
      this.emit("end", this._results);
    }
    submit(connection) {
      if (typeof this.text !== "string" && typeof this.name !== "string") {
        return new Error("A query must have either text or a name. Supplying neither is unsupported.");
      }
      const previous = connection.parsedStatements[this.name];
      if (this.text && previous && this.text !== previous) {
        return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
      }
      if (this.values && !Array.isArray(this.values)) {
        return new Error("Query values must be an array");
      }
      if (this.requiresPreparation()) {
        this.prepare(connection);
      } else {
        connection.query(this.text);
      }
      return null;
    }
    hasBeenParsed(connection) {
      return this.name && connection.parsedStatements[this.name];
    }
    handlePortalSuspended(connection) {
      this._getRows(connection, this.rows);
    }
    _getRows(connection, rows) {
      connection.execute({
        portal: this.portal,
        rows
      });
      if (!rows) {
        connection.sync();
      } else {
        connection.flush();
      }
    }
    prepare(connection) {
      this.isPreparedStatement = true;
      if (!this.hasBeenParsed(connection)) {
        connection.parse({
          text: this.text,
          name: this.name,
          types: this.types
        });
      }
      try {
        connection.bind({
          portal: this.portal,
          statement: this.name,
          values: this.values,
          binary: this.binary,
          valueMapper: utils.prepareValue
        });
      } catch (err) {
        this.handleError(err, connection);
        return;
      }
      connection.describe({
        type: "P",
        name: this.portal || ""
      });
      this._getRows(connection, this.rows);
    }
    handleCopyInResponse(connection) {
      connection.sendCopyFail("No source stream defined");
    }
    handleCopyData(msg, connection) {
    }
  }
  module.exports = Query;
});

// node_modules/pg-protocol/dist/messages.js
var require_messages = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.NoticeMessage = exports.DataRowMessage = exports.CommandCompleteMessage = exports.ReadyForQueryMessage = exports.NotificationResponseMessage = exports.BackendKeyDataMessage = exports.AuthenticationMD5Password = exports.ParameterStatusMessage = exports.ParameterDescriptionMessage = exports.RowDescriptionMessage = exports.Field = exports.CopyResponse = exports.CopyDataMessage = exports.DatabaseError = exports.copyDone = exports.emptyQuery = exports.replicationStart = exports.portalSuspended = exports.noData = exports.closeComplete = exports.bindComplete = exports.parseComplete = undefined;
  exports.parseComplete = {
    name: "parseComplete",
    length: 5
  };
  exports.bindComplete = {
    name: "bindComplete",
    length: 5
  };
  exports.closeComplete = {
    name: "closeComplete",
    length: 5
  };
  exports.noData = {
    name: "noData",
    length: 5
  };
  exports.portalSuspended = {
    name: "portalSuspended",
    length: 5
  };
  exports.replicationStart = {
    name: "replicationStart",
    length: 4
  };
  exports.emptyQuery = {
    name: "emptyQuery",
    length: 4
  };
  exports.copyDone = {
    name: "copyDone",
    length: 4
  };

  class DatabaseError extends Error {
    constructor(message, length, name) {
      super(message);
      this.length = length;
      this.name = name;
    }
  }
  exports.DatabaseError = DatabaseError;

  class CopyDataMessage {
    constructor(length, chunk) {
      this.length = length;
      this.chunk = chunk;
      this.name = "copyData";
    }
  }
  exports.CopyDataMessage = CopyDataMessage;

  class CopyResponse {
    constructor(length, name, binary, columnCount) {
      this.length = length;
      this.name = name;
      this.binary = binary;
      this.columnTypes = new Array(columnCount);
    }
  }
  exports.CopyResponse = CopyResponse;

  class Field {
    constructor(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
      this.name = name;
      this.tableID = tableID;
      this.columnID = columnID;
      this.dataTypeID = dataTypeID;
      this.dataTypeSize = dataTypeSize;
      this.dataTypeModifier = dataTypeModifier;
      this.format = format;
    }
  }
  exports.Field = Field;

  class RowDescriptionMessage {
    constructor(length, fieldCount) {
      this.length = length;
      this.fieldCount = fieldCount;
      this.name = "rowDescription";
      this.fields = new Array(this.fieldCount);
    }
  }
  exports.RowDescriptionMessage = RowDescriptionMessage;

  class ParameterDescriptionMessage {
    constructor(length, parameterCount) {
      this.length = length;
      this.parameterCount = parameterCount;
      this.name = "parameterDescription";
      this.dataTypeIDs = new Array(this.parameterCount);
    }
  }
  exports.ParameterDescriptionMessage = ParameterDescriptionMessage;

  class ParameterStatusMessage {
    constructor(length, parameterName, parameterValue) {
      this.length = length;
      this.parameterName = parameterName;
      this.parameterValue = parameterValue;
      this.name = "parameterStatus";
    }
  }
  exports.ParameterStatusMessage = ParameterStatusMessage;

  class AuthenticationMD5Password {
    constructor(length, salt) {
      this.length = length;
      this.salt = salt;
      this.name = "authenticationMD5Password";
    }
  }
  exports.AuthenticationMD5Password = AuthenticationMD5Password;

  class BackendKeyDataMessage {
    constructor(length, processID, secretKey) {
      this.length = length;
      this.processID = processID;
      this.secretKey = secretKey;
      this.name = "backendKeyData";
    }
  }
  exports.BackendKeyDataMessage = BackendKeyDataMessage;

  class NotificationResponseMessage {
    constructor(length, processId, channel, payload) {
      this.length = length;
      this.processId = processId;
      this.channel = channel;
      this.payload = payload;
      this.name = "notification";
    }
  }
  exports.NotificationResponseMessage = NotificationResponseMessage;

  class ReadyForQueryMessage {
    constructor(length, status) {
      this.length = length;
      this.status = status;
      this.name = "readyForQuery";
    }
  }
  exports.ReadyForQueryMessage = ReadyForQueryMessage;

  class CommandCompleteMessage {
    constructor(length, text) {
      this.length = length;
      this.text = text;
      this.name = "commandComplete";
    }
  }
  exports.CommandCompleteMessage = CommandCompleteMessage;

  class DataRowMessage {
    constructor(length, fields) {
      this.length = length;
      this.fields = fields;
      this.name = "dataRow";
      this.fieldCount = fields.length;
    }
  }
  exports.DataRowMessage = DataRowMessage;

  class NoticeMessage {
    constructor(length, message) {
      this.length = length;
      this.message = message;
      this.name = "notice";
    }
  }
  exports.NoticeMessage = NoticeMessage;
});

// node_modules/pg-protocol/dist/buffer-writer.js
var require_buffer_writer = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Writer = undefined;

  class Writer {
    constructor(size = 256) {
      this.size = size;
      this.offset = 5;
      this.headerPosition = 0;
      this.buffer = Buffer.allocUnsafe(size);
    }
    ensure(size) {
      var remaining = this.buffer.length - this.offset;
      if (remaining < size) {
        var oldBuffer = this.buffer;
        var newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
        this.buffer = Buffer.allocUnsafe(newSize);
        oldBuffer.copy(this.buffer);
      }
    }
    addInt32(num) {
      this.ensure(4);
      this.buffer[this.offset++] = num >>> 24 & 255;
      this.buffer[this.offset++] = num >>> 16 & 255;
      this.buffer[this.offset++] = num >>> 8 & 255;
      this.buffer[this.offset++] = num >>> 0 & 255;
      return this;
    }
    addInt16(num) {
      this.ensure(2);
      this.buffer[this.offset++] = num >>> 8 & 255;
      this.buffer[this.offset++] = num >>> 0 & 255;
      return this;
    }
    addCString(string) {
      if (!string) {
        this.ensure(1);
      } else {
        var len = Buffer.byteLength(string);
        this.ensure(len + 1);
        this.buffer.write(string, this.offset, "utf-8");
        this.offset += len;
      }
      this.buffer[this.offset++] = 0;
      return this;
    }
    addString(string = "") {
      var len = Buffer.byteLength(string);
      this.ensure(len);
      this.buffer.write(string, this.offset);
      this.offset += len;
      return this;
    }
    add(otherBuffer) {
      this.ensure(otherBuffer.length);
      otherBuffer.copy(this.buffer, this.offset);
      this.offset += otherBuffer.length;
      return this;
    }
    join(code) {
      if (code) {
        this.buffer[this.headerPosition] = code;
        const length = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(length, this.headerPosition + 1);
      }
      return this.buffer.slice(code ? 0 : 5, this.offset);
    }
    flush(code) {
      var result = this.join(code);
      this.offset = 5;
      this.headerPosition = 0;
      this.buffer = Buffer.allocUnsafe(this.size);
      return result;
    }
  }
  exports.Writer = Writer;
});

// node_modules/pg-protocol/dist/serializer.js
var require_serializer = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.serialize = undefined;
  var buffer_writer_1 = require_buffer_writer();
  var writer = new buffer_writer_1.Writer;
  var startup = (opts) => {
    writer.addInt16(3).addInt16(0);
    for (const key of Object.keys(opts)) {
      writer.addCString(key).addCString(opts[key]);
    }
    writer.addCString("client_encoding").addCString("UTF8");
    var bodyBuffer = writer.addCString("").flush();
    var length = bodyBuffer.length + 4;
    return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
  };
  var requestSsl = () => {
    const response = Buffer.allocUnsafe(8);
    response.writeInt32BE(8, 0);
    response.writeInt32BE(80877103, 4);
    return response;
  };
  var password = (password2) => {
    return writer.addCString(password2).flush(112);
  };
  var sendSASLInitialResponseMessage = function(mechanism, initialResponse) {
    writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
    return writer.flush(112);
  };
  var sendSCRAMClientFinalMessage = function(additionalData) {
    return writer.addString(additionalData).flush(112);
  };
  var query = (text) => {
    return writer.addCString(text).flush(81);
  };
  var emptyArray = [];
  var parse = (query2) => {
    const name = query2.name || "";
    if (name.length > 63) {
      console.error("Warning! Postgres only supports 63 characters for query names.");
      console.error("You supplied %s (%s)", name, name.length);
      console.error("This can cause conflicts and silent errors executing queries");
    }
    const types = query2.types || emptyArray;
    var len = types.length;
    var buffer = writer.addCString(name).addCString(query2.text).addInt16(len);
    for (var i = 0;i < len; i++) {
      buffer.addInt32(types[i]);
    }
    return writer.flush(80);
  };
  var paramWriter = new buffer_writer_1.Writer;
  var writeValues = function(values, valueMapper) {
    for (let i = 0;i < values.length; i++) {
      const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
      if (mappedVal == null) {
        writer.addInt16(0);
        paramWriter.addInt32(-1);
      } else if (mappedVal instanceof Buffer) {
        writer.addInt16(1);
        paramWriter.addInt32(mappedVal.length);
        paramWriter.add(mappedVal);
      } else {
        writer.addInt16(0);
        paramWriter.addInt32(Buffer.byteLength(mappedVal));
        paramWriter.addString(mappedVal);
      }
    }
  };
  var bind = (config = {}) => {
    const portal = config.portal || "";
    const statement = config.statement || "";
    const binary = config.binary || false;
    const values = config.values || emptyArray;
    const len = values.length;
    writer.addCString(portal).addCString(statement);
    writer.addInt16(len);
    writeValues(values, config.valueMapper);
    writer.addInt16(len);
    writer.add(paramWriter.flush());
    writer.addInt16(binary ? 1 : 0);
    return writer.flush(66);
  };
  var emptyExecute = Buffer.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]);
  var execute = (config) => {
    if (!config || !config.portal && !config.rows) {
      return emptyExecute;
    }
    const portal = config.portal || "";
    const rows = config.rows || 0;
    const portalLength = Buffer.byteLength(portal);
    const len = 4 + portalLength + 1 + 4;
    const buff = Buffer.allocUnsafe(1 + len);
    buff[0] = 69;
    buff.writeInt32BE(len, 1);
    buff.write(portal, 5, "utf-8");
    buff[portalLength + 5] = 0;
    buff.writeUInt32BE(rows, buff.length - 4);
    return buff;
  };
  var cancel = (processID, secretKey) => {
    const buffer = Buffer.allocUnsafe(16);
    buffer.writeInt32BE(16, 0);
    buffer.writeInt16BE(1234, 4);
    buffer.writeInt16BE(5678, 6);
    buffer.writeInt32BE(processID, 8);
    buffer.writeInt32BE(secretKey, 12);
    return buffer;
  };
  var cstringMessage = (code, string) => {
    const stringLen = Buffer.byteLength(string);
    const len = 4 + stringLen + 1;
    const buffer = Buffer.allocUnsafe(1 + len);
    buffer[0] = code;
    buffer.writeInt32BE(len, 1);
    buffer.write(string, 5, "utf-8");
    buffer[len] = 0;
    return buffer;
  };
  var emptyDescribePortal = writer.addCString("P").flush(68);
  var emptyDescribeStatement = writer.addCString("S").flush(68);
  var describe = (msg) => {
    return msg.name ? cstringMessage(68, `${msg.type}${msg.name || ""}`) : msg.type === "P" ? emptyDescribePortal : emptyDescribeStatement;
  };
  var close = (msg) => {
    const text = `${msg.type}${msg.name || ""}`;
    return cstringMessage(67, text);
  };
  var copyData = (chunk) => {
    return writer.add(chunk).flush(100);
  };
  var copyFail = (message) => {
    return cstringMessage(102, message);
  };
  var codeOnlyBuffer = (code) => Buffer.from([code, 0, 0, 0, 4]);
  var flushBuffer = codeOnlyBuffer(72);
  var syncBuffer = codeOnlyBuffer(83);
  var endBuffer = codeOnlyBuffer(88);
  var copyDoneBuffer = codeOnlyBuffer(99);
  var serialize = {
    startup,
    password,
    requestSsl,
    sendSASLInitialResponseMessage,
    sendSCRAMClientFinalMessage,
    query,
    parse,
    bind,
    execute,
    describe,
    close,
    flush: () => flushBuffer,
    sync: () => syncBuffer,
    end: () => endBuffer,
    copyData,
    copyDone: () => copyDoneBuffer,
    copyFail,
    cancel
  };
  exports.serialize = serialize;
});

// node_modules/pg-protocol/dist/buffer-reader.js
var require_buffer_reader = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.BufferReader = undefined;
  var emptyBuffer = Buffer.allocUnsafe(0);

  class BufferReader {
    constructor(offset = 0) {
      this.offset = offset;
      this.buffer = emptyBuffer;
      this.encoding = "utf-8";
    }
    setBuffer(offset, buffer) {
      this.offset = offset;
      this.buffer = buffer;
    }
    int16() {
      const result = this.buffer.readInt16BE(this.offset);
      this.offset += 2;
      return result;
    }
    byte() {
      const result = this.buffer[this.offset];
      this.offset++;
      return result;
    }
    int32() {
      const result = this.buffer.readInt32BE(this.offset);
      this.offset += 4;
      return result;
    }
    string(length) {
      const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
      this.offset += length;
      return result;
    }
    cstring() {
      const start = this.offset;
      let end = start;
      while (this.buffer[end++] !== 0) {
      }
      this.offset = end;
      return this.buffer.toString(this.encoding, start, end - 1);
    }
    bytes(length) {
      const result = this.buffer.slice(this.offset, this.offset + length);
      this.offset += length;
      return result;
    }
  }
  exports.BufferReader = BufferReader;
});

// node_modules/pg-protocol/dist/parser.js
var require_parser = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Parser = undefined;
  var messages_1 = require_messages();
  var buffer_reader_1 = require_buffer_reader();
  var assert_1 = __importDefault(import.meta.require("assert"));
  var CODE_LENGTH = 1;
  var LEN_LENGTH = 4;
  var HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
  var emptyBuffer = Buffer.allocUnsafe(0);

  class Parser {
    constructor(opts) {
      this.buffer = emptyBuffer;
      this.bufferLength = 0;
      this.bufferOffset = 0;
      this.reader = new buffer_reader_1.BufferReader;
      if ((opts === null || opts === undefined ? undefined : opts.mode) === "binary") {
        throw new Error("Binary mode not supported yet");
      }
      this.mode = (opts === null || opts === undefined ? undefined : opts.mode) || "text";
    }
    parse(buffer, callback) {
      this.mergeBuffer(buffer);
      const bufferFullLength = this.bufferOffset + this.bufferLength;
      let offset = this.bufferOffset;
      while (offset + HEADER_LENGTH <= bufferFullLength) {
        const code = this.buffer[offset];
        const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
        const fullMessageLength = CODE_LENGTH + length;
        if (fullMessageLength + offset <= bufferFullLength) {
          const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
          callback(message);
          offset += fullMessageLength;
        } else {
          break;
        }
      }
      if (offset === bufferFullLength) {
        this.buffer = emptyBuffer;
        this.bufferLength = 0;
        this.bufferOffset = 0;
      } else {
        this.bufferLength = bufferFullLength - offset;
        this.bufferOffset = offset;
      }
    }
    mergeBuffer(buffer) {
      if (this.bufferLength > 0) {
        const newLength = this.bufferLength + buffer.byteLength;
        const newFullLength = newLength + this.bufferOffset;
        if (newFullLength > this.buffer.byteLength) {
          let newBuffer;
          if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
            newBuffer = this.buffer;
          } else {
            let newBufferLength = this.buffer.byteLength * 2;
            while (newLength >= newBufferLength) {
              newBufferLength *= 2;
            }
            newBuffer = Buffer.allocUnsafe(newBufferLength);
          }
          this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
          this.buffer = newBuffer;
          this.bufferOffset = 0;
        }
        buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
        this.bufferLength = newLength;
      } else {
        this.buffer = buffer;
        this.bufferOffset = 0;
        this.bufferLength = buffer.byteLength;
      }
    }
    handlePacket(offset, code, length, bytes) {
      switch (code) {
        case 50:
          return messages_1.bindComplete;
        case 49:
          return messages_1.parseComplete;
        case 51:
          return messages_1.closeComplete;
        case 110:
          return messages_1.noData;
        case 115:
          return messages_1.portalSuspended;
        case 99:
          return messages_1.copyDone;
        case 87:
          return messages_1.replicationStart;
        case 73:
          return messages_1.emptyQuery;
        case 68:
          return this.parseDataRowMessage(offset, length, bytes);
        case 67:
          return this.parseCommandCompleteMessage(offset, length, bytes);
        case 90:
          return this.parseReadyForQueryMessage(offset, length, bytes);
        case 65:
          return this.parseNotificationMessage(offset, length, bytes);
        case 82:
          return this.parseAuthenticationResponse(offset, length, bytes);
        case 83:
          return this.parseParameterStatusMessage(offset, length, bytes);
        case 75:
          return this.parseBackendKeyData(offset, length, bytes);
        case 69:
          return this.parseErrorMessage(offset, length, bytes, "error");
        case 78:
          return this.parseErrorMessage(offset, length, bytes, "notice");
        case 84:
          return this.parseRowDescriptionMessage(offset, length, bytes);
        case 116:
          return this.parseParameterDescriptionMessage(offset, length, bytes);
        case 71:
          return this.parseCopyInMessage(offset, length, bytes);
        case 72:
          return this.parseCopyOutMessage(offset, length, bytes);
        case 100:
          return this.parseCopyData(offset, length, bytes);
        default:
          assert_1.default.fail(`unknown message code: ${code.toString(16)}`);
      }
    }
    parseReadyForQueryMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const status = this.reader.string(1);
      return new messages_1.ReadyForQueryMessage(length, status);
    }
    parseCommandCompleteMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const text = this.reader.cstring();
      return new messages_1.CommandCompleteMessage(length, text);
    }
    parseCopyData(offset, length, bytes) {
      const chunk = bytes.slice(offset, offset + (length - 4));
      return new messages_1.CopyDataMessage(length, chunk);
    }
    parseCopyInMessage(offset, length, bytes) {
      return this.parseCopyMessage(offset, length, bytes, "copyInResponse");
    }
    parseCopyOutMessage(offset, length, bytes) {
      return this.parseCopyMessage(offset, length, bytes, "copyOutResponse");
    }
    parseCopyMessage(offset, length, bytes, messageName) {
      this.reader.setBuffer(offset, bytes);
      const isBinary = this.reader.byte() !== 0;
      const columnCount = this.reader.int16();
      const message = new messages_1.CopyResponse(length, messageName, isBinary, columnCount);
      for (let i = 0;i < columnCount; i++) {
        message.columnTypes[i] = this.reader.int16();
      }
      return message;
    }
    parseNotificationMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const processId = this.reader.int32();
      const channel = this.reader.cstring();
      const payload = this.reader.cstring();
      return new messages_1.NotificationResponseMessage(length, processId, channel, payload);
    }
    parseRowDescriptionMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const fieldCount = this.reader.int16();
      const message = new messages_1.RowDescriptionMessage(length, fieldCount);
      for (let i = 0;i < fieldCount; i++) {
        message.fields[i] = this.parseField();
      }
      return message;
    }
    parseField() {
      const name = this.reader.cstring();
      const tableID = this.reader.int32();
      const columnID = this.reader.int16();
      const dataTypeID = this.reader.int32();
      const dataTypeSize = this.reader.int16();
      const dataTypeModifier = this.reader.int32();
      const mode = this.reader.int16() === 0 ? "text" : "binary";
      return new messages_1.Field(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
    }
    parseParameterDescriptionMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const parameterCount = this.reader.int16();
      const message = new messages_1.ParameterDescriptionMessage(length, parameterCount);
      for (let i = 0;i < parameterCount; i++) {
        message.dataTypeIDs[i] = this.reader.int32();
      }
      return message;
    }
    parseDataRowMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const fieldCount = this.reader.int16();
      const fields = new Array(fieldCount);
      for (let i = 0;i < fieldCount; i++) {
        const len = this.reader.int32();
        fields[i] = len === -1 ? null : this.reader.string(len);
      }
      return new messages_1.DataRowMessage(length, fields);
    }
    parseParameterStatusMessage(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const name = this.reader.cstring();
      const value = this.reader.cstring();
      return new messages_1.ParameterStatusMessage(length, name, value);
    }
    parseBackendKeyData(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const processID = this.reader.int32();
      const secretKey = this.reader.int32();
      return new messages_1.BackendKeyDataMessage(length, processID, secretKey);
    }
    parseAuthenticationResponse(offset, length, bytes) {
      this.reader.setBuffer(offset, bytes);
      const code = this.reader.int32();
      const message = {
        name: "authenticationOk",
        length
      };
      switch (code) {
        case 0:
          break;
        case 3:
          if (message.length === 8) {
            message.name = "authenticationCleartextPassword";
          }
          break;
        case 5:
          if (message.length === 12) {
            message.name = "authenticationMD5Password";
            const salt = this.reader.bytes(4);
            return new messages_1.AuthenticationMD5Password(length, salt);
          }
          break;
        case 10:
          message.name = "authenticationSASL";
          message.mechanisms = [];
          let mechanism;
          do {
            mechanism = this.reader.cstring();
            if (mechanism) {
              message.mechanisms.push(mechanism);
            }
          } while (mechanism);
          break;
        case 11:
          message.name = "authenticationSASLContinue";
          message.data = this.reader.string(length - 8);
          break;
        case 12:
          message.name = "authenticationSASLFinal";
          message.data = this.reader.string(length - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + code);
      }
      return message;
    }
    parseErrorMessage(offset, length, bytes, name) {
      this.reader.setBuffer(offset, bytes);
      const fields = {};
      let fieldType = this.reader.string(1);
      while (fieldType !== "\0") {
        fields[fieldType] = this.reader.cstring();
        fieldType = this.reader.string(1);
      }
      const messageValue = fields.M;
      const message = name === "notice" ? new messages_1.NoticeMessage(length, messageValue) : new messages_1.DatabaseError(messageValue, length, name);
      message.severity = fields.S;
      message.code = fields.C;
      message.detail = fields.D;
      message.hint = fields.H;
      message.position = fields.P;
      message.internalPosition = fields.p;
      message.internalQuery = fields.q;
      message.where = fields.W;
      message.schema = fields.s;
      message.table = fields.t;
      message.column = fields.c;
      message.dataType = fields.d;
      message.constraint = fields.n;
      message.file = fields.F;
      message.line = fields.L;
      message.routine = fields.R;
      return message;
    }
  }
  exports.Parser = Parser;
});

// node_modules/pg-protocol/dist/index.js
var require_dist = __commonJS((exports) => {
  var parse = function(stream, callback) {
    const parser = new parser_1.Parser;
    stream.on("data", (buffer) => parser.parse(buffer, callback));
    return new Promise((resolve) => stream.on("end", () => resolve()));
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DatabaseError = exports.serialize = exports.parse = undefined;
  var messages_1 = require_messages();
  Object.defineProperty(exports, "DatabaseError", { enumerable: true, get: function() {
    return messages_1.DatabaseError;
  } });
  var serializer_1 = require_serializer();
  Object.defineProperty(exports, "serialize", { enumerable: true, get: function() {
    return serializer_1.serialize;
  } });
  var parser_1 = require_parser();
  exports.parse = parse;
});

// node_modules/pg-cloudflare/dist/empty.js
var exports_empty = {};
__export(exports_empty, {
  default: () => {
    {
      return empty_default;
    }
  }
});
var empty_default;
var init_empty = __esm(() => {
  empty_default = {};
});

// node_modules/pg/lib/stream.js
var require_stream = __commonJS((exports, module) => {
  exports.getStream = function getStream(ssl) {
    const net = import.meta.require("net");
    if (typeof net.Socket === "function") {
      return new net.Socket;
    } else {
      const { CloudflareSocket } = (init_empty(), __toCommonJS(exports_empty));
      return new CloudflareSocket(ssl);
    }
  };
  exports.getSecureStream = function getSecureStream(options) {
    var tls = import.meta.require("tls");
    if (tls.connect) {
      return tls.connect(options);
    } else {
      options.socket.startTls(options);
      return options.socket;
    }
  };
});

// node_modules/pg/lib/connection.js
var require_connection = __commonJS((exports, module) => {
  var net = import.meta.require("net");
  var EventEmitter = import.meta.require("events").EventEmitter;
  var { parse, serialize } = require_dist();
  var { getStream, getSecureStream } = require_stream();
  var flushBuffer = serialize.flush();
  var syncBuffer = serialize.sync();
  var endBuffer = serialize.end();

  class Connection extends EventEmitter {
    constructor(config) {
      super();
      config = config || {};
      this.stream = config.stream || getStream(config.ssl);
      if (typeof this.stream === "function") {
        this.stream = this.stream(config);
      }
      this._keepAlive = config.keepAlive;
      this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
      this.lastBuffer = false;
      this.parsedStatements = {};
      this.ssl = config.ssl || false;
      this._ending = false;
      this._emitMessage = false;
      var self = this;
      this.on("newListener", function(eventName) {
        if (eventName === "message") {
          self._emitMessage = true;
        }
      });
    }
    connect(port, host) {
      var self = this;
      this._connecting = true;
      this.stream.setNoDelay(true);
      this.stream.connect(port, host);
      this.stream.once("connect", function() {
        if (self._keepAlive) {
          self.stream.setKeepAlive(true, self._keepAliveInitialDelayMillis);
        }
        self.emit("connect");
      });
      const reportStreamError = function(error) {
        if (self._ending && (error.code === "ECONNRESET" || error.code === "EPIPE")) {
          return;
        }
        self.emit("error", error);
      };
      this.stream.on("error", reportStreamError);
      this.stream.on("close", function() {
        self.emit("end");
      });
      if (!this.ssl) {
        return this.attachListeners(this.stream);
      }
      this.stream.once("data", function(buffer) {
        var responseCode = buffer.toString("utf8");
        switch (responseCode) {
          case "S":
            break;
          case "N":
            self.stream.end();
            return self.emit("error", new Error("The server does not support SSL connections"));
          default:
            self.stream.end();
            return self.emit("error", new Error("There was an error establishing an SSL connection"));
        }
        const options = {
          socket: self.stream
        };
        if (self.ssl !== true) {
          Object.assign(options, self.ssl);
          if ("key" in self.ssl) {
            options.key = self.ssl.key;
          }
        }
        var net2 = import.meta.require("net");
        if (net2.isIP && net2.isIP(host) === 0) {
          options.servername = host;
        }
        try {
          self.stream = getSecureStream(options);
        } catch (err) {
          return self.emit("error", err);
        }
        self.attachListeners(self.stream);
        self.stream.on("error", reportStreamError);
        self.emit("sslconnect");
      });
    }
    attachListeners(stream) {
      parse(stream, (msg) => {
        var eventName = msg.name === "error" ? "errorMessage" : msg.name;
        if (this._emitMessage) {
          this.emit("message", msg);
        }
        this.emit(eventName, msg);
      });
    }
    requestSsl() {
      this.stream.write(serialize.requestSsl());
    }
    startup(config) {
      this.stream.write(serialize.startup(config));
    }
    cancel(processID, secretKey) {
      this._send(serialize.cancel(processID, secretKey));
    }
    password(password) {
      this._send(serialize.password(password));
    }
    sendSASLInitialResponseMessage(mechanism, initialResponse) {
      this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
    }
    sendSCRAMClientFinalMessage(additionalData) {
      this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
    }
    _send(buffer) {
      if (!this.stream.writable) {
        return false;
      }
      return this.stream.write(buffer);
    }
    query(text) {
      this._send(serialize.query(text));
    }
    parse(query) {
      this._send(serialize.parse(query));
    }
    bind(config) {
      this._send(serialize.bind(config));
    }
    execute(config) {
      this._send(serialize.execute(config));
    }
    flush() {
      if (this.stream.writable) {
        this.stream.write(flushBuffer);
      }
    }
    sync() {
      this._ending = true;
      this._send(syncBuffer);
    }
    ref() {
      this.stream.ref();
    }
    unref() {
      this.stream.unref();
    }
    end() {
      this._ending = true;
      if (!this._connecting || !this.stream.writable) {
        this.stream.end();
        return;
      }
      return this.stream.write(endBuffer, () => {
        this.stream.end();
      });
    }
    close(msg) {
      this._send(serialize.close(msg));
    }
    describe(msg) {
      this._send(serialize.describe(msg));
    }
    sendCopyFromChunk(chunk) {
      this._send(serialize.copyData(chunk));
    }
    endCopyFrom() {
      this._send(serialize.copyDone());
    }
    sendCopyFail(msg) {
      this._send(serialize.copyFail(msg));
    }
  }
  module.exports = Connection;
});

// node_modules/split2/index.js
var require_split2 = __commonJS((exports, module) => {
  var transform = function(chunk, enc, cb) {
    let list;
    if (this.overflow) {
      const buf = this[kDecoder].write(chunk);
      list = buf.split(this.matcher);
      if (list.length === 1)
        return cb();
      list.shift();
      this.overflow = false;
    } else {
      this[kLast] += this[kDecoder].write(chunk);
      list = this[kLast].split(this.matcher);
    }
    this[kLast] = list.pop();
    for (let i = 0;i < list.length; i++) {
      try {
        push(this, this.mapper(list[i]));
      } catch (error) {
        return cb(error);
      }
    }
    this.overflow = this[kLast].length > this.maxLength;
    if (this.overflow && !this.skipOverflow) {
      cb(new Error("maximum buffer reached"));
      return;
    }
    cb();
  };
  var flush = function(cb) {
    this[kLast] += this[kDecoder].end();
    if (this[kLast]) {
      try {
        push(this, this.mapper(this[kLast]));
      } catch (error) {
        return cb(error);
      }
    }
    cb();
  };
  var push = function(self, val) {
    if (val !== undefined) {
      self.push(val);
    }
  };
  var noop = function(incoming) {
    return incoming;
  };
  var split = function(matcher, mapper, options) {
    matcher = matcher || /\r?\n/;
    mapper = mapper || noop;
    options = options || {};
    switch (arguments.length) {
      case 1:
        if (typeof matcher === "function") {
          mapper = matcher;
          matcher = /\r?\n/;
        } else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
          options = matcher;
          matcher = /\r?\n/;
        }
        break;
      case 2:
        if (typeof matcher === "function") {
          options = mapper;
          mapper = matcher;
          matcher = /\r?\n/;
        } else if (typeof mapper === "object") {
          options = mapper;
          mapper = noop;
        }
    }
    options = Object.assign({}, options);
    options.autoDestroy = true;
    options.transform = transform;
    options.flush = flush;
    options.readableObjectMode = true;
    const stream = new Transform(options);
    stream[kLast] = "";
    stream[kDecoder] = new StringDecoder("utf8");
    stream.matcher = matcher;
    stream.mapper = mapper;
    stream.maxLength = options.maxLength;
    stream.skipOverflow = options.skipOverflow || false;
    stream.overflow = false;
    stream._destroy = function(err, cb) {
      this._writableState.errorEmitted = false;
      cb(err);
    };
    return stream;
  };
  var { Transform } = import.meta.require("stream");
  var { StringDecoder } = import.meta.require("string_decoder");
  var kLast = Symbol("last");
  var kDecoder = Symbol("decoder");
  module.exports = split;
});

// node_modules/pgpass/lib/helper.js
var require_helper = __commonJS((exports, module) => {
  var isRegFile = function(mode) {
    return (mode & S_IFMT) == S_IFREG;
  };
  var warn = function() {
    var isWritable = warnStream instanceof Stream && warnStream.writable === true;
    if (isWritable) {
      var args = Array.prototype.slice.call(arguments).concat("\n");
      warnStream.write(util.format.apply(util, args));
    }
  };
  var path = import.meta.require("path");
  var Stream = import.meta.require("stream").Stream;
  var split = require_split2();
  var util = import.meta.require("util");
  var defaultPort = 5432;
  var isWin = process.platform === "win32";
  var warnStream = process.stderr;
  var S_IRWXG = 56;
  var S_IRWXO = 7;
  var S_IFMT = 61440;
  var S_IFREG = 32768;
  var fieldNames = ["host", "port", "database", "user", "password"];
  var nrOfFields = fieldNames.length;
  var passKey = fieldNames[nrOfFields - 1];
  Object.defineProperty(exports, "isWin", {
    get: function() {
      return isWin;
    },
    set: function(val) {
      isWin = val;
    }
  });
  exports.warnTo = function(stream) {
    var old = warnStream;
    warnStream = stream;
    return old;
  };
  exports.getFileName = function(rawEnv) {
    var env = rawEnv || process.env;
    var file = env.PGPASSFILE || (isWin ? path.join(env.APPDATA || "./", "postgresql", "pgpass.conf") : path.join(env.HOME || "./", ".pgpass"));
    return file;
  };
  exports.usePgPass = function(stats, fname) {
    if (Object.prototype.hasOwnProperty.call(process.env, "PGPASSWORD")) {
      return false;
    }
    if (isWin) {
      return true;
    }
    fname = fname || "<unkn>";
    if (!isRegFile(stats.mode)) {
      warn('WARNING: password file "%s" is not a plain file', fname);
      return false;
    }
    if (stats.mode & (S_IRWXG | S_IRWXO)) {
      warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
      return false;
    }
    return true;
  };
  var matcher = exports.match = function(connInfo, entry) {
    return fieldNames.slice(0, -1).reduce(function(prev, field, idx) {
      if (idx == 1) {
        if (Number(connInfo[field] || defaultPort) === Number(entry[field])) {
          return prev && true;
        }
      }
      return prev && (entry[field] === "*" || entry[field] === connInfo[field]);
    }, true);
  };
  exports.getPassword = function(connInfo, stream, cb) {
    var pass;
    var lineStream = stream.pipe(split());
    function onLine(line) {
      var entry = parseLine(line);
      if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
        pass = entry[passKey];
        lineStream.end();
      }
    }
    var onEnd = function() {
      stream.destroy();
      cb(pass);
    };
    var onErr = function(err) {
      stream.destroy();
      warn("WARNING: error on reading file: %s", err);
      cb(undefined);
    };
    stream.on("error", onErr);
    lineStream.on("data", onLine).on("end", onEnd).on("error", onErr);
  };
  var parseLine = exports.parseLine = function(line) {
    if (line.length < 11 || line.match(/^\s+#/)) {
      return null;
    }
    var curChar = "";
    var prevChar = "";
    var fieldIdx = 0;
    var startIdx = 0;
    var endIdx = 0;
    var obj = {};
    var isLastField = false;
    var addToObj = function(idx, i0, i1) {
      var field = line.substring(i0, i1);
      if (!Object.hasOwnProperty.call(process.env, "PGPASS_NO_DEESCAPE")) {
        field = field.replace(/\\([:\\])/g, "$1");
      }
      obj[fieldNames[idx]] = field;
    };
    for (var i = 0;i < line.length - 1; i += 1) {
      curChar = line.charAt(i + 1);
      prevChar = line.charAt(i);
      isLastField = fieldIdx == nrOfFields - 1;
      if (isLastField) {
        addToObj(fieldIdx, startIdx);
        break;
      }
      if (i >= 0 && curChar == ":" && prevChar !== "\\") {
        addToObj(fieldIdx, startIdx, i + 1);
        startIdx = i + 2;
        fieldIdx += 1;
      }
    }
    obj = Object.keys(obj).length === nrOfFields ? obj : null;
    return obj;
  };
  var isValidEntry = exports.isValidEntry = function(entry) {
    var rules = {
      0: function(x) {
        return x.length > 0;
      },
      1: function(x) {
        if (x === "*") {
          return true;
        }
        x = Number(x);
        return isFinite(x) && x > 0 && x < 9007199254740992 && Math.floor(x) === x;
      },
      2: function(x) {
        return x.length > 0;
      },
      3: function(x) {
        return x.length > 0;
      },
      4: function(x) {
        return x.length > 0;
      }
    };
    for (var idx = 0;idx < fieldNames.length; idx += 1) {
      var rule = rules[idx];
      var value = entry[fieldNames[idx]] || "";
      var res = rule(value);
      if (!res) {
        return false;
      }
    }
    return true;
  };
});

// node_modules/pgpass/lib/index.js
var require_lib = __commonJS((exports, module) => {
  var path = import.meta.require("path");
  var fs = import.meta.require("fs");
  var helper = require_helper();
  module.exports = function(connInfo, cb) {
    var file = helper.getFileName();
    fs.stat(file, function(err, stat) {
      if (err || !helper.usePgPass(stat, file)) {
        return cb(undefined);
      }
      var st = fs.createReadStream(file);
      helper.getPassword(connInfo, st, cb);
    });
  };
  module.exports.warnTo = helper.warnTo;
});

// node_modules/pg/lib/client.js
var require_client = __commonJS((exports, module) => {
  var EventEmitter = import.meta.require("events").EventEmitter;
  var utils = require_utils();
  var sasl = require_sasl();
  var TypeOverrides = require_type_overrides();
  var ConnectionParameters = require_connection_parameters();
  var Query = require_query();
  var defaults = require_defaults();
  var Connection = require_connection();
  var crypto = require_utils2();

  class Client extends EventEmitter {
    constructor(config) {
      super();
      this.connectionParameters = new ConnectionParameters(config);
      this.user = this.connectionParameters.user;
      this.database = this.connectionParameters.database;
      this.port = this.connectionParameters.port;
      this.host = this.connectionParameters.host;
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: this.connectionParameters.password
      });
      this.replication = this.connectionParameters.replication;
      var c = config || {};
      this._Promise = c.Promise || global.Promise;
      this._types = new TypeOverrides(c.types);
      this._ending = false;
      this._ended = false;
      this._connecting = false;
      this._connected = false;
      this._connectionError = false;
      this._queryable = true;
      this.connection = c.connection || new Connection({
        stream: c.stream,
        ssl: this.connectionParameters.ssl,
        keepAlive: c.keepAlive || false,
        keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
        encoding: this.connectionParameters.client_encoding || "utf8"
      });
      this.queryQueue = [];
      this.binary = c.binary || defaults.binary;
      this.processID = null;
      this.secretKey = null;
      this.ssl = this.connectionParameters.ssl || false;
      if (this.ssl && this.ssl.key) {
        Object.defineProperty(this.ssl, "key", {
          enumerable: false
        });
      }
      this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
    }
    _errorAllQueries(err) {
      const enqueueError = (query) => {
        process.nextTick(() => {
          query.handleError(err, this.connection);
        });
      };
      if (this.activeQuery) {
        enqueueError(this.activeQuery);
        this.activeQuery = null;
      }
      this.queryQueue.forEach(enqueueError);
      this.queryQueue.length = 0;
    }
    _connect(callback) {
      var self = this;
      var con = this.connection;
      this._connectionCallback = callback;
      if (this._connecting || this._connected) {
        const err = new Error("Client has already been connected. You cannot reuse a client.");
        process.nextTick(() => {
          callback(err);
        });
        return;
      }
      this._connecting = true;
      this.connectionTimeoutHandle;
      if (this._connectionTimeoutMillis > 0) {
        this.connectionTimeoutHandle = setTimeout(() => {
          con._ending = true;
          con.stream.destroy(new Error("timeout expired"));
        }, this._connectionTimeoutMillis);
      }
      if (this.host && this.host.indexOf("/") === 0) {
        con.connect(this.host + "/.s.PGSQL." + this.port);
      } else {
        con.connect(this.port, this.host);
      }
      con.on("connect", function() {
        if (self.ssl) {
          con.requestSsl();
        } else {
          con.startup(self.getStartupConf());
        }
      });
      con.on("sslconnect", function() {
        con.startup(self.getStartupConf());
      });
      this._attachListeners(con);
      con.once("end", () => {
        const error = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
        clearTimeout(this.connectionTimeoutHandle);
        this._errorAllQueries(error);
        this._ended = true;
        if (!this._ending) {
          if (this._connecting && !this._connectionError) {
            if (this._connectionCallback) {
              this._connectionCallback(error);
            } else {
              this._handleErrorEvent(error);
            }
          } else if (!this._connectionError) {
            this._handleErrorEvent(error);
          }
        }
        process.nextTick(() => {
          this.emit("end");
        });
      });
    }
    connect(callback) {
      if (callback) {
        this._connect(callback);
        return;
      }
      return new this._Promise((resolve, reject) => {
        this._connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
    _attachListeners(con) {
      con.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this));
      con.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this));
      con.on("authenticationSASL", this._handleAuthSASL.bind(this));
      con.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this));
      con.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this));
      con.on("backendKeyData", this._handleBackendKeyData.bind(this));
      con.on("error", this._handleErrorEvent.bind(this));
      con.on("errorMessage", this._handleErrorMessage.bind(this));
      con.on("readyForQuery", this._handleReadyForQuery.bind(this));
      con.on("notice", this._handleNotice.bind(this));
      con.on("rowDescription", this._handleRowDescription.bind(this));
      con.on("dataRow", this._handleDataRow.bind(this));
      con.on("portalSuspended", this._handlePortalSuspended.bind(this));
      con.on("emptyQuery", this._handleEmptyQuery.bind(this));
      con.on("commandComplete", this._handleCommandComplete.bind(this));
      con.on("parseComplete", this._handleParseComplete.bind(this));
      con.on("copyInResponse", this._handleCopyInResponse.bind(this));
      con.on("copyData", this._handleCopyData.bind(this));
      con.on("notification", this._handleNotification.bind(this));
    }
    _checkPgPass(cb) {
      const con = this.connection;
      if (typeof this.password === "function") {
        this._Promise.resolve().then(() => this.password()).then((pass) => {
          if (pass !== undefined) {
            if (typeof pass !== "string") {
              con.emit("error", new TypeError("Password must be a string"));
              return;
            }
            this.connectionParameters.password = this.password = pass;
          } else {
            this.connectionParameters.password = this.password = null;
          }
          cb();
        }).catch((err) => {
          con.emit("error", err);
        });
      } else if (this.password !== null) {
        cb();
      } else {
        try {
          const pgPass = require_lib();
          pgPass(this.connectionParameters, (pass) => {
            if (pass !== undefined) {
              this.connectionParameters.password = this.password = pass;
            }
            cb();
          });
        } catch (e) {
          this.emit("error", e);
        }
      }
    }
    _handleAuthCleartextPassword(msg) {
      this._checkPgPass(() => {
        this.connection.password(this.password);
      });
    }
    _handleAuthMD5Password(msg) {
      this._checkPgPass(async () => {
        try {
          const hashedPassword = await crypto.postgresMd5PasswordHash(this.user, this.password, msg.salt);
          this.connection.password(hashedPassword);
        } catch (e) {
          this.emit("error", e);
        }
      });
    }
    _handleAuthSASL(msg) {
      this._checkPgPass(() => {
        try {
          this.saslSession = sasl.startSession(msg.mechanisms);
          this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
        } catch (err) {
          this.connection.emit("error", err);
        }
      });
    }
    async _handleAuthSASLContinue(msg) {
      try {
        await sasl.continueSession(this.saslSession, this.password, msg.data);
        this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
      } catch (err) {
        this.connection.emit("error", err);
      }
    }
    _handleAuthSASLFinal(msg) {
      try {
        sasl.finalizeSession(this.saslSession, msg.data);
        this.saslSession = null;
      } catch (err) {
        this.connection.emit("error", err);
      }
    }
    _handleBackendKeyData(msg) {
      this.processID = msg.processID;
      this.secretKey = msg.secretKey;
    }
    _handleReadyForQuery(msg) {
      if (this._connecting) {
        this._connecting = false;
        this._connected = true;
        clearTimeout(this.connectionTimeoutHandle);
        if (this._connectionCallback) {
          this._connectionCallback(null, this);
          this._connectionCallback = null;
        }
        this.emit("connect");
      }
      const { activeQuery } = this;
      this.activeQuery = null;
      this.readyForQuery = true;
      if (activeQuery) {
        activeQuery.handleReadyForQuery(this.connection);
      }
      this._pulseQueryQueue();
    }
    _handleErrorWhileConnecting(err) {
      if (this._connectionError) {
        return;
      }
      this._connectionError = true;
      clearTimeout(this.connectionTimeoutHandle);
      if (this._connectionCallback) {
        return this._connectionCallback(err);
      }
      this.emit("error", err);
    }
    _handleErrorEvent(err) {
      if (this._connecting) {
        return this._handleErrorWhileConnecting(err);
      }
      this._queryable = false;
      this._errorAllQueries(err);
      this.emit("error", err);
    }
    _handleErrorMessage(msg) {
      if (this._connecting) {
        return this._handleErrorWhileConnecting(msg);
      }
      const activeQuery = this.activeQuery;
      if (!activeQuery) {
        this._handleErrorEvent(msg);
        return;
      }
      this.activeQuery = null;
      activeQuery.handleError(msg, this.connection);
    }
    _handleRowDescription(msg) {
      this.activeQuery.handleRowDescription(msg);
    }
    _handleDataRow(msg) {
      this.activeQuery.handleDataRow(msg);
    }
    _handlePortalSuspended(msg) {
      this.activeQuery.handlePortalSuspended(this.connection);
    }
    _handleEmptyQuery(msg) {
      this.activeQuery.handleEmptyQuery(this.connection);
    }
    _handleCommandComplete(msg) {
      this.activeQuery.handleCommandComplete(msg, this.connection);
    }
    _handleParseComplete(msg) {
      if (this.activeQuery.name) {
        this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text;
      }
    }
    _handleCopyInResponse(msg) {
      this.activeQuery.handleCopyInResponse(this.connection);
    }
    _handleCopyData(msg) {
      this.activeQuery.handleCopyData(msg, this.connection);
    }
    _handleNotification(msg) {
      this.emit("notification", msg);
    }
    _handleNotice(msg) {
      this.emit("notice", msg);
    }
    getStartupConf() {
      var params = this.connectionParameters;
      var data = {
        user: params.user,
        database: params.database
      };
      var appName = params.application_name || params.fallback_application_name;
      if (appName) {
        data.application_name = appName;
      }
      if (params.replication) {
        data.replication = "" + params.replication;
      }
      if (params.statement_timeout) {
        data.statement_timeout = String(parseInt(params.statement_timeout, 10));
      }
      if (params.lock_timeout) {
        data.lock_timeout = String(parseInt(params.lock_timeout, 10));
      }
      if (params.idle_in_transaction_session_timeout) {
        data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
      }
      if (params.options) {
        data.options = params.options;
      }
      return data;
    }
    cancel(client, query) {
      if (client.activeQuery === query) {
        var con = this.connection;
        if (this.host && this.host.indexOf("/") === 0) {
          con.connect(this.host + "/.s.PGSQL." + this.port);
        } else {
          con.connect(this.port, this.host);
        }
        con.on("connect", function() {
          con.cancel(client.processID, client.secretKey);
        });
      } else if (client.queryQueue.indexOf(query) !== -1) {
        client.queryQueue.splice(client.queryQueue.indexOf(query), 1);
      }
    }
    setTypeParser(oid, format, parseFn) {
      return this._types.setTypeParser(oid, format, parseFn);
    }
    getTypeParser(oid, format) {
      return this._types.getTypeParser(oid, format);
    }
    escapeIdentifier(str) {
      return utils.escapeIdentifier(str);
    }
    escapeLiteral(str) {
      return utils.escapeLiteral(str);
    }
    _pulseQueryQueue() {
      if (this.readyForQuery === true) {
        this.activeQuery = this.queryQueue.shift();
        if (this.activeQuery) {
          this.readyForQuery = false;
          this.hasExecuted = true;
          const queryError = this.activeQuery.submit(this.connection);
          if (queryError) {
            process.nextTick(() => {
              this.activeQuery.handleError(queryError, this.connection);
              this.readyForQuery = true;
              this._pulseQueryQueue();
            });
          }
        } else if (this.hasExecuted) {
          this.activeQuery = null;
          this.emit("drain");
        }
      }
    }
    query(config, values, callback) {
      var query;
      var result;
      var readTimeout;
      var readTimeoutTimer;
      var queryCallback;
      if (config === null || config === undefined) {
        throw new TypeError("Client was passed a null or undefined query");
      } else if (typeof config.submit === "function") {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        result = query = config;
        if (typeof values === "function") {
          query.callback = query.callback || values;
        }
      } else {
        readTimeout = this.connectionParameters.query_timeout;
        query = new Query(config, values, callback);
        if (!query.callback) {
          result = new this._Promise((resolve, reject) => {
            query.callback = (err, res) => err ? reject(err) : resolve(res);
          }).catch((err) => {
            Error.captureStackTrace(err);
            throw err;
          });
        }
      }
      if (readTimeout) {
        queryCallback = query.callback;
        readTimeoutTimer = setTimeout(() => {
          var error = new Error("Query read timeout");
          process.nextTick(() => {
            query.handleError(error, this.connection);
          });
          queryCallback(error);
          query.callback = () => {
          };
          var index = this.queryQueue.indexOf(query);
          if (index > -1) {
            this.queryQueue.splice(index, 1);
          }
          this._pulseQueryQueue();
        }, readTimeout);
        query.callback = (err, res) => {
          clearTimeout(readTimeoutTimer);
          queryCallback(err, res);
        };
      }
      if (this.binary && !query.binary) {
        query.binary = true;
      }
      if (query._result && !query._result._types) {
        query._result._types = this._types;
      }
      if (!this._queryable) {
        process.nextTick(() => {
          query.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
        });
        return result;
      }
      if (this._ending) {
        process.nextTick(() => {
          query.handleError(new Error("Client was closed and is not queryable"), this.connection);
        });
        return result;
      }
      this.queryQueue.push(query);
      this._pulseQueryQueue();
      return result;
    }
    ref() {
      this.connection.ref();
    }
    unref() {
      this.connection.unref();
    }
    end(cb) {
      this._ending = true;
      if (!this.connection._connecting || this._ended) {
        if (cb) {
          cb();
        } else {
          return this._Promise.resolve();
        }
      }
      if (this.activeQuery || !this._queryable) {
        this.connection.stream.destroy();
      } else {
        this.connection.end();
      }
      if (cb) {
        this.connection.once("end", cb);
      } else {
        return new this._Promise((resolve) => {
          this.connection.once("end", resolve);
        });
      }
    }
  }
  Client.Query = Query;
  module.exports = Client;
});

// node_modules/pg-pool/index.js
var require_pg_pool = __commonJS((exports, module) => {
  var throwOnDoubleRelease = function() {
    throw new Error("Release called on client which has already been released to the pool.");
  };
  var promisify = function(Promise2, callback) {
    if (callback) {
      return { callback, result: undefined };
    }
    let rej;
    let res;
    const cb = function(err, client) {
      err ? rej(err) : res(client);
    };
    const result = new Promise2(function(resolve, reject) {
      res = resolve;
      rej = reject;
    }).catch((err) => {
      Error.captureStackTrace(err);
      throw err;
    });
    return { callback: cb, result };
  };
  var makeIdleListener = function(pool, client) {
    return function idleListener(err) {
      err.client = client;
      client.removeListener("error", idleListener);
      client.on("error", () => {
        pool.log("additional client error after disconnection due to error", err);
      });
      pool._remove(client);
      pool.emit("error", err, client);
    };
  };
  var EventEmitter = import.meta.require("events").EventEmitter;
  var NOOP = function() {
  };
  var removeWhere = (list, predicate) => {
    const i = list.findIndex(predicate);
    return i === -1 ? undefined : list.splice(i, 1)[0];
  };

  class IdleItem {
    constructor(client, idleListener, timeoutId) {
      this.client = client;
      this.idleListener = idleListener;
      this.timeoutId = timeoutId;
    }
  }

  class PendingItem {
    constructor(callback) {
      this.callback = callback;
    }
  }

  class Pool extends EventEmitter {
    constructor(options, Client) {
      super();
      this.options = Object.assign({}, options);
      if (options != null && ("password" in options)) {
        Object.defineProperty(this.options, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: options.password
        });
      }
      if (options != null && options.ssl && options.ssl.key) {
        Object.defineProperty(this.options.ssl, "key", {
          enumerable: false
        });
      }
      this.options.max = this.options.max || this.options.poolSize || 10;
      this.options.maxUses = this.options.maxUses || Infinity;
      this.options.allowExitOnIdle = this.options.allowExitOnIdle || false;
      this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0;
      this.log = this.options.log || function() {
      };
      this.Client = this.options.Client || Client || require_lib2().Client;
      this.Promise = this.options.Promise || global.Promise;
      if (typeof this.options.idleTimeoutMillis === "undefined") {
        this.options.idleTimeoutMillis = 1e4;
      }
      this._clients = [];
      this._idle = [];
      this._expired = new WeakSet;
      this._pendingQueue = [];
      this._endCallback = undefined;
      this.ending = false;
      this.ended = false;
    }
    _isFull() {
      return this._clients.length >= this.options.max;
    }
    _pulseQueue() {
      this.log("pulse queue");
      if (this.ended) {
        this.log("pulse queue ended");
        return;
      }
      if (this.ending) {
        this.log("pulse queue on ending");
        if (this._idle.length) {
          this._idle.slice().map((item) => {
            this._remove(item.client);
          });
        }
        if (!this._clients.length) {
          this.ended = true;
          this._endCallback();
        }
        return;
      }
      if (!this._pendingQueue.length) {
        this.log("no queued requests");
        return;
      }
      if (!this._idle.length && this._isFull()) {
        return;
      }
      const pendingItem = this._pendingQueue.shift();
      if (this._idle.length) {
        const idleItem = this._idle.pop();
        clearTimeout(idleItem.timeoutId);
        const client = idleItem.client;
        client.ref && client.ref();
        const idleListener = idleItem.idleListener;
        return this._acquireClient(client, pendingItem, idleListener, false);
      }
      if (!this._isFull()) {
        return this.newClient(pendingItem);
      }
      throw new Error("unexpected condition");
    }
    _remove(client) {
      const removed = removeWhere(this._idle, (item) => item.client === client);
      if (removed !== undefined) {
        clearTimeout(removed.timeoutId);
      }
      this._clients = this._clients.filter((c) => c !== client);
      client.end();
      this.emit("remove", client);
    }
    connect(cb) {
      if (this.ending) {
        const err = new Error("Cannot use a pool after calling end on the pool");
        return cb ? cb(err) : this.Promise.reject(err);
      }
      const response = promisify(this.Promise, cb);
      const result = response.result;
      if (this._isFull() || this._idle.length) {
        if (this._idle.length) {
          process.nextTick(() => this._pulseQueue());
        }
        if (!this.options.connectionTimeoutMillis) {
          this._pendingQueue.push(new PendingItem(response.callback));
          return result;
        }
        const queueCallback = (err, res, done) => {
          clearTimeout(tid);
          response.callback(err, res, done);
        };
        const pendingItem = new PendingItem(queueCallback);
        const tid = setTimeout(() => {
          removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
          pendingItem.timedOut = true;
          response.callback(new Error("timeout exceeded when trying to connect"));
        }, this.options.connectionTimeoutMillis);
        this._pendingQueue.push(pendingItem);
        return result;
      }
      this.newClient(new PendingItem(response.callback));
      return result;
    }
    newClient(pendingItem) {
      const client = new this.Client(this.options);
      this._clients.push(client);
      const idleListener = makeIdleListener(this, client);
      this.log("checking client timeout");
      let tid;
      let timeoutHit = false;
      if (this.options.connectionTimeoutMillis) {
        tid = setTimeout(() => {
          this.log("ending client due to timeout");
          timeoutHit = true;
          client.connection ? client.connection.stream.destroy() : client.end();
        }, this.options.connectionTimeoutMillis);
      }
      this.log("connecting new client");
      client.connect((err) => {
        if (tid) {
          clearTimeout(tid);
        }
        client.on("error", idleListener);
        if (err) {
          this.log("client failed to connect", err);
          this._clients = this._clients.filter((c) => c !== client);
          if (timeoutHit) {
            err.message = "Connection terminated due to connection timeout";
          }
          this._pulseQueue();
          if (!pendingItem.timedOut) {
            pendingItem.callback(err, undefined, NOOP);
          }
        } else {
          this.log("new client connected");
          if (this.options.maxLifetimeSeconds !== 0) {
            const maxLifetimeTimeout = setTimeout(() => {
              this.log("ending client due to expired lifetime");
              this._expired.add(client);
              const idleIndex = this._idle.findIndex((idleItem) => idleItem.client === client);
              if (idleIndex !== -1) {
                this._acquireClient(client, new PendingItem((err2, client2, clientRelease) => clientRelease()), idleListener, false);
              }
            }, this.options.maxLifetimeSeconds * 1000);
            maxLifetimeTimeout.unref();
            client.once("end", () => clearTimeout(maxLifetimeTimeout));
          }
          return this._acquireClient(client, pendingItem, idleListener, true);
        }
      });
    }
    _acquireClient(client, pendingItem, idleListener, isNew) {
      if (isNew) {
        this.emit("connect", client);
      }
      this.emit("acquire", client);
      client.release = this._releaseOnce(client, idleListener);
      client.removeListener("error", idleListener);
      if (!pendingItem.timedOut) {
        if (isNew && this.options.verify) {
          this.options.verify(client, (err) => {
            if (err) {
              client.release(err);
              return pendingItem.callback(err, undefined, NOOP);
            }
            pendingItem.callback(undefined, client, client.release);
          });
        } else {
          pendingItem.callback(undefined, client, client.release);
        }
      } else {
        if (isNew && this.options.verify) {
          this.options.verify(client, client.release);
        } else {
          client.release();
        }
      }
    }
    _releaseOnce(client, idleListener) {
      let released = false;
      return (err) => {
        if (released) {
          throwOnDoubleRelease();
        }
        released = true;
        this._release(client, idleListener, err);
      };
    }
    _release(client, idleListener, err) {
      client.on("error", idleListener);
      client._poolUseCount = (client._poolUseCount || 0) + 1;
      this.emit("release", err, client);
      if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
        if (client._poolUseCount >= this.options.maxUses) {
          this.log("remove expended client");
        }
        this._remove(client);
        this._pulseQueue();
        return;
      }
      const isExpired = this._expired.has(client);
      if (isExpired) {
        this.log("remove expired client");
        this._expired.delete(client);
        this._remove(client);
        this._pulseQueue();
        return;
      }
      let tid;
      if (this.options.idleTimeoutMillis) {
        tid = setTimeout(() => {
          this.log("remove idle client");
          this._remove(client);
        }, this.options.idleTimeoutMillis);
        if (this.options.allowExitOnIdle) {
          tid.unref();
        }
      }
      if (this.options.allowExitOnIdle) {
        client.unref();
      }
      this._idle.push(new IdleItem(client, idleListener, tid));
      this._pulseQueue();
    }
    query(text, values, cb) {
      if (typeof text === "function") {
        const response2 = promisify(this.Promise, text);
        setImmediate(function() {
          return response2.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
        });
        return response2.result;
      }
      if (typeof values === "function") {
        cb = values;
        values = undefined;
      }
      const response = promisify(this.Promise, cb);
      cb = response.callback;
      this.connect((err, client) => {
        if (err) {
          return cb(err);
        }
        let clientReleased = false;
        const onError = (err2) => {
          if (clientReleased) {
            return;
          }
          clientReleased = true;
          client.release(err2);
          cb(err2);
        };
        client.once("error", onError);
        this.log("dispatching query");
        try {
          client.query(text, values, (err2, res) => {
            this.log("query dispatched");
            client.removeListener("error", onError);
            if (clientReleased) {
              return;
            }
            clientReleased = true;
            client.release(err2);
            if (err2) {
              return cb(err2);
            }
            return cb(undefined, res);
          });
        } catch (err2) {
          client.release(err2);
          return cb(err2);
        }
      });
      return response.result;
    }
    end(cb) {
      this.log("ending");
      if (this.ending) {
        const err = new Error("Called end on pool more than once");
        return cb ? cb(err) : this.Promise.reject(err);
      }
      this.ending = true;
      const promised = promisify(this.Promise, cb);
      this._endCallback = promised.callback;
      this._pulseQueue();
      return promised.result;
    }
    get waitingCount() {
      return this._pendingQueue.length;
    }
    get idleCount() {
      return this._idle.length;
    }
    get expiredCount() {
      return this._clients.reduce((acc, client) => acc + (this._expired.has(client) ? 1 : 0), 0);
    }
    get totalCount() {
      return this._clients.length;
    }
  }
  module.exports = Pool;
});

// node_modules/pg/lib/native/query.js
var require_query2 = __commonJS((exports, module) => {
  var EventEmitter = import.meta.require("events").EventEmitter;
  var util = import.meta.require("util");
  var utils = require_utils();
  var NativeQuery = module.exports = function(config, values, callback) {
    EventEmitter.call(this);
    config = utils.normalizeQueryConfig(config, values, callback);
    this.text = config.text;
    this.values = config.values;
    this.name = config.name;
    this.callback = config.callback;
    this.state = "new";
    this._arrayMode = config.rowMode === "array";
    this._emitRowEvents = false;
    this.on("newListener", function(event) {
      if (event === "row")
        this._emitRowEvents = true;
    }.bind(this));
  };
  util.inherits(NativeQuery, EventEmitter);
  var errorFieldMap = {
    sqlState: "code",
    statementPosition: "position",
    messagePrimary: "message",
    context: "where",
    schemaName: "schema",
    tableName: "table",
    columnName: "column",
    dataTypeName: "dataType",
    constraintName: "constraint",
    sourceFile: "file",
    sourceLine: "line",
    sourceFunction: "routine"
  };
  NativeQuery.prototype.handleError = function(err) {
    var fields = this.native.pq.resultErrorFields();
    if (fields) {
      for (var key in fields) {
        var normalizedFieldName = errorFieldMap[key] || key;
        err[normalizedFieldName] = fields[key];
      }
    }
    if (this.callback) {
      this.callback(err);
    } else {
      this.emit("error", err);
    }
    this.state = "error";
  };
  NativeQuery.prototype.then = function(onSuccess, onFailure) {
    return this._getPromise().then(onSuccess, onFailure);
  };
  NativeQuery.prototype.catch = function(callback) {
    return this._getPromise().catch(callback);
  };
  NativeQuery.prototype._getPromise = function() {
    if (this._promise)
      return this._promise;
    this._promise = new Promise(function(resolve, reject) {
      this._once("end", resolve);
      this._once("error", reject);
    }.bind(this));
    return this._promise;
  };
  NativeQuery.prototype.submit = function(client) {
    this.state = "running";
    var self = this;
    this.native = client.native;
    client.native.arrayMode = this._arrayMode;
    var after = function(err, rows, results) {
      client.native.arrayMode = false;
      setImmediate(function() {
        self.emit("_done");
      });
      if (err) {
        return self.handleError(err);
      }
      if (self._emitRowEvents) {
        if (results.length > 1) {
          rows.forEach((rowOfRows, i) => {
            rowOfRows.forEach((row) => {
              self.emit("row", row, results[i]);
            });
          });
        } else {
          rows.forEach(function(row) {
            self.emit("row", row, results);
          });
        }
      }
      self.state = "end";
      self.emit("end", results);
      if (self.callback) {
        self.callback(null, results);
      }
    };
    if (process.domain) {
      after = process.domain.bind(after);
    }
    if (this.name) {
      if (this.name.length > 63) {
        console.error("Warning! Postgres only supports 63 characters for query names.");
        console.error("You supplied %s (%s)", this.name, this.name.length);
        console.error("This can cause conflicts and silent errors executing queries");
      }
      var values = (this.values || []).map(utils.prepareValue);
      if (client.namedQueries[this.name]) {
        if (this.text && client.namedQueries[this.name] !== this.text) {
          const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
          return after(err);
        }
        return client.native.execute(this.name, values, after);
      }
      return client.native.prepare(this.name, this.text, values.length, function(err) {
        if (err)
          return after(err);
        client.namedQueries[self.name] = self.text;
        return self.native.execute(self.name, values, after);
      });
    } else if (this.values) {
      if (!Array.isArray(this.values)) {
        const err = new Error("Query values must be an array");
        return after(err);
      }
      var vals = this.values.map(utils.prepareValue);
      client.native.query(this.text, vals, after);
    } else {
      client.native.query(this.text, after);
    }
  };
});

// node_modules/pg/lib/native/client.js
var require_client2 = __commonJS((exports, module) => {
  var Native;
  try {
    Native = (()=>{ throw new Error(`Cannot require module "pg-native"`);})();
  } catch (e) {
    throw e;
  }
  var TypeOverrides = require_type_overrides();
  var EventEmitter = import.meta.require("events").EventEmitter;
  var util = import.meta.require("util");
  var ConnectionParameters = require_connection_parameters();
  var NativeQuery = require_query2();
  var Client = module.exports = function(config) {
    EventEmitter.call(this);
    config = config || {};
    this._Promise = config.Promise || global.Promise;
    this._types = new TypeOverrides(config.types);
    this.native = new Native({
      types: this._types
    });
    this._queryQueue = [];
    this._ending = false;
    this._connecting = false;
    this._connected = false;
    this._queryable = true;
    var cp = this.connectionParameters = new ConnectionParameters(config);
    if (config.nativeConnectionString)
      cp.nativeConnectionString = config.nativeConnectionString;
    this.user = cp.user;
    Object.defineProperty(this, "password", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: cp.password
    });
    this.database = cp.database;
    this.host = cp.host;
    this.port = cp.port;
    this.namedQueries = {};
  };
  Client.Query = NativeQuery;
  util.inherits(Client, EventEmitter);
  Client.prototype._errorAllQueries = function(err) {
    const enqueueError = (query) => {
      process.nextTick(() => {
        query.native = this.native;
        query.handleError(err);
      });
    };
    if (this._hasActiveQuery()) {
      enqueueError(this._activeQuery);
      this._activeQuery = null;
    }
    this._queryQueue.forEach(enqueueError);
    this._queryQueue.length = 0;
  };
  Client.prototype._connect = function(cb) {
    var self = this;
    if (this._connecting) {
      process.nextTick(() => cb(new Error("Client has already been connected. You cannot reuse a client.")));
      return;
    }
    this._connecting = true;
    this.connectionParameters.getLibpqConnectionString(function(err, conString) {
      if (self.connectionParameters.nativeConnectionString)
        conString = self.connectionParameters.nativeConnectionString;
      if (err)
        return cb(err);
      self.native.connect(conString, function(err2) {
        if (err2) {
          self.native.end();
          return cb(err2);
        }
        self._connected = true;
        self.native.on("error", function(err3) {
          self._queryable = false;
          self._errorAllQueries(err3);
          self.emit("error", err3);
        });
        self.native.on("notification", function(msg) {
          self.emit("notification", {
            channel: msg.relname,
            payload: msg.extra
          });
        });
        self.emit("connect");
        self._pulseQueryQueue(true);
        cb();
      });
    });
  };
  Client.prototype.connect = function(callback) {
    if (callback) {
      this._connect(callback);
      return;
    }
    return new this._Promise((resolve, reject) => {
      this._connect((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };
  Client.prototype.query = function(config, values, callback) {
    var query;
    var result;
    var readTimeout;
    var readTimeoutTimer;
    var queryCallback;
    if (config === null || config === undefined) {
      throw new TypeError("Client was passed a null or undefined query");
    } else if (typeof config.submit === "function") {
      readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
      result = query = config;
      if (typeof values === "function") {
        config.callback = values;
      }
    } else {
      readTimeout = this.connectionParameters.query_timeout;
      query = new NativeQuery(config, values, callback);
      if (!query.callback) {
        let resolveOut, rejectOut;
        result = new this._Promise((resolve, reject) => {
          resolveOut = resolve;
          rejectOut = reject;
        }).catch((err) => {
          Error.captureStackTrace(err);
          throw err;
        });
        query.callback = (err, res) => err ? rejectOut(err) : resolveOut(res);
      }
    }
    if (readTimeout) {
      queryCallback = query.callback;
      readTimeoutTimer = setTimeout(() => {
        var error = new Error("Query read timeout");
        process.nextTick(() => {
          query.handleError(error, this.connection);
        });
        queryCallback(error);
        query.callback = () => {
        };
        var index = this._queryQueue.indexOf(query);
        if (index > -1) {
          this._queryQueue.splice(index, 1);
        }
        this._pulseQueryQueue();
      }, readTimeout);
      query.callback = (err, res) => {
        clearTimeout(readTimeoutTimer);
        queryCallback(err, res);
      };
    }
    if (!this._queryable) {
      query.native = this.native;
      process.nextTick(() => {
        query.handleError(new Error("Client has encountered a connection error and is not queryable"));
      });
      return result;
    }
    if (this._ending) {
      query.native = this.native;
      process.nextTick(() => {
        query.handleError(new Error("Client was closed and is not queryable"));
      });
      return result;
    }
    this._queryQueue.push(query);
    this._pulseQueryQueue();
    return result;
  };
  Client.prototype.end = function(cb) {
    var self = this;
    this._ending = true;
    if (!this._connected) {
      this.once("connect", this.end.bind(this, cb));
    }
    var result;
    if (!cb) {
      result = new this._Promise(function(resolve, reject) {
        cb = (err) => err ? reject(err) : resolve();
      });
    }
    this.native.end(function() {
      self._errorAllQueries(new Error("Connection terminated"));
      process.nextTick(() => {
        self.emit("end");
        if (cb)
          cb();
      });
    });
    return result;
  };
  Client.prototype._hasActiveQuery = function() {
    return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
  };
  Client.prototype._pulseQueryQueue = function(initialConnection) {
    if (!this._connected) {
      return;
    }
    if (this._hasActiveQuery()) {
      return;
    }
    var query = this._queryQueue.shift();
    if (!query) {
      if (!initialConnection) {
        this.emit("drain");
      }
      return;
    }
    this._activeQuery = query;
    query.submit(this);
    var self = this;
    query.once("_done", function() {
      self._pulseQueryQueue();
    });
  };
  Client.prototype.cancel = function(query) {
    if (this._activeQuery === query) {
      this.native.cancel(function() {
      });
    } else if (this._queryQueue.indexOf(query) !== -1) {
      this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
    }
  };
  Client.prototype.ref = function() {
  };
  Client.prototype.unref = function() {
  };
  Client.prototype.setTypeParser = function(oid, format, parseFn) {
    return this._types.setTypeParser(oid, format, parseFn);
  };
  Client.prototype.getTypeParser = function(oid, format) {
    return this._types.getTypeParser(oid, format);
  };
});

// node_modules/pg/lib/index.js
var require_lib2 = __commonJS((exports, module) => {
  var Client = require_client();
  var defaults = require_defaults();
  var Connection = require_connection();
  var Pool = require_pg_pool();
  var { DatabaseError } = require_dist();
  var { escapeIdentifier, escapeLiteral } = require_utils();
  var poolFactory = (Client2) => {
    return class BoundPool extends Pool {
      constructor(options) {
        super(options, Client2);
      }
    };
  };
  var PG = function(clientConstructor) {
    this.defaults = defaults;
    this.Client = clientConstructor;
    this.Query = this.Client.Query;
    this.Pool = poolFactory(this.Client);
    this._pools = [];
    this.Connection = Connection;
    this.types = require_pg_types();
    this.DatabaseError = DatabaseError;
    this.escapeIdentifier = escapeIdentifier;
    this.escapeLiteral = escapeLiteral;
  };
  if (typeof process.env.NODE_PG_FORCE_NATIVE !== "undefined") {
    module.exports = new PG(require_client2());
  } else {
    module.exports = new PG(Client);
    Object.defineProperty(module.exports, "native", {
      configurable: true,
      enumerable: false,
      get() {
        var native = null;
        try {
          native = new PG(require_client2());
        } catch (err) {
          if (err.code !== "MODULE_NOT_FOUND") {
            throw err;
          }
        }
        Object.defineProperty(module.exports, "native", {
          value: native
        });
        return native;
      }
    });
  }
});

// node_modules/obuf/index.js
var require_obuf = __commonJS((exports, module) => {
  var OffsetBuffer = function() {
    this.offset = 0;
    this.size = 0;
    this.buffers = [];
  };
  var signedInt8 = function(num) {
    if (num >= 128)
      return -(255 ^ num) - 1;
    else
      return num;
  };
  var signedInt16 = function(num) {
    if (num >= 32768)
      return -(65535 ^ num) - 1;
    else
      return num;
  };
  var signedInt24 = function(num) {
    if (num >= 8388608)
      return -(16777215 ^ num) - 1;
    else
      return num;
  };
  var signedInt32 = function(num) {
    if (num >= 2147483648)
      return -(4294967295 ^ num) - 1;
    else
      return num;
  };
  var Buffer2 = import.meta.require("buffer").Buffer;
  module.exports = OffsetBuffer;
  OffsetBuffer.prototype.isEmpty = function isEmpty() {
    return this.size === 0;
  };
  OffsetBuffer.prototype.clone = function clone(size) {
    var r = new OffsetBuffer;
    r.offset = this.offset;
    r.size = size;
    r.buffers = this.buffers.slice();
    return r;
  };
  OffsetBuffer.prototype.toChunks = function toChunks() {
    if (this.size === 0)
      return [];
    if (this.offset !== 0) {
      this.buffers[0] = this.buffers[0].slice(this.offset);
      this.offset = 0;
    }
    var chunks = [];
    var off = 0;
    for (var i = 0;off <= this.size && i < this.buffers.length; i++) {
      var buf = this.buffers[i];
      off += buf.length;
      if (off > this.size) {
        buf = buf.slice(0, buf.length - (off - this.size));
        this.buffers[i] = buf;
      }
      chunks.push(buf);
    }
    if (i < this.buffers.length)
      this.buffers.length = i;
    return chunks;
  };
  OffsetBuffer.prototype.toString = function toString(enc) {
    return this.toChunks().map(function(c) {
      return c.toString(enc);
    }).join("");
  };
  OffsetBuffer.prototype.use = function use(buf, off, n) {
    this.buffers = [buf];
    this.offset = off;
    this.size = n;
  };
  OffsetBuffer.prototype.push = function push(data) {
    if (data.length === 0)
      return;
    this.size += data.length;
    this.buffers.push(data);
  };
  OffsetBuffer.prototype.has = function has(n) {
    return this.size >= n;
  };
  OffsetBuffer.prototype.skip = function skip(n) {
    if (this.size === 0)
      return;
    this.size -= n;
    if (this.offset + n < this.buffers[0].length) {
      this.offset += n;
      return;
    }
    var left = n - (this.buffers[0].length - this.offset);
    this.offset = 0;
    for (var shift = 1;left > 0 && shift < this.buffers.length; shift++) {
      var buf = this.buffers[shift];
      if (buf.length > left) {
        this.offset = left;
        break;
      }
      left -= buf.length;
    }
    this.buffers = this.buffers.slice(shift);
  };
  OffsetBuffer.prototype.copy = function copy(target, targetOff, off, n) {
    if (this.size === 0)
      return;
    if (off !== 0)
      throw new Error("Unsupported offset in .copy()");
    var toff = targetOff;
    var first = this.buffers[0];
    var toCopy = Math.min(n, first.length - this.offset);
    first.copy(target, toff, this.offset, this.offset + toCopy);
    toff += toCopy;
    var left = n - toCopy;
    for (var i = 1;left > 0 && i < this.buffers.length; i++) {
      var buf = this.buffers[i];
      var toCopy = Math.min(left, buf.length);
      buf.copy(target, toff, 0, toCopy);
      toff += toCopy;
      left -= toCopy;
    }
  };
  OffsetBuffer.prototype.take = function take(n) {
    if (n === 0)
      return new Buffer2(0);
    this.size -= n;
    var first = this.buffers[0].length - this.offset;
    if (first === n) {
      var r = this.buffers.shift();
      if (this.offset !== 0) {
        r = r.slice(this.offset);
        this.offset = 0;
      }
      return r;
    } else if (first > n) {
      var r = this.buffers[0].slice(this.offset, this.offset + n);
      this.offset += n;
      return r;
    }
    var out = new Buffer2(n);
    var toOff = 0;
    var startOff = this.offset;
    for (var i = 0;toOff !== n && i < this.buffers.length; i++) {
      var buf = this.buffers[i];
      var toCopy = Math.min(buf.length - startOff, n - toOff);
      buf.copy(out, toOff, startOff, startOff + toCopy);
      if (startOff + toCopy < buf.length) {
        this.offset = startOff + toCopy;
        break;
      } else {
        toOff += toCopy;
        startOff = 0;
      }
    }
    this.buffers = this.buffers.slice(i);
    if (this.buffers.length === 0)
      this.offset = 0;
    return out;
  };
  OffsetBuffer.prototype.peekUInt8 = function peekUInt8() {
    return this.buffers[0][this.offset];
  };
  OffsetBuffer.prototype.readUInt8 = function readUInt8() {
    this.size -= 1;
    var first = this.buffers[0];
    var r = first[this.offset];
    if (++this.offset === first.length) {
      this.offset = 0;
      this.buffers.shift();
    }
    return r;
  };
  OffsetBuffer.prototype.readUInt16LE = function readUInt16LE() {
    var first = this.buffers[0];
    this.size -= 2;
    var r;
    var shift;
    if (first.length - this.offset >= 2) {
      r = first.readUInt16LE(this.offset);
      shift = 0;
      this.offset += 2;
    } else {
      r = first[this.offset] | this.buffers[1][0] << 8;
      shift = 1;
      this.offset = 1;
    }
    if (this.offset === this.buffers[shift].length) {
      this.offset = 0;
      shift++;
    }
    if (shift !== 0)
      this.buffers = this.buffers.slice(shift);
    return r;
  };
  OffsetBuffer.prototype.readUInt24LE = function readUInt24LE() {
    var first = this.buffers[0];
    var r;
    var shift;
    var firstHas = first.length - this.offset;
    if (firstHas >= 3) {
      r = first.readUInt16LE(this.offset) | first[this.offset + 2] << 16;
      shift = 0;
      this.offset += 3;
    } else if (firstHas >= 2) {
      r = first.readUInt16LE(this.offset) | this.buffers[1][0] << 16;
      shift = 1;
      this.offset = 1;
    } else {
      r = first[this.offset];
      this.offset = 0;
      this.buffers.shift();
      this.size -= 1;
      r |= this.readUInt16LE() << 8;
      return r;
    }
    this.size -= 3;
    if (this.offset === this.buffers[shift].length) {
      this.offset = 0;
      shift++;
    }
    if (shift !== 0)
      this.buffers = this.buffers.slice(shift);
    return r;
  };
  OffsetBuffer.prototype.readUInt32LE = function readUInt32LE() {
    var first = this.buffers[0];
    var r;
    var shift;
    var firstHas = first.length - this.offset;
    if (firstHas >= 4) {
      r = first.readUInt32LE(this.offset);
      shift = 0;
      this.offset += 4;
    } else if (firstHas >= 3) {
      r = (first.readUInt16LE(this.offset) | first[this.offset + 2] << 16) + this.buffers[1][0] * 16777216;
      shift = 1;
      this.offset = 1;
    } else if (firstHas >= 2) {
      r = first.readUInt16LE(this.offset);
      this.offset = 0;
      this.buffers.shift();
      this.size -= 2;
      r += this.readUInt16LE() * 65536;
      return r;
    } else {
      r = first[this.offset];
      this.offset = 0;
      this.buffers.shift();
      this.size -= 1;
      r += this.readUInt24LE() * 256;
      return r;
    }
    this.size -= 4;
    if (this.offset === this.buffers[shift].length) {
      this.offset = 0;
      shift++;
    }
    if (shift !== 0)
      this.buffers = this.buffers.slice(shift);
    return r;
  };
  OffsetBuffer.prototype.readUInt16BE = function readUInt16BE() {
    var r = this.readUInt16LE();
    return (r & 255) << 8 | r >> 8;
  };
  OffsetBuffer.prototype.readUInt24BE = function readUInt24BE() {
    var r = this.readUInt24LE();
    return (r & 255) << 16 | (r >> 8 & 255) << 8 | r >> 16;
  };
  OffsetBuffer.prototype.readUInt32BE = function readUInt32BE() {
    var r = this.readUInt32LE();
    return ((r & 255) << 24 | (r >>> 8 & 255) << 16 | (r >>> 16 & 255) << 8 | r >>> 24) >>> 0;
  };
  OffsetBuffer.prototype.peekInt8 = function peekInt8() {
    return signedInt8(this.peekUInt8());
  };
  OffsetBuffer.prototype.readInt8 = function readInt8() {
    return signedInt8(this.readUInt8());
  };
  OffsetBuffer.prototype.readInt16BE = function readInt16BE() {
    return signedInt16(this.readUInt16BE());
  };
  OffsetBuffer.prototype.readInt16LE = function readInt16LE() {
    return signedInt16(this.readUInt16LE());
  };
  OffsetBuffer.prototype.readInt24BE = function readInt24BE() {
    return signedInt24(this.readUInt24BE());
  };
  OffsetBuffer.prototype.readInt24LE = function readInt24LE() {
    return signedInt24(this.readUInt24LE());
  };
  OffsetBuffer.prototype.readInt32BE = function readInt32BE() {
    return signedInt32(this.readUInt32BE());
  };
  OffsetBuffer.prototype.readInt32LE = function readInt32LE() {
    return signedInt32(this.readUInt32LE());
  };
});

// node_modules/pg-copy-streams/message-formats.js
var require_message_formats = __commonJS((exports, module) => {
  module.exports = {
    ErrorResponse: 69,
    CopyInResponse: 71,
    CopyOutResponse: 72,
    CopyBothResponse: 87,
    CopyDone: 99,
    CopyData: 100,
    CopyFail: 102,
    CommandComplete: 67,
    ReadyForQuery: 90,
    NotificationResponse: 65,
    NoticeResponse: 78,
    ParameterStatus: 83
  };
});

// node_modules/pg-copy-streams/copy-to.js
var require_copy_to = __commonJS((exports, module) => {
  module.exports = function(txt, options) {
    return new CopyStreamQuery(txt, options);
  };
  var { Readable } = import.meta.require("stream");
  var assert = import.meta.require("assert");
  var BufferList = require_obuf();
  var code = require_message_formats();
  var PG_CODE = 0;
  var PG_LENGTH = 1;
  var PG_MESSAGE = 2;

  class CopyStreamQuery extends Readable {
    constructor(text, options) {
      super(options);
      this.text = text;
      this.rowCount = 0;
      this._state = PG_CODE;
      this._buffer = new BufferList;
      this._unreadMessageContentLength = 0;
      this._copyDataChunks = new BufferList;
      this._pgDataHandler = null;
      this._drained = false;
      this._forwarding = false;
      this._onReadableEvent = this._onReadable.bind(this);
    }
    submit(connection) {
      this.connection = connection;
      this._attach();
      connection.query(this.text);
    }
    _attach() {
      const connectionStream = this.connection.stream;
      const pgDataListeners = connectionStream.listeners("data");
      assert(pgDataListeners.length == 1);
      this._pgDataHandler = pgDataListeners.pop();
      connectionStream.removeListener("data", this._pgDataHandler);
      connectionStream.pause();
      this._forward();
      connectionStream.on("readable", this._onReadableEvent);
    }
    _detach() {
      const connectionStream = this.connection.stream;
      const unreadBuffer = this._buffer.take(this._buffer.size);
      connectionStream.removeListener("readable", this._onReadableEvent);
      connectionStream.addListener("data", this._pgDataHandler);
      this._pgDataHandler(unreadBuffer);
      process.nextTick(function() {
        connectionStream.resume();
      });
    }
    _cleanup() {
      this._buffer = null;
      this._copyDataChunks = null;
      this._pgDataHandler = null;
      this._onReadableEvent = null;
    }
    _onReadable() {
      this._forward();
    }
    _read() {
      this._drained = true;
      this._forward();
    }
    _forward() {
      if (this._forwarding || !this._drained || !this.connection)
        return;
      this._forwarding = true;
      const connectionStream = this.connection.stream;
      let chunk;
      while (this._drained && (chunk = connectionStream.read()) !== null) {
        this._drained = this._parse(chunk);
      }
      this._forwarding = false;
    }
    _parse(chunk) {
      let done = false;
      let drained = true;
      this._buffer.push(chunk);
      while (!done && this._buffer.size > 0) {
        if (PG_CODE === this._state) {
          if (!this._buffer.has(1))
            break;
          this._code = this._buffer.peekUInt8();
          if (this._code === code.ErrorResponse) {
            this._detach();
            return;
          }
          this._buffer.readUInt8();
          this._state = PG_LENGTH;
        }
        if (PG_LENGTH === this._state) {
          if (!this._buffer.has(4))
            break;
          this._unreadMessageContentLength = this._buffer.readUInt32BE() - 4;
          this._state = PG_MESSAGE;
        }
        if (PG_MESSAGE === this._state) {
          if (this._unreadMessageContentLength > 0 && this._buffer.size > 0) {
            const n = Math.min(this._buffer.size, this._unreadMessageContentLength);
            const messageContentChunk = this._buffer.take(n);
            this._unreadMessageContentLength -= n;
            if (this._code === code.CopyData) {
              this._copyDataChunks.push(messageContentChunk);
            }
          }
          if (this._unreadMessageContentLength === 0) {
            switch (this._code) {
              case code.CopyOutResponse:
              case code.CopyData:
              case code.ParameterStatus:
              case code.NoticeResponse:
              case code.NotificationResponse:
                break;
              case code.CopyDone:
              default:
                done = true;
                break;
            }
            this._state = PG_CODE;
          }
        }
      }
      const len = this._copyDataChunks.size;
      if (len > 0) {
        drained = this.push(this._copyDataChunks.take(len));
      }
      if (done) {
        this._detach();
        this.push(null);
        this._cleanup();
      }
      return drained;
    }
    handleError(err) {
      this.emit("error", err);
      this._cleanup();
    }
    handleCommandComplete(msg) {
      const match = /COPY (\d+)/.exec((msg || {}).text);
      if (match) {
        this.rowCount = parseInt(match[1], 10);
      }
    }
    handleReadyForQuery() {
    }
  }
});

// node_modules/pg-copy-streams/copy-from.js
var require_copy_from = __commonJS((exports, module) => {
  module.exports = function(txt, options) {
    return new CopyStreamQuery(txt, options);
  };
  var { Writable } = import.meta.require("stream");
  var code = require_message_formats();

  class CopyStreamQuery extends Writable {
    constructor(text, options) {
      super(options);
      this.text = text;
      this.rowCount = 0;
      this._gotCopyInResponse = false;
      this.chunks = [];
      this.cb_CopyInResponse = null;
      this.cb_ReadyForQuery = null;
      this.cb_destroy = null;
      this.cork();
    }
    submit(connection) {
      this.connection = connection;
      connection.query(this.text);
    }
    callback() {
    }
    _write(chunk, enc, cb) {
      this.chunks.push({ chunk, encoding: enc });
      if (this._gotCopyInResponse) {
        return this.flush(cb);
      }
      this.cb_CopyInResponse = cb;
    }
    _writev(chunks, cb) {
      if (this.chunks.length == 0) {
        this.chunks = chunks;
      } else {
        const QUANTUM = 125000;
        for (let i = 0;i < chunks.length; i += QUANTUM) {
          this.chunks.push(...chunks.slice(i, Math.min(i + QUANTUM, chunks.length)));
        }
      }
      if (this._gotCopyInResponse) {
        return this.flush(cb);
      }
      this.cb_CopyInResponse = cb;
    }
    _destroy(err, cb) {
      if (this.cb_ReadyForQuery)
        return cb(err);
      this.cb_destroy = cb;
      const msg = err ? err.message : "NODE-PG-COPY-STREAMS destroy() was called";
      const self = this;
      const done = function() {
        self.connection.sendCopyFail(msg);
      };
      this.chunks = [];
      if (this._gotCopyInResponse) {
        return this.flush(done);
      }
      this.cb_CopyInResponse = done;
    }
    _final(cb) {
      this.cb_ReadyForQuery = cb;
      const self = this;
      const done = function() {
        const Int32Len = 4;
        const finBuffer = Buffer.from([code.CopyDone, 0, 0, 0, Int32Len]);
        self.connection.stream.write(finBuffer);
      };
      if (this._gotCopyInResponse) {
        return this.flush(done);
      }
      this.cb_CopyInResponse = done;
    }
    flush(callback) {
      let chunk;
      let ok = true;
      while (ok && (chunk = this.chunks.shift())) {
        ok = this.flushChunk(chunk.chunk);
      }
      if (callback) {
        if (ok) {
          callback();
        } else {
          if (this.chunks.length) {
            this.connection.stream.once("drain", this.flush.bind(this, callback));
          } else {
            this.connection.stream.once("drain", callback);
          }
        }
      }
    }
    flushChunk(chunk) {
      const Int32Len = 4;
      const lenBuffer = Buffer.from([code.CopyData, 0, 0, 0, 0]);
      lenBuffer.writeUInt32BE(chunk.length + Int32Len, 1);
      this.connection.stream.write(lenBuffer);
      return this.connection.stream.write(chunk);
    }
    handleError(e) {
      this.callback();
      if (this.cb_destroy) {
        const cb = this.cb_destroy;
        this.cb_destroy = null;
        cb(e);
      } else {
        this.emit("error", e);
      }
      this.connection = null;
    }
    handleCopyInResponse(connection) {
      this._gotCopyInResponse = true;
      if (!this.destroyed) {
        this.uncork();
      }
      const cb = this.cb_CopyInResponse || function() {
      };
      this.cb_CopyInResponse = null;
      this.flush(cb);
    }
    handleCommandComplete(msg) {
      const match = /COPY (\d+)/.exec((msg || {}).text);
      if (match) {
        this.rowCount = parseInt(match[1], 10);
      }
    }
    handleReadyForQuery() {
      this.callback();
      this.cb_ReadyForQuery();
      this.connection = null;
    }
  }
});

// node_modules/pg-copy-streams/copy-both.js
var require_copy_both = __commonJS((exports, module) => {
  module.exports = function(txt, options) {
    return new CopyStreamQuery(txt, options);
  };
  var { Duplex } = import.meta.require("stream");
  var assert = import.meta.require("assert");
  var BufferList = require_obuf();
  var code = require_message_formats();
  var PG_CODE = 0;
  var PG_LENGTH = 1;
  var PG_MESSAGE = 2;

  class CopyStreamQuery extends Duplex {
    constructor(text, options) {
      super(options);
      this.text = text;
      this._state = PG_CODE;
      this._buffer = new BufferList;
      this._unreadMessageContentLength = 0;
      this._copyDataChunks = new BufferList;
      this._pgDataHandler = null;
      this._drained = false;
      this._forwarding = false;
      this._onReadableEvent = this._onReadable.bind(this);
      this.alignOnCopyDataFrame = options ? options.alignOnCopyDataFrame === true : false;
      this._gotCopyInResponse = false;
      this.chunks = [];
      this.cb = null;
      this.cork();
    }
    submit(connection) {
      this.connection = connection;
      this._attach();
      connection.query(this.text);
    }
    _attach() {
      const connectionStream = this.connection.stream;
      const pgDataListeners = connectionStream.listeners("data");
      assert(pgDataListeners.length == 1);
      this._pgDataHandler = pgDataListeners.pop();
      connectionStream.removeListener("data", this._pgDataHandler);
      connectionStream.pause();
      this._forward();
      connectionStream.on("readable", this._onReadableEvent);
    }
    _detach() {
      const connectionStream = this.connection.stream;
      const unreadBuffer = this._buffer.take(this._buffer.size);
      connectionStream.removeListener("readable", this._onReadableEvent);
      connectionStream.addListener("data", this._pgDataHandler);
      this._pgDataHandler(unreadBuffer);
      process.nextTick(function() {
        connectionStream.resume();
      });
    }
    _cleanup() {
      this._buffer = null;
      this._copyDataChunks = null;
      this._pgDataHandler = null;
      this._onReadableEvent = null;
    }
    _onReadable() {
      this._forward();
    }
    _read() {
      this._drained = true;
      this._forward();
    }
    _forward() {
      if (this._forwarding || !this._drained || !this.connection)
        return;
      this._forwarding = true;
      const connectionStream = this.connection.stream;
      let chunk;
      while (this._drained && (chunk = connectionStream.read()) !== null) {
        this._drained = this._parse(chunk);
      }
      this._forwarding = false;
    }
    _parse(chunk) {
      let done = false;
      let drained = true;
      this._buffer.push(chunk);
      while (!done && this._buffer.size > 0) {
        if (PG_CODE === this._state) {
          if (!this._buffer.has(1))
            break;
          this._code = this._buffer.peekUInt8();
          if (this._code === code.ErrorResponse) {
            this._detach();
            return;
          }
          this._buffer.readUInt8();
          this._state = PG_LENGTH;
        }
        if (PG_LENGTH === this._state) {
          if (!this._buffer.has(4))
            break;
          this._unreadMessageContentLength = this._buffer.readUInt32BE() - 4;
          this._state = PG_MESSAGE;
        }
        if (PG_MESSAGE === this._state) {
          if (this._unreadMessageContentLength > 0 && this._buffer.size > 0) {
            const n = Math.min(this._buffer.size, this._unreadMessageContentLength);
            const messageContentChunk = this._buffer.take(n);
            this._unreadMessageContentLength -= n;
            if (this._code === code.CopyData) {
              this._copyDataChunks.push(messageContentChunk);
            }
          }
          if (this._unreadMessageContentLength === 0) {
            switch (this._code) {
              case code.CopyBothResponse:
                this._startCopyIn();
                break;
              case code.CopyData:
                if (this.alignOnCopyDataFrame) {
                  drained = this._flushCopyData();
                }
                break;
              case code.ParameterStatus:
              case code.NoticeResponse:
              case code.NotificationResponse:
                break;
              case code.CopyDone:
              default:
                done = true;
                break;
            }
            this._state = PG_CODE;
          }
        }
      }
      if (!this.alignOnCopyDataFrame) {
        drained = this._flushCopyData();
      }
      if (done) {
        this._detach();
        this.push(null);
        this._cleanup();
      }
      return drained;
    }
    _flushCopyData() {
      let drained = true;
      const len = this._copyDataChunks.size;
      if (len > 0) {
        drained = this.push(this._copyDataChunks.take(len));
      }
      return drained;
    }
    _write(chunk, enc, cb) {
      this.chunks.push({ chunk, encoding: enc });
      if (this._gotCopyInResponse) {
        return this.flush(cb);
      }
      this.cb = cb;
    }
    _writev(chunks, cb) {
      this.chunks.push(...chunks);
      if (this._gotCopyInResponse) {
        return this.flush(cb);
      }
      this.cb = cb;
    }
    _final(cb) {
      this.flush();
      const Int32Len = 4;
      const finBuffer = Buffer.from([code.CopyDone, 0, 0, 0, Int32Len]);
      this.connection.stream.write(finBuffer);
      this.cb_flush = cb;
    }
    flush(callback) {
      let chunk;
      let ok = true;
      while (ok && (chunk = this.chunks.shift())) {
        ok = this.flushChunk(chunk.chunk);
      }
      if (callback) {
        if (ok) {
          callback();
        } else {
          if (this.chunks.length) {
            this.connection.stream.once("drain", this.flush.bind(this, callback));
          } else {
            this.connection.stream.once("drain", callback);
          }
        }
      }
    }
    flushChunk(chunk) {
      const Int32Len = 4;
      const lenBuffer = Buffer.from([code.CopyData, 0, 0, 0, 0]);
      lenBuffer.writeUInt32BE(chunk.length + Int32Len, 1);
      this.connection.stream.write(lenBuffer);
      return this.connection.stream.write(chunk);
    }
    _startCopyIn() {
      this._gotCopyInResponse = true;
      this.uncork();
      this.flush();
      if (this.cb) {
        const { cb } = this;
        this.cb = null;
        cb();
      }
    }
    handleError(err) {
      this.emit("error", err);
      this._cleanup();
    }
    handleCopyData(chunk) {
    }
    handleCommandComplete() {
    }
    handleReadyForQuery() {
      this.connection = null;
      this.cb_flush();
    }
  }
});

// main.ts
var import_pg = __toESM(require_lib2(), 1);
import fs from "fs";

// node_modules/pg-copy-streams/index.js
var CopyToQueryStream = require_copy_to();
var CopyFromQueryStream = require_copy_from();
var CopyBothQueryStream = require_copy_both();
var $from = function copyFrom(txt, options) {
  return new CopyFromQueryStream(txt, options);
};

// main.ts
import {pipeline} from "stream/promises";
async function measureInsert() {
  const chunkSize = 1000;
  const startTime = Date.now();
  for (let i = 0;i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const placeholders = chunk.map((_, index) => `(\$${index * 2 + 1}, \$${index * 2 + 2})`).join(",");
    const values = chunk.flat();
    const insertQuery = `
            INSERT INTO test_table (data, time_added) VALUES ${placeholders}
        `;
    await client.query(insertQuery, values);
  }
  const duration = (Date.now() - startTime) / 1000;
  console.log(`Multi-line INSERT took: ${duration} seconds`);
}
async function measureCopy() {
  return new Promise((resolve, reject) => {
    const writableStream = fs.createWriteStream("data.csv");
    writableStream.on("finish", async () => {
      try {
        const startTime = Date.now();
        const stream = fs.createReadStream("data.csv");
        const copyPsqlStream = client.query($from("COPY test_table (data, time_added) FROM STDIN WITH (FORMAT CSV)"));
        await pipeline(stream, copyPsqlStream);
        const duration = (Date.now() - startTime) / 1000;
        console.log(`COPY took: ${duration} seconds`);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    data.forEach((d) => writableStream.write(d.join(",") + "\n"));
    writableStream.end();
  });
}
async function main() {
  await client.connect();
  await measureInsert();
  await measureCopy();
  await client.end();
}
var client = new import_pg.Client({
  host: "localhost",
  port: 6472,
  user: "copy-insert-db",
  password: "copy-insert-db",
  database: "copy-insert-db"
});
var numRecords = 1e5;
var data = Array.from({ length: numRecords }, (_, i) => [`data_${i}`, new Date().toISOString()]);
main();
