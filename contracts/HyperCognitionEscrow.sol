// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title HyperCognitionEscrow
 * @dev Escrow contract for secure USDC transactions with platform fee
 */
contract HyperCognitionEscrow is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public treasury;
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5% = 250 basis points
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    uint256 private escrowCounter;

    enum EscrowStatus { Active, Released, Refunded, Disputed }

    struct Escrow {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        uint256 platformFee;
        EscrowStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }

    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 platformFee
    );

    event EscrowReleased(
        uint256 indexed escrowId,
        address indexed seller,
        uint256 amount,
        uint256 platformFee
    );

    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed buyer,
        uint256 amount
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(address _usdc, address _treasury) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_treasury != address(0), "Invalid treasury address");
        usdc = IERC20(_usdc);
        treasury = _treasury;
    }

    /**
     * @dev Create a new escrow transaction
     * @param seller Address of the seller
     * @param amount Amount of USDC to escrow (including platform fee)
     */
    function createEscrow(address seller, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256) 
    {
        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Buyer and seller cannot be the same");
        require(amount > 0, "Amount must be greater than 0");

        // Calculate platform fee
        uint256 platformFee = (amount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 totalAmount = amount + platformFee;

        // Transfer USDC from buyer to contract
        usdc.safeTransferFrom(msg.sender, address(this), totalAmount);

        // Create escrow
        escrowCounter++;
        uint256 escrowId = escrowCounter;

        escrows[escrowId] = Escrow({
            id: escrowId,
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            platformFee: platformFee,
            status: EscrowStatus.Active,
            createdAt: block.timestamp,
            completedAt: 0
        });

        emit EscrowCreated(escrowId, msg.sender, seller, amount, platformFee);

        return escrowId;
    }

    /**
     * @dev Release escrow to seller (can be called by buyer or seller)
     * @param escrowId ID of the escrow to release
     */
    function releaseEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Only buyer or seller can release"
        );

        escrow.status = EscrowStatus.Released;
        escrow.completedAt = block.timestamp;

        // Transfer amount to seller
        usdc.safeTransfer(escrow.seller, escrow.amount);

        // Transfer platform fee to treasury
        usdc.safeTransfer(treasury, escrow.platformFee);

        emit EscrowReleased(escrowId, escrow.seller, escrow.amount, escrow.platformFee);
    }

    /**
     * @dev Refund escrow to buyer (can be called by buyer or seller)
     * @param escrowId ID of the escrow to refund
     */
    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Only buyer or seller can refund"
        );

        escrow.status = EscrowStatus.Refunded;
        escrow.completedAt = block.timestamp;

        // Refund full amount (including platform fee) to buyer
        uint256 totalRefund = escrow.amount + escrow.platformFee;
        usdc.safeTransfer(escrow.buyer, totalRefund);

        emit EscrowRefunded(escrowId, escrow.buyer, totalRefund);
    }

    /**
     * @dev Update treasury address (only owner)
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get escrow details
     * @param escrowId ID of the escrow
     */
    function getEscrow(uint256 escrowId) 
        external 
        view 
        returns (
            address buyer,
            address seller,
            uint256 amount,
            uint256 platformFee,
            EscrowStatus status,
            uint256 createdAt,
            uint256 completedAt
        ) 
    {
        Escrow memory escrow = escrows[escrowId];
        return (
            escrow.buyer,
            escrow.seller,
            escrow.amount,
            escrow.platformFee,
            escrow.status,
            escrow.createdAt,
            escrow.completedAt
        );
    }

    /**
     * @dev Get total number of escrows created
     */
    function getEscrowCount() external view returns (uint256) {
        return escrowCounter;
    }
}
