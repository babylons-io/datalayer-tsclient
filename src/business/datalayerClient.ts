import { ReadResponseDTO, SqlJob, SqlJobType } from "@models/index";
import { DatalayerWorker } from ".";
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';


export class DatalayerClient {

    private _worker = new DatalayerWorker();

    constructor () {

    }

    public async init() {

        await this._worker.init();
        
    }

    public async write( sqlQuery: string | string[] ) {

        if ( Array.isArray( sqlQuery ) ) {

            await this.writeList( sqlQuery );

        }

        else {

            await this.writeSingle( sqlQuery );

        }

    }

    public async read<Tout>( sqlQuery: string ) {

        var jobGuid = uuidv4();
        var queryGuid = uuidv5( sqlQuery, process.env.Mics__QueryBaseGuid );

        var job = { query: sqlQuery, queryGuid: queryGuid, jobGuid: jobGuid, sqlJobType: SqlJobType.Read } as SqlJob;

        this._worker.read( job );

        return await this._worker.getReadResult( job.jobGuid );

    }

    private async writeList( sqlQueries: string[] ) {

    }

    private async writeSingle( sqlQuery: string ) {

    }
}