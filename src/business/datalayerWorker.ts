import { RabbitmqHandler } from "@/core";
import { ChannelCreatedEventArgs, MessageReceivedEventArgs } from "@/events";
import { SqlJob } from "@/models";
import amqp from "amqplib/callback_api";
import { Subject } from "rxjs";


export class DatalayerWorker {

    private readonly _rabbitMqHandler = new RabbitmqHandler();

    private readonly _readJobs: { [ guid: string ]: SqlJob; } = {};

    private readonly _writeJobs: { [ guid: string ]: SqlJob; } = {};

    private readonly _readJobResults: { [ guid: string ]: any; } = {};

    public readonly onWorkerReady = new Subject<void>();

    constructor () {

    }

    public async init() {

        await this._rabbitMqHandler.init();
        await this._initReadExchange();
        await this._initWriteExchange();
        await this._initReadResultExchange();
        await this._initWriteResultExchange();

    }

    private async _initReadExchange() {

        const channel = await this._rabbitMqHandler.declareChannel( this._readQueueLabel );

        await this._rabbitMqHandler.declareTopicExchange( this._readQueueLabel, { channel: channel, autoDelete: false, durable: true } );

    }

    private async _initWriteExchange( ) {

        const channel = await this._rabbitMqHandler.declareChannel( this._writeQueueLabel );

        await this._rabbitMqHandler.declareTopicExchange( this._writeQueueLabel, { channel: channel, autoDelete: false, durable: true } );

    }

    private async _initReadResultExchange( ) {
        
        const channel = await this._rabbitMqHandler.declareChannel( this._readResultQueueLabel );
        await this._rabbitMqHandler.declareTopicExchange( this._readResultQueueLabel, { channel: channel, autoDelete: false, durable: true } );
        await this._rabbitMqHandler.startListenExchange( this._readResultQueueLabel, this._readResultQueueLabel );
        this._rabbitMqHandler.onMessageReceived[ this._readResultQueueLabel ].subscribe( this._notifyReadResultReceived.bind( this ) );

    }

    private async _initWriteResultExchange( ) {
        
        const channel = await this._rabbitMqHandler.declareChannel( this._writeResultQueueLabel );
        await this._rabbitMqHandler.declareTopicExchange( this._writeResultQueueLabel, { channel: channel, autoDelete: false, durable: true } );
        await this._rabbitMqHandler.startListenExchange( this._writeResultQueueLabel, this._writeResultQueueLabel );

    }

    private get _readQueueLabel(): string {
        return process.env.Rabbitmq__PostgresqlReadQueue;
    }

    private get _writeQueueLabel(): string {
        return process.env.Rabbitmq__PostgresqlWriteQueue;
    }

    private get _readResultQueueLabel(): string {
        return process.env.Rabbitmq__PostgresqlReadResultQueue;
    }

    private get _writeResultQueueLabel(): string {
        return process.env.Rabbitmq__PostgresqlWriteResultQueue;
    }

    private _notifyReadResultReceived( event: MessageReceivedEventArgs ) {

        if ( "jobGuid" in event.message.properties.headers ) {

            console.log("message received");
            
            this._readJobResults[ event.message.properties.headers[ "jobGuid" ] ] = JSON.parse( event.message.content.toString() );

        }

    }

    private notifyWriteResultReceived() {

    }

    public async read( dbJob: SqlJob ) {

        this._readJobs[ dbJob.jobGuid ] = dbJob;

        this._rabbitMqHandler.exchanges[ this._readQueueLabel ].publishMessage( dbJob.query, { persistent: true, headers: { jobGuid: dbJob.jobGuid, queryGuid: dbJob.queryGuid } } );

    }

    public async write( dbJob: SqlJob ) {

    }

    public async getReadResult( jobGuid: string ) {

        // for ( let i = 0; i < 100; i++ ) {

        //     if ( ( jobGuid in this._readJobResults ) ) {
        //         return this._readJobResults[ jobGuid ];
        //     }

        //     await new Promise<void>( ( resolve ) => {
        //         setTimeout( () => {
        //             resolve();
        //         }, 50 );
        //     } );

        // }

        while (true) {
            if ( ( jobGuid in this._readJobResults ) ) {
                return this._readJobResults[ jobGuid ];
            }

            await new Promise<void>( ( resolve ) => {
                setTimeout( () => {
                    resolve();
                }, 50 );
            } );
        }

        return null;

    }

    public async getWriteResult( jobGuid: string ) {

    }

}