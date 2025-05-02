import 'dotenv/config';

export const SECRET_KEY = 'OLRDevByIRC'
export const keyS3 = {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_END_POINT,
};
