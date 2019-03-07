import { HeroTitlePosition } from "../models/models";

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