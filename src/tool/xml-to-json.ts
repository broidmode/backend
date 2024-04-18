import { readFileSync, writeFileSync } from "fs";
import { toObject, parser } from "../utils/kbinxml.js";

const xml = readFileSync('input.xml', 'utf-8');

const parsedXml = parser.parse(xml);
const obj = toObject(parsedXml);

writeFileSync('output.json', JSON.stringify(obj, undefined, 2));
