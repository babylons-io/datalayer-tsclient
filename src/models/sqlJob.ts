
export enum SqlJobType {
    Read = 0,
    Write = 1,
    Transaction = 2
}


export interface SqlJob {

    jobGuid: string;
    queryGuid: string;
    query: string;
    sqlJobType: SqlJobType;
}