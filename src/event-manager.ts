export type EventType = 
  | 'load'
  | 'play'
  | 'pause'
  | 'stop'
  | 'complete'
  | 'frame'
  | 'error'
  | 'freeze'
  | 'unfreeze';

export type EventListener<T extends EventType> = (event: any) => void;

export class EventManager {
  private _listeners: Map<EventType, Set<EventListener<any>>> = new Map();

  public addEventListener<T extends EventType>(type: T, listener: EventListener<T>): void {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    this._listeners.get(type)!.add(listener);
  }

  public removeEventListener<T extends EventType>(type: T, listener?: EventListener<T>): void {
    if (!listener) {
      this._listeners.delete(type);
      return;
    }

    const listeners = this._listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this._listeners.delete(type);
      }
    }
  }

  public dispatch<T extends EventType>(type: T, event?: any): void {
    const listeners = this._listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }
  }

  public removeAllEventListeners(): void {
    this._listeners.clear();
  }
} 