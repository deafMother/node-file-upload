const fs = require('fs');
const superagent = require('superagent');

// promisify  readfile  function
const readFilePro = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) {
        reject('File not found');
      }
      resolve(data);
    });
  });
};

// prosify write file
const writeFile = data => {
  return new Promise((resolve, reject) => {
    fs.writeFile('dog-image.txt', data, err => {
      if (err) {
        reject('Uable to write to file');
      }
      resolve('file created successfully');
    });
  });
};

//  promise chaning
/*
readFilePro(__dirname + '/dog.txt')
  .then(result => {
    return superagent.get(`https://dog.ceo/api/breed/${result}/images/random`);
  })
  .then(res => {
    return writeFile(res.body.message);
  })
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err.message);
  });
*/

// asyns await
const getDogPic = async () => {
  try {
    let data = await readFilePro(__dirname + '/dog.txt');
    console.log(data);
    data = await superagent.get(
      `https://dog.ceo/api/breed/${data}/images/random`
    );
    const result = await writeFile(data.body.message);
    console.log(result);
  } catch (error) {
    console.log(error.message);
    throw err; // this will be cougth by the function below
  }

  return '2: fetching done';
};

console.log('1: Calling Dog');
getDogPic()
  .then(x => {
    console.log(x);
    console.log('3: Done !!');
  })
  .catch(err => {
    console.log('Something went wrong');
  });

//  a is a function that returns a promis then we can return it and use a then instead of chaining a then to the end of it
