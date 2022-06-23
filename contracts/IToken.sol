// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Required interface of an ERC1155 compliant contract, as defined in the
 * https://eips.ethereum.org/EIPS/eip-1155[EIP].
 *
 * _Available since v3.1._
 */
interface IToken {


   function mint(address account, uint256 amount) external;


   function burn(address account, uint256 amount) external;

   
   function decimals() external returns (uint256);


   function transferInternal(
    address from,
    address to,
    uint256 value
   ) external;

   function approveInternal(
    address owner,
    address spender,
    uint256 value
    ) external ;

}