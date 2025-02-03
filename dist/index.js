#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = require("./wrapper");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Simplified CSS that works with HtmlFormatter's output
const defaultStyles = `
/* Base page styling */
body {
    font-family: Arial, sans-serif;
    margin: 2em;
    line-height: 1.6;
}

.song-metadata {
    margin-bottom: 2em;
}

/* Consolidated duplicate .song-content rules 
   (merged from a definition with white-space: pre-wrap and another with line-height, white-space: nowrap, display and flex-direction) */
.song-content {
    white-space: pre-wrap;  /* From first definition */
    line-height: 1.1;        /* From second definition */
    white-space: nowrap;     /* From second definition (overrides pre-wrap) */
    display: flex;
    flex-direction: column;
}

/* Consolidated duplicate .lyrics-line rules 
   (merged properties from both definitions) */
.lyrics-line {
    position: relative;
    margin: 0.3em 0;
    min-height: 2em;
    display: flex;
    align-items: flex-end;
    flex-wrap: nowrap;
    max-width: 100%;
}

/* Consolidated duplicate .word rules 
   (merging inline-block/relative from first with flex settings from second) */
.word {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    position: relative;
    margin-right: 0.33em;
}

/* Single definition for .chord */
.chord {
    position: absolute;
    top: -1.1em;
    color: #2040E0;
    font-weight: bold;
}

.title-metadata {
    font-size: 1.8em;
    margin: 0.5em 0;
}

.subtitle-metadata {
    font-size: 1.2em;
    color: #666;
    margin: 0.5em 0;
}

/* Consolidated duplicate .chord-lyrics rules */
.chord-lyrics {
    display: flex;
    flex-direction: column;
    align-items: left;
}

.above-lyrics {
    padding-right: 0.3em;
}

/* Consolidated duplicate .chorus-section rules 
   (choosing the second definition's properties) */
.chorus-section {
    font-weight: bold;
    border-left: solid 3px;
    border-color: hsl(var(--primary));
    padding-left: 1em;
}

.tab-section {
    font-family: monospace;
}

.chorus {
    font-weight: 700;
}

.repeated-chords-hidden .repeated-chords .chord {
    display: none;
}

.chord:empty {
    display: none;
}

.chords-hidden .chord {
    display: none;
}

.chords-hidden .tab-section {
    display: none;
}

.force-shown {
    display: inline !important;
}

.chords-hidden .force-shown {
    display: none !important;
}

.chords-inline .chord-lyrics {
    flex-direction: row;
}

.chords-inline .chord {
    margin-bottom: 0.5em;
    font-size: 1em;
}

.chords-inline .lyrics {
    align-content: end;
}

.comment-line {
    line-height: normal;
}

/* Layout rules for song-content child elements */
.song-content > .section + .section {
    margin-top: 1.5em;
}

.chords-hidden .song-content > .section:not(.tab-section) + .tab-section,
.chords-hidden .song-content > .tab-section + .section {
    margin-top: 0;
}

.chords-hidden .song-content > .section:not(.tab-section) ~ .section:not(.tab-section) {
    margin-top: 1.5em;
}

.song-content > .comment-line {
    margin-top: 1em;
    margin-bottom: 1em;
    font-style: italic;
    color: hsl(var(--primary));
    opacity: 80%;
}

.section {
    display: flex;
    flex-direction: column;
    gap: 0.1em;
    break-inside: avoid-column;
    width: fit-content;
    max-width: 100%; 
}

/* Consolidated duplicate rules for .song-content .literal and .song-content .tab-section */
.song-content .literal,
.song-content .tab-section {
    color: hsl(var(--text-foreground));
    font-family: monospace;
    font-size: 0.9em;
    scrollbar-width: none;
}

.repetition-count {
    color: hsl(var(--primary));
}

.repetition-count + .word {
    color: hsl(var(--primary));
}

/* Autosizing settings for tabs and comment lines */
.comment-line,
.tab-section {
    overflow-x: auto;
    overflow-y: clip;
    max-width: 100%;
}

.empty-line {
    height: 0.75em;
}

.empty-line + .empty-line {
    display: none;
}

.repetition {
    color: hsl(var(--primary));
    font-weight: 100;
}
`;
function generateHTML(songContent, title) {
    const parser = new wrapper_1.ChordProParser();
    const settings = new wrapper_1.FormatterSettings();
    settings.showMetadata = true;
    const formatter = new wrapper_1.HtmlFormatter(settings);
    try {
        const song = parser.parse(songContent);
        const formattedOutput = formatter.format(song);
        //console.log('Debug: Unmodified HtmlFormatter output:', formattedOutput);
        // Join without newlines to avoid unwanted line breaks in the rendered HTML.
        const formattedContent = formattedOutput.join('');
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${defaultStyles}
    </style>
</head>
<body>
    ${formattedContent}
</body>
</html>`;
    }
    catch (error) {
        console.error('Error parsing ChordPro file:', error);
        process.exit(1);
    }
}
function main() {
    // Check arguments
    if (process.argv.length < 3) {
        console.log('Usage: chordpro-to-html <input-file> [output-file]');
        console.log('Converts a ChordPro formatted text file to HTML');
        console.log('\nOptions:');
        console.log('  input-file   Path to the input ChordPro file');
        console.log('  output-file  Path to the output HTML file (optional)');
        console.log('              If not specified, will use input filename with .html extension');
        process.exit(1);
    }
    const inputFile = process.argv[2];
    let outputFile = process.argv[3];
    if (!outputFile) {
        outputFile = path_1.default.join(path_1.default.dirname(inputFile), path_1.default.basename(inputFile, path_1.default.extname(inputFile)) + '.html');
    }
    try {
        const songContent = fs_1.default.readFileSync(inputFile, 'utf-8');
        const title = path_1.default.basename(inputFile, path_1.default.extname(inputFile));
        const htmlContent = generateHTML(songContent, title);
        fs_1.default.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully converted ${inputFile} to ${outputFile}`);
    }
    catch (error) {
        if (error instanceof Error) {
            if ('code' in error && error.code === 'ENOENT') {
                console.error(`Error: Input file '${inputFile}' not found`);
            }
            else {
                console.error('Error:', error.message);
            }
        }
        else {
            console.error('An unknown error occurred');
        }
        process.exit(1);
    }
}
main();
