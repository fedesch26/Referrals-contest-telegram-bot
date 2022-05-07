const { database, bot, Composer, InlineKeyboard, Router } = require('../core');
const { bot_token, admin } = require('../core/config');
const composer = new Composer();
const router = new Router((ctx) => ctx.session.step);
const botdata = database('bot');
const allUsers = database('users');

composer.callbackQuery('users', async (ctx, next) => {
  const keys = new InlineKeyboard()
    .text('👨‍👩‍👧‍👦 Lista de usuarios', 'allusers')
    .text('🔝 Top 10 con mas referidos', 'top10refers')
    .row()
    .text('➕ Add/Remove Balance', 'addbalance')
    .text('✔ Set Balance', 'setbalance')
    .row()
    .text('🔙 Back To Panel', 'adminlogin');

  await ctx.editMessageText(
    '<b>Welcome To Users Settings, You Can Manage Your Users Here</b>',
    {
      reply_markup: keys,
      parse_mode: 'HTML',
    },
  );

  await next();
});

composer.callbackQuery('allusers', async (ctx, next) => {
  await getUserList(ctx);
  await next();
});

composer.callbackQuery(/nextpage [a-zA-Z]/, async (ctx, next) => {
  var users = await allUsers.find({});
  let match = ctx.match.input.split(' ');
  console.log(match);
  const line = '<b>---------------------------------------------</b>';
  let type = match[1];
  let f_1 = match[3] * 1;
  let f_next = match[2] * 1;
  let f = match[4] * 1;
  if (type == 'next') {
    let f_n = f_1 + f;
    let f_s_n = f_next + 1;
    let prev = f_1 - f;
    let prev2 = f_next - 1;
    let f_u = f + f_1;

    let dete = f_1 + 15;
    var star = users.slice(f_1, dete);
    if (f_next == '1') {
      var keys = new InlineKeyboard()
        .text('Page: [1]', 'allusers')
        .text('Next ▶', 'nextpage ' + 'next' + ' ' + '2' + ' ' + f + ' ' + f)
        .row()
        .text('🔙 Back To Panel', 'adminlogin');
    } else {
      if (users.length > dete) {
        var keys = new InlineKeyboard()
          .text(
            '◀ Previous',
            'nextpage ' + 'next' + ' ' + prev2 + ' ' + prev + ' ' + f,
          )
          .text(
            'Next ▶',
            'nextpage ' + 'next' + ' ' + f_s_n + ' ' + dete + ' ' + f,
          )
          .row()
          .text('🔙 Back To Panel', 'adminlogin');
      } else {
        var keys = new InlineKeyboard()
          .text(
            '🔙 Previous',
            'nextpage ' + 'next' + ' ' + prev2 + ' ' + prev + ' ' + f,
          )
          .row()
          .text('🔙 Back To Panel', 'adminlogin');
      }
    }
    if (users.length > 0) {
      msg = `Total Users: ${users.length} \n ${line}`;
      for (var i in star) {
        var user = star[i];
        var count = i * 1 + f_1 * 1 + 1;
        let value = f_1 * 1 + 15;
        if (count == value) {
          var nio = '⨽';
        } else {
          var nio = '⫦';
        }
        msg += `\n<b>${count}</b> ${nio} <code>${user.id}</code> <a href="t.me/${ctx.me.username}?start=userinfo_${user.id}">INFO</a> | <a href="tg://user?id=${user.id}">${user.first_name}</a>`;
      }
    } else {
      msg = 'No User Found';
    }
    ctx.editMessageText(msg, {
      reply_markup: keys,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  }
  await next();
});

composer.callbackQuery('addbalance', async (ctx, next) => {
  var text =
    `👮‍♂️ <b>Hey Admin Welcome to the Balance Panel</b>\n` +
    `\n<i>In This Section You Can Manage Your Users Balance Here</i>\n\n` +
    `<b>How To Use:</b>\n` +
    `-<i> To Add/Remove Balance for a User 👤 send his Telegram id Then the amount</i>\n` +
    `-<i> To Add/Remove Balance For All Users 👨‍👩‍👧‍👦 Send @all then the Amount</i>\n` +
    `-<i> To Add Balance For Random Users 👨‍👩‍👧‍👦 Send @random then the Amount</i>\n\n` +
    `<b>⛔ Note:</b>\n` +
    `<i>- To add an amount send plus then amount like +5(add 5 to balance)</i>` +
    `<i>- To remove an amount send minus then amount like -5(remove 5 from balance) </i>\n` +
    `<i>- You Cant Remove balance from random users using @random</i>`;
  ctx.editMessageText(text, { parse_mode: 'HTML' });

  ctx.session.step = 'adddbal';
  await next();
});

composer.callbackQuery('setbalance', async (ctx, next) => {
  var text =
    `👮‍♂️ <b>Hey Admin Welcome to the Balance Panel</b>\n` +
    `\n<i>In This Section You Can Manage Your Users Balance Here</i>\n\n` +
    `<b>How To Use:</b>\n` +
    `-<i> To Set Balance for a User 👤 send his Telegram id Then the amount</i>\n` +
    `-<i> To Set Balance For All Users 👨‍👩‍👧‍👦 Send @all then the Amount</i>\n\n` +
    `<b>⛔ Note:</b>\n` +
    `<i>- Don't add + or - to the amount you want to set </i>`;
  ctx.editMessageText(text, { parse_mode: 'HTML' });

  ctx.session.step = 'settbal';
  await next();
});

composer.callbackQuery('top10refers', async (ctx, next) => {
  var msg = '<b>🔝 Top 10 Highest Referrals</b>\n\n';
  let users = await allUsers.find({});

  users.sort(doSort);
  var result = [];

  for (var i = 0; i < 10; i++) {
    let item = users[i];

    if (!item[i]) {
      break;
    }

    result.push(item);
  }

  for (var i = 0; i < 10; i++) {
    let u = users[i];
    if (!u) {
      break;
    }
    if (u.total_invited > 0) {
      let id = i * 1 + 1;
      let fullname = formatFullname(u.first_name, u.last_name);
      msg += `${id}. ${fullname} - ${u.total_invited}\n`;
    }
  }

  await ctx.editMessageText(msg, {
    reply_markup: new InlineKeyboard().text('🔙 Back To Panel', 'adminlogin'),
    parse_mode: 'html',
  });

  await next();
});

router.route('adddbal', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  ctx.session.target = msg;
  await ctx.reply('Send Me The Amount You Want to Add for ' + msg);
  ctx.session.step = 'addbal';
});

router.route('settbal', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  ctx.session.target = msg;
  await ctx.reply('Send Me The Amount You Want to Set for ' + msg);
  ctx.session.step = 'setbal';
});

router.route('setbal', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  const target = ctx.session.target;
  let amount = msg * 1;
  var button = new InlineKeyboard().text('🔙 Back To Panel', 'adminlogin');
  if ((msg == 'cancel') | (msg == 'Cancel')) {
    ctx.session.step = 'idle';
    return ctx.reply('Operation Cancelled', { reply_markup: button });
  } else {
    if (isNumeric(amount)) {
      if (target == '@all') {
        await ctx.reply(
          '✅ Executing Operation this might take some time\n\n<b>Operation:</b> <i>Setting ' +
            amount +
            ' as everyone balance</i>',
          { reply_markup: button, parse_mode: 'HTML' },
        );
        ctx.session.step = 'idle';
        await allUsers.updateMany({}, { $set: { balance: amount } });
      } else if (isNUmeric(target)) {
        await ctx.reply(
          '✅ Executing Operation this might take some time\n\n<b>Operation:</b> <i>Setting ' +
            amount +
            ' as ' +
            target +
            ' balance</i>',
          { reply_markup: button, parse_mode: 'HTML' },
        );
        ctx.session.step = 'idle';
        await allUsers.updateOne({ id: target }, { $set: { balance: amount } });
      }
    } else {
      await ctx.reply('This Not A Number, Try Agin With A Number!');
      ctx.session.step = 'settbal';
    }
  }
});

router.route('addbal', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  var new_msg = msg.substring(1);
  let amount = new_msg * 1;
  const users = await allUsers.find({});
  var button = new InlineKeyboard().text('🔙 Back To Panel', 'adminlogin');
  if ((msg == 'cancel') | (msg == 'Cancel')) {
    await ctx.reply('Operation Cancelled', { reply_markup: button });
    ctx.session.step = 'idle';
  } else {
    if (isNumeric(amount)) {
      const target = ctx.session.target;
      if (msg.charAt(0) == '+') {
        if (target == '@all') {
          await ctx.reply(
            '✅ Executing Operation this might take some time\n\n<b>Operation:</b> <i>Adding ' +
              amount +
              ' to everyone balance</i>',
            { reply_markup: button, parse_mode: 'HTML' },
          );
          ctx.session.step = 'idle';
          await allUsers.updateMany({}, { $inc: { balance: amount } });
        } else if (target == '@random') {
          let count = await allUsers.countDocuments({});
          let limit = rndInt(1, 20);
          let skipRecords = rndAbt(1, count - limit);
          await ctx.reply(
            '✅ Executing Operation this might take some time\n\n<b>Operation:</b> <i>Adding ' +
              amount +
              ' to ' +
              limit +
              ' random users balance</i>',
            { reply_markup: button, parse_mode: 'HTML' },
          );
          ctx.session.step = 'idle';
          users.skip(skipRecords);
          users.exec(async function (err, results) {
            for (var i in results) {
              let result = results[i];
              await allUsers.updateOne(
                { id: result.id },
                { $inc: { balance: amount } },
              );
            }
          });
        } else {
          await ctx.reply(
            '✅ Executing Operation this might take some time\n\n<b>Operation:</b> <i>Adding ' +
              amount +
              ' to ' +
              target +
              ' balance</i>',
            { reply_markup: button, parse_mode: 'HTML' },
          );
          ctx.session.step = 'idle';
          await allUsers.updateOne(
            { id: target },
            { $inc: { balance: amount } },
          );
        }
      } else if (msg.charAt(0) == '-') {
        if (target == '@all') {
          await ctx.reply(
            '✅ Executing Operation this might take some time\n\n<b>Operation:</b> <i>Removing ' +
              amount +
              ' from everyone balance</i>',
            { reply_markup: button, parse_mode: 'HTML' },
          );
          ctx.session.step = 'idle';
          await allUsers.updateMany({}, { $inc: { balance: -amount } });
        } else if (target == '@random') {
          await ctx.reply('You cant remove balance from random users', {
            reply_markup: button,
          });
          ctx.session.step = 'idle';
        } else {
          await ctx.reply(
            '✅ Executing Operation this might take some time\n\n<b>Operation:</b> <i> Removing ' +
              amount +
              ' from ' +
              target +
              ' balance</i>',
            { reply_markup: button, parse_mode: 'HTML' },
          );
          ctx.session.step = 'idle';

          await allUsers.updateOne(
            { id: target },
            { $inc: { balance: amount } },
          );
        }
      } else {
        ctx.reply('Invalid syntax');
        ctx.session.step = 'idle';
      }
    } else {
      ctx.reply('This Not A Number, Send A Number');
      ctx.session.step = 'adddbal';
    }
  }
});

bot.use(router);
bot.use(composer);

async function getUserList(ctx) {
  const users = await allUsers.find({});
  const line = '<b>---------------------------------------------</b>';
  let f = 15;
  let sliced = users.slice(0, f);
  if (users.length > f) {
    var keys = new InlineKeyboard()
      .text('Page: [1]', 'allusers')
      .text('Next ▶', 'nextpage ' + 'next' + ' ' + '2' + ' ' + f + ' ' + f)
      .row()
      .text('🔙 Back To Panel', 'adminlogin');
  } else {
    keys = new InlineKeyboard().text('🔙 Back To Panel', 'adminlogin');
  }

  let msg;
  if (users.length > 0) {
    msg = `Total Users: ${users.length} \n ${line}`;
    for (var i in sliced) {
      var user = sliced[i];
      var count = i * 1 + 1;
      if (count < 10) {
        var gh = '0' + count;
      } else {
        var gh = count;
      }
      if (count == f) {
        var ghk = '⨽';
      } else {
        var ghk = '⫦';
      }
      msg += `\n<b>${gh}</b> ${ghk} <code>${user.id}</code> <a href="t.me/${ctx.me.username}?start=userinfo_${user.id}">INFO</a> | <a href="tg://user?id=${user.id}">${user.first_name}</a>`;
    }
  } else {
    msg = 'No user Found';
  }
  try {
    await ctx.editMessageText(msg, {
      reply_markup: keys,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } catch (err) {
    if (err.message.includes('Message is not modified')) {
      ctx.answerCallbackQuery('✅ Updated', true);
    }
  }
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function rndAbt(min, max) {
  return Math.ceil(Math.random() * (max - min + 1) + min);
}

function rndFloat(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function rndInt(min, max) {
  return Math.floor(rndFloat(min, max));
}

function formatFullname(first, last) {
  if (!last) {
    return first;
  } else {
    return first + ' ' + last;
  }
}

function doSort(a, b) {
  if (a.total_invited > b.total_invited) return -1;
  if (a.total_invited < b.total_invited) return 1;
}
