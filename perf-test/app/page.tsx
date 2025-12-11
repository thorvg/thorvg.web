'use client'
import { Listbox, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { isDesktop } from 'react-device-detect';
import wasmUrl from "../node_modules/@thorvg/lottie-player/dist/thorvg.wasm";

const animations = [
  '1643-exploding-star.json',
  '5317-fireworkds.json',
  '5344-honey-sack-hud.json',
  '11555.json',
  '27746-joypixels-partying-face-emoji-animation.json',
  'R_QPKIVi.json',
  'abstract_circle.json',
  'alien.json',
  'anubis.json',
  'balloons_with_string.json',
  'birth_stone_logo.json',
  'calculator.json',
  'card_hover.json',
  'cat_loader.json',
  'coin.json',
  'confetti.json',
  'confetti2.json',
  'confettiBird.json',
  'dancing_book.json',
  'dancing_star.json',
  'dash-offset.json',
  'day_to_night.json',
  'dodecahedron.json',
  'down.json',
  'dropball.json',
  'duck.json',
  'emoji_enjoying.json',
  'emoji.json',
  'fleche.json',
  'flipping_page.json',
  'fly_in_beaker.json',
  'focal_test.json',
  'foodrating.json',
  'frog_vr.json',
  'fun_animation.json',
  'funky_chicken.json',
  'game_finished.json',
  'geometric.json',
  'glow_loading.json',
  'ghost.json',
  'ghost2.json',
  'gradient_background.json',
  'gradient_infinite.json',
  'gradient_sleepy_loader.json',
  'gradient_smoke.json',
  'graph.json',
  'growup.json',
  'guitar.json',
  'hamburger.json',
  'happy_holidays.json',
  'happy_trio.json',
  'heart_fill.json',
  'hola.json',
  'holdanimation.json',
  'hourglass.json',
  'isometric.json',
  'kote.json',
  'la_communaute.json',
  '1f409.json',
  'like_button.json',
  'like.json',
  'loading_rectangle.json',
  'lolo_walk.json',
  'lolo.json',
  'loveface_emoji.json',
  'masking.json',
  'material_wave_loading.json',
  'merging_shapes.json',
  'message.json',
  'monkey.json',
  'morphing_anim.json',
  'new_design.json',
  'page_slide.json',
  'personal_character.json',
  'polystar_anim.json',
  'polystar.json',
  'property_market.json',
  'pumpkin.json',
  'ripple_loading_animation.json',
  'rufo.json',
  'sample.json',
  'seawalk.json',
  'shutup.json',
  'skullboy.json',
  'starburst.json',
  'starstrips.json',
  'starts_transparent.json',
  'stroke_dash.json',
  'swinging.json',
  'text_anim.json',
  'text2.json',
  'textblock.json',
  'textrange.json',
  'threads.json',
  'train.json',
  'uk_flag.json',
  'voice_recognition.json',
  'water_filling.json',
  'waves.json',
  'yarn_loading.json'
] as const;

enum RendererOption {
  SW = 'ThorVG(Software)',
  WG = 'ThorVG(WebGPU)',
}

interface Animation {
  name: string;
  lottieURL: string;
}

const DEFAULT_COUNT = 20;
const EXAMPLE_URL_PREFIX = 'https://raw.githubusercontent.com/thorvg/thorvg/main/examples/resources/lottie/';
const COUNT_OPTIONS = [10, 20, 50, 100] as const;

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

function setQueryStringParameter(name: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${params}`));
}

let initialized = false;

export default function Home() {
  const MIN_SIZE = 50;
  const MAX_SIZE = 180;
  const DEFAULT_SIZE = isDesktop ? 180 : 150;

  const [size, setSize] = useState(DEFAULT_SIZE);
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [text, setText] = useState('');
  const [animationList, setAnimationList] = useState<Animation[]>([]);
  const [contentSize, setContentSize] = useState<{width: number, height: number}>({width: 0, height: 0});
  const [player, setPlayer] = useState<RendererOption>(RendererOption.SW);
  const [selectedPlayer, setSelectedPlayer] = useState<RendererOption>(RendererOption.SW);

  useEffect(() => {
    if (initialized) return;
    initialized = true;

    // Parse URL parameters
    let seed: string | null = null;
    let count = DEFAULT_COUNT;
    let size = DEFAULT_SIZE;

    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const playerString = params.get('player');
      const countString = params.get('count');
      const sizeString = params.get('size');
      seed = params.get('seed');

      if (countString) {
        count = parseInt(countString);
        setCount(count);
      }

      if (sizeString) {
        size = parseInt(sizeString);
        setSize(size);
      }

      if (playerString && Object.values(RendererOption).includes(playerString as RendererOption)) {
        setPlayer(playerString as RendererOption);
        setSelectedPlayer(playerString as RendererOption);
      }
    }

    // @ts-ignore: Dynamic import for SSR compatibility
    import("@thorvg/lottie-player");

    requestAnimationFrame(() => {
      loadProfiler();
      seed ? loadSeed(seed) : loadAnimationByCount(count);
    });
  }, []);

  const checkCanvasSize = (playerRef?: HTMLElement) => {
    const player = playerRef || document.querySelector('lottie-player');
    const canvas = player?.querySelector('canvas');
    if (!player || !canvas) {
      return;
    }

    setContentSize({
      width: canvas.width,
      height: canvas.height
    });
  };

  const handleSliderChange = (value: number) => {
    setSize(value);
    setQueryStringParameter('size', value.toString());
    requestAnimationFrame(() => checkCanvasSize());
  };

  const loadProfiler = () => {
    const script = document.createElement("script");
    script.src = "/profiler.js";
    document.body.appendChild(script);
  }

  const loadAnimationByCount = async (count = DEFAULT_COUNT) => {
    const newAnimationList: Animation[] = [];

    for (let i = 0; i < count; i++) {
      const anim = animations[Math.floor(Math.random() * animations.length)];
      newAnimationList.push({
        name: anim.split('/').pop()?.split('.')[0] || 'Unknown',
        lottieURL: `${EXAMPLE_URL_PREFIX}${anim}`,
      });
    }

    setAnimationList(newAnimationList);
    saveCurrentSeed(newAnimationList);
  };

  const saveCurrentSeed = (animationList: Animation[]) => {
    const nameList = animationList.map((animation) => animation.name).join(',');
    const seed = btoa(nameList);
    setQueryStringParameter('seed', seed);
  }

  const loadSeed = (seed: string) => {
    const nameList = atob(seed).split(',');
    const newAnimationList: Animation[] = nameList.map((name: string) => {
      const anim = animations.find((a) => a === `${name.trim()}.json`) || animations[0];
      return {
        name: name.trim(),
        lottieURL: `${EXAMPLE_URL_PREFIX}${anim}`,
      };
    });
    setAnimationList(newAnimationList);
  }

  const setNewOption = () => {
    // Apply selected values to URL parameters
    setQueryStringParameter('player', selectedPlayer);
    setQueryStringParameter('count', count.toString());
    setQueryStringParameter('seed', '');
    window.location.reload();
  }

  const spawnAnimation = () => {
    if (!text.trim()) {
      alert("Please enter a valid link");
      return;
    }

    const randomIndex = Math.floor(Math.random() * animationList.length);
    const updatedList = [...animationList];
    updatedList[randomIndex] = {
      lottieURL: text,
      name: text.split('/').pop()?.split('.')[0] || 'Unknown',
    };
    setAnimationList(updatedList);

    requestAnimationFrame(() => {
      document.querySelector(`.animation-${randomIndex}`)?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  return (
    <div className="bg-gray-900 pt-4 pb-24 sm:pb-32 sm:pt-8 pt-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <div className="mt-6 flex w-full flex-wrap gap-x-4 gap-y-4 align-middle flex-row">

            <h1 className='text-justify text-center text-white leading-[52px] sm:block hidden'>Player: </h1>

            <Listbox value={selectedPlayer} onChange={setSelectedPlayer}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white/5 py-3.5 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{selectedPlayer}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute w-full z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {Object.values(RendererOption).map((option) => (
                  <ListboxOption
                    key={option}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {option}
                        </span>

                        {selected && (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </>
      )}
    </Listbox>

    <Listbox value={count} onChange={setCount}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white/5 py-3.5 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{count}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {COUNT_OPTIONS.map((option) => (
                  <ListboxOption
                    key={option}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {option}
                        </span>

                        {selected && (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </>
      )}
    </Listbox>

              <button
                type="submit"
                className="flex-none rounded-md bg-[#00deb5] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={setNewOption}
              >
                Set
              </button>
              <div className="text-white w-full sm:flex-1 sm:min-w-[240px]">
                <label className="block mb-2">
                  Size: {contentSize.width}px
                </label>
                <input
                  type="range"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={size}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="slider"
                  style={{
                    background: `linear-gradient(to right, #00deb5 0%, #00deb5 ${((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 100}%, #444 ${((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 100}%, #444 100%)`,
                  }}
                />
              </div>
          </div>

          <div className="mt-6 flex w-full gap-x-4">
              <label htmlFor="animation-url" className="sr-only">
                link address
              </label>
              <input
                id="animation-url"
                name="link"
                type="link"
                autoComplete="link"
                required
                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Enter Lottie link to randomly spawn given animation"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <button
                type="submit"
                className="flex-none rounded-md bg-[#00deb5] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={spawnAnimation}
              >
                Spawn
              </button>
            </div>
        </div>
        <ul
          role="list"
          className="animation-list mx-auto mt-20 grid gap-x-8 gap-y-14 lg:mx-0 lg:max-w-none justify-items-center"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${size}px, 1fr))` }}
        >
          {animationList.map((anim: Animation, index: number) => (
            <li key={`${anim.lottieURL}-${index}`} className={`animation-${index}`} style={{ maxWidth: size }}>
              <lottie-player
                src={anim.lottieURL}
                background="transparent"
                className="aspect-[14/13] w-full rounded-2xl object-cover"
                style={{width: size, height: size}}
                loop
                autoplay
                wasmUrl={wasmUrl}
                renderConfig={JSON.stringify({
                  enableDevicePixelRatio: true,
                  renderer: player === RendererOption.SW ? 'sw' : 'wg',
                })}
                ref={(playerRef: HTMLElement) => {
                  if (playerRef && index === 0) {
                    setTimeout(() => checkCanvasSize(playerRef), 50);
                  }
                }}
              />
              <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-white overflow-hidden text-ellipsis whitespace-nowrap" style={{ maxWidth: size }}>{anim.name}</h3>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
