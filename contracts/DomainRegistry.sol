// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title Domain Registry
 * @dev A smart contract for managing domain registration on the Ethereum blockchain. This contract allows users to register domain names, supporting a flexible and upgradeable domain management system. With an emphasis on security and user-friendly operations, it introduces a structured approach to domain ownership, transfers, and registration fee management.
 *
 * Key Features and Functions:
 *
 * 1. Flexible Domain Registration:
 *    - Support for registering various levels of domain names, mirroring traditional DNS service structure.
 *    - Registration requires payment of a fee, adjustable by the contract owner to accommodate market conditions or strategic pricing adjustments.
 *
 * 2. Transparent Domain Ownership:
 *    - Provides clear ownership records for each registered domain, accessible through the `getDomainOwner` function.
 *    - Ensures easy management and verification of domain ownership, crucial for operational transparency and security.
 *
 * 3. Adjustable Registration Fees:
 *    - Allows the contract owner to dynamically adjust domain registration fees with `updateRegistrationFee`, ensuring flexibility in pricing strategy.
 *
 * 4. Robust Domain Validation:
 *    - Incorporates domain validation logic to ensure that all registered domains adhere to predefined naming standards, enhancing the integrity of the domain registry.
 *
 * 5. Enhanced Security Measures:
 *    - Leverages OpenZeppelin's upgradeable contracts framework to ensure ongoing contract security and adaptability.
 *    - Employs the `onlyOwner` modifier for critical functions, safeguarding against unauthorized access and potential vulnerabilities.
 *
 * 6. Event-Driven Notifications:
 *    - Utilizes events for notifying stakeholders of key activities such as domain registrations and fee updates, fostering an environment of transparency.
 *
 * Security Considerations:
 *   - Adopts industry-standard practices and patterns to mitigate common security risks, including reentrancy attacks and unauthorized access.
 *   - Regular audits and community feedback are encouraged to identify and address potential security issues promptly.
 *
 * Future Directions:
 *   - Plans for introducing features such as domain transfers, subdomain registration, and more sophisticated access control mechanisms.
 *   - Open to community suggestions and contributions to drive continuous improvement and innovation in domain management on the blockchain.
 *
 * Note:
 *   - This contract represents an initial iteration towards a decentralized domain registration system. Future versions may introduce additional features and optimizations based on user feedback and technological advancements.
 */

contract DomainRegistryV1 is Initializable, OwnableUpgradeable {
    /// @custom:storage-location erc7201:domainRegistry.storage
    struct DomainRegistryStorage {
        address contractOwner; /// @notice Owner of the contract
        uint256 registrationFee; /// @notice Registration fee required to register a domain
        uint256 totalDomainsRegisteredNumber; /// @notice Total number of domains registered in the contract
        string[] registeredDomainNames; /// @dev Array to store the names of all registered domains
        mapping(string => address) domains; ///     @dev Maps domain names to the addresses of their respective owners.
    }

    //Determine the storage slot where this struct will reside using a hash function, as per ERC-7201.
    // This involves computing a keccak256 hash of a unique identifier.
    // bytes32 private constant DomainRegistryStorageLocation =
    //     keccak256(abi.encode(uint256(keccak256("domainRegistry.storage")) - 1)) & ~bytes32(uint256(0xff));

    bytes32 private constant DomainRegistryStorageLocation =
        0x2fa08a24d651f334e38f76d054b804fee9ea2ce22fe228c9362cfd32ab661e00;

    //This function will utilize inline assembly to directly access the storage slot.
    function _domainRegistryStorage() private pure returns (DomainRegistryStorage storage ds) {
        assembly {
            ds.slot := DomainRegistryStorageLocation
        }
    }

    // ____________________ Constants ____________________
    uint256 public constant MAX_REGISTRATION_FEE = 1 ether; // Maximum value example
    uint8 constant MIN_DOMAIN_LENGTH = 1; // Minimum length of a domain name.
    uint8 constant MAX_DOMAIN_LENGTH = 63; // Maximum length of a domain name.

    // ____________________ Custom Errors ____________________
    error IncorrectRegistrationFee(string message);
    error InvalidDomainFormat(string message);
    error DomainAlreadyRegistered(string message);
    error TransferFailed(string message);
    error FeeCannotBeNegativeOrZero(string message);
    error FeeExceedsMaximumAllowed(string message);
    error StartIndexMustBeLessThanEndIndex(string message);
    error EndIndexExceedsTotalDomains(string message);
    error NewOwnerIsZeroAddress(string message);

    // ____________________ Events ____________________
    /**
     * @dev Emitted when a domain is successfully registered.
     * @param domainName Name of the registered domain.
     * @param owner Address of the domain's owner.
     */
    event DomainRegistered(string domainName, address indexed owner);

    /**
     * @dev Emitted when the registration fee is updated.
     * @param newFee The new registration fee.
     */
    event FeeUpdated(uint256 newFee);

    // ____________________ Initializer ____________________
    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     * This initializer sets up the Ownable contract with the deployer's address
     * and initializes the registration fee to 0.01 ether.
     */
    function initialize() public initializer {
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        ds.contractOwner = msg.sender;

        ds.registrationFee = 0.01 ether;

        __Ownable_init(msg.sender);
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
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        if (msg.value != ds.registrationFee) revert IncorrectRegistrationFee("Incorrect registration fee");
        if (!isValidTopLevelDomain(domainName)) revert InvalidDomainFormat("Invalid domain format");
        if (ds.domains[domainName] != address(0)) revert DomainAlreadyRegistered("Domain is already registered");

        // Update the contract state
        ds.domains[domainName] = msg.sender;
        ds.registeredDomainNames.push(domainName);
        ds.totalDomainsRegisteredNumber++;

        // Transfer the registration fee to the owner immediately upon receiving it.
        (bool success, ) = ds.contractOwner.call{value: msg.value}("");
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
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        if (newFee <= 0) revert FeeCannotBeNegativeOrZero("Fee cannot be negative or zero");
        if (newFee > MAX_REGISTRATION_FEE) revert FeeExceedsMaximumAllowed("Fee exceeds the maximum allowed limit");

        ds.registrationFee = newFee;
        emit FeeUpdated(newFee);
    }

    // ____________________ View Functions ____________________
    /**
     * @notice Retrieves the owner of a specific domain.
     * @param domainName The name of the domain to query.
     * @return The address of the domain owner.
     */
    function getDomainOwner(string memory domainName) public view returns (address) {
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        return ds.domains[domainName];
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
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        if (startIndex >= endIndex)
            revert StartIndexMustBeLessThanEndIndex("Start index must be less than the end index");
        if (endIndex > ds.registeredDomainNames.length)
            revert EndIndexExceedsTotalDomains("End index exceeds the total number of domains");

        uint256 count = endIndex - startIndex; // Calculate the number of domain names to be returned.
        domainNames = new string[](count); // Initialize the array to hold the domain names.

        for (uint256 i = startIndex; i < endIndex; ++i) {
            domainNames[i - startIndex] = ds.registeredDomainNames[i]; // Populate the array with domain names.
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
