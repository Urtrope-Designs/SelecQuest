export interface MajorRewardCoefficient {
    quadraticCoefficient: number;
    linearCoefficient: number;
    yIntercept: number;
}

export interface QuestRewardTypeOdds {
    connectionOdds: number;
    membershipOdds: number;
    officeOdds: number;
}

export interface EnvironmentalLimitCoefficient {
    levelAddend: number;
    levelCoefficient: number;
    limitingStatAddend: number;
    limitingStatCoefficient: number;
    limitingStatExponent: number;
    limitingStatLevelExponent: number;
}