// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CargoGuard {
    // Sözleşmeyi oluşturan sistemin/şirketin adresi
    address public admin;

    // Her bir teslimat kanıtı için kullanılacak yapı
    struct Record {
        uint256 cargoId;
        string aiStatus;       // Örn: "SAĞLAM", "TESLİMATTA HASAR GÖRDÜ"
        uint256 timestamp;     // Blok onaylanma zamanı
        string photoHash;      // Kargonun MinIO/S3'teki resminin SHA-256 Hash'i
    }

    // Kargo ID'sine göre blokzincirdeki geçmiş kayıtların eşleşmesi
    mapping(uint256 => Record[]) public cargoHistory;

    // Ön Yüz (Frontend/React) veya arka sistemlerin dinleyebilmesi için Event
    event DeliveryRecorded(
        uint256 indexed cargoId, 
        string aiStatus, 
        uint256 timestamp, 
        string photoHash
    );

    // Sadece yetkili cüzdanın kayıt yapabilmesini sağlayan güvenlik modifiyeri
    modifier onlyAdmin() {
        require(msg.sender == admin, "Guvenlik: Sadece KargoGuard yetkilisi kayit yapabilir.");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Blokzincire teslimat anının kanıtını kazıyan fonksiyon
    function recordCargoDelivery(
        uint256 _cargoId, 
        string memory _aiStatus, 
        string memory _photoHash
    ) public onlyAdmin {
        
        Record memory newRecord = Record({
            cargoId: _cargoId,
            aiStatus: _aiStatus,
            timestamp: block.timestamp,
            photoHash: _photoHash
        });

        cargoHistory[_cargoId].push(newRecord);

        // Veri başarıyla bloka eklendiğinde olayı fırlat
        emit DeliveryRecorded(_cargoId, _aiStatus, block.timestamp, _photoHash);
    }

    // Belirli bir kargonun tüm şeffaf geçmişini okumak için
    function getCargoHistory(uint256 _cargoId) public view returns (Record[] memory) {
        return cargoHistory[_cargoId];
    }
}
