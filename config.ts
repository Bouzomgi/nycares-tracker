import { cleanEnv, str } from 'envalid'

const env = cleanEnv(process.env, {
  TO_EMAIL: str(),
  SOURCE_EMAIL: str(),
  DATABASE_TABLE_NAME: str(),
})

export default env
