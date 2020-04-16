//
//  ViewController.swift
//  Segwit
//
//  Created by Anna Alimanova on 10.04.2020.
//  Copyright © 2020 Anna Alimanova. All rights reserved.
//

import UIKit
//import BitcoinKit
import BitcoinCore
import LibWally
import BitcoinKit

class ViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let mnemonic = BIP39Mnemonic("inform lyrics poverty saddle balcony timber duty other puzzle donkey glass ritual")
        let seed = Mnemonic.seed(mnemonic: ["inform", "lyrics", "poverty", "saddle", "balcony", "timber", "duty", "other", "puzzle", "donkey", "glass", "ritual"])
        
        let txHex = "00000000011b0e20e4be74dcb50ac352e49c014ab31ccdf8671162e29f81288543c45762e20000000000ffffffff02a08601000000000016001428db6ac6873671fd5e1ba7c66ff2d011b6736d96622c0400000000001976a91400a1bf13ac9ea27a268ef6f2b5601382be3c5cfd88ac00000000"
        
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
                let inputHex = "0200000002028435d6b22589ec3c7a6e4bbce39f7250371f038bd08b818b6062fa54163907010000006b483045022100a8dc60b9864e7645bc01b03e38710b003f29bf675dee6b5b96e4044e626336af0220721e4036e2e4b5f414bb943e90e6c567dac2dc90a3f5897b3c0c1b7b3fb619e6012102fc7d26a0c2c1a3f4b9e3fa9a666d7c15b53e6d842d4f871bc4880ffbf24ed1eaffffffffe2f07c65b4cac90a165a43e06e1e49fed274b0a862bc0bc29700f89283311c38010000006a47304402204690bf02237ae1156f9f127d9da930927f391ecc52c341cb8af045d84985e2d4022047156f3eeddae0de409d3924bac4ebdfb9212ffa751a16d8060729ea49ee61fb012102e5d46ff19cdd1e71a154275aef34c72f56fc4ebb7a34981260a77229b984e885ffffffff016be00500000000001600142f8fe25a1e435d31c935ae4c4af57fffbc56e59500000000"
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
                    
                    let hdWallet = HDWallet(seed: seed, coinType: network.coinType, xPrivKey: network.xPrivKey, xPubKey: network.xPrivKey)
                    
                    do {
//                        let pubKey = try hdWallet.publicKey(account: 0, index: 3, chain: .external)
                        let privKey = try hdWallet.privateKey(account: 0, index: 3, chain: .external)
                        let publ = try hdWallet.publicKey(account: 0, index: 12, external: true)
                        print(privKey.extended())
                        let pub = privKey.publicKey()
                        print(pub.extended())
                        let privKeyData = try hdWallet.privateKeyData(account: 0, index: 3, external: true)
                        let pubKeyData = try hdWallet.publicKey(account: 0, index: 3, chain: .external).raw
                        
                        let pubKey = PublicKey(withAccount: 0, index: 3, external: true, hdPublicKeyData: pubKeyData)
                        
                        let unspentOutput = UnspentOutput(output: output, publicKey: publ, transaction: inputTransaction.header)
                        let inputToSign = factory.inputToSign(withPreviousOutput: unspentOutput, script: scriptData, sequence: sequence)
                        inputToSign.previousOutput.scriptType = scriptData.first == 0 ? .p2wpkh : .p2pkh
                        let converter = Base58AddressConverter(addressVersion: network.pubKeyHash, addressScriptVersion: network.scriptHash)
                        let address = try converter.convert(publicKey: publ, type: inputToSign.previousOutput.scriptType)
                        inputToSign.previousOutput.keyHash = address.keyHash
                        let mutableTransaction = MutableTransaction()
                        mutableTransaction.outputs = messTransaction.outputs
                        mutableTransaction.add(inputToSign: inputToSign)
                        
                        
                        
                        
                        
                        let inputSigner = InputSigner(hdWallet: hdWallet, network: network)
                        let transactionSigner = TransactionSigner(inputSigner: inputSigner)
                        try transactionSigner.sign(mutableTransaction: mutableTransaction)
                        print(mutableTransaction.build().header.dataHash.hex)
                        print(mutableTransaction.transaction.dataHash.hex)
                        
                        
                        
                        let trans = TransactionMessage(transaction: mutableTransaction.build(), size: 0)
                        
                        let data = try networkMessageSerializer.serialize(message: trans)
                        print(data.hex)
                        let data2 = serializer.serialize(message: trans)
                        print(data2?.hex)
                        print("")
                        
                    } catch {
                        print("ERROR: ", error)
                    }
                    
//                    let hdPrivKeyData = try! hdWallet.privateKeyData(account: 0, index: index, external: chain == .external)
                    
//                    let publicKey = PublicKey(withAccount: 0, index: 0, external: true, hdPublicKeyData: Data())
                    
                    
//                }
            }
            
            
        }
        
        
        
        
        
        
        
        
        //        do {
        //        let psbt = try PSBT(txHex, .testnet)
        ////        print(psbt?.transaction)
        //        } catch {
        //            print(error)
        //        }
        
        
        // LibWalley
        //        guard let seed = mnemonic?.seedHex("") else { return }
        //
        //        let masterKey = LibWally.HDKey(seed, .testnet)!
        //        print(masterKey.fingerprint.hexString)
        //        let path = BIP32Path("m/44'/0'/0'/0")!
        //        let account = try! masterKey.derive(path)
        //
        //        guard let tr = Transaction(txHex) else { return }
        //
        //        let txId = "c0d729e01fba3f5d491b7abde2c4ed532a8fb4fe461258a21476d9c404982993"
        //        let vout: UInt32 = 0
        //        let amount: Satoshi = 10000
        //        var addressFrom = Address("myriCcJ4A5A4oiMa8sPW8rc5yBqeWAtDAS")
        //        var destinationAddress = Address("mp3iaTnVaZEmZ7QsdAqsQWTio66VqkbwN2")
        //
        //        let witness = Witness(.payToWitnessPubKeyHash(account.pubKey))
        //        guard let rootTr = Transaction(txId),
        //            let address = addressFrom  else {
        //                return
        //        }
        //        print(tr.wally_tx?.pointee.outputs)
        //        let sigScr = ScriptSig(.payToPubKeyHash(account.pubKey))
        //        guard let input = TxInput(rootTr, vout, amount, sigScr, nil, address.scriptPubKey) else {
        //            return
        //        }
        //        var transaction = Transaction([input], [LibWally.TxOutput(destinationAddress!.scriptPubKey, amount - 110, .testnet)])
        //        let fee = transaction.feeRate // Satoshi per byte
        ////        let accountPriv = HDKey("xpriv...")
        ////        let privKey =  account!)
        //        print(transaction.sign([account]))
        //        print(transaction.description) // transaction hex
    }
}

extension Data {
    public var hexString: String {
        return map({ String(format: "%02x", $0) }).joined()
    }
}
