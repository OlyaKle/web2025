// Функции для работы со страницей корзины
const basketPage = {
    // Отобразить товары в корзине
    displayCartItems: function() {
        const basketContainer = document.getElementById('basket-items');
        const totalPriceElement = document.getElementById('total-price');
        const cartItems = cart.getCart();

        basketContainer.innerHTML = '';

        if (cartItems.length === 0) {
            basketContainer.innerHTML = '<p>Ваша корзина пуста</p>';
            totalPriceElement.textContent = '0';
            document.getElementById('checkout-btn').style.display = 'none';
            return;
        }

        document.getElementById('checkout-btn').style.display = 'block';

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
                cart.removeFromCart(productId);
            });
        });

        // Кнопка оформления заказа
        document.getElementById('checkout-btn').addEventListener('click', function() {
            document.getElementById('order-form').classList.remove('hidden');
            this.style.display = 'none';
        });

        // Отмена оформления заказа
        document.getElementById('cancel-order').addEventListener('click', function() {
            document.getElementById('order-form').classList.add('hidden');
            document.getElementById('checkout-btn').style.display = 'block';
        });

        // Отправка формы заказа
        document.getElementById('order-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Показываем сообщение об успехе
            document.getElementById('order-form').classList.add('hidden');
            document.getElementById('order-success').classList.remove('hidden');
            
            // Очищаем корзину
            cart.clearCart();
        });
    }
};

// Инициализация страницы корзины
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('basket.html')) {
        basketPage.displayCartItems();
        cart.updateCartCount();
    }
});
