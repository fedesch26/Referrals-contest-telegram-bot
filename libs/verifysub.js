const checkSub = async (ctx) => {
  try {
    const channel = await ctx.api.getChatMember(
      '@myseednft_announcement',
      ctx.from.id,
    );
    const group = await ctx.api.getChatMember(
      '@myseednft',
      ctx.from.id,
    );
    const sub = ['creator', 'admininstrator', 'member'].includes(
      channel.status,
    );
    const sub2 = ['creator', 'admininstrator', 'member'].includes(group.status);
    if (sub && sub2) {
      return { status: true, message: null, joined: 'all' };
    } else if (!sub && !sub2) {
      return {
        status: false,
        message: '⛔ Necesitas entrar a los dos chats para continuar.',
        joined: 'none',
      };
    } else if (!sub && sub2) {
      return {
        status: false,
        message: '😶 Olvidaste entrar en el Canal.',
        joined: 'group',
      };
    } else if (sub && !sub2) {
      return {
        status: false,
        message: '😶 Olvidaste entrar en el Grupo',
        joined: 'channel',
      };
    }
  } catch (error) {
    return {
      status: false,
      message: '😥 Ocurrio un error.',
      joined: 'error',
    };
  }
};

module.exports = checkSub;
