import dotenv from 'dotenv';
dotenv.config();

class Config {
  get port() {
    return process.env.PORT ? parseInt(process.env.PORT) : 25730;
  }

  get selfUrl() {
    return process.env.SELF_URL ?? 'http://localhost:25730';
  }

  get ntpUrl() {
    return process.env.NTP_URL ?? 'ntp://pool.ntp.org';
  }

  get mongoUrl() {
    return process.env.MONGO_URL ?? 'mongodb://localhost:27017';
  }

  get dbName() {
    return process.env.DB_NAME ?? 'laochan-eacnet';
  }

  get isDev() {
    return process.env.NODE_ENV !== 'production';
  }
}

export const config = new Config();
export default config;
