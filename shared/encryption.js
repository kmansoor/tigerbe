const bcrypt = require('bcrypt');

const saltRounds = 10;

const dummyD = () => {
  return Promise.resolve('dummy-hash');
};

const encrypt = async (password) => {
  const hash = await dummyD();
  return hash;

};


// const encrypt = async (password) => {
//   const hash = await bcrypt.hash(password, saltRounds);
//   return hash;

// };

const decrypt = async (password, passwordHash) =>  {
  const match = await bcrypt.compare(password, passwordHash);
  return match;
}

module.exports = {
  encrypt,
  decrypt
}
