const { database, bot, Composer, InlineKeyboard, Router } = require('../core');
const { bot_token } = require('../core/config');
const composer = new Composer();
const router = new Router((ctx) => ctx.session.step);
const botdata = database('bot');
const users = database('users');
const allUsers = database('users');
const { steps } = require('../generators.js/index');

composer.hears('📚 Cuenta', async (ctx, next) => {
  let { user_step, balance, pending_refs } = await users.findOne({
    id: ctx.from.id,
  });
  if (user_step == 'Done') {
    let time = new Date().toLocaleString('en-US', { timeZone: 'Africa/Accra' });
    ctx.reply(
      `🆔 <b>Account Information</b>\n` +
        `👤 <b>User:</b> <code>${ctx.from.id} | ${ctx.from.first_name}</code>\n\n` +
        `💰 <b>Referidos:</b> <code>${balance} </code>\n` +
        `⚡ <b>Status:</b><code> ✅ Verified</code>\n\n` +
        `⏰ <b>Server Time:</b> <code>${time}</code>`,
      { parse_mode: 'HTML' },
    );
  } else {
    await steps(ctx);
  }
  await next();
});

composer.hears('👨‍👩‍👧‍👦 Referidos', async (ctx, next) => {
  let { user_step, total_invited, pending_refs } = await users.findOne({
    id: ctx.from.id,
  });
  if (user_step == 'Done') {
    var text =
      `<b>👨‍👩‍👧‍👦 Informacion de referidos.</b>\n\n` +
      `⚡ <b>Invitados verificados:</b> <code>${total_invited}</code>\n` +
      `⏳ <b>Invitados pendientes:</b> <code>${pending_refs}</code>\n\n` +
      `✅ <b>Link de referidos:</b>\n https://t.me/${ctx.me.username}?start=${ctx.from.id}\n\n` +
      `⛔ <b>Note:</b>\n` +
      `<i>- Comparte tu link de referido, si quedas entre los pimeros seras ganador de un NFT. </i>\n` +
      `<i>- Invitados pendientes son los usuarios que no completaron todas las tareas, en cambio, usuarios verificados son los que completaron todas las tareas correctamente.</i>`;
    await ctx.reply(text, { parse_mode: 'HTML' });
  } else {
    await steps(ctx);
  }
  await next();
});

composer.hears('🛄 Wallet', async (ctx, next) => {
  let { user_step, wallet } = await users.findOne({ id: ctx.from.id });
  if (user_step == 'Done') {
    await ctx.reply(
      `<b>⚡ Tu direccion de Solana es</b>\n\n<code>${wallet}</code>`,
      {
        reply_markup: new InlineKeyboard().text(
          '✔ Cambiar mi direccion',
          'changewallet',
        ),
        parse_mode: 'HTML',
      },
    );
  } else {
    await steps(ctx);
  }
  await next();
});

composer.hears('🔎 Informacion', async (ctx, next) => {
  let { user_step } = await users.findOne({ id: ctx.from.id });
  if (user_step == 'Done') {
    ctx.reply(
      `<b>📚 Informacion acerca de MySeed.</b>

<i>MySeed es un proyecto construido en el ecosistema de Solana, nuestro principal objetivo y uso es el poder cumplir el sueño a una vivienda propia a nuestra comunidad.

Un nuevo caso de uso en los NFT's, ahora incluyendolos en los bienes y raices.

Los usuarios podran optar por participar en diferentes sorteos, el principal sera una casa, pero tambien puede ser dinero fiduciario.

Uno de los principales problemas que planeamos resolver es la escasa posibilidad de acceder a un hogar propio, pudiendo financiar cientos de hogaras a familias con pocos recursos economicos, siempre usando la tecnologia blockchain de una foma segura y legal para que todos los sorteos sean totalmente aleatorios y no exista ningun tipo de trampa.</i>

👁 <b>Website</b> <a href="https://myseednft.io">View </a>`,
      { parse_mode: 'HTML', disable_web_page_preview: true },
    );
  } else {
    await steps(ctx);
  }
  await next();
});



composer.callbackQuery('allusers', async (ctx, next) => {
  await getUserList(ctx);
  await next();
    composer.hears('toprefs', async (ctx, next) => {
 {
  let users = await allUsers.find({});
  users.sort(doSort);
  var result = [];
  for (var i = 0; i < 15; i++) {
    let item = users[i];
    if (!item[i]) {
    break;
    }
    result.push(item);
  }

  for (var i = 0; i < 15; i++) {
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
}
});
})

bot.use(composer);
