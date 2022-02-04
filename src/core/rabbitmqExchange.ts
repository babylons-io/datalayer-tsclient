import { ExchangeOption } from "@/models";
import amqp from "amqplib/callback_api";
import { RabbitmqHandler } from "./rabbitmqHandler";

export class RabbitmqExchange {

    public channel: amqp.Channel;

    constructor ( public readonly exchangeName: string, private readonly handler: RabbitmqHandler ) { }

    public async defineTopicExchange( options: ExchangeOption ) {

        return new Promise<void>( ( resolve, reject ) => {
            
            this.channel.assertExchange( this.exchangeName, "topic", options, ( error, result ) => {

                if ( error ) {
                    reject( error );
                }

                console.log( `exchange ${result.exchange} is defined` );

                resolve();

            } );

            resolve();

        } );

    }

    public listen() {

    }

    public publishObject( obj: any, options: amqp.Options.Publish ): boolean {

        return this.channel.publish( this.exchangeName, "", Buffer.from( JSON.stringify( obj ) ), options );

    }

    public publishMessage( message: string, options: amqp.Options.Publish ): boolean {

        return this.channel.publish( this.exchangeName, "", Buffer.from( message ), options );

    }

}