const fs = require('fs');
const path = require('path');

// Function to get all files in a directory recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

// Function to compare the contents of two files
function compareFiles(file1, file2) {
  const file1Contents = fs.readFileSync(file1, 'utf8');
  const file2Contents = fs.readFileSync(file2, 'utf8');
  return file1Contents === file2Contents;
}

let result = true;

// Function to compare files and folders between two directories
function compareDirectories(dir1, dir2) {
  const dir1Files = getAllFiles(dir1).map((file) => file.replace(dir1, ''));
  const dir2Files = getAllFiles(dir2).map((file) => file.replace(dir2, ''));

  const allFiles = new Set([...dir1Files, ...dir2Files]);

  allFiles.forEach((file) => {
    const filePath1 = path.join(dir1, file);
    const filePath2 = path.join(dir2, file);

    if (fs.existsSync(filePath1) && fs.existsSync(filePath2)) {
      if (
        fs.statSync(filePath1).isDirectory() &&
        fs.statSync(filePath2).isDirectory()
      ) {
        // Both are directories, compare their contents recursively
        compareDirectories(filePath1, filePath2);
      } else if (!compareFiles(filePath1, filePath2)) {
        console.log(`Difference found in file: ${file}`);
      }
    } else {
      console.log(
        `File or directory exists only in one of the directories: ${file}`
      );
      result = false;
    }
  });

  console.log('Comparison completed.');
}

// Replace these with the actual paths to your directories
const dir1 = path.resolve('lib/templates');
const dir2 = path.resolve('src/templates');

compareDirectories(dir1, dir2);
if (!result) {
  process.exit(1);
}
