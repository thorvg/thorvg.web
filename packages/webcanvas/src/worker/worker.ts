import VideoWorker from 'web-worker:./video.worker';

export function createVideoWorker(): Worker {
  return new VideoWorker();
}
