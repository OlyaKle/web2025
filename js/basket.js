// Функции для работы со страницей корзины
const basketPage = {
    // Инициализация страницы корзины
    init: function() {
        this.hideAllElements();
        this.displayCartItems();
        this.addEventListeners();
    },

    // Скрыть все элементы формы и сообщений
    hideAllElements: function() {
        document.getElementById('order-form').classList.add('hidden');
        document.getElementById('order-success').classList.add('hidden');
        document.getElementById('checkout-btn').classList.add('hidden');
        document.querySelector('.total-section').classList.add('hidden');
    },

    // Отобразить товары в корзине
    displayCartItems: function() {
        const basketContainer = document.getElementById('basket-items');
        const totalPriceElement = document.getElementById('total-price');
        const totalSection = document.querySelector('.total-section');
        const checkoutBtn = document.getElementById('checkout-btn');
        const cartItems = cart.getCart();

        // Очищаем контейнер
        basketContainer.innerHTML = '';

        if (cartItems.length === 0) {
            basketContainer.innerHTML = '<p class="empty-cart-message">Ваша корзина пуста</p>';
            return;
        }

        // Показываем общую сумму и кнопку оформления заказа
        totalSection.classList.remove('hidden');
        checkoutBtn.classList.remove('hidden');

        // Добавляем товары в корзину
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
    },

    // Добавить обработчики событий
    addEventListeners: function() {
        // Кнопка оформления заказа
        document.getElementById('checkout-btn').addEventListener('click', () => {
            document.getElementById('order-form').classList.remove('hidden');
            document.getElementById('checkout-btn').classList.add('hidden');
        });

        // Отмена оформления заказа
        document.getElementById('cancel-order').addEventListener('click', () => {
            document.getElementById('order-form').classList.add('hidden');
            document.getElementById('checkout-btn').classList.remove('hidden');
            document.getElementById('order-form').reset();
        });

        // Отправка формы заказа
        document.getElementById('order-form').addEventListener('submit', (e) => {
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

        // Делегирование событий для динамически созданных элементов
        document.getElementById('basket-items').addEventListener('click', (e) => {
            const target = e.target;
            
            // Уменьшение количества
            if (target.classList.contains('minus')) {
                const productId = target.dataset.id;
                const cartItems = cart.getCart();
                const item = cartItems.find(item => item.id === productId);
                
                if (item && item.quantity > 1) {
                    cart.updateQuantity(productId, item.quantity - 1);
                } else if (item && item.quantity === 1) {
                    cart.removeFromCart(productId);
                }
            }
            
            // Увеличение количества
            if (target.classList.contains('plus')) {
                const productId = target.dataset.id;
                const cartItems = cart.getCart();
                const item = cartItems.find(item => item.id === productId);
                
                if (item) {
                    cart.updateQuantity(productId, item.quantity + 1);
                }
            }
            
            // Удаление товара
            if (target.classList.contains('remove-btn')) {
                const productId = target.dataset.id;
                if (confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
                    cart.removeFromCart(productId);
                }
            }
        });
    }
};

// Инициализация страницы корзины при загрузке
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.basket-section')) {
        basketPage.init();
    }
});
