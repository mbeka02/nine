import { aptos } from "@aptos-labs/aptos-protos";
import { LevelDB } from "@nine/lama";


/**
 * The result of processing a chunk of transactions. This is lets the prcoessor tell
 * the worker what range of transactions it processed.
 */
export type ProcessingResult = {
    startVersion: bigint;
    endVersion: bigint;
};

/**
 * A processor is given a batch of transactions. It is expected to process the
 * transactions, write some derived data to storage if appropriate, and return the
 * range of transactions it processed.
 */
export abstract class TransactionsProcessor {
    /**
     * Name of the processor for status logging and tracking of the latest processed
     * version. Prefer camel_case.
     */
    abstract name(): string;

    /**
     * Process transactions. The function is given the start and end versions of the
     * given chunk of transactions. It is expected to process the transactions, write
     * to storage if appropriate, and return the range of transactions it processed.
     */
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