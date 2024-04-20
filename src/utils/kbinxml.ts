import { to_bin, to_xml } from "@kamyu/kbinxml";
import { XMLParser } from "fast-xml-parser";
import _ from "lodash";
import { Serializable } from "./kxml-value.js";
import { writeFileSync } from "fs";

export const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: false,
  attributeNamePrefix: '$',
  removeNSPrefix: true,
  numberParseOptions: {
    hex: false,
    leadingZeros: false,
    eNotation: false,
    skipLike: /.*/,
  },
});

function parseValue(node: { $__type: string; $__count?: unknown }): any {
  const isArray = '$__count' in node;

  if (
    [
      's8',
      'u8',
      's16',
      'u16',
      's32',
      'u32',
      's64',
      'u64',
    ].includes(node.$__type)
  ) {
    if (isArray) {
      return node['#text'].split(' ').map((v) => parseInt(v));
    }

    return parseInt(node['#text']);
  }

  if (['float', 'double'].includes(node.$__type)) {
    if (isArray) {
      return node['#text'].split(' ').map((v) => parseFloat(v));
    }

    return parseFloat(node['#text']);
  }

  if (['b', 'bool'].includes(node.$__type)) {
    return !!parseInt(node['#text']);
  }

  if (['bin', 'binary'].includes(node.$__type)) {
    return Buffer.from(node['#text'], 'hex');
  }

  if (['ip4', 'str', 'string'].includes(node.$__type)) {
    return node['#text'];
  }

  if (node.$__type == 'time') {
    return new Date(parseInt(node['#text']) * 1000);
  }

  return {
    type: node.$__type,
    value: node['#text'],
  };
}

export function toObject(node: Record<string, unknown> | unknown[] | string): any {
  if (node instanceof Array) {
    return node.map((v) => toObject(v as Record<string, unknown>));
  }

  if (typeof node === 'string') {
    return {};
  }

  if ('$__type' in node) {
    return parseValue(node as { $__type: string; $__count?: unknown });
  }

  const obj: object = {};

  for (const key in node) {
    if (key == '?xml') continue;
    const value = node[key];

    if (key.startsWith('$')) {
      obj[key.substring(1)] = value;
      continue;
    }

    obj[key] = toObject(node[key] as Record<string, unknown>);
  }

  return obj;
}

export function fromKBinXml(kbinxml: Uint8Array) {
  const xml = to_xml(kbinxml).data;
  const parsedXml = parser.parse(xml);
  return toObject(parsedXml);
}

function serializeValue(value: any, type: string): string {
  if (
    [
      's8',
      'u8',
      's16',
      'u16',
      's32',
      'u32',
      's64',
      'u64',
      'float',
      'double',
    ].includes(type)
  ) {
    return value.toString();
  }

  if (['b', 'bool'].includes(type)) {
    return value ? '1' : '0';
  }

  if (['bin', 'binary'].includes(type)) {
    if (!(value instanceof Buffer)) {
      throw new Error('binary with non-buffer value');
    }

    return value.toString('hex');
  }

  if (['ip4', 'str', 'string'].includes(type)) {
    return value;
  }

  if (type == 'time') {
    if (value instanceof Date) {
      return Math.floor(value.valueOf() / 1000).toString();
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    throw new Error('time with not date or number');
  }

  throw new Error(`unsupported type ${type}`);
}

function serializeObject(obj: Serializable, name: string, linePrefix: string = '') {
  let output = `${linePrefix}<${name}`;

  const entries = Object.entries(obj);
  const attrs = entries
    .filter(v => v[0].startsWith('$'))
    .map(v => [v[0].substring(1), v[1]]);

  // handle kxml value shit
  const value = entries.find(v => v[0] == '__value');

  if (value && value[1] instanceof Array) {
    attrs.push(['__count', value[1].length]);
  }

  if (value && value[1] instanceof Buffer) {
    attrs.push(['__size', value[1].length]);
  }

  // the kbinxml library had issue when serializing non-ordered stuff
  attrs.sort((a, b) => a[0] < b[0] ? 1 : (a[0] > b[0] ? -1 : 0));

  for (const attr of attrs) {
    if (attr[1] === undefined)
      continue;

    output += ` ${attr[0]}="${_.escape(attr[1])}"`;
  }

  output += '>';

  if (value) {
    if (value[1] === undefined) {
      return '';
    }

    const type = attrs.find(v => v[0] == '__type');

    if (!type) {
      // or normal xml innerXml?
      throw new Error(`value with no type in ${name}`);
    }

    output += (value[1] instanceof Array ? value[1] : [value[1]])
      .map(v => serializeValue(v, type[1]))
      .join(' ');
  } else {
    const elements = entries
      .filter(v => !v[0].startsWith('$'))
      .sort((a, b) => a[0] < b[0] ? 1 : (a[0] > b[0] ? -1 : 0));

    if (elements.length) {
      output += '\n';

      for (const element of elements) {
        if (element[1] instanceof Array) {
          for (const item of element[1])
            output += serializeObject(item, element[0], linePrefix + '  ');

          continue;
        }

        output += serializeObject(element[1], element[0], linePrefix + '  ');
      }

      output += linePrefix;
    }
  }

  return output + `</${name}>\n`;
}

export function toKBinXml(topName: string, obj: Serializable, encoding: 'UTF-8' | 'SHIFT_JIS' = 'UTF-8') {
  const xml = `<?xml version="1.0" encoding="${encoding}"?>` + serializeObject(obj, topName);
  writeFileSync('dump.xml', xml);
  return to_bin(xml);
}
