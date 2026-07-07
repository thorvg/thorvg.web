import ThorVG from '@thorvg/webcanvas';
import type {
  Canvas,
  Paint,
  Scene,
  Shape,
  Text,
  RendererType,
  ThorVGNamespace,
} from '@thorvg/webcanvas';

import wasmUrl from '../node_modules/@thorvg/webcanvas/dist/thorvg.wasm?url';
import fontUrl from './assets/font.ttf';
import haloUrl from './assets/halo.jpg';
import lifeIconUrl from './assets/life.svg';

import { initUI, isSettingsOpen } from './ui';

/************************************************************************/
/* Math Utility                                                         */
/************************************************************************/

interface Point {
  x: number;
  y: number;
}

type RGB = [number, number, number];

const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const length2 = (p: Point): number => p.x * p.x + p.y * p.y;
const intersect = (a: Point, b: Point, dist2: number): boolean => length2(sub(a, b)) < dist2;
const lerp = (s: number, e: number, t: number): number => s + (e - s) * t;
const randInt = (n: number): number => Math.floor(Math.random() * n);

function extend(p: Point, len: number): void {
  const mag = Math.sqrt(length2(p));
  p.x *= len / mag;
  p.y *= len / mag;
}

/************************************************************************/
/* Core Game Logic                                                      */
/************************************************************************/

const WIDTH = 3840;   // base resolution
const HEIGHT = 2160;  // base resolution

let SCALE = 1;
let SWIDTH = 0;
let SHEIGHT = 0;
let LEVEL = 4;        // game level (0 ~ 9)

const _S = (a: number): number => a * SCALE;

const FONT_NAME = '04B_30__';

let TVG: ThorVGNamespace;
let canvas: Canvas;

interface GameAssets {
  font: Uint8Array;
  halo: Uint8Array;
  lifeIcon: string;
}

/************************************************************************/
/* WarZone                                                              */
/************************************************************************/

class WarZone {
  static readonly GALAXY_LAYER = 4;
  static readonly STARS_PER_LAYER = 100;

  min: Point = { x: -2000, y: -1180 };
  max: Point = { x: 2000, y: 1180 };
  bound: Point = { x: (WIDTH - this.max.x) * 0.5, y: (HEIGHT - this.max.y) * 0.5 };
  galaxy: Shape[] = [];
  model!: Scene;

  w(): number { return this.max.x - this.min.x; }
  h(): number { return this.max.y - this.min.y; }

  star(i: number, ox: number, oy: number, dx: number, dy: number): void {
    const layer = new TVG.Shape();
    const size = _S(2 * (i + 2));
    const rx = ox + dx * 2;
    const ry = oy + dy * 2;

    for (let s = 0; s < WarZone.STARS_PER_LAYER; ++s) {
      layer.appendRect(_S(randInt(rx) - dx), _S(randInt(ry) - dy), size, size);
    }
    const c = 200 + randInt(55);
    layer.fill(c, c, c);
    canvas.add(layer);
    this.galaxy[i] = layer;
  }

  init(haloData: Uint8Array): void {
    const halo = new TVG.Picture();
    halo.load(haloData, { type: 'jpg' });
    halo.size(SWIDTH, SHEIGHT);
    canvas.add(halo);

    //generate stars
    for (let i = 0; i < WarZone.GALAXY_LAYER; ++i) {
      this.star(i, WIDTH, HEIGHT, _S(150) * i, _S(150) * i);
    }

    //blue grids
    this.model = new TVG.Scene();
    this.model.scale(SCALE);

    const dx = (this.max.x - this.min.x) / 30;
    const dy = HEIGHT / 18;
    const lwidth = 2.0;
    let i = 0;

    for (let x = this.min.x + dx; x < this.max.x; x += dx, ++i) {
      const grid = new TVG.Shape();
      if ((i + 1) % 5 === 0) {
        grid.appendRect(x, this.min.y, lwidth * 3, this.h());
        grid.fill(50, 50, 175);
      } else {
        grid.appendRect(x, this.min.y, lwidth, this.h());
        grid.fill(50, 50, 125);
      }
      this.model.add(grid);
    }
    i = 0;
    for (let y = this.min.y + dy; y < this.max.y; y += dy, ++i) {
      const grid = new TVG.Shape();
      if ((i + 1) % 5 === 0) {
        grid.appendRect(this.min.x, y, this.w(), lwidth * 2);
        grid.fill(50, 50, 175);
      } else {
        grid.appendRect(this.min.x, y, this.w(), lwidth);
        grid.fill(50, 50, 125);
      }
      this.model.add(grid);
    }

    const border = (x: number, y: number, w: number, h: number, r: number, g: number, b: number, direction: number): void => {
      const wrapper = new TVG.Scene();
      wrapper.gaussianBlur(_S(10.0), direction, 0, 30);
      const line = new TVG.Shape();
      line.appendRect(x, y, w, h);
      line.fill(r, g, b);
      wrapper.add(line);
      this.model.add(wrapper);
    };

    border(this.min.x, this.min.y, this.w(), 10, 255, 100, 100, 2);     //top
    border(this.min.x, this.min.y, 10, this.h(), 0, 255, 255, 1);       //left
    border(this.max.x - 5, this.min.y, 10, this.h(), 170, 255, 170, 1); //right
    border(this.min.x, this.max.y, this.w(), 10, 255, 170, 255, 2);     //bottom

    canvas.add(this.model);
  }

  shift(player: Point): void {
    const x = player.x - SWIDTH / 2;
    const y = player.y - SHEIGHT / 2;

    for (let i = 0; i < WarZone.GALAXY_LAYER; ++i) {
      this.galaxy[i].translate(-x * _S((i + 1) * 0.2), -y * _S((i + 1) * 0.2));
    }
  }

  update(shift: Point): void {
    this.model.translate(shift.x, shift.y);
  }
}

/************************************************************************/
/* Launcher                                                             */
/************************************************************************/

const FIRESPEED = 500;
const MISSLE_MAX = 5;

class Fire {
  active = false;
  from: Point = { x: 0, y: 0 };
  to: Point = { x: 0, y: 0 };
  cur: Point = { x: 0, y: 0 };
  time = 0;

  constructor(readonly model: Scene) {}

  hit(target: Point, range: number): boolean {
    if (this.active && intersect(this.cur, target, range)) {
      this.inactivate();
      return true;
    }
    return false;
  }

  inactivate(): void {
    this.model.opacity(0);
    this.active = false;
  }
}

class Launcher {
  missles: Fire[] = [];
  actives = 0;
  lastshot = 0;
  fireRate = 150.0;
  clipper!: Paint;

  init(offset: number, clipper: Paint): void {
    const model = new TVG.Scene();
    model.clip(clipper);
    canvas.add(model);
    this.clipper = clipper;

    for (let i = 0; i < MISSLE_MAX; ++i) {
      const wrapper = new TVG.Scene();
      wrapper.dropShadow(255, 255, 0, 255, 0.0, 0.0, _S(30), 30);
      wrapper.opacity(0);
      const shape = new TVG.Shape();
      shape.appendCircle(_S(-20), -offset, _S(10), _S(70));
      shape.appendCircle(_S(20), -offset, _S(10), _S(70));
      shape.fill(255, 255, 170);
      wrapper.add(shape);
      this.missles.push(new Fire(wrapper));
      model.add(wrapper);
    }
  }

  update(pos: Point, direction: Point, dir: number, elapsed: number, shift: Point, shoot: boolean): void {
    this.clipper.translate(shift.x, shift.y);

    if (shoot && elapsed - this.lastshot > this.fireRate) this.lastshot = elapsed;
    else shoot = false;

    for (const fire of this.missles) {
      if (shoot && !fire.active) {
        fire.to = { x: direction.x, y: direction.y };
        extend(fire.to, _S(2700)); //fire distance
        fire.to = add(fire.to, pos);
        fire.from = { x: pos.x, y: pos.y };
        fire.time = elapsed;
        fire.active = true;
        fire.model.opacity(255);
        fire.model.rotate(dir);
        shoot = false;
        ++this.actives;
      }
      if (fire.active) {
        const progress = (elapsed - fire.time) / FIRESPEED;
        if (progress <= 1.0) {
          fire.cur = { x: lerp(fire.from.x, fire.to.x, progress), y: lerp(fire.from.y, fire.to.y, progress) };
          fire.model.translate(fire.cur.x, fire.cur.y);
        } else {
          fire.inactivate();
          --this.actives;
        }
      }
    }
  }
}

/************************************************************************/
/* Player                                                               */
/************************************************************************/

class Player {
  launcher = new Launcher();
  pos: Point = { x: 0, y: 0 };
  direction: Point = { x: 0, y: -1 };
  dir = 0.0;
  speed = 0.7;
  shoot = false;
  bound = 0;
  model!: Scene;

  init(pos: Point, clipper: Paint): void {
    this.bound = _S(40.0);

    this.launcher.init(this.bound * 3, clipper);

    const pts: ReadonlyArray<readonly [number, number]> = [
      [0, -15], [7, 0], [25, -7], [40, -30], [30, 10], [0, 30], [-30, 10], [-40, -30], [-25, -7], [-7, 0],
    ];

    const light = new TVG.Shape();
    light.appendCircle(0, 0, 95, 95);
    light.fill(255, 255, 255, 17);

    const shape = new TVG.Shape();
    shape.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; ++i) shape.lineTo(pts[i][0], pts[i][1]);
    shape.close();
    shape.fill(255, 255, 255, 127);
    shape.stroke({ width: 8.0, color: [200, 200, 255, 255] });

    this.model = new TVG.Scene();
    this.model.add(light);
    this.model.add(shape);

    this.model.translate(pos.x, pos.y);
    this.model.scale(SCALE);
    canvas.add(this.model);

    this.pos = { x: pos.x, y: pos.y };
  }

  forward(zone: WarZone, multiplier: number): void {
    const radian = (this.dir / 180.0) * Math.PI;
    const move: Point = { x: _S(Math.sin(radian)), y: _S(Math.cos(radian)) };
    extend(move, _S(multiplier * 0.4));
    this.pos.x += move.x;
    this.pos.y -= move.y;

    //boundary limit
    const shift = zone.bound;
    if (this.pos.x - this.bound < _S(shift.x)) {
      this.pos.x = this.bound + _S(shift.x);
    } else if (this.pos.x + this.bound > _S(WIDTH - shift.x)) {
      this.pos.x = _S(WIDTH - shift.x) - this.bound;
    }
    if (this.pos.y - this.bound < _S(shift.y)) {
      this.pos.y = this.bound + _S(shift.y);
    } else if (this.pos.y + this.bound > _S(HEIGHT - shift.y)) {
      this.pos.y = _S(HEIGHT - shift.y) - this.bound;
    }

    zone.shift(this.pos);
  }

  left(multiplier: number): void {
    this.dir -= _S(this.speed) * multiplier;
  }

  right(multiplier: number): void {
    this.dir += _S(this.speed) * multiplier;
  }

  update(elapsed: number, shift: Point): void {
    const radian = (this.dir / 180.0) * Math.PI;
    this.direction = { x: Math.sin(radian), y: -Math.cos(radian) };

    this.launcher.update(this.pos, this.direction, this.dir, elapsed, shift, this.shoot);
    this.model.resetEffects();
    this.model.dropShadow(200, 200, 255, 255, this.dir + 180.0, _S(20.0), _S(30), 30);
    this.model.rotate(this.dir);
    this.model.translate(this.pos.x, this.pos.y);
  }
}

/************************************************************************/
/* Enemies                                                              */
/************************************************************************/

const ENEMY_DURATION_LEVEL = 1000;
const ENEMY_MAX_ROTATION = 20;
const ENEMY_BASETIME = 9200;

abstract class Enemy {
  static DURATION = 9500 - LEVEL * ENEMY_DURATION_LEVEL;
  static BOUND = 0;

  readonly model: Shape;
  pos = { from: { x: 0, y: 0 }, to: { x: 0, y: 0 }, cur: { x: 0, y: 0 } };
  dir = { from: 0, to: 0 };
  time = { at: 0, duration: 0 };

  constructor(readonly type: number) {
    this.model = new TVG.Shape();
    this.model.scale(SCALE);
    this.model.blend(TVG.BlendMethod.Add);
  }

  init(elayer: Scene, elapsed: number): void {
    const B = Enemy.BOUND;
    if (this.type === 0) {         //top -> bottom
      this.pos.from = { x: randInt(SWIDTH), y: -B * 2 };
      this.pos.to = { x: randInt(SWIDTH), y: SHEIGHT + B * 2 };
    } else if (this.type === 1) {  //right -> left
      this.pos.from = { x: SWIDTH + B, y: randInt(SHEIGHT) };
      this.pos.to = { x: -B, y: randInt(SHEIGHT) };
    } else if (this.type === 2) {  //bottom -> top
      this.pos.from = { x: randInt(SWIDTH), y: SHEIGHT + B * 2 };
      this.pos.to = { x: randInt(SWIDTH), y: -B * 2 };
    } else if (this.type === 3) {  //left -> right
      this.pos.from = { x: -B, y: randInt(SHEIGHT) };
      this.pos.to = { x: SWIDTH + B, y: randInt(SHEIGHT) };
    }

    this.time = { at: elapsed, duration: ENEMY_BASETIME + randInt(Enemy.DURATION) };
    this.dir = { from: randInt(360), to: randInt(360 * ENEMY_MAX_ROTATION) };
    this.model.rotate(this.dir.from);
    this.model.translate(this.pos.from.x, this.pos.from.y);
    elayer.add(this.model);
  }

  //returns 0: alive, 1: expired, 2: hit by missile. target receives screen position
  update(elapsed: number, launcher: Launcher, p2o: Point, target: Point): number {
    const progress = (elapsed - this.time.at) / this.time.duration;
    if (progress > 1.0) return 1;

    this.pos.cur = { x: lerp(this.pos.from.x, this.pos.to.x, progress), y: lerp(this.pos.from.y, this.pos.to.y, progress) };
    target.x = this.pos.cur.x + p2o.x;
    target.y = this.pos.cur.y + p2o.y;

    const range = Math.pow(Enemy.BOUND + Enemy.BOUND, 2);

    if (launcher.actives > 0) {
      for (const fire of launcher.missles) {
        if (fire.hit(target, range)) {
          --launcher.actives;
          return 2;
        }
      }
    }

    this.model.translate(this.pos.cur.x, this.pos.cur.y);
    this.model.rotate(lerp(this.dir.from, this.dir.to, progress));

    return 0;
  }

  abstract color(): RGB;
}

class Boxer extends Enemy {
  static readonly type = 0;

  constructor(elayer: Scene, elapsed: number) {
    super(Boxer.type);
    this.model.appendRect(-40, -40, 80, 80);
    this.model.fill(50, 0, 0);
    this.model.stroke({ width: 8.0, color: [255, 50, 50, 255] });
    this.init(elayer, elapsed);
  }

  color(): RGB { return [255, 50, 50]; }
}

class Tripod extends Enemy {
  static readonly type = 1;

  constructor(elayer: Scene, elapsed: number) {
    super(Tripod.type);
    this.model.moveTo(0, -40).lineTo(40, 40).lineTo(-40, 40).close();
    this.model.fill(0, 50, 0);
    this.model.stroke({ width: 8.0, color: [170, 255, 170, 255] });
    this.init(elayer, elapsed);
  }

  color(): RGB { return [170, 255, 170]; }
}

class Sander extends Enemy {
  static readonly type = 2;

  constructor(elayer: Scene, elapsed: number) {
    super(Sander.type);
    const pts = [[0, -8], [40, -40], [40, 40], [0, 8], [-40, 40], [-40, -40]];
    this.model.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; ++i) this.model.lineTo(pts[i][0], pts[i][1]);
    this.model.close();
    this.model.fill(50, 35, 50);
    this.model.stroke({ width: 8.0, color: [255, 120, 255, 255] });
    this.init(elayer, elapsed);
  }

  color(): RGB { return [255, 120, 255]; }
}

class Hexen extends Enemy {
  static readonly type = 3;

  constructor(elayer: Scene, elapsed: number) {
    super(Hexen.type);
    const pts = [[0, -40], [40, -20], [40, 20], [0, 40], [-40, 20], [-40, -20]];
    this.model.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; ++i) this.model.lineTo(pts[i][0], pts[i][1]);
    this.model.close();
    this.model.fill(0, 50, 50);
    this.model.stroke({ width: 8.0, color: [0, 255, 255, 255] });
    this.init(elayer, elapsed);
  }

  color(): RGB { return [0, 255, 255]; }
}

type EnemyCtor = (new (elayer: Scene, elapsed: number) => Enemy) & { readonly type: number };

const ENEMY_TYPES: EnemyCtor[] = [Boxer, Tripod, Sander, Hexen];

/************************************************************************/
/* Explosion                                                            */
/************************************************************************/

const PARTICLE_TIME = 1000;
const PARTICLE_NUM = 6;
const PARTICLE_MAX_ROTATION = 10;
const PARTICLE_DIST = 250;
const PARTICLE_EXTRA = 80;

interface Particle {
  shape: Shape;
  to: Point;
  dir: { from: number; to: number };
}

interface Flash {
  shape: Shape;
  to: Point;
}

class Explosion {
  readonly model: Scene;
  begin = 0;
  pos: Point = { x: 0, y: 0 };
  destroy = false;
  particle: Particle[] = [];
  flashes: Flash[] = [];

  constructor() {
    this.model = new TVG.Scene();

    //destroy particle
    for (let i = 0; i < PARTICLE_NUM; ++i) {
      const shape = new TVG.Shape();
      shape.appendRect(0, 0, _S(8.0), _S(60.0));
      shape.opacity(0);
      this.model.add(shape);
      this.particle.push({ shape, to: { x: 0, y: 0 }, dir: { from: 0, to: 0 } });
    }

    //flash particle
    for (let i = 0; i < PARTICLE_EXTRA; ++i) {
      const shape = new TVG.Shape();
      shape.blend(TVG.BlendMethod.Add);
      this.model.add(shape);
      this.flashes.push({ shape, to: { x: 0, y: 0 } });
    }
  }

  initFlash(pos: Point, elapsed: number): void {
    const w1 = _S(14.0);
    for (let i = 0; i < PARTICLE_EXTRA / 2; ++i) {
      const length = _S(randInt(40) + 40);
      const f = this.flashes[i];
      f.shape.reset();
      f.shape.appendRect(-w1, -length, w1 * 2.0, length * 2, { rx: w1, ry: length });
      const dir = randInt(360);
      f.shape.rotate(dir);
      const to = length * 25.0;
      const rad = (dir / 180.0) * Math.PI;
      f.to.x = -to * Math.sin(rad) + pos.x;
      f.to.y = +to * Math.cos(rad) + pos.y;
    }

    const w2 = _S(1.5);
    for (let i = PARTICLE_EXTRA / 2; i < PARTICLE_EXTRA; ++i) {
      const length = _S(randInt(40) + 40);
      const f = this.flashes[i];
      f.shape.reset();
      f.shape.appendRect(-w2, -length, w2 * 2.0, length * 2);
      const dir = randInt(360);
      f.shape.rotate(dir);
      const to = length * 30.0;
      const rad = (dir / 180.0) * Math.PI;
      f.to.x = -to * Math.sin(rad) + pos.x;
      f.to.y = +to * Math.cos(rad) + pos.y;
    }

    this.destroy = false;
    this.pos = { x: pos.x, y: pos.y };
    this.begin = elapsed;

    for (const p of this.particle) p.shape.opacity(0);
  }

  initDestroy(pos: Point, dir: Point, color: RGB, elapsed: number): void {
    const d: Point = { x: dir.x, y: dir.y };
    extend(d, _S(PARTICLE_DIST));

    for (const p of this.particle) {
      p.shape.fill(color[0], color[1], color[2]);
      p.to.x = _S(randInt(1000)) - _S(500) + pos.x + d.x;
      p.to.y = _S(randInt(1000)) - _S(500) + pos.y + d.y;
      p.dir.from = randInt(360);
      p.dir.to = randInt(PARTICLE_MAX_ROTATION);
    }
    this.initFlash(pos, elapsed);
    this.destroy = true;
  }

  update(elapsed: number): boolean {
    const progress = (elapsed - this.begin) / PARTICLE_TIME;
    if (progress > 1.0) {
      for (const p of this.particle) p.shape.opacity(0);
      return true;
    }

    if (this.destroy) {
      const c = 255 - 255 * progress;
      for (const p of this.particle) {
        p.shape.translate(lerp(this.pos.x, p.to.x, progress), lerp(this.pos.y, p.to.y, progress));
        p.shape.rotate(lerp(p.dir.from, p.dir.to, progress));
        p.shape.scale(1.0 - 0.25 * progress);
        p.shape.opacity(c);
      }
    }

    const scale = 1.0 - 0.75 * progress;
    const sc = Math.floor(200.0 * Math.cos(progress));

    for (let i = 0; i < PARTICLE_EXTRA / 2; ++i) {
      const f = this.flashes[i];
      f.shape.translate(lerp(this.pos.x, f.to.x, progress), lerp(this.pos.y, f.to.y, progress));
      f.shape.fill(randInt(255), randInt(255), randInt(255), sc);
      f.shape.scale(scale);
    }

    const col = Math.max(Math.floor(255 - 255 * progress * 2.0), 0);

    for (let i = PARTICLE_EXTRA / 2; i < PARTICLE_EXTRA; ++i) {
      const f = this.flashes[i];
      f.shape.translate(lerp(this.pos.x, f.to.x, progress), lerp(this.pos.y, f.to.y, progress));
      f.shape.fill(255, 255, col, col);
      f.shape.scale(scale);
    }

    return false;
  }
}

/************************************************************************/
/* GarbageCollector (object pooling)                                    */
/************************************************************************/

class GarbageCollector {
  enemies: Enemy[][] = [[], [], [], []];
  explosions: Explosion[] = [];
  elayer!: Scene;

  getEnemy(Type: EnemyCtor, elapsed: number): Enemy {
    const pool = this.enemies[Type.type];
    if (pool.length === 0) return new Type(this.elayer, elapsed);
    const ret = pool.pop()!;
    ret.init(this.elayer, elapsed);
    return ret;
  }

  retrieveEnemy(e: Enemy): void {
    this.enemies[e.type].push(e);
  }

  getExplosion(): Explosion {
    if (this.explosions.length === 0) return new Explosion();
    return this.explosions.pop()!;
  }

  retrieveExplosion(e: Explosion): void {
    this.explosions.push(e);
  }
}

/************************************************************************/
/* Combo                                                                */
/************************************************************************/

const COMBO_TIME = 750.0;

class Combo {
  readonly text: Text;
  time = 0;

  constructor() {
    this.text = new TVG.Text();
    this.text.font(FONT_NAME);
    this.text.fontSize(_S(50));
    this.text.fill(170, 255, 80);
  }

  init(layer: Scene, pos: Point, counter: number, elapsed: number): void {
    this.text.text(`${counter}x combo!`);
    this.text.translate(pos.x, pos.y);
    this.text.opacity(255);
    this.text.scale(1.0);
    layer.add(this.text);
    this.time = elapsed;
  }

  update(elapsed: number): boolean {
    const progress = (elapsed - this.time) / COMBO_TIME;
    if (progress <= 1.0) {
      this.text.opacity(255 - 255 * progress);
      this.text.scale(1.0 + 0.2 * progress);
      return false;
    }
    return true;
  }
}

class ComboMgr {
  layer!: Scene;
  combos: Combo[] = [];
  recycle: Combo[] = [];
  type = -1;
  counter = 0;

  init(): void {
    this.layer = new TVG.Scene();
    canvas.add(this.layer);
  }

  trigger(type: number, pos: Point, elapsed: number): number {
    if (this.type === type) {
      ++this.counter;
      const combo = this.recycle.pop() ?? new Combo();
      combo.init(this.layer, pos, this.counter, elapsed);
      this.combos.push(combo);
    } else {
      this.type = type;
      this.counter = 1;
    }
    return this.counter;
  }

  update(elapsed: number): void {
    for (let i = this.combos.length - 1; i >= 0; --i) {
      const combo = this.combos[i];
      if (combo.update(elapsed)) {
        this.layer.remove(combo.text);
        this.recycle.push(combo);
        this.combos.splice(i, 1);
      }
    }
  }
}

/************************************************************************/
/* ThorJanitor (main game)                                              */
/************************************************************************/

const LIFE_CNT = 3;
const RESPAWN_LEVEL = 100;

class ThorJanitor {
  player = new Player();
  gc = new GarbageCollector();
  zone = new WarZone();
  enemies: Enemy[] = [];
  explosions: Explosion[] = [];
  combo = new ComboMgr();
  elayer!: Scene;
  clipper!: Shape;

  tick = { respawn: 0, last: 0, end: 0 };
  lives = { count: LIFE_CNT, icon: [] as Scene[], flash: null as Shape | null, last: 0, active: false };
  gui = {} as { fps: Text; wipes: Text; lv: Text };
  origin: Point = { x: 0, y: 0 };

  respawnTime = 1000 - LEVEL * RESPAWN_LEVEL;
  wipesCnt = LEVEL * 100;
  gameplay = true;
  updatedWipes = true;
  fps = 0;

  keystate: Record<string, boolean> = {};

  content(assets: GameAssets): void {
    this.origin = { x: _S(WIDTH / 2), y: _S(HEIGHT / 2) };

    Enemy.BOUND = _S(80.0);

    this.zone.init(assets.halo);

    this.clipper = new TVG.Shape();
    this.clipper.appendRect(this.zone.min.x, this.zone.min.y, this.zone.w() + 10, this.zone.h() + 10);
    this.clipper.scale(SCALE);

    this.player.init({ x: SWIDTH * 0.5, y: SHEIGHT * 0.5 }, this.clipper.duplicate());

    this.elayer = new TVG.Scene();
    this.elayer.clip(this.clipper);
    canvas.add(this.elayer);
    this.gc.elayer = this.elayer;

    this.combo.init();

    //lives
    this.lives.flash = new TVG.Shape();
    this.lives.flash.appendRect(0, 0, SWIDTH, SHEIGHT);
    this.lives.flash.fill(255, 255, 170);
    this.lives.flash.opacity(0);

    //life icon
    const size: Point = { x: _S(150), y: _S(150) };
    const icon = new TVG.Scene();
    icon.dropShadow(170, 255, 80, 255, 0.0, 0.0, _S(15), 30);
    const pic = new TVG.Picture();
    pic.load(assets.lifeIcon, { type: 'svg' });
    pic.size(size.x, size.y);
    icon.add(pic);
    icon.translate(0, SHEIGHT - size.y);
    this.lives.icon[0] = icon;
    canvas.add(icon);

    for (let i = 1; i < LIFE_CNT; ++i) {
      const dup = this.lives.icon[0].duplicate<Scene>();
      dup.translate(size.x * i, SHEIGHT - size.y);
      this.lives.icon[i] = dup;
      canvas.add(dup);
    }

    //gui texts - fps
    TVG.Font.load(FONT_NAME, assets.font);
    this.gui.fps = new TVG.Text();
    this.gui.fps.font(FONT_NAME);
    this.gui.fps.fontSize(25);
    this.gui.fps.text('FPS: 0');
    this.gui.fps.translate(10, 10);
    this.gui.fps.fill(170, 255, 80);
    this.gui.fps.scale(SCALE);
    canvas.add(this.gui.fps);

    //gui texts - wipes
    const wrapper = new TVG.Scene();
    wrapper.dropShadow(170, 255, 80, 255, 0.0, 0.0, _S(20), 30);
    this.gui.wipes = new TVG.Text();
    this.gui.wipes.font(FONT_NAME);
    this.gui.wipes.fontSize(50);
    this.gui.wipes.text('0 Wipes');
    this.gui.wipes.fill(170, 255, 80);
    this.gui.wipes.translate(SWIDTH / 2, 10);
    this.gui.wipes.align(0.5, 0.0);
    this.gui.wipes.scale(SCALE);
    wrapper.add(this.gui.wipes);
    canvas.add(wrapper);

    //gui texts - level
    this.gui.lv = new TVG.Text();
    this.gui.lv.font(FONT_NAME);
    this.gui.lv.fontSize(40);
    this.gui.lv.fill(170, 255, 80);
    this.gui.lv.translate(SWIDTH - _S(20), _S(20));
    this.gui.lv.align(1.0, 0.0);
    this.gui.lv.scale(SCALE);
    this.gui.lv.text(`Level ${LEVEL + 1}`);
    canvas.add(this.gui.lv);
  }

  updateGUI(updateFPS: boolean): void {
    if (this.updatedWipes) {
      this.gui.wipes.text(`${this.wipesCnt} Wipes`);
      this.updatedWipes = false;
    }
    // update fps after a certain elapsed time,
    // otherwise it's difficult to read if text is changed every frame.
    if (updateFPS) {
      this.gui.fps.text(`FPS: ${this.fps}`);
    }
  }

  destroyEnemy(e: Enemy, direction: Point, elapsed: number): void {
    const exp = this.gc.getExplosion();
    exp.initDestroy(e.pos.cur, direction, e.color(), elapsed);
    this.explosions.push(exp);
    this.elayer.add(exp.model);
  }

  destroyAt(pos: Point, elapsed: number): void {
    const exp = this.gc.getExplosion();
    exp.initFlash(pos, elapsed);
    this.explosions.push(exp);
    this.elayer.add(exp.model);
  }

  input(elapsed: number): void {
    this.player.shoot = false;

    const diff = elapsed - this.tick.last;
    if (this.keystate['KeyA'] || this.keystate['Space']) this.player.shoot = true;
    if (this.keystate['ArrowRight']) this.player.right(diff);
    if (this.keystate['ArrowLeft']) this.player.left(diff);
    if (this.keystate['ArrowUp']) this.player.forward(this.zone, diff);
  }

  gamelevel(): void {
    if (LEVEL < 9 && Math.floor(this.wipesCnt / 100) > LEVEL) {
      this.gui.lv.text(`Level ${++LEVEL + 1}`);
      this.respawnTime -= RESPAWN_LEVEL;
      Enemy.DURATION -= ENEMY_DURATION_LEVEL;
    }
  }

  dead(elapsed: number): void {
    this.gameplay = false;
    for (const e of this.enemies) {
      this.destroyEnemy(e, this.player.direction, elapsed);
      this.elayer.remove(e.model);
      this.gc.retrieveEnemy(e);
    }
    this.enemies = [];

    if (this.lives.count > 0 && elapsed - this.lives.last > 1000) {
      --this.lives.count;
      canvas.remove(this.lives.icon[this.lives.count]);
      this.lives.last = elapsed;
      this.lives.active = true;
      canvas.add(this.lives.flash!);
    }

    this.player.launcher.actives = 0;
    for (const fire of this.player.launcher.missles) {
      fire.inactivate();
    }

    this.player.model.visible(false);
    this.tick.end = elapsed;
  }

  reset(elapsed: number): void {
    if (elapsed - this.tick.end < (this.lives.count === 0 ? 3000 : 1000)) return;

    //all life exhausted. total reset
    if (this.lives.count === 0) {
      console.log(`Good Job!, Your Wipes: ${this.wipesCnt}`);

      LEVEL = 0;
      this.wipesCnt = 0;
      this.updatedWipes = true;
      this.respawnTime = 1000;
      Enemy.DURATION = 10000;
      this.player.pos = { x: SWIDTH / 2, y: SHEIGHT / 2 };
      this.zone.shift(this.player.pos);

      this.lives.count = LIFE_CNT;
      for (let i = 0; i < LIFE_CNT; i++) {
        canvas.add(this.lives.icon[i]);
      }

      this.gui.lv.text(`Level ${LEVEL + 1}`);
    }

    this.player.model.visible(true);
    this.gameplay = true;
    this.tick.end = elapsed;
    this.combo.type = -1;
  }

  update(elapsed: number): void {
    const shift = sub(this.origin, sub(this.player.pos, this.origin));

    if (this.gameplay) {
      this.input(elapsed);
      this.player.update(elapsed, shift);
      this.zone.update(shift);
      this.clipper.translate(shift.x, shift.y);
    } else {
      //player dead flash effect
      if (this.lives.active) {
        const progress = (elapsed - this.lives.last) / 50;
        if (progress > 1.0) {
          canvas.remove(this.lives.flash!);
          this.lives.active = false;
        } else {
          this.lives.flash!.opacity(Math.floor(255 * Math.sin(3.14 * progress)));
        }
      }
      this.reset(elapsed);
    }

    const p2o = sub(this.origin, this.player.pos);
    this.elayer.translate(p2o.x, p2o.y);

    //enemies
    if (this.gameplay) {
      const target: Point = { x: 0, y: 0 };
      const range = Math.pow(this.player.bound + Enemy.BOUND, 2);
      for (let i = 0; i < this.enemies.length; ) {
        const e = this.enemies[i];
        //collide with the player
        if (intersect(this.player.pos, add(e.pos.cur, p2o), range)) {
          this.dead(elapsed);
          break;
        }
        //update enemies
        const ret = e.update(elapsed, this.player.launcher, p2o, target);
        if (ret) {
          if (ret === 2) {  //hit by missile
            this.wipesCnt += this.combo.trigger(e.type, target, elapsed);
            this.updatedWipes = true;
            this.destroyEnemy(e, this.player.direction, elapsed);
            this.gamelevel();
          }
          this.elayer.remove(e.model);
          this.gc.retrieveEnemy(e);
          this.enemies.splice(i, 1);
        } else {
          ++i;
        }
      }
    }

    //hit walls
    for (const fire of this.player.launcher.missles) {
      if (!fire.active) continue;
      if (fire.cur.x < _S(this.zone.min.x) + shift.x || fire.cur.x > _S(this.zone.max.x) + shift.x ||
          fire.cur.y < _S(this.zone.min.y) + shift.y || fire.cur.y > _S(this.zone.max.y) + shift.y) {
        this.destroyAt(sub(fire.cur, p2o), elapsed);
        fire.inactivate();
      }
    }

    //explosions
    for (let i = 0; i < this.explosions.length; ) {
      const e = this.explosions[i];
      if (e.update(elapsed)) {
        this.gc.retrieveExplosion(e);
        this.elayer.remove(e.model);
        this.explosions.splice(i, 1);
        continue;
      }
      ++i;
    }

    this.combo.update(elapsed);

    this.updateGUI(this.respawn(elapsed));

    canvas.update();

    this.tick.last = elapsed;
  }

  respawn(elapsed: number): boolean {
    if (!this.gameplay || elapsed - this.tick.respawn < this.respawnTime) return false;
    this.tick.respawn = elapsed;

    //random enemy respawn
    for (const Type of ENEMY_TYPES) {
      if (randInt(2)) this.enemies.push(this.gc.getEnemy(Type, elapsed));
    }

    return true;
  }
}

/************************************************************************/
/* Bootstrap                                                            */
/************************************************************************/

async function main(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const renderer = (params.get('renderer') || 'gl') as RendererType;

  SCALE = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  SWIDTH = Math.floor(WIDTH * SCALE);
  SHEIGHT = Math.floor(HEIGHT * SCALE);

  const [fontBuf, haloBuf, lifeIcon] = await Promise.all([
    fetch(fontUrl).then((r) => r.arrayBuffer()),
    fetch(haloUrl).then((r) => r.arrayBuffer()),
    fetch(lifeIconUrl).then((r) => r.text()),
  ]);

  TVG = await ThorVG.init({
    locateFile: () => wasmUrl,
    renderer,
  });

  const el = document.getElementById('canvas') as HTMLCanvasElement;
  el.style.width = `${SWIDTH}px`;
  el.style.height = `${SHEIGHT}px`;
  canvas = new TVG.Canvas('#canvas', { width: SWIDTH, height: SHEIGHT });

  const game = new ThorJanitor();
  game.content({
    font: new Uint8Array(fontBuf),
    halo: new Uint8Array(haloBuf),
    lifeIcon,
  });

  initUI(renderer, TVG.version);

  //keyboard input
  window.addEventListener('keydown', (e) => {
    if (isSettingsOpen()) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    game.keystate[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    game.keystate[e.code] = false;
  });
  window.addEventListener('blur', () => {
    game.keystate = {};
  });

  //game loop
  const begin = performance.now();
  let frames = 0;
  let fpsTime = 0;

  const loop = (): void => {
    const elapsed = Math.floor(performance.now() - begin);

    //fps counter
    ++frames;
    if (elapsed - fpsTime >= 1000) {
      game.fps = Math.round((frames * 1000) / (elapsed - fpsTime));
      frames = 0;
      fpsTime = elapsed;
    }

    game.update(elapsed);
    canvas.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

main().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML(
    'beforeend',
    `<pre style="color:#f66;position:absolute;top:8px;left:8px;z-index:9">${err}</pre>`
  );
});
