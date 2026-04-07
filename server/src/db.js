import mongoose from 'mongoose'

export async function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Example: mongodb://127.0.0.1:27017/ecommerce',
    )
  }
  mongoose.set('strictQuery', true)
  const options = {}
  if (process.env.MONGODB_DB_NAME) {
    options.dbName = process.env.MONGODB_DB_NAME
  }
  await mongoose.connect(uri, options)
  return mongoose.connection
}

export function dbReady() {
  return mongoose.connection.readyState === 1
}
