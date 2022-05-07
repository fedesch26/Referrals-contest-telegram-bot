const { InlineKeyboard, database } = require('../core/index');
const users = database('users');

const viewuser = async (ctx, userp) => {
  let {
    bind_walllet,
    do_twitter,
    bind_twitter,
    join_group,
    join_channel,
    balance,
    total_invited,
    wallet,
    pending_refs,
    joined,
    twitter,
    twitter_id,
    is_verified,
    id,
    first_name,
    refferal_id,
  } = await users.findOne({ id: userp });
  var done_bind = bind_twitter ? '✅' : '❌';
  var done_telegram = join_channel ? '✅' : '❌';
  var done_group = join_group ? '✅' : '❌';
  var done_twitter = do_twitter ? '✅' : '❌';
  var bind_wallet = bind_walllet ? '✅' : '❌';
  var verified = is_verified ? '✅' : '❌';
  var ref;
  if (refferal_id != 'no one') {
    ref = `<a href='tg://user?id=${refferal_id}'>${refferal_id}</a>`;
  }

  let time = joined.toLocaleString('en-US', { timeZone: 'Africa/Accra' });
  var text =
    `🌐 <b>User Information</b>\n\n` +
    `🆔 <b>User:</b> <a href="tg://user?id=${id}">${first_name}</a>\n` +
    `<b>⏰ Joined:</b> <i>${time}</i>\n` +
    `<b>👤 Invited By: </b>${ref}\n` +
    `<b>👨‍👩‍👧‍👦 Verified Invites: </b> <code>${total_invited} users</code>\n` +
    `<b>⏳ Pending Invites:</b> <code>${pending_refs} users</code>\n` +
    `⚡ <b>Verified:</b> ${verified}\n` +
    `<b>💰 Balance: </b> <code>${balance} $LBT</code>\n` +
    `<b>🛄 BSC Wallet:</b> <code>${wallet}</code>\n` +
    `<b>🕊 Twitter:</b> <a href="https://twitter.com/${twitter}">${twitter}</a>\n\n` +
    `📚 <b>Airdrop Task Done</b>\n` +
    `1. <i>Bind Twitter Account -</i> ${done_bind}\n` +
    `2. <i>Join Announcent Channel -</i> ${done_telegram}\n` +
    `3. <i>Join Airdrop Group -</i> ${done_group}\n` +
    `4. <i>Follow Twitter -</i> ${done_twitter}\n` +
    `5. <i>Like and retweet post</i> ${done_twitter}\n` +
    `6. <i>Bind Wallet -</i> ${bind_wallet}`;
  await ctx.reply(text, {
    reply_markup: new InlineKeyboard().text('❌ Remove', 'delete'),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
};

module.exports = viewuser;
