'use client'
import { Fragment, useState, useEffect } from 'react'
import { Listbox, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
// @ts-ignore
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// dynamic import nextjs
import dynamic from 'next/dynamic';

// @ts-ignore
// const DotLottieReact = dynamic(() => import('@lottiefiles/dotlottie-react'), { ssr: false });

import { Player } from '@lottiefiles/react-lottie-player';

const animationLinks = [
  'lottie/1643-exploding-star.json',
  'lottie/5317-fireworkds.json',
  'lottie/5344-honey-sack-hud.json',
  'lottie/11555.json',
  'lottie/27746-joypixels-partying-face-emoji-animation.json',
  'lottie/a_mountain.json',
  'lottie/abstract_circle.json',
  'lottie/alien.json',
  'lottie/anubis.json',
  'lottie/balloons_with_string.json',
  'lottie/batman.json',
  'lottie/birth_stone_logo.json',
  'lottie/card_hover.json',
  'lottie/cat_loader.json',
  'lottie/coin.json',
  'lottie/confetti.json',
  'lottie/confetti2.json',
  'lottie/confettiBird.json',
  'lottie/customer.json',
  'lottie/dancing_book.json',
  'lottie/dancing_star.json',
  'lottie/day_to_night.json',
  'lottie/dodecahedron.json',
  'lottie/down.json',
  'lottie/driving.json',
  'lottie/dropball.json',
  'lottie/duck.json',
  'lottie/eid_mubarak.json',
  'lottie/emoji_enjoying.json',
  'lottie/emoji.json',
  'lottie/fiery_skull.json',
  'lottie/fleche.json',
  'lottie/flipping_page.json',
  'lottie/fly_in_beaker.json',
  'lottie/focal_test.json',
  'lottie/foodrating.json',
  'lottie/frog_vr.json',
  'lottie/fun_animation.json',
  'lottie/funky_chicken.json',
  'lottie/game_finished.json',
  'lottie/geometric.json',
  'lottie/glow_loading.json',
  'lottie/gradient_background.json',
  'lottie/gradient_infinite.json',
  'lottie/gradient_sleepy_loader.json',
  'lottie/gradient_smoke.json',
  'lottie/growup.json',
  'lottie/guitar.json',
  'lottie/hamburger.json',
  'lottie/happy_holidays.json',
  'lottie/happy_trio.json',
  'lottie/hola.json',
  'lottie/holi_colors.json',
  'lottie/hourglass.json',
  'lottie/insta_camera.json',
  'lottie/intelia_logo_animation.json',
  'lottie/isometric.json',
  'lottie/la_communaute.json',
  'lottie/like_button.json',
  'lottie/like.json',
  'lottie/loading_rectangle.json',
  'lottie/lolo_walk.json',
  'lottie/lolo.json',
  'lottie/looping_landscape_+_plane_+_clouds.json',
  'lottie/loveface_emoji.json',
  'lottie/masking.json',
  'lottie/material_wave_loading.json',
  'lottie/merging_shapes.json',
  'lottie/message.json',
  'lottie/morphing_anim.json',
  'lottie/open_envelope.json',
  'lottie/personal_character.json',
  'lottie/polystar_anim.json',
  'lottie/polystar.json',
  'lottie/property_market.json',
  'lottie/radar.json',
  'lottie/ripple_loading_animation.json',
  'lottie/rufo.json',
  'lottie/sad_emoji.json',
  'lottie/sample.json',
  'lottie/seawalk.json',
  'lottie/skullboy.json',
  'lottie/snail.json',
  'lottie/starburst.json',
  'lottie/starstrips.json',
  'lottie/starts_transparent.json',
  'lottie/stroke_dash.json',
  'lottie/swinging.json',
  'lottie/text.json',
  'lottie/text2.json',
  'lottie/threads.json',
  'lottie/traveling.json',
  'lottie/uk_flag.json',
  'lottie/voice_recognition.json',
  'lottie/walker.json',
  'lottie/water_filling.json',
  'lottie/waves.json',
  'lottie/woman.json',
  'lottie/world_locations.json',
  'lottie/yarn_loading.json',
];

const countOptions = [
  { id: 1, name: 20 },
  { id: 2, name: 50 },
  { id: 3, name: 100 },
  { id: 4, name: 200 },
  { id: 5, name: 500 },
  { id: 6, name: 1000 },
];

const playerOptions = [
  { id: 1, name: 'thorvg-player' },
  { id: 2, name: 'dotlottie-web' },
  { id: 3, name: 'lottie-web' },
];

const size = { width: 180, height: 180 };

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

function setQueryStringParameter(name: string, value: any) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.history.replaceState({}, "", decodeURIComponent(`${window.location.pathname}?${params}`));
}

export default function Home() {
  const [count, setCount] = useState(countOptions[0]);
  const [player, setPlayer] = useState(playerOptions[0]);
  const [playerId, setPlayerId] = useState(1);
  const [text, setText] = useState('');
  const [animationList, setAnimationList] = useState<any>([]);

  useEffect(() => {
    // @ts-ignore
    import("@thorvg/lottie-player");

    let count: number = countOptions[0].name;
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const player = params.get('player');
      count = parseInt(params.get('count') ?? '20');
      const seed = params.get('seed');

      if (count) {
        const _count = countOptions.find((c) => c.name === count) || countOptions[0];
        setCount(_count);
      }

      if (player) {
        const _player = playerOptions.find((p) => p.name === player) || playerOptions[0];
        setPlayer(_player);
        setPlayerId(_player.id);
      }

      if (seed) {
        loadSeed(seed);
        return;
      }
    }
    
    setTimeout(() => {
      loadAnimationByCount(count);
    }, 500);
  }, []);

  const loadAnimationByCount = async (_count = count.name) => {
    const newAnimationList = [];

    for (let i = 0; i < _count; i++) {
      const _anim = animationLinks[Math.floor(Math.random() * animationLinks.length)];

      newAnimationList.push({
        name: _anim.split('/').pop()?.split('.')[0] || 'Unknown',
        lottieURL: `https://raw.githubusercontent.com/thorvg/thorvg/main/examples/resources/${_anim}`,
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
      const _anim = animationLinks.find((anim) => anim === `lottie/${name.trim()}.json`) || animationLinks[0];
      
      return {
        name: name,
        lottieURL: `https://raw.githubusercontent.com/thorvg/thorvg/main/examples/resources/${_anim}`,
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
    <div className="bg-gray-900 pt-4 pb-24 sm:pb-32 sm:pt-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <div className="mt-6 flex w-full gap-x-4 align-middle flex-row">
            <h1 className='text-justify	text-center leading-[52px]'>Selected Player: </h1>
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
          className="animation-list mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4 xl:grid-cols-5"
        >
          {animationList.map((anim: any, index: number) => (
            <li key={`${anim.name}-${anim.lottieURL}-${playerId}-${index}`} className={`${anim.name}-${index}`}>
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
                  />
                )
              }
              {
                playerId === 2 && (
                  <DotLottieReact
                    src={anim.lottieURL as string}
                    className="aspect-[14/13] w-full rounded-2xl object-cover"
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
              <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-white">{anim.name}</h3>
              <p className="text-sm leading-6 text-gray-500">{anim.location}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
