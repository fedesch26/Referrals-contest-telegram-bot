const { twitter } = require('../libs');
const {
  bot,
  database,
  Router,
  Composer,
  InlineKeyboard,
} = require('../core/index');
const users = database('users');
const botdb = database('bot');
const composer = new Composer();
const { steps } = require('../generators.js/index');
const router = new Router((ctx) => ctx.session.step);
const { check_tasks } = twitter;
composer.callbackQuery('letmove', async (ctx, next) => {
  const user = await users.findOne({ id: ctx.from.id });
  const { is_verified, user_step } = user;
  if (user_step == 'twitter task') {
    let { twitter_id } = await users.findOne({ id: ctx.from.id });
    let { status, message } = await check_tasks(twitter_id);
    if (status) {
      ctx.session.twitter = 'Done';
      await users.updateOne(
        { id: ctx.from.id },
        { $set: { user_step: 'bind_wallet', do_twitter: true } },
      );
      await ctx.deleteMessage();
      await steps(ctx);
    } else {
      await ctx.answerCallbackQuery({ text: message, show_alert: true });
    }
  } else {
    await steps(ctx);
  }
  await next();
});

bot.use(composer);
