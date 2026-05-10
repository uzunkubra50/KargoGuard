const hre = require("hardhat");

async function main() {
  const contractAddress = "0xe6d6b90AD9AD00deAa2D3a8002181Fd55BE24893";
  const abi = ["function admin() public view returns (address)"];
  
  const provider = hre.ethers.provider;
  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new hre.ethers.Contract(contractAddress, abi, provider);
  
  const admin = await contract.admin();
  console.log("Contract Admin in Blockchain: " + admin);
  console.log("Local Wallet Address:       " + wallet.address);
}

main().catch(console.error);
