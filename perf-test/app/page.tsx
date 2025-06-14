'use client'
import { Listbox, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { isDesktop } from 'react-device-detect';
// import wasmUrl from "../node_modules/@thorvg/lottie-player/dist/thorvg-wasm.wasm";
const wasmUrl = '/thorvg-wasm.wasm';

const animations = [
  '1643-exploding-star.json',
  '5317-fireworkds.json',
  '5344-honey-sack-hud.json',
  '11555.json',
  '27746-joypixels-partying-face-emoji-animation.json',
  'a_mountain.json',
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

enum PlayerOption {
  ThorVG_Software = 'ThorVG(Software)',
  ThorVG_WebGPU = 'ThorVG(WebGPU)',
}

interface Animation {
  name: string;
  lottieURL: string;
}

const DEFAULT_COUNT = 20;
const EXAMPLE_URL_PREFIX = 'https://raw.githubusercontent.com/thorvg/thorvg/main/examples/resources/lottie/';
const COUNT_OPTIONS = [10, 20, 50, 100] as const;

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

function setQueryStringParameter(name: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${params}`));
}

let initialized = false;
export default function Home() {
  const size = isDesktop ? 180 : 150;

  const [count, setCount] = useState(DEFAULT_COUNT);
  const [player, setPlayer] = useState<PlayerOption>(PlayerOption.ThorVG_Software);
  const [activePlayer, setActivePlayer] = useState<PlayerOption>(PlayerOption.ThorVG_Software);

  const [text, setText] = useState('');
  const [animationList, setAnimationList] = useState<Animation[]>([]);

  useEffect(() => {
    if (initialized) {
      return;
    }
    initialized = true;

    let seed: string | null = null;
    let count = DEFAULT_COUNT;
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const playerString = params.get('player');
      const countString = params.get('count');
      seed = params.get('seed');

      if (countString) {
        count = parseInt(countString);
        setCount(count);
      }

      if (playerString) {
        const player = playerString as PlayerOption;
        setPlayer(player);
        setActivePlayer(player);
      }
    }

    // @ts-ignore
    import("/public/lottie-player.js");

    requestAnimationFrame(async () => {
      loadProfiler();

      if (seed) {
        loadSeed(seed);
        return;
      }

      loadAnimationByCount(count);
    });
  }, []);

  const loadProfiler = () => {
    const script = document.createElement("script");
    script.src = "/profiler.js";
    document.body.appendChild(script);
  }

  const loadAnimationByCount = async (count = DEFAULT_COUNT) => {
    const newAnimationList = [];

    for (let i = 0; i < count; i++) {
      const _anim = animations[Math.floor(Math.random() * animations.length)];

      newAnimationList.push({
        name: _anim.split('/').pop()?.split('.')[0] || 'Unknown',
        lottieURL: `${EXAMPLE_URL_PREFIX}${_anim}`,
      });
    }

    setAnimationList([...newAnimationList]);
    saveCurrentSeed(newAnimationList);
  };

  const saveCurrentSeed = (animationList: Animation[]) => {
    const nameList = animationList.map((animation) => animation.name).join(',');
    const seed = btoa(nameList);
    setQueryStringParameter('seed', seed);
  }

  const loadSeed = (seed: string) => {
    const nameList = atob(seed).split(',');
    const newAnimationList = nameList.map((name: string) => {
      const anim = animations.find((anim) => anim === `${name.trim()}.json`) || animations[0];
      return {
        name: name,
        lottieURL: `${EXAMPLE_URL_PREFIX}${anim}`,
      };
    });

    setAnimationList(newAnimationList);
  }

  const setNewOption = () => {
    setQueryStringParameter('seed', '');
    window.location.reload();
  }

  const spawnAnimation = () => {
    if (!text.trimEnd().trimStart()) {
      alert("Please enter a valid link");
      return;
    }

    // random 0 to animationList.length
    const randomIndex = Math.floor(Math.random() * animationList.length);
    animationList[randomIndex].lottieURL = text;
    animationList[randomIndex].name = text.split('/').pop()?.split('.')[0] || 'Unknown';
    setAnimationList(animationList.slice());

    requestAnimationFrame(() => {
      const animationSelector = `.${animationList[randomIndex].name}-${randomIndex} > lottie-player`;
      const targetPlayer = document.querySelector(animationSelector);

      if (targetPlayer) {
        targetPlayer.scrollIntoView({ behavior: 'smooth' });
        // @ts-ignore
        targetPlayer.destroy();
        // @ts-ignore
        targetPlayer.load(text);
      }
    });
  };

  return (
    <div className="bg-gray-900 pt-4 pb-24 sm:pb-32 sm:pt-8 pt-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <div className="mt-6 flex w-full gap-x-4 align-middle flex-row">

            <h1 className='text-justify text-center text-white leading-[52px] sm:block hidden'>Player: </h1>

            <Listbox value={player} onChange={(selectedPlayer) => {
              setPlayer(selectedPlayer as PlayerOption);
              setQueryStringParameter('player', selectedPlayer);
            }}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white/5 py-3.5 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{player}</span>
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
              <ListboxOptions className="absolute w-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {Object.values(PlayerOption).map((player) => (
                  <ListboxOption
                    key={player}
                    className={({ active }: { active: boolean }) =>
                      classNames(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={player}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {player}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
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

    <Listbox value={count} onChange={(selectedCount) => {
      setCount(selectedCount);
      setQueryStringParameter('count', selectedCount.toString());
    }}>
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
                    className={({ active }: { active: boolean }) =>
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
          className="animation-list mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mx-0 lg:max-w-none sm:grid-cols-4 xl:grid-cols-5 grid-cols-2"
        >
          {animationList.map((anim: Animation, index: number) => (
            <li key={`${anim.lottieURL}-${index}`} className={`${anim.name}-${index} max-w-[${size}px]`}>
              {
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
                    renderer: activePlayer === PlayerOption.ThorVG_Software ? 'sw' : 'wg',
                  })}
                />
              }
              <h3 className={`mt-6 text-lg font-semibold leading-8 tracking-tight text-white max-w-[${size}px] overflow-hidden`}>{anim.name}</h3>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
