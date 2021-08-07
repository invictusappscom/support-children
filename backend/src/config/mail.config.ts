import { CONFIG } from './index';

const { EMAIL_USER, EMAIL_PASS } = CONFIG;

export const MAIL_OPTS = {
    user: EMAIL_USER,
    pass: EMAIL_PASS
}