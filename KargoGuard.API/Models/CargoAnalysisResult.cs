namespace KargoGuard.API.Models;

public class CargoAnalysisResult
{
    public int Id { get; set; }
    public string? Status { get; set; }
    public string? ImageName { get; set; }
    public double SarsintiVerisi { get; set; }
    public string? AiPredictionClass { get; set; }
    public double AiConfidence { get; set; }
    public string? FinalDecision { get; set; }
    public DateTime ProcessedAt { get; set; }
    public bool IsFragile { get; set; }

    // Teslimat (kurye ikinci fotoğraf) alanları
    public string? DeliveryPhotoUrl { get; set; }
    public string? DeliveryFinalDecision { get; set; }
    public DateTime? DeliveryProcessedAt { get; set; }
    public string? TxHash { get; set; }
    public string? LiabilityNote { get; set; }
    public double? DeliveryAiConfidence { get; set; }
    public string? DeliveryAiClass { get; set; }

    // Hibrit YOLO + Gemini — 1. Aşama (Dış Kutu) alanları
    public string? GeminiHasarTuru { get; set; }   // ezik | yirtik | islak | delik | acilmis | yanmis | belirsiz
    public string? GeminiSiddet { get; set; }       // minor | major
    public string? GeminiAciklama { get; set; }     // Türkçe kısa açıklama
    public double? GeminiGuvenSkoru { get; set; }   // 0.0 – 1.0
    public string? BboxJson { get; set; }            // YOLO bbox: {"x":..,"y":..,"width":..,"height":..}
    public bool SecurityBreach { get; set; }         // true → kutu açılmış!
}

