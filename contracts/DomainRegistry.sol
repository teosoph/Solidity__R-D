// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Domain Registry
 * @dev A smart contract for managing the registration of top-level domains on the Ethereum blockchain. This contract enables users to permanently register domains associated with their Ethereum addresses, with an emphasis on simplicity and security in domain management.
 *
 * Key Features and Functions:
 *
 * 1. Domain Registration:
 *    - Enables users to register top-level domains (TLDs), for example, "example", without extensions like ".com".
 *    - Registration requires a fixed ETH fee, which is set by the contract owner and directly transferred to the owner upon registration.
 *    - The `registerDomain(string memory domainName)` function allows users to register a new domain, provided it's not already taken and meets the validation criteria.
 *
 * 2. Domain Ownership:
 *    - Offers functions to verify the ownership of a domain and enumerate all domains registered by a specific address.
 *    - `getDomainOwner(string memory domainName)` returns the ownership information of a specific domain.
 *    - Pagination implemented in domain retrieval enhances performance and manages memory efficiently when dealing with large sets of data.
 *
 * 3. Registration Fee Management:
 *    - Allows the contract owner to update the registration fee, facilitating dynamic adjustments to the domain registration cost.
 *    - `updateRegistrationFee(uint256 newFee)` lets the contract owner modify the fee required for new domain registrations. The fee is specified in Wei.
 *
 * 4. Domain Validation:
 *    - Ensures that only valid top-level domains are registered by enforcing specific criteria, adhering to RFC 1035 for domain name syntax.
 *    - Validation checks include ensuring the domain's length is within the `MIN_DOMAIN_LENGTH` and `MAX_DOMAIN_LENGTH` bounds,
 *      and that it consists only of lowercase letters (a-z), numbers (0-9), or hyphens (-), without starting or ending with a '-'.
 *    - `isValidTopLevelDomain(string memory domainName)` performs internal validation of a domain name to ensure it adheres to these rules.
 *
 * 5. Events for Activity Tracking:
 *    - `DomainRegistered`: Triggered when a new domain is successfully registered, capturing the domain name, owner's address, and registration timestamp.
 *    - `FeeUpdated`: Fired when the registration fee is modified by the contract owner, detailing the new fee amount.
 *
 * 6. Monitoring and Statistics:
 *    - Maintains a count of the total number of domains registered within the contract through `totalDomainsRegistered`, enabling tracking of contract activity and domain proliferation.
 *
 * Security Considerations:
 *   - Implements fundamental safeguards to mitigate common risks, such as duplicate registrations and non-payment of registration fees.
 *   - Utilizes the `onlyOwner` modifier to restrict sensitive management functions to the contract owner, bolstering the contract's security posture.
 *
 * Note:
 *   - This version of the contract does not support domain transfer or release, underscoring the permanent nature of domain registrations.
 *   - Consideration for future enhancements and additional functionalities may be influenced by user feedback and evolving requirements.
 */

contract DomainRegistry {
    // ____________________ Constants ____________________
    uint256 public constant MAX_REGISTRATION_FEE = 1 ether; // Maximum value example
    uint8 constant MIN_DOMAIN_LENGTH = 1; // Minimum length of a domain name.
    uint8 constant MAX_DOMAIN_LENGTH = 63; // Maximum length of a domain name.

    // ____________________ Custom Errors ____________________
    error OnlyOwnerAllowed(string message);
    error IncorrectRegistrationFee(string message);
    error InvalidDomainFormat(string message);
    error DomainAlreadyRegistered(string message);
    error TransferFailed(string message);
    error FeeCannotBeNegativeOrZero(string message);
    error FeeExceedsMaximumAllowed(string message);
    error StartIndexMustBeLessThanEndIndex(string message);
    error EndIndexExceedsTotalDomains(string message);
    error NewOwnerIsZeroAddress(string message);

    // ____________________ State variables ____________________
    /// @notice Owner of the contract
    address public contractOwner;

    /// @notice Registration fee required to register a domain
    uint256 public registrationFee = 0.01 ether;

    /// @notice Total number of domains registered in the contract
    uint256 public totalDomainsRegistered;

    /// @dev Array to store the names of all registered domains
    string[] private registeredDomainNames;

    // ____________________ Data mappings ____________________
    /**
     * @dev Maps domain names to the addresses of their respective owners.
     */
    mapping(string => address) private domains;

    // ____________________ Events ____________________
    /**
     * @dev Emitted when a domain is successfully registered.
     * @param domainName Name of the registered domain.
     * @param owner Address of the domain's owner.
     */
    event DomainRegistered(string domainName, address indexed owner);

    /**
     * @dev Emitted when ownership of the contract is transferred.
     * @param previousOwner Address of the previous owner.
     * @param newOwner Address of the new owner.
     * This event is triggered in the `transferOwnership` function, indicating a successful transfer of control from the `previousOwner` to the `newOwner`. This functionality enhances the contract's flexibility and security by allowing the current owner to delegate control of the contract to another address, ensuring continuity in contract management and operations. It's an essential feature for scenarios where transferring control is necessary for operational or security reasons.
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Emitted when the registration fee is updated.
     * @param newFee The new registration fee.
     */
    event FeeUpdated(uint256 newFee);

    // ____________________ Modifiers ____________________
    /**
     * @dev Ensures that a function is callable only by the contract owner.
     */
    modifier onlyOwner() {
        if (msg.sender != contractOwner) revert OnlyOwnerAllowed("Caller is not the owner");

        _;
    }

    // ____________________ Constructor ____________________
    /**
     * @dev Sets the deployer as the initial owner of the contract.
     */
    constructor() {
        contractOwner = msg.sender;
    }

    // ____________________ Functions ____________________

    // ____________________ Core Business Logic Functions ____________________
    /**
     * @notice Registers a new domain.
     * @dev Registers a domain if it is valid and not already registered. Charges a fee and transfers it to the owner.
     * The time of registration can be inferred from the block timestamp associated with the DomainRegistered event.
     * This function does not return a value but emits a DomainRegistered event upon successful domain registration.
     * @param domainName The domain name to register.
     */
    function registerDomain(string memory domainName) external payable {
        if (msg.value != registrationFee) revert IncorrectRegistrationFee("Incorrect registration fee");
        if (!isValidTopLevelDomain(domainName)) revert InvalidDomainFormat("Invalid domain format");
        if (domains[domainName] != address(0)) revert DomainAlreadyRegistered("Domain is already registered");

        // Update the contract state
        domains[domainName] = msg.sender;
        registeredDomainNames.push(domainName);
        totalDomainsRegistered++;

        // Transfer the registration fee to the owner immediately upon receiving it.
        (bool success, ) = contractOwner.call{value: msg.value}("");
        if (!success) revert TransferFailed("Transfer failed");

        // Generate an event after all changes and successful transfer of funds
        emit DomainRegistered(domainName, msg.sender);
    }

    // ____________________ Contract Management Functions ____________________
    /**
     * @dev Updates the domain registration fee to a new value. This function can only be invoked by the owner of the contract.
     * It allows the owner to adjust the fee required for new domain registrations. The fee must be a non-negative value and
     * should not exceed the maximum allowed limit defined by `MAX_REGISTRATION_FEE`, ensuring that the fee remains within
     * reasonable bounds. The updated fee is specified in Wei. Emits a `FeeUpdated` event upon successful update.
     * Requirements:
     * - The caller must be the contract owner.
     * - `newFee` must be greater than or equal to 0.
     * - `newFee` must not exceed `MAX_REGISTRATION_FEE`.
     * @param newFee The new registration fee in Wei. Must be non-negative and not exceed the maximum allowed fee.
     */
    function updateRegistrationFee(uint256 newFee) external onlyOwner {
        if (newFee <= 0) revert FeeCannotBeNegativeOrZero("Fee cannot be negative or zero");
        if (newFee > MAX_REGISTRATION_FEE) revert FeeExceedsMaximumAllowed("Fee exceeds the maximum allowed limit");

        registrationFee = newFee;
        emit FeeUpdated(newFee);
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner == address(0)) revert NewOwnerIsZeroAddress("New owner address cannot be the zero address");
        contractOwner = newOwner;
        emit OwnershipTransferred(contractOwner, newOwner);
    }

    // ____________________ View Functions ____________________
    /**
     * @notice Retrieves the owner of a specific domain.
     * @param domainName The name of the domain to query.
     * @return The address of the domain owner.
     */
    function getDomainOwner(string memory domainName) public view returns (address) {
        return domains[domainName];
    }

    /**
     * @notice Retrieves a subset of registered domain names between specified indices.
     * @dev This function implements pagination by allowing callers to specify a range of indices.
     * It helps manage large sets of domain names by fetching them in smaller, manageable batches.
     * @param startIndex The index to start fetching domain names from (inclusive).
     * @param endIndex The index to stop fetching domain names (exclusive).
     * @return domainNames A string array containing the domain names within the specified range.
     */
    function getDomainNamesByIndex(
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (string[] memory domainNames) {
        if (startIndex >= endIndex)
            revert StartIndexMustBeLessThanEndIndex("Start index must be less than the end index");
        if (endIndex > registeredDomainNames.length)
            revert EndIndexExceedsTotalDomains("End index exceeds the total number of domains");

        uint256 count = endIndex - startIndex; // Calculate the number of domain names to be returned.
        domainNames = new string[](count); // Initialize the array to hold the domain names.

        for (uint256 i = startIndex; i < endIndex; ++i) {
            domainNames[i - startIndex] = registeredDomainNames[i]; // Populate the array with domain names.
        }

        return domainNames; // Return the populated array of domain names.
    }

    // ____________________ Internal Helper Functions ____________________
    /**
     * @dev Validates a domain name to ensure it meets the criteria for a top-level domain.
     * @param domainName The domain name to validate.
     * @return True if the domain name is valid, false otherwise.
     */
    function isValidTopLevelDomain(string memory domainName) internal pure returns (bool) {
        bytes memory domainBytes = bytes(domainName);
        uint256 domainLength = domainBytes.length;

        // Check the domain name meets the minimum and maximum length requirements.
        if (domainLength < MIN_DOMAIN_LENGTH || domainLength > MAX_DOMAIN_LENGTH) {
            return false;
        }

        // Ensure the domain name does not start or end with a hyphen (-).
        if (domainBytes[0] == bytes1(uint8(45)) || domainBytes[domainLength - 1] == bytes1(uint8(45))) {
            return false;
        }

        bool previousWasDash = false; // Track consecutive dashes.
        for (uint i = 0; i < domainLength; ++i) {
            bytes1 b = domainBytes[i];

            // Check for consecutive dashes, which are not allowed.
            if (b == bytes1(uint8(45))) {
                if (previousWasDash) {
                    return false;
                }
                previousWasDash = true;
            } else {
                // Reset dash tracker for non-dash characters and
                // ensure characters are either numbers (0-9) or lowercase letters (a-z).
                previousWasDash = false;
                if (
                    (b >= bytes1(uint8(48)) && b <= bytes1(uint8(57))) || // Numbers 0-9
                    (b >= bytes1(uint8(97)) && b <= bytes1(uint8(122))) // Lowercase a-z
                ) {
                    continue;
                } else {
                    // If any character does not match allowed set, return false.
                    return false;
                }
            }
        }

        // If all checks pass, the domain name is considered valid.
        return true;
    }
}
