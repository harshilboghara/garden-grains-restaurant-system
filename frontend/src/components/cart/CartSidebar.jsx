import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useCart } from '../../contexts/CartContext'
import { useNavigate } from 'react-router-dom'
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useScrollLock } from '../../hooks/useScrollLock'

const CartSidebar = () => {
  const { items, isOpen, toggleCart, itemCount, total, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  useScrollLock(isOpen)

  const handleCheckout = () => {
    toggleCart()
    navigate('/checkout')
  }

  const handleViewCart = () => {
    toggleCart()
    navigate('/cart')
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={toggleCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-pearl shadow-xl border-l border-dark-slate/10">
                    <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
                      <Dialog.Title className="text-lg font-bold text-dark-slate font-heading">
                        Shopping Cart ({itemCount})
                      </Dialog.Title>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-dark-slate transition-colors"
                        onClick={toggleCart}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6">
                      {items.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-400">Your cart is empty</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {items.map((item) => (
                            <div key={item.id} className="flex space-x-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={item.menuItem.images?.[0]?.url || '/api/placeholder/100/100'}
                                  alt={item.menuItem.name}
                                  className="h-16 w-16 object-cover rounded"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-dark-slate font-heading">
                                  {item.menuItem.name}
                                </h3>
                                <p className="text-xs text-warm-gold font-bold">₹{(item.menuItem.price).toFixed(2)}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="p-1 rounded-lg hover:bg-dark-slate/10 text-gray-600 hover:text-dark-slate transition-colors border border-dark-slate/10"
                                  >
                                    <MinusIcon className="h-3 w-3" />
                                  </button>
                                  <span className="text-sm font-bold w-8 text-center text-dark-slate">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="p-1 rounded-lg hover:bg-dark-slate/10 text-gray-600 hover:text-dark-slate transition-colors border border-dark-slate/10"
                                  >
                                    <PlusIcon className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-1 rounded hover:bg-red-100 ml-2"
                                  >
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-sm font-bold text-dark-slate">
                                ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {items.length > 0 && (
                      <div className="border-t border-dark-slate/10 px-4 py-4 bg-dark-slate/5">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="font-medium text-dark-slate">₹{total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tax (18%)</span>
                            <span className="font-medium text-dark-slate">₹{(total * 0.18).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-dark-slate border-t border-dark-slate/10 pt-2 mt-2">
                            <span>Total</span>
                            <span className="text-warm-gold">₹{(total + total * 0.18).toFixed(2)}</span>
                          </div>
                        </div>

                        <button
                          onClick={handleCheckout}
                          className="mt-4 w-full btn-primary"
                        >
                          Proceed to Checkout
                        </button>

                        <button
                          onClick={handleViewCart}
                          className="mt-3 w-full text-sm text-center text-warm-gold hover:text-dark-slate transition-colors font-medium hover:underline"
                        >
                          View Full Cart
                        </button>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default CartSidebar

