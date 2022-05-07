const {
  Bot,
  Keyboard,
  session,
  Composer,
  GrammyError,
  HttpError,
  BotError,
  InlineKeyboard,
} = require('grammy');
const { Router } = require('@grammyjs/router');
const { start } = require('./middleware');
const { bot_token } = require('./config');
const bot = new Bot(bot_token);

bot.use(session({ initial: () => ({ step: 'idle' }) }));

bot.catch(async (err) => {
  const ctx = err.ctx;
  const e = err.error;
  if (e instanceof GrammyError) {
    console.log('Error in Request: ' + e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact telegram:', e);
  } else if (e instanceof BotError) {
    console.error('Something Happened', e);
  } else {
    console.error('New Error: ', e);
  }
});

start(bot);

module.exports = { bot, Keyboard, Router, Composer, InlineKeyboard };
