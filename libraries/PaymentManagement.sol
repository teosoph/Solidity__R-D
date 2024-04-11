// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title PaymentManagement
 * @notice This library provides functionality for managing payments in the DomainRegistry contract.
 * @dev It offers methods for determining domain registration fees and distributing the fees.
 */
library PaymentManagement {
    uint256 private constant DOMAIN_OWNER_PERCENTAGE = 20; // 20% of the registration fee goes to domain owner

    function distributePayments(address payable feeRecipient, address[] memory domainOwners, uint256 amount) internal {
        if (domainOwners.length > 0 && domainOwners[0] != address(0) && msg.sender != domainOwners[0]) {
            uint256 domainOwnerAmount = (amount * DOMAIN_OWNER_PERCENTAGE) / 100;
            uint256 feeRecipientAmount = amount - domainOwnerAmount;

            Address.sendValue(feeRecipient, feeRecipientAmount);
            Address.sendValue(payable(domainOwners[0]), domainOwnerAmount);
        } else {
            Address.sendValue(feeRecipient, amount);
        }
    }

    function accumulateFees(
        mapping(address => uint256) storage pendingWithdrawals,
        address payable feeRecipient,
        address domainOwner,
        uint256 amount,
        bool isParentDomainOwner
    ) internal {
        uint256 feeRecipientAmount = isParentDomainOwner ? amount : (amount * 80) / 100;
        uint256 domainOwnerAmount = isParentDomainOwner ? 0 : (amount * 20) / 100;

        // Accumulate funds for the fee recipient
        pendingWithdrawals[feeRecipient] += feeRecipientAmount;

        // Accumulate funds for the domain owner, if it's not a first-level domain and the sender is not the owner
        if (!isParentDomainOwner && domainOwner != address(0)) {
            pendingWithdrawals[domainOwner] += domainOwnerAmount;
        }
    }

    function withdrawAllFundsAsRegularUser(
        mapping(address => uint256) storage pendingWithdrawals,
        address payable recipient
    ) internal {
        uint256 amount = pendingWithdrawals[recipient];
        require(amount > 0, "No funds available for withdrawal");

        pendingWithdrawals[recipient] = 0;

        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function withdrawAllFundsAsRecipient(
        mapping(address => uint256) storage pendingWithdrawals,
        address payable feeRecipient
    ) internal {
        uint256 amount = pendingWithdrawals[feeRecipient];
        require(amount > 0, "No funds available to withdraw");

        // Reset the pending withdrawals balance before sending to prevent re-entrancy attacks
        pendingWithdrawals[feeRecipient] = 0;

        (bool sent, ) = feeRecipient.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
}
