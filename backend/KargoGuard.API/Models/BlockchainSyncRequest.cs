namespace KargoGuard.API.Models;

public class BlockchainSyncRequest
{
    public int CargoId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PhotoHash { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
}
