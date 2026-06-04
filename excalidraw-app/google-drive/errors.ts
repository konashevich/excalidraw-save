export class DriveNotConfiguredError extends Error {
  constructor() {
    super(
      "Google Drive sync is not configured. Set VITE_APP_GOOGLE_DRIVE and VITE_APP_GOOGLE_CLIENT_ID.",
    );
    this.name = "DriveNotConfiguredError";
  }
}

export class DriveAuthError extends Error {
  constructor(message = "Google sign-in failed or was cancelled.") {
    super(message);
    this.name = "DriveAuthError";
  }
}

export class DriveApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DriveApiError";
    this.status = status;
  }
}
