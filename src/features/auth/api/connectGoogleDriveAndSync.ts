import { connectGoogle } from "@/features/auth/api/googleIdentity";
import { syncService } from "@/features/sync/api/syncService";
import { useAppStore } from "@/store/useAppStore";

export async function connectGoogleDriveAndSync(): Promise<void> {
  const { setGoogleConnection } = useAppStore.getState();
  const connection = await connectGoogle("consent");
  setGoogleConnection(connection);
  await syncService.syncNow({ prompt: "", silent: false });
}
