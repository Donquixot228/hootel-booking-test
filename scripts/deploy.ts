import { ethers } from "hardhat";
import { upgrades } from "hardhat";

async function main() {
  const Hotel = await ethers.getContractFactory("Hotel");
  const hotel = await upgrades.deployProxy(Hotel, [20], { initializer: 'initialize' });
  await hotel.waitForDeployment();
  console.log("Contract deployed to:", await hotel.getAddress());
  
  
/// [Upgrade to the new version of the contract]

  //  const Hotel = await ethers.getContractFactory('Hotel');
  //  console.log('Upgrading contract...');
  //  const upgraded = await upgrades.upgradeProxy('0xFEEF979854E2F6d4357253676fA24d69CceeaFA2', Hotel);
  //  console.log('Hotel upgraded to link at:', await upgraded.getAddress());

  // *** You can also call functions of the contract after the upgrade
  //  await upgraded.updateRoomCost(10);
  //  console.log('Link parameter set to new value');
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
