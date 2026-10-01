import { isSoundEnabled } from "./soundSettings";

/**
 * Web-Audio-Wiedergabe - TS-Pendant zu Bluff/Sounds/AudioEngine.cs, aber ohne dessen Umweg über
 * einen dedizierten Dispatcher-Thread: der Browser unterstützt echte, gleichzeitige, unabhängig
 * gepannte Wiedergabe nativ über StereoPannerNode, jeder Play-Aufruf bekommt seinen eigenen
 * AudioBufferSourceNode. Puffer werden pro URL einmal geladen/dekodiert und wiederverwendet.
 */
class AudioEngine {
  private context: AudioContext | null = null;
  private readonly buffers = new Map<string, Promise<AudioBuffer>>();

  /** Muss aus einer echten Nutzerinteraktion heraus aufgerufen werden (Browser-Autoplay-Regel). */
  unlock(): void {
    this.ensureContext().resume().catch(() => {
      // Wiedergabe ist rein dekorativ und darf das Spiel nie unterbrechen.
    });
  }

  async play(url: string, pan = 0): Promise<void> {
    if (!isSoundEnabled()) {
      return;
    }
    try {
      const context = this.ensureContext();
      const buffer = await this.loadBuffer(url);

      const source = context.createBufferSource();
      source.buffer = buffer;

      const panner = context.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));

      source.connect(panner);
      panner.connect(context.destination);
      source.start();
    } catch {
      // Wiedergabe ist rein dekorativ und darf das Spiel nie unterbrechen.
    }
  }

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  private loadBuffer(url: string): Promise<AudioBuffer> {
    let pending = this.buffers.get(url);
    if (!pending) {
      pending = fetch(url)
        .then((response) => response.arrayBuffer())
        .then((data) => this.ensureContext().decodeAudioData(data));
      this.buffers.set(url, pending);
    }
    return pending;
  }
}

export const audioEngine = new AudioEngine();
