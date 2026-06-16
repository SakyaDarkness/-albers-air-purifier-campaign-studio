import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.env.PORT || 5173);
const host = "127.0.0.1";

const contentTypes = {
  ".html": "text/html;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".md": "text/plain;charset=utf-8",
  ".svg": "image/svg+xml;charset=utf-8",
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json;charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function openAiHeaders() {
  return {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  };
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

async function handleAiStatus(response) {
  sendJson(response, 200, {
    configured: Boolean(process.env.OPENAI_API_KEY),
    textModel: process.env.OPENAI_TEXT_MODEL || "gpt-4.1",
    imageModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
  });
}

async function handleAiText(request, response) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 400, { error: "OPENAI_API_KEY is not set on the local server." });
    return;
  }

  const body = await readJson(request);
  const model = process.env.OPENAI_TEXT_MODEL || "gpt-4.1";
  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: openAiHeaders(),
    body: JSON.stringify({
      model,
      instructions:
        "你是空气净化器项目的中文营销策划。只生成文案、结构化建议和合规改写，不生成图片。竞品对比必须基于用户提供的数据，不得虚构参数、检测报告、价格或来源。避免绝对化、医疗化和无法证明的功效表述。",
      input: JSON.stringify(body, null, 2),
      temperature: 0.7,
      max_output_tokens: 2200,
    }),
  });

  const data = await apiResponse.json();
  if (!apiResponse.ok) {
    sendJson(response, apiResponse.status, { error: data.error?.message || "OpenAI text request failed." });
    return;
  }
  sendJson(response, 200, { model, text: extractResponseText(data), rawId: data.id });
}

async function handleAiImage(request, response) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 400, { error: "OPENAI_API_KEY is not set on the local server." });
    return;
  }

  const body = await readJson(request);
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
  const apiResponse = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: openAiHeaders(),
    body: JSON.stringify({
      model,
      prompt: body.prompt,
      size: body.size || "1024x1536",
      quality: body.quality || "medium",
      n: 1,
    }),
  });

  const data = await apiResponse.json();
  if (!apiResponse.ok) {
    sendJson(response, apiResponse.status, { error: data.error?.message || "OpenAI image request failed." });
    return;
  }

  const image = data.data?.[0];
  const dataUrl = image?.b64_json ? `data:image/png;base64,${image.b64_json}` : image?.url;
  sendJson(response, 200, { model, image: dataUrl });
}

createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${host}:${port}`);
    if (requestUrl.pathname === "/api/ai/status") {
      await handleAiStatus(response);
      return;
    }
    if (requestUrl.pathname === "/api/ai/text" && request.method === "POST") {
      await handleAiText(request, response);
      return;
    }
    if (requestUrl.pathname === "/api/ai/image" && request.method === "POST") {
      await handleAiImage(request, response);
      return;
    }

    const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const filePath = normalize(join(root, decodeURIComponent(pathname)));

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch (error) {
    if (request.url?.startsWith("/api/")) {
      sendJson(response, 500, { error: error.message || "Server error" });
    } else {
      response.writeHead(404);
      response.end("Not found");
    }
  }
}).listen(port, host, () => {
  console.log(`Serving http://${host}:${port}/`);
});
