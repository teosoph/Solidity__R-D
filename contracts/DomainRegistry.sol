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
 *    - Each domain's registration details, including the owner's address and registration timestamp, are recorded.
 *    - The `registerDomain(string memory domainName)` function allows users to register a new domain, provided it's not already taken and meets the validation criteria.
 *
 * 2. Domain Ownership:
 *    - Offers functions to verify the ownership of a domain and enumerate all domains registered by a specific address.
 *    - `getDomainOwner(string memory domainName)` returns the ownership information of a specific domain.
 *    - `getDomainsByOwner(address ownerAddress)` shows the total number of domains registered by the address and lists all domains registered by a particular address.
 *    - `getDomainDetails(string memory domainName)` retrieves detailed information about a specific domain, including its owner and registration date, to confirm domain registration status.
 *    - `getAllRegisteredDomains` retrieves information about registered domains.
 *
 * 3. Registration Fee Management:
 *    - Allows the contract owner to update the registration fee, facilitating dynamic adjustments to the domain registration cost.
 *    - `updateRegistrationFee(uint256 newFee)` lets the contract owner modify the fee required for new domain registrations. The fee is specified in Wei.
 *
 * 4. Domain Validation:
 *    - Ensures that only valid top-level domains are registered by enforcing specific criteria.
 *    - Validation checks include ensuring the domain's length is within the `MIN_DOMAIN_LENGTH` and `MAX_DOMAIN_LENGTH` bounds, and that it consists only of lowercase letters (a-z), numbers (0-9), or hyphens (-), without starting or ending with a '-'.
 *    - `isValidTopLevelDomain(string memory domainName)` performs internal validation of a domain name to ensure it adheres to these rules.
 *
 * 5. Events for Activity Tracking:
 *    - `DomainRegistered`: Triggered when a new domain is successfully registered, capturing the domain name, owner's address, and registration timestamp.
 *    - `FeeUpdated`: Fired when the registration fee is modified by the contract owner, detailing the new fee amount.
 *
 * 6. Monitoring and Statistics:
 *    - Maintains a count of the total number of domains registered within the contract through `totalDomainsRegistered`, enabling tracking of contract activity.
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

    // ____________________ Structs ____________________
    /**
     * @dev Represents a domain with its owner and the registration date.
     */
    struct Domain {
        address owner; // Owner of the domain.
        uint256 registrationDate; // Timestamp of the domain registration.
    }

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
     * @dev Stores domain details, accessible by domain name.
     */
    mapping(string => Domain) private domains;

    /**
     * @dev Stores list of domains owned by an address.
     */
    mapping(address => string[]) private domainsByOwner;

    // ____________________ Events ____________________
    /**
     * @dev Emitted when a domain is successfully registered.
     * @param domainName Name of the registered domain.
     * @param owner Address of the domain's owner.
     * @param timestamp Registration timestamp.
     */
    event DomainRegistered(string domainName, address indexed owner, uint256 timestamp);

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
     * @dev Ensures the caller is the owner of the contract.
     */
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Caller is not the owner");
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
     * @param domainName The domain name to register.
     */
    function registerDomain(string memory domainName) external payable {
        require(msg.value == registrationFee, "Incorrect registration fee");
        require(isValidTopLevelDomain(domainName), "Invalid domain format");
        require(domains[domainName].owner == address(0), "Domain is already registered");

        // Update the contract state
        domains[domainName] = Domain(msg.sender, block.timestamp);
        domainsByOwner[msg.sender].push(domainName);
        totalDomainsRegistered++;
        registeredDomainNames.push(domainName);

        // Transfer the registration fee to the owner immediately upon receiving it.
        (bool success, ) = contractOwner.call{value: msg.value}("");
        require(success, "Transfer failed");

        // Generate an event after all changes and successful transfer of funds
        emit DomainRegistered(domainName, msg.sender, block.timestamp);
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
        require(newFee > 0, "Fee cannot be negative or zero");
        require(newFee <= MAX_REGISTRATION_FEE, "Fee exceeds maximum allowed value");

        registrationFee = newFee;
        emit FeeUpdated(newFee);
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
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
        return domains[domainName].owner;
    }

    /**
     * @notice Retrieves a list of domains registered by a specific address and the total number of domains.
     * @param ownerAddress The address to query.
     * @return A tuple containing the total number of domains registered by the address and a list of domain names owned by the address.
     */
    function getDomainsByOwner(address ownerAddress) public view returns (uint256, string[] memory) {
        return (domainsByOwner[ownerAddress].length, domainsByOwner[ownerAddress]);
    }

    /**
     * @notice Retrieves detailed information about a specific domain.
     * @dev Returns the details of a domain, including its owner and registration date. This function is useful for external callers to get detailed information about a domain's registration. If the domain is not registered, the function returns a domain with a zero address as the owner and a zero value for the registration date. It's important to check the owner address to confirm domain registration.
     * @param domainName The name of the domain for which details are being requested. This should be a valid domain name that adheres to the contract's domain name validation rules.
     * @return A `Domain` struct containing the owner address and the timestamp of the domain's registration. If the domain is not registered, the owner will be the zero address, and the registration date will be zero.
     */
    function getDomainDetails(string memory domainName) public view returns (Domain memory) {
        return domains[domainName];
    }

    /**
     * @notice  Returns the names of all registered domains.
     * @dev This function allows anyone to retrieve a list of all domain names that have been registered in the contract. It provides a way to
     * enumerate all registered domains, which can be useful for various client applications or external contracts to understand the
     * state of domain registrations.
     * @return A string array containing all the domain names registered in the contract.
     */
    function getAllRegisteredDomains() public view returns (string[] memory) {
        return registeredDomainNames;
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

        if (domainLength < MIN_DOMAIN_LENGTH || domainLength > MAX_DOMAIN_LENGTH) {
            return false;
        }
        if (domainBytes[0] == bytes1(uint8(45)) || domainBytes[domainLength - 1] == bytes1(uint8(45))) {
            return false;
        }

        bool previousWasDash = false;
        for (uint i = 0; i < domainLength; i++) {
            bytes1 b = domainBytes[i];

            if (b == bytes1(uint8(45))) {
                if (previousWasDash) {
                    return false;
                }
                previousWasDash = true;
            } else if (
                (b >= bytes1(uint8(48)) && b <= bytes1(uint8(57))) ||
                (b >= bytes1(uint8(97)) && b <= bytes1(uint8(122)))
            ) {
                continue;
            } else {
                return false;
            }
        }

        return true;
    }
}
