// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Zorighub {
    string public version = "v1.0.1";
    uint256 public productCount;
    uint256 public constant ESCROW_TIMEOUT = 30 days; // Configurable timeout, after which funds will be sent back
    address public owner;
    uint256 public impactFundPercent = 500; // 5% (basis points) for Impact Fund

    enum OrderStatus {
        Pending,
        Confirmed,
        Refunded
    }

    struct ProductReceipt {
        uint256 productId;
        address artisan;
        address buyer;
        string metadataURI;
        uint256 price;
        uint256 timestamp;
        uint256 escrowDeadline;
        OrderStatus status;
    }

    struct PendingPayment {
        address buyer;
        string metadataURI;
        uint256 amount;
        uint256 impactFund;
        OrderStatus status;
    }

    // Micro-loan structures
    struct LoanRequest {
        address artisan;
        uint256 amount;
        uint256 duration; // in days
        uint256 timestamp;
        bool isApproved;
        bool isRepaid;
        uint256 repaymentAmount;
        uint256 repaymentDeadline;
    }

    mapping(uint256 => ProductReceipt) public receipts;
    mapping(uint256 => PendingPayment) public pendingPayments;
    mapping(uint256 => LoanRequest) public loanRequests;
    mapping(address => uint256[]) public userLoans;

    uint256 public nextLoanId = 1;
    uint256 public impactFundBalance;

    // Reentrancy guard
    bool private locked;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier noReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    event ProductPurchased(
        uint256 indexed productId,
        address indexed artisan,
        address indexed buyer,
        string metadataURI,
        uint256 price,
        uint256 timestamp,
        uint256 escrowDeadline
    );

    event PaymentConfirmed(
        uint256 indexed productId,
        address indexed artisan,
        address indexed buyer,
        uint256 amount,
        uint256 impactFund
    );

    event ImpactFundContribution(uint256 indexed productId, uint256 amount);

    event PaymentRefunded(
        uint256 indexed productId,
        address indexed buyer,
        uint256 amount,
        string reason
    );

    event LoanRequested(
        uint256 indexed loanId,
        address indexed artisan,
        uint256 amount,
        uint256 duration
    );

    event LoanApproved(
        uint256 indexed loanId,
        address indexed artisan,
        uint256 amount,
        uint256 repaymentAmount,
        uint256 repaymentDeadline
    );

    event LoanRepaid(
        uint256 indexed loanId,
        address indexed artisan,
        uint256 amount
    );

    constructor() {
        owner = msg.sender;
        productCount = 0;
    }

    // ===== MARKETPLACE FUNCTIONS =====

    function purchaseProduct(
        address artisan,
        string calldata metadataURI,
        uint256 price
    ) external payable noReentrant {
        require(price > 0, "Price must be > 0");
        require(artisan != address(0), "Invalid artisan address");
        require(msg.value >= price, "Insufficient funds");

        uint256 productId = productCount;
        uint256 deadline = block.timestamp + ESCROW_TIMEOUT;
        uint256 impactFund = (price * impactFundPercent) / 10000;
        uint256 artisanAmount = price - impactFund;

        // Save receipt
        receipts[productId] = ProductReceipt({
            productId: productId,
            artisan: artisan,
            buyer: msg.sender,
            metadataURI: metadataURI,
            price: price,
            timestamp: block.timestamp,
            escrowDeadline: deadline,
            status: OrderStatus.Pending
        });

        productCount++;

        // Save escrowed payment
        pendingPayments[productId] = PendingPayment({
            buyer: msg.sender,
            amount: artisanAmount,
            impactFund: impactFund,
            metadataURI: metadataURI,
            status: OrderStatus.Pending
        });

        emit ProductPurchased(
            productId,
            artisan,
            msg.sender,
            metadataURI,
            price,
            block.timestamp,
            deadline
        );

        // Refund any excess
        uint256 refund = msg.value - price;
        if (refund > 0) {
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
    }

    function confirmPayment(uint256 productId) external noReentrant {
        PendingPayment storage payment = pendingPayments[productId];
        ProductReceipt storage receipt = receipts[productId];

        require(payment.amount > 0, "No escrowed funds");
        require(payment.status == OrderStatus.Pending, "Order not pending");
        require(msg.sender == payment.buyer, "Not your purchase");
        require(block.timestamp <= receipt.escrowDeadline, "Escrow expired");

        payment.status = OrderStatus.Confirmed;
        receipt.status = OrderStatus.Confirmed;

        // Transfer to artisan (95% of original price)
        (bool success1, ) = payable(receipt.artisan).call{
            value: payment.amount
        }("");
        require(success1, "Payment to artisan failed");

        // Add to Impact Fund (5% of original price)
        impactFundBalance += payment.impactFund;

        emit PaymentConfirmed(
            productId,
            receipt.artisan,
            msg.sender,
            payment.amount,
            payment.impactFund
        );

        emit ImpactFundContribution(productId, payment.impactFund);
    }

    function requestRefund(
        uint256 productId,
        string calldata reason
    ) external noReentrant {
        PendingPayment storage payment = pendingPayments[productId];
        ProductReceipt storage receipt = receipts[productId];

        require(payment.amount > 0, "No escrowed funds");
        require(payment.status == OrderStatus.Pending, "Order not pending");
        require(msg.sender == payment.buyer, "Not your purchase");

        payment.status = OrderStatus.Refunded;
        receipt.status = OrderStatus.Refunded;

        // Refund full original price to buyer
        uint256 totalRefund = payment.amount + payment.impactFund;

        (bool success, ) = payable(msg.sender).call{value: totalRefund}("");
        require(success, "Refund failed");

        emit PaymentRefunded(productId, msg.sender, totalRefund, reason);
    }

    function claimExpiredEscrow(uint256 productId) external noReentrant {
        PendingPayment storage payment = pendingPayments[productId];
        ProductReceipt storage receipt = receipts[productId];

        require(payment.amount > 0, "No escrowed funds");
        require(payment.status == OrderStatus.Pending, "Order not pending");
        require(msg.sender == payment.buyer, "Not your purchase");
        require(block.timestamp > receipt.escrowDeadline, "Escrow not expired");

        payment.status = OrderStatus.Refunded;
        receipt.status = OrderStatus.Refunded;

        // Refund full original price to buyer
        uint256 totalRefund = payment.amount + payment.impactFund;

        (bool success, ) = payable(msg.sender).call{value: totalRefund}("");
        require(success, "Refund failed");

        emit PaymentRefunded(
            productId,
            msg.sender,
            totalRefund,
            "Escrow expired"
        );
    }

    // ===== MICRO-LOAN FUNCTIONS =====

    function requestLoan(uint256 amount, uint256 duration) external {
        require(amount > 0, "Amount must be > 0");
        require(duration >= 7 && duration <= 365, "Invalid duration");

        uint256 loanId = nextLoanId++;

        loanRequests[loanId] = LoanRequest({
            artisan: msg.sender,
            amount: amount,
            duration: duration,
            timestamp: block.timestamp,
            isApproved: false,
            isRepaid: false,
            repaymentAmount: 0,
            repaymentDeadline: 0
        });

        userLoans[msg.sender].push(loanId);

        emit LoanRequested(loanId, msg.sender, amount, duration);
    }

    function approveLoan(uint256 loanId) external onlyOwner noReentrant {
        LoanRequest storage loan = loanRequests[loanId];

        require(!loan.isApproved, "Already approved");
        require(loan.amount > 0, "Invalid loan");
        require(
            impactFundBalance >= loan.amount,
            "Insufficient Impact Fund balance"
        );

        loan.isApproved = true;
        loan.repaymentAmount = loan.amount;
        loan.repaymentDeadline = block.timestamp + (loan.duration * 1 days);

        // Deduct from Impact Fund
        impactFundBalance -= loan.amount;

        (bool success, ) = payable(loan.artisan).call{value: loan.amount}("");
        require(success, "Loan transfer failed");

        emit LoanApproved(
            loanId,
            loan.artisan,
            loan.amount,
            loan.repaymentAmount,
            loan.repaymentDeadline
        );
    }

    function repayLoan(uint256 loanId) external payable noReentrant {
        LoanRequest storage loan = loanRequests[loanId];

        require(loan.isApproved, "Loan not approved");
        require(!loan.isRepaid, "Already repaid");
        require(msg.sender == loan.artisan, "Not your loan");
        require(msg.value >= loan.repaymentAmount, "Insufficient repayment");

        loan.isRepaid = true;

        // Add repayment back to Impact Fund for future loans
        impactFundBalance += loan.repaymentAmount;

        // Refund excess payment
        if (msg.value > loan.repaymentAmount) {
            uint256 excess = msg.value - loan.repaymentAmount;
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            require(success, "Excess refund failed");
        }

        emit LoanRepaid(loanId, msg.sender, loan.repaymentAmount);
    }

    // ===== ADMIN FUNCTIONS =====

    function setImpactFundPercent(uint256 newFundPercent) external onlyOwner {
        require(newFundPercent <= 1000, "Impact fund percentage too high"); // Max 10%
        impactFundPercent = newFundPercent;
    }

    function addToImpactFund() external payable onlyOwner {
        // Owner can add additional funds to the Impact Fund
        impactFundBalance += msg.value;
    }

    // function emergencyWithdraw() external onlyOwner {
    //     uint256 balance = address(this).balance;
    //     require(balance > 0, "No funds to withdraw");

    //     (bool success, ) = payable(owner).call{value: balance}("");
    //     require(success, "Withdrawal failed");
    // }

    // ===== VIEW FUNCTIONS =====

    function getReceipt(
        uint256 productId
    ) external view returns (ProductReceipt memory) {
        return receipts[productId];
    }

    function getLoan(
        uint256 loanId
    ) external view returns (LoanRequest memory) {
        return loanRequests[loanId];
    }

    function getUserLoans(
        address user
    ) external view returns (uint256[] memory) {
        return userLoans[user];
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getImpactFundBalance() external view returns (uint256) {
        return impactFundBalance;
    }
}
