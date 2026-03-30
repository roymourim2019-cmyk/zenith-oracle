import razorpay
from core.config import settings
from typing import Dict, Any

class PaymentService:
    """Razorpay payment integration"""
    
    def __init__(self):
        self.client = razorpay.Client(
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
        )
    
    def create_order(self, amount: int, currency: str = "INR", receipt: str = None) -> Dict[str, Any]:
        """Create a Razorpay order"""
        try:
            if receipt and len(receipt) > 40:
                receipt = receipt[:40]
            
            order_data = {
                "amount": amount * 100,  # Convert to paise
                "currency": currency,
                "payment_capture": 1
            }
            
            if receipt:
                order_data["receipt"] = receipt
            
            order = self.client.order.create(data=order_data)
            return order
        except Exception as e:
            raise Exception(f"Failed to create order: {str(e)}")
    
    def verify_payment(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """Verify payment signature"""
        try:
            params = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params)
            return True
        except Exception as e:
            print(f"Payment verification failed: {e}")
            return False
    
    def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        """Get payment details"""
        try:
            return self.client.payment.fetch(payment_id)
        except Exception as e:
            raise Exception(f"Failed to fetch payment: {str(e)}")