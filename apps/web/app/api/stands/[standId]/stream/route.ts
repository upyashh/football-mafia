import { NextRequest } from "next/server";
import { subscribeToStand } from "@/lib/chat-store";

const encoder = new TextEncoder();

/** Server-Sent Events stream of new messages posted to this stand, in real time. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ standId: string }> },
) {
  const { standId } = await params;

  let unsubscribe: () => void = () => {};

  const stream = new ReadableStream({
    start(controller) {
      unsubscribe = subscribeToStand(standId, (event) => {
        if (event.kind === "cleared") {
          controller.enqueue(
            encoder.encode(`event: cleared\ndata: {}\n\n`),
          );
          return;
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event.message)}\n\n`),
        );
      });
      controller.enqueue(encoder.encode(": connected\n\n"));
    },
    cancel() {
      unsubscribe();
    },
  });

  request.signal.addEventListener("abort", () => unsubscribe());

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
