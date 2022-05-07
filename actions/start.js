const { bot, database, Router, Composer } = require('../core/index');
const users = database('users');
const botdb = database('bot');
const composer = new Composer();
const { steps, viewuser } = require('../generators.js/index');
const { bot_token, admin } = require('../core/config');
const regex = /[a-zA-Z]+_[0-9]/;
composer.command('start', async (ctx, next) => {
  if (ctx.match) {
    if (regex.test(ctx.match)) {
      let userp = ctx.match.split('_')[1];
      await viewuser(ctx, userp);
      return;
    }
  }
  let botdata = await botdb.findOne({ id: bot_token });
  ctx.session.step = 'idle';
  if (!botdata) {
    await botdb.create({
      id: bot_token,
      admin: [admin],
    });
  }
  if (ctx.chat.type !== 'private') {
    await ctx.leaveChat();
  } else {
    let user = await users.findOne({ id: ctx.from.id });
    console.log(user);
    if (user) {
      await steps(ctx);
    } else {
      if (ctx.match) {
        if (regex.test(ctx.match)) {
          let userp = ctx.match.split('_')[1];
          await viewuser(ctx, userp);
          return;
        } else {
          if (ctx.match != ctx.from.id) {
            await users.create({
              id: ctx.from.id,
              first_name: ctx.from.first_name,
              last_name: ctx.from.last_name,
              username: ctx.from.username,
              refferal_id: ctx.match,
            });
            await users.updateOne(
              { id: ctx.match },
              {
                $push: { pending_ref_users: ctx.from.id },
                $inc: { pending_refs: 1 },
              },
            );
          }
        }
        await steps(ctx);
      } else {
        await users.create({
          id: ctx.from.id,
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name,
          username: ctx.from.username,
        });
        await steps(ctx);
      }
    }
    await ctx.deleteMessage();
  }
  await next();
});

composer.callbackQuery('delete', async (ctx, next) => {
  await ctx.deleteMessage();
  await next();
});

bot.use(composer);
