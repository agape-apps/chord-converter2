#!/usr/bin/env node

import { ChordProParser, FormatterSettings, HtmlFormatter } from './wrapper';
import fs from 'fs';
import path from 'path';

// Load CSS from external file
const cssPath = path.join(__dirname, 'styles.css');
const defaultStyles = fs.readFileSync(cssPath, 'utf8');

function generateHTML(songContent: string, title: string): string {
    const parser = new ChordProParser();
    const settings = new FormatterSettings();
    settings.showMetadata = true;
    
    const formatter = new HtmlFormatter(settings);
    
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

