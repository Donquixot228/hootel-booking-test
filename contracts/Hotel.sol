// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Hotel is Initializable, OwnableUpgradeable {
    uint8 public constant ROOMS_MAX_COUNT = 20;


    struct Booking {
        address user;
        uint reservedFunds;
    }

    mapping(address => Booking) public bookings;

    function initialize(uint256 _roomCost) public initializer {
        __Ownable_init(msg.sender);
        roomCost = _roomCost;
        roomsAvailable = ROOMS_MAX_COUNT;
    }

    uint256 public roomCost;
    uint public roomsAvailable;

    /**
     * MODIFIERS 
     */
     modifier isRoomsAvailable() {
        require(roomsAvailable > 0, "All rooms are occupied");
        _;
    }
    modifier isUserAlreadyBooked() {
        require(bookings[msg.sender].user != msg.sender, "You've already booked a room");
        _;
    }

    modifier isAmountEnough() {
        require(msg.value >= roomCost, "Insufficient amount");
        _;
    }

    modifier isUserNotBooked() {
        require(bookings[msg.sender].user == msg.sender, "You've already booked a room");
        _;
    }


    /**
     *  EVENTS
     */
    event BookingSendRequest(address indexed user, uint256 amount);
    event CheckedOut(address indexed user);
    event CheckIfUserBooked(bool booked);
    event Withdraw(uint256 amount);
 


    /**
     * @dev - Function to send booking request
     * @notice - This function is used to book a room
     */
    function sendBookRequest() public payable isRoomsAvailable  isUserAlreadyBooked  isAmountEnough {
        roomsAvailable--;
        bookings[msg.sender] = Booking({user: msg.sender, reservedFunds: msg.value});
        payable(bookings[msg.sender].user).transfer(msg.value);
        emit BookingSendRequest(msg.sender, msg.value);
    }

    /**
     * @dev - Update the room cost
     */
    function updateRoomCost(uint256 _roomCost) public onlyOwner {
        roomCost = _roomCost;
    }

    /**
     * @dev - Function to get available rooms count
     * @return - Returns the number of available rooms
     */
    function getAvailableRooms() public view returns (uint) {
        return roomsAvailable;
    }

    /**
     * @dev - Function to check if the user has booked a room
     * @return - Returns true if the user has booked a room, false otherwise
     */
    function checkIfUserBooked() public view returns (bool) {
        return bookings[msg.sender].user == msg.sender;
    }

    /**
     * @dev - Function to check out from the hotel
     * @notice - This function is used to check out from the hotel
     */
    function checkOut() public isUserNotBooked{
        roomsAvailable++;
        delete bookings[msg.sender];
        emit CheckedOut(msg.sender);
    }

    /**
     * @dev Withdraws the Ether balance from the contract and transfers it to the address of the contract owner.
     * @notice Only the contract owner can call this function.
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
        emit Withdraw(address(this).balance);
    }
}
