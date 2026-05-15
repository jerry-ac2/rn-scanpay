export type QrScanStatus =
  | 'idle'
  | 'scanning'
  | 'paused'
  | 'stopped'
  | 'success'
  | 'error';

export interface QrResult {
  payload: object | null;
  status: QrScanStatus;
}
