const hre = require("hardhat");

async function main() {
  console.log("KargoGuard Akilli Sozlesmesi Ethereum Test Agina (Sepolia) dagitiliyor...");

  // Sözleşmeyi derle ve hazırla
  const CargoGuard = await hre.ethers.getContractFactory("CargoGuard");
  
  // Sözleşmeyi ağa gönder
  const cargoGuard = await CargoGuard.deploy();

  // Onaylanmasını bekle
  await cargoGuard.waitForDeployment();

  const contractAddress = await cargoGuard.getAddress();
  
  console.log(`\n🎉 Harika! CargoGuard Sozlesmesi basariyla blokzincire yuklendi!`);
  console.log(`🔗 Kontrat Adresi: ${contractAddress}`);
  console.log(`Lutfen bu adresi C# uygulamanizdaki entegrasyon formuna kaydetmeyi unutmayin.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
