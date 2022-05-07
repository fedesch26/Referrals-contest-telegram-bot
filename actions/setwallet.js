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

composer.callbackQuery('setwallet', async (ctx, next) => {
  var text = `<b>✏ Ahora envia tu direccion de Solana (donde te enviaremos el premio en caso de que seas ganador)</b>\n\n
<i>Si aun no posees una wallet te recomendamos las siguientes:</i>\n
 1. <a href = "https://phantom.app/">PHANTOM WALLET</a>\n
 2. <a href = "https://solflare.com/">SOLFLARE WALLLET</a>\n 
 3. <a href = "https://trustwallet.com/">TRUST WALLET</a>\n 
 4. <a href = "https://www.sollet.io/">SOLLET WALLET</a>\n`;
  ctx.editMessageText(text, { parse_mode: 'HTML', disable_web_page_preview: true, });
  ctx.session.step = 'set-wallet';
  await next();
});

composer.callbackQuery('changewallet', async (ctx, next) => {
  var text = `<b>✏ Envia tu nueva direccion de Solana</b>`;
  ctx.editMessageText(text, { parse_mode: 'HTML' });
  ctx.session.step = 'changewallet';
  await next();
});

router.route('changewallet', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  if (msg.length == '44' ) {
    let isvalid = await users.findOne({ wallet: msg });
    if (isvalid) {
      ctx.session.step = 'idle';
      await ctx.reply(
        '⛔ <b>Error:</b> <i>Direccion ya existente en la base de datos. Por favor intenta con una direccion diferente.</i>',
        { parse_mode: 'HTML' },
      );
    } else {
      ctx.session.step = 'idle';
      await users.updateOne(
        { id: ctx.from.id },
        {
          $set: {
            wallet: msg,
          },
        },
      );
      await ctx.reply('✅ <b>Direccion correctamente añadida. Puedes cambiarla en cualquier momento desde el boton "Wallet".</b>', {
        parse_mode: 'HTML',
      });
    }
  } else {
    ctx.session.step = 'idle';
    await ctx.reply(
      '⛔ <b>Error:</b> <i>Eso no parece ser una direccion valida. Por favor intenta con una direccion valida de solana.</i>',
      { parse_mode: 'HTML' },
    );
  }
});
router.route('set-wallet', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  if (msg == '/start') {
    ctx.session.step = 'idle';
    return;
  }
  ctx.deleteMessage();
  if (msg.length == ("44")) {
    let isvalid = await users.findOne({ wallet: msg });
    if (isvalid) {
      await ctx.reply(
        '⛔ <b>Error:</b> <i>Direccion ya existente en la base de datos. Por favor intenta con una direccion diferente.</i>',
        { parse_mode: 'HTML' },
      );
    } else {
      ctx.session.step = 'idle';
      ctx.session.bind_wallet = 'done';
      await users.updateOne(
        { id: ctx.from.id },
        {
          $set: {
            user_step: 'Done',
            wallet: msg,
            bind_walllet: true,
            is_verified: true,
          },
          $inc: { balance: 0 },
        },
      );

      let { refferal_id, paid_for_refer } = await users.findOne({
        id: ctx.from.id,
      });
      if (refferal_id != 'no one' && !paid_for_refer) {
        await users.updateOne(
          { id: ctx.from.id },
          { $set: { paid_for_refer: true } },
        );
        await users.updateOne(
          { id: refferal_id },
          {
            $pull: { pending_ref_users: ctx.from.id },
            $inc: { pending_refs: -1, total_invited: 1, balance: 1 },
            $push: { invited_users: ctx.from.id },
          },
        );

        await ctx.api.sendMessage(
          refferal_id,
          '🎊 <i>Un usuario que invitaste fue verificado y completo todas las tareas! 🎊</i>',
          { parse_mode: 'HTML' },
        );
      }
      await ctx.reply('✅ <i>Direccion correctamente añadida, recuerda que te enviaremos el premio a esta direccion en caso de que seas ganador</i>', {
        parse_mode: 'HTML',
      });

      await ctx.reply(
        `<b>🎊 Felicidades! 🎊</b>\n<i>completaste correctamente todas las tareas del concurso, ahora puede invitar a otras personas.\n\n
Obten tu link de referido desde el boton "Referidos".</i>`,
        { parse_mode: 'HTML' },
      );

      await steps(ctx);
    }
  } else {
    await ctx.reply(
      '⛔ <b>Error:</b> <i>Eso no parece ser una direccion valida</i>',
      { parse_mode: 'HTML' },
    );
  }
});

bot.use(router);
bot.use(composer);




