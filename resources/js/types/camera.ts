export type Camera = {
    slug: string;
    name: string;
    mainPath: string;
    subPath: string;
};

export type StreamStatus =
    | 'connecting'
    | 'playing'
    | 'paused'
    | 'retrying'
    | 'unsupported';
