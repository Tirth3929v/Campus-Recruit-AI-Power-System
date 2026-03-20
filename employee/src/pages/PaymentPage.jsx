import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1F2E] p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You have successfully enrolled in the course. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
              <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-purple-500" />
                Secure Checkout
              </h1>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cardholder Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        placeholder="0000 0000 0000 0000"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry Date</label>
                      <input 
                        type="text" 
                        required
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">CVC</label>
                      <input 
                        type="text" 
                        required
                        placeholder="123"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#0B0F19] p-4 rounded-xl">
                  <Lock size={16} className="text-green-500" />
                  <span>Your transaction is secured with SSL encryption</span>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Pay $49.99</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80" 
                    alt="Course" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm line-clamp-2 mb-1">Advanced React Patterns</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lifetime Access</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Original Price</span>
                  <span className="line-through text-gray-400">$99.99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Discount</span>
                  <span className="text-green-500">-$50.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span>Total</span>
                  <span>$49.99</span>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl">
                <h4 className="font-bold text-sm text-purple-700 dark:text-purple-300 mb-1">100% Money Back Guarantee</h4>
                <p className="text-xs text-purple-600 dark:text-purple-400">If you're not satisfied with the course, we'll refund you within 30 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;