import { CloudApiError, type SignedTransfer } from "../../types/cloud";

export interface SignedUploadTransport {
  upload(transfer: SignedTransfer): Promise<void>;
}

/** Refreshes an expired URL once; signed URLs are never persisted or logged. */
export async function uploadWithSignedUrlRecovery(
  getTransfer: () => Promise<SignedTransfer>,
  transport: SignedUploadTransport,
): Promise<void> {
  let transfer = await getTransfer();
  try {
    await transport.upload(transfer);
  } catch (error) {
    if (!(error instanceof CloudApiError) || error.code !== "signed_url_expired") throw error;
    transfer = await getTransfer();
    await transport.upload(transfer);
  }
}
