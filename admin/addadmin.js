const { database, bot, Composer, InlineKeyboard, Router } = require('../core');
const { bot_token, admin } = require('../core/config');
const { createMenu } = require('../libs');
const composer = new Composer();
const router = new Router((ctx) => ctx.session.step);
const botdata = database('bot');

composer.callbackQuery('addadmin', async (ctx, next) => {
  let { admin } = await botdata.findOne({ id: bot_token });

  if (admin.length === 0) {
    var keys = new InlineKeyboard()
      .text('➕ Add Admin', 'adminadd')
      .row()
      .text('🔙 Back To Panel', 'adminlogin');

    await ctx.editMessageText(
      '😶 You have not added any admin, click the button below to add',
      { reply_markup: keys },
    );
  } else {
    var keys = new InlineKeyboard()
      .text('➕ Add/Remove a Admin', 'manageadmin')
      .row()
      .text('🆕 Add New Admins', 'adminadd')
      .text('➖ Remove All Admins', 'removeall')
      .row()
      .text('⬅ Back To Panel', 'adminlogin');
    let admins = '';
    admin.forEach(getAdmins);

    function getAdmins(value, index, array) {
      admins += value + '\n';
    }
    let text =
      '<b>This are Your currently setup Admins</b>\n\n<i>' +
      admins +
      '</i>\n\n<b>Choose what you will like to do below</b>';
    await ctx.editMessageText(text, { reply_markup: keys, parse_mode: 'html' });
  }
  await next();
});

composer.callbackQuery('adminadd', async (ctx, next) => {
  await ctx.deleteMessage();
  await ctx.reply(
    'Okay Admin send me all the Admins you want to add\n\nUse , to add multiple admins',
  );
  ctx.session.step = 'addAdmin';
  await next();
});

composer.callbackQuery('manageadmin', async (ctx, next) => {
  await ctx.deleteMessage();
  ctx.reply(
    'Hey Admin, you can add or remove an admin from the bot database here\n|- To Add a admin send + before the admin telegram id\n|- To Remove an admin send - before the admin telegram id\n\nExample: +6768787789 or -6768787789',
  );

  ctx.session.step = 'manageAdmin';
  await next();
});

composer.callbackQuery('removeall', async (ctx, next) => {
  var keys = new InlineKeyboard().text('Back To Panel', 'adminlogin');
  var adminx = [];

  await ctx.editMessageText('All admins have been succesfully Removed', {
    reply_markup: keys,
  });
  await botdata.findOneAndUpdate(
    { id: bot_token },
    { admin: adminx },
    { new: true, upsert: true },
  );
  await next();
});

router.route('addAdmin', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  var keys = new InlineKeyboard().text('Back To Panel', 'adminlogin');
  console.log(msg);
  if (msg.includes(',')) {
    var new_array = msg.split(',');
    await ctx.reply('admins Successfully added to database', {
      reply_markup: keys,
    });
    await botdata.findOneAndUpdate(
      { id: bot_token },
      { admin: new_array },
      { new: true, upsert: true },
    );
    ctx.session.step = 'idle';
  } else {
    var new_array = [msg];
    await ctx.reply('admin Successfully added to database', {
      reply_markup: keys,
    });
    await botdata.findOneAndUpdate(
      { id: bot_token },
      { admin: new_array },
      { new: true, upsert: true },
    );
    ctx.session.step = 'idle';
  }
});
router.route('manageAdmin', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  let botdb = await botdata.findOne({ id: bot_token });
  var admin = botdb.admin;
  console.log(admin);
  var keys = new InlineKeyboard().text('Back To Panel', 'adminlogin');

  if (msg.charAt(0) == '+') {
    var new_msg = msg.substring(1);
    var index = admin.indexOf(new_msg);
    console.log(index);
    if (index >= 0) {
      ctx.reply(
        'admin is already in database, send cancel to stop the process',
      );
    } else {
      admin.push(new_msg);
      var txt = 'admin have been succesfully Added ';
      await ctx.reply(txt, { reply_markup: keys });
      await botdata.findOneAndUpdate(
        { id: bot_token },
        { admin: admin },
        { new: true, upsert: true },
      );
      ctx.session.step = 'idle';
    }
  } else if (msg.charAt(0) == '-') {
    var new_msg = msg.substring(1);
    var index = admin.indexOf(new_msg);
    console.log(index);
    if (index < 0) {
      await ctx.reply('admin not found, send cancel to stop the process');
    } else {
      channel.splice(index, 1);
      var txt = 'admin have been succesfully Removed';
      await ctx.reply(txt, { reply_markup: keys });
      await botdata.findOneAndUpdate(
        { id: bot_token },
        { admin: admin },
        { new: true, upsert: true },
      );
      ctx.session.step = 'idle';
    }
  } else if (msg == 'cancel') {
    await ctx.reply('operation cancel successfully', { reply_markup: keys });
    ctx.session.step = 'idle';
  } else {
    ctx.reply('Invalid syntax please follow the syntax!');
  }
});

bot.use(router);
bot.use(composer);
