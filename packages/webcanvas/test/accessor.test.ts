import { describe, it, expect } from 'vitest';
import { Accessor } from '../src/core/Accessor';
import { getTVG, assertNoDoubleFree } from './helpers';


const NAMED_SVG =
  '<svg width="100" height="100">' +
  '<rect id="background" width="100" height="100" fill="red"/>' +
  '<circle id="dot" cx="50" cy="50" r="20" fill="blue"/>' +
  '</svg>';

describe('Accessor', () => {
  it('constructor creates an accessor', () => {
    const TVG = getTVG();
    const accessor = new TVG.Accessor();
    expect(accessor).toBeInstanceOf(Accessor);
    expect(accessor.ptr).toBeGreaterThan(0);
  });

  it('id returns a consistent hash for the same name', () => {
    const TVG = getTVG();
    const id1 = TVG.Accessor.id('star');
    const id2 = TVG.Accessor.id('star');
    expect(id1).toBe(id2);
    expect(id1).toBeGreaterThan(0);
  });

  it('id returns different hashes for different names', () => {
    const TVG = getTVG();
    const id1 = TVG.Accessor.id('star');
    const id2 = TVG.Accessor.id('circle');
    expect(id1).not.toBe(id2);
  });

  it('set traverses descendant paints', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(NAMED_SVG, { type: 'svg' });

    let count = 0;
    new TVG.Accessor().set(picture, () => {
      count++;
      return true;
    });
    expect(count).toBeGreaterThan(0);
  });

  it('set stops traversal when the callback returns false', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(NAMED_SVG, { type: 'svg' });

    let count = 0;
    new TVG.Accessor().set(picture, () => {
      count++;
      return false;
    });
    expect(count).toBe(1);
  });

  it('set traverses a Scene, not just a Picture', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const first = new TVG.Shape();
    first.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    const second = new TVG.Shape();
    second.appendCircle(80, 80, 20).fill(0, 255, 0, 255);
    scene.add(first);
    scene.add(second);

    const shapes: unknown[] = [];
    new TVG.Accessor().set(scene, (paint) => {
      if (paint instanceof TVG.Shape) shapes.push(paint);
      return true;
    });

    expect(shapes).toHaveLength(2);
  });

  it('name resolves node names in accessible mode', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.accessible = true;
    picture.load(NAMED_SVG, { type: 'svg' });

    const accessor = new TVG.Accessor();
    const names: (string | null)[] = [];
    accessor.set(picture, (paint) => {
      names.push(accessor.name(paint.id));
      return true;
    });

    expect(names).toContain('background');
    expect(names).toContain('dot');
  });

  it('name matches the hash produced by Accessor.id', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.accessible = true;
    picture.load(NAMED_SVG, { type: 'svg' });

    const accessor = new TVG.Accessor();
    let resolved: string | null = null;
    accessor.set(picture, (paint) => {
      if (paint.id === TVG.Accessor.id('dot')) {
        resolved = accessor.name(paint.id);
        return false;
      }
      return true;
    });

    expect(resolved).toBe('dot');
  });

  it('name returns null without accessible mode', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(NAMED_SVG, { type: 'svg' });

    const accessor = new TVG.Accessor();
    const names: (string | null)[] = [];
    accessor.set(picture, (paint) => {
      names.push(accessor.name(paint.id));
      return true;
    });

    expect(names.length).toBeGreaterThan(0);
    expect(names.every((n) => n === null)).toBe(true);
  });

  it('name returns null for an unknown id', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.accessible = true;
    picture.load(NAMED_SVG, { type: 'svg' });

    const accessor = new TVG.Accessor();
    let result: string | null = 'unset';
    accessor.set(picture, () => {
      result = accessor.name(TVG.Accessor.id('does-not-exist'));
      return false;
    });

    expect(result).toBeNull();
  });

  it('name returns null outside of set()', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.accessible = true;
    picture.load(NAMED_SVG, { type: 'svg' });

    const accessor = new TVG.Accessor();
    accessor.set(picture, () => true);

    // Names only resolve while set() is traversing.
    expect(accessor.name(TVG.Accessor.id('background'))).toBeNull();
  });

  it('accessor is reusable across pictures', () => {
    const TVG = getTVG();
    const accessor = new TVG.Accessor();

    const first = new TVG.Picture();
    first.accessible = true;
    first.load(NAMED_SVG, { type: 'svg' });
    const second = new TVG.Picture();
    second.accessible = true;
    second.load(NAMED_SVG, { type: 'svg' });

    const seen: (string | null)[] = [];
    for (const picture of [first, second]) {
      accessor.set(picture, (paint) => {
        const name = accessor.name(paint.id);
        if (name) seen.push(name);
        return true;
      });
    }

    expect(seen.filter((n) => n === 'background')).toHaveLength(2);
  });

  it('dispose + GC should not double-free', () => {
    const TVG = getTVG();
    assertNoDoubleFree(() => new TVG.Accessor());
  });

  it('accessible defaults to false and round-trips', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();

    expect(picture.accessible).toBe(false);

    picture.accessible = true;
    expect(picture.accessible).toBe(true);

    picture.accessible = false;
    expect(picture.accessible).toBe(false);
  });
});
