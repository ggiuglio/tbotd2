// What an option in the terminal does when chosen
export type Choice =
	| { kind: 'open'; objectId: string }
	| { kind: 'take'; objectId: string; itemId: string }
	| { kind: 'taunt'; characterId: string }
	| { kind: 'diplomacy'; characterId: string };

export type LogOption = { label: string; choice: Choice };

export type LogEntry = {
	character: string;
	action: string;
	// Shown as clickable choices under the entry
	options?: LogOption[];
};

export function formatLogEntry(entry: LogEntry): string {
	return `${entry.character} - ${entry.action}`;
}
