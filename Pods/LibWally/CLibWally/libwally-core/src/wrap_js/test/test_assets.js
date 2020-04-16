var wally = require('../wally');
var test = require('tape');
var bigInt = require('big-integer');

var ONES = "1111111111111111111111111111111111111111111111111111111111111111";

var h = function (h) { return Buffer.from(h, 'hex'); };
var b = function (b) { return Buffer.from(b).toString('hex'); }
var toBigInt = function (n) {
  var s = bigInt(n).toString(16);
  while (s.length < 16) s = '0' + s;
  return new Uint8Array(Buffer.from(s, 'hex'));
}

test('constants', function (t) {
  t.plan(2);
  t.equal(toBigInt(0).toString(), wally.ZERO_64.toString());
  t.equal(toBigInt(1).toString(), wally.ONE_64.toString());
});

test('value commitment', function (t) {
  t.plan(1);
  var vbf = h("8b5d87d94b9f54dc5dd9f31df5dffedc974fc4d5bf0d2ee1297e5aba504ccc26");
  var generator = h("0ba4fd25e0e2108e55aec683810a8652f9b067242419a1f7cc0f01f92b4b078252");
  wally.wally_asset_value_commitment(toBigInt(10000), vbf, generator)
       .then(function (commitment) {
         t.equal(b(commitment), "08a9de5e391458abf4eb6ff0cc346fa0a8b5b0806b2ee9261dde54d436423c1982");
       });
});

test('final vbf', function (t) {
  t.plan(1);
  var asset = h(ONES);
  var abf = h(ONES);
  var values = [ 20000, 4910, 13990, 1100 ].map(toBigInt);
  var abfs = h("7fca161c2b849a434f49065cf590f5f1909f25e252f728dfd53669c3c8f8e37100000000000000000000000000000000000000000000000000000000000000002c89075f3c8861fea27a15682d664fb643bc08598fe36dcf817fcabc7ef5cf2efdac7bbad99a45187f863cd58686a75135f2cc0714052f809b0c1f603bcdc574");
  var vbfs = h("1c07611b193009e847e5b296f05a561c559ca84e16d1edae6cbe914b73fb6904000000000000000000000000000000000000000000000000000000000000000074e4135177cd281b332bb8fceb46da32abda5d6dc4d2eef6342a5399c9fb3c48");

  wally.wally_asset_generator_from_bytes(asset, abf).then(function (_unused_gen) {
    return wally.wally_asset_final_vbf(values, 1, abfs, vbfs);
  }).then(function (vbf) {
    t.equal(b(vbf), "6996212c70fa85b82d4fd76bd262e0cebc5d8f52350a73af8d2b881a30442b9d");
  });
});

test('unblind', function (t) {
  t.plan(4);
  var pubkey = '031b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f';
  var privkey = '9aa45bf2c9a7f3e44192d5d1ff282d60c429bb94836947581dbd66ca0ba00d02';
  var rangeproof = '4024cfdf01b235e6e17c51d1ba70db19ba96ca9c251fb8a125bca489075a51f4d280a87f9f4735729569609a6d852eec8ef45c9d00822af3cce60290935d0439c97d133b66fa4d3ebc9400aefd9c372688c01ff2386af9205726a13c9701bfaa6603fa2cd79fe49934f63a9fd37c187cdcf0b6ce1894cbc34a819daf7d967cf7aad343c28a3dd0e6582f8911145e850a26bf8d7ea06f5e9446cc5f2b6a9f82f9b3107cdfa2ddf838b890346e996416151d23fac97a641fc173842a266023e3fe44bd7878af21b22b1b7b066d4980ed0611c73c722ba65e142359f5332bb680dccfe24b40d76f5a322738cb730f2a0a4bc705d62abfada8fe4167847dc4bc6efb18ff0c75a82a17672c6eb4b94d71bc63803b6884f6a7d69896cd864e967d1b9ec498edbaffcacebc10f2e974da6c9f39e77ef4d263e4a749c266b504209d39ce784bea6d60049fe745450ce44d84ad60184b5fff0fa11855dd5738ed2ed213afa9101bda59feaa21c05c4cdb4953f0dfba1e2989544d302412c802a660fbe0056bc38ca127d9091898c9c6424ac693da66a9405d7c1a759e19a90fe9c5dd01019303416094fb2c6296db2096ec11df1f169037c08fe48eb2039d20827c9046b02f0d10d3c5baf4672e0747e1a52c555698b7f528489710aa7874a7d1c5cdec6c7f359751b505f597bbf20f0749fdf3dfbff411b91a41a639f09f9a008e09fdf5e87faf3312da31e47c20abc47c757ecae7cf6ef87cfdc48d266c72c581d18c0f33cbbbe2e6d065afe608fd1d2dbe57abfa01726545a3c2b9c85568d5f8f6b743d3e91871859433edf2a5ae5c33f61d05b52ba8d11215f5955e22207f56a80731cfd3d5a86be04e44020043226151e3edeb150522df68a0c6f3d28d5ae12a517095644451dc5cf2773c2e2abb6ca0c39b8b9dc565b07ff35ab49a1170ef87e77606d728abbdbfbd9c699ea5c039ccb8b17c52f14ffb93db491d0fa6704c9155c0f8c4bf3e817686b15b444582beffabd9dba920a8d96c247493c0184e82cca1beef7c8f16141fd26467071b28a881f1d1e4d201b6dfb1173b87f8e6f7de1d5e5533175bac5f9d6d63c00f7adb16268a7c2bc374bc9993d9b5a084a718c8cb91c6403b3494b71822f8dfe2c3af949d5c8c9275a167938adfbe13cd960dce2c6904ff6e07140f27b58e0ed73e3cabdcea8d321e48bd000cf4f568e5da0b89aa139ec66a6ae2c75db15b616e2ee03e941a8d71e5ed7d62bb507af175ec6bde9a1ff8730ecae93f724cd890cfeaffe23fd77faf768033a6b71a35fbf19544a8c762c80d8a44aaad5eaa08bb118d156476478b8615f7c7235d1f375e6bcda1381eed23d28f3ffc33f2fd4121c150e0adbb971f7622014f9ffc8d4ae916d44ad59e6bc9923bba5c6450fb42d5a9a589412c3688bec3b527ac15594f8181cccd5c8466a6e2a0d31de9562f5abfbd34a2fb766961c3e368ee025f7e9f071bd23da46d3b20d39c187df373b647445995c7111c406c3e5a9cd74ebc3eae76cb0539291f3bbd6ec038dc1a693a25aa51d5c458dec91bd90bf53f6ca169edabbcdf8ea73e200794ad9a4a6c265c881c36e6702a20ddb04a68e19d564be553e49aa3f95ee3ab3f05c9f3c02707b666f459e78e57a6d9137739be9f4f2fb85ab40026b5eed57fb2740265878939e1f4206656c9e20403b7e1c6f6bc4256ea2c7fa7c832dbb290bbae1b8084564cac8c34ce980e155f1caac0466a7b59430cc345d7898b91cd53626007ef44bbbd9e1d7a174b5ab818090426c2773928f41bf41aacc8fb45f4c2a8a270f11a409607c4404d67ae1f5b352439ed3bb822687f4eaa6dbf03982c1abbe437bc99ca44b0e5e4a4ca8bea06c79e9c61ade5418dd2cdaf1627912721c5fa5b4f53c1dacdf6d3f7c977a98ea69c399205e51173f13c74cb5993f7186ee6e1c1f7b3bfde06affc80fa271d08d3a239ddd104390e8c68b631a91d2dcf313ff6ab4f68360f323f71606da5c81495be0de9f3031c9f8823332246b66bed20fece4dfd5f6d941188b2eecdaad987a9a268cfb43de818818b4b3b1e3ad58779df32d47ddaa4d2e94ac40f07f413c36d962ebaf82e1abdecb251041d41dd85494cfafcdbf3af426d91740ed6658f70fa65b59ec309529f4b58154f5c6a76e56f6ebe02c3f03d766b460c2919b1ad7ee96a4319198309c3c78e7bfc6c4eaa2a58c8733e81cc3f1d96cb2389ae6d925438169b481c12893eed0822acf379dc053741c8fb9c95e16ec4bd9d350a34284a702c48cac7d62d00616d3e8daa9bed71569d4ad788c72ca7cdbb562d065d8b2dda835dab612407d398467b5b9272b2784ee026e54b3fbccb98fa4ee7b8dea2f673ccf865c4e14a34b6804a26ff6fbad5efd67f711b20c33a754ed143d0f80525ef5b4d74fee1ea093de56daae104596d16a6c23aedf6193ec78b28d7d4eebc3e91bd779d3be58e52d7f785a8264e435edaacb67368e8d4a096643449375426eb7cb81af820d22ecb86ba2c4649bce5427025cbc3f6319829076031c7759ab0825b4960b2849d653757791f43e17e0f97555be5a1846acd681571f859e6d3c6cd411602bc196acb234078391bce1116e66bcfc5bf23f2c7b545122f9112b9aeafc1ea001164b72db16f579550914b1fa0ead1576c1e9e92b923e4d7ff713cb2a62e2b0ed28db2ec9ca22efaf987fd465877e68bf2201e0fff5e116fd225c545500556958f9684a6a2859b867d32386882ab30718af64677f3026e682904c3d794016685d2dedf67381af9dfb385e523115635ffaa1b98d7f2db759c24f3e9979fa52644e8221f88a398ff2a4b8b30027b72bc3ef8b2837a03e688b582b6474f9a283bb40d173d91612c45bbd685b91edb754c2afb6977eeded2196d5faa6f31d1dc332db85462b976a086eee8f93852c7811d51984df3ee43f00466f9974b60d65567ea3437b2ff88d92e9dbba1399edf559fec42057fcf6d1e84538dc892b0c4c3464d1554ccc0d42f7d857ee5ab5510ff439806e4344abe376cc8bd8e0c24a4ca47a5658d2ea4959257bf85055455c51aad47ec65d8b4cd11c3da1f346ae2ae16119c088ed211eb76d01ef527183057f436a42af31f386e9cf31951688e3ebbf590e9377ee33d4f9a630d4c93237e14d543a78db67adddd7e13ca028c94c6c8fb6060b81ad6d47f5ac366d3938f0a41f5e471a7cf7ed4304cf3bea1827285284f5a233e13da4fcc18cc18d04dbfac14be365c1dfba3c88c5232023a4285ed9ce833b1cd56c71bb14882008ecc4828aa558d69ac79827d0cb37b438785f57bc73d8807b572f5cb5a96fb9f76b8d2d8aedce8a056fdc7c779f12ca55b54d1e0984a97dce56ab65dbf1abb8a192d0fba61e72005d4b689f63bc2170ac8642c8eb4bbc38e4baa1ee1f6dac5f9adf3c244acb371768c6faf5143c8330602ea5393bf594241e8f0ae85c8e826fe7061e3c842562b87b4f40f9935b1451c9fc88d4c52cb50491b9a2a156699245c3f3e502334d0b2805648478a615171eb4c26652ed989ecca43637c23cbf2d8e25f8e7feae56db8607084a07b12836fdc55e76bb425b4efec6c5bd1f60a710cb93ef8a94fb36eec384a8c42b00c9852af105273ff35da4e055671bef3960b7a428e999b8bd0f10c6e7d5a4c799e1ec84c509efe3386bda4e67c61eab1ccea3911e3d35bbdc464784b03b69e7514aeccdb42a9a647c847b861cbfec3e062628f9a832d4712b342e9017a0db86e1d47a2c17198cd5929265c7bc36737eb0373e33bee9dc2fcddf9ce275c5900b29e616cc3ca878267f560a5629c76aafa133aa4806d581596f6f6ab89d06c526b3886b91e53f6db61d4947550b62564f31c6aa6b43aca25fa8b568e7cc262e0e351c31f56c55d951b4e74ba09963048673a45ce46b574c964c98acc8ab449b15ee5df95c4d1cb1fc899733955f8c04acd8e4c439ff4b94cab9691bba48657499d4ee3936db4966925621772d47ea75cf6738990eb8013be7e8f0b7e0ed2952e4c3c8cc7c051ad27c5bd4ac5101de9652c2b0ade8fa113f94aba6f0fca4445bf2c6154115524487c5d96189a3e9d8e91fc5042130687bd94b7a0362030a6e2f731497b19ba4b9b25426be79ddd2495975f7a6888a774a319906b81d5ea3cd8868c5800df526f8361abac3e59e0878631b1bb8319de314e382510e21113b12c7a0861';
  var commitment = '096f0d8beac5a1a56f9f3ea6d55c6f4f79e94c4eab9a0f1f28602b6548d3491d43';
  var generator = '0ad2641ccd4d87c1207cdf8fe931a0e7959fa92a012320a3df98b3229941bfd534';

  var expectedVal = '99999740000';
  var expectedAsset = '9520437ce8902eb379a7d8aaa98fc4c94eeb07b6684854868fa6f72bf34b0fd3';
  var expectedAbf = '5dd4b83ac4dc828b033874f818bd0b5575371cc0e1278c554905dfbb49740fda';
  var expectedVbf = 'ca4bb9102694dbe0e4b777fd9b199fbdaf51493e2167c24418ec5c3da5024af8';

  wally.wally_asset_unblind(h(pubkey), h(privkey), h(rangeproof), h(commitment), null, h(generator)).then(function (res) {
    t.equal(b(res[0]), expectedAsset, 'asset');
    t.equal(b(res[1]), expectedAbf, 'abf');
    t.equal(b(res[2]), expectedVbf, 'vbf');
    t.equal(bigInt.fromArray(Array.from(res[3]), 256).toString(), expectedVal, 'value');
  })
});

test('blinding key', function (t) {
    t.plan(2)

    var seed = 'c76c4ac4f4e4a00d6b274d5c39c700bb4a7ddc04fbc6f78e85ca75007b5b495f74a9043eeb77bdd53aa6fc3a0e31462270316fa04b8c19114c8798706cd02ac8';
    var script = '76a914a579388225827d9f2fe9014add644487808c695d88ac';

    var expectedMasterBlindingKey = '95290521883b24f28b5d8a4bdc3004b52162d21fcf78e9c4ea5fd9939794593f6c2de18eabeff3f7822bc724ad482bef0557f3e1c1e1c75b7a393a5ced4de616';
    var expectedBlindingKey = '4e6e94df28448c7bb159271fe546da464ea863b3887d2eec6afd841184b70592';

    wally.wally_asset_blinding_key_from_seed(h(seed)).then(function (key) {
        t.equal(b(key), expectedMasterBlindingKey, 'master_blinding_key');
    })

    wally.wally_asset_blinding_key_to_ec_private_key(h(expectedMasterBlindingKey), h(script)).then(function (key) {
        t.equal(b(key), expectedBlindingKey, 'blinding_key');
    })

});
