export function useDebounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeout: NodeJS.Timeout;

    return ((...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    }) as T;
}
