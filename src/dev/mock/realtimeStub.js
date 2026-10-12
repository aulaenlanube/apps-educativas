// ─────────────────────────────────────────────────────────────────────────────
// Canal Realtime falso: sin websocket. Acepta on/subscribe/send/track y
// responde "SUBSCRIBED" para que los hooks (useIncomingDuels, useDuelChannel,
// useQuizChannel…) sigan su flujo normal sin conectar con Supabase.
// ─────────────────────────────────────────────────────────────────────────────

export function createChannelStub(topic) {
  let closed = false;
  const channel = {
    topic: `realtime:${topic}`,
    state: 'closed',
    on() { return channel; },
    subscribe(callback) {
      channel.state = 'joined';
      if (typeof callback === 'function') {
        setTimeout(() => { if (!closed) callback('SUBSCRIBED'); }, 0);
      }
      return channel;
    },
    unsubscribe() {
      closed = true;
      channel.state = 'closed';
      return Promise.resolve('ok');
    },
    send() { return Promise.resolve('ok'); },
    track() { return Promise.resolve('ok'); },
    untrack() { return Promise.resolve('ok'); },
    presenceState() { return {}; },
    updateJoinPayload() {},
  };
  return channel;
}
