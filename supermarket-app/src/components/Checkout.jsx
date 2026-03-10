import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

const Checkout = () => {
    const { items, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact: '',
        promo: ''
    });

    const [orderPlaced, setOrderPlaced] = useState(false);

    const formatPrice = (price) => `$${price.toFixed(2)}`;

    const deliveryFee = formData.promo.toLowerCase() === 'primer-mercado' ? 0 : 5.00;
    const finalTotal = totalPrice * 1.08 + deliveryFee;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call for shadow account creation and order submission
        setTimeout(() => {
            setOrderPlaced(true);
            clearCart();
        }, 1000);
    };

    if (orderPlaced) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ fontSize: '2rem', color: '#16a34a', marginBottom: '1rem' }}>{t('checkout.success.title')}</h2>
                <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                    {t('checkout.success.subtitle')} <strong>{formData.address}</strong>.
                </p>

                <div style={{ background: '#f3f4f6', padding: '2rem', borderRadius: '0.5rem', maxWidth: '500px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>{t('checkout.success.track_title')}</h3>
                    <p style={{ color: '#4b5563', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {t('checkout.success.track_desc')}
                    </p>
                    <input
                        type="password"
                        placeholder={t('checkout.success.password_placeholder')}
                        style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    />
                    <button style={{ width: '100%', padding: '0.75rem', background: '#1f2937', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        {t('checkout.success.save_password')}
                    </button>
                </div>

                <button
                    onClick={() => navigate('/')}
                    style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', background: 'transparent', color: '#16a34a', border: '2px solid #16a34a', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {t('checkout.success.continue_shopping')}
                </button>
            </div>
        );
    }

    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
                {t('checkout.title')}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem' }}>
                {/* Checkout Form */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                                {t('checkout.name')}
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                                {t('checkout.address')}
                            </label>
                            <input
                                type="text"
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                                {t('checkout.contact')}
                            </label>
                            <input
                                type="text"
                                name="contact"
                                required
                                value={formData.contact}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                            />
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>We'll send your receipt here.</p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                                {t('checkout.promo')}
                            </label>
                            <input
                                type="text"
                                name="promo"
                                value={formData.promo}
                                onChange={handleChange}
                                placeholder="e.g. PRIMER-MERCADO"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                            />
                            {formData.promo.toLowerCase() === 'primer-mercado' && (
                                <p style={{ color: '#16a34a', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    {t('checkout.promo_applied')}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="checkout-btn"
                            style={{ padding: '1rem', marginTop: '1rem' }}
                        >
                            {t('checkout.submit')}
                        </button>
                    </form>
                </div>

                {/* Order Summary sidebar */}
                <div>
                    <div className="order-summary" style={{ position: 'sticky', top: '100px' }}>
                        <h3 className="summary-title">{t('checkout.summary.title', { count: items.length })}</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="summary-row">
                                <span>{t('checkout.summary.subtotal')}</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('checkout.summary.tax')}</span>
                                <span>{formatPrice(totalPrice * 0.08)}</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('checkout.summary.delivery_fee')}</span>
                                <span style={{ color: deliveryFee === 0 ? '#16a34a' : 'inherit' }}>
                                    {deliveryFee === 0 ? t('checkout.summary.free') : formatPrice(deliveryFee)}
                                </span>
                            </div>

                            <div className="summary-total">
                                <span>{t('cart.total')}</span>
                                <span>{formatPrice(finalTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
