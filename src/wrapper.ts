// src/wrapper.ts
import { GlobalRegistrator } from '@happy-dom/global-registrator';
GlobalRegistrator.register();

const chordprojectParser = require('chordproject-parser');

export const ChordProParser = chordprojectParser.ChordProParser;
export const FormatterSettings = chordprojectParser.FormatterSettings;
export const HtmlFormatter = chordprojectParser.HtmlFormatter;
