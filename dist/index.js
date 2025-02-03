#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = require("./wrapper");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Load CSS from external file
const cssPath = path_1.default.join(__dirname, 'styles.css');
const defaultStyles = fs_1.default.readFileSync(cssPath, 'utf8');
function generateHTML(songContent, title) {
    const parser = new wrapper_1.ChordProParser();
    const settings = new wrapper_1.FormatterSettings();
    settings.showMetadata = true;
    const formatter = new wrapper_1.HtmlFormatter(settings);
    try {
        const song = parser.parse(songContent);
        const formattedOutput = formatter.format(song);
        // Debug mode: Uncomment to print unmodified formatter output
        // console.log('Debug: Unmodified HtmlFormatter output:', formattedOutput);
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
