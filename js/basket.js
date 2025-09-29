// Функции для работы со страницей корзины
const basketPage = {
    // Отобразить товары в корзине
    displayCartItems: function() {
        const basketContainer = document.getElementById('basket-items');
        const totalPriceElement = document.getElementById('total-price');
        const totalSection = document.querySelector('.total-section');
        const checkoutBtn = document.getElementById('checkout-btn');
        const cartItems = cart.getCart();

        basketContainer.innerHTML = '';

        if (cartItems.length === 0) {
            basketContainer.innerHTML = '<p class="empty-cart-message">Ваша корзина пуста</p>';
            totalSection.classList.add('hidden');
            checkoutBtn.classList.add('hidden');
            return;
        }

        // Показываем общую сумму и кнопку оформления заказа
        totalSection.classList.remove('hidden');
        checkoutBtn.classList.remove('hidden');

        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'basket-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Цена: ${item.price} руб.</p>
                </div>
                <div class="item-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">Удалить</button>
                </div>
                <div class="item-total">
                    Сумма: ${item.price * item.quantity} руб.
                </div>
            `;
            basketContainer.appendChild(itemElement);
        });

        // Обновляем общую сумму
        totalPriceElement.textContent = cart.calculateTotal();

        // Добавляем обработчики событий
        this.addEventListeners();
    },

    // Добавить обработчики событий
    addEventListeners: function() {
        // Кнопки изменения количества
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                const cartItems = cart.getCart();
                const item = cartItems.find(item => item.id === productId);
                
                if (item && item.quantity > 1) {
                    cart.updateQuantity(productId, item.quantity - 1);
                } else if (item && item.quantity === 1) {
                    // Если количество становится 0, удаляем товар
                    cart.removeFromCart(productId);
                }
            });
        });

        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                const cartItems = cart.getCart();
                const item = cartItems.find(item => item.id === productId);
                
                if (item) {
                    cart.updateQuantity(productId, item.quantity + 1);
                }
            });
        });

        // Кнопки удаления
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                if (confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
                    cart.removeFromCart(productId);
                }
            });
        });

        // Кнопка оформления заказа
        document.getElementById('checkout-btn').addEventListener('click', function() {
            document.getElementById('order-form').classList.remove('hidden');
            this.classList.add('hidden');
        });

        // Отмена оформления заказа
        document.getElementById('cancel-order').addEventListener('click', function() {
            document.getElementById('order-form').classList.add('hidden');
            document.getElementById('checkout-btn').classList.remove('hidden');
            
            // Сбрасываем форму
            document.getElementById('order-form').reset();
        });

        // Отправка формы заказа
        document.getElementById('order-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Валидация формы
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const address = document.getElementById('address').value;
            const phone = document.getElementById('phone').value;
            
            if (!firstName || !lastName || !address || !phone) {
                alert('Пожалуйста, заполните все поля формы.');
                return;
            }
            
            // Показываем сообщение об успехе
            document.getElementById('order-form').classList.add('hidden');
            document.getElementById('order-success').classList.remove('hidden');
            
            // Очищаем корзину
            cart.clearCart();
        });
    },

    // Инициализация страницы корзины
    init: function() {
        this.displayCartItems();
        cart.updateCartCount();
        
        // Гарантируем, что форма и сообщение скрыты при загрузке
        document.getElementById('order-form').classList.add('hidden');
        document.getElementById('order-success').classList.add('hidden');
    }
};

// Инициализация страницы корзины при загрузке
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('basket.html') || 
        window.location.pathname.endsWith('basket.html') ||
        window.location.pathname.endsWith('/basket')) {
        basketPage.init();
    }
});
