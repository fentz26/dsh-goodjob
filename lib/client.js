window.__ModuleLoader__.load({ id: "dsh-goodjob", factory: (require) => {
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);
//#endregion
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");
//#region ../../../../Users/ducnguyen/deepseek-harness/vendor/cosmokit/lib/index.js
var lib_exports = /* @__PURE__ */ __exportAll({
	Binary: () => Binary,
	Time: () => Time,
	arrayBufferToBase64: () => arrayBufferToBase64,
	arrayBufferToHex: () => arrayBufferToHex,
	base64ToArrayBuffer: () => base64ToArrayBuffer,
	camelCase: () => camelCase,
	camelize: () => camelize,
	capitalize: () => capitalize,
	clone: () => clone,
	contain: () => contain,
	deduplicate: () => deduplicate,
	deepEqual: () => deepEqual,
	defineProperty: () => defineProperty,
	difference: () => difference,
	filterKeys: () => filterKeys,
	formatProperty: () => formatProperty,
	hexToArrayBuffer: () => hexToArrayBuffer,
	hyphenate: () => hyphenate,
	intersection: () => intersection,
	is: () => is,
	isNonNullable: () => isNonNullable,
	isNullable: () => isNullable,
	isPlainObject: () => isPlainObject,
	makeArray: () => makeArray,
	mapValues: () => mapValues,
	noop: () => noop,
	omit: () => omit,
	paramCase: () => paramCase,
	pick: () => pick,
	remove: () => remove,
	sanitize: () => sanitize,
	snakeCase: () => snakeCase,
	trimSlash: () => trimSlash,
	uncapitalize: () => uncapitalize,
	union: () => union,
	valueMap: () => mapValues
});
/** No-op callback returning `undefined` at runtime and `any` at type level. */
function noop() {}
/** Return true when a value is `null` or `undefined`. */
function isNullable(value) {
	return value === null || value === void 0;
}
/** Return true when a value is neither `null` nor `undefined`. */
function isNonNullable(value) {
	return !isNullable(value);
}
/** Return true for non-array object values. */
function isPlainObject(data) {
	return data && typeof data === "object" && !Array.isArray(data);
}
/** Filter object entries and return a new object. */
function filterKeys(object, filter) {
	return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
/** Map object values while preserving the original key set. */
function mapValues(object, transform) {
	return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
/** Pick selected keys from an object, optionally including `undefined` values. */
function pick(source, keys, forced) {
	if (!keys) return { ...source };
	const result = {};
	for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
	return result;
}
/** Omit selected keys from a shallow object copy. */
function omit(source, keys) {
	if (!keys) return { ...source };
	const result = { ...source };
	for (const key of keys) Reflect.deleteProperty(result, key);
	return result;
}
/** Define a non-enumerable writable property and return the object. */
function defineProperty(object, key, value) {
	return Object.defineProperty(object, key, {
		writable: true,
		value,
		enumerable: false
	});
}
/** Return true when every item in `array2` is present in `array1`. */
function contain(array1, array2) {
	return array2.every((item) => array1.includes(item));
}
/** Return items that appear in both arrays. */
function intersection(array1, array2) {
	return array1.filter((item) => array2.includes(item));
}
/** Return items from `array1` that do not appear in `array2`. */
function difference(array1, array2) {
	return array1.filter((item) => !array2.includes(item));
}
/** Return the set-union of two arrays while preserving first occurrence order. */
function union(array1, array2) {
	return Array.from(/* @__PURE__ */ new Set([...array1, ...array2]));
}
/** Remove duplicate values while preserving first occurrence order. */
function deduplicate(array) {
	return [...new Set(array)];
}
/** Remove one item from an array and report whether it was found. */
function remove(list, item) {
	const index = list?.indexOf(item);
	if (index >= 0) {
		list.splice(index, 1);
		return true;
	} else return false;
}
/** Normalize nullish, scalar, or array input to an array. */
function makeArray(source) {
	return Array.isArray(source) ? source : isNullable(source) ? [] : [source];
}
/** Test values using `instanceof` with a `toStringTag` fallback. */
function is(type, value) {
	if (arguments.length === 1) return (value) => is(type, value);
	return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
	return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
	return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
function clone(source, refs = /* @__PURE__ */ new Map()) {
	if (!source || typeof source !== "object") return source;
	if (is("Date", source)) return new Date(source.valueOf());
	if (is("RegExp", source)) return new RegExp(source.source, source.flags);
	if (isArrayBufferLike(source)) return source.slice(0);
	if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
	const cached = refs.get(source);
	if (cached) return cached;
	if (Array.isArray(source)) {
		const result = [];
		refs.set(source, result);
		source.forEach((value, index) => {
			result[index] = Reflect.apply(clone, null, [value, refs]);
		});
		return result;
	}
	const result = Object.create(Object.getPrototypeOf(source));
	refs.set(source, result);
	for (const key of Reflect.ownKeys(source)) {
		const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
		if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
		Reflect.defineProperty(result, key, descriptor);
	}
	return result;
}
/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
function deepEqual(a, b, strict) {
	if (a === b) return true;
	if (!strict && isNullable(a) && isNullable(b)) return true;
	if (typeof a !== typeof b) return false;
	if (typeof a !== "object") return false;
	if (!a || !b) return false;
	function check(test, then) {
		return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
	}
	return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
		if (a.byteLength !== b.byteLength) return false;
		const viewA = new Uint8Array(a);
		const viewB = new Uint8Array(b);
		for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
		return true;
	}) ?? Object.keys({
		...a,
		...b
	}).every((key) => deepEqual(a[key], b[key], strict));
}
/** Uppercase the first character of a string. */
function capitalize(source) {
	return source.charAt(0).toUpperCase() + source.slice(1);
}
/** Lowercase the first character of a string. */
function uncapitalize(source) {
	return source.charAt(0).toLowerCase() + source.slice(1);
}
/** Convert dash or underscore delimited text to camelCase. */
function camelCase(source) {
	return source.replace(/[_-][a-z]/g, (str) => str.slice(1).toUpperCase());
}
function tokenize(source, delimiters, delimiter) {
	const output = [];
	let state = 0;
	for (let i = 0; i < source.length; i++) {
		const code = source.charCodeAt(i);
		if (code >= 65 && code <= 90) {
			if (state === 1) {
				const next = source.charCodeAt(i + 1);
				if (next >= 97 && next <= 122) output.push(delimiter);
				output.push(code + 32);
			} else {
				if (state !== 0) output.push(delimiter);
				output.push(code + 32);
			}
			state = 1;
		} else if (code >= 97 && code <= 122) {
			output.push(code);
			state = 2;
		} else if (delimiters.includes(code)) {
			if (state !== 0) output.push(delimiter);
			state = 0;
		} else output.push(code);
	}
	return String.fromCharCode(...output);
}
/** Convert text to dash-delimited parameter case. */
function paramCase(source) {
	return tokenize(source, [45, 95], 45);
}
/** Convert text to underscore-delimited snake case. */
function snakeCase(source) {
	return tokenize(source, [45, 95], 95);
}
/** Format a property key as a JavaScript member access suffix. */
function formatProperty(key) {
	if (typeof key !== "string") return `[${key.toString()}]`;
	return /^[a-z_$][\w$]*$/i.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
}
/** Remove one trailing slash from a path string. */
function trimSlash(source) {
	return source.replace(/\/$/, "");
}
/** Ensure a path starts with `/` and has no trailing slash. */
function sanitize(source) {
	if (!source.startsWith("/")) source = "/" + source;
	return trimSlash(source);
}
var Binary, base64ToArrayBuffer, arrayBufferToBase64, hexToArrayBuffer, arrayBufferToHex, camelize, hyphenate, Time;
var init_lib = __esmMin((() => {
	(function(Binary) {
		Binary.is = isArrayBufferLike;
		Binary.isSource = isArrayBufferSource;
		function fromSource(source) {
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			else return source;
		}
		Binary.fromSource = fromSource;
		function toBase64(source) {
			source = fromSource(source);
			if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
			let binary = "";
			const bytes = new Uint8Array(source);
			for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
			return btoa(binary);
		}
		Binary.toBase64 = toBase64;
		function fromBase64(source) {
			if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
			return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
		}
		Binary.fromBase64 = fromBase64;
		function toHex(source) {
			source = fromSource(source);
			if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
			return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
		}
		Binary.toHex = toHex;
		function fromHex(source) {
			if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
			const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
			const buffer = [];
			for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
			return Uint8Array.from(buffer).buffer;
		}
		Binary.fromHex = fromHex;
	})(Binary || (Binary = {}));
	base64ToArrayBuffer = Binary.fromBase64;
	arrayBufferToBase64 = Binary.toBase64;
	hexToArrayBuffer = Binary.fromHex;
	arrayBufferToHex = Binary.toHex;
	camelize = camelCase;
	hyphenate = paramCase;
	(function(Time) {
		Time.millisecond = 1;
		Time.second = 1e3;
		Time.minute = Time.second * 60;
		Time.hour = Time.minute * 60;
		Time.day = Time.hour * 24;
		Time.week = Time.day * 7;
		let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
		function setTimezoneOffset(offset) {
			timezoneOffset = offset;
		}
		Time.setTimezoneOffset = setTimezoneOffset;
		function getTimezoneOffset() {
			return timezoneOffset;
		}
		Time.getTimezoneOffset = getTimezoneOffset;
		function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
			if (typeof date === "number") date = new Date(date);
			if (offset === void 0) offset = timezoneOffset;
			return Math.floor((date.valueOf() / Time.minute - offset) / 1440);
		}
		Time.getDateNumber = getDateNumber;
		function fromDateNumber(value, offset) {
			const date = new Date(value * Time.day);
			if (offset === void 0) offset = timezoneOffset;
			return new Date(+date + offset * Time.minute);
		}
		Time.fromDateNumber = fromDateNumber;
		const numeric = /\d+(?:\.\d+)?/.source;
		const timeRegExp = new RegExp(`^${[
			"w(?:eek(?:s)?)?",
			"d(?:ay(?:s)?)?",
			"h(?:our(?:s)?)?",
			"m(?:in(?:ute)?(?:s)?)?",
			"s(?:ec(?:ond)?(?:s)?)?"
		].map((unit) => `(${numeric}${unit})?`).join("")}$`);
		function parseTime(source) {
			const capture = timeRegExp.exec(source);
			if (!capture) return 0;
			return (parseFloat(capture[1]) * Time.week || 0) + (parseFloat(capture[2]) * Time.day || 0) + (parseFloat(capture[3]) * Time.hour || 0) + (parseFloat(capture[4]) * Time.minute || 0) + (parseFloat(capture[5]) * Time.second || 0);
		}
		Time.parseTime = parseTime;
		function parseDate(date) {
			const parsed = parseTime(date);
			if (parsed) date = Date.now() + parsed;
			else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
			else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
			return date ? new Date(date) : /* @__PURE__ */ new Date();
		}
		Time.parseDate = parseDate;
		function format(ms) {
			const abs = Math.abs(ms);
			if (abs >= Time.day - Time.hour / 2) return Math.round(ms / Time.day) + "d";
			else if (abs >= Time.hour - Time.minute / 2) return Math.round(ms / Time.hour) + "h";
			else if (abs >= Time.minute - Time.second / 2) return Math.round(ms / Time.minute) + "m";
			else if (abs >= Time.second) return Math.round(ms / Time.second) + "s";
			return ms + "ms";
		}
		Time.format = format;
		function toDigits(source, length = 2) {
			return source.toString().padStart(length, "0");
		}
		Time.toDigits = toDigits;
		function template(template, time = /* @__PURE__ */ new Date()) {
			return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
		}
		Time.template = template;
	})(Time || (Time = {}));
}));
//#endregion
//#region src/config.ts
var import_lib = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	let _deepseek_ai_cosmokit = (init_lib(), __toCommonJS(lib_exports));
	const kSchema = Symbol.for("schemastery");
	const kValidationError = Symbol.for("ValidationError");
	globalThis.__schemastery_index__ ??= 0;
	globalThis.__schemastery_refs__ = void 0;
	var ValidationError = class extends TypeError {
		options;
		name = "ValidationError";
		constructor(message, options) {
			let prefix = "$";
			for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
			else if (typeof segment === "number") prefix += "[" + segment + "]";
			else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
			if (prefix.startsWith(".")) prefix = prefix.slice(1);
			super((prefix === "$" ? "" : `${prefix} `) + message);
			this.options = options;
		}
		static is(error) {
			return !!error?.[kValidationError];
		}
	};
	Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
	const Schema = function(options) {
		const schema = function(data, options = {}) {
			return Schema.resolve(data, schema, options)[0];
		};
		if (options.refs) {
			const refs = (0, _deepseek_ai_cosmokit.valueMap)(options.refs, (options) => new Schema(options));
			const getRef = (uid) => refs[uid];
			for (const key in refs) {
				const options = refs[key];
				options.sKey = getRef(options.sKey);
				options.inner = getRef(options.inner);
				options.list = options.list && options.list.map(getRef);
				options.dict = options.dict && (0, _deepseek_ai_cosmokit.valueMap)(options.dict, getRef);
			}
			return refs[options.uid];
		}
		Object.assign(schema, options);
		if (typeof schema.callback === "string") try {
			schema.callback = new Function("return " + schema.callback)();
		} catch {}
		Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
		Object.setPrototypeOf(schema, Schema.prototype);
		schema.meta ||= {};
		schema.toString = schema.toString.bind(schema);
		return schema;
	};
	Schema.prototype = Object.create(Function.prototype);
	Schema.prototype[kSchema] = true;
	Object.defineProperty(Schema.prototype, "~standard", { get() {
		return {
			version: 1,
			vendor: "schemastery",
			validate: (value) => {
				try {
					return { value: Schema.resolve(value, this, {})[0] };
				} catch (error) {
					if (ValidationError.is(error)) return { issues: [{
						message: error.message,
						path: error.options.path
					}] };
					throw error;
				}
			}
		};
	} });
	Schema.ValidationError = ValidationError;
	Schema.prototype.toJSON = function toJSON() {
		if (globalThis.__schemastery_refs__) {
			globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
			return this.uid;
		}
		globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
		globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
		const result = {
			uid: this.uid,
			refs: globalThis.__schemastery_refs__
		};
		globalThis.__schemastery_refs__ = void 0;
		return result;
	};
	Schema.prototype.set = function set(key, value) {
		this.dict[key] = value;
		return this;
	};
	Schema.prototype.push = function push(value) {
		this.list.push(value);
		return this;
	};
	function mergeDesc(original, messages) {
		const result = typeof original === "string" ? { "": original } : { ...original };
		for (const locale in messages) {
			const value = messages[locale];
			if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
			else if (typeof value === "string") result[locale] = value;
		}
		return result;
	}
	function getInner(value) {
		return value?.$value ?? value?.$inner;
	}
	function extractKeys(data) {
		return (0, _deepseek_ai_cosmokit.filterKeys)(data ?? {}, (key) => !key.startsWith("$"));
	}
	Schema.prototype.i18n = function i18n(messages) {
		const schema = Schema(this);
		const desc = mergeDesc(schema.meta.description, messages);
		if (Object.keys(desc).length) schema.meta.description = desc;
		if (schema.dict) schema.dict = (0, _deepseek_ai_cosmokit.valueMap)(schema.dict, (inner, key) => {
			return inner.i18n((0, _deepseek_ai_cosmokit.valueMap)(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
		});
		if (schema.list) schema.list = schema.list.map((inner, index) => {
			return inner.i18n((0, _deepseek_ai_cosmokit.valueMap)(messages, (data = {}) => {
				if (Array.isArray(getInner(data))) return getInner(data)[index];
				if (Array.isArray(data)) return data[index];
				return extractKeys(data);
			}));
		});
		if (schema.inner) schema.inner = schema.inner.i18n((0, _deepseek_ai_cosmokit.valueMap)(messages, (data) => {
			if (getInner(data)) return getInner(data);
			return extractKeys(data);
		}));
		if (schema.sKey) schema.sKey = schema.sKey.i18n((0, _deepseek_ai_cosmokit.valueMap)(messages, (data) => data?.$key));
		return schema;
	};
	Schema.prototype.extra = function extra(key, value) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			[key]: value
		};
		return schema;
	};
	for (const key of [
		"required",
		"disabled",
		"collapse",
		"hidden",
		"loose"
	]) Object.assign(Schema.prototype, { [key](value = true) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			[key]: value
		};
		return schema;
	} });
	Schema.prototype.deprecated = function deprecated() {
		const schema = Schema(this);
		schema.meta.badges ||= [];
		schema.meta.badges.push({
			text: "deprecated",
			type: "danger"
		});
		return schema;
	};
	Schema.prototype.experimental = function experimental() {
		const schema = Schema(this);
		schema.meta.badges ||= [];
		schema.meta.badges.push({
			text: "experimental",
			type: "warning"
		});
		return schema;
	};
	Schema.prototype.pattern = function pattern(regexp) {
		const schema = Schema(this);
		const pattern = (0, _deepseek_ai_cosmokit.pick)(regexp, ["source", "flags"]);
		schema.meta = {
			...schema.meta,
			pattern
		};
		return schema;
	};
	Schema.prototype.simplify = function simplify(value) {
		if ((0, _deepseek_ai_cosmokit.deepEqual)(value, this.meta.default, this.type === "dict")) return null;
		if ((0, _deepseek_ai_cosmokit.isNullable)(value)) return value;
		if (this.type === "object" || this.type === "dict") {
			const result = {};
			for (const key in value) {
				const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
				if (this.type === "dict" || !(0, _deepseek_ai_cosmokit.isNullable)(item)) result[key] = item;
			}
			if ((0, _deepseek_ai_cosmokit.deepEqual)(result, this.meta.default, this.type === "dict")) return null;
			return result;
		} else if (this.type === "array" || this.type === "tuple") {
			const result = [];
			value.forEach((value, index) => {
				const schema = this.type === "array" ? this.inner : this.list[index];
				const item = schema ? schema.simplify(value) : value;
				result.push(item);
			});
			return result;
		} else if (this.type === "intersect") {
			const result = {};
			for (const item of this.list) Object.assign(result, item.simplify(value));
			return result;
		} else if (this.type === "union") for (const schema of this.list) try {
			Schema.resolve(value, schema, {});
			return schema.simplify(value);
		} catch {}
		return value;
	};
	Schema.prototype.toString = function toString(inline) {
		return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
	};
	Schema.prototype.role = function role(role, extra) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			role,
			extra
		};
		return schema;
	};
	for (const key of [
		"default",
		"link",
		"comment",
		"description",
		"max",
		"min",
		"step"
	]) Object.assign(Schema.prototype, { [key](value) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			[key]: value
		};
		return schema;
	} });
	const resolvers = {};
	Schema.extend = function extend(type, resolve) {
		resolvers[type] = resolve;
	};
	Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
		if (!schema) return [data];
		if (options.ignore?.(data, schema)) return [data];
		if ((0, _deepseek_ai_cosmokit.isNullable)(data) && schema.type !== "lazy") {
			if (schema.meta.required) throw new ValidationError(`missing required value`, options);
			let current = schema;
			let fallback = schema.meta.default;
			while (current?.type === "intersect" && (0, _deepseek_ai_cosmokit.isNullable)(fallback)) {
				current = current.list[0];
				fallback = current?.meta.default;
			}
			if ((0, _deepseek_ai_cosmokit.isNullable)(fallback)) return [data];
			data = (0, _deepseek_ai_cosmokit.clone)(fallback);
		}
		const callback = resolvers[schema.type];
		if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
		try {
			return callback(data, schema, options, strict);
		} catch (error) {
			if (!schema.meta.loose) throw error;
			return [schema.meta.default];
		}
	};
	Schema.from = function from(source) {
		if ((0, _deepseek_ai_cosmokit.isNullable)(source)) return Schema.any();
		else if ([
			"string",
			"number",
			"boolean"
		].includes(typeof source)) return Schema.const(source).required();
		else if (source[kSchema]) return source;
		else if (typeof source === "function") switch (source) {
			case String: return Schema.string().required();
			case Number: return Schema.number().required();
			case Boolean: return Schema.boolean().required();
			case Function: return Schema.function().required();
			default: return Schema.is(source).required();
		}
		else throw new TypeError(`cannot infer schema from ${source}`);
	};
	Schema.lazy = function lazy(builder) {
		const toJSON = () => {
			if (!schema.inner[kSchema]) {
				schema.inner = schema.builder();
				schema.inner.meta = {
					...schema.meta,
					...schema.inner.meta
				};
			}
			return schema.inner.toJSON();
		};
		const schema = new Schema({
			type: "lazy",
			builder,
			inner: { toJSON }
		});
		return schema;
	};
	Schema.natural = function natural() {
		return Schema.number().step(1).min(0);
	};
	Schema.percent = function percent() {
		return Schema.number().step(.01).min(0).max(1).role("slider");
	};
	Schema.date = function date() {
		return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
			const date = new Date(value);
			if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
			return date;
		}, true)]);
	};
	Schema.regExp = function regExp(flag = "") {
		return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
			try {
				return new RegExp(value, flag);
			} catch (e) {
				throw new ValidationError(e.message, options);
			}
		}, true)]);
	};
	Schema.arrayBuffer = function arrayBuffer(encoding) {
		return Schema.union([
			Schema.is(ArrayBuffer),
			Schema.is(SharedArrayBuffer),
			Schema.transform(Schema.any(), (value, options) => {
				if (_deepseek_ai_cosmokit.Binary.isSource(value)) return _deepseek_ai_cosmokit.Binary.fromSource(value);
				throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
			}, true),
			...encoding ? [Schema.transform(Schema.string(), (value, options) => {
				try {
					return encoding === "base64" ? _deepseek_ai_cosmokit.Binary.fromBase64(value) : _deepseek_ai_cosmokit.Binary.fromHex(value);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)] : []
		]);
	};
	Schema.extend("lazy", (data, schema, options, strict) => {
		if (!schema.inner[kSchema]) {
			schema.inner = schema.builder();
			schema.inner.meta = {
				...schema.meta,
				...schema.inner.meta
			};
		}
		return Schema.resolve(data, schema.inner, options, strict);
	});
	Schema.extend("any", (data) => {
		return [data];
	});
	Schema.extend("never", (data, _, options) => {
		throw new ValidationError(`expected nullable but got ${data}`, options);
	});
	Schema.extend("const", (data, { value }, options) => {
		if ((0, _deepseek_ai_cosmokit.deepEqual)(data, value)) return [value];
		throw new ValidationError(`expected ${value} but got ${data}`, options);
	});
	function checkWithinRange(data, meta, description, options, skipMin = false) {
		const { max = Infinity, min = -Infinity } = meta;
		if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
		if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
	}
	Schema.extend("string", (data, { meta }, options) => {
		if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
		if (meta.pattern) {
			const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
			if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
		}
		checkWithinRange(data.length, meta, "string length", options);
		return [data];
	});
	function decimalShift(data, digits) {
		const str = data.toString();
		if (str.includes("e")) return data * Math.pow(10, digits);
		const index = str.indexOf(".");
		if (index === -1) return data * Math.pow(10, digits);
		const frac = str.slice(index + 1);
		const integer = str.slice(0, index);
		if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
		return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
	}
	function isMultipleOf(data, min, step) {
		step = Math.abs(step);
		if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
		const index = step.toString().indexOf(".");
		const digits = step.toString().slice(index + 1).length;
		return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
	}
	Schema.extend("number", (data, { meta }, options) => {
		if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
		checkWithinRange(data, meta, "number", options);
		const { step } = meta;
		if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
		return [data];
	});
	Schema.extend("boolean", (data, _, options) => {
		if (typeof data === "boolean") return [data];
		throw new ValidationError(`expected boolean but got ${data}`, options);
	});
	Schema.extend("bitset", (data, { bits, meta }, options) => {
		let value = 0, keys = [];
		if (typeof data === "number") {
			value = data;
			for (const key in bits) if (data & bits[key]) keys.push(key);
		} else if (Array.isArray(data)) {
			keys = data;
			for (const key of keys) {
				if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
				if (key in bits) value |= bits[key];
			}
		} else throw new ValidationError(`expected number or array but got ${data}`, options);
		if (value === meta.default) return [value];
		return [value, keys];
	});
	Schema.extend("function", (data, _, options) => {
		if (typeof data === "function") return [data];
		throw new ValidationError(`expected function but got ${data}`, options);
	});
	Schema.extend("is", (data, { constructor }, options) => {
		if (typeof constructor === "function") {
			if (data instanceof constructor) return [data];
			throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
		} else {
			if ((0, _deepseek_ai_cosmokit.isNullable)(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			let prototype = Object.getPrototypeOf(data);
			while (prototype) {
				if (prototype.constructor?.name === constructor) return [data];
				prototype = Object.getPrototypeOf(prototype);
			}
			throw new ValidationError(`expected ${constructor} but got ${data}`, options);
		}
	});
	function property(data, key, schema, options) {
		try {
			const [value, adapted] = Schema.resolve(data[key], schema, {
				...options,
				path: [...options.path || [], key]
			});
			if (adapted !== void 0) data[key] = adapted;
			return value;
		} catch (e) {
			if (!options?.autofix) throw e;
			delete data[key];
			return schema.meta.default;
		}
	}
	Schema.extend("array", (data, { inner, meta }, options) => {
		if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
		checkWithinRange(data.length, meta, "array length", options, !(0, _deepseek_ai_cosmokit.isNullable)(inner.meta.default));
		return [data.map((_, index) => property(data, index, inner, options))];
	});
	Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
		if (!(0, _deepseek_ai_cosmokit.isPlainObject)(data)) throw new ValidationError(`expected object but got ${data}`, options);
		const result = {};
		for (const key in data) {
			let rKey;
			try {
				rKey = Schema.resolve(key, sKey, options)[0];
			} catch (error) {
				if (strict) continue;
				throw error;
			}
			result[rKey] = property(data, key, inner, options);
			data[rKey] = data[key];
			if (key !== rKey) delete data[key];
		}
		return [result];
	});
	Schema.extend("tuple", (data, { list }, options, strict) => {
		if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
		const result = list.map((inner, index) => property(data, index, inner, options));
		if (strict) return [result];
		result.push(...data.slice(list.length));
		return [result];
	});
	function merge(result, data) {
		for (const key in data) {
			if (key in result) continue;
			result[key] = data[key];
		}
	}
	Schema.extend("object", (data, { dict }, options, strict) => {
		if (!(0, _deepseek_ai_cosmokit.isPlainObject)(data)) throw new ValidationError(`expected object but got ${data}`, options);
		const result = {};
		for (const key in dict) {
			const value = property(data, key, dict[key], options);
			if (!(0, _deepseek_ai_cosmokit.isNullable)(value) || key in data) result[key] = value;
		}
		if (!strict) merge(result, data);
		return [result];
	});
	Schema.extend("union", (data, { list, toString }, options, strict) => {
		const messages = [];
		for (const inner of list) try {
			return Schema.resolve(data, inner, options, strict);
		} catch (error) {
			messages.push(error);
		}
		throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
	});
	Schema.extend("intersect", (data, { list, toString }, options, strict) => {
		if (!list.length) return [data];
		let result;
		for (const inner of list) {
			const value = Schema.resolve(data, inner, options, true)[0];
			if ((0, _deepseek_ai_cosmokit.isNullable)(value)) continue;
			if ((0, _deepseek_ai_cosmokit.isNullable)(result)) result = value;
			else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
			else if (typeof value === "object") merge(result ??= {}, value);
			else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		}
		if (!strict && (0, _deepseek_ai_cosmokit.isPlainObject)(data)) merge(result, data);
		return [result];
	});
	Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
		const [result, adapted = data] = Schema.resolve(data, inner, options, true);
		if (preserve) return [callback(result)];
		else return [callback(result), callback(adapted)];
	});
	const formatters = {};
	function defineMethod(name, keys, format) {
		formatters[name] = format;
		Object.assign(Schema, { [name](...args) {
			const schema = new Schema({ type: name });
			keys.forEach((key, index) => {
				switch (key) {
					case "sKey":
						schema.sKey = args[index] ?? Schema.string();
						break;
					case "inner":
						schema.inner = Schema.from(args[index]);
						break;
					case "list":
						schema.list = args[index].map(Schema.from);
						break;
					case "dict":
						schema.dict = (0, _deepseek_ai_cosmokit.valueMap)(args[index], Schema.from);
						break;
					case "bits":
						schema.bits = {};
						for (const key in args[index]) {
							if (typeof args[index][key] !== "number") continue;
							schema.bits[key] = args[index][key];
						}
						break;
					case "callback": {
						const callback = schema.callback = args[index];
						callback["toJSON"] ||= () => callback.toString();
						break;
					}
					case "constructor": {
						const constructor = schema.constructor = args[index];
						if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
						break;
					}
					default: schema[key] = args[index];
				}
			});
			if (name === "object" || name === "dict") schema.meta.default = {};
			else if (name === "array" || name === "tuple") schema.meta.default = [];
			else if (name === "bitset") schema.meta.default = 0;
			return schema;
		} });
	}
	defineMethod("is", ["constructor"], ({ constructor }) => {
		if (typeof constructor === "function") return constructor.name;
		else return constructor;
	});
	defineMethod("any", [], () => "any");
	defineMethod("never", [], () => "never");
	defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
	defineMethod("string", [], () => "string");
	defineMethod("number", [], () => "number");
	defineMethod("boolean", [], () => "boolean");
	defineMethod("bitset", ["bits"], () => "bitset");
	defineMethod("function", [], () => "function");
	defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
	defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
	defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
	defineMethod("object", ["dict"], ({ dict }) => {
		if (Object.keys(dict).length === 0) return "{}";
		return `{ ${Object.entries(dict).map(([key, inner]) => {
			return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
		}).join(", ")} }`;
	});
	defineMethod("union", ["list"], ({ list }, inline) => {
		const result = list.map(({ toString: format }) => format()).join(" | ");
		return inline ? `(${result})` : result;
	});
	defineMethod("intersect", ["list"], ({ list }) => {
		return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
	});
	defineMethod("transform", [
		"inner",
		"callback",
		"preserve"
	], ({ inner }, isInner) => inner.toString(isInner));
	module.exports = Schema;
})))(), 1);
/** Defaults for absent keys, mirrored by the client card. */
const DEFAULTS = {
	showJobs: true,
	showWaits: true,
	showSubagents: true,
	autoFollowOutput: true
};
import_lib.default.object({
	showJobs: import_lib.default.boolean().default(DEFAULTS.showJobs),
	showWaits: import_lib.default.boolean().default(DEFAULTS.showWaits),
	showSubagents: import_lib.default.boolean().default(DEFAULTS.showSubagents),
	autoFollowOutput: import_lib.default.boolean().default(DEFAULTS.autoFollowOutput)
});
//#endregion
//#region src/client/locales.ts
/** Locale namespace owned by the operations view. */
const NS = "goodjob";
/** Chinese product copy. */
const zh = {
	"title": "GoodJob 运维面板",
	"section.agents": "子代理",
	"section.jobs": "后台任务",
	"section.waits": "等待",
	"agents.empty": "此会话没有子代理。",
	"agents.currentTask": "当前任务",
	"agents.lastActivity": "最近活动",
	"agents.elapsed": "已用时",
	"agents.open": "打开",
	"agents.message": "消息",
	"agents.interrupt": "打断",
	"agents.messagePlaceholder": "向该代理追加一条提示…",
	"agents.send": "发送",
	"agents.interruptConfirm": "打断当前轮次？会话保持可继续。",
	"jobs.empty": "没有后台任务。",
	"jobs.owner": "所有者",
	"jobs.logs": "日志",
	"waits.empty": "没有等待中的条件。",
	"waits.mode.any": "任一",
	"waits.mode.all": "全部",
	"waits.status.pending": "等待中",
	"waits.status.ready": "就绪",
	"waits.status.dispatched": "已唤醒",
	"waits.status.cancelled": "已取消",
	"status.running": "运行中",
	"status.idle": "空闲",
	"status.inactive": "不活跃",
	"common.close": "关闭"
};
/** English copy. */
const en = {
	"title": "GoodJob Operations",
	"section.agents": "Subagents",
	"section.jobs": "Jobs",
	"section.waits": "Waits",
	"agents.empty": "No subagents in this session.",
	"agents.currentTask": "task",
	"agents.lastActivity": "last activity",
	"agents.elapsed": "elapsed",
	"agents.open": "Open",
	"agents.message": "Message",
	"agents.interrupt": "Interrupt",
	"agents.messagePlaceholder": "Send an additional prompt to this agent…",
	"agents.send": "Send",
	"agents.interruptConfirm": "Interrupt the current turn? The session stays continuable.",
	"jobs.empty": "No background jobs.",
	"jobs.owner": "owner",
	"jobs.logs": "Logs",
	"waits.empty": "Nothing being waited on.",
	"waits.mode.any": "any",
	"waits.mode.all": "all",
	"waits.status.pending": "waiting",
	"waits.status.ready": "ready",
	"waits.status.dispatched": "resumed",
	"waits.status.cancelled": "cancelled",
	"status.running": "running",
	"status.idle": "idle",
	"status.inactive": "inactive",
	"common.close": "Close"
};
//#endregion
//#region src/client/styles.ts
/** GoodJob operations stylesheet, injected once at plugin activation. */
const STYLES = `.gj-root {
  position: relative;
  display: inline-flex;
}

.gj-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--dsw-border);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-text);
  padding: 2px 10px;
  font-size: 12px;
  cursor: pointer;
}

.gj-trigger:hover {
  background: var(--dsw-hover);
}

.gj-liveCount {
  min-width: 16px;
  border-radius: 999px;
  background: var(--dsw-accent);
  color: var(--dsw-accent-contrast, #fff);
  text-align: center;
  font-size: 11px;
  line-height: 16px;
}

.gj-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  width: 380px;
  max-height: 70vh;
  overflow: auto;
  border: 1px solid var(--dsw-border);
  border-radius: 10px;
  background: var(--dsw-panel);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  padding: 12px;
}

.gj-heading {
  margin: 4px 0 6px;
  font-size: 11px;
  letter-spacing: 0.gj-06em;
  text-transform: uppercase;
  color: var(--dsw-text-muted);
}

.gj-empty {
  color: var(--dsw-text-muted);
  font-size: 12px;
  margin: 2px 0;
}

/* Agents */

.gj-agents,
.gj-jobs,
.gj-waits {
  list-style: none;
  margin: 0;
  padding: 0;
}

.gj-agentRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}

.gj-agentDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dsw-border);
}

.gj-agentRunning {
  background: var(--dsw-accent);
}

.gj-agentLabel {
  font-size: 12px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gj-agentMode {
  font-size: 10px;
  color: var(--dsw-text-muted);
}

.gj-agentActions {
  margin-left: auto;
  display: inline-flex;
  gap: 4px;
}

.gj-action {
  border: 1px solid var(--dsw-border);
  background: transparent;
  color: var(--dsw-text);
  border-radius: 6px;
  font-size: 11px;
  padding: 1px 8px;
  cursor: pointer;
}

.gj-action:disabled {
  opacity: 0.gj-5;
  cursor: default;
}

.gj-primary {
  background: var(--dsw-accent);
  border-color: var(--dsw-accent);
  color: var(--dsw-accent-contrast, #fff);
}

.gj-composer {
  flex-basis: 100%;
  margin-top: 4px;
}

.gj-composerInput {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  border: 1px solid var(--dsw-border);
  border-radius: 6px;
  background: var(--dsw-input-bg, transparent);
  color: var(--dsw-text);
  font-size: 12px;
  padding: 4px 6px;
}

.gj-composerRow {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

/* Jobs */

.gj-jobRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}

.gj-jobStatus {
  font-size: 10px;
  color: var(--dsw-text-muted);
}

.gj-jobLive {
  color: var(--dsw-accent);
}

.gj-jobLabel {
  font-size: 12px;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gj-jobDuration {
  font-size: 11px;
  color: var(--dsw-text-muted);
  font-variant-numeric: tabular-nums;
}

.gj-output {
  flex-basis: 100%;
  max-height: 180px;
  overflow: auto;
  background: var(--dsw-code-bg, rgb(127 127 127 / 12%));
  border-radius: 6px;
  padding: 6px;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Waits */

.gj-waitRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}

.gj-waitStatus {
  font-size: 10px;
  border-radius: 999px;
  border: 1px solid var(--dsw-border);
  padding: 0 6px;
}

.gj-ready {
  color: var(--dsw-ok, #3a9);
}

.gj-dispatched {
  color: var(--dsw-ok, #3a9);
}

.gj-cancelled {
  color: var(--dsw-text-muted);
  text-decoration: line-through;
}

.gj-waitMode {
  font-size: 10px;
  color: var(--dsw-text-muted);
}

.gj-leaves {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 0;
  padding: 0;
}

.gj-leaf,
.gj-leafDone {
  font-size: 11px;
  display: inline-flex;
  gap: 2px;
}

.gj-leafDone {
  color: var(--dsw-ok, #3a9);
}

.gj-leafMark {
  font-size: 10px;
}

.gj-winner {
  font-size: 10px;
  color: var(--dsw-text-muted);
}

/* Settings card */

.gj-card {
  border: 1px solid var(--dsw-border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gj-cardRow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
`;
/** Class-name map mirroring the stylesheet's selectors. */
const css = {
	"action": "gj-action",
	"agentActions": "gj-agentActions",
	"agentDot": "gj-agentDot",
	"agentLabel": "gj-agentLabel",
	"agentMode": "gj-agentMode",
	"agentRow": "gj-agentRow",
	"agentRunning": "gj-agentRunning",
	"agents": "gj-agents",
	"cancelled": "gj-cancelled",
	"card": "gj-card",
	"cardRow": "gj-cardRow",
	"composer": "gj-composer",
	"composerInput": "gj-composerInput",
	"composerRow": "gj-composerRow",
	"dispatched": "gj-dispatched",
	"empty": "gj-empty",
	"heading": "gj-heading",
	"jobDuration": "gj-jobDuration",
	"jobLabel": "gj-jobLabel",
	"jobLive": "gj-jobLive",
	"jobRow": "gj-jobRow",
	"jobStatus": "gj-jobStatus",
	"jobs": "gj-jobs",
	"leaf": "gj-leaf",
	"leafDone": "gj-leafDone",
	"leafMark": "gj-leafMark",
	"leaves": "gj-leaves",
	"liveCount": "gj-liveCount",
	"menu": "gj-menu",
	"output": "gj-output",
	"primary": "gj-primary",
	"ready": "gj-ready",
	"root": "gj-root",
	"trigger": "gj-trigger",
	"waitMode": "gj-waitMode",
	"waitRow": "gj-waitRow",
	"waitStatus": "gj-waitStatus",
	"waits": "gj-waits",
	"winner": "gj-winner"
};
//#endregion
//#region src/client/AgentsList.tsx
/**
* Agents section: one row per direct subagent child of the current session.
*
* Data comes from the existing `subagentsByParent` catalog mirror; message
* and interrupt go through the existing subagent RPCs, so no duplicate
* conversation is created, delivery keeps the host's FIFO queueing, and
* interruption only ends the current turn.
* @module dsh-goodjob/client/AgentsList
*/
/**
* Render the agents section body with per-row actions.
* @param props - parent id, agents, API, translator.
* @returns the list, or the empty line.
*/
function AgentsList({ sessionId, agents, subagentsApi, onOpen, t }) {
	const [composingFor, setComposingFor] = (0, react.useState)();
	const [draft, setDraft] = (0, react.useState)("");
	const [busy, setBusy] = (0, react.useState)(false);
	if (agents.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		className: css.empty,
		children: t("agents.empty")
	});
	const send = async (childSessionId) => {
		if (draft.trim().length === 0) return;
		setBusy(true);
		try {
			await subagentsApi.prompt({
				parentSessionId: sessionId,
				childSessionId,
				mode: "continuable",
				content: [{
					type: "text",
					text: draft
				}]
			});
			setDraft("");
			setComposingFor(void 0);
		} finally {
			setBusy(false);
		}
	};
	const interrupt = async (childSessionId) => {
		if (!window.confirm(t("agents.interruptConfirm"))) return;
		setBusy(true);
		try {
			await subagentsApi.interrupt({
				parentSessionId: sessionId,
				childSessionId,
				mode: "continuable"
			});
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
		className: css.agents,
		"aria-label": t("section.agents"),
		children: agents.map((agent) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
			className: css.agentRow,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: `${css.agentDot} ${agent.activity === "running" ? css.agentRunning : ""}`,
					title: t(agent.activity === "running" ? "status.running" : "status.inactive")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css.agentLabel,
					children: agent.label ?? agent.id
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css.agentMode,
					children: agent.mode
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: css.agentActions,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.action,
							onClick: () => {
								onOpen(agent.id);
							},
							children: t("agents.open")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.action,
							onClick: () => {
								setComposingFor(agent.id);
							},
							children: t("agents.message")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.action,
							disabled: busy,
							onClick: () => {
								interrupt(agent.id);
							},
							children: t("agents.interrupt")
						})
					]
				}),
				composingFor === agent.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.composer,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						className: css.composerInput,
						placeholder: t("agents.messagePlaceholder"),
						value: draft,
						rows: 2,
						onChange: (event) => {
							setDraft(event.target.value);
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.composerRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.action,
							onClick: () => {
								setComposingFor(void 0);
							},
							children: t("common.close")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${css.action} ${css.primary}`,
							disabled: busy || draft.trim().length === 0,
							onClick: () => {
								send(agent.id);
							},
							children: t("agents.send")
						})]
					})]
				}) : null
			]
		}, agent.id))
	});
}
/** Narrow a raw catalog entry to the renderable child shape; diagnostics rows are skipped. */
function toAgentRow(entry) {
	if (typeof entry !== "object" || entry === null) return void 0;
	const candidate = entry;
	if (candidate.kind !== "child") return void 0;
	if (candidate.mode !== "one-shot" && candidate.mode !== "continuable") return void 0;
	if (candidate.activity !== "running" && candidate.activity !== "inactive") return void 0;
	return {
		id: String(candidate.id),
		label: typeof candidate.label === "string" ? candidate.label : void 0,
		mode: candidate.mode,
		activity: candidate.activity
	};
}
//#endregion
//#region src/client/WaitsList.tsx
/** Human word for one folded lifecycle state. */
function statusKey(status) {
	return `waits.status.${status}`;
}
/**
* Render one leaf: settled leaves show their provider with a check, pending
* ones an ellipsis. Leaf input stays inspectable through the title
* attribute without growing the visible row.
*/
function Leaf({ leaf }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
		className: leaf.result !== void 0 ? css.leafDone : css.leaf,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: css.leafMark,
			children: leaf.result !== void 0 ? "✓" : "…"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			title: JSON.stringify(leaf.input) ?? "",
			children: leaf.provider ?? `#${leaf.index}`
		})]
	});
}
/**
* Render the waits section body.
* @param props - waits and translator.
* @returns the list, or the empty line.
*/
function WaitsList({ waits, t }) {
	if (waits.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		className: css.empty,
		children: t("waits.empty")
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
		className: css.waits,
		"aria-label": t("section.waits"),
		children: waits.map((wait) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
			className: css.waitRow,
			"data-status": wait.status,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: `${css.waitStatus} ${css[wait.status] ?? ""}`,
					children: t(statusKey(wait.status))
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css.waitMode,
					children: t(wait.mode === "any" ? "waits.mode.any" : "waits.mode.all")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: css.leaves,
					children: wait.leaves.map((leaf) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Leaf, { leaf }, leaf.index))
				}),
				wait.winnerIndex !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: css.winner,
					children: ["#", wait.winnerIndex]
				}) : null
			]
		}, wait.id))
	});
}
//#endregion
//#region src/client/OperationsAction.tsx
/**
* GoodJob operations view, browser half: one session-header action with a
* three-section popover — Subagents, Jobs, Waits.
*
* Every section reads an existing channel: the subagent catalog mirror and
* jobs mirror arrive through the sessions snapshot store, waits through the
* `goodjob/waits` projection seat, and job output through the non-consuming
* observe API. Opening the panel and reading any of it causes zero model
* inference.
* @module dsh-goodjob/client
*/
/** Stable empty list so idle sessions keep one array identity. */
const NO_JOBS = [];
/** A job whose duration still ticks. */
function isLive(job) {
	return job.status === "running" || job.status === "stopping";
}
/**
* Session-header entry point for the unified operations view. Sections
* collapse when their domain has nothing to show.
* @param props - runtime slot currency, translator, and injected API.
* @returns the trigger button and its popover.
*/
function OperationsAction({ sessionId, useSessions, useProjection, t, api, refreshSubagents, openChild }) {
	const useSessionsTyped = useSessions;
	const jobs = useSessionsTyped((state) => state.jobsBySession[sessionId]) ?? NO_JOBS;
	const catalog = useSessionsTyped((state) => state.subagentsByParent[sessionId]);
	const waits = useProjection("goodjob/waits")?.waits ?? [];
	const [open, setOpen] = (0, react.useState)(false);
	const [now, setNow] = (0, react.useState)(() => Date.now());
	const [expandedJob, setExpandedJob] = (0, react.useState)();
	const [jobOutput, setJobOutput] = (0, react.useState)();
	const rootRef = (0, react.useRef)(null);
	const liveJobs = (0, react.useMemo)(() => jobs.filter(isLive).length, [jobs]);
	const agents = (0, react.useMemo)(() => (catalog?.entries ?? []).map(toAgentRow).filter((row) => row !== void 0), [catalog]);
	(0, react.useEffect)(() => {
		if (open) refreshSubagents(sessionId);
	}, [
		open,
		sessionId,
		refreshSubagents
	]);
	(0, react.useEffect)(() => {
		if (!open || liveJobs === 0) return;
		setNow(Date.now());
		const timer = setInterval(() => {
			setNow(Date.now());
		}, 1e3);
		return () => {
			clearInterval(timer);
		};
	}, [open, liveJobs]);
	(0, react.useEffect)(() => {
		if (expandedJob === void 0) return;
		if (!jobs.some((job) => job.id === expandedJob)) setExpandedJob(void 0);
	}, [jobs, expandedJob]);
	(0, react.useEffect)(() => {
		if (expandedJob === void 0) {
			setJobOutput(void 0);
			return;
		}
		let cancelled = false;
		api.jobs.observe({
			sessionId,
			jobId: expandedJob,
			afterSequence: 0
		}).then((response) => {
			if (cancelled || !response.result.ok) return;
			setJobOutput(renderObserve(response.result.value));
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [
		api,
		sessionId,
		expandedJob
	]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		className: css.root,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: css.trigger,
			"aria-expanded": open,
			"aria-label": t("title"),
			onClick: () => {
				setOpen((current) => !current);
			},
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.triggerName,
				children: "GoodJob"
			}), liveJobs > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: css.liveCount,
				children: liveJobs
			}) : null]
		}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: css.menu,
			role: "dialog",
			"aria-label": t("title"),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: css.heading,
					children: t("section.agents")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AgentsList, {
					sessionId: String(sessionId),
					agents,
					subagentsApi: api.subagents,
					t,
					onOpen: (childSessionId) => openChild({
						parentSessionId: sessionId,
						childSessionId,
						mode: "continuable"
					})
				})] }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: css.heading,
					children: t("section.jobs")
				}), jobs.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: css.empty,
					children: t("jobs.empty")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: css.jobs,
					"aria-label": t("section.jobs"),
					children: jobs.map((job) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: css.jobRow,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${css.jobStatus} ${isLive(job) ? css.jobLive : ""}`,
								children: isLive(job) ? t("status.running") : job.status
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: css.jobLabel,
								title: job.label,
								children: [
									job.kind,
									": ",
									job.label
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: css.jobDuration,
								children: [Math.max(0, Math.round(((job.finishedAt ?? now) - job.startedAt) / 1e3)), "s"]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: css.action,
								onClick: () => {
									setExpandedJob((current) => current === job.id ? void 0 : job.id);
								},
								children: t("jobs.logs")
							}),
							expandedJob === job.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
								className: css.output,
								children: jobOutput ?? ""
							}) : null
						]
					}, job.id))
				})] }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: css.heading,
					children: t("section.waits")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WaitsList, {
					waits,
					t
				})] })
			]
		}) : null]
	});
}
/** Join one observation page's chunks in sequence order. */
function renderObserve(value) {
	return value.chunks.map((chunk) => chunk.text).join("");
}
//#endregion
//#region src/client/SettingsCard.tsx
/**
* The GoodJob settings card: the visibility toggles under
* Settings → Plugins → GoodJob, keyed by the plugin's `goodjob` namespace.
* The card stages edits locally, sends one revision-checked patch through the
* existing settings API, and renders nothing while the namespace is absent.
* Repository and version metadata live in the Plugin Inventory surface
* instead of this form.
* @module dsh-goodjob/client/SettingsCard
*/
/** The boolean fields this card owns with host-mirrored defaults. */
const FIELDS = [
	["showJobs", "Jobs"],
	["showSubagents", "Agents"],
	["showWaits", "Waits"],
	["autoFollowOutput", "Auto-follow job output"]
];
/**
* Render the GoodJob configuration card.
* @param props - API access.
* @returns the card body, or null before the namespace answers.
*/
function GoodJobSettingsCard({ api }) {
	const [current, setCurrent] = (0, react.useState)();
	const [writable, setWritable] = (0, react.useState)(false);
	const [revision, setRevision] = (0, react.useState)();
	const [dirty, setDirty] = (0, react.useState)({});
	(0, react.useEffect)(() => {
		let cancelled = false;
		api.settings.describe({}).then((response) => {
			if (cancelled || !response.result.ok) return;
			const described = response.result.value;
			setWritable(described.writable);
			const section = described.namespaces.find((ns) => ns.ns === "goodjob");
			if (section !== void 0) {
				setRevision(section.revision);
				const value = section.value;
				setCurrent({
					showJobs: value?.showJobs ?? true,
					showWaits: value?.showWaits ?? true,
					showSubagents: value?.showSubagents ?? true,
					autoFollowOutput: value?.autoFollowOutput ?? true
				});
			}
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [api]);
	if (current === void 0) return null;
	const save = () => {
		api.settings.update({
			ns: "goodjob",
			patch: dirty,
			expectedRevision: revision
		});
		setCurrent({
			...current,
			...dirty
		});
		setDirty({});
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: css.card,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: css.heading,
				children: "GoodJob"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: css.empty,
				children: "Background jobs, waits, and agent operations"
			}),
			FIELDS.map(([field, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: css.cardRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: (dirty[field] ?? current[field]) === true,
					disabled: !writable,
					onChange: (event) => {
						setDirty((previous) => ({
							...previous,
							[field]: event.target.checked
						}));
					}
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })]
			}, field)),
			Object.keys(dirty).length > 0 && writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: `${css.action} ${css.primary}`,
				onClick: save,
				children: "Save"
			}) : null
		]
	});
}
//#endregion
//#region src/client/index.ts
/** Required services for locale registration, the connection face, slots, and sessions. */
const inject = [
	"sessions",
	"slots",
	"locale",
	"connection"
];
/** Read the sessions service structurally; out-of-tree builds must not depend
* on host/client augmentation order for the Cordis context merge. */
function sessionsFace(ctx) {
	return ctx.sessions;
}
/**
* Client plugin body: register the dictionaries, the header action, and the
* settings card keyed by the `goodjob` namespace.
* @param ctx - client root context.
* @param config - host-side config echoed through the client graph.
*/
function apply(ctx, config = {}) {
	config.showJobs ?? DEFAULTS.showJobs, config.showWaits ?? DEFAULTS.showWaits, config.showSubagents ?? DEFAULTS.showSubagents, config.autoFollowOutput ?? DEFAULTS.autoFollowOutput;
	ctx.effect(() => {
		if (document.querySelector("style[data-plugin=\"dsh-goodjob\"]") !== null) return () => {};
		const tag = document.createElement("style");
		tag.dataset.plugin = "dsh-goodjob";
		tag.textContent = STYLES;
		document.head.appendChild(tag);
		return () => {
			tag.remove();
		};
	}, "goodjob: stylesheet");
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en
	}), "goodjob: dictionaries");
	ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
		name: "conversation.session.header.actions",
		id: "goodjob-operations",
		order: 30,
		locale: NS,
		inject: () => ({
			api: ctx.get("connection").api,
			refreshSubagents: (parentSessionId) => sessionsFace(ctx).refreshSubagents(parentSessionId),
			openChild: (address) => sessionsFace(ctx).openSubagent(address)
		})
	}, OperationsAction));
	ctx.slots.inject("settings.plugin.item", function* () {
		yield ctx.slots.register({
			name: "settings.plugin.item",
			key: "goodjob",
			locale: NS,
			inject: () => ({ api: ctx.get("connection").api })
		}, GoodJobSettingsCard);
	});
}
//#endregion
exports.apply = apply;
exports.inject = inject;

return module.exports; } });
//# sourceMappingURL=client.js.map