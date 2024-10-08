import { CreateRequestParams } from "../types";
import { storeRequest } from "../ipfs";
import { storeCidOnchain } from "../utils";

/**
 * Create a request.
 * @param args The request creation parameters.
 */
export async function createRequest(args: CreateRequestParams): Promise<string> {
    try {
        // Store in IPFS
        const address = await storeRequest(args);
        // Store in blockchain
        await storeCidOnchain(address.toString());
        console.log("Successfully created request onchain");
        return address.toString();
    } catch (err) {
        console.log(err);
        throw new Error("Could Not Create Request");
    }
}
// (async()=>{
//     const CreateRequestParams = {
//         requestInfo: {
//             expectedAmount: 22,
    
//             // The payee identity. Not necessarily the same as the payment recipient.
//             payeeAddress: "0x42914687dd53c75600cb5834695a58625169b9f559fd0d84d9c0995cc953daba",
    
//             // The payer identity. If omitted, any identity can pay the request.
//             payerAddress: "0x42914687dd53c75600cb5834695a58625169b9f559fd0d84d9c0995cc953daba",
    
//             // The request creation timestamp.
//             timestamp: "string",
//         },
    
//         // The contentData can contain anything.
//         contentData: {
//             reason: "string",
//             dueDate: "string",
//         },
    
//         // The identity that signs the request, either payee or payer identity.
//         signerAddress: "0x42914687dd53c75600cb5834695a58625169b9f559fd0d84d9c0995cc953daba",
//     }
//     const cid = await createRequest(CreateRequestParams)
//     console.log("Returned string", cid);
// })()