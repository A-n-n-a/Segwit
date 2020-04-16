//
//  ViewController.swift
//  Segwit
//
//  Created by Anna Alimanova on 10.04.2020.
//  Copyright © 2020 Anna Alimanova. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let seed = Mnemonic.seed(mnemonic: ["inform", "lyrics", "poverty", "saddle", "balcony", "timber", "duty", "other", "puzzle", "donkey", "glass", "ritual"])
        
        let txHex = "00000000017584f0d848ed649068a3c561401bb3841fa009dc7dd43361ebb5048b43b198320100000000ffffffff0210270000000000001976a9145d92735cae0d287d91a9d12d05c2c46f533bcdb388ac08d70300000000001976a91400a1bf13ac9ea27a268ef6f2b5601382be3c5cfd88ac00000000"
        
        guard let data = Data(hex: txHex),
            let message = TransactionMessageParser().parse(data: data) as? TransactionMessage else { return }
        
        let messTransaction = message.transaction
        let messInputs = messTransaction.inputs

        
        
        for input in messInputs {
            
            // FIND INPUT IN RESPONSE WITH TX_ID
            var previousHash = input.previousOutputTxHash
            previousHash.reverse()
//            guard let responseInputs = transactionBitcoinInput?.inputs else { return nil}
            
//            for responseInput in responseInputs where responseInput.txId == previousHash.hex {
                //GET TRANSACTION WITH INPUT` TX_HEX
                let inputHex = "020000000001011b0e20e4be74dcb50ac352e49c014ab31ccdf8671162e29f81288543c45762e20000000000ffffffff02a08601000000000016001428db6ac6873671fd5e1ba7c66ff2d011b6736d96622c0400000000001976a91400a1bf13ac9ea27a268ef6f2b5601382be3c5cfd88ac02473044022032d012bbfef12c2883ec5e5fa8d5dcd4d29812658ca39002cc9de2c7f2dc1cdc02206e260208da3ee13f4e1e365f827aa26154c949f47fd1dbb5a4179aa485bdf0d80121029961251239f82a00b9551c9d248f222b1e346d0d4a254c18ef2feb77936440ee00000000"
                guard let inputHexData = Data(hex: inputHex) else { return }
                let previousIndex = input.previousOutputIndex
                if let inputTransactionMessage = TransactionMessageParser().parse(data: inputHexData) as? TransactionMessage {
                    let inputTransaction = inputTransactionMessage.transaction
                    
                    //OUTPUT
                    let outputs = inputTransaction.outputs
                    let output = outputs[previousIndex]
                    let scriptData = output.lockingScript
                    let sequence = input.sequence
                    let network = TestNet()
                    
                    
                    let networkMessageParser = NetworkMessageParser(magic: network.magic)
                    let networkMessageSerializer = NetworkMessageSerializer(magic: network.magic)
                    let serializer = TransactionMessageSerializer()
                    networkMessageSerializer.add(serializer: serializer)
                    let factory = Factory(network: network, networkMessageParser: networkMessageParser, networkMessageSerializer: networkMessageSerializer)
                    
                    do {
                        
                        //WALLET, PUBLIC KEY
                        let hdWallet = HDWallet(seed: seed, coinType: network.coinType, xPrivKey: network.xPrivKey, xPubKey: network.xPrivKey)
                        let publickKey = try hdWallet.publicKey(account: 0, index: 3, external: true)
                        
                        //UNSPENT OUTPUT
                        let unspentOutput = UnspentOutput(output: output, publicKey: publickKey, transaction: inputTransaction.header)
                        
                        //INPUT TO SIGN
                        let inputToSign = factory.inputToSign(withPreviousOutput: unspentOutput, script: scriptData, sequence: sequence)
                        inputToSign.previousOutput.scriptType = scriptData.first == 0 ? .p2wpkh : .p2pkh
                        let converter = Base58AddressConverter(addressVersion: network.pubKeyHash, addressScriptVersion: network.scriptHash)
                        let address = try converter.convert(publicKey: publickKey, type: inputToSign.previousOutput.scriptType)
                        inputToSign.previousOutput.keyHash = address.keyHash
                        
                        //MUTABLE TRANSACTION
                        let mutableTransaction = MutableTransaction()
                        mutableTransaction.outputs = messTransaction.outputs
                        mutableTransaction.add(inputToSign: inputToSign)
                        
                        
                        
                        
                        //SIGN
                        let inputSigner = InputSigner(hdWallet: hdWallet, network: network)
                        let transactionSigner = TransactionSigner(inputSigner: inputSigner)
                        try transactionSigner.sign(mutableTransaction: mutableTransaction)

                        //TRANSACTION HEX
                        let trans = TransactionMessage(transaction: mutableTransaction.build(), size: 0)
                        let data2 = serializer.serialize(message: trans)
                        print(data2?.hex)
                        print("")
                        
                    } catch {
                        print("ERROR: ", error)
                    }
            }
        }
    }
}

extension Data {
    public var hexString: String {
        return map({ String(format: "%02x", $0) }).joined()
    }
}
