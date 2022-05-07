const { database } = require('../core');
const users = database('users');
const editMessage = async (ctx, button) => {
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
    `5. <i>Siguenos, da Retweet y like en</i> <a href = "https://twitter.com/MySeedNft">Twitter</a> ${done_twitter}\n` +
    `6. <i>Coloca tu direccion de Solana </i> ${bind_wallet}\n` +
    `7. <i>Los ganadores seran recompensados con 5 NFT's validos para el sorteo de una casa vacacional en Brasil</i>\n\n` +
    `<b>⛔ Note:</b>\nLos ganadores de este concurso deberán cumplir estrictamente con cada tarea, MySeed se reserva el derecho a descalificar a cualquier persona que no cumpla legalmente`;
  try {
    await ctx.editMessageText(text, {
      reply_markup: button,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = editMessage;
