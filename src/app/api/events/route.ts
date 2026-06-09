import { eventEmitter } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { signal } = request;

  const responseStream = new ReadableStream({
    start(controller) {
      const onUpdate = (data: any) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (err) {
          console.error('SSE enqueue error:', err);
        }
      };

      eventEmitter.on('appointment_update', onUpdate);

      // Keep alive ping
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(': keepalive\n\n');
        } catch (err) {
          console.error('SSE keepalive error:', err);
        }
      }, 15000);

      signal.addEventListener('abort', () => {
        eventEmitter.off('appointment_update', onUpdate);
        clearInterval(keepAliveInterval);
        try {
          controller.close();
        } catch (err) {}
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
