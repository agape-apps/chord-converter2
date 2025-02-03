"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlFormatter = exports.FormatterSettings = exports.ChordProParser = void 0;
// src/wrapper.ts
const global_registrator_1 = require("@happy-dom/global-registrator");
global_registrator_1.GlobalRegistrator.register();
const chordprojectParser = require('chordproject-parser');
exports.ChordProParser = chordprojectParser.ChordProParser;
exports.FormatterSettings = chordprojectParser.FormatterSettings;
exports.HtmlFormatter = chordprojectParser.HtmlFormatter;
