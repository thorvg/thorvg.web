export class WorkerManager {
  private _workers: Map<string, Worker> = new Map();
  private _animationWorkerMap: Map<string, string> = new Map();

  public getWorker(workerId: string): Worker {
    if (!this._workers.has(workerId)) {
      const worker = new Worker(new URL('../dist/lottie-player.worker.js', import.meta.url), {
        type: 'module',
      });
      this._workers.set(workerId, worker);
    }
    return this._workers.get(workerId)!;
  }

  public assignAnimationToWorker(animationId: string, workerId: string): void {
    this._animationWorkerMap.set(animationId, workerId);
  }

  public unassignAnimationFromWorker(animationId: string): void {
    this._animationWorkerMap.delete(animationId);
  }

  public getWorkerForAnimation(animationId: string): Worker | null {
    const workerId = this._animationWorkerMap.get(animationId);
    if (workerId) {
      return this._workers.get(workerId) || null;
    }
    return null;
  }

  public destroyWorker(workerId: string): void {
    const worker = this._workers.get(workerId);
    if (worker) {
      worker.terminate();
      this._workers.delete(workerId);
    }
  }

  public destroyAllWorkers(): void {
    for (const [workerId] of this._workers) {
      this.destroyWorker(workerId);
    }
  }
} 