import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  clientPromise ||= new MongoClient(uri).connect();
  return clientPromise;
}

export async function getAppDb() {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB || "resonance_genesis");
}
