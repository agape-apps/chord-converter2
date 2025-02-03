#!/usr/bin/env node

import { ChordProParser, FormatterSettings, HtmlFormatter } from './wrapper';
import fs from 'fs';
import path from 'path';

// Simplified CSS that works with HtmlFormatter's output
// Claude AI generated
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

// Lyrics line margin determines space to next chord
.lyrics-line {
    position: relative;
    margin: 0.3em 0;
    min-height: 2em;
}

.word {
    display: inline-block;
    position: relative;
    margin-right: 0.3em;
}

// Chord position relative to lyrics line
.chord {
    position: absolute;
    top: -1.1em;
    color: #2040E0;
    font-weight: bold;
}

// .chorus-section {
//     margin-left: 2em;
//     font-style: italic;
// }

.title-metadata {
    font-size: 1.8em;
    margin: 0.5em 0;
}

.subtitle-metadata {
    font-size: 1.2em;
    color: #666;
    margin: 0.5em 0;
}

// Based on the original CSS from chordproject-parser developer 
// https://github.com/chordproject/chordproject-parser/blob/main/src/formatter/html.ts

// .lyrics-line {
//     display: flex;
//     align-items: flex-end;
//     flex-wrap: wrap;
// }

.chord-lyrics {
    display: flex;
    flex-direction: column;
    align-items: left;
}

.above-lyrics {
    padding-right: 0.3em;
}

// .chord {
//     font-weight: bold;
// }

.chord-lyrics:last-child .chord {
    padding-right: 0;
}

// .word {
//     display: flex;
//     flex-direction: row;
//     align-items: flex-end;
//     margin-right: 0.33em;
// }

// .empty-line {
//     margin-top: 1.5em;
// }

.chorus-section {
    font-weight: bold;
    border-left: 2px black solid;
    padding-left: 1em;
}

.tab-section {
    font-family: monospace;
}


// Based on the CSS from 
// https://github.com/tragram/domcikuv-zpevnik-v2/blob/4ec332fb7137c85cff47173ae20aa0061617374f/src/routes/SongView/SongView.css 


/* ### actual song ### */
/* chorus settings */
.chorus {
    font-weight: 700;
}

.chorus-section {
    font-weight: bold;
    border-left: solid 3px;
    //border-color: hsl(var(--primary));
    padding-left: 1em;
}

/* chord settings */

// .above-lyrics {
//     /* padding-right: 0.3em; */
// }

// .chord {
//     color: hsl(var(--primary));
//     font-weight: 800;
//     /* text-shadow: 1px 1px 2px #000000; */
// }

// .repeated-chords-hidden .repeated-chords .chord {
//     display: none;
// }

.chord:empty {
    /* hide rows without chords */
    display: none;
}

.chords-hidden .chord {
    display: none;
}

.chords-hidden .tab-section {
    display: none;
}

.chord-lyrics {
    display: flex;
    flex-direction: column;
    align-items: left;
}

.force-shown {
    display: inline !important;
}

.chords-hidden .force-shown {
    display: none !important;
}

/* chords-inline mode */
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


/* layout */
#auto-text-size-wrapper>div {
    justify-content: safe center;
    /* Allows vertical scrolling but blocks zoom */
    /* touch-action: pan-y; */
    max-width: 100%;
    font-weight: 600;
}

#actual-contents {
    max-width: 100%;
}

.comment-line {
    line-height: normal;
}

.song-content {
    line-height: 1.1;
    white-space: nowrap;
    display: flex;
    flex-direction: column;
}

.song-content>.section+.section {
    margin-top: 1.5em;
}

/* Remove margin-top when chords are hidden */
.chords-hidden .song-content>.section:not(.tab-section)+.tab-section,
.chords-hidden .song-content>.tab-section+.section {
    margin-top: 0;
}

/* Restore margin when sections aren't adjacent and there's a hidden section between */
.chords-hidden .song-content>.section:not(.tab-section)~.section:not(.tab-section) {
    margin-top: 1.5em;
}

.song-content>.comment-line {
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
    /* width: fit-content;*/
    max-width: 100%; 
}

.lyrics-line {
    display: flex;
    align-items: flex-end;
    flex-wrap: nowrap;
    max-width: 100%;
}

.fit-screen-none .lyrics-line {
    flex-wrap: wrap;
}


.section-title {
    display: none;
}

.word {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    margin-right: 0.33em;
    /*border: 1px solid red;*/
}

/* this class is added when user toggles the two-column layout */
.song-content-columns>* {
    columns: 2;
    @apply gap-4 sm:gap-8 lg:gap-16;
}

/* misc */
.song-content .literal, .song-content .tab-section {
    color: hsl(var("--text-foreground"));
    font-family: monospace;
    font-size: 0.9em;
    scrollbar-width: none;
}

.repetition-count {
    color:hsl(var(--primary));
    /* font-size: 0.8em; */
}

.repetition-count + .word{
    color:hsl(var(--primary));
    /* font-size: 0.8em; */
}

.section-title + .lyrics-line>.word:first-child {
    color: hsl(var(--primary));
    /* font-size: 0.8em; */
}

/* autosizing of tabs and comments */
#dummy-contents .comment-line, #dummy-contents .tab-section {
    width: 0;
}

.comment-line, .tab-section {
    overflow-x: auto;
    overflow-y: clip;
    max-width: 100%;

}

/* make subscript appear under superscript */
.sub-sup-container {
    /* display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: middle; */
    position: relative;
}

.sub-sup-container sup+sub {
    margin-left: -0.6em;
    top: 0.5em;
}

// .chord sup {
//     /* margin-right: -0.1em; */
// }

.empty-line {
    height: 0.75em;
}

.empty-line+.empty-line {
    display: none;
}

.repetition {
    color: hsl(var(--primary));
    /* font-size:larger; */
    font-weight: 100;
}

.fullscreen #inner-background-image {
    display: block;
}
`;

function generateHTML(songContent: string, title: string): string {
    const parser = new ChordProParser();
    const settings = new FormatterSettings();
    settings.showMetadata = true;
    
    const formatter = new HtmlFormatter(settings);
    
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
