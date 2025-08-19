import { useMemo, useRef } from "react";

export type SoundName =
  | "start"
  | "match"
  | "success"
  | "error"
  | "complete"
  | "bonus"
  | "swoosh"
  | "bgm";

interface PlayOptions {
  volume?: number; // 0..1
  rate?: number; // playback rate
}

function createAudio(src: string, volume = 0.7, rate = 1) {
  const a = new Audio(src);
  a.preload = "auto";
  a.volume = volume;
  a.playbackRate = rate;
  return a;
}

export function useSound(enabled: boolean) {
  // Map logical sound names to files in public/audio
  const sounds = useMemo(() => {
    const map: Record<SoundName, HTMLAudioElement> = {
      start: createAudio("/audio/game-start-317318.mp3", 0.8),
      match: createAudio("/audio/success-1-6297.mp3", 0.8),
      success: createAudio(
        "/audio/short-success-sound-glockenspiel-treasure-video-game-6346.mp3",
        0.8
      ),
      error: createAudio("/audio/swoosh-3-376866.mp3", 0.7),
      complete: createAudio("/audio/game-level-complete-143022.mp3", 0.8),
      bonus: createAudio("/audio/game-bonus-144751.mp3", 0.8),
      swoosh: createAudio("/audio/swoosh-3-376866.mp3", 0.7),
      bgm: createAudio("/audio/music-game.mp3", 0.4),
    };
    // Do not loop by default; bgm can be looped by caller if needed
    return map;
  }, []);

  const unlockedRef = useRef(false);

  // Attempt to unlock audio on iOS/Safari by playing a muted sound during a user gesture
  const unlock = async (): Promise<boolean> => {
    if (unlockedRef.current) return true;
    try {
      const a = sounds.bgm;
      if (!a) return false;
      const prevMuted = a.muted;
      const prevVol = a.volume;
      a.muted = true;
      a.volume = 0;
      a.loop = false;
      try {
        await a.play();
      } catch {
        // ignore
      }
      a.pause();
      a.currentTime = 0;
      a.muted = prevMuted;
      a.volume = prevVol;
      unlockedRef.current = true;
      return true;
    } catch {
      return false;
    }
  };

  const play = (name: SoundName, opts?: PlayOptions) => {
    if (!enabled) return;
    const base = sounds[name];
    if (!base) return;

    const tryPlay = (audio: HTMLAudioElement) => {
      if (opts?.volume !== undefined) audio.volume = opts.volume;
      if (opts?.rate !== undefined) audio.playbackRate = opts.rate;
      audio.currentTime = 0;
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Ignore autoplay restrictions; user interaction will unlock later
        });
      }
    };

    // If already playing and overlapping is desired, play a clone
    if (!base.paused && !base.ended) {
      const clone = base.cloneNode(true) as HTMLAudioElement;
      tryPlay(clone);
    } else {
      tryPlay(base);
    }
  };

  const loop = (name: SoundName, opts?: PlayOptions) => {
    if (!enabled) return;
    const a = sounds[name];
    if (!a) return;
    if (opts?.volume !== undefined) a.volume = opts.volume;
    if (opts?.rate !== undefined) a.playbackRate = opts.rate;
    a.loop = true;
    a.currentTime = 0;
    const p = a.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  };

  const stop = (name: SoundName) => {
    const a = sounds[name];
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    a.loop = false;
  };

  return { play, loop, stop, unlock };
}
