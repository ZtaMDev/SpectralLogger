import { styleFor } from './colors-web.js';
import type { LogLevel, LogOptionsWeb } from './types.js';

export class WebFormatter {
  private colors = {
    info: '#00bfff',
    success: '#00ff88',
    warn: '#ffaa00',
    error: '#ff5555',
    log: '#dddddd',
    debug: '#cc66ff',
  } as const;

  constructor(private config: {
    showTimestamp: boolean;
    showLevel: boolean;
    colors: Record<LogLevel | 'log', string>;
  }) {}

  format(message: string, level: LogLevel, options?: LogOptionsWeb): {
    args: any[]; // argumentos para console.log con %c
  } {
    const parts: string[] = [];
    const styles: string[] = [];

    const showTimestamp = options?.timestamp ?? this.config.showTimestamp;
    const showLevel = options?.level ?? this.config.showLevel;

    if (showTimestamp) {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const ss = now.getSeconds().toString().padStart(2, '0');
      parts.push('%c[' + `${hh}:${mm}:${ss}` + ']');
      styles.push('color:#888888');
    }

    if (showLevel) {
      const color = this.getLevelColor(level);
      const lvlText = level.toUpperCase().padEnd(7);
      parts.push('%c[' + lvlText + ']');
      styles.push(`color:${color};font-weight:600`);
    }

    const msgColor = options?.color ?? this.getLevelColor(level);
    // Parse inline markers: <<c:COLOR>>text<</c>> to segmented %c parts
    const segments: Array<{ text: string; color?: string }> = [];
    const regex = /<<c:([^>]+)>>([\s\S]*?)<<\/c>>/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(message)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: message.slice(lastIndex, match.index) });
      }
      segments.push({ text: match[2], color: match[1] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < message.length) {
      segments.push({ text: message.slice(lastIndex) });
    }

    if (segments.length === 0) {
      parts.push('%c' + message);
      styles.push(styleFor(msgColor));
    } else {
      for (const seg of segments) {
        parts.push('%c' + seg.text);
        styles.push(styleFor(seg.color ?? msgColor));
      }
    }

    return { args: [parts.join(' '), ...styles] };
  }

  formatError(error: Error): { args: any[] } {
    const color = this.config.colors.error;
    const parts: string[] = [];
    const styles: string[] = [];
    parts.push('%cError: ' + error.name);
    styles.push(`color:${color};font-weight:700`);
    parts.push('%cMessage: ' + error.message);
    styles.push(`color:${color}`);

    if (error.stack) {
      parts.push('%cStack Trace:');
      styles.push('color:#ff8888');
      parts.push('%c' + this.cleanStackTrace(error.stack));
      styles.push('color:#ffaaaa');
    }

    return { args: [parts.join('\n'), ...styles] };
  }

  private getLevelColor(level: LogLevel): string {
    return this.config.colors[level] || this.config.colors.log;
  }

  private cleanStackTrace(stack: string): string {
    return stack
      .split('\n')
      .map((l) => l.trim())
      .join('\n  ');
  }
}
