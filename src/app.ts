import { DatalayerClient } from "./business";

const run = async () => {

    var client = new DatalayerClient();

    await client.init();

    var promises = [] as Promise<void>[];

    for ( let i = 0; i < 1000; i++ ) {

        var promise = new Promise<void>( ( resolve, reject ) => {

            client.read( `SELECT * FROM chain97.ethlogs LIMIT ${ Math.floor( Math.random() * 100 + 80 ) }` ).then(
                res => {
                    console.log( `received ${ i }` );
                    resolve();
                }
            );

        } );

        promises.push(promise);

    }

    Promise.all(promises);

};

run();
