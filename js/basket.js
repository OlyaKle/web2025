// Функции для работы со страницей корзины
const basketPage = {
    // Инициализация страницы корзины
    init: function() {
        console.log('Basket page initialized');
        this.displayCartItems();
        this.addEventListeners();
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
            this.hideElement(totalSection);
            this.hideElement(checkoutBtn);
            return;
        }

        // Показываем общую сумму и кнопку оформления заказа
        this.showElement(totalSection);
        this.showElement(checkoutBtn);

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
        
        // Добавляем обработчики для вновь созданных элементов
        this.addDynamicEventListeners();
    },

    // Показать элемент
    showElement: function(element) {
        if (element) element.style.display = '';
    },

    // Скрыть элемент
    hideElement: function(element) {
        if (element) element.style.display = 'none';
    },

    // Добавить обработчики для статических элементов
    addEventListeners: function() {
        // Кнопка оформления заказа
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.hideElement(checkoutBtn);
                this.showElement(document.getElementById('order-form'));
            });
        }

        // Отмена оформления заказа
        const cancelOrder = document.getElementById('cancel-order');
        if (cancelOrder) {
            cancelOrder.addEventListener('click', () => {
                this.hideElement(document.getElementById('order-form'));
                this.showElement(checkoutBtn);
                document.getElementById('order-form').reset();
            });
        }

        // Отправка формы заказа
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
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
                this.hideElement(orderForm);
                this.showElement(document.getElementById('order-success'));
                
                // Очищаем корзину
                cart.clearCart();
            });
        }
    },

    // Добавить обработчики для динамически созданных элементов
    addDynamicEventListeners: function() {
        const basketContainer = document.getElementById('basket-items');
        
        // Делегирование событий для динамически созданных элементов
        basketContainer.addEventListener('click', (e) => {
            const target = e.target;
            const productId = target.dataset.id;
            
            if (!productId) return;
            
            // Уменьшение количества
            if (target.classList.contains('minus')) {
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
                const cartItems = cart.getCart();
                const item = cartItems.find(item => item.id === productId);
                
                if (item) {
                    cart.updateQuantity(productId, item.quantity + 1);
                }
            }
            
            // Удаление товара
            if (target.classList.contains('remove-btn')) {
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
