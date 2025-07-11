import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import MarketplaceTitle from './MarketplaceTitle';

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  const cartTotal = getCartAmount(); // Store the result once to avoid multiple function calls

  return (
    <div className="w-full ml-4 mr-10">
      <div className="text-2xl">
        <MarketplaceTitle text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{currency} {cartTotal}.00</p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>{currency} {cartTotal === 0 ? 0 : delivery_fee}.00</p>
        </div>
        <hr />
        <div className="flex justify-between">
          <b>Total</b>
          <b>{currency} {cartTotal === 0 ? 0 : cartTotal + delivery_fee}.00</b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
