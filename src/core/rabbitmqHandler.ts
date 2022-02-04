
import { ChannelCreatedEventArgs, MessageReceivedEventArgs } from "@/events";
import { ExchangeOption } from "@models/index";
import amqp from "amqplib/callback_api";
import { Subject } from "rxjs";
import { RabbitmqExchange } from "./rabbitmqExchange";


export class RabbitmqHandler {

    public readonly exchanges: { [ label: string ]: RabbitmqExchange; } = {};

    public readonly onChannelCreated = new Subject<ChannelCreatedEventArgs>();

    public readonly onMessageReceived: { [ exchangeLabel: string ]: Subject<MessageReceivedEventArgs>; } = {};

    public connection: amqp.Connection;

    constructor () {

        this._notifyChannelCreated;

    }

    public async init() {

        await this.connect();

    }

    private async _notifyChannelCreated( exchange: RabbitmqExchange ) {

    }

    private get _connectionUrl() {

        return `amqp://${ process.env.Rabbitmq__User }:${ process.env.Rabbitmq__Password }@${ process.env.Rabbitmq__Host }:${ process.env.Rabbitmq__Port }`;

    }

    public async connect() {

        var self = this;

        return new Promise<void>( ( resolve, reject ) => {

            amqp.connect( this._connectionUrl, ( error, connection ) => {

                if ( error ) {

                    reject( "connection not be created" );

                }

                self.connection = connection;

                resolve();

            } );

        } );

    }

    public async declareChannel( channelLabel: string ): Promise<amqp.Channel> {

        const self = this;

        return new Promise<amqp.Channel>( ( resolve, reject ) => {

            self.connection.createChannel( ( error, channel ) => {

                if ( error ) {

                    throw new Error( "connection not be created" );

                }

                console.log( "channel created" );

                resolve( channel );

            } );

        } );

    }

    public async declareTopicExchange( exchangeLabel: string, options: ExchangeOption ): Promise<RabbitmqExchange> {

        const exchange = new RabbitmqExchange( exchangeLabel, this );

        exchange.channel = options.channel;

        this.exchanges[ exchangeLabel ] = exchange;

        await exchange.defineTopicExchange( options );

        return exchange;

    }

    public async startListenExchange( exchangeLabel: string, queueLabel: string ) {

        const exchange = this.exchanges[ exchangeLabel ];

        exchange.channel.bindQueue( queueLabel, exchangeLabel, "" );

        this.onMessageReceived[ exchangeLabel ] = new Subject<MessageReceivedEventArgs>();

        exchange.channel.consume( queueLabel, ( msg: amqp.Message ) => {
            

            this.onMessageReceived[ exchangeLabel ].next( {

                exchange: exchange,
                message: msg

            } );

        }, {
            noAck: true
        } );

    }

}