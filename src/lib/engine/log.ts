export type LogEntry = {
	character: string;
	action: string;
};

export function formatLogEntry(entry: LogEntry): string {
	return `${entry.character} - ${entry.action}`;
}
