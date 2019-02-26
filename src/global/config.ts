import { TaskTargetType, LootingTarget, GladiatingTarget, LeadGatheringTarget, LeadType, LeadTarget, HeroTitlePosition } from "../models/models";
import { makeStringIndefinite, randFromList, makeStringPlural } from "./utils";

export const IS_DEBUG = true;

export const STANDARD_GROUPS_INDEFINITE: string[] = [
    'the Thieves Guild',
    'the Volleyball Team',
    'the local women\'s circle',
    'your brew-pub crew',
    'a bunch of retired ditch-diggers',
    'the Young Neocons Chapter',
];

export const STANDARD_PLACES: string[] = [
    'Sturtevant',
    'Duplainville',
    'Kankakee',
    'Reno',
    'Swington',
    'the Marshes of Mediocrity',
    'the Tower of Trifling',
    'Beggarton',
    'Monrovia',
    'the Misty Isles',
    'the Seas of Cheese',
    'Allbrainia',
    'Bald Mountain',
    'Hell',
];

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
    'renovated',
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
        level: 3,
        reward: 'mechanical marzipan crumb',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Grumpkin',
        level: 1,
        reward: 'grumpkin frown',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Sofa king',
        level: 5,
        reward: 'sofa king cushion',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Ratking',
        level: 7,
        reward: 'ratking tooth',
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
            ...STANDARD_GROUPS_INDEFINITE,
            'three ancient crones',
        ],
        leadTypes: [LeadType.FETCH, LeadType.DELIVER],
    },
    {
        gerundPhrase: 'scouring',
        predicateOptions: [
            'the MonsterHunterz bulletin board',
            'the latest issue of "Spelunker\'s Booty"',
            'the trash heap behind the inn',
        ],
        leadTypes: [LeadType.SEEK],
    }
]

export const STANDARD_LEAD_TARGETS: LeadTarget[][] = [];
STANDARD_LEAD_TARGETS[LeadType.FETCH] = [
    {
        verb: 'fetch',
        predicateFactory: () => {
            return makeStringIndefinite(randFromList(FETCH_TARGET_OBJECTS), 1);
        }
    }
];
STANDARD_LEAD_TARGETS[LeadType.DELIVER] = [
    {
        verb: 'deliver',
        predicateFactory: () => {
            return `this ${randFromList(FETCH_TARGET_OBJECTS)}`;
        }
    }
];
STANDARD_LEAD_TARGETS[LeadType.SEEK] = [
    {
        verb: 'seek',
        predicateFactory: () => {
            return `the ${randFromList(SEEK_TARGET_OBJECTS)}`;
        }
    }
];
STANDARD_LEAD_TARGETS[LeadType.EXTERMINATE] = [
    {
        verb: 'exterminate',
        predicateFactory: () => {
            return `the ${makeStringPlural(randFromList(STANDARD_LOOTING_TARGETS.filter(t => t.type === TaskTargetType.MONSTER)).name)}`;
        }
    }
]

STANDARD_LEAD_TARGETS[LeadType.DEFEND] = [
    {
        verb: 'defend',
        predicateFactory: () => {
            return randFromList(STANDARD_PLACES);
        }
    }
]

const FETCH_TARGET_OBJECTS = [
    'nail',
    'lunchpail',
    'sock',
    'I.O.U.',
    'cookie',
    'pint',
    'toothpick',
    'writ',
    'newspaper',
    'letter',
    'plank',
    'hat',
    'egg',
    'coin',
    'needle',
    'bucket',
    'ladder',
    'chicken',
    'twig',
    'dirtclod',
    'counterpane',
    'vest',
    'teratoma',
    'bunny',
    'rock',
    'pole',
    'carrot',
    'canoe',
    'inkwell',
    'hoe',
    'bandage',
    'trowel',
    'towel',
    'planter box',
    'anvil',
    'axle',
    'tuppence',
    'casket',
    'nosegay',
    'trinket',
    'credenza',
    'writ',
    //mine
    'roller skate',
    'tutleneck',
    'meat pouch',
    'leg bag',
    'pretzel',
];

const SEEK_TARGET_OBJECTS = [
    'Stewboots',
    'Last Boner in Belfast',
    'Standard of Mediocrity',
    'Turgid Trumpet',
    'Cumberbund of Combobulation',
    'Secret Source Code',
    'Colonel\'s Right Recipe',
    'Fountain of Lamneth',
]

export const EPITHET_DESCRIPTORS: string[] = [
    'Cow-eyed',
    'Soggy',
    'Milk-white',
    'Weather-worn',
    'Jaunty',
    'Bronzed',
    'Ruthless'
]

export const EPITHET_BEING_ALL: string[] = [
    'Bard',
    'Traveler',
    'Wanderer',
    'Adventurer',
    'Conqueror',
]

export const EPITHET_BEING_MALE: string[] = [
    'Fellow',
    'Temptor',
    'God',
]

export const EPITHET_BEING_FEMALE: string[] = [
    'Goddess',
    'Lass',
    'Temptress',
];

export const TITLE_OBJECTS: string[] = [
    'Funk',
    'Audacity',
    'Courage',
    'Fecklessness',
]

export const TITLE_POSITIONS_ALL: HeroTitlePosition[] = [
    {
        description: 'Vice-corporal',
        titleObjectList: [...STANDARD_PLACES, ...TITLE_OBJECTS],
    },
    {
        description: 'Poet Laureate',
        titleObjectList: STANDARD_PLACES,
    },
    {
        description: 'Blue Ribbon Winner',
        titleObjectList: TITLE_OBJECTS,
    },
    {
        description: 'Connoisseur',
        titleObjectList: TITLE_OBJECTS,
    },
];

export const SOBRIQUET_MODIFIERS: string[] = [
    'Old',
    'The',
    'Copper',
    'Big',
    'Tiny',
];

export const SOBRIQUET_NOUN_PORTION: string[] = [
    'fox',
    'tims',
    'soul',
    'crank',
    'munch',
    'tugger',
    'tower',
    'blossom',
    'sweet',
    'silver',
    'bell',
    'dale',
    'horn',
    'way',
    'star',
];

export const HONORIFIC_TEMPLATES: string[] = [
    '%NAME%, Esquire',
    'Prof %NAME%',
    'Reverend %NAME%',
    'Professor %NAME%',
    'Swami %NAME%',
    '%NAME%, MD',
    'The Right Reverend %NAME%',
    'Herr Doktor %NAME%',
    'Frau Doktor %NAME%',
    'Elder %NAME%',
    'Your Excellency, %NAME%',
    'The Most Honorable %NAME%',
    'Primus %NAME%',
]

export const OFFICE_POSITIONS_ALL: string[] = [
    'Noob',
    'Pawn',
    'Lackey',
    'Patsy',
    'Court Jester',
    'Mascot',
    'Treasurer',
    'Artist-in-Residence',
    'Reconnoitrer',
    'Striker',
    'Speaker',
    'Captain',
    'Director',
    'Messiah',
]