export const GUEST_UPLOAD_LIMIT_MB = 100;

export type UploadAllowanceInput = {
  isGuest: boolean;
  sizeMb: number;
  remainingStorageMb?: number;
};

export function assertUploadAllowed(input: UploadAllowanceInput) {
  if (input.isGuest && input.sizeMb > GUEST_UPLOAD_LIMIT_MB) {
    throw new Error(`Guest uploads cannot exceed ${GUEST_UPLOAD_LIMIT_MB} MB.`);
  }

  if (
    !input.isGuest &&
    input.remainingStorageMb !== undefined &&
    input.sizeMb > input.remainingStorageMb
  ) {
    throw new Error("Upload exceeds remaining storage quota.");
  }
}

export type SubscriptionUsabilityInput = {
  storageRemainingMb: number;
  videosRemaining: number;
  endsAt: Date;
};

export function isSubscriptionUsable(input: SubscriptionUsabilityInput) {
  return (
    input.storageRemainingMb > 0 &&
    input.videosRemaining > 0 &&
    input.endsAt.getTime() > Date.now()
  );
}
