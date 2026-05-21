/**
 * Browser-side media upload. Asks the server for a presigned R2 URL, then PUTs
 * the file straight to R2 and returns its public URL. Handles any file size
 * (large videos included) because the bytes never pass through our server.
 */
export async function uploadFile(file: Blob): Promise<string> {
  const contentType = file.type || "application/octet-stream";

  const signRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  });
  if (!signRes.ok) {
    throw new Error("Could not start the upload. Are you signed in?");
  }
  const { uploadUrl, url } = (await signRes.json()) as {
    uploadUrl: string;
    url: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!putRes.ok) {
    throw new Error("Upload to storage failed.");
  }
  return url;
}

/** Convert a data: URL (e.g. a cropped image) to a blob and upload it. */
export async function uploadDataUrl(dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  return uploadFile(blob);
}
