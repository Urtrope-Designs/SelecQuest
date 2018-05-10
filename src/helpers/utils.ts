import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { STATIC_NAMES, RANDOM_NAME_PARTS } from '../global/config';

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

/** return a random integer between min (inclusive) and max (inclusive) */
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

export function randSign(): number {
    return (randRange(0, 1) * 2) - 1;
}

export function randFromList<T>(list: T[]): T {
    const index = randRange(0, list.length - 1);
    return list[index];
}

export function makeStringIndefinite(baseString: string, quantity: number): string {
    if (quantity === 1) {
        if ('AEIOUaeiou'.indexOf(baseString.charAt(0)) > -1)
          return 'an ' + baseString;
        else
          return 'a ' + baseString;
    } else {
        return quantity + ' ' + makeStringPlural(baseString);
    }
}

export function makeStringPlural(baseString: string): string {
    if (doesEndWith(baseString, 'y')) {
        return baseString.slice(0, baseString.length - 1) + 'ies';
    }
    else if (doesEndWith(baseString, 'us')) {
        return baseString.slice(0, baseString.length - 2) + 'i';
    }
    else if (doesEndWith(baseString, 'ch') || doesEndWith(baseString, 'x') || doesEndWith(baseString, 's') || doesEndWith(baseString, 'sh')) {
        return baseString + 'es';
    }
    else if (doesEndWith(baseString, 'f')) {
        return baseString.slice(0, baseString.length - 1) + 'ves';
    }
    else if (doesEndWith(baseString, 'man') || doesEndWith(baseString, 'Man')) {
        return baseString.slice(0, baseString.length - 2) + 'en';
    }
    else {
        return baseString + 's';
    }
}

export function makeVerbGerund(baseString: string): string {
    return baseString + 'ing';
}

export function doesEndWith(baseString: string, ending: string): boolean {
    return baseString.slice(baseString.length - ending.length, baseString.length) == ending;
}

export function generateRandomName(): string {
    let name = '';

    if (!randRange(0, 4)) {     // should it only be 1 in 5?
        name = randFromList(STATIC_NAMES);
    } else {
        for (var i = 0; i <= 5; ++i)
            name += randFromList(RANDOM_NAME_PARTS[i % 3]);
        name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    return name;
}