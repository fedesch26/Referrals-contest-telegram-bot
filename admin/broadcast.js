const {
  database,
  bot,
  Composer,
  InlineKeyboard,
  Broadcaster,
  Router,
} = require('../core');
const router = new Router((ctx) => ctx.session.step);
const { bot_token, admin } = require('../core/config');
//const { formatPercentToText } = require('../libs');
const composer = new Composer();
const botdata = database('bot');
const users = database('users');
const broadcaster = new Broadcaster(bot);
var button = new InlineKeyboard()
  .text('📢 Broadcast Message', 'broadmsg')
  .row()
  .text('🔙 Return To Panel', 'adminlogin');

var button2 = new InlineKeyboard()
  .text('▶ Start Broadcast', 'startbroadcast')
  .text('⏏ Cancel Broadcast', 'cancelbroad')
  .row()
  .text('🔙 Return To Panel', 'adminlogin');

var button3 = new InlineKeyboard()
  .text('⏸ Pause Broadcast', 'pbroadcast')
  .text('⏏ Cancel Broadcast', 'cancelbroad')
  .row()
  .text('🔙 Return To Panel', 'adminlogin');

var button4 = new InlineKeyboard().text('Return To Panel', 'adminlogin');

composer.callbackQuery('broadcast', async (ctx, next) => {
  let botdb = await botdata.findOne({ id: bot_token });
  var status = botdb.broadcast_status;
  console.log(status);
  let totalUsers = await users.find({}).countDocuments();
  const { failedCount, completedCount, waitingCount } =
    await broadcaster.status();
  const percentage = (completedCount / totalUsers) * 100;
  var percentText = formatPercentToText(percentage);
  const text =
    `📊 <b>Broadcast Information</b>\n\n` +
    `<b>Info:</b> <code>Broadcast Is ${status}</code>\n\n` +
    `<b>Total Users:</b> ${totalUsers}\n` +
    `<b>Total Sent:</b> ${completedCount}\n` +
    `<b>Total Pending:</b> ${waitingCount}\n` +
    `<b>Total Failed: </b>${failedCount}\n\n` +
    `<b>Status: ${percentText}</b>\n` +
    `<b>Progress:</b> ${percentage}%`;
  if (status == 'Inactive') {
    await ctx.editMessageText(
      '*👮‍♂️ Welcome To the Broadcasting Section*\n\n*Click Broadcast Message To Broadcast*',
      { reply_markup: button, parse_mode: 'markdown' },
    );
  } else if (status == 'Active') {
    await ctx.editMessageText(text, {
      reply_markup: button3,
      parse_mode: 'HTML',
    });
  } else if (status == 'Paused') {
    await ctx.editMessageText(text, {
      reply_markup: button2,
      parse_mode: 'HTML',
    });
  }

  await next();
});

composer.callbackQuery('cancelbroad', async (ctx, next) => {
  let totalUsers = await users.find({}).countDocuments();
  const { failedCount, completedCount, waitingCount } =
    await broadcaster.status();
  const percentage = (completedCount / totalUsers) * 100;
  const percentText = formatPercentToText(percentage);
  const text =
    `<b>⛔ Broadcasting Is been terminated</b>\n\n` +
    `<b>Info:</b> <code>Broadcast Is Terminated</code>\n\n` +
    `<b>Total Users:</b> ${totalUsers}\n` +
    `<b>Total Sent:</b> ${completedCount}\n` +
    `<b>Total Pending:</b> ${waitingCount}\n` +
    `<b>Total Failed: </b>${failedCount}\n\n` +
    `<b>Status: ${percentText}</b>\n` +
    `<b>Progress:</b> ${percentage}%`;
  ctx.editMessageText(text, {
    reply_markup: button4,
    parse_mode: 'html',
  });
  broadcaster.terminate();
  broadcaster.reset();

  await botdata.findOneAndUpdate(
    { id: bot_token },
    { $set: { broadcast_status: 'Inactive' } },
  );
  await next();
});

composer.callbackQuery('pbroadcast', async (ctx, next) => {
  broadcaster.pause();
  let botdb = await botdata.findOne({ id: bot_token });
  const status = botdb.broadcast_status;
  let totalUsers = await users.find({}).countDocuments();
  const { failedCount, completedCount, waitingCount } =
    await broadcaster.status();
  const percentage = (completedCount / totalUsers) * 100;
  const percentText = formatPercentToText(percentage);
  const text =
    `📊 <b>Broadcast Information</b>\n\n` +
    `<b>Info:</b> <code>Broadcast Is Paused</code>\n\n` +
    `<b>Total Users:</b> ${totalUsers}\n` +
    `<b>Total Sent:</b> ${completedCount}\n` +
    `<b>Total Pending:</b> ${waitingCount}\n` +
    `<b>Total Failed: </b>${failedCount}\n\n` +
    `<b>Status: ${percentText}</b>\n` +
    `<b>Progress:</b> ${percentage}%`;

  await ctx.editMessageText(text, {
    reply_markup: button2,
    parse_mode: 'HTML',
  });
  await botdata.findOneAndUpdate(
    { id: bot_token },
    { $set: { broadcast_status: 'Paused' } },
  );
  await next();
});

composer.callbackQuery('startbroadcast', async (ctx, next) => {
  let botdb = await botdata.findOne({ id: bot_token });
  const status = botdb.broadcast_status;
  let totalUsers = await users.find({}).countDocuments();
  const { failedCount, completedCount, waitingCount } =
    await broadcaster.status();
  const percentage = (completedCount / totalUsers) * 100;
  const percentText = formatPercentToText(percentage);
  const text =
    `📊 <b>Broadcast Information</b>\n\n` +
    `<b>Info:</b> <code>Broadcast Is Active</code>\n\n` +
    `<b>Total Users:</b> ${totalUsers}\n` +
    `<b>Total Sent:</b> ${completedCount}\n` +
    `<b>Total Pending:</b> ${waitingCount}\n` +
    `<b>Total Failed: </b>${failedCount}\n\n` +
    `<b>Status: ${percentText}</b>\n` +
    `<b>Progress:</b> ${percentage}%`;

  await ctx.editMessageText(text, {
    reply_markup: button3,
    parse_mode: 'HTML',
  });
  await botdata.findOneAndUpdate(
    { id: bot_token },
    { $set: { broadcast_status: 'Active' } },
  );

  await next();
  broadcaster.resume();
});

composer.callbackQuery('broadmsg', async (ctx, next) => {
  await ctx.editMessageText(
    '*👮‍♂️ Okay Admin, Send Me The Message You want To broadcast*',
    { parse_mode: 'markdown' },
  );
  ctx.session.step = 'broadcast';
  await next();
});

broadcaster.onCompleted(async () => {
  let totalUsers = await users.find({}).countDocuments();
  broadcaster.terminate();
  broadcaster.reset();

  const { failedCount, completedCount, waitingCount } =
    await broadcaster.status();
  const msg =
    '<b>✅ Broadcasting Ended</b>\n\n<b>ℹ Information About Broadcast</b>\n<code>' +
    `total user: ${totalUsers} \n` +
    `pending: ${waitingCount} \n` +
    `failed: ${failedCount} \n` +
    `completed: ${completedCount}` +
    '</code>';
  await botdata.findOneAndUpdate(
    { id: bot_token },
    { $set: { broadcast_status: 'Inactive' } },
  );
  await bot.api.sendMessage(admin, msg, { parse_mode: 'HTML' });
});

router.route('broadcast', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  let totalUsers = await users.find({});
  const allUsers = await users.find({}).countDocuments();
  if (msg.length > 3000) {
    ctx.reply(
      'Type In the message you want to send to your users. it must not exceed 3000 characters',
    );
  } else {
    let userToBroad = totalUsers.map((user) => user.id);
    broadcaster.pause();

    broadcaster.sendMessage(userToBroad, msg, { parse_mode: 'markdown' });
    await botdata.findOneAndUpdate(
      { id: bot_token },
      { $set: { broadcast_status: 'Paused' } },
    );

    const percentText = formatPercentToText(0);
    const text =
      `📊 <b>Broadcast Information</b>\n\n` +
      `<b>Info:</b> <code>Broadcast Is Pending</code>\n\n` +
      `<b>Total Users:</b> ${allUsers}\n\n` +
      `<b>Progress:</b> ${percentText} 0%`;

    ctx.reply(text, { reply_markup: button2, parse_mode: 'html' });
    ctx.session.step = 'idle';
  }
});

bot.use(router);
bot.use(composer);

const formatPercentToText = (percent) => {
  var mit;
  if (percent == 0) {
    mit = '<code>[▬▬▬▬▬▬▬▬▬] pending </code>';
  } else if (percent >= 1 && percent < 10) {
    mit = '<code>[◾️▬▬▬▬▬▬▬▬] started</code>';
  } else if (percent >= 11 && percent < 20) {
    mit = '<code>[◾️◾️▬▬▬▬▬▬▬] active</code>';
  } else if (percent >= 21 && percent < 30) {
    mit = '<code>[◾️◾️◾️▬▬▬▬▬▬] active</code>';
  } else if (percent >= 31 && percent < 40) {
    mit = '<code>[◾️◾️◾️◾️▬▬▬▬▬] active</code>';
  } else if (percent >= 41 && percent < 50) {
    mit = '<code>[◾️◾️◾️◾️◾️▬▬▬▬] active';
  } else if (percent >= 61 && percent < 70) {
    mit = '<code>[◾️◾️◾️◾️◾️◾️▬▬▬] active</code>';
  } else if (percent >= 71 && percent < 80) {
    mit = '<code>[◾️◾️◾️◾️◾️◾️◾️▬] active</code>';
  } else if (percent >= 81 && percent < 98) {
    mit = '<code>[◾️◾️◾️◾️◾️◾️◾️◾️] finishing</code>';
  } else if ((percent) => 99) {
    mit = '<code>[◾️◾️◾️◾️◾️◾️◾️◾️] finishing</code>';
  }
  return mit;
};
