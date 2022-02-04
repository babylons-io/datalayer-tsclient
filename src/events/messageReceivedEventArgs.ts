import { RabbitmqExchange } from "@/core";
import amqp from "amqplib/callback_api";


export interface MessageReceivedEventArgs {

    exchange?: RabbitmqExchange;
    message: amqp.Message;
}