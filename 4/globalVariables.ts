let globalVariables: Record<string, any> = {
    errorLog: [],
    events: [],
};

export function setVariable(key: string, value: string): void {
    globalVariables[key] = value;
}

export function getVariable(key: string): any {
    return globalVariables[key];
}

export function addToErrorLog(message: string): void {
    globalVariables.errorLog.push(message);
}

export function addToEvents(event: string): void {
    globalVariables.events.push(event);
}