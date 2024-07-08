'use client'
import { Listbox, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { DotLottieReact, setWasmUrl as setDotLottieWasmUrl } from '@lottiefiles/dotlottie-react';
import { Player } from '@lottiefiles/react-lottie-player';
import { isMobile } from 'react-device-detect';
import reactLottiePlayerPkg from "@lottiefiles/react-lottie-player/package.json";
import dotLottieReactPkg from "@lottiefiles/dotlottie-react/package.json";
import dotLottieWasmUrl from "../node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm";
import SkottiePlayer, { setCanvasKit } from '../components/SkottiePlayer';
import skottieWasmUrl from "../node_modules/canvaskit-wasm/bin/full/canvaskit.wasm";
import InitCanvasKit from 'canvaskit-wasm/bin/full/canvaskit';

setDotLottieWasmUrl(dotLottieWasmUrl);

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
  'batman.json',
  'birth_stone_logo.json',
  'calculator.json',
  'card_hover.json',
  'cat_loader.json',
  'coin.json',
  'confetti.json',
  'confetti2.json',
  'confettiBird.json',
  'customer.json',
  'dancing_book.json',
  'dancing_star.json',
  'day_to_night.json',
  'dodecahedron.json',
  'down.json',
  'driving.json',
  'dropball.json',
  'duck.json',
  'eid_mubarak.json',
  'emoji_enjoying.json',
  'emoji.json',
  'fiery_skull.json',
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
  'gradient_background.json',
  'gradient_infinite.json',
  'gradient_sleepy_loader.json',
  'gradient_smoke.json',
  'growup.json',
  'guitar.json',
  'hamburger.json',
  'happy_holidays.json',
  'happy_trio.json',
  'hola.json',
  'hourglass.json',
  'insta_camera.json',
  'intelia_logo_animation.json',
  'isometric.json',
  'la_communaute.json',
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
  'morphing_anim.json',
  'open_envelope.json',
  'personal_character.json',
  'polystar_anim.json',
  'polystar.json',
  'property_market.json',
  'radar.json',
  'ripple_loading_animation.json',
  'rufo.json',
  'sad_emoji.json',
  'sample.json',
  'seawalk.json',
  'skullboy.json',
  'snail.json',
  'starburst.json',
  'starstrips.json',
  'starts_transparent.json',
  'stroke_dash.json',
  'swinging.json',
  'text.json',
  'text2.json',
  'threads.json',
  'traveling.json',
  'uk_flag.json',
  'voice_recognition.json',
  'walker.json',
  'water_filling.json',
  'waves.json',
  'windmill.json',
  'woman.json',
  'world_locations.json',
  'yarn_loading.json'
];

const urlPrefix = 'https://raw.githubusercontent.com/thorvg/thorvg/main/examples/resources/lottie/';

const countOptions = [
  { id: 0, name: 10 },
  { id: 1, name: 20 },
  { id: 2, name: 50 },
  { id: 3, name: 100 },
  //{ id: 4, name: 200 },
  //{ id: 5, name: 500 },
  //{ id: 6, name: 1000 },
];

const playerOptions = [
  { id: 1, name: 'thorvg-player' },
  { id: 2, name: `dotlottie-web@${dotLottieReactPkg.dependencies["@lottiefiles/dotlottie-web"]}` },
  { id: 3, name: `lottie-web@${reactLottiePlayerPkg.dependencies["lottie-web"]}` },
  { id: 4, name: 'skia/skottie' },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

function setQueryStringParameter(name: string, value: any) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.history.replaceState({}, '', decodeURIComponent(`${window.location.pathname}?${params}`));
}

export default function Home() {
  const size = isMobile ? { width: 150, height: 150 } : { width: 180, height: 180};
  let initialized = false;
  
  const [count, setCount] = useState(countOptions[1]);
  const [player, setPlayer] = useState(playerOptions[0]);
  const [playerId, setPlayerId] = useState(1);
  const [text, setText] = useState('');
  const [animationList, setAnimationList] = useState<any>([]);

  useEffect(() => {
    if (initialized) {
      return;
    }
    initialized = true;

    // @ts-ignore
    import("@thorvg/lottie-player");

    let count: number = countOptions[1].name;
    let seed: string = '';
    let playerId = 1;

    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const player = params.get('player');
      count = parseInt(params.get('count') ?? '20');
      seed = params.get('seed') ?? '';

      if (count) {
        const _count = countOptions.find((c) => c.name === count) || countOptions[1];
        setCount(_count);
      }

      if (player) {
        const _player = playerOptions.find((p) => p.name === player) || playerOptions[0];
        playerId = _player.id;
        setPlayer(_player);
        setPlayerId(_player.id);
      }
    }
    
    setTimeout(async () => {
      if (playerId === 4) {
        await loadCanvasKit();
      }

      loadProfiler();

      if (seed) {
        loadSeed(seed);
        return;
      }

      loadAnimationByCount(count);
    }, 500);
  }, []);

  const loadCanvasKit = async () => {
    const canvasKit = await InitCanvasKit({
      locateFile: (_) => skottieWasmUrl,
    });
    setCanvasKit(canvasKit);
  }

  const loadProfiler = () => {
    const script = document.createElement("script");
    script.src = "/profiler.js";
    document.body.appendChild(script);
  }

  const loadAnimationByCount = async (_count = count.name) => {
    const newAnimationList = [];

    for (let i = 0; i < _count; i++) {
      const _anim = animations[Math.floor(Math.random() * animations.length)];

      newAnimationList.push({
        name: _anim.split('/').pop()?.split('.')[0] || 'Unknown',
        lottieURL: `${urlPrefix}${_anim}`,
        location: `Type: ${_anim.split('/').pop()?.split('.')[1] || 'Unknown'}`,
      });
    }

    // @ts-ignore
    await setAnimationList([]);
    await setAnimationList(newAnimationList);

    saveCurrentSeed(newAnimationList);
  };

  const saveCurrentSeed = (animationList: any[]) => {
    const nameList = animationList.map((v: any) => v.name).join(',');
    const seed = btoa(nameList);
    setQueryStringParameter('seed', seed);
  }

  const loadSeed = (seed: string) => {
    const nameList = atob(seed).split(',');
    console.log(nameList);
    const newAnimationList = nameList.map((name: string) => {
      const _anim = animations.find((anim) => anim === `${name.trim()}.json`) || animations[0];

      return {
        name: name,
        lottieURL: `${urlPrefix}${_anim}`,
        location: `Type: ${_anim.split('/').pop()?.split('.')[1] || 'Unknown'}`,
      };
    });

    setAnimationList(newAnimationList);
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
    animationList[randomIndex].location = `Type: ${text.split('/').pop()?.split('.')[1] || 'Unknown'}`;
    setAnimationList(animationList.slice());

    setTimeout(() => {
      document.querySelector(`.${animationList[randomIndex].name}-${randomIndex}`)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="bg-gray-900 pt-4 pb-24 sm:pb-32 sm:pt-8 pt-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <div className="mt-6 flex w-full gap-x-4 align-middle flex-row">

            <h1 className='text-justify text-center text-white leading-[52px] sm:block hidden'>Player: </h1>

            <Listbox value={player} onChange={(v) => {
              setPlayer(v);
              setQueryStringParameter('player', v.name);
            }}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white/5 py-3.5 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{player.name}</span>
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
                {playerOptions.map((player) => (
                  <ListboxOption
                    key={player.id}
                    className={({ active }: any) =>
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
                          {player.name}
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

    <Listbox value={count} onChange={(v) => {
      setCount(v);
      setQueryStringParameter('count', v.name);
    }}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white/5 py-3.5 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{count.name}</span>
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
                {countOptions.map((option) => (
                  <ListboxOption
                    key={option.id}
                    className={({ active }: any) =>
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
                          {option.name}
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
              
              <button
                type="submit"
                className="flex-none rounded-md bg-[#00deb5] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={() => {
                  setQueryStringParameter('seed', '');
                  window.location.reload();
                }}
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
          {animationList.map((anim: any, index: number) => (
            <li key={`${anim.name}-${anim.lottieURL}-${playerId}-${index}`} className={`${anim.name}-${index} max-w-[${size.width}px]`}>
              {
                playerId == 1 &&
                (
                  <lottie-player 
                    src={anim.lottieURL}
                    background="transparent" 
                    className="aspect-[14/13] w-full rounded-2xl object-cover"
                    style={{width: size.width, height: size.height}}
                    loop 
                    autoplay
                    renderConfig={JSON.stringify({enableDevicePixelRatio: true})}
                  />
                )
              }
              {
                playerId === 2 && (
                  <DotLottieReact
                    src={anim.lottieURL as string}
                    style={{width: size.width, height: size.height}}
                    loop 
                    autoplay
                  />
                )
              }
              {
                playerId === 3 && (
                  <Player
                    autoplay
                    loop
                    src={anim.lottieURL}
                    style={{ height: size.height, width: size.width }}
                  ></Player>
                )
              }
              {
                playerId == 4 && (
                  <SkottiePlayer
                    lottieURL={anim.lottieURL}
                    width={size.width}
                    height={size.height}
                  />
                )
              }
              <h3 className={`mt-6 text-lg font-semibold leading-8 tracking-tight text-white max-w-[${size.width}px] overflow-hidden`}>{anim.name}</h3>
              <p className={`text-sm leading-6 text-gray-500 max-w-[${size.width}px] overflow-hidden`}>{anim.location}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
