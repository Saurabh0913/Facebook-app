const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
main().catch(err => console.log(err));

async function main() {
  let conn =  await mongoose.connect(process.env.MONGO_URL);
  console.log(`Yup ! MongoDB connected Successfully: ${conn.connection.host}`);
}
