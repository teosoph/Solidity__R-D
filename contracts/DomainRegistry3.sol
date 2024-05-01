// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract DomainRegistryV3 is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    // ____________________ Struct ____________________
    /// @notice Holds domain registration details and owner information
    /// @custom:storage-location erc7201:domainRegistry.storage
    struct DomainRegistryStorage {
        address contractOwner; /// @notice Owner of the contract
        uint256 registrationFeeEth; /// @notice Registration fee required to register a domain
        uint256 totalDomainsRegisteredNumber; /// @notice Total number of domains registered in the contract
        string[] registeredDomainNames; /// @dev Array to store the names of all registered domains
        mapping(string => address) domains; ///     @dev Maps domain names to the addresses of their respective owners.
        ERC20Upgradeable usdtToken; /// @dev USDT token adress
    }

    AggregatorV3Interface internal _dataFeed;

    /// @dev  SEPOLIA TEST USDT TOKEN CONTRACT
    address public usdtTokenAddress = 0x7169D38820dfd117C3FA1f22a697dBA58d90BA06;

    /// @dev Sepolia feed ETH/USD contract aress
    address public ethUsdContractAdress = 0x694AA1769357215DE4FAC081bf1f309aDC325306; // Dec 8

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

    uint256 private constant _BASIS_POINTS = 10000;

    /// @dev Percentage of registration fee to be given to domain owner.
    uint256 private constant _DOMAIN_OWNER_PERCENTAGE_BP = 2000;

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

    // !!!!!!!!!!!!!!!!!! new event !!!!!!!!!!!
    event UsdtTokenAddressChanged(address indexed newAddress);

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
    error NoFundsForWithdrawal(string message);
    error TransferToParentFailed(string message);
    error TransferToOwnerFailed(string message);
    error InvalidPriceData(string message);

    // Initialazer
    function initialize() public initializer {
        DomainRegistryStorage storage ds = _domainRegistryStorage();
        ds.contractOwner = msg.sender;

        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();

        setUsdtTokenAddress(usdtTokenAddress);

        _dataFeed = AggregatorV3Interface(ethUsdContractAdress);
    }

    // ========================== External Functions ==========================

    // External function to register a domain with payment in ETH
    function registerDomainWithETH(string memory domainName) external payable nonReentrant {
        DomainRegistryStorage storage ds = _domainRegistryStorage();
        if (msg.value >= ds.registrationFeeEth) revert InvalidDomainFormat("Insufficient ETH sent");

        _registerDomain(domainName, msg.value, "ETH");
    }

    function registerDomainWithUsdt(string memory domainName, uint256 usdtAmount) external payable nonReentrant {
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        uint256 requiredUsdtAmount = convertEthToUsdt(ds.registrationFeeEth);

        if (!ds.usdtToken.transferFrom(msg.sender, address(this), usdtAmount)) {
            revert TransferFailed("Transfer failed");
        }
        if (usdtAmount >= requiredUsdtAmount) revert InvalidDomainFormat("Insufficient USDT sent");

        _registerDomain(domainName, requiredUsdtAmount, "USDT");
    }

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

        ds.registrationFeeEth = newFee;
        emit FeeUpdated(newFee);
    }

    // ======================== Public Functions ========================

    function renounceOwnership() public view override onlyOwner {
        revert("Renouncing ownership is disabled");
    }

    function setUsdtTokenAddress(address newUsdtTokenAddress) public onlyOwner {
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        if (newUsdtTokenAddress == address(0)) {
            revert NewOwnerIsZeroAddress("Invalid address: cannot be 0 address");
        }

        usdtTokenAddress = newUsdtTokenAddress;
        ds.usdtToken = ERC20Upgradeable(newUsdtTokenAddress);
        emit UsdtTokenAddressChanged(newUsdtTokenAddress);
    }

    // ------------------------- Public Functions: View Functions -------------------------
    function getChainlinkDataFeedLatestETHUSDT() public view returns (uint256) {
        (
            ,
            /* uint80 roundID */ int256 answer /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
            ,
            ,

        ) = _dataFeed.latestRoundData();

        if (answer <= 0) {
            revert InvalidPriceData("Invalid price data");
        }

        return uint256(answer);
    }

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

    /**
     * @notice Retrieves the current registration fee for a domain.
     * @dev Returns the registration fee stored in the contract's state.
     * @return The current registration fee in wei.
     */
    function getRegistrationFee() public view returns (uint256) {
        DomainRegistryStorage storage ds = _domainRegistryStorage();
        return ds.registrationFeeEth;
    }

    function convertEthToUsdt(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getChainlinkDataFeedLatestETHUSDT(); // Get the latest price of ETH in USD
        return (ethAmount * ethPrice) / 1e18; // Adjust for 18 decimal places in ETH
    }

    // ======================== Internal Functions ========================
    /**
     * @notice Validates a domain based on basic RFC 1035 rules using inline assembly for
     * character iteration and checks.
     * @dev This is a basic check. Some other rules from RFC 1035 may not be enforced.
     * @param domainName The domain name to validate.
     * @return Whether the domain is valid.
     */
    function _isValidTopLevelDomain(string memory domainName) internal pure returns (bool) {
        bytes memory domainBytes = bytes(domainName);
        bytes1 prevChar = 0x00;
        uint8 hyphenCount = 0;
        uint256 domainLength = domainBytes.length;
        bool isValid = true;

        // Check the domain length to ensure it falls within the allowed range
        if (domainLength < _MIN_DOMAIN_LENGTH || domainLength > _MAX_DOMAIN_LENGTH) {
            return false;
        }

        assembly {
            let dataStart := add(domainBytes, 0x20) // Start of the domain data
            let dataEnd := add(dataStart, domainLength) // End of the domain data

            // Check if the domain starts or ends with a hyphen ('-')
            if or(eq(byte(0, mload(dataStart)), 0x2D), eq(byte(0, mload(sub(dataEnd, 1))), 0x2D)) {
                isValid := 0
            }

            for {

            } and(isValid, lt(dataStart, dataEnd)) {
                // Loop through each character
                dataStart := add(dataStart, 1)
            } {
                let char := byte(0, mload(dataStart)) // Current character

                // Check for consecutive invalid characters like ".." or "--"
                if and(eq(char, prevChar), or(eq(char, 0x2D), eq(char, 0x2E))) {
                    isValid := 0
                }

                // Update prevChar to the current character for the next loop iteration
                prevChar := char

                // Increment hyphen count if a hyphen is found
                if eq(char, 0x2D) {
                    hyphenCount := add(hyphenCount, 1)
                    // Invalidate if more than one consecutive hyphen
                    if gt(hyphenCount, 1) {
                        isValid := 0
                    }
                }

                // Reset hyphen count if a dot is found
                if eq(char, 0x2E) {
                    hyphenCount := 0
                }

                // Check if character is a valid number or letter and reset hyphen count
                if or(
                    or(
                        and(iszero(lt(char, 0x30)), iszero(gt(char, 0x39))), // Numbers 0-9
                        and(iszero(lt(char, 0x61)), iszero(gt(char, 0x7A))) // Lowercase a-z
                    ),
                    and(iszero(lt(char, 0x41)), iszero(gt(char, 0x5A))) // Uppercase A-Z
                ) {
                    hyphenCount := 0
                }

                if and(
                    and(iszero(eq(char, 0x2E)), iszero(eq(char, 0x2D))),
                    and(
                        and(or(lt(char, 0x30), gt(char, 0x39)), or(lt(char, 0x61), gt(char, 0x7A))),
                        or(lt(char, 0x41), gt(char, 0x5A))
                    )
                ) {
                    // Invalidate if character is not a dot, hyphen, number, or letter
                    isValid := 0
                }
            }
        }

        return isValid;
    }

    /**
     * @notice Splits a domain name string into its constituent parts using inline assembly for character iteration.
     * @dev The function makes two passes through the domain string: counting dots and extracting parts.
     * @param domainName The complete domain name string to be parsed and split.
     * @return parts An array containing individual parts of the domain name split by dots.
     */
    function _splitDomain(string memory domainName) internal pure returns (string[] memory) {
        uint256 length = bytes(domainName).length;
        uint256 count = 1; // At least one domain part

        // First pass: count dots
        for (uint256 i = 0; i < length; i++) {
            bytes1 char;
            assembly {
                char := mload(add(add(domainName, 0x20), i))
            }
            if (char == ".") {
                count++;
            }
        }

        string[] memory parts = new string[](count);
        uint256 startIndex = 0;
        uint256 arrayIndex = 0;

        // Second pass: extract parts
        for (uint256 i = 0; i < length; i++) {
            bytes1 char;
            assembly {
                char := mload(add(add(domainName, 0x20), i))
            }
            if (char == "." || i == length - 1) {
                uint256 endIndex = char == "." ? i : i + 1;
                bytes memory part = new bytes(endIndex - startIndex);
                for (uint256 j = 0; j < part.length; j++) {
                    assembly {
                        mstore(add(add(part, 0x20), j), mload(add(add(domainName, 0x20), add(startIndex, j))))
                    }
                }
                parts[arrayIndex] = string(part);
                arrayIndex++;
                startIndex = i + 1;
            }
        }

        return parts;
    }

    /**
     * @notice Retrieves the parent domain name of a given domain.
     * @dev Splits the domain name into its constituent parts and constructs the parent domain name.
     * If the domain name has multiple parts, it constructs the parent domain name by removing the first part.
     * For example, if the input domain is "sub.domain.com", the parent domain would be "domain.com".
     * @param domainName The domain name for which the parent domain is to be retrieved.
     * @return The parent domain name.
     */
    function _parentDomainName(string memory domainName) internal pure returns (string memory) {
        // Split the domain name into its constituent parts
        string[] memory parts = _splitDomain(domainName);
        // Initialize the result as an empty string
        string memory result = "";
        // Check if the domain has multiple parts
        if (parts.length > 1) {
            // Iterate through each part of the domain name
            for (uint256 i = 1; i < parts.length; i++) {
                // If it's not the first part, append a dot to separate parts
                if (i != 1) {
                    result = string(abi.encodePacked(result, "."));
                }
                // Append the current part to the result
                result = string(abi.encodePacked(result, parts[i]));
            }
        }
        // Return the constructed parent domain name
        return result;
    }

    // ======================== Private Functions ========================

    /**
     * @dev Handles the payment distribution for domain registration.
     * Calculates and transfers the fee to the parent domain owner and the remaining amount to the contract owner.
     * @param recipient The address of the parent domain owner to receive the fee.
     * @param amount The total amount of Ether received for the domain registration.
     * @param feePercentage The percentage of the total amount that should be
     * allocated as a fee to the parent domain owner.
     */
    function _handlePayments(address payable recipient, uint256 amount, uint256 feePercentage) private nonReentrant {
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        uint256 feeAmount = (amount * feePercentage) / _BASIS_POINTS;
        uint256 ownerAmount = amount - feeAmount;

        recipient.transfer(feeAmount);

        payable(ds.contractOwner).transfer(ownerAmount);
    }

    // Handles the payment logistics based on domain level
    function _processPayment(
        string memory domainName, // Include domainName as a parameter
        address payable ownerAddress,
        uint256 paymentAmount,
        string memory currency
    ) private nonReentrant {
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        uint256 domainLevel = _validateDomainRegistration(domainName);
        address payable parentDomainOwner = payable(address(0));

        // Interactions
        if (keccak256(bytes(currency)) == keccak256(bytes("ETH"))) {
            if (domainLevel == 1) {
                // For a top-level domain, the entire payment is transferred to the contract owner
                _handlePayments(ownerAddress, ds.registrationFeeEth, 0); // 100% ETH to contract owner
            } else {
                // For second-level domains and higher, determine the owner of the parent domain
                string memory parentDomain = _parentDomainName(domainName);
                parentDomainOwner = payable(ds.domains[parentDomain]);
                if (parentDomainOwner == address(0)) revert InvalidDomainFormat("Parent domain not registered");

                // 20% ETH to domain owner
                _handlePayments(parentDomainOwner, ds.registrationFeeEth, _DOMAIN_OWNER_PERCENTAGE_BP);
            }
        } else if (keccak256(bytes(currency)) == keccak256(bytes("USDT"))) {
            if (domainLevel == 1) {
                _handlePayments(ownerAddress, paymentAmount, 0); // 100% USDT to contract owner
            } else {
                string memory parentDomain = _parentDomainName(domainName);
                parentDomainOwner = payable(ds.domains[parentDomain]);
                if (parentDomainOwner == address(0)) revert InvalidDomainFormat("Parent domain not registered");

                // 20% USDT to domain owner
                _handlePayments(parentDomainOwner, paymentAmount, _DOMAIN_OWNER_PERCENTAGE_BP);
            }
        }
    }

    // Main function to register a domain
    function _registerDomain(
        string memory domainName,
        uint256 paymentAmount,
        string memory currency
    ) private nonReentrant {
        DomainRegistryStorage storage ds = _domainRegistryStorage();
        address payable ownerAddress = payable(msg.sender);

        ds.domains[domainName] = ownerAddress;
        ds.registeredDomainNames.push(domainName);
        ds.totalDomainsRegisteredNumber++;

        emit DomainRegistered(domainName, ownerAddress);

        // Call with one fewer parameter
        _processPayment(domainName, ownerAddress, paymentAmount, currency);
    }

    // Validates the domain registration conditions
    function _validateDomainRegistration(string memory domainName) private view returns (uint256) {
        DomainRegistryStorage storage ds = _domainRegistryStorage();

        string[] memory parts = _splitDomain(domainName);
        uint256 domainLevel = parts.length;

        if (!_isValidTopLevelDomain(domainName)) revert InvalidDomainFormat("Invalid domain format");
        if (ds.domains[domainName] != address(0)) revert DomainAlreadyRegistered("Domain is already registered");

        return domainLevel;
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
