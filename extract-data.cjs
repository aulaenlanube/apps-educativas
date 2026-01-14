const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\edtor\\Desktop\\apps-educativas\\src\\apps\\banco-recursos-tutoria\\BancoRecursosTutoria.jsx';
const content = fs.readFileSync(filePath, 'utf8');

// Use regex to extract the content between "const blocks = [" and "];"
// Note: This needs to handle nested arrays/objects.
// Simpler: find the start index of the array and the end index.

const startMarker = 'const blocks = [';
const startIndex = content.indexOf(startMarker) + 'const blocks = '.length;

// We need to find the matching closing bracket for the [ at startIndex
let bracketCount = 0;
let endIndex = -1;

for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '[') bracketCount++;
    if (content[i] === ']') bracketCount--;

    if (bracketCount === 0) {
        endIndex = i + 1;
        break;
    }
}

if (endIndex === -1) {
    console.error('Could not find end of blocks array');
    process.exit(1);
}

const blocksText = content.substring(startIndex, endIndex);

// Now we have a string that looks like an array in JS. 
// We can use eval (safely here since it's our own file) to get the object, then stringify.
// Or better, use a safer way if possible.
try {
    const blocks = eval(blocksText);
    const jsonPath = 'c:\\Users\\edtor\\Desktop\\apps-educativas\\public\\data\\tutoria.json';

    if (!fs.existsSync(path.dirname(jsonPath))) {
        fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    }

    fs.writeFileSync(jsonPath, JSON.stringify(blocks, null, 4), 'utf8');
    console.log('JSON saved successfully to ' + jsonPath);
} catch (e) {
    console.error('Error parsing blocks array:', e);
    process.exit(1);
}
