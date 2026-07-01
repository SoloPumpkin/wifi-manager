import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get("size");
  const size = Math.min(Math.max(parseInt(sizeParam || "5") || 5, 1), 50);

  const chunkSize = 1024 * 1024;
  const totalChunks = size;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = new Uint8Array(chunkSize);
        for (let j = 0; j < chunkSize; j += 4) {
          chunk[j] = Math.floor(Math.random() * 256);
          chunk[j + 1] = Math.floor(Math.random() * 256);
          chunk[j + 2] = Math.floor(Math.random() * 256);
          chunk[j + 3] = Math.floor(Math.random() * 256);
        }
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": `${size * 1024 * 1024}`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
