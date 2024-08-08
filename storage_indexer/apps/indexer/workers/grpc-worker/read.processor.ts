import protos, { aptos } from "@aptos-labs/aptos-protos";
import { LevelDB } from "@nine/lama";

const MODULE_ADDRESS = process.env.MODULE_ADDRESS!

const NINE = `${MODULE_ADDRESS}::store_cid` as const


const SUPPORTED_EVENT_TYPES = [
    `${NINE}::CidStoredEvent`,
   
]

export type ProcessingResult = {
    startVersion: bigint;
    endVersion: bigint;
};

export abstract class TransactionsProcessor {

    abstract name(): string;


    abstract processTransactions({
        transactions,
        startVersion,
        endVersion,
        db
    }: {
        transactions: aptos.transaction.v1.Transaction[];
        startVersion: bigint;
        endVersion: bigint;
        db: LevelDB
    }): Promise<ProcessingResult>;

}


export class ReadProcessor extends TransactionsProcessor {
    name(): string {
        return "read_processor";
    }

    async processTransactions({
        transactions,
        startVersion,
        endVersion,
        db
    }: {
        transactions: aptos.transaction.v1.Transaction[];
        startVersion: bigint;
        endVersion: bigint;
        db: LevelDB
    }): Promise<ProcessingResult> {
        for (const transaction of transactions) {

            if (transaction.type != protos.aptos.transaction.v1.Transaction_TransactionType.TRANSACTION_TYPE_USER) {
                continue
            }

            const userTransaction = transaction.user!;


            const hex_signature = userTransaction.request?.signature?.ed25519?.signature ?
                Buffer.from(userTransaction.request?.signature?.ed25519?.signature!).toString('hex') : ''

            if (!userTransaction.events) {
                continue
            }

            const events = userTransaction.events!;

            for (const event of events) {
                const eventType = event.typeStr;
                if (eventType && SUPPORTED_EVENT_TYPES.includes(eventType)) {
                    console.log("Processing event", eventType)
                    await db.put({
                        type: eventType?.split("::")?.at(2),
                        event: event.data,
                        signature: hex_signature
                    })
                }
            }

        }
        return {
            startVersion,
            endVersion
        };
    }
}