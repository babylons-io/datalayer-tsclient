import amqp from "amqplib/callback_api";

export interface ExchangeOption extends amqp.Options.AssertExchange {

    channel: amqp.Channel;
}