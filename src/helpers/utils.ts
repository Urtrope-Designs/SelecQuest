import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function wrapIntoBehavior(init, obs) {
    const res = new BehaviorSubject(init);
    obs.subscribe(s => res.next(s));
    return res;
}

export function randRange(min: number, max: number): number {
    if (min == max) return min;
    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    const delta = max - min;
    const spread = Math.floor(Math.random() * (delta + 1));
    return spread + min;
}