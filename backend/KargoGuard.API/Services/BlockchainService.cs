using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;

namespace KargoGuard.API.Services;

public interface IBlockchainService
{
    Task<string> RecordDeliveryToBlockchainAsync(int cargoId, string status, string photoHash);
}

public class BlockchainService : IBlockchainService
{
    private readonly Web3 _web3;
    private readonly Contract _contract;
    private readonly ILogger<BlockchainService> _logger;
    private readonly string _contractAddress;

    // CargoGuard.sol içerisindeki sadece kayıt fonksiyonunun ABI temsilidir (Asgari boyut için).
    private readonly string _abi = @"[{""inputs"":[{""internalType"":""uint256"",""name"":""_cargoId"",""type"":""uint256""},{""internalType"":""string"",""name"":""_aiStatus"",""type"":""string""},{""internalType"":""string"",""name"":""_photoHash"",""type"":""string""}],""name"":""recordCargoDelivery"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""}]";

    public BlockchainService(IConfiguration config, ILogger<BlockchainService> logger)
    {
        _logger = logger;
        
        var alchemyUrl = config["Blockchain:AlchemyUrl"];
        var privateKey = config["Blockchain:PrivateKey"];
        _contractAddress = config["Blockchain:ContractAddress"];

        var account = new Account(privateKey, 11155111); // 11155111: Ethereum Sepolia Chain ID
        _web3 = new Web3(account, alchemyUrl);
        _contract = _web3.Eth.GetContract(_abi, _contractAddress);
    }

    public async Task<string> RecordDeliveryToBlockchainAsync(int cargoId, string status, string photoHash)
    {
        try
        {
            var recordFunction = _contract.GetFunction("recordCargoDelivery");
            
            _logger.LogInformation("🚀 Blokzincire gönderiliyor... Kargo ID: {CargoId}, Karar: {Status}", cargoId, status);

            // Nethereum içindeki TransactionManager, Web3'e Account verdiğimiz için kendi gas tahminini ve kimlik eşleştirmesini kendisi kusursuz yapar.
            // Fakat 'null' atadığımızda Sepolia Ağı için veri boyutundan ötürü varsayılan 21000 Gas yetersiz (intrinsic gas too low) kalıyor.
            var gasLimit = new HexBigInteger(3000000); // Çok cömert bir üst limit atıyoruz (Kullanılmayan iade edilir)
            
            // SendTransactionAsync kullanarak işlemin onaylanmasını beklemeden TxHash'i hemen alıyoruz.
            // Bu sayede webhook timeout hatalarının önüne geçilir, işlem arka planda onaylanır.
            var transactionHash = await recordFunction.SendTransactionAsync(
                _web3.TransactionManager.Account.Address, // from
                gasLimit, // manuel limit
                null, // value
                cargoId, 
                status, 
                photoHash
            );
            
            _logger.LogInformation("🔗 Blokzincir işlemi ağa gönderildi! Tx Hash: {TxHash}", transactionHash);
            return transactionHash;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Blokzincire aktarılırken hata oluştu. Kontrat Adresi ayarlarını ve ağ bağlantınızı (RPC/Alchemy) kontrol edin.");
            throw;
        }
    }
}
