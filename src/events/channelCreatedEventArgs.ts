import amqp from "amqplib/callback_api";


export interface ChannelCreatedEventArgs {

    channel: amqp.Channel;
    label: string;
}


