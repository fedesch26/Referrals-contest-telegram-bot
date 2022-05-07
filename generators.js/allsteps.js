const { database } = require('../core');
const { tweet_id } = require('../core/config');
const botdb = database('bot');
const users = database('users');
const { InlineKeyboard, Keyboard } = require('../core/index');
const steps = async (ctx) => {
  const user = await users.findOne({ id: ctx.from.id });
  const { is_verified, user_step } = user;
  if (is_verified) {
    await main_menu(ctx);
    return 'user is verified';
  } else {
    switch (user_step) {
      case 'bind twitter':
        await bind_twitter(ctx);
        break;
      case 'telegram task':
        await telegram_task(ctx);
        break;
      case 'twitter task':
        await twitter_task(ctx);
        break;
      case 'bind_wallet':
        await bind_wallet(ctx);
        break;
      case 'Done':
        await main_menu(ctx);
        break;

      default:
        await ctx.reply('database corrupted');
        break;
    }
  }
};

const bind_twitter = async (ctx) => {
  await users.updateOne(
    { id: ctx.from.id },
    { $set: { user_step: 'bind twitter' } },
  );
  await ctx.reply(
    `Bienvenido al concurso de referidos de <b>MySeed</b> yo sere tu compañia y herramienta mientras dure el concurso 💭\n\n` +
      `<i>Antes de continuar con el registro, necesito que conectes tu cuenta de twitter.\n\n
<b>PRESIONA EL SIGUIENTE BOTON PARA CONTINUAR❕</b></i>`,
    {
      reply_markup: new InlineKeyboard().text('CONECTAR CON TWITTER 🕊', 'bindtwitter'),
      parse_mode: 'HTML',
    },
  );
};

const telegram_task = async (ctx) => {
  let { bind_walllet, do_twitter, bind_twitter, join_group, join_channel } =
    await users.findOne({ id: ctx.from.id });

  var done_bind = bind_twitter ? '✅' : '❌';
  var done_telegram = join_channel ? '✅' : '❌';
  var done_group = join_group ? '✅' : '❌';
  var done_twitter = do_twitter ? '✅' : '❌';
  var bind_wallet = bind_walllet ? '✅' : '❌';

  var text =
    `📚 <b>MySeed</b> <i>es un proyecto innovador construido en <b>SOLANA</b> que integra la tecnología blockchain en las finanzas de bienes raices, ayudando a las personas a conectar - financiar y otorgar casas en forma de rifas, este es el uso principal de MySeedNFT, tokens no fungibles que se utilizan como tickets en los diferentes sorteos.</i>\n
 ` +
    `🌐 <b>Website:</b> https://myseednft.io\n\n` +
    `<b>🌧 Tareas a completar</b>\n` +
    `1. <i>Conectar Twitter</i> ${done_bind}\n` +
    `2. <i>Ingresa al </i> <a href = "https://t.me/MySeedNFT_Announcement">canal de noticias</a> ${done_telegram}\n` +
    `3. <i>-ingresa al </i> <a href = "https://t.me/MySeedNFT">grupo</a> ${done_group}\n` +
    `4. <i>Siguenos en </i> <a href = "https://twitter.com/MySeedNft">Twitter</a> ${done_twitter}\n` +
    `5. <i>Retweet y Like </i> <a href = "https://twitter.com/MySeedNft">tweet</a> ${done_twitter}\n` +
    `6. <i>Coloca tu direccion de Solana </i> ${bind_wallet}\n` +
    `7. <i>Los ganadores seran recompensados con 5 NFT's validos para el sorteo de una casa vacacional en Brasil</i>\n\n` +
    `<b>⛔ Note:</b>\nLos ganadores de este concurso deberán cumplir estrictamente con cada tarea, MySeed se reserva el derecho a descalificar a cualquier persona que no cumpla legalmente`;
  ctx.reply(text, {
    reply_markup: new InlineKeyboard().text('CONTINUAR', 'letstart'),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
};

const twitter_task = async (ctx) => {
  let { bind_walllet, do_twitter, bind_twitter, join_group, join_channel } =
    await users.findOne({ id: ctx.from.id });

  var done_bind = bind_twitter ? '✅' : '❌';
  var done_telegram = join_channel ? '✅' : '❌';
  var done_group = join_group ? '✅' : '❌';
  var done_twitter = do_twitter ? '✅' : '❌';
  var bind_wallet = bind_walllet ? '✅' : '❌';

  var text =
    `📚 <b>MySeed</b> <i>es un proyecto innovador construido en <b>SOLANA</b> que integra la tecnología blockchain en las finanzas de bienes raices, ayudando a las personas a conectar - financiar y otorgar casas en forma de rifas, este es el uso principal de MySeedNFT, tokens no fungibles que se utilizan como tickets en los diferentes sorteos.</i>\n
 ` +
    `🌐 <b>Website:</b> https://myseednft.io\n\n` +
    `<b>🌧 Tareas a completar</b>\n` +
    `1. <i>Conectar Twitter</i> ${done_bind}\n` +
    `2. <i>Ingresa al </i> <a href = "https://t.me/MySeedNft_Announcement">canal de noticias</a> ${done_telegram}\n` +
    `3. <i>-ingresa al </i> <a href = "https://t.me/MySeedNFT">grupo</a> ${done_group}\n` +
    `4. <i>Siguenos en </i> <a href = "https://twitter.com/MySeedNft">Twitter</a> ${done_twitter}\n` +
    `5. <i>Retweet y Like </i> <a href = "https://twitter.com/MySeedNft">tweet</a> ${done_twitter}\n` +
    `6. <i>Coloca tu direccion de Solana </i> ${bind_wallet}\n`;

  ctx.reply(text, {
    reply_markup: new InlineKeyboard()
      .url(
        'Follow, Like y Retweet ',
        'https://twitter.com/myseednft/status/' + tweet_id,
      )
      .row()
      .text('CONTINUAR', 'letmove'),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
};

async function bind_wallet(ctx) {
  let { bind_walllet, do_twitter, bind_twitter, join_group, join_channel } =
    await users.findOne({ id: ctx.from.id });

  var done_bind = bind_twitter ? '✅' : '❌';
  var done_telegram = join_channel ? '✅' : '❌';
  var done_group = join_group ? '✅' : '❌';
  var done_twitter = do_twitter ? '✅' : '❌';
  var bind_wallet = bind_walllet ? '✅' : '❌';

  var text =
    `📚 <b>MySeed</b> <i>es un proyecto innovador construido en <b>SOLANA</b> que integra la tecnología blockchain en las finanzas de bienes raices, ayudando a las personas a conectar - financiar y otorgar casas en forma de rifas, este es el uso principal de MySeedNFT, tokens no fungibles que se utilizan como tickets en los diferentes sorteos.</i>\n
 ` +
    `🌐 <b>Website:</b> https://myseednft.io\n\n` +
    `<b>🌧 Tareas a completar</b>\n` +
    `1. <i>Conectar Twitter</i> ${done_bind}\n` +
    `2. <i>Ingresa al </i> <a href = "https://t.me/MySeedNft_Announcement">canal de noticias</a> ${done_telegram}\n` +
    `3. <i>-ingresa al </i> <a href = "https://t.me/MySeedNFT">grupo</a> ${done_group}\n` +
    `4. <i>Siguenos en </i> <a href = "https://twitter.com/MySeedNft">Twitter</a> ${done_twitter}\n` +
    `5. <i>Retweet y Like </i> <a href = "https://twitter.com/MySeedNft">tweet</a> ${done_twitter}\n` +
    `6. <i>Coloca tu direccion de Solana </i> ${bind_wallet}\n`;
  await ctx.reply(text, {
    reply_markup: new InlineKeyboard().text('ENVIAR DIRECCION SOLANA', 'setwallet'),
    parse_mode: 'html',
    disable_web_page_preview: true,
  });
}

async function main_menu(ctx) {
  let { bind_walllet, do_twitter, bind_twitter, join_group, join_channel } =
    await users.findOne({ id: ctx.from.id });

  var done_bind = bind_twitter ? '✅' : '❌';
  var done_telegram = join_channel ? '✅' : '❌';
  var done_group = join_group ? '✅' : '❌';
  var done_twitter = do_twitter ? '✅' : '❌';
  var bind_wallet = bind_walllet ? '✅' : '❌';

  var text =
    `📚 <b>MySeed</b> <i>es un proyecto innovador construido en <b>SOLANA</b> que integra la tecnología blockchain en las finanzas de bienes raices, ayudando a las personas a conectar - financiar y otorgar casas en forma de rifas, este es el uso principal de MySeedNFT, tokens no fungibles que se utilizan como tickets en los diferentes sorteos.</i>\n
 ` +
   `🌐 <b>Website:</b> https://myseednft.io\n\n` +
    `<b>🌧 Tareas a completar</b>\n` +
    `1. <i>Conectar Twitter</i> ${done_bind}\n` +
    `2. <i>Ingresa al </i> <a href = "https://t.me/MySeedNft_Announcement">canal de noticias</a> ${done_telegram}\n` +
    `3. <i>-ingresa al </i> <a href = "https://t.me/MySeedNFT">grupo</a> ${done_group}\n` +
    `4. <i>Siguenos en </i> <a href = "https://twitter.com/MySeedNft">Twitter</a> ${done_twitter}\n` +
    `5. <i>Retweet y Like </i> <a href = "https://twitter.com/MySeedNft">tweet</a> ${done_twitter}\n` +
    `6. <i>Coloca tu direccion de Solana </i> ${bind_wallet}\n\n` +
    `✅ <b>Felicidades, ya estas registrado para el concurso</b>`;

  const keyboard = new Keyboard()
    .text('📚 Cuenta')
    .row()
    .text('👨‍👩‍👧‍👦 Referidos')
    .text('🛄 Wallet')
    .row()
    .text('🔎 Informacion')
    .build();
  ctx.reply(text, {
    reply_markup: { keyboard: keyboard, resize_keyboard: true },
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

module.exports = steps;
