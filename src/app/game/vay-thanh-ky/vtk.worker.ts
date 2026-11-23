// Web worker để máy nghĩ nước đi mà màn chơi không bị đứng.
import { handle, type EngineRequest, type EngineResponse } from "./engine";

self.onmessage = (event: MessageEvent<EngineRequest>) => {
  const request = event.data;
  let response: EngineResponse;
  try {
    response = handle(request);
  } catch (error) {
    response = { id: request.id, kind: "error", message: String(error) };
  }
  self.postMessage(response);
};
