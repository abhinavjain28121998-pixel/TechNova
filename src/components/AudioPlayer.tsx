import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Loader2, Volume2, AudioLines } from 'lucide-react';
import { Button } from './ui/button';
// import { Progress } from './ui/progress';

export function AudioPlayer({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chunks, setChunks] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const currentChunkIndexRef = useRef(0);
  const playingRef = useRef(false);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    let cleanText = text.replace(/```[\s\S]*?```/g, ''); // Remove code blocks
    cleanText = cleanText.replace(/#+\s+/g, ''); // Remove headers
    cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold
    cleanText = cleanText.replace(/\*(.*?)\*/g, '$1'); // Remove italic
    cleanText = cleanText.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links
    cleanText = cleanText.replace(/!\[(.*?)\]\(.*?\)/g, ''); // Remove images
    cleanText = cleanText.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
    
    // Split by sentences or paragraphs to avoid huge chunks
    const paragraphs = cleanText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    
    const mergedChunks: string[] = [];
    let currentChunk = '';
    
    for (const p of paragraphs) {
      if ((currentChunk + ' ' + p).length > 800) {
        if (currentChunk) mergedChunks.push(currentChunk);
        currentChunk = p;
      } else {
        currentChunk = currentChunk ? currentChunk + ' ' + p : p;
      }
    }
    if (currentChunk) mergedChunks.push(currentChunk);
    
    setChunks(mergedChunks);
  }, [text]);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const base64ToAudioBuffer = (base64: string): AudioBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }
    const audioCtx = audioContextRef.current!;
    const buffer = audioCtx.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);
    return buffer;
  };

  const playChunk = async (index: number) => {
    if (stopRequestedRef.current || index >= chunks.length) {
      setIsPlaying(false);
      playingRef.current = false;
      if (index >= chunks.length) {
        setProgress(100);
      }
      return;
    }

    try {
      setIsLoading(true);
      const chunkText = chunks[index];
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chunkText })
      });
      
      if (!resp.ok) throw new Error('TTS failed');
      const data = await resp.json();
      
      if (stopRequestedRef.current) return;

      const buffer = base64ToAudioBuffer(data.audio);
      const audioCtx = audioContextRef.current!;
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      sourceNodeRef.current = source;
      
      source.onended = () => {
        if (!stopRequestedRef.current) {
          currentChunkIndexRef.current += 1;
          setProgress(Math.round((currentChunkIndexRef.current / chunks.length) * 100));
          playChunk(currentChunkIndexRef.current);
        }
      };

      setIsLoading(false);
      source.start(0);

    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setIsPlaying(false);
      playingRef.current = false;
    }
  };

  const handlePlayPause = () => {
    initAudioContext();
    if (isPlaying) {
      // Pause/Stop
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      stopRequestedRef.current = true;
      setIsPlaying(false);
      playingRef.current = false;
      setIsLoading(false);
    } else {
      // Play
      stopRequestedRef.current = false;
      setIsPlaying(true);
      playingRef.current = true;
      if (currentChunkIndexRef.current >= chunks.length) {
        currentChunkIndexRef.current = 0;
        setProgress(0);
      }
      playChunk(currentChunkIndexRef.current);
    }
  };

  const handleStop = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
    }
    stopRequestedRef.current = true;
    setIsPlaying(false);
    playingRef.current = false;
    setIsLoading(false);
    currentChunkIndexRef.current = 0;
    setProgress(0);
  };

  if (chunks.length === 0) return null;

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col gap-3 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <AudioLines className="w-4 h-4 text-primary" />
          Read it to Me (AI Voice)
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating Audio...
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant={isPlaying ? "secondary" : "default"}
          size="sm"
          onClick={handlePlayPause}
          disabled={isLoading && !isPlaying}
          className="w-24 shrink-0 transition-all duration-200"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Listen
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleStop}
          disabled={!isPlaying && progress === 0}
          className="shrink-0 w-9 h-9"
        >
          <Square className="w-4 h-4" />
        </Button>

        <div className="flex-1">
          <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-medium shrink-0 w-8 text-right">
          {progress}%
        </div>
      </div>
    </div>
  );
}
