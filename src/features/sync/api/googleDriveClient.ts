import { env } from "@/shared/lib/env";
import { translateCurrent } from "@/shared/lib/i18n";
import { parseAppSnapshot } from "@/shared/types/schemas";
import type { AppSnapshot } from "@/shared/types/domain";

const GOOGLE_DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_UPLOAD_API_URL =
  "https://www.googleapis.com/upload/drive/v3/files";

interface DriveFileLookupResult {
  fileId: string | null;
  snapshot: AppSnapshot | null;
}

function getHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function buildMultipartBody(
  fileName: string,
  snapshot: AppSnapshot,
): { body: string; boundary: string } {
  const boundary = `goal-tracker-${crypto.randomUUID()}`;
  const metadata = JSON.stringify({
    name: fileName,
    parents: ["appDataFolder"],
  });
  const content = JSON.stringify(snapshot);
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    metadata,
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    content,
    `--${boundary}--`,
  ].join("\r\n");
  return {
    body,
    boundary,
  };
}

async function getFileContents(
  accessToken: string,
  fileId: string,
): Promise<AppSnapshot | null> {
  const response = await fetch(`${GOOGLE_DRIVE_API_URL}/${fileId}?alt=media`, {
    headers: getHeaders(accessToken),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(translateCurrent("errors.driveFetchFailed"));
  }
  const rawJson = (await response.json()) as unknown;
  return parseAppSnapshot(rawJson);
}

export async function getRemoteSnapshot(
  accessToken: string,
): Promise<DriveFileLookupResult> {
  const query = encodeURIComponent(
    `name='${env.googleDriveFileName}' and trashed=false`,
  );
  const response = await fetch(
    `${GOOGLE_DRIVE_API_URL}?spaces=appDataFolder&fields=files(id,name)&q=${query}`,
    {
      headers: getHeaders(accessToken),
    },
  );
  if (!response.ok) {
    throw new Error(translateCurrent("errors.driveQueryFailed"));
  }
  const data = (await response.json()) as {
    files?: Array<{ id: string }>;
  };
  const fileId = data.files?.[0]?.id ?? null;
  if (!fileId) {
    return {
      fileId: null,
      snapshot: null,
    };
  }
  return {
    fileId,
    snapshot: await getFileContents(accessToken, fileId),
  };
}

export async function uploadRemoteSnapshot(
  accessToken: string,
  existingFileId: string | null,
  snapshot: AppSnapshot,
): Promise<string> {
  const { body, boundary } = buildMultipartBody(
    env.googleDriveFileName,
    snapshot,
  );
  const method = existingFileId ? "PATCH" : "POST";
  const targetUrl = existingFileId
    ? `${GOOGLE_UPLOAD_API_URL}/${existingFileId}?uploadType=multipart`
    : `${GOOGLE_UPLOAD_API_URL}?uploadType=multipart`;
  const response = await fetch(targetUrl, {
    method,
    headers: {
      ...getHeaders(accessToken),
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!response.ok) {
    throw new Error(translateCurrent("errors.driveUploadFailed"));
  }
  const data = (await response.json()) as { id?: string };
  if (!data.id) {
    throw new Error(translateCurrent("errors.driveMissingFileId"));
  }
  return data.id;
}
