import { TaskTargetType, LootingTarget, GladiatingTarget, CharRace, LeadGatheringTarget, LeadType, LeadTarget } from "../helpers/models";

export let TASK_GERUNDS = [];
TASK_GERUNDS[TaskTargetType.LOCATION] = 'Ransacking';
TASK_GERUNDS[TaskTargetType.MONSTER] = 'Executing';
TASK_GERUNDS[TaskTargetType.DUEL] = 'Dueling';
TASK_GERUNDS[TaskTargetType.TRIAL] = 'Undertaking';

export let TASK_PREFIX_MINIMAL = [];
export let TASK_PREFIX_BAD_FIRST = [];
export let TASK_PREFIX_BAD_SECOND = [];
export let TASK_PREFIX_MAXIMAL = [];
export let TASK_PREFIX_GOOD_FIRST = [];
export let TASK_PREFIX_GOOD_SECOND = [];

TASK_PREFIX_MINIMAL[TaskTargetType.LOCATION] = 'imaginary';
TASK_PREFIX_MINIMAL[TaskTargetType.MONSTER] = 'imaginary';
TASK_PREFIX_BAD_FIRST[TaskTargetType.LOCATION] = [
    'dank',
    'desolate',
    'vandalized',
    'cobwebby',
    'dreary',
];
TASK_PREFIX_BAD_FIRST[TaskTargetType.MONSTER] =[
    'dead',
    'comatose',
    'crippled',
    'sick',
    'undernourished',
    'long-winded',
];
TASK_PREFIX_BAD_SECOND[TaskTargetType.LOCATION] = [
    'abandoned',
    'underwhelming',
    'uninviting',
    'crumbling',
    'ramshackle',
];
TASK_PREFIX_BAD_SECOND[TaskTargetType.MONSTER] = [
    'foetal',
    'baby',
    'preadolescent',
    'teenage',
    'underage',
];

TASK_PREFIX_MAXIMAL[TaskTargetType.LOCATION] = 'messianic';
TASK_PREFIX_MAXIMAL[TaskTargetType.MONSTER] = 'messianic';
TASK_PREFIX_GOOD_FIRST[TaskTargetType.LOCATION] = [
    'posh',
    'thriving',
    'sturdy',
    'fortified',
    'sinister',
    'sprawling',
];
TASK_PREFIX_GOOD_FIRST[TaskTargetType.MONSTER] = [
    'greater',
    'massive',
    'enormous',
    'giant',
    'titanic',
];
TASK_PREFIX_GOOD_SECOND[TaskTargetType.LOCATION] = [
    'booby-trapped',
    'ominous',
    'creepy',
    'newly renovated',
    'massive',
];
TASK_PREFIX_GOOD_SECOND[TaskTargetType.MONSTER] = [
    'veteran',
    'cursed',
    'warrior',
    'undead',
    'demon',
];

export const STANDARD_LOOTING_TARGETS: LootingTarget[] = [
    {
        type: TaskTargetType.LOCATION,
        name: 'Temple of Scutabrix',
        level: 1,
        reward: 'smug Scutabrix idol',
    },
    {
        type: TaskTargetType.LOCATION,
        name: 'Barber Shop',
        level: 1,
        reward: 'barber\'s cleaver',
    },
    {
        type: TaskTargetType.LOCATION,
        name: 'NagaMart',
        level: 2,
        reward: 'nagamart loyalty card',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Orkey',
        level: 1,
        reward: 'orkey giblet',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Frankenstork',
        level: 1,
        reward: 'frankenstork beak',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Bison',
        level: 1,
        reward: 'bison beard',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Mechanical marzipan',
        level: 1,
        reward: 'mechanical marzipan crumb',
    },
];

TASK_PREFIX_MINIMAL[TaskTargetType.TRIAL] = 'mock';
TASK_PREFIX_BAD_FIRST[TaskTargetType.TRIAL] = [
    'short',
    'quick',
    'basic',
    'underwhelming',
    'brief',
];
TASK_PREFIX_BAD_SECOND[TaskTargetType.TRIAL] = [
    'easy',
    'unceremonious',
    'casual',
    'impromptu',
    'lite',
    'predictable',
];

TASK_PREFIX_MAXIMAL[TaskTargetType.TRIAL] = 'insane';
TASK_PREFIX_GOOD_FIRST[TaskTargetType.TRIAL] = [
    'neverending',
    'long',
    'draining',
    'enduring',
    'extended',
];
TASK_PREFIX_GOOD_SECOND[TaskTargetType.TRIAL] = [
    'arduous',
    'onerous',
    'demanding',
    'challenging',
    'herculean',
];

export const STANDARD_GLADIATING_TARGETS: GladiatingTarget[] = [
    {
        type: TaskTargetType.TRIAL,
        name: 'endurance challenge',
        level: 1,
        reward: 'gold star'
    },
    {
        type: TaskTargetType.TRIAL,
        name: 'bowling championship',
        level: 1,
        reward: 'bowling trophy'
    },
]

export const LEAD_GATHERING_TASK_MODIFIERS: string[] = [
    'hot',
    'fresh',
    'new',
    'buzzworthy',
    'salacious',
]

export const STANDARD_LEAD_GATHERING_TARGETS: LeadGatheringTarget[] = [
    {
        gerundPhrase: 'gossipping with',
        predicateOptions: [
            'the local women\'s circle',
            'your brew-pub crew',
            'three ancient crones',
            'a bunch of retired ditch-diggers',
        ],
        leadType: LeadType.FETCH,
    },
    {
        gerundPhrase: 'scowering',
        predicateOptions: [
            'the MonsterHunterz bulletin board',
            'the latest issue of "Spelunker\'s Booty"',
            'the trash heap behind the inn',
        ],
        leadType: LeadType.FETCH,
    }
]

export const STANDARD_LEAD_TARGETS = [];
STANDARD_LEAD_TARGETS[LeadType.FIND] = [
    {}
]


export const STATIC_NAMES: string[] = [
    'Scutabrix',
    'Crinkle',
]

export const RANDOM_NAME_PARTS: string[][] = [
    ['br', 'cr', 'dr', 'fr', 'gr', 'j', 'kr', 'l', 'm', 'n', 'pr', 'r', 'sh', 'tr', 'v', 'wh', 'x', 'y', 'z', ''],
    ['a', 'a', 'e', 'e', 'i', 'i', 'o', 'o', 'u', 'u', 'ae', 'ie', 'oo', 'ou'],
    ['b', 'ck', 'd', 'g', 'k', 'm', 'n', 'p', 't', 'v', 'x', 'z'],
]

export const RACES: CharRace[] = [
    {
        raceName: 'Demimutant',
        trophyName: 'genome',
    },
    {
        raceName: 'Werefellow',
        trophyName: 'bowler hat',
    }
]

export const CLASSES: string[] = [
    'Veg Crisper',
    'Cat-caller',
    'Metanarc',
    'War Flautist',
    'Sarcasminista',
]