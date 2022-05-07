const { twitter } = require('../libs');
const { bot, database, Router, Composer } = require('../core/index');
const users = database('users');
const botdb = database('bot');
const composer = new Composer();
const { steps } = require('../generators.js/index');
const { check_twitter } = twitter;
const router = new Router((ctx) => ctx.session.step);

composer.callbackQuery('bindtwitter', async (ctx, next) => {
  const user = await users.findOne({ id: ctx.from.id });
  const { is_verified, user_step } = user;
  if (user_step == 'bind twitter') {
    ctx.editMessageText(
      `🔸 Bienvenido al concurso de <b>MySeed</b> 🔸\n\n
<i>Sere tu compania y herramienta mientras dure el concurso.\n\n
Los usuarios que mas invitados obtengan seran los ganadores, repartiremos 10 NFT's en total a los primeros 3 de la tabla.</i>\n\n` +
        `<b>Ahora enviame tu usuario de twitter con @</b>\n
<i>No podras cambiarlo una vez que envies el mensaje asi que asegurate de que el usuario sea el correcto</i>`,
      { parse_mode: 'HTML' },
    );
  } else {
    await steps(ctx);
  }
  await next();
  ctx.session.step = 'bindtwitter';
});

router.route('bindtwitter', async (ctx) => {
  const msg = ctx.msg?.text ?? '';
  ctx.deleteMessage();
 ctx.reply(`<b>🔎 Buscando twitter para: ${msg}, por favor se paciente...</b>`,
{
    parse_mode: 'HTML',
  });
  console.log(msg);
  if (msg.charAt(0) == '@') {
    let twitter = msg.substring(1);
    let isValidTwitter = await check_twitter(twitter);
    if (!isValidTwitter.errors && isValidTwitter.data) {
       console.log(twitter);
      let isValid = await users.findOne({ twitter_id: isValidTwitter.data.id });
      if (isValid) {
        ctx.reply(
          `⛔ <b>Error:</b> @${twitter} <i>ya existe en la base de datos por favor utiliza otra cuenta..</i>`,
          { parse_mode: 'HTML' },
        );
      } else {
         console.log(isValidTwitter);

        await users.updateOne(
          {
            id: ctx.from.id,
          },
          {
            $set: {
              twitter: twitter,
              twitter_id: isValidTwitter.data.id,
              user_step: 'telegram task',
              bind_twitter: true,
            },
          },
        );
        ctx.session.step = 'idle';
        ctx.session.bind_twitter = twitter;
        await ctx.reply(
          `✅ <b>Cuenta de twitter añadida</b>\n\nCuenta de Twitter <a href="https://twitter.com/${twitter}">${twitter}</a> Fue adherida correctamente.`,
          {
            parse_mode: 'HTML',
          },
        );
        await steps(ctx);
      }
    } else if (isValidTwitter.error) {
      await ctx.reply('Muchas peticiones, prueba mas tarde');
    } else if (isValidTwitter.errors) {
      ctx.reply(
        `⛔ <b>Error:</b>\n@${twitter} <i>No es un usuario de Twitter valido, intenta mas tarde o </i> <a href="https://twitter.com/signup">sign up</a>`,
        {
          parse_mode: 'HTML',
        },
      );
    }
  } else {
    ctx.reply(
      `⛔ <b>Error:</b> <i>Cuenta de Twitter invalida, por favor envia tu usuario de Twitter con @</i>`,
      { parse_mode: 'HTML' },
    );
  }
});

bot.use(router);
bot.use(composer);
