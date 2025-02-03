#!/usr/bin/env node

import { ChordProParser, FormatterSettings, HtmlFormatter } from './wrapper';
import fs from 'fs';
import path from 'path';

// Simplified CSS that works with HtmlFormatter's output
const defaultStyles = `
body {
    font-family: Arial, sans-serif;
    margin: 2em;
    line-height: 1.6;
}

.song-metadata {
    margin-bottom: 2em;
}

.song-content {
    white-space: pre-wrap;
}

.lyrics-line {
    position: relative;
    margin: 1.5em 0;
    min-height: 2em;
}

.word {
    display: inline-block;
    position: relative;
    margin-right: 0.3em;
}

.chord {
    position: absolute;
    top: -1.5em;
    color: #2040E0;
    font-weight: bold;
}

.chorus-section {
    margin-left: 2em;
    font-style: italic;
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
`;

function generateHTML(songContent: string, title: string): string {
    const parser = new ChordProParser();
    const settings = new FormatterSettings();
    settings.showMetadata = true;
    
    const formatter = new HtmlFormatter(settings);
    
    try {
        const song = parser.parse(songContent);
        const formattedContent = formatter.format(song).join('\n');
        
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
    } catch (error) {
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
        outputFile = path.join(
            path.dirname(inputFile),
            path.basename(inputFile, path.extname(inputFile)) + '.html'
        );
    }

    try {
        const songContent = fs.readFileSync(inputFile, 'utf-8');
        const title = path.basename(inputFile, path.extname(inputFile));
        const htmlContent = generateHTML(songContent, title);
        fs.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully converted ${inputFile} to ${outputFile}`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if ('code' in error && error.code === 'ENOENT') {
                console.error(`Error: Input file '${inputFile}' not found`);
            } else {
                console.error('Error:', error.message);
            }
        } else {
            console.error('An unknown error occurred');
        }
        process.exit(1);
    }
}

main();
