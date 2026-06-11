import { ensureAccessToken, handleDriveAuthFailure } from "./auth";
import { DriveApiError, DriveAuthError } from "./errors";

export const driveAccessRefreshFailedMessage =
  "Could not refresh Google access. Try again, use Reconnect Google in My scenes, or sign out and back in.";

export const isDriveAccessRefreshError = (error: unknown): boolean =>
  (error instanceof DriveApiError && error.status === 401) ||
  error instanceof DriveAuthError;

/** Run a Drive API action with token refresh and one 401 retry. */
export const withDriveAccess = async <T>(
  action: () => Promise<T>,
): Promise<T> => {
  await ensureAccessToken();
  try {
    return await action();
  } catch (err) {
    if (err instanceof DriveApiError && err.status === 401) {
      handleDriveAuthFailure();
      await ensureAccessToken();
      return await action();
    }
    throw err;
  }
};
