

export class ReadResponseDTO<Tout> {

    result: Tout | null;
    queryKey: string;
    jobKey: string;
    query: string | string[];

}