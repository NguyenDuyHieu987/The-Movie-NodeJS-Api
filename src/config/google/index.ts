import { google } from 'googleapis';

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH2_CLIENT_ID,
  process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
  (process.env.NODE_ENV == 'production'
    ? process.env.CLIENT_URL!
    : process.env.CLIENT_DEV_URL) + '/oauth/google'
);
