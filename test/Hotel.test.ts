import "@nomicfoundation/hardhat-chai-matchers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Hotel, Hotel__factory } from "../typechain-types";

describe("Hotel", function () {
  let hotel: Hotel;
  let owner: any;
  let user1: any;
  let user2: any;

  const initialRoomCost = ethers.parseEther("20");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const HotelFactory: Hotel__factory = await ethers.getContractFactory("Hotel", owner) as unknown as Hotel__factory;
    hotel = await HotelFactory.deploy();
    await hotel.initialize(initialRoomCost);
  });

  it("should set the owner correctly", async function () {
    const contractOwner = await hotel.owner();
    expect(contractOwner).to.equal(await owner.getAddress());
  });

  it("should initialize with correct room cost", async function () {
    const cost = await hotel.roomCost();
    expect(cost).to.equal(initialRoomCost);
  });

  it("should allow user to book a room", async function () {
    await hotel.connect(user1).sendBookRequest({ value: initialRoomCost });

    const booking = await hotel.bookings(await user1.getAddress());
    expect(booking.user).to.equal(await user1.getAddress());
    expect(booking.reservedFunds).to.equal(initialRoomCost);
  });

  it("should decrease available rooms after booking", async function () {
    const tx = await hotel.connect(user1).sendBookRequest({ value: initialRoomCost });
    await tx.wait();
    const available = await hotel.getAvailableRooms();
    expect(available).to.equal(19);
  });

  it("should not allow booking with insufficient funds", async function () {
    await expect(
      hotel.connect(user1).sendBookRequest({ value: ethers.parseEther("1") })
    ).to.be.revertedWith("Insufficient amount");
  });

  it("should not allow double booking", async function () {
    await hotel.connect(user1).sendBookRequest({ value: initialRoomCost });

    await expect(
      hotel.connect(user1).sendBookRequest({ value: initialRoomCost })
    ).to.be.revertedWith("You've already booked a room");
  });

  it("should allow user to check out", async function () {
    await hotel.connect(user1).sendBookRequest({ value: initialRoomCost });

    await hotel.connect(user1).checkOut();

    const booking = await hotel.bookings(await user1.getAddress());
    expect(booking.user).to.equal(ethers.ZeroAddress);
    expect(booking.reservedFunds).to.equal(0);
  });

  it("should not allow checkout if user has no booking", async function () {
    await expect(hotel.connect(user1).checkOut()).to.be.revertedWith("You've already booked a room");
  });

  it("should allow owner to update room cost", async function () {
    const newCost = ethers.parseEther("2");
    await hotel.connect(owner).updateRoomCost(newCost);
    expect(await hotel.roomCost()).to.equal(newCost);
  });

  it("should not allow non-owner to update room cost", async function () {
    const newCost = ethers.parseEther("2");
    await expect(
      hotel.connect(user1).updateRoomCost(newCost)
    ) .to.be.reverted;
  });

  it("should allow owner to withdraw funds", async function () {
    const contractBalance = await ethers.provider.getBalance(hotel.getAddress());
    expect(contractBalance).to.equal(0);
  });
});

