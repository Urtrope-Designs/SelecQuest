import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { STATIC_NAMES, RANDOM_NAME_PARTS } from '../global/config';
import { Hero } from '../models/models';

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

export function randFromListLow<T>(list: T[], weightFactor = 2, maxIndex = -1): T {
    if (weightFactor < 1) weightFactor = 1;
    if (maxIndex === -1) maxIndex = list.length-1;
    let indices: number[] = [];
    for (let i = 0; i < weightFactor; i++) {
        indices.push(randRange(0, maxIndex));
    }
    const finalIndex = Math.min(...indices, list.length-1);
    return list[finalIndex];
}

export function randFromListHigh<T>(list: T[], weightFactor = 2, minIndex = 0, maxIndex = -1): T {
    if (weightFactor < 1) weightFactor = 1;
    if (maxIndex < 0 || maxIndex > list.length-1) maxIndex = list.length-1;
    if (minIndex < 0) minIndex = 0;
    if (minIndex > maxIndex) minIndex = maxIndex;

    let indices: number[] = [];
    for (let i = 0; i < weightFactor; i++) {
        indices.push(randRange(minIndex, maxIndex));
    }
    const finalIndex = Math.max(...indices);
    return list[finalIndex];
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
    if (doesEndWith(baseString, 'Bison') || doesEndWith(baseString, 'bison')) {
        return baseString;
    }
    else if (doesEndWith(baseString, 'ooth')) {
        return baseString.slice(0, baseString.length - 4) + 'eeth';
    }
    else if (doesEndWith(baseString, 'ey')) {
        return baseString + 's';
    } else if (doesEndWith(baseString, 'y')) {
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
    if (baseString.length < ending.length) {
        return false;
    }
    return baseString.slice(baseString.length - ending.length, baseString.length) == ending;
}

export function capitalizeInitial(baseString: string): string {
    if (!baseString) return baseString;
    return baseString.charAt(0).toLocaleUpperCase() + baseString.slice(1);
}

export function generateRandomName(): string {
    let name = '';

    if (!randRange(0, 4)) {     // should it only be 1 in 5?
        name = randFromList(STATIC_NAMES);
    } else {
        for (var i = 0; i <= 5; ++i)
            name += randFromList(RANDOM_NAME_PARTS[i % 3]);
        name = capitalizeInitial(name);
    }

    return name;
}

export function deepCopyObject(original: any): any {
    if (null == original || "object" != typeof original) {
        return original;
    }
    let copy = original.constructor();
    Object.keys(original).map((key) => {
        if (Object.getOwnPropertyDescriptor(original, key).value instanceof Object) {
            copy[key] = deepCopyObject(original[key]);
        } else {
            Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(original, key));;

        }
    });

    return copy;
}

export function getRoughTime(timeSeconds: number): string {
    if (timeSeconds < 120){
        return timeSeconds + ' seconds';
    }
    else if (timeSeconds < 60 * 120) {
        return Math.floor(timeSeconds / 60) + ' minutes';
    }
    else if (timeSeconds < 60 * 60 * 48) {
        return Math.floor(timeSeconds / 3600) + ' hours';
    }
    else if (timeSeconds < 60 * 60 * 24 * 60) {
        return Math.floor(timeSeconds / (3600 * 24)) + ' days';
    }
    else if (timeSeconds < 60 * 60 * 24 * 30 * 24) {
        return Math.floor(timeSeconds / (3600 * 24 * 30)) +" months";
    }
    else {
        return Math.floor(timeSeconds / (3600 * 24 * 30 * 12)) + " years";
    }
}

export function generateHeroHashFromHero(heroData: Hero): string {
    const rawHash = `${heroData.name}${HERO_HASH_NAME_DELIMITER}${heroData.raceName}${heroData.class}`;
    const sanitizedHash = rawHash.replace(' ', '');
    return sanitizedHash;
}
export const HERO_HASH_NAME_DELIMITER = '::';

export function getIterableEnumKeys(requestedEnum: Object) {
    return Object.keys(requestedEnum).filter(key => isNaN(+key));
}

export function toRoman(n: number) {
    if (!n) {
        return "N";
    }

    let s = "";
    function _rome(dn: number, ds: string) {
      if (n >= dn) {
        n -= dn;
        s += ds;
        return true;
      } else {
        return false;
      }
    }
    if (n < 0) {
      s = "-";
      n = -n;
    }
    while (_rome(1000,"M")) {
        0;
    }
    _rome(900,"CM");
    _rome(500,"D");
    _rome(400,"CD");
    while (_rome(100,"C")) {
        0;
    }
    _rome(90,"XC");
    _rome(50,"L");
    _rome(40,"XL");
    while (_rome(10,"X")) {
        0;
    }
    _rome(9,"IX");
    _rome(5,"V");
    _rome(4,"IV");
    while (_rome(1,"I")) {
        0;
    }
    return s;
  }
  
//   function toArabic(s) {
//     n = 0;
//     s = s.toUpperCase();
//     function _arab(ds,dn) {
//       if (!Starts(s, ds)) return false;
//       s = s.substr(ds.length);
//       n += dn;
//       return true;
//     }
//     while (_arab("M",1000)) {0;}
//     _arab("CM",900);
//     _arab("D",500);
//     _arab("CD",400);
//     while (_arab("C",100)) {0;}
//     _arab("XC",90);
//     _arab("L",50);
//     _arab("XL",40);
//     while (_arab("X",10)) {0;}
//     _arab("IX",9);
//     _arab("V",5);
//     _arab("IV",4);
//     while (_arab("I",1)) {0;}
//     return n;
//   }