import fetch from "node-fetch";

import dotenv from "dotenv";

dotenv.config();

export async function CallOllama(messages) {
  const res = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      messages,
      stream: false,
    }),
  });

  const data = await res.json();
  console.log("Ollama raw:", data);
  return data.message?.content || "";

  // let fullReply = "";
  // let buffer = "";

  // return new Promise((resolve,reject) => {
  //   res.body.on("data", (chunk) => {

  //     buffer += chunk.toString();

  //     const lines = chunk.toString().trim().split("\n");
  //     buffer = lines.pop() || "";

  //     for (const line of lines) {
  //       if (!line.trim()) continue;
  //       try {
  //         const parsed = JSON.parse(line);
  //         if (parsed.message.content) {
  //           process.stdout.write(parsed.message.content);
  //           fullReply += parsed.message.content;
  //         }
  //       } catch (err) {
  //         console.error("line missing", err);
  //       }
  //     }
  //   });
  //   res.body.on("end", () => resolve(fullReply));
  //   res.body.on("error",(err)=>reject(err))
  // });
}
