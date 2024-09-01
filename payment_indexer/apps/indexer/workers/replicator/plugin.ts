import { EVENT_NAMES } from '../../types'
import { ProcessMonitor } from '../../monitor';

export abstract class ProcessorPlugin {
    abstract name(): EVENT_NAMES
    abstract process(event: Record<string, any>, monitor: ProcessMonitor, sequence_number: string, signature: string): Promise<void>
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}