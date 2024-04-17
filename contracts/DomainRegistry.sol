// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title Domain Registry
 * @notice Allows users to register and manage domains with fees and ownership details
 * @dev Uses OpenZeppelin's upgradeable contracts for flexible domain registration on Ethereum.
 * Supports various domain levels, providing a system similar to traditional DNS services.
 * It allows for dynamic adjustment of registration fees and robust validation of domain names,
 * ensuring transparency and security in domain management.
 *
 * Key Features and Functions:
 * 1. Flexible Domain Registration:
 *    - Supports multiple levels of domain names, similar to DNS.
 *    - Requires a fee for registration, adjustable by the contract owner.
 *
 * 2. Transparent Domain Ownership:
 *    - Provides clear records of domain ownership accessible via `getDomainOwner`.
 *    - Simplifies management and verification of domain ownership.
 *
 * 3. Adjustable Registration Fees:
 *    - Contract owner can dynamically adjust fees with `updateRegistrationFee`.
 *
 * 4. Robust Domain Validation:
 *    - Validates domains to adhere to set standards, ensuring registry integrity.
 *
 * 5. Enhanced Security Measures:
 *    - Incorporates upgradeable contract framework for security and adaptability.
 *    - Uses `onlyOwner` modifier to protect critical functions from unauthorized access.
 *
 * 6. Event-Driven Notifications:
 *    - Emits events for domain registrations and fee updates, enhancing transparency.
 *
 * Security Considerations:
 *   - Implements standard security practices to mitigate risks like reentrancy and unauthorized access.
 *   - Encourages regular audits and community feedback to address security issues.
 *
 * Future Directions:
 *   - Plans to introduce domain transfers, subdomain registrations, and enhanced access controls.
 *   - Open to community suggestions for continuous improvement and innovation.
 *
 * Note:
 *   - Represents an initial step towards a decentralized domain registration system.
 *   - Future versions may include more features and optimizations based on user feedback.
 */

contract DomainRegistryV1 is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    // ____________________ Struct ____________________
    /// @notice Holds domain registration details and owner information
    /// @custom:storage-location erc7201:domainRegistry.storage
    struct DomainRegistryStorage {
        address contractOwner; /// @notice Owner of the contract
        uint256 registrationFee; /// @notice Registration fee required to register a domain
        uint256 totalDomainsRegisteredNumber; /// @notice Total number of domains registered in the contract
        string[] registeredDomainNames; /// @dev Array to store the names of all registered domains
        mapping(string => address) domains; /// @dev Maps domain names to the addresses of their respective owners.
    }

    // ____________________ Constants ____________________
    /**
     * @notice Constant used to determine the storage slot of the DomainRegistryStorage structure
     * @dev This storage slot is calculated using a hash function, designed in compliance
     * with EIP-1967 for upgradeable contract storage patterns.
     * The specific hash function used here involves keccak256, adjusted to ensure
     * the storage slot does not overlap with Ethereum's predefined storage areas.
     * This makes it suitable for use with upgradeable smart contracts where storage layout
     * must be strictly controlled to prevent clashes and ensure proxy compatibility.
     */
    bytes32 private constant _DOMAIN_REGISTRY_STORAGE_LOCATION =
        0x2fa08a24d651f334e38f76d054b804fee9ea2ce22fe228c9362cfd32ab661e00;

    /// @notice Maximum fee that can be set for domain registration
    uint256 public constant MAX_REGISTRATION_FEE = 1 ether;

    /// @notice Minimum length for a valid domain name
    uint8 internal constant _MIN_DOMAIN_LENGTH = 1;

    /// @notice Maximum length for a valid domain name
    uint8 internal constant _MAX_DOMAIN_LENGTH = 63;

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

    // ____________________ Initializer ____________________
    /// @notice Initializes the contract with the deployer as the owner and sets the initial registration fee
    /// @dev Sets the initial owner to the deployer's address and the initial registration fee to 0.01 ether
    function initialize() public initializer {
        DomainRegistryStorage storage ds = _domainRegistryStorage();
        ds.contractOwner = msg.sender;
        ds.registrationFee = 0.01 ether;
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
    }

    // ============================= Functions ===============================
    // ____________________ Core Business Logic Functions ____________________
    /**
     * @notice Registers a new domain if it is not already taken and is valid according to domain naming rules
     * @dev Charges the registration fee, transfers it to the contract owner, and assigns the domain to the caller
     * @param domainName The domain name to register
     */
    function registerDomain(string memory domainName) external payable nonReentrant {
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        // Check conditions
        if (msg.value != ds.registrationFee) revert IncorrectRegistrationFee("Incorrect registration fee");
        if (!_isValidTopLevelDomain(domainName)) revert InvalidDomainFormat("Invalid domain format");
        if (ds.domains[domainName] != address(0)) revert DomainAlreadyRegistered("Domain is already registered");

        // Update the contract state
        ds.domains[domainName] = msg.sender;
        ds.registeredDomainNames.push(domainName);
        ds.totalDomainsRegisteredNumber++;

        // Generate an event after all changes
        emit DomainRegistered(domainName, msg.sender);

        // Transfer the registration fee to the owner immediately upon receiving it.
        payable(ds.contractOwner).transfer(msg.value);
    }

    // ____________________ Contract Management Functions ____________________

    /**
     * @dev Updates the domain registration fee to a new value.
     * This function can only be invoked by the owner of the contract.
     * It allows the owner to adjust the fee required for new domain registrations.
     * The fee must be a non-negative value and
     * should not exceed the maximum allowed limit defined by `MAX_REGISTRATION_FEE`,
     * ensuring that the fee remains within reasonable bounds.
     * The updated fee is specified in Wei. Emits a `FeeUpdated` event upon successful update.
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
     * @notice Validates a domain based on basic RFC 1035 rules using inline assembly for
     * character iteration and checks.
     * @dev This is a basic check. Some other rules from RFC 1035 may not be enforced.
     * @param domainName The domain name to validate.
     * @return Whether the domain is valid.
     */
    function _isValidTopLevelDomain(string memory domainName) internal pure returns (bool) {
        bytes memory domainBytes = bytes(domainName);
        uint256 domainLength = domainBytes.length;

        // Check the domain name meets the minimum and maximum length requirements.
        if (domainLength < _MIN_DOMAIN_LENGTH || domainLength > _MAX_DOMAIN_LENGTH) {
            return false;
        }

        // Ensure the domain name does not start or end with a hyphen (-).
        if (domainBytes[0] == bytes1(uint8(45)) || domainBytes[domainLength - 1] == bytes1(uint8(45))) {
            return false;
        }

        bool previousWasDash = false; // Track consecutive dashes.
        for (uint256 i = 0; i < domainLength; ++i) {
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

    /**
     * @dev Accesses the storage slot directly using inline assembly.
     * @return ds The storage pointer to the DomainRegistryStorage structure.
     * @notice This function uses inline assembly to set the storage slot location,
     * allowing direct manipulation and retrieval of the contract's state variables
     * stored in the DomainRegistryStorage structure.
     */
    function _domainRegistryStorage() private pure returns (DomainRegistryStorage storage ds) {
        assembly {
            ds.slot := _DOMAIN_REGISTRY_STORAGE_LOCATION
        }
    }
}
