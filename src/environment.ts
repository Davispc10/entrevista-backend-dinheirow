require('dotenv').config()

export const Environment = {
    port: process.env.PORT || '3000',
    db_type: process.env.DB_TYPE,
}
