import { audioEngine } from "./audioEngine";

/**
 * Weiß, welches Asset zu welchem Ereignis gehört - TS-Pendant zu Bluff/Sounds/SoundManager.cs.
 * Dieselbe feste Sitzplatz→Pan-Zuordnung (-1..1) und dasselbe Stagger-Timing wie im Original.
 */
const SOUNDS_BASE = "sounds/";
const ROLL_STAGGER_MS = 180;

function pan(seatIndex: number, totalSeats: number): number {
  return totalSeats <= 1 ? 0 : -1 + (2 * seatIndex) / (totalSeats - 1);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const soundManager = {
  /** Würfelt für jeden Spieler den zu seiner Würfelanzahl passenden Sound, an seinem Sitzplatz
   * verortet und leicht zeitversetzt gestartet (nicht abgewartet - blockiert das Rundentiming nicht). */
  playDiceRollForAll(players: readonly { seatIndex: number; diceCount: number }[], totalSeats: number): void {
    void (async () => {
      for (const { seatIndex, diceCount } of players) {
        const clamped = Math.min(5, Math.max(1, diceCount));
        void audioEngine.play(`${SOUNDS_BASE}dice${clamped}.wav`, pan(seatIndex, totalSeats));
        await delay(ROLL_STAGGER_MS);
      }
    })();
  },

  playDieRemoved(seatIndex: number, totalSeats: number): void {
    void audioEngine.play(`${SOUNDS_BASE}removedice.wav`, pan(seatIndex, totalSeats));
  },

  /** Alle außer dem Ansager verlieren gemeinsam einen Würfel (exakter Treffer) - bleibt mittig. */
  playDiceRemovedAll(): void {
    void audioEngine.play(`${SOUNDS_BASE}removedice_all.wav`);
  },

  playEqual(): void {
    void audioEngine.play(`${SOUNDS_BASE}equal.wav`);
  },

  playWinner(): void {
    void audioEngine.play(`${SOUNDS_BASE}winner.wav`);
  },

  playLost(): void {
    void audioEngine.play(`${SOUNDS_BASE}lost.wav`);
  },

  playBuzzer(): void {
    void audioEngine.play(`${SOUNDS_BASE}BUZZER.mp3`);
  },
};
