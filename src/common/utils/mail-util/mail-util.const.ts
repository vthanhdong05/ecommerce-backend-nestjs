export enum MailTemplate {
  RESET_PASSWORD = 'reset-password',
  WELCOME = 'welcome',
}

export enum MailConfig {
  TEMPLATES_PATH = '/templates/mails',
  MAIL_DEFAULT = 'vodong0506@gmail.com',
  MAIL_NAME_DEFAULT = 'VTDhub',
}

export enum MailEnvs {
  MAIL_INCOMING_USER = 'MAIL_INCOMING_USER',
  MAIL_INCOMING_PASS = 'MAIL_INCOMING_PASS',
  MAIL_HOST = 'MAIL_HOST',
  MAIL_PORT = 'MAIL_PORT',
}
